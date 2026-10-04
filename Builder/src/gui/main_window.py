"""
LuciProxy Builder - Main Graphical Window & Wizard Controller.
Coordinates screens, background threads, and state navigation with zero UI freezes.
"""

import logging
from pathlib import Path
from typing import Any, Dict, List, Optional

from PySide6.QtCore import Qt, QTimer
from PySide6.QtWidgets import QMainWindow, QStackedWidget, QWidget

from .styles import DARK_THEME
from .screens.welcome import WelcomeScreen
from .screens.token_connect import TokenConnectScreen
from .screens.account_select import AccountSelectScreen
from .screens.pre_deploy import PreDeployScreen
from .screens.progress import ProgressScreen
from .screens.success import SuccessScreen
from .screens.history import HistoryScreen
from .screens.error import ErrorScreen
from .workers import (
    TokenVerificationWorker,
    CapabilityPreflightWorker,
    DeploymentWorker,
    UpdateCheckWorker,
)
from .update_dialog import UpdateDialog

from ..version import BUILDER_VERSION
from ..storage.account_store import AccountStore
from ..storage.history import DeploymentHistoryStore
from ..deployment.artifact import EmbeddedArtifactManager
from ..deployment.update_checker import VersionInfo

logger = logging.getLogger("luciproxy.gui.main_window")


