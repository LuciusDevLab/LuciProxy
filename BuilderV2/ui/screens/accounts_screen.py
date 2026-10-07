"""
LuciProxy Manager - Accounts & Connections Screen Widget.
Provides full multi-connection and multi-account lifecycle management:
Add Connection, Re-verify, and Logout/Remove Connection with cascading cleanup.
"""

from typing import List, Optional
from PySide6.QtCore import Qt, Signal
from PySide6.QtWidgets import (
    QWidget,
    QVBoxLayout,
    QHBoxLayout,
    QLabel,
    QPushButton,
    QTableWidget,
    QTableWidgetItem,
    QHeaderView,
    QMessageBox,
    QProgressBar,
)

from ..async_worker import run_in_background
from ..controllers.account_controller import AccountController
from ..dialogs.add_connection_dialog import AddConnectionDialog


class AccountsScreen(QWidget):
    """Cloudflare connection manager screen."""

    connections_updated = Signal()

    def __init__(self, controller: AccountController, parent: Optional = None):
        super().__init__(parent)
        self.controller = controller
        self._init_ui()

    def _init_ui(self) -> None:
        layout = QVBoxLayout(self)
        layout.setContentsMargins(32, 32, 32, 32)
        layout.setSpacing(16)

        # Top Bar
        top_layout = QHBoxLayout()
        title = QLabel("Cloudflare Connections")
        title.setStyleSheet("font-size: 22px; font-weight: bold; color: #1e293b;")
        top_layout.addWidget(title)
        top_layout.addStretch()

        self.btn_add = QPushButton("+ Add Connection")
        self.btn_add.setStyleSheet(
            "QPushButton { background-color: #2563eb; color: white; font-weight: bold; padding: 10px 18px; border-radius: 6px; } "
            "QPushButton:hover { background-color: #1d4ed8; }"
        )
        self.btn_add.clicked.connect(self._on_add_connection_clicked)
        top_layout.addWidget(self.btn_add)

        self.btn_refresh = QPushButton("⟳ Refresh")
        self.btn_refresh.clicked.connect(self.load_connections)
        top_layout.addWidget(self.btn_refresh)

        layout.addLayout(top_layout)

        # Status / Progress indicator
        self.progress = QProgressBar()
        self.progress.setRange(0, 0)
        self.progress.setVisible(False)
        layout.addWidget(self.progress)

        # Connections Table
        self.table = QTableWidget()
        self.table.setColumnCount(5)
        self.table.setHorizontalHeaderLabels([
            "Connection Name",
            "Status",
            "Accessible Accounts",
            "Last Verified",
            "Connection ID"
        ])
        self.table.horizontalHeader().setSectionResizeMode(0, QHeaderView.Stretch)
        self.table.horizontalHeader().setSectionResizeMode(1, QHeaderView.ResizeToContents)
        self.table.horizontalHeader().setSectionResizeMode(2, QHeaderView.ResizeToContents)
        self.table.horizontalHeader().setSectionResizeMode(3, QHeaderView.ResizeToContents)
        self.table.horizontalHeader().setSectionResizeMode(4, QHeaderView.ResizeToContents)
        self.table.setSelectionBehavior(QTableWidget.SelectRows)
        self.table.setSelectionMode(QTableWidget.SingleSelection)
        self.table.itemSelectionChanged.connect(self._on_selection_changed)
        layout.addWidget(self.table)

        # Bottom Action Bar
        bottom_layout = QHBoxLayout()
        self.lbl_selected = QLabel("Select a connection to manage.")
        self.lbl_selected.setStyleSheet("color: #64748b; font-size: 13px;")
        bottom_layout.addWidget(self.lbl_selected)
        bottom_layout.addStretch()

        self.btn_verify = QPushButton("⟳ Verify")
        self.btn_verify.setEnabled(False)
        self.btn_verify.clicked.connect(self._on_verify_clicked)
        bottom_layout.addWidget(self.btn_verify)

        self.btn_remove = QPushButton("🗑 Log Out / Remove")
        self.btn_remove.setEnabled(False)
        self.btn_remove.setStyleSheet(
            "QPushButton { background-color: #ef4444; color: white; font-weight: 600; padding: 8px 14px; border-radius: 6px; } "
            "QPushButton:hover { background-color: #dc2626; } "
            "QPushButton:disabled { background-color: #cbd5e1; color: #94a3b8; }"
        )
        self.btn_remove.clicked.connect(self._on_remove_clicked)
        bottom_layout.addWidget(self.btn_remove)

        layout.addLayout(bottom_layout)

    def load_connections(self) -> None:
        """Loads all connections and updates the table."""
        connections = self.controller.list_connections()
        self.table.setRowCount(len(connections))

        for row, conn in enumerate(connections):
            accounts = self.controller.get_accounts_for_connection(conn.connectionId)
            acc_count = len(accounts)

            # Name
            name_item = QTableWidgetItem(conn.displayName)
            name_item.setData(Qt.UserRole, conn.connectionId)

            # Status
            status_text = "● Connected" if conn.status == "connected" else "● Error"
            status_item = QTableWidgetItem(status_text)
            status_item.setForeground(Qt.darkGreen if conn.status == "connected" else Qt.red)

            # Accounts
            acc_text = f"{acc_count} Account" if acc_count == 1 else f"{acc_count} Accounts"
            acc_item = QTableWidgetItem(acc_text)

            # Last Verified
            ver_text = conn.lastVerifiedAt or "Never"
            ver_item = QTableWidgetItem(ver_text)

            # ID
            id_item = QTableWidgetItem(conn.connectionId)

            self.table.setItem(row, 0, name_item)
            self.table.setItem(row, 1, status_item)
            self.table.setItem(row, 2, acc_item)
            self.table.setItem(row, 3, ver_item)
            self.table.setItem(row, 4, id_item)

        self._on_selection_changed()
        self.connections_updated.emit()

    def _get_selected_connection_id(self) -> Optional[str]:
        selected_rows = self.table.selectionModel().selectedRows()
        if not selected_rows:
            return None
        row = selected_rows[0].row()
        item = self.table.item(row, 0)
        return item.data(Qt.UserRole) if item else None

    def _on_selection_changed(self) -> None:
        conn_id = self._get_selected_connection_id()
        has_sel = conn_id is not None
        self.btn_verify.setEnabled(has_sel)
        self.btn_remove.setEnabled(has_sel)

        if has_sel:
            row = self.table.selectionModel().selectedRows()[0].row()
            name = self.table.item(row, 0).text()
            self.lbl_selected.setText(f"Selected: '{name}'")
        else:
            self.lbl_selected.setText("Select a connection to manage.")

    def _on_add_connection_clicked(self) -> None:
        dlg = AddConnectionDialog(self.controller, self)
        dlg.connection_added.connect(lambda _: self.load_connections())
        dlg.exec()

    def _on_verify_clicked(self) -> None:
        conn_id = self._get_selected_connection_id()
        if not conn_id:
            return

        self.progress.setVisible(True)
        self.btn_verify.setEnabled(False)

        def verify_task():
            return self.controller.verify_connection(conn_id)

        def on_done(is_ok):
            self.progress.setVisible(False)
            self.load_connections()
            if is_ok:
                QMessageBox.information(self, "Verification Success", "Connection verified successfully.")
            else:
                QMessageBox.warning(self, "Verification Failed", "Connection status was reported as inactive.")

        def on_fail(err, exc):
            self.progress.setVisible(False)
            self.load_connections()
            QMessageBox.critical(self, "Verification Error", f"Failed to verify connection:\n\n{err}")

        run_in_background(verify_task, on_result=on_done, on_error=on_fail)

    def _on_remove_clicked(self) -> None:
        conn_id = self._get_selected_connection_id()
        if not conn_id:
            return

        row = self.table.selectionModel().selectedRows()[0].row()
        name = self.table.item(row, 0).text()

        confirm = QMessageBox.question(
            self,
            "Confirm Logout",
            f"Are you sure you want to remove connection '{name}'?\n\n"
            "This will delete the API token from the secure credential vault\n"
            "and remove all associated local metadata.",
            QMessageBox.Yes | QMessageBox.No,
            QMessageBox.No
        )
        if confirm == QMessageBox.Yes:
            self.controller.remove_connection(conn_id)
            self.load_connections()
            QMessageBox.information(self, "Connection Removed", f"Connection '{name}' has been logged out and removed.")
