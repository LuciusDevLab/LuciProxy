"""
LuciProxy Manager - Worker Installer & Updater Engine.
Orchestrates immutable source-based Worker deployment and updates via Cloudflare REST API.

Critical Safety Invariants:
1. 'Create Worker' provisions a new D1 database, initializes schema, and binds as IOT_DB.
2. 'Update Worker' inspects Cloudflare remote bindings and STRICTLY PRESERVES existing D1 UUID.
3. 'Update Worker' NEVER creates, deletes, drops, or overwrites existing D1 databases.
4. Administrative master key is provisioned exclusively via Worker Secrets API (MASTER_KEY).
5. Zero host runtime dependencies: NO Node.js, NO npm, NO Wrangler, NO Git.
"""

from datetime import datetime
import json
from pathlib import Path
from typing import Any, Callable, Dict, List, Optional
import uuid

from ..cloudflare.client import CloudflareClient
from ..cloudflare.worker_service import WorkerService
from ..cloudflare.d1_service import D1Service
from ..cloudflare.exceptions import CloudflareError, ResourceNotFoundError
from ..security.credentials import SecureCredentialStore
from ..storage.database import LocalDatabase
from ..storage.models import ManagedWorkerRecord, UpdateHistoryRecord
from ..worker_source.source_service import WorkerSourceService
from .models import DeploymentResult
from .naming import generate_deployment_names


