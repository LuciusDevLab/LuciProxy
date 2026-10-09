"""
LuciProxy Manager - PySide6 Main Application Shell.
Focused Cloudflare Worker & D1 Manager.
Direct hierarchy: HOME -> ACCOUNT DETAILS with high-contrast pure black theme,
functional top actions, and zero dead buttons.
"""

from pathlib import Path
from typing import Any, Dict, List, Optional
from PySide6.QtCore import Qt
from PySide6.QtGui import QIcon
from PySide6.QtWidgets import (
    QMainWindow,
    QWidget,
    QVBoxLayout,
    QHBoxLayout,
    QStackedWidget,
    QPushButton,
    QLabel,
    QFrame,
)

from .async_worker import run_in_background
from .controllers.account_controller import AccountController
from .controllers.worker_controller import WorkerController
from .controllers.d1_controller import D1Controller
from .controllers.analytics_controller import AnalyticsController
from .controllers.release_controller import ReleaseController
from .dialogs.add_account_dialog import AddAccountDialog
from .dialogs.create_worker_dialog import CreateWorkerDialog
from .dialogs.update_worker_dialog import UpdateWorkerDialog
from .dialogs.settings_dialog import SettingsDialog
from .screens.home_screen import HomeScreen
from .screens.account_details_screen import AccountDetailsScreen
from .notifications import WindowsNotificationManager
from ..storage.database import LocalDatabase

GLOBAL_DARK_STYLE = """
QMainWindow {
    background-color: #0a0a0a;
}
QWidget {
    background-color: #0a0a0a;
    color: #ffffff;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
}
QScrollBar:vertical {
    border: none;
    background: #111111;
    width: 10px;
    margin: 0px;
}
QScrollBar::handle:vertical {
    background: #27272a;
    min-height: 20px;
    border-radius: 4px;
}
QScrollBar::handle:vertical:hover {
    background: #3f3f46;
}
QScrollBar::add-line:vertical, QScrollBar::sub-line:vertical {
    height: 0px;
}
QScrollBar:horizontal {
    border: none;
    background: #111111;
    height: 10px;
    margin: 0px;
}
QScrollBar::handle:horizontal {
    background: #27272a;
    min-width: 20px;
    border-radius: 4px;
}
QScrollBar::handle:horizontal:hover {
    background: #3f3f46;
}
QScrollBar::add-line:horizontal, QScrollBar::sub-line:horizontal {
    width: 0px;
}
QToolTip {
    background-color: #18181b;
    color: #ffffff;
    border: 1px solid #3f3f46;
    padding: 4px 8px;
    border-radius: 4px;
}
"""


