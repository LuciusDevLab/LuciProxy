"""
LuciProxy Manager - Workers Screen Widget.
Provides read-only discovery and inspection of Cloudflare Workers.
Displays linked D1 databases (never assumes single binding),
LuciProxy recognition status, and installed version tracking.
"""

from typing import Dict, List, Optional
from PySide6.QtCore import Qt
from PySide6.QtWidgets import (
    QWidget,
    QVBoxLayout,
    QHBoxLayout,
    QLabel,
    QPushButton,
    QComboBox,
    QTableWidget,
    QTableWidgetItem,
    QHeaderView,
    QProgressBar,
    QMessageBox,
)

from ..async_worker import run_in_background
from ..controllers.account_controller import AccountController
from ..controllers.worker_controller import WorkerController


class WorkersScreen(QWidget):
    """Workers discovery and management screen."""

    def __init__(
        self,
        account_controller: AccountController,
        worker_controller: WorkerController,
        parent: Optional = None
    ):
        super().__init__(parent)
        self.account_controller = account_controller
        self.worker_controller = worker_controller
        self._init_ui()

    def _init_ui(self) -> None:
        layout = QVBoxLayout(self)
        layout.setContentsMargins(32, 32, 32, 32)
        layout.setSpacing(16)

        # Top Bar: Selectors & Refresh
        top_layout = QHBoxLayout()
        title = QLabel("Cloudflare Workers")
        title.setStyleSheet("font-size: 22px; font-weight: bold; color: #1e293b;")
        top_layout.addWidget(title)
        top_layout.addStretch()

        # Connection Selector
        top_layout.addWidget(QLabel("Connection:"))
        self.combo_connection = QComboBox()
        self.combo_connection.setMinimumWidth(180)
        self.combo_connection.currentIndexChanged.connect(self._on_connection_changed)
        top_layout.addWidget(self.combo_connection)

        # Account Selector
        top_layout.addWidget(QLabel("Account:"))
        self.combo_account = QComboBox()
        self.combo_account.setMinimumWidth(200)
        self.combo_account.currentIndexChanged.connect(self._on_account_changed)
        top_layout.addWidget(self.combo_account)

        self.btn_refresh = QPushButton("⟳ Refresh")
        self.btn_refresh.clicked.connect(self.refresh_workers)
        top_layout.addWidget(self.btn_refresh)

        self.btn_deploy = QPushButton("+ Deploy Worker")
        self.btn_deploy.setStyleSheet("background-color: #2563eb; color: white; font-weight: bold; padding: 6px 12px; border-radius: 4px;")
        self.btn_deploy.clicked.connect(self._on_deploy_clicked)
        top_layout.addWidget(self.btn_deploy)

        self.btn_update = QPushButton("↑ Update Worker")
        self.btn_update.setStyleSheet("background-color: #059669; color: white; font-weight: bold; padding: 6px 12px; border-radius: 4px;")
        self.btn_update.clicked.connect(self._on_update_clicked)
        top_layout.addWidget(self.btn_update)

        layout.addLayout(top_layout)


        # Progress indicator
        self.progress = QProgressBar()
        self.progress.setRange(0, 0)
        self.progress.setVisible(False)
        layout.addWidget(self.progress)

        self.lbl_status = QLabel("Select an account to load workers.")
        self.lbl_status.setStyleSheet("color: #64748b; font-size: 13px;")
        layout.addWidget(self.lbl_status)

        # Workers Table
        self.table = QTableWidget()
        self.table.setColumnCount(6)
        self.table.setHorizontalHeaderLabels([
            "Worker Name",
            "Status",
            "Modified",
            "LuciProxy Status",
            "Linked D1 Database(s)",
            "Installed Version"
        ])
        self.table.horizontalHeader().setSectionResizeMode(0, QHeaderView.ResizeToContents)
        self.table.horizontalHeader().setSectionResizeMode(1, QHeaderView.ResizeToContents)
        self.table.horizontalHeader().setSectionResizeMode(2, QHeaderView.ResizeToContents)
        self.table.horizontalHeader().setSectionResizeMode(3, QHeaderView.ResizeToContents)
        self.table.horizontalHeader().setSectionResizeMode(4, QHeaderView.Stretch)
        self.table.horizontalHeader().setSectionResizeMode(5, QHeaderView.ResizeToContents)
        self.table.setSelectionBehavior(QTableWidget.SelectRows)
        layout.addWidget(self.table)

    def populate_connections(self) -> None:
        """Populates connection and account selector dropdowns."""
        self.combo_connection.blockSignals(True)
        self.combo_connection.clear()

        connections = self.account_controller.list_connections()
        for c in connections:
            self.combo_connection.addItem(c.displayName, c.connectionId)

        self.combo_connection.blockSignals(False)
        self._on_connection_changed()

    def _on_connection_changed(self) -> None:
        conn_id = self.combo_connection.currentData()
        self.combo_account.blockSignals(True)
        self.combo_account.clear()

        if conn_id:
            accounts = self.account_controller.get_accounts_for_connection(conn_id)
            for acc in accounts:
                self.combo_account.addItem(acc.accountName, acc.accountId)

        self.combo_account.blockSignals(False)
        self._on_account_changed()

    def _on_account_changed(self) -> None:
        self.refresh_workers()

    def refresh_workers(self) -> None:
        """Fetches and displays workers for the active connection and account."""
        conn_id = self.combo_connection.currentData()
        acc_id = self.combo_account.currentData()

        if not conn_id or not acc_id:
            self.table.setRowCount(0)
            self.lbl_status.setText("No Cloudflare connection or account selected.")
            return

        self.progress.setVisible(True)
        self.lbl_status.setText(f"Querying workers for account {self.combo_account.currentText()}...")
        self.btn_refresh.setEnabled(False)

        def query_task():
            return self.worker_controller.list_workers(conn_id, acc_id)

        def on_done(workers: List[Dict]):
            self.progress.setVisible(False)
            self.btn_refresh.setEnabled(True)
            self.table.setRowCount(len(workers))
            self.lbl_status.setText(f"Loaded {len(workers)} worker(s).")

            for row, w in enumerate(workers):
                # Name
                name_item = QTableWidgetItem(w["name"])

                # Status
                status_item = QTableWidgetItem(w["status"])
                status_item.setForeground(Qt.darkGreen)

                # Modified
                mod_item = QTableWidgetItem(w["modified_on"])

                # LuciProxy recognition
                lp_text = "LuciProxy Node" if w["is_luciproxy"] else "Generic Worker"
                lp_item = QTableWidgetItem(lp_text)
                if w["is_luciproxy"]:
                    lp_item.setForeground(Qt.blue)

                # Linked D1 (preserves all bindings!)
                d1_item = QTableWidgetItem(w["d1_display"])

                # Installed Version
                ver_item = QTableWidgetItem(w["installed_version"])

                self.table.setItem(row, 0, name_item)
                self.table.setItem(row, 1, status_item)
                self.table.setItem(row, 2, mod_item)
                self.table.setItem(row, 3, lp_item)
                self.table.setItem(row, 4, d1_item)
                self.table.setItem(row, 5, ver_item)

        def on_fail(err: str, exc: Exception):
            self.progress.setVisible(False)
            self.btn_refresh.setEnabled(True)
            self.lbl_status.setText(f"Failed to load workers: {err}")
            QMessageBox.warning(self, "Worker Discovery Failed", f"Could not list workers:\n\n{err}")

        run_in_background(query_task, on_result=on_done, on_error=on_fail)

    def _on_deploy_clicked(self) -> None:
        """Triggers creation of a fresh Worker with a new D1 database."""
        conn_id = self.combo_connection.currentData()
        acc_id = self.combo_account.currentData()

        if not conn_id or not acc_id:
            QMessageBox.warning(self, "No Account Selected", "Please select a Cloudflare connection and account first.")
            return

        confirm = QMessageBox.question(
            self,
            "Deploy New Worker",
            f"Deploy a new LuciProxy Worker to Cloudflare account '{self.combo_account.currentText()}'?\n\n"
            "This will provision a dedicated D1 database and deploy the Worker code from canonical source.",
            QMessageBox.Yes | QMessageBox.No,
            QMessageBox.Yes
        )
        if confirm != QMessageBox.Yes:
            return

        self.progress.setVisible(True)
        self.btn_deploy.setEnabled(False)
        self.btn_update.setEnabled(False)
        self.btn_refresh.setEnabled(False)
        self.lbl_status.setText("Deploying new Worker...")

        def deploy_task():
            def cb(step, total, title, details):
                pass
            return self.worker_controller.create_worker(
                connection_id=conn_id,
                account_id=acc_id,
                progress_callback=cb
            )

        def on_deploy_done(result):
            self.progress.setVisible(False)
            self.btn_deploy.setEnabled(True)
            self.btn_update.setEnabled(True)
            self.btn_refresh.setEnabled(True)

            if result.success:
                QMessageBox.information(
                    self,
                    "Deployment Successful",
                    f"Successfully deployed Worker '{result.worker_name}'!\n\n"
                    f"URL: {result.worker_url}\n"
                    f"Version: v{result.worker_version}\n"
                    f"D1 Database: {result.d1_name} ({result.d1_database_id[:8]}...)\n"
                    f"Master Key: {result.master_key}"
                )
                self.refresh_workers()
            else:
                QMessageBox.critical(
                    self,
                    "Deployment Failed",
                    f"Failed to deploy Worker:\n\n{result.error}"
                )
                self.lbl_status.setText(f"Deployment failed: {result.error}")

        def on_deploy_fail(err: str, exc: Exception):
            self.progress.setVisible(False)
            self.btn_deploy.setEnabled(True)
            self.btn_update.setEnabled(True)
            self.btn_refresh.setEnabled(True)
            QMessageBox.critical(self, "Deployment Failed", f"Deployment error:\n\n{err}")
            self.lbl_status.setText(f"Deployment error: {err}")

        run_in_background(deploy_task, on_result=on_deploy_done, on_error=on_deploy_fail)

    def _on_update_clicked(self) -> None:
        """Triggers in-place update of the selected Worker, strictly preserving D1 database."""
        conn_id = self.combo_connection.currentData()
        acc_id = self.combo_account.currentData()

        if not conn_id or not acc_id:
            QMessageBox.warning(self, "No Account Selected", "Please select a Cloudflare connection and account first.")
            return

        selected_row = self.table.currentRow()
        if selected_row < 0:
            QMessageBox.warning(self, "No Worker Selected", "Please select a Worker from the table to update.")
            return

        worker_name_item = self.table.item(selected_row, 0)
        if not worker_name_item:
            return
        worker_name = worker_name_item.text().strip()

        confirm = QMessageBox.question(
            self,
            "Update Worker",
            f"Update Worker '{worker_name}' to the latest release?\n\n"
            "Safety Guarantee: Your existing D1 database and all stored configuration will be strictly preserved.",
            QMessageBox.Yes | QMessageBox.No,
            QMessageBox.Yes
        )
        if confirm != QMessageBox.Yes:
            return

        self.progress.setVisible(True)
        self.btn_deploy.setEnabled(False)
        self.btn_update.setEnabled(False)
        self.btn_refresh.setEnabled(False)
        self.lbl_status.setText(f"Updating Worker '{worker_name}'...")

        def update_task():
            def cb(step, total, title, details):
                pass
            return self.worker_controller.update_worker(
                connection_id=conn_id,
                account_id=acc_id,
                worker_name=worker_name,
                progress_callback=cb
            )

        def on_update_done(result):
            self.progress.setVisible(False)
            self.btn_deploy.setEnabled(True)
            self.btn_update.setEnabled(True)
            self.btn_refresh.setEnabled(True)

            if result.success:
                QMessageBox.information(
                    self,
                    "Update Successful",
                    f"Successfully updated Worker '{result.worker_name}'!\n\n"
                    f"Version: v{result.worker_version}\n"
                    f"Source Commit: {result.source_revision[:8]}\n"
                    f"D1 Database: Preserved ({result.d1_database_id})"
                )
                self.refresh_workers()
            else:
                QMessageBox.critical(
                    self,
                    "Update Failed",
                    f"Failed to update Worker:\n\n{result.error}"
                )
                self.lbl_status.setText(f"Update failed: {result.error}")

        def on_update_fail(err: str, exc: Exception):
            self.progress.setVisible(False)
            self.btn_deploy.setEnabled(True)
            self.btn_update.setEnabled(True)
            self.btn_refresh.setEnabled(True)
            QMessageBox.critical(self, "Update Failed", f"Update error:\n\n{err}")
            self.lbl_status.setText(f"Update error: {err}")

        run_in_background(update_task, on_result=on_update_done, on_error=on_update_fail)

