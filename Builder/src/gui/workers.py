"""
LuciProxy Builder - Responsive PySide6 Worker Threads.
Decouples all network and Cloudflare REST API I/O from the GUI thread.
Directly connects to Deployer and TokenValidator services.
"""

from typing import Any, Dict, List, Optional
from PySide6.QtCore import QThread, Signal

from ..auth.token_validator import verify_and_discover_accounts, run_capability_preflight
from ..cloudflare.client import CloudflareClient
from ..cloudflare.exceptions import CloudflareError, AuthenticationError
from ..deployment.artifact import EmbeddedArtifactManager
from ..deployment.deployer import Deployer
from ..storage.history import DeploymentHistoryStore
from ..utils.sanitize import sanitize_text


class TokenVerificationWorker(QThread):
    """Executes token validation and account discovery in background."""

    step_changed = Signal(str)
    verification_succeeded = Signal(dict, list)  # user_info, accounts
    verification_failed = Signal(str, str)  # error_reason, missing_capability

    def __init__(self, token: str, parent=None):
        super().__init__(parent)
        self.token = token.strip()

    def run(self):
        try:
            self.step_changed.emit("Checking your Cloudflare connection...")
            user_info, accounts, client = verify_and_discover_accounts(self.token)

            if not accounts:
                self.verification_failed.emit(
                    "No Cloudflare accounts accessible with this API Token.",
                    "Account Access (Read)"
                )
                return

            self.step_changed.emit("Accounts discovered successfully.")
            self.verification_succeeded.emit(user_info, accounts)

        except AuthenticationError as e:
            self.verification_failed.emit(e.format_actionable(), "Invalid or Expired Token")
        except CloudflareError as e:
            self.verification_failed.emit(e.format_actionable(), "Permission Error")
        except Exception as e:
            self.verification_failed.emit(sanitize_text(str(e)), "Network/Connection Error")


class CapabilityPreflightWorker(QThread):
    """Actively probes deployment capabilities on a selected Cloudflare account."""

    preflight_succeeded = Signal(dict)  # capabilities dict
    preflight_failed = Signal(str, str)  # reason, missing_capability

    def __init__(self, token: str, account_id: str, account_name: str = "Account", parent=None):
        super().__init__(parent)
        self.token = token
        self.account_id = account_id
        self.account_name = account_name
        self.client = CloudflareClient(token)

    def run(self):
        try:
            report = run_capability_preflight(self.client, self.account_id)

            if isinstance(report, dict):
                all_ok = report.get("all_ok", report.get("all_passed", False))
                workers_ok = report.get("workers_scripts_edit", report.get("workers_scripts_ok", False))
                d1_ok = report.get("d1_edit", report.get("d1_ok", False))
                subdomain_ok = report.get("workers_subdomain", report.get("subdomain_ok", False))
                subdomain = report.get("subdomain")
                errors = report.get("errors", [])
            else:
                all_ok = report.all_passed
                workers_ok = report.workers_scripts_ok
                d1_ok = report.d1_ok
                subdomain_ok = report.subdomain_ok
                subdomain = report.subdomain
                errors = getattr(report, "errors", [])

            if not all_ok:
                missing = []
                if not workers_ok:
                    missing.append("Workers Scripts: Edit")
                if not d1_ok:
                    if getattr(report, "d1_read_ok", False) and not getattr(report, "d1_write_ok", True):
                        missing.append("D1: Write (Create Database)")
                    else:
                        missing.append("D1: Edit / Write")
                if not subdomain_ok and errors:
                    missing.append("Workers Subdomain access")

                missing_str = ", ".join(missing) if missing else ("; ".join(errors) if errors else "Required permissions missing")
                self.preflight_failed.emit(
                    f"Token lacks required permissions on account '{self.account_name}': {missing_str}",
                    missing_str
                )
                return

            caps_payload = {
                "all_ok": True,
                "all_passed": True,
                "workers_scripts_ok": workers_ok,
                "workers_scripts_edit": workers_ok,
                "d1_ok": d1_ok,
                "d1_edit": d1_ok,
                "subdomain_ok": subdomain_ok,
                "workers_subdomain": subdomain_ok,
                "subdomain": subdomain,
                "errors": errors
            }
            self.preflight_succeeded.emit(caps_payload)

        except Exception as e:
            self.preflight_failed.emit(sanitize_text(str(e)), "Permission/Network Error")


class DeploymentWorker(QThread):
    """Executes the complete Cloudflare REST deployment pipeline via Deployer."""

    step_progress = Signal(int, int, str, str)  # current_step, total_steps, title, details
    deployment_succeeded = Signal(dict)
    deployment_failed = Signal(str, str, str)  # stage, reason, details

    def __init__(
        self,
        token: str,
        account_id: str,
        account_name: str,
        worker_name: str,
        d1_name: str,
        history_store: Optional[DeploymentHistoryStore] = None,
        artifact_mgr: Optional[EmbeddedArtifactManager] = None,
        parent=None
    ):
        super().__init__(parent)
        self.token = token
        self.account_id = account_id
        self.account_name = account_name
        self.worker_name = worker_name
        self.d1_name = d1_name
        self.history_store = history_store or DeploymentHistoryStore()
        self.artifact_mgr = artifact_mgr or EmbeddedArtifactManager()
        self.client = CloudflareClient(self.token)

    def run(self):
        try:
            deployer = Deployer(
                client=self.client,
                account_id=self.account_id,
                account_name=self.account_name,
                history_store=self.history_store,
                artifact_mgr=self.artifact_mgr
            )

            res = deployer.execute_deployment(
                worker_name=self.worker_name,
                d1_name=self.d1_name,
                progress_callback=self._on_progress
            )
            self.deployment_succeeded.emit(res)

        except CloudflareError as e:
            self.deployment_failed.emit(
                getattr(e, "operation", None) or e.step or "Cloudflare API",
                e.reason or "Cloudflare rejected the request.",
                e.format_actionable()
            )
        except Exception as e:
            self.deployment_failed.emit(
                "Deployment Pipeline",
                "An unexpected error occurred during deployment.",
                sanitize_text(str(e))
            )

    def _on_progress(self, step: int, total: int, title: str, details: str):
        self.step_progress.emit(step, total, title, details)


class UpdateCheckWorker(QThread):
    """Asynchronously checks for upstream updates anonymously in a non-blocking background thread."""

    update_available = Signal(object)  # VersionInfo
    check_finished = Signal()

    def __init__(self, current_version: Optional[str] = None, timeout_secs: float = 4.0, parent=None):
        super().__init__(parent)
        from ..version import BUILDER_VERSION
        self.current_version = current_version or BUILDER_VERSION
        self.timeout_secs = timeout_secs

    def run(self):
        try:
            from ..deployment.update_checker import check_for_update
            info = check_for_update(
                current_version=self.current_version,
                timeout_secs=self.timeout_secs
            )
            if info:
                self.update_available.emit(info)
        except Exception:
            # Non-critical: fail silently
            pass
        finally:
            self.check_finished.emit()

