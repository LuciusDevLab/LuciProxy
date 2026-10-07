"""
LuciProxy Manager - D1 Databases Screen Widget.
Provides read-only discovery of Cloudflare D1 databases for the selected account.
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
from ..controllers.d1_controller import D1Controller


class D1Screen(QWidget):
    """D1 databases discovery and inspection screen."""

    def __init__(
        self,
        account_controller: AccountController,
        d1_controller: D1Controller,
        parent: Optional = None
    ):
        super().__init__(parent)
        self.account_controller = account_controller
        self.d1_controller = d1_controller
        self._init_ui()

    def _init_ui(self) -> None:
        layout = QVBoxLayout(self)
        layout.setContentsMargins(32, 32, 32, 32)
        layout.setSpacing(16)

        # Top Bar: Selectors & Refresh
        top_layout = QHBoxLayout()
        title = QLabel("Cloudflare D1 Databases")
        title.setStyleSheet("font-size: 22px; font-weight: bold; color: #1e293b;")
        top_layout.addWidget(title)
        top_layout.addStretch()

        top_layout.addWidget(QLabel("Connection:"))
        self.combo_connection = QComboBox()
        self.combo_connection.setMinimumWidth(180)
        self.combo_connection.currentIndexChanged.connect(self._on_connection_changed)
        top_layout.addWidget(self.combo_connection)

        top_layout.addWidget(QLabel("Account:"))
        self.combo_account = QComboBox()
        self.combo_account.setMinimumWidth(200)
        self.combo_account.currentIndexChanged.connect(self._on_account_changed)
        top_layout.addWidget(self.combo_account)

        self.btn_refresh = QPushButton("⟳ Refresh D1")
        self.btn_refresh.clicked.connect(self.refresh_d1)
        top_layout.addWidget(self.btn_refresh)

        layout.addLayout(top_layout)

        # Progress indicator
        self.progress = QProgressBar()
        self.progress.setRange(0, 0)
        self.progress.setVisible(False)
        layout.addWidget(self.progress)

        self.lbl_status = QLabel("Select an account to load D1 databases.")
        self.lbl_status.setStyleSheet("color: #64748b; font-size: 13px;")
        layout.addWidget(self.lbl_status)

        # D1 Table
        self.table = QTableWidget()
        self.table.setColumnCount(5)
        self.table.setHorizontalHeaderLabels([
            "Database Name",
            "Database UUID",
            "Version",
            "Tables",
            "Created At"
        ])
        self.table.horizontalHeader().setSectionResizeMode(0, QHeaderView.ResizeToContents)
        self.table.horizontalHeader().setSectionResizeMode(1, QHeaderView.Stretch)
        self.table.horizontalHeader().setSectionResizeMode(2, QHeaderView.ResizeToContents)
        self.table.horizontalHeader().setSectionResizeMode(3, QHeaderView.ResizeToContents)
        self.table.horizontalHeader().setSectionResizeMode(4, QHeaderView.ResizeToContents)
        self.table.setSelectionBehavior(QTableWidget.SelectRows)
        layout.addWidget(self.table)

    def populate_connections(self) -> None:
        """Populates connection selector."""
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
        self.refresh_d1()

    def refresh_d1(self) -> None:
        """Fetches and displays D1 databases for active account."""
        conn_id = self.combo_connection.currentData()
        acc_id = self.combo_account.currentData()

        if not conn_id or not acc_id:
            self.table.setRowCount(0)
            self.lbl_status.setText("No connection or account selected.")
            return

        self.progress.setVisible(True)
        self.lbl_status.setText(f"Querying D1 databases for account {self.combo_account.currentText()}...")
        self.btn_refresh.setEnabled(False)

        def query_task():
            return self.d1_controller.list_d1_databases(conn_id, acc_id)

        def on_done(databases: List[Dict]):
            self.progress.setVisible(False)
            self.btn_refresh.setEnabled(True)
            self.table.setRowCount(len(databases))
            self.lbl_status.setText(f"Loaded {len(databases)} D1 database(s).")

            for row, db in enumerate(databases):
                self.table.setItem(row, 0, QTableWidgetItem(db["name"]))
                self.table.setItem(row, 1, QTableWidgetItem(db["uuid"]))
                self.table.setItem(row, 2, QTableWidgetItem(db["version"]))
                self.table.setItem(row, 3, QTableWidgetItem(str(db["num_tables"])))
                self.table.setItem(row, 4, QTableWidgetItem(db["created_at"]))

        def on_fail(err: str, exc: Exception):
            self.progress.setVisible(False)
            self.btn_refresh.setEnabled(True)
            self.lbl_status.setText(f"Failed to load D1: {err}")
            QMessageBox.warning(self, "D1 Discovery Failed", f"Could not list D1 databases:\n\n{err}")

        run_in_background(query_task, on_result=on_done, on_error=on_fail)
