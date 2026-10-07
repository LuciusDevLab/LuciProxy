"""
LuciProxy Manager - PySide6 Main Application Shell.
Hosts sidebar navigation, stacked screen views, and asynchronous controllers.
"""

from typing import Optional
from PySide6.QtCore import Qt, QSize
from PySide6.QtWidgets import (
    QMainWindow,
    QWidget,
    QHBoxLayout,
    QVBoxLayout,
    QStackedWidget,
    QPushButton,
    QLabel,
    QFrame,
    QButtonGroup,
)

from .async_worker import run_in_background
from .controllers.account_controller import AccountController
from .controllers.worker_controller import WorkerController
from .controllers.d1_controller import D1Controller
from .controllers.analytics_controller import AnalyticsController
from .controllers.release_controller import ReleaseController
from .screens.home_screen import HomeScreen
from .screens.accounts_screen import AccountsScreen
from .screens.workers_screen import WorkersScreen
from .screens.d1_screen import D1Screen
from .screens.analytics_screen import AnalyticsScreen
from .screens.settings_screen import SettingsScreen
from ..storage.database import LocalDatabase


class MainWindow(QMainWindow):
    """Main window of LuciProxy Manager."""

    def __init__(self, db: LocalDatabase, parent: Optional = None):
        super().__init__(parent)
        self.db = db

        # Initialize controllers
        self.account_ctrl = AccountController(self.db)
        self.worker_ctrl = WorkerController(self.db)
        self.d1_ctrl = D1Controller(self.db)
        self.analytics_ctrl = AnalyticsController(self.db)
        self.release_ctrl = ReleaseController(self.db)

        self.setWindowTitle("LuciProxy Manager")
        self.setMinimumSize(1050, 680)
        self._init_ui()
        self._connect_signals()

        # Initial refresh
        self.refresh_all_state()

    def _init_ui(self) -> None:
        central_widget = QWidget()
        self.setCentralWidget(central_widget)
        main_layout = QHBoxLayout(central_widget)
        main_layout.setContentsMargins(0, 0, 0, 0)
        main_layout.setSpacing(0)

        # 1. Sidebar Navigation
        sidebar = QFrame()
        sidebar.setFixedWidth(220)
        sidebar.setStyleSheet(
            "QFrame { background-color: #0f172a; border-right: 1px solid #1e293b; }"
        )
        sidebar_layout = QVBoxLayout(sidebar)
        sidebar_layout.setContentsMargins(16, 24, 16, 24)
        sidebar_layout.setSpacing(8)

        # App Logo / Title
        logo_label = QLabel("LuciProxy")
        logo_label.setStyleSheet("color: white; font-size: 20px; font-weight: bold; padding-left: 8px;")
        sub_logo = QLabel("Manager v2.0.0")
        sub_logo.setStyleSheet("color: #38bdf8; font-size: 12px; font-weight: 600; padding-left: 8px; margin-bottom: 20px;")
        sidebar_layout.addWidget(logo_label)
        sidebar_layout.addWidget(sub_logo)

        # Nav Buttons Group
        self.nav_group = QButtonGroup(self)
        self.nav_group.setExclusive(True)

        self.btn_nav_home = self._create_nav_button("Home", 0)
        self.btn_nav_workers = self._create_nav_button("Workers", 1)
        self.btn_nav_d1 = self._create_nav_button("D1 Databases", 2)
        self.btn_nav_accounts = self._create_nav_button("Accounts", 3)
        self.btn_nav_analytics = self._create_nav_button("Analytics", 4)
        self.btn_nav_settings = self._create_nav_button("Settings", 5)

        sidebar_layout.addWidget(self.btn_nav_home)
        sidebar_layout.addWidget(self.btn_nav_workers)
        sidebar_layout.addWidget(self.btn_nav_d1)
        sidebar_layout.addWidget(self.btn_nav_accounts)
        sidebar_layout.addWidget(self.btn_nav_analytics)
        sidebar_layout.addWidget(self.btn_nav_settings)
        sidebar_layout.addStretch()

        main_layout.addWidget(sidebar)

        # 2. Stacked Content Views
        self.stack = QStackedWidget()
        self.stack.setStyleSheet("background-color: #f8fafc;")

        self.screen_home = HomeScreen()
        self.screen_workers = WorkersScreen(self.account_ctrl, self.worker_ctrl)
        self.screen_d1 = D1Screen(self.account_ctrl, self.d1_ctrl)
        self.screen_accounts = AccountsScreen(self.account_ctrl)
        self.screen_analytics = AnalyticsScreen(self.account_ctrl, self.analytics_ctrl)
        self.screen_settings = SettingsScreen(self.account_ctrl, self.release_ctrl)

        self.stack.addWidget(self.screen_home)
        self.stack.addWidget(self.screen_workers)
        self.stack.addWidget(self.screen_d1)
        self.stack.addWidget(self.screen_accounts)
        self.stack.addWidget(self.screen_analytics)
        self.stack.addWidget(self.screen_settings)

        main_layout.addWidget(self.stack)

        # Set default active tab
        self.btn_nav_home.setChecked(True)
        self.stack.setCurrentIndex(0)

    def _create_nav_button(self, label: str, index: int) -> QPushButton:
        btn = QPushButton(label)
        btn.setCheckable(True)
        btn.setCursor(Qt.PointingHandCursor)
        btn.setStyleSheet(
            "QPushButton { color: #94a3b8; text-align: left; padding: 12px 16px; border: none; "
            "border-radius: 8px; font-size: 14px; font-weight: 500; } "
            "QPushButton:hover { background-color: #1e293b; color: white; } "
            "QPushButton:checked { background-color: #2563eb; color: white; font-weight: bold; }"
        )
        self.nav_group.addButton(btn, index)
        btn.clicked.connect(lambda: self._switch_screen(index))
        return btn

    def _switch_screen(self, index: int) -> None:
        self.stack.setCurrentIndex(index)
        if index == 1:
            self.screen_workers.populate_connections()
        elif index == 2:
            self.screen_d1.populate_connections()
        elif index == 3:
            self.screen_accounts.load_connections()
        elif index == 4:
            self.screen_analytics.populate_connections()

    def _connect_signals(self) -> None:
        self.screen_home.refresh_requested.connect(self.refresh_all_state)
        self.screen_accounts.connections_updated.connect(self.refresh_all_state)
        self.screen_settings.data_purged.connect(self.refresh_all_state)

    def refresh_all_state(self) -> None:
        """Asynchronously updates metrics across screens."""
        def fetch_task():
            conns = self.account_ctrl.list_connections()
            acc_count = sum(len(self.account_ctrl.get_accounts_for_connection(c.connectionId)) for c in conns)
            workers_count = len(self.db.list_managed_workers())
            ver_info = self.release_ctrl.get_version_status()
            return {
                "conns_count": len(conns),
                "acc_count": acc_count,
                "workers_count": workers_count,
                "ver_info": ver_info,
            }

        def on_done(res):
            info = res["ver_info"]
            self.screen_home.update_metrics(
                connections_count=res["conns_count"],
                accounts_count=res["acc_count"],
                workers_count=res["workers_count"],
                manager_version=info["current_manager_version"],
                worker_version=info["latest_worker_version"],
                github_status=f"Checked at {info['last_check']}",
            )
            self.screen_settings.update_version_info(info)

        run_in_background(fetch_task, on_result=on_done)

    def closeEvent(self, event) -> None:
        from PySide6.QtCore import QThreadPool
        QThreadPool.globalInstance().waitForDone(1000)
        super().closeEvent(event)
