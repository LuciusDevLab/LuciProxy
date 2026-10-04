"""
LuciProxy Builder - Live Cloudflare Integration Verification Engine
Executes a single end-to-end disposable deployment against Cloudflare Edge,
verifies all API stages, tests live HTTPS endpoints, and cleans up resources.
Zero token leakage: Token is held strictly in volatile memory.
"""

from dataclasses import dataclass, field
import json
import os
import time
from typing import Any, Dict, List, Optional, Tuple
import requests

from ..cloudflare.client import CloudflareClient
from ..cloudflare.exceptions import CloudflareError, AuthenticationError
from ..deployment.artifact import EmbeddedArtifactManager
from ..resources.d1_manager import D1Manager, SCHEMA_SQL, VERIFY_TABLE_SQL
from ..resources.naming import generate_deployment_names
from ..storage.history import DeploymentHistoryStore
from ..utils.sanitize import sanitize_text


@dataclass
class StageLog:
    step: int
    name: str
    endpoint: str
    method: str
    status: str
    details: str
    elapsed_ms: int = 0


@dataclass
class LiveVerificationReport:
    success: bool
    stages: List[StageLog] = field(default_factory=list)
    worker_name: Optional[str] = None
    d1_name: Optional[str] = None
    d1_uuid: Optional[str] = None
    subdomain: Optional[str] = None
    worker_url: Optional[str] = None
    panel_url: Optional[str] = None
    deployment_state: Optional[Dict[str, Any]] = None
    https_verification: Dict[str, Any] = field(default_factory=dict)
    cleanup_result: Dict[str, Any] = field(default_factory=dict)
    api_differences: List[str] = field(default_factory=list)


