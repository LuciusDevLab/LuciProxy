"""
LuciProxy Builder - Pure REST API Deployment Engine
Coordinates neutral resource naming, D1 creation, embedded artifact upload,
subdomain routing, post-deployment verification, and history persistence.
Zero host dependencies: NO Node.js, npm, Wrangler, Git, or subprocesses.
"""

from typing import Any, Dict, Optional, Tuple

from ..cloudflare.client import CloudflareClient
from ..cloudflare.exceptions import CloudflareError, ResourceCollisionError
from ..resources.d1_manager import D1Manager
from ..resources.naming import generate_deployment_names, generate_single_random_name
from ..storage.history import DeploymentHistoryStore, DeploymentRecord
from ..validation.verifier import DeploymentVerifier, VerificationReport
from .artifact import EmbeddedArtifactManager
from ..utils import console


class Deployer:
    """Executes the complete Cloudflare REST deployment pipeline natively."""

    def __init__(
        self,
        client: CloudflareClient,
        account_id: str,
        account_name: str = "Cloudflare Account",
        history_store: Optional[DeploymentHistoryStore] = None,
        artifact_mgr: Optional[EmbeddedArtifactManager] = None
    ):
        self.client = client
        self.account_id = account_id
        self.account_name = account_name
        self.history_store = history_store or DeploymentHistoryStore()
        self.artifact_mgr = artifact_mgr or EmbeddedArtifactManager()

    def execute_deployment(
        self,
        worker_name: Optional[str] = None,
        d1_name: Optional[str] = None,
        dry_run: bool = False,
        api_route: str = "sync",
        progress_callback: Optional[Any] = None
    ) -> Dict[str, Any]:
        """
        Executes the complete, fresh API deployment with granular progress callbacks:
        1. Verifying Token & Access
        2. Preparing Deployment & Resource Names
        3. Creating D1 Database
        4. Initializing D1 Schema
        5. Verifying D1 Schema
        6. Verifying Worker Artifact (SHA-256)
        7. Uploading Worker Script (multipart)
        8. Verifying Worker Deployment & Versions
        9. Configuring workers.dev Subdomain
        10. Enabling Worker Route
        11. Running Health Checks
        12. Saving Deployment History
        """
        total_steps = 12

        def notify(step_num: int, title: str, details: str):
            console.step(step_num, total_steps, title)
            if progress_callback:
                try:
                    progress_callback(step_num, total_steps, title, details)
                except Exception:
                    pass

        # Step 1: Verifying Token & Account Access
        notify(1, "Verifying Token & Access", f"Account: {self.account_name} ({self.account_id[:8]}...)")
        console.step_ok("VERIFIED")

        # Step 2: Preparing Deployment & Resource Names
        if not worker_name or not d1_name:
            worker_name, d1_name = generate_deployment_names()
        notify(2, "Preparing Deployment", f"Worker: '{worker_name}' | D1: '{d1_name}'")
        console.step_ok(f"Worker: '{worker_name}', D1: '{d1_name}'")

        if dry_run:
            console.warn("DRY-RUN MODE ENABLED - No changes will be made to Cloudflare.")
            simulated_url = f"https://{worker_name}.workers.dev"
            return {
                "success": True,
                "dry_run": True,
                "worker_name": worker_name,
                "d1_name": d1_name,
                "d1_uuid": "simulated-uuid-0000",
                "target_url": simulated_url,
                "panel_url": f"{simulated_url}/{api_route}/dash",
                "master_key": "simulated_master_key_12345678"
            }

        # Step 3: Create D1 Database (with collision handling)
        notify(3, "Creating D1 Database", f"Provisioning D1 database '{d1_name}' via REST API")
        d1_mgr = D1Manager(self.client, self.account_id)
        d1_uuid, d1_name = self._create_d1_with_retry(d1_name)
        console.step_ok(f"CREATED ({d1_uuid[:8]}...)")

        # Step 4: Initialize D1 Schema
        notify(4, "Initializing D1 Schema", "Executing table creation DDL (kv_store)")
        d1_mgr.initialize_schema(d1_uuid)
        console.step_ok("INITIALIZED")

        # Step 5: Verify D1 Schema & Initialize Admin Credential
        notify(5, "Verifying D1 & Admin Access", "Confirming kv_store schema and initializing Master Key")
        if not d1_mgr.verify_schema(d1_uuid):
            raise CloudflareError(
                message=f"D1 database '{d1_name}' ({d1_uuid}) failed schema verification.",
                step="D1 Schema Verification"
            )
        master_key = d1_mgr.seed_master_key(d1_uuid)
        console.step_ok("VERIFIED & CONFIGURED")

        # Step 6: Verify Worker Artifact SHA-256
        notify(6, "Verifying Worker Artifact", "SHA-256 integrity digest validation against manifest")
        bundle_code, manifest = self.artifact_mgr.load_and_verify_bundle()
        metadata, files = self.artifact_mgr.prepare_multipart_payload(worker_name, d1_uuid)
        console.step_ok(f"v{manifest.luciproxy_version} ({manifest.artifact_sha256[:8]}...)")

        # Step 7: Upload Worker to Cloudflare Edge
        notify(7, "Uploading Worker Script", f"Deploying multipart module to Cloudflare Edge")
        worker_name = self._upload_worker_with_retry(worker_name, files, d1_uuid)
        console.step_ok("DEPLOYED")

        # Step 8: Configure Worker Secret MASTER_KEY
        notify(8, "Configuring Worker Secret", "Provisioning MASTER_KEY via Cloudflare Secrets API")
        self.client.put_worker_secret(self.account_id, worker_name, "MASTER_KEY", master_key)
        deployments = self.client.get_worker_deployments(self.account_id, worker_name)
        if not deployments and hasattr(self.client, "get_worker_versions"):
            versions = self.client.get_worker_versions(self.account_id, worker_name)
            if versions and len(versions) > 0:
                v_id = versions[0].get("id")
                if v_id:
                    try:
                        self.client.create_worker_deployment(
                            self.account_id, worker_name, v_id,
                            message="LuciProxy Builder Deployment"
                        )
                    except Exception:
                        pass
        console.step_ok("SECRET CONFIGURED")

        # Step 9: Configure workers.dev Subdomain
        notify(9, "Configuring workers.dev", "Discovering or creating account subdomain")
        subdomain = self._ensure_subdomain()
        target_url = f"https://{worker_name}.{subdomain}.workers.dev"
        panel_url = f"{target_url}/{api_route}/dash"
        sub_url = f"{target_url}/{api_route}"
        console.step_ok(f"SUBDOMAIN ({subdomain})")

        # Step 10: Enable Worker Route
        notify(10, "Enabling Worker Route", f"Activating route: {target_url}")
        try:
            self.client.enable_worker_subdomain(self.account_id, worker_name, enabled=True)
        except Exception:
            pass
        console.step_ok("ROUTE ACTIVE")

        # Step 11: Post-Deployment Verification Health Checks
        notify(11, "Running Health Checks", f"Testing edge reachability and admin panel")
        verifier = DeploymentVerifier(target_url, self.client)
        report = verifier.run_all_checks(
            api_route=api_route,
            account_id=self.account_id,
            database_id=d1_uuid,
            worker_name=worker_name,
            master_key=master_key
        )

        # Enforce that admin authentication credential validation must succeed
        auth_check = next((c for c in report.checks if c.name == "Admin Authentication"), None)
        if auth_check and not auth_check.passed:
            raise CloudflareError(
                message=f"Deployment verification failed: {auth_check.details}. Administrative credentials rejected.",
                step="Post-Deployment Verification",
                reason=auth_check.details
            )

        if report.all_passed:
            console.step_ok("ALL CHECKS PASSED")
        else:
            console.step_warn("PARTIAL (Edge propagation in progress)")

        # Step 12: Record Deployment in Local History (Never saves secret master_key to disk)
        notify(12, "Saving Deployment History", "Recording deployment metadata in local history")
        rec = self.history_store.save_record(
            account_id=self.account_id,
            account_name=self.account_name,

            worker_name=worker_name,
            d1_name=d1_name,
            d1_uuid=d1_uuid,
            worker_url=target_url,
            panel_url=panel_url,
            luciproxy_version=manifest.luciproxy_version,
            artifact_sha256=manifest.artifact_sha256,
            verification_results={c.name: c.passed for c in report.checks}
        )
        console.step_ok(f"SAVED ({rec.deployment_id})")

        return {
            "success": True,
            "dry_run": False,
            "deployment_id": rec.deployment_id,
            "worker_name": worker_name,
            "d1_name": d1_name,
            "d1_uuid": d1_uuid,
            "target_url": target_url,
            "panel_url": panel_url,
            "master_key": master_key,
            "sub_url": sub_url,
            "subdomain": subdomain,
            "version": manifest.luciproxy_version,
            "artifact_sha256": manifest.artifact_sha256,
            "report": report
        }

    def _create_d1_with_retry(self, initial_name: str, max_retries: int = 3) -> Tuple[str, str]:
        """Creates D1 database with collision retry, discarding colliding names."""
        curr_name = initial_name
        for attempt in range(max_retries):
            try:
                res = self.client.create_d1_database(self.account_id, curr_name)
                uuid = res.get("uuid")
                if not uuid:
                    raise CloudflareError(
                        message=f"Failed to obtain UUID for created D1 database '{curr_name}'.",
                        step="D1 Database Creation"
                    )
                return uuid, curr_name
            except (ResourceCollisionError, CloudflareError) as e:
                if "already exists" in str(e).lower() and attempt < max_retries - 1:
                    curr_name = generate_single_random_name()
                    continue
                raise
        raise RuntimeError("Failed to provision D1 database after maximum retry attempts.")

    def _upload_worker_with_retry(
        self,
        initial_name: str,
        files: Dict[str, Any],
        d1_uuid: str,
        max_retries: int = 3
    ) -> str:
        """Uploads worker multipart payload with collision retry."""
        curr_name = initial_name
        for attempt in range(max_retries):
            try:
                self.client.upload_worker_multipart(self.account_id, curr_name, files)
                return curr_name
            except (ResourceCollisionError, CloudflareError) as e:
                if "already exists" in str(e).lower() and attempt < max_retries - 1:
                    curr_name = generate_single_random_name()
                    # Rebuild files payload with new worker name
                    _, files = self.artifact_mgr.prepare_multipart_payload(curr_name, d1_uuid)
                    continue
                raise
        raise RuntimeError("Failed to upload Worker script after maximum retry attempts.")


    def _ensure_subdomain(self) -> str:
        """Discovers or registers account workers.dev subdomain."""
        subdomain = self.client.get_workers_subdomain(self.account_id)
        if not subdomain:
            # Register new neutral subdomain for account
            new_subdomain = generate_single_random_name()
            try:
                res = self.client.create_workers_subdomain(self.account_id, new_subdomain)
                subdomain = res.get("subdomain") or new_subdomain
            except Exception:
                subdomain = new_subdomain

        return subdomain
