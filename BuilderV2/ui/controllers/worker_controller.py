"""
LuciProxy Manager - Worker Controller.
Discovers Cloudflare Workers for an account, resolves D1 bindings without loss,
and correlates with local installed version tracking.
"""

from typing import Any, Callable, Dict, List, Optional

from ...cloudflare import CloudflareClient, WorkerService, D1Service
from ...storage.database import LocalDatabase
from ...security.credentials import SecureCredentialStore
from ...deployment.installer import WorkerInstaller
from ...deployment.models import DeploymentResult


class WorkerController:
    """Coordinates read-only discovery of Cloudflare Workers and D1 bindings."""

    def __init__(self, db: LocalDatabase, credential_store: Optional[SecureCredentialStore] = None):
        self.db = db
        self.credential_store = credential_store or db.credential_store

    def list_workers(self, connection_id: str, account_id: str) -> List[Dict[str, Any]]:
        """
        Discovers workers under the specified Cloudflare connection and account:
        1. Retrieves secure token from vault.
        2. Calls WorkerService to list remote workers.
        3. Calls discover_worker_d1_bindings() for each worker to inspect remote D1 bindings.
        4. Correlates with local SQLite metadata for installed version.
        """
        token = self.credential_store.get_token(connection_id)
        if not token:
            raise ValueError(f"No token available for connection '{connection_id}'.")

        cf_client = CloudflareClient(token=token, timeout=15)
        d1_svc = D1Service(cf_client)
        worker_svc = WorkerService(cf_client, d1_service=d1_svc)

        remote_workers = worker_svc.list_workers(account_id)
        local_workers = {w.workerName: w for w in self.db.list_managed_workers(account_id)}

        results: List[Dict[str, Any]] = []
        for rw in remote_workers:
            # Query actual remote D1 bindings (never guess or pick one arbitrarily)
            discovered_d1 = worker_svc.discover_worker_d1_bindings(account_id, rw.name)

            # Determine D1 presentation string
            if not discovered_d1:
                d1_display = "No D1 binding detected"
            elif len(discovered_d1) == 1:
                b = discovered_d1[0]
                db_label = b.database_name or b.database_id
                d1_display = f"{db_label} ({b.binding_name})"
            else:
                # Multiple bindings: show all of them!
                items = [f"{b.database_name or b.database_id} ({b.binding_name})" for b in discovered_d1]
                d1_display = f"{len(discovered_d1)} Bindings: " + ", ".join(items)

            # Check if recognized as LuciProxy (has IOT_DB binding or tag or local record)
            has_iot_binding = any(b.binding_name == "IOT_DB" for b in discovered_d1)
            is_in_local_db = rw.name in local_workers
            is_luciproxy = has_iot_binding or is_in_local_db or "luciproxy" in rw.name.lower()

            # Correlate local installed version if known
            local_rec = local_workers.get(rw.name)
            installed_version = local_rec.installedWorkerVersion if local_rec else None

            results.append({
                "id": rw.id,
                "name": rw.name,
                "status": "Active",
                "modified_on": rw.modified_on or "Unknown",
                "is_luciproxy": is_luciproxy,
                "d1_bindings": discovered_d1,
                "d1_display": d1_display,
                "installed_version": installed_version or "Unrecorded",
                "tags": rw.tags,
            })

        return results

    def create_worker(
        self,
        connection_id: str,
        account_id: str,
        worker_name: Optional[str] = None,
        d1_name: Optional[str] = None,
        progress_callback: Optional[Callable[[int, int, str, str], None]] = None
    ) -> DeploymentResult:
        """Installs a fresh Worker with dedicated D1 database from immutable source."""
        installer = WorkerInstaller(self.db, self.credential_store)
        return installer.create_worker(
            connection_id=connection_id,
            account_id=account_id,
            worker_name=worker_name,
            d1_name=d1_name,
            progress_callback=progress_callback
        )

    def update_worker(
        self,
        connection_id: str,
        account_id: str,
        worker_name: str,
        progress_callback: Optional[Callable[[int, int, str, str], None]] = None
    ) -> DeploymentResult:
        """Updates an existing Worker in-place while strictly preserving its D1 database."""
        installer = WorkerInstaller(self.db, self.credential_store)
        return installer.update_worker(
            connection_id=connection_id,
            account_id=account_id,
            worker_name=worker_name,
            progress_callback=progress_callback
        )