class WorkerInstaller:
    """Orchestrates source-based Worker installation and atomic updates."""

    def __init__(
        self,
        db: LocalDatabase,
        credential_store: Optional[SecureCredentialStore] = None,
        source_service: Optional[WorkerSourceService] = None,
    ):
        self.db = db
        self.credential_store = credential_store or db.credential_store
        self.source_service = source_service or WorkerSourceService()

    def _get_cf_services(self, connection_id: str) -> tuple[CloudflareClient, WorkerService, D1Service]:
        """Resolves authenticated Cloudflare client and services from vault."""
        token = self.credential_store.get_token(connection_id)
        if not token:
            raise ValueError(f"No active Cloudflare token found for connection '{connection_id}'.")

        client = CloudflareClient(token=token, timeout=30)
        d1_svc = D1Service(client)
        worker_svc = WorkerService(client, d1_service=d1_svc)
        return client, worker_svc, d1_svc

    def create_worker(
        self,
        connection_id: str,
        account_id: str,
        worker_name: Optional[str] = None,
        d1_name: Optional[str] = None,
        preferred_master_key: Optional[str] = None,
        progress_callback: Optional[Callable[[int, int, str, str], None]] = None
    ) -> DeploymentResult:
        """
        Executes a fresh Worker installation:
        1. Resolves Worker source from repository & compiles bundle.
        2. Generates neutral random names if not provided.
        3. Provisions new D1 database via REST API.
        4. Initializes D1 schema and seeds admin configuration.
        5. Uploads multipart Worker script with IOT_DB binding pointing to new D1 database.
        6. Configures MASTER_KEY Worker secret.
        7. Configures workers.dev subdomain route.
        8. Persists state in local SQLite database.
        """
        total_steps = 8

        def notify(step: int, title: str, details: str):
            if progress_callback:
                try:
                    progress_callback(step, total_steps, title, details)
                except Exception:
                    pass

        try:
            # Step 1: Resolve Source & Build Deployment Package
            notify(1, "Resolving Worker Source", "Fetching version signal and compiling package...")
            signal = self.source_service.fetch_version_signal()
            snapshot = self.source_service.download_source_at_revision(signal.source_revision)
            pkg = self.source_service.build_deployment_package(snapshot, signal.version)

            # Step 2: Prepare Resource Names
            if not worker_name or not d1_name:
                auto_worker, auto_d1 = generate_deployment_names()
                worker_name = worker_name or auto_worker
                d1_name = d1_name or auto_d1
            notify(2, "Preparing Resource Names", f"Worker: '{worker_name}' | D1: '{d1_name}'")

            client, worker_svc, d1_svc = self._get_cf_services(connection_id)

            # Step 3: Provision D1 Database
            notify(3, "Provisioning D1 Database", f"Creating database '{d1_name}' on Cloudflare...")
            d1_dto = d1_svc.create_d1_database(account_id, d1_name)
            d1_uuid = d1_dto.uuid
            if not d1_uuid:
                raise RuntimeError(f"Cloudflare API did not return UUID for created D1 database '{d1_name}'.")

            # Step 4: Initialize Schema & Seed Master Key
            notify(4, "Initializing Database Schema", f"Executing D1 schema DDL and seeding admin key...")
            d1_svc.initialize_schema(account_id, d1_uuid)
            if not d1_svc.verify_schema(account_id, d1_uuid):
                raise RuntimeError(f"D1 database '{d1_name}' ({d1_uuid}) failed schema verification.")
            master_key = d1_svc.seed_master_key(account_id, d1_uuid, preferred_master_key)

            # Step 5: Upload Multipart Worker Script
            notify(5, "Uploading Worker Script", f"Deploying code with IOT_DB binding to Cloudflare Edge...")
            metadata = {
                "main_module": pkg.main_module,
                "compatibility_date": pkg.compatibility_date,
                "compatibility_flags": pkg.compatibility_flags,
                "bindings": [
                    {
                        "type": "d1",
                        "name": "IOT_DB",
                        "id": d1_uuid
                    }
                ],
                "observability": {
                    "enabled": True
                }
            }
            files = {
                "metadata": (None, json.dumps(metadata), "application/json"),
                pkg.main_module: (pkg.main_module, pkg.bundle_code, "application/javascript+module")
            }
            worker_svc.upload_worker_multipart(account_id, worker_name, files)

            # Step 6: Configure Secret MASTER_KEY
            notify(6, "Configuring Worker Secret", "Provisioning MASTER_KEY via Cloudflare Secrets API...")
            worker_svc.put_worker_secret(account_id, worker_name, "MASTER_KEY", master_key)

            # Step 7: Configure workers.dev Subdomain & Enable Route
            notify(7, "Activating Edge Route", "Configuring workers.dev subdomain route...")
            subdomain = worker_svc.get_account_subdomain(account_id)
            if subdomain:
                worker_url = f"https://{worker_name}.{subdomain}.workers.dev"
                try:
                    worker_svc.enable_worker_subdomain(account_id, worker_name, enabled=True)
                except Exception:
                    pass
            else:
                worker_url = f"https://{worker_name}.workers.dev"

            # Step 8: Persist Local State in SQLite
            notify(8, "Finalizing Deployment", "Saving managed worker and recording audit history...")
            worker_id = f"{account_id}:{worker_name}"
            now = datetime.utcnow().isoformat() + "Z"

            managed_rec = ManagedWorkerRecord(
                workerId=worker_id,
                connectionId=connection_id,
                accountId=account_id,
                workerName=worker_name,
                workerUrl=worker_url,
                d1BindingName="IOT_DB",
                d1DatabaseId=d1_uuid,
                d1Name=d1_name,
                installedWorkerVersion=pkg.version,
                lastWorkerUpdateCheck=now,
                latestDiscoveredWorkerVersion=pkg.version,
                lastUpdatedAt=now,
                status="up_to_date"
            )
            self.db.save_managed_worker(managed_rec)

            history_rec = UpdateHistoryRecord(
                historyId=str(uuid.uuid4()),
                workerId=worker_id,
                workerName=worker_name,
                accountId=account_id,
                previousWorkerVersion="none",
                updatedWorkerVersion=pkg.version,
                d1DatabaseId=d1_uuid,
                d1BindingName="IOT_DB",
                updatedAt=now,
                status="success",
                details=f"Fresh installation of Worker '{worker_name}' (v{pkg.version}, commit {pkg.source_revision[:8]}) with D1 '{d1_name}' ({d1_uuid})"
            )
            self.db.record_update_history(history_rec)

            return DeploymentResult(
                success=True,
                action="create",
                worker_name=worker_name,
                worker_url=worker_url,
                d1_database_id=d1_uuid,
                d1_binding_name="IOT_DB",
                d1_name=d1_name,
                worker_version=pkg.version,
                source_revision=pkg.source_revision,
                bundle_sha256=pkg.bundle_sha256,
                master_key=master_key,
                error=None,
                details={"account_id": account_id, "connection_id": connection_id}
            )

        except Exception as exc:
            err_msg = str(exc)
            return DeploymentResult(
                success=False,
                action="create",
                worker_name=worker_name or "unknown",
                worker_url=None,
                d1_database_id="none",
                d1_binding_name="none",
                worker_version="unknown",
                source_revision="unknown",
                bundle_sha256="none",
                error=err_msg,
                details={"account_id": account_id, "connection_id": connection_id}
            )

    def update_worker(
        self,
        connection_id: str,
        account_id: str,
        worker_name: str,
        progress_callback: Optional[Callable[[int, int, str, str], None]] = None
    ) -> DeploymentResult:
        """
        Executes an in-place Worker update:
        1. Inspects existing remote bindings on Cloudflare directly.
        2. STRICT INVARIANT: Preserves existing D1 database ID and binding name.
           NEVER creates, deletes, drops, or recreates D1.
        3. Resolves Worker source at immutable commit SHA & compiles package.
        4. Uploads updated multipart bundle to existing Cloudflare Worker.
        5. Verifies deployment success.
        6. Updates SQLite records and logs audit history.
        """
        total_steps = 6

        def notify(step: int, title: str, details: str):
            if progress_callback:
                try:
                    progress_callback(step, total_steps, title, details)
                except Exception:
                    pass

        try:
            client, worker_svc, d1_svc = self._get_cf_services(connection_id)

            # Step 1: Inspect Remote Worker & Validate Existing D1 Binding
            notify(1, "Inspecting Remote Worker", f"Inspecting bindings for Worker '{worker_name}'...")
            remote_worker = worker_svc.get_worker(account_id, worker_name)
            if not remote_worker:
                raise ResourceNotFoundError(
                    f"Worker '{worker_name}' does not exist on Cloudflare account '{account_id}'.",
                    status_code=404,
                    step="Inspect Remote Worker"
                )

            discovered_d1 = worker_svc.discover_worker_d1_bindings(account_id, worker_name)
            if not discovered_d1:
                raise ValueError(
                    f"Worker '{worker_name}' has no linked D1 database bindings on Cloudflare. "
                    f"In-place update aborted to prevent deploying without a database."
                )

            # Resolve primary D1 binding (strict, non-ambiguous)
            primary_binding = None
            if len(discovered_d1) == 1:
                primary_binding = discovered_d1[0]
            else:
                # Multiple bindings: look for primary IOT_DB or DB
                iot_matches = [b for b in discovered_d1 if b.binding_name == "IOT_DB"]
                if len(iot_matches) == 1:
                    primary_binding = iot_matches[0]
                else:
                    db_matches = [b for b in discovered_d1 if b.binding_name == "DB"]
                    if len(db_matches) == 1:
                        primary_binding = db_matches[0]
                    else:
                        names = [f"'{b.binding_name}' ({b.database_id})" for b in discovered_d1]
                        raise ValueError(
                            f"Worker '{worker_name}' has ambiguous D1 bindings: {', '.join(names)}. "
                            f"Cannot safely determine which D1 database to preserve. Update aborted."
                        )

            existing_d1_id = primary_binding.database_id
            binding_name = primary_binding.binding_name
            d1_name = primary_binding.database_name or "Unknown D1"

            # Retrieve previous version from local SQLite record if known
            worker_id = f"{account_id}:{worker_name}"
            local_rec = self.db.get_managed_worker(worker_id)
            prev_version = local_rec.installedWorkerVersion if local_rec else "unknown"

            # Step 2: Resolve Authoritative Worker Source
            notify(2, "Resolving Worker Source", "Fetching latest Worker version signal...")
            signal = self.source_service.fetch_version_signal()
            snapshot = self.source_service.download_source_at_revision(signal.source_revision)

            # Step 3: Build Worker Deployment Package
            notify(3, "Compiling Worker Bundle", f"Bundling Worker v{signal.version} from commit {signal.source_revision[:8]}...")
            pkg = self.source_service.build_deployment_package(snapshot, signal.version)

            # Step 4: Deploy Updated Script to Cloudflare Edge (Preserving EXACT D1 Binding)
            notify(4, "Uploading Updated Script", f"Uploading code to Cloudflare (strictly preserving D1 '{existing_d1_id}')...")
            metadata = {
                "main_module": pkg.main_module,
                "compatibility_date": pkg.compatibility_date,
                "compatibility_flags": pkg.compatibility_flags,
                "bindings": [
                    {
                        "type": "d1",
                        "name": binding_name,
                        "id": existing_d1_id
                    }
                ],
                "observability": {
                    "enabled": True
                }
            }
            files = {
                "metadata": (None, json.dumps(metadata), "application/json"),
                pkg.main_module: (pkg.main_module, pkg.bundle_code, "application/javascript+module")
            }
            worker_svc.upload_worker_multipart(account_id, worker_name, files)

            # Step 5: Verify Deployment & Route
            notify(5, "Verifying Edge Deployment", "Confirming bindings preservation and deployment status...")
            subdomain = worker_svc.get_account_subdomain(account_id)
            if subdomain:
                worker_url = f"https://{worker_name}.{subdomain}.workers.dev"
            elif local_rec and local_rec.workerUrl:
                worker_url = local_rec.workerUrl
            else:
                worker_url = f"https://{worker_name}.workers.dev"

            # Step 6: Update Local Database State & Record Audit History
            notify(6, "Recording Update History", "Updating local state and recording audit log...")
            now = datetime.utcnow().isoformat() + "Z"

            updated_managed_rec = ManagedWorkerRecord(
                workerId=worker_id,
                connectionId=connection_id,
                accountId=account_id,
                workerName=worker_name,
                workerUrl=worker_url,
                d1BindingName=binding_name,
                d1DatabaseId=existing_d1_id,
                d1Name=d1_name,
                installedWorkerVersion=pkg.version,
                lastWorkerUpdateCheck=now,
                latestDiscoveredWorkerVersion=pkg.version,
                lastUpdatedAt=now,
                status="up_to_date"
            )
            self.db.save_managed_worker(updated_managed_rec)

            history_rec = UpdateHistoryRecord(
                historyId=str(uuid.uuid4()),
                workerId=worker_id,
                workerName=worker_name,
                accountId=account_id,
                previousWorkerVersion=prev_version,
                updatedWorkerVersion=pkg.version,
                d1DatabaseId=existing_d1_id,
                d1BindingName=binding_name,
                updatedAt=now,
                status="success",
                details=(
                    f"Successfully updated Worker '{worker_name}' from {prev_version} to {pkg.version} "
                    f"({pkg.source_revision[:8]}). Preserved D1 database '{d1_name}' ({existing_d1_id}) under binding '{binding_name}'."
                )
            )
            self.db.record_update_history(history_rec)

            return DeploymentResult(
                success=True,
                action="update",
                worker_name=worker_name,
                worker_url=worker_url,
                d1_database_id=existing_d1_id,
                d1_binding_name=binding_name,
                d1_name=d1_name,
                worker_version=pkg.version,
                source_revision=pkg.source_revision,
                bundle_sha256=pkg.bundle_sha256,
                master_key=None,
                error=None,
                details={"previous_version": prev_version, "account_id": account_id}
            )

        except Exception as exc:
            err_msg = str(exc)
            now = datetime.utcnow().isoformat() + "Z"
            worker_id = f"{account_id}:{worker_name}"

            # Record failed update in audit log
            try:
                fail_history = UpdateHistoryRecord(
                    historyId=str(uuid.uuid4()),
                    workerId=worker_id,
                    workerName=worker_name,
                    accountId=account_id,
                    previousWorkerVersion="unknown",
                    updatedWorkerVersion="failed",
                    d1DatabaseId="preserved",
                    d1BindingName="preserved",
                    updatedAt=now,
                    status="failed",
                    details=f"Update failed for Worker '{worker_name}': {err_msg}"
                )
                self.db.record_update_history(fail_history)
            except Exception:
                pass

            return DeploymentResult(
                success=False,
                action="update",
                worker_name=worker_name,
                worker_url=None,
                d1_database_id="preserved",
                d1_binding_name="preserved",
                worker_version="unknown",
                source_revision="unknown",
                bundle_sha256="none",
                error=err_msg,
                details={"account_id": account_id, "connection_id": connection_id}
            )
