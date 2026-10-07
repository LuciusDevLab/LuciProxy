"""
LuciProxy Manager - Add Cloudflare Connection Dialog.
Enforces credential security: API token is entered with password masking,
verified via background thread, stored strictly in platform vault, and wiped from memory.
"""

from typing import Optional
from PySide6.QtCore import Qt, Signal
from PySide6.QtWidgets import (
    QDialog,
    QVBoxLayout,
    QHBoxLayout,
    QLabel,
    QLineEdit,
    QPushButton,
    QProgressBar,
    QMessageBox,
)

from ..async_worker import run_in_background
from ..controllers.account_controller import AccountController


class AddConnectionDialog(QDialog):
    """Modal dialog for onboarding a Cloudflare connection."""

    connection_added = Signal(object)  # Emits ConnectionRecord on success

    def __init__(self, controller: AccountController, parent: Optional = None):
        super().__init__(parent)
        self.controller = controller
        self.setWindowTitle("Add Cloudflare Connection")
        self.setFixedSize(480, 340)
        self.setModal(True)
        self._init_ui()

    def _init_ui(self) -> None:
        layout = QVBoxLayout(self)
        layout.setContentsMargins(24, 24, 24, 24)
        layout.setSpacing(16)

        # Title & instructions
        title = QLabel("Connect Cloudflare Account")
        title.setStyleSheet("font-size: 18px; font-weight: bold; color: #1e293b;")
        layout.addWidget(title)

        desc = QLabel(
            "Enter a friendly name and an API Token with permissions for Workers, D1, and Account Settings."
        )
        desc.setWordWrap(True)
        desc.setStyleSheet("color: #64748b; font-size: 13px;")
        layout.addWidget(desc)

        # Name input
        layout.addWidget(QLabel("Connection Display Name:"))
        self.txt_name = QLineEdit()
        self.txt_name.setPlaceholderText("e.g. My Primary Cloudflare Account")
        layout.addWidget(self.txt_name)

        # Token input with masking and reveal toggle
        layout.addWidget(QLabel("Cloudflare API Token:"))
        token_layout = QHBoxLayout()
        self.txt_token = QLineEdit()
        self.txt_token.setEchoMode(QLineEdit.Password)
        self.txt_token.setPlaceholderText("Paste cfut_... or custom API token here")
        token_layout.addWidget(self.txt_token)

        self.btn_toggle_mask = QPushButton("👁")
        self.btn_toggle_mask.setFixedWidth(36)
        self.btn_toggle_mask.setCheckable(True)
        self.btn_toggle_mask.clicked.connect(self._toggle_token_visibility)
        token_layout.addWidget(self.btn_toggle_mask)
        layout.addLayout(token_layout)

        # Progress / Status
        self.progress = QProgressBar()
        self.progress.setRange(0, 0)  # Indeterminate
        self.progress.setVisible(False)
        layout.addWidget(self.progress)

        self.lbl_status = QLabel("")
        self.lbl_status.setStyleSheet("font-size: 12px; color: #2563eb;")
        layout.addWidget(self.lbl_status)

        # Action buttons
        btn_layout = QHBoxLayout()
        btn_layout.addStretch()

        self.btn_cancel = QPushButton("Cancel")
        self.btn_cancel.clicked.connect(self.reject)
        btn_layout.addWidget(self.btn_cancel)

        self.btn_verify = QPushButton("Verify & Save")
        self.btn_verify.setStyleSheet(
            "QPushButton { background-color: #2563eb; color: white; font-weight: bold; padding: 8px 16px; border-radius: 6px; } "
            "QPushButton:hover { background-color: #1d4ed8; }"
        )
        self.btn_verify.clicked.connect(self._on_verify_clicked)
        btn_layout.addWidget(self.btn_verify)

        layout.addLayout(btn_layout)

    def _toggle_token_visibility(self, checked: bool) -> None:
        if checked:
            self.txt_token.setEchoMode(QLineEdit.Normal)
        else:
            self.txt_token.setEchoMode(QLineEdit.Password)

    def _on_verify_clicked(self) -> None:
        name = self.txt_name.text().strip()
        token = self.txt_token.text().strip()

        if not name:
            QMessageBox.warning(self, "Validation Error", "Please provide a connection display name.")
            self.txt_name.setFocus()
            return

        if not token:
            QMessageBox.warning(self, "Validation Error", "Please provide a Cloudflare API Token.")
            self.txt_token.setFocus()
            return

        # Disable inputs during network verification
        self.btn_verify.setEnabled(False)
        self.btn_cancel.setEnabled(False)
        self.txt_name.setEnabled(False)
        self.txt_token.setEnabled(False)
        self.progress.setVisible(True)
        self.lbl_status.setText("Verifying token and discovering accounts...")

        # Run verification in background thread to avoid freezing UI
        run_in_background(
            self.controller.add_connection,
            on_result=self._on_success,
            on_error=self._on_error,
            display_name=name,
            token=token,
        )

    def _on_success(self, conn_record) -> None:
        # Securely wipe token from UI field immediately
        self.txt_token.clear()
        self.progress.setVisible(False)
        self.connection_added.emit(conn_record)
        QMessageBox.information(
            self,
            "Connection Saved",
            f"Successfully connected '{conn_record.displayName}'.\n"
            "API token stored securely in the platform credential vault."
        )
        self.accept()

    def _on_error(self, err_msg: str, exc: Exception) -> None:
        self.progress.setVisible(False)
        self.btn_verify.setEnabled(True)
        self.btn_cancel.setEnabled(True)
        self.txt_name.setEnabled(True)
        self.txt_token.setEnabled(True)
        self.lbl_status.setText("")

        QMessageBox.critical(
            self,
            "Verification Failed",
            f"Failed to connect Cloudflare account:\n\n{err_msg}"
        )