class MainWindow(QMainWindow):
    """Main window hosting Home and Account Details screens."""

    def __init__(self, db: LocalDatabase, parent: Optional = None):
        super().__init__(parent)
        self.db = db

        # Initialize controllers
        self.account_ctrl = AccountController(self.db)
        self.worker_ctrl = WorkerController(self.db)
        self.d1_ctrl = D1Controller(self.db)
        self.analytics_ctrl = AnalyticsController(self.db)
        self.release_ctrl = ReleaseController(self.db)
        self.notif_mgr = WindowsNotificationManager(db=self.db, parent=self)

        self.setWindowTitle("LuciProxy Manager v2.0.0")
        self.setMinimumSize(1020, 700)
        self.setStyleSheet(GLOBAL_DARK_STYLE)

        # Set Window Icon
        self._setup_icon()

        self._init_ui()
        self._connect_signals()

        # Initial data load
        self.refresh_all_state()

    def _setup_icon(self) -> None:
        """Sets the window icon using canonical Builder/icon.ico."""
        # Find Builder/icon.ico relative to repository root
        root_dir = Path(__file__).resolve().parent.parent.parent
        icon_path = root_dir / "Builder" / "icon.ico"
        if icon_path.exists():
            self.setWindowIcon(QIcon(str(icon_path)))

    def _init_ui(self) -> None:
        central_widget = QWidget()
        self.setCentralWidget(central_widget)
        main_layout = QVBoxLayout(central_widget)
        main_layout.setContentsMargins(0, 0, 0, 0)
        main_layout.setSpacing(0)

        # 1. Top Global Navigation / Branding Bar
        top_bar = QFrame()
        top_bar.setStyleSheet(
            "background-color: #0f0f11; border-bottom: 1px solid #1f1f23; padding: 6px 16px;"
        )
        top_bar_layout = QHBoxLayout(top_bar)
        top_bar_layout.setContentsMargins(12, 8, 12, 8)
        top_bar_layout.setSpacing(12)

        # App Brand & Version Badge
        brand_layout = QHBoxLayout()
        brand_layout.setSpacing(8)
        lbl_logo = QLabel("🛡️ LuciProxy")
        lbl_logo.setStyleSheet("font-size: 17px; font-weight: bold; color: #ffffff;")
        brand_layout.addWidget(lbl_logo)

        self.lbl_ver = QLabel("Manager v2.0.0")
        self.lbl_ver.setStyleSheet(
            "background-color: #1e293b; color: #38bdf8; font-size: 11px; "
            "font-weight: 600; padding: 2px 8px; border-radius: 4px;"
        )
        brand_layout.addWidget(self.lbl_ver)
        top_bar_layout.addLayout(brand_layout)

        top_bar_layout.addStretch()

        # Top Bar Action Buttons: Settings
        self.btn_top_settings = QPushButton("⚙ Settings")
        self.btn_top_settings.setCursor(Qt.PointingHandCursor)
        self.btn_top_settings.setStyleSheet(
            "QPushButton { background-color: #18181b; color: #e2e8f0; border: 1px solid #27272a; "
            "padding: 6px 14px; border-radius: 6px; font-size: 12px; } "
            "QPushButton:hover { background-color: #27272a; }"
        )
        self.btn_top_settings.clicked.connect(self._open_settings)
        top_bar_layout.addWidget(self.btn_top_settings)

        main_layout.addWidget(top_bar)

        # 2. Main Stacked Widget
        self.stack = QStackedWidget()

        # Screen 0: Home Screen
        self.home_screen = HomeScreen()
        self.stack.addWidget(self.home_screen)

        # Screen 1: Account Details Screen
        self.account_details_screen = AccountDetailsScreen(
            account_ctrl=self.account_ctrl,
            worker_ctrl=self.worker_ctrl,
            d1_ctrl=self.d1_ctrl,
        )
        self.stack.addWidget(self.account_details_screen)

        main_layout.addWidget(self.stack)

    def _connect_signals(self) -> None:
        # Home Screen Actions
        self.home_screen.add_account_requested.connect(self._open_add_account)
        self.home_screen.create_worker_requested.connect(self._open_create_worker)
        self.home_screen.update_worker_requested.connect(self._open_update_worker)
        self.home_screen.open_account_requested.connect(self._open_account_details)
        self.home_screen.refresh_requested.connect(self.refresh_all_state)

        # Account Details Screen Actions
        self.account_details_screen.back_requested.connect(self._return_to_home)
        self.account_details_screen.refresh_all_requested.connect(self.refresh_all_state)

    def refresh_all_state(self) -> None:
        """Fetches all accounts and their summaries asynchronously to populate Home screen."""
        def load_all_accounts_data():
            accounts = self.account_ctrl.list_all_accounts()
            results = []
            for acc in accounts:
                summary = self.account_ctrl.get_account_summary(acc["connection_id"], acc["account_id"])
                merged = dict(acc)
                merged.update(summary)
                merged["has_credential"] = self.account_ctrl.has_credential(acc["connection_id"])
                results.append(merged)
            return results

        run_in_background(
            fn=load_all_accounts_data,
            on_success=self._on_accounts_loaded,
            on_error=self._on_accounts_error,
        )

        # Asynchronous multi-channel update check
        run_in_background(
            fn=lambda: self.release_ctrl.check_all_updates(),
            on_success=self._on_updates_checked,
            on_error=lambda _: None,
        )

    def _on_updates_checked(self, result: Dict[str, Any]) -> None:
        if not result or not isinstance(result, dict):
            return

        worker_count = result.get("workers_needing_update_count", 0)
        worker_rel = result.get("worker_release") or {}
        worker_ver = worker_rel.get("version", "")

        app_eval = result.get("app_evaluation") or {}
        app_has_update = app_eval.get("has_update", False)
        app_ver = app_eval.get("available_version", "")

        # 1. Update in-app banner on Home screen
        self.home_screen.set_updates_summary(
            worker_updates_count=worker_count,
            latest_worker_version=worker_ver,
            app_has_update=app_has_update,
            latest_app_version=app_ver,
        )

        # 2. Update top navigation pill if Manager app has update
        if app_has_update and app_ver:
            self.lbl_ver.setText(f"Update: v{app_ver} ⚡")
            self.lbl_ver.setStyleSheet(
                "background-color: #0369a1; color: #ffffff; font-size: 11px; "
                "font-weight: 700; padding: 2px 8px; border-radius: 4px;"
            )
            self.lbl_ver.setToolTip(f"LuciProxy Manager v{app_ver} is available!")

        # 3. Deliver OS notifications with persistent deduplication
        if worker_count > 0 and worker_ver:
            evals = result.get("worker_evaluations", [])
            first_name = next((e["worker_name"] for e in evals if e.get("has_update")), None)
            self.notif_mgr.show_worker_update_notification(
                latest_version=worker_ver,
                affected_count=worker_count,
                worker_name=first_name
            )

        if app_has_update and app_ver:
            self.notif_mgr.show_manager_update_notification(
                latest_version=app_ver,
                changelog=app_eval.get("changelog")
            )

    def _on_accounts_loaded(self, accounts_data: List[Dict[str, Any]]) -> None:
        self.home_screen.set_accounts(accounts_data)

    def _on_accounts_error(self, err: Exception) -> None:
        # If database or network error, still render empty or partial
        self.home_screen.set_accounts([])

    def _open_add_account(self) -> None:
        dialog = AddAccountDialog(controller=self.account_ctrl, parent=self)
        dialog.account_added.connect(lambda _: self.refresh_all_state())
        dialog.exec()

    def _open_create_worker(self) -> None:
        dialog = CreateWorkerDialog(
            account_ctrl=self.account_ctrl,
            worker_ctrl=self.worker_ctrl,
            parent=self,
        )
        dialog.worker_created.connect(lambda _: self.refresh_all_state())
        dialog.exec()

    def _open_update_worker(self) -> None:
        dialog = UpdateWorkerDialog(
            account_ctrl=self.account_ctrl,
            worker_ctrl=self.worker_ctrl,
            parent=self,
        )
        dialog.worker_updated.connect(lambda _: self.refresh_all_state())
        dialog.exec()

    def _open_account_details(self, acc: Dict[str, Any]) -> None:
        self.account_details_screen.load_account(
            connection_id=acc["connection_id"],
            account_id=acc["account_id"],
            account_name=acc.get("account_name", ""),
            connection_name=acc.get("connection_name", ""),
        )
        self.stack.setCurrentIndex(1)

    def _return_to_home(self) -> None:
        self.stack.setCurrentIndex(0)
        self.refresh_all_state()

    def _open_settings(self) -> None:
        dialog = SettingsDialog(account_ctrl=self.account_ctrl, parent=self)
        dialog.data_reset.connect(self._return_to_home)
        dialog.exec()
