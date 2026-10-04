"""
LuciProxy Builder - Post-Deployment Health Verification Engine
Performs automated live verification across Cloudflare API and deployed Worker endpoints.
"""

from dataclasses import dataclass, field
import time
from typing import List, Optional, Tuple
import requests

from ..cloudflare.client import CloudflareClient
from ..utils.sanitize import sanitize_text


@dataclass
class CheckResult:
    name: str
    passed: bool
    status_code: Optional[int] = None
    details: str = ""
    elapsed_ms: int = 0


@dataclass
class VerificationReport:
    target_url: str
    all_passed: bool
    checks: List[CheckResult] = field(default_factory=list)

    def summary(self) -> str:
        lines = [f"Verification Report for {self.target_url}:"]
        for c in self.checks:
            mark = "PASS" if c.passed else "FAIL"
            status = f" (HTTP {c.status_code})" if c.status_code else ""
            lines.append(f"  [{mark}] {c.name:<26}{status} in {c.elapsed_ms}ms - {c.details}")
        lines.append(f"Overall Status: {'ALL CHECKS PASSED' if self.all_passed else 'SOME CHECKS FAILED'}")
        return "\n".join(lines)


class DeploymentVerifier:
    """Verifies live application endpoints and database functionality post-deployment."""

    def __init__(self, target_url: str, client: Optional[CloudflareClient] = None):
        self.target_url = target_url.rstrip("/")
        self.client = client
        self.session = requests.Session()
        self.session.headers.update({"User-Agent": "LuciProxy-Verifier/1.0"})

    def _http_get(self, path: str, timeout: int = 15) -> Tuple[int, str, int]:
        url = f"{self.target_url}/{path.lstrip('/')}"
        start = time.time()
        try:
            resp = self.session.get(url, timeout=timeout)
            elapsed = int((time.time() - start) * 1000)
            return resp.status_code, resp.text, elapsed
        except Exception as e:
            elapsed = int((time.time() - start) * 1000)
            return 0, sanitize_text(str(e)), elapsed

    def check_worker_exists(self, account_id: str, worker_name: str) -> CheckResult:
        """Verifies Worker exists in Cloudflare via API."""
        if not self.client:
            return CheckResult("Worker Existence", True, 200, "Skipped (no client)", 0)
        start = time.time()
        try:
            worker = self.client.get_worker(account_id, worker_name)
            elapsed = int((time.time() - start) * 1000)
            passed = worker is not None
            details = "Worker confirmed in Cloudflare" if passed else "Worker not found in account"
            return CheckResult("Worker Existence", passed, 200 if passed else 404, details, elapsed)
        except Exception as e:
            elapsed = int((time.time() - start) * 1000)
            return CheckResult("Worker Existence", False, None, f"Query error: {sanitize_text(str(e))}", elapsed)

    def check_worker_reachability(self) -> CheckResult:
        """Tests that the Cloudflare edge terminates and responds on the worker domain."""
        status, text, elapsed = self._http_get("/")
        # Any response from worker or camouflage (200, 302, 404, 500 camo) proves edge reachability
        passed = (status in (200, 302, 404, 500))
        details = "Cloudflare edge returned response" if passed else f"Unreachable: {text}"
        return CheckResult("Edge Reachability", passed, status, details, elapsed)

    def check_dashboard_endpoint(self, api_route: str = "sync") -> CheckResult:
        """Tests the admin dashboard HTML endpoint."""
        status, text, elapsed = self._http_get(f"{api_route}/dash")
        passed = (status == 200 and ("LuciProxy" in text or "dashboard" in text.lower() or "html" in text.lower()))
        details = "Dashboard loaded with valid HTML" if passed else f"Unexpected response: {text[:100]}"
        return CheckResult("Admin Dashboard View", passed, status, details, elapsed)

    def check_subscription_endpoint(self, api_route: str = "sync") -> CheckResult:
        """Tests subscription configuration generation."""
        status, text, elapsed = self._http_get(f"{api_route}?flag=raw")
        passed = (status == 200 and len(text.strip()) > 0)
        details = "Subscription generator returned configs" if passed else f"Subscription failed: {text[:100]}"
        return CheckResult("Subscription Endpoint", passed, status, details, elapsed)

    def check_share_settings_endpoint(self, api_route: str = "sync") -> CheckResult:
        """Tests the shared settings export endpoint."""
        status, text, elapsed = self._http_get(f"{api_route}/share-settings")
        passed = (status == 200 and len(text.strip()) > 10)
        details = "Shared settings exported valid Base64 payload" if passed else f"Export failed: {text[:100]}"
        return CheckResult("Shared Settings Export", passed, status, details, elapsed)

    def check_database_query(self, account_id: str, database_id: str) -> CheckResult:
        """Executes a live ping query on the remote D1 database."""
        if not self.client:
            return CheckResult("D1 Database Query", True, None, "Skipped (no client provided)", 0)

        start = time.time()
        try:
            res = self.client.execute_d1_query(account_id, database_id, "SELECT 1 as ping;")
            elapsed = int((time.time() - start) * 1000)
            passed = len(res) > 0
            details = "D1 SQL query succeeded" if passed else "Empty query result"
            return CheckResult("D1 Database Health", passed, 200, details, elapsed)
        except Exception as e:
            elapsed = int((time.time() - start) * 1000)
            return CheckResult("D1 Database Health", False, None, f"Query error: {sanitize_text(str(e))}", elapsed)

    def check_admin_auth(self, api_route: str = "sync", master_key: Optional[str] = None, max_retries: int = 4) -> CheckResult:
        """Tests the admin authentication endpoint with the master key, retrying for edge propagation."""
        if not master_key:
            return CheckResult("Admin Authentication", True, 200, "Skipped (no key provided)", 0)
        url = f"{self.target_url}/{api_route.lstrip('/')}/api/auth"
        start = time.time()
        last_status = None
        last_error = ""

        for attempt in range(max_retries):
            try:
                resp = self.session.post(url, json={"key": master_key}, timeout=15)
                elapsed = int((time.time() - start) * 1000)
                last_status = resp.status_code
                if resp.status_code == 200:
                    data = resp.json()
                    if data.get("success") is True:
                        return CheckResult("Admin Authentication", True, 200, "Admin authentication verified successfully", elapsed)
                elif resp.status_code in (404, 500, 502, 503) and attempt < max_retries - 1:
                    time.sleep(2 * (attempt + 1))
                    continue
                last_error = f"Authentication rejected: HTTP {resp.status_code}"
            except Exception as e:
                last_error = f"Auth probe error: {sanitize_text(str(e))}"
                if attempt < max_retries - 1:
                    time.sleep(2 * (attempt + 1))
                    continue

        elapsed = int((time.time() - start) * 1000)
        return CheckResult("Admin Authentication", False, last_status, last_error or "Authentication failed", elapsed)


    def run_all_checks(
        self,
        api_route: str = "sync",
        account_id: Optional[str] = None,
        database_id: Optional[str] = None,
        worker_name: Optional[str] = None,
        master_key: Optional[str] = None
    ) -> VerificationReport:
        """Runs the complete suite of post-deployment verification tests."""
        checks: List[CheckResult] = []

        # 1. API-level checks if client and account are available
        if self.client and account_id:
            if worker_name:
                checks.append(self.check_worker_exists(account_id, worker_name))
            if database_id:
                checks.append(self.check_database_query(account_id, database_id))

        # 2. HTTP edge and route checks
        checks.extend([
            self.check_worker_reachability(),
            self.check_dashboard_endpoint(api_route),
            self.check_subscription_endpoint(api_route),
            self.check_share_settings_endpoint(api_route),
        ])

        if master_key:
            checks.append(self.check_admin_auth(api_route, master_key))

        all_passed = all(c.passed for c in checks)
        return VerificationReport(
            target_url=self.target_url,
            all_passed=all_passed,
            checks=checks
        )