class MainWindow(QMainWindow):
    """Main Application Window housing the multi-step deployment wizard."""

    PAGE_WELCOME = 0
    PAGE_TOKEN = 1
    PAGE_ACCOUNT = 2
    PAGE_PRE_DEPLOY = 3
    PAGE_PROGRESS = 4
    PAGE_SUCCESS = 5
    PAGE_HISTORY = 6
    PAGE_ERROR = 7

    def __init__(self, store_dir: Optional[Path] = None, parent=None):
        super().__init__(parent)
        self.setWindowTitle(f"LuciProxy Builder v{BUILDER_VERSION}")
        self.resize(800, 680)
        self.setMinimumSize(720, 580)
        self.setStyleSheet(DARK_THEME)

        # Persistent Stores
        self.account_store = AccountStore(config_dir=store_dir)
        self.history_store = DeploymentHistoryStore(config_dir=store_dir)
        self.artifact_mgr = EmbeddedArtifactManager()

        # Session State
        self.token: str = ""
        self.user_info: Dict[str, Any] = {}
        self.accounts: List[Dict[str, Any]] = []
        self.selected_account: Dict[str, Any] = {}
        self.previous_page: int = self.PAGE_WELCOME

        # Background Workers
        self.verification_worker: Optional[TokenVerificationWorker] = None
        self.preflight_worker: Optional[CapabilityPreflightWorker] = None
        self.deployment_worker: Optional[DeploymentWorker] = None
        self.update_worker: Optional[UpdateCheckWorker] = None

        self._init_screens()

        # Non-blocking anonymous update check in background
        QTimer.singleShot(300, self._start_update_check)

    def _init_screens(self):
        self.stack = QStackedWidget(self)
        self.setCentralWidget(self.stack)

        # 0. Welcome Screen
        self.screen_welcome = WelcomeScreen()
        self.screen_welcome.get_started_clicked.connect(self._on_get_started)
        self.screen_welcome.view_history_clicked.connect(self._show_history)
        self.stack.addWidget(self.screen_welcome)

        # 1. Token Screen
        self.screen_token = TokenConnectScreen()
        self.screen_token.back_clicked.connect(lambda: self.stack.setCurrentIndex(self.PAGE_WELCOME))
        self.screen_token.verify_token_clicked.connect(self._start_token_verification)
        self.stack.addWidget(self.screen_token)

        # 2. Account Select Screen
        self.screen_account = AccountSelectScreen()
        self.screen_account.back_clicked.connect(lambda: self.stack.setCurrentIndex(self.PAGE_TOKEN))
        self.screen_account.account_selected.connect(self._on_account_selected)
        self.stack.addWidget(self.screen_account)

        # 3. Pre-Deploy Screen
        self.screen_pre_deploy = PreDeployScreen()
        self.screen_pre_deploy.back_clicked.connect(self._on_pre_deploy_back)
        self.screen_pre_deploy.deploy_clicked.connect(self._start_deployment)
        self.stack.addWidget(self.screen_pre_deploy)

        # 4. Progress Screen
        self.screen_progress = ProgressScreen()
        self.stack.addWidget(self.screen_progress)

        # 5. Success Screen
        self.screen_success = SuccessScreen()
        self.screen_success.view_history_clicked.connect(self._show_history)
        self.screen_success.close_clicked.connect(self.close)
        self.stack.addWidget(self.screen_success)

        # 6. History Screen
        self.screen_history = HistoryScreen(self.history_store)
        self.screen_history.back_clicked.connect(self._on_history_back)
        self.stack.addWidget(self.screen_history)

        # 7. Error Screen
        self.screen_error = ErrorScreen()
        self.screen_error.back_clicked.connect(self._on_error_back)
        self.screen_error.retry_clicked.connect(self._on_error_retry)
        self.stack.addWidget(self.screen_error)

        self.stack.setCurrentIndex(self.PAGE_WELCOME)

    def _on_get_started(self):
        # Always guarantee the API Token input starts completely empty
        self.screen_token.clear_input()
        self.stack.setCurrentIndex(self.PAGE_TOKEN)


    def _start_token_verification(self, token: str):
        self.token = token
        self.screen_token.set_loading(True, "Checking your Cloudflare connection...")
        self.verification_worker = TokenVerificationWorker(token)
        self.verification_worker.step_changed.connect(
            lambda msg: self.screen_token.set_loading(True, msg)
        )
        self.verification_worker.verification_succeeded.connect(self._on_verification_succeeded)
        self.verification_worker.verification_failed.connect(self._on_verification_failed)
        self.verification_worker.start()

    def _on_verification_succeeded(self, user_info: dict, accounts: list):
        self.user_info = user_info
        self.accounts = accounts

        if len(accounts) == 1:
            self.selected_account = accounts[0]
            acc_name = accounts[0].get("name", "Account")
            self.screen_token.set_loading(True, f"Checking deployment permissions for '{acc_name}'...")
            self._start_capability_preflight(accounts[0])
        else:
            self.screen_token.show_success("✓ Cloudflare connected")
            self.screen_account.set_accounts(accounts)
            self.stack.setCurrentIndex(self.PAGE_ACCOUNT)

    def _on_verification_failed(self, reason: str, missing_cap: str):
        self.screen_token.show_error(reason)

    def _on_account_selected(self, account: dict):
        self.selected_account = account
        self.screen_account.btn_continue.setEnabled(False)
        self.screen_account.btn_continue.setText("Checking permissions...")
        self._start_capability_preflight(account)

    def _start_capability_preflight(self, account: dict):
        self.preflight_worker = CapabilityPreflightWorker(
            token=self.token,
            account_id=account["id"],
            account_name=account.get("name", "Account")
        )
        self.preflight_worker.preflight_succeeded.connect(
            lambda caps: self._on_preflight_succeeded(account, caps)
        )
        self.preflight_worker.preflight_failed.connect(self._on_preflight_failed)
        self.preflight_worker.start()

    def _on_preflight_succeeded(self, account: dict, capabilities: dict):
        # Reset account selection button state
        self.screen_account.btn_continue.setEnabled(True)
        self.screen_account.btn_continue.setText("Continue")

        # Save verified active account to OS Keyring (safeguarded against keyring issues)
        try:
            subdomain = capabilities.get("subdomain") if isinstance(capabilities, dict) else getattr(capabilities, "subdomain", None)
            self.account_store.save_account(
                account_id=account["id"],
                name=account.get("name", "Account"),
                email=self.user_info.get("email", ""),
                token=self.token,
                subdomain=subdomain
            )
        except Exception as e:
            logger.warning(f"Could not persist verified account to keyring: {e}")

        self._advance_to_pre_deploy()

    def _on_preflight_failed(self, reason: str, missing_cap: str):
        self.screen_account.btn_continue.setEnabled(True)
        self.screen_account.btn_continue.setText("Continue")
        self.screen_token.set_loading(False)
        self.previous_page = self.PAGE_ACCOUNT if len(self.accounts) > 1 else self.PAGE_TOKEN
        self.screen_error.set_error(
            stage="Capability Preflight",
            reason="Missing required Cloudflare token permissions.",
            details=f"{reason}\n\nPlease generate a new token with the required permissions: {missing_cap}"
        )
        self.stack.setCurrentIndex(self.PAGE_ERROR)

    def _advance_to_pre_deploy(self):
        try:
            manifest = self.artifact_mgr.load_manifest()
            version = manifest.luciproxy_version
            sha = manifest.artifact_sha256
        except Exception:
            version = "1.0.0"
            sha = "embedded-verified"

        acc_name = self.selected_account.get("name", "Cloudflare Account")
        self.screen_pre_deploy.set_deployment_info(acc_name, version, sha)
        self.stack.setCurrentIndex(self.PAGE_PRE_DEPLOY)

    def _on_pre_deploy_back(self):
        if len(self.accounts) > 1:
            self.stack.setCurrentIndex(self.PAGE_ACCOUNT)
        else:
            self.stack.setCurrentIndex(self.PAGE_TOKEN)

    def _start_deployment(self, worker_name: str, d1_name: str):
        self.screen_progress.reset_progress()
        self.stack.setCurrentIndex(self.PAGE_PROGRESS)

        self.deployment_worker = DeploymentWorker(
            token=self.token,
            account_id=self.selected_account["id"],
            account_name=self.selected_account.get("name", "Account"),
            worker_name=worker_name,
            d1_name=d1_name,
            history_store=self.history_store,
            artifact_mgr=self.artifact_mgr
        )
        self.deployment_worker.step_progress.connect(self.screen_progress.update_step)
        self.deployment_worker.deployment_succeeded.connect(self._on_deployment_succeeded)
        self.deployment_worker.deployment_failed.connect(self._on_deployment_failed)
        self.deployment_worker.start()

    def _on_deployment_succeeded(self, result: dict):
        self.screen_success.set_result(result)
        self.stack.setCurrentIndex(self.PAGE_SUCCESS)

    def _on_deployment_failed(self, stage: str, reason: str, details: str):
        self.previous_page = self.PAGE_PRE_DEPLOY
        self.screen_error.set_error(stage, reason, details)
        self.stack.setCurrentIndex(self.PAGE_ERROR)

    def _show_history(self):
        self.previous_page = self.stack.currentIndex()
        self.screen_history.refresh_history()
        self.stack.setCurrentIndex(self.PAGE_HISTORY)

    def _on_history_back(self):
        self.stack.setCurrentIndex(self.previous_page)

    def _on_error_back(self):
        self.stack.setCurrentIndex(self.previous_page)

    def _on_error_retry(self):
        if self.previous_page in (self.PAGE_TOKEN, self.PAGE_ACCOUNT):
            self.stack.setCurrentIndex(self.previous_page)
        else:
            # Regenerate names and re-enter deploy
            self.screen_pre_deploy.regenerate_names()
            self._start_deployment(self.screen_pre_deploy.worker_name, self.screen_pre_deploy.d1_name)

    def _start_update_check(self):
        """Spawns an asynchronous, silent background check for upstream updates."""
        try:
            self.update_worker = UpdateCheckWorker()
            self.update_worker.update_available.connect(self._on_update_available)
            self.update_worker.start()
        except Exception as e:
            logger.debug(f"Could not initiate background update check: {e}")

    def _on_update_available(self, version_info: VersionInfo):
        """Displays the update notification dialog when a newer version is detected."""
        logger.info(f"Update available: {version_info.version} (current: {BUILDER_VERSION})")
        dialog = UpdateDialog(self, version_info=version_info, current_version=BUILDER_VERSION)
        dialog.exec()