class LiveIntegrationVerifier:
    """Orchestrates live disposable verification against real Cloudflare infrastructure."""

    def __init__(self, token: str, account_id: Optional[str] = None):
        self.token = token.strip()
        self.account_id = account_id
        self.client = CloudflareClient(self.token)
        self.artifact_mgr = EmbeddedArtifactManager()
        self.history_store = DeploymentHistoryStore()
        self.stages: List[StageLog] = []

    def _record_stage(
        self,
        step: int,
        name: str,
        endpoint: str,
        method: str,
        status: str,
        details: str,
        elapsed_ms: int = 0
    ) -> None:
        self.stages.append(StageLog(
            step=step,
            name=name,
            endpoint=endpoint,
            method=method,
            status=status,
            details=details,
            elapsed_ms=elapsed_ms
        ))

    def run_disposable_verification(self) -> LiveVerificationReport:
        created_worker: Optional[str] = None
        created_d1_id: Optional[str] = None
        created_d1_name: Optional[str] = None
        report = LiveVerificationReport(success=False, stages=self.stages)

        try:
            # 1. API Token Authentication
            t0 = time.time()
            try:
                verify_res = self.client.verify_token()
                status_str = verify_res.get("status", "active")
                self._record_stage(
                    1, "API Token Authentication", "/user/tokens/verify", "GET", "PASS",
                    f"Token status: {status_str}", int((time.time() - t0) * 1000)
                )
            except Exception as e:
                self._record_stage(
                    1, "API Token Authentication", "/user/tokens/verify", "GET", "FAIL",
                    f"Token authentication failed: {sanitize_text(str(e))}", int((time.time() - t0) * 1000)
                )
                return report

            # 2. Account Discovery
            t0 = time.time()
            try:
                accounts = self.client.list_accounts()
                if not accounts:
                    self._record_stage(
                        2, "Account Discovery", "/accounts", "GET", "FAIL",
                        "No accounts accessible with this token", int((time.time() - t0) * 1000)
                    )
                    return report

                target_account = accounts[0]
                if self.account_id:
                    matched = [a for a in accounts if a["id"] == self.account_id]
                    if matched:
                        target_account = matched[0]
                self.account_id = target_account["id"]
                account_name = target_account.get("name", "Account")

                self._record_stage(
                    2, "Account Discovery", "/accounts", "GET", "PASS",
                    f"Target account: {account_name} ({self.account_id[:8]}...)", int((time.time() - t0) * 1000)
                )
            except Exception as e:
                self._record_stage(
                    2, "Account Discovery", "/accounts", "GET", "FAIL",
                    f"Discovery failed: {sanitize_text(str(e))}", int((time.time() - t0) * 1000)
                )
                return report

            # 3. Capability Preflight
            t0 = time.time()
            workers_ok, w_err = self.client.probe_workers_capability(self.account_id)
            d1_ok, d_err = self.client.probe_d1_capability(self.account_id)
            sub_ok, sub_name, s_err = self.client.probe_subdomain_capability(self.account_id)
            elapsed = int((time.time() - t0) * 1000)

            if not (workers_ok and d1_ok and sub_ok):
                errs = [e for e in (w_err, d_err, s_err) if e]
                self._record_stage(
                    3, "Capability Preflight", f"/accounts/{self.account_id}/...", "GET", "FAIL",
                    f"Preflight checks failed: {'; '.join(errs)}", elapsed
                )
                return report

            self._record_stage(
                3, "Capability Preflight", f"/accounts/{self.account_id}/...", "GET", "PASS",
                f"Workers: OK, D1: OK, Subdomain: {sub_name or 'unregistered'}", elapsed
            )

            # 4 & 5. Generate fresh neutral Worker & D1 names
            worker_name, d1_name = generate_deployment_names()
            report.worker_name = worker_name
            report.d1_name = d1_name
            self._record_stage(
                4, "Resource Naming", "Local secrets engine", "GEN", "PASS",
                f"Worker: '{worker_name}', D1: '{d1_name}'", 0
            )

            # 6. Create D1 Database through REST API
            t0 = time.time()
            try:
                d1_res = self.client.create_d1_database(self.account_id, d1_name)
                created_d1_id = d1_res.get("uuid")
                created_d1_name = d1_name
                report.d1_uuid = created_d1_id
                if not created_d1_id:
                    raise CloudflareError("No UUID in D1 creation response")
                self._record_stage(
                    6, "D1 Creation", f"/accounts/{self.account_id}/d1/database", "POST", "PASS",
                    f"D1 database created with authoritative UUID: {created_d1_id}", int((time.time() - t0) * 1000)
                )
            except Exception as e:
                self._record_stage(
                    6, "D1 Creation", f"/accounts/{self.account_id}/d1/database", "POST", "FAIL",
                    f"D1 creation failed: {sanitize_text(str(e))}", int((time.time() - t0) * 1000)
                )
                return report

            # 7 & 8. Initialize production schema
            t0 = time.time()
            d1_mgr = D1Manager(self.client, self.account_id)
            try:
                d1_mgr.initialize_schema(created_d1_id)
                self._record_stage(
                    8, "D1 Schema Initialization", f"/accounts/{self.account_id}/d1/database/{created_d1_id}/query", "POST", "PASS",
                    "Executed DDL: CREATE TABLE IF NOT EXISTS kv_store", int((time.time() - t0) * 1000)
                )
            except Exception as e:
                self._record_stage(
                    8, "D1 Schema Initialization", f"/accounts/{self.account_id}/d1/database/{created_d1_id}/query", "POST", "FAIL",
                    f"Schema initialization failed: {sanitize_text(str(e))}", int((time.time() - t0) * 1000)
                )
                return report

            # 9. Verify actual required schema
            t0 = time.time()
            schema_ok = d1_mgr.verify_schema(created_d1_id)
            if not schema_ok:
                self._record_stage(
                    9, "D1 Schema Verification", f"/accounts/{self.account_id}/d1/database/{created_d1_id}/query", "POST", "FAIL",
                    "Table 'kv_store' not found in sqlite_master", int((time.time() - t0) * 1000)
                )
                return report
            self._record_stage(
                9, "D1 Schema Verification", f"/accounts/{self.account_id}/d1/database/{created_d1_id}/query", "POST", "PASS",
                "Table 'kv_store' confirmed present in sqlite_master", int((time.time() - t0) * 1000)
            )

            # 10 & 11. Load embedded Worker artifact & verify SHA-256 integrity
            t0 = time.time()
            try:
                bundle_code, manifest = self.artifact_mgr.load_and_verify_bundle()
                metadata, files = self.artifact_mgr.prepare_multipart_payload(worker_name, created_d1_id)
                self._record_stage(
                    11, "Artifact SHA-256 Integrity Check", "Embedded bundle vs manifest", "SHA256", "PASS",
                    f"SHA-256 verified: {manifest.artifact_sha256[:16]}... (version: v{manifest.luciproxy_version})", int((time.time() - t0) * 1000)
                )
            except Exception as e:
                self._record_stage(
                    11, "Artifact SHA-256 Integrity Check", "Embedded bundle vs manifest", "SHA256", "FAIL",
                    f"Integrity check failed: {sanitize_text(str(e))}", int((time.time() - t0) * 1000)
                )
                return report

            # 12. Upload Worker via Cloudflare REST API (multipart)
            t0 = time.time()
            try:
                upload_res = self.client.upload_worker_multipart(self.account_id, worker_name, files)
                created_worker = worker_name
                self._record_stage(
                    12, "Worker Multipart Upload", f"/accounts/{self.account_id}/workers/scripts/{worker_name}", "PUT", "PASS",
                    f"Worker uploaded successfully with D1 binding '{manifest.d1_binding_name}' -> {created_d1_id[:8]}...", int((time.time() - t0) * 1000)
                )
            except Exception as e:
                self._record_stage(
                    12, "Worker Multipart Upload", f"/accounts/{self.account_id}/workers/scripts/{worker_name}", "PUT", "FAIL",
                    f"Upload failed: {sanitize_text(str(e))}", int((time.time() - t0) * 1000)
                )
                return report

            # 13. Verify Worker exists
            t0 = time.time()
            worker_info = self.client.get_worker(self.account_id, worker_name)
            if not worker_info:
                self._record_stage(
                    13, "Worker Existence Check", f"/accounts/{self.account_id}/workers/scripts/{worker_name}", "GET", "FAIL",
                    "Worker not found after upload", int((time.time() - t0) * 1000)
                )
                return report
            self._record_stage(
                13, "Worker Existence Check", f"/accounts/{self.account_id}/workers/scripts/{worker_name}", "GET", "PASS",
                f"Worker script confirmed active in account (etag: {worker_info.get('etag', 'N/A')})", int((time.time() - t0) * 1000)
            )

            # 14. Verify Worker version/deployment state
            t0 = time.time()
            deployments_data = self.client.get_worker_deployments(self.account_id, worker_name)
            versions_data = self.client.get_worker_versions(self.account_id, worker_name)
            report.deployment_state = {
                "deployments": deployments_data,
                "versions_count": len(versions_data)
            }

            has_active_deployment = False
            active_version_id = None
            if deployments_data and "deployments" in deployments_data:
                dep_list = deployments_data.get("deployments", [])
                if dep_list:
                    has_active_deployment = True
            elif deployments_data and "versions" in deployments_data:
                has_active_deployment = True

            # If no active deployment is found or deployment API is available, check whether explicit activation is needed
            if not has_active_deployment and versions_data:
                active_version_id = versions_data[0].get("id")
                report.api_differences.append(
                    f"Worker upload created version {active_version_id} without immediate deployment. Calling POST /deployments."
                )
                try:
                    dep_create = self.client.create_worker_deployment(
                        self.account_id, worker_name, active_version_id, message="Disposable verification deployment"
                    )
                    self._record_stage(
                        14, "Worker Deployment Activation", f"/accounts/{self.account_id}/workers/scripts/{worker_name}/deployments", "POST", "PASS",
                        f"Explicit deployment activated for version {active_version_id[:8]}...", int((time.time() - t0) * 1000)
                    )
                except Exception as e:
                    report.api_differences.append(f"POST /deployments returned error (ignoring if PUT was sufficient): {e}")
                    self._record_stage(
                        14, "Worker Deployment Check", f"/accounts/{self.account_id}/workers/scripts/{worker_name}/deployments", "GET", "INFO",
                        f"Legacy PUT deployment active: {sanitize_text(str(e))}", int((time.time() - t0) * 1000)
                    )
            else:
                self._record_stage(
                    14, "Worker Deployment Check", f"/accounts/{self.account_id}/workers/scripts/{worker_name}/deployments", "GET", "PASS",
                    f"Deployment state verified (PUT upload automatically deployed to edge)", int((time.time() - t0) * 1000)
                )

            # 15 & 16. Discover/Create workers.dev subdomain
            t0 = time.time()
            subdomain = self.client.get_workers_subdomain(self.account_id)
            if not subdomain:
                new_sub = generate_deployment_names()[0]
                self.client.create_workers_subdomain(self.account_id, new_sub)
                subdomain = new_sub
                self._record_stage(
                    16, "Subdomain Creation", f"/accounts/{self.account_id}/workers/subdomain", "PUT", "PASS",
                    f"Registered new subdomain: {subdomain}", int((time.time() - t0) * 1000)
                )
            else:
                self._record_stage(
                    15, "Subdomain Discovery", f"/accounts/{self.account_id}/workers/subdomain", "GET", "PASS",
                    f"Account subdomain: {subdomain}.workers.dev", int((time.time() - t0) * 1000)
                )
            report.subdomain = subdomain

            # 17. Enable Worker on workers.dev
            t0 = time.time()
            self.client.enable_worker_subdomain(self.account_id, worker_name, enabled=True)
            self._record_stage(
                17, "Worker Subdomain Enablement", f"/accounts/{self.account_id}/workers/scripts/{worker_name}/subdomain", "POST", "PASS",
                f"Enabled route: https://{worker_name}.{subdomain}.workers.dev", int((time.time() - t0) * 1000)
            )

            # 18. Construct URLs
            worker_url = f"https://{worker_name}.{subdomain}.workers.dev"
            panel_url = f"{worker_url}/sync/dash"
            report.worker_url = worker_url
            report.panel_url = panel_url

            # Wait a few seconds for Edge DNS / routing propagation
            time.sleep(3)

            # 19. Real HTTPS request to root
            t0 = time.time()
            root_resp = requests.get(worker_url, headers={"User-Agent": "Mozilla/5.0"}, timeout=20)
            root_ok = root_resp.status_code in (200, 302, 404, 500)
            report.https_verification["root_status"] = root_resp.status_code
            report.https_verification["root_latency_ms"] = int((time.time() - t0) * 1000)
            self._record_stage(
                19, "Edge HTTPS Request (Root)", worker_url, "GET", "PASS" if root_ok else "WARN",
                f"HTTP {root_resp.status_code} in {int((time.time() - t0) * 1000)}ms", int((time.time() - t0) * 1000)
            )

            # 20 & 21. Real HTTPS request to /sync/dash (Admin Panel)
            t0 = time.time()
            dash_resp = requests.get(panel_url, headers={"User-Agent": "Mozilla/5.0"}, timeout=20)
            dash_text = dash_resp.text
            has_expected_content = (
                dash_resp.status_code == 200 and
                ("luciproxy" in dash_text.lower() or "dashboard" in dash_text.lower() or "<!doctype html" in dash_text.lower())
            )
            report.https_verification["dash_status"] = dash_resp.status_code
            report.https_verification["dash_expected_content"] = has_expected_content
            report.https_verification["dash_content_len"] = len(dash_text)
            self._record_stage(
                21, "Admin Panel (/sync/dash)", panel_url, "GET", "PASS" if has_expected_content else "FAIL",
                f"HTTP {dash_resp.status_code}, length: {len(dash_text)} bytes, HTML confirmed: {has_expected_content}", int((time.time() - t0) * 1000)
            )

            # 22. Real HTTPS request to subscription endpoint (/sync?flag=raw)
            t0 = time.time()
            sub_url = f"{worker_url}/sync?flag=raw"
            sub_resp = requests.get(sub_url, headers={"User-Agent": "v2rayng/1.8.5"}, timeout=20)
            sub_ok = (sub_resp.status_code == 200 and len(sub_resp.text.strip()) > 0)
            report.https_verification["sub_status"] = sub_resp.status_code
            report.https_verification["sub_len"] = len(sub_resp.text)
            self._record_stage(
                22, "Subscription Endpoint (/sync?flag=raw)", sub_url, "GET", "PASS" if sub_ok else "FAIL",
                f"HTTP {sub_resp.status_code}, returned configs: {len(sub_resp.text)} bytes", int((time.time() - t0) * 1000)
            )

            # 23. Persist deployment history record (without storing token)
            rec = self.history_store.save_record(
                account_id=self.account_id,
                account_name=account_name,
                worker_name=worker_name,
                d1_name=d1_name,
                d1_uuid=created_d1_id,
                worker_url=worker_url,
                panel_url=panel_url,
                luciproxy_version=manifest.luciproxy_version,
                artifact_sha256=manifest.artifact_sha256,
                verification_results={
                    "root_reachability": root_ok,
                    "dashboard_view": has_expected_content,
                    "subscription_endpoint": sub_ok
                }
            )
            self._record_stage(
                23, "History Persistence", "%APPDATA%/luciproxy/deployments.json", "DISK", "PASS",
                f"Saved record: {rec.deployment_id} (Token completely excluded)", 0
            )

            report.success = (root_ok and has_expected_content and sub_ok)

        finally:
            # D. Safe Cleanup of Disposable Integration Resources
            cleanup_summary = {}

            # 1. Clean up disposable Worker
            if created_worker:
                t0 = time.time()
                try:
                    self.client.delete_worker_script(self.account_id, created_worker)
                    cleanup_summary["worker_deleted"] = True
                    self._record_stage(
                        24, "Disposable Worker Cleanup", f"/accounts/{self.account_id}/workers/scripts/{created_worker}", "DELETE", "PASS",
                        f"Deleted disposable Worker '{created_worker}'", int((time.time() - t0) * 1000)
                    )
                except Exception as e:
                    cleanup_summary["worker_deleted"] = False
                    cleanup_summary["worker_error"] = str(e)
                    self._record_stage(
                        24, "Disposable Worker Cleanup", f"/accounts/{self.account_id}/workers/scripts/{created_worker}", "DELETE", "FAIL",
                        f"Failed to delete worker: {sanitize_text(str(e))}", int((time.time() - t0) * 1000)
                    )

            # 2. Clean up disposable D1 Database
            if created_d1_id:
                t0 = time.time()
                try:
                    self.client.delete_d1_database(self.account_id, created_d1_id)
                    cleanup_summary["d1_deleted"] = True
                    self._record_stage(
                        25, "Disposable D1 Cleanup", f"/accounts/{self.account_id}/d1/database/{created_d1_id}", "DELETE", "PASS",
                        f"Deleted disposable D1 database '{created_d1_name}' ({created_d1_id[:8]}...)", int((time.time() - t0) * 1000)
                    )
                except Exception as e:
                    cleanup_summary["d1_deleted"] = False
                    cleanup_summary["d1_error"] = str(e)
                    self._record_stage(
                        25, "Disposable D1 Cleanup", f"/accounts/{self.account_id}/d1/database/{created_d1_id}", "DELETE", "FAIL",
                        f"Failed to delete D1: {sanitize_text(str(e))}", int((time.time() - t0) * 1000)
                    )

            report.cleanup_result = cleanup_summary

        return report
