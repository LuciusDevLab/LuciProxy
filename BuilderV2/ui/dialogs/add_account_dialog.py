"""
LuciProxy Manager - Add Cloudflare Account Dialog.
Enforces credential security: API token is entered with password masking,
pasted easily, verified via background thread, stored strictly in platform vault, and wiped from memory.
Provides direct link to Cloudflare API token creation with required permissions.
"""

from typing import Optional
from PySide6.QtCore import Qt, Signal, QUrl
from PySide6.QtGui import QDesktopServices
from PySide6.QtWidgets import (
    QDialog,
    QVBoxLayout,
    QHBoxLayout,
    QLabel,
    QLineEdit,
    QPushButton,
    QProgressBar,
    QApplication,
    QFrame,
)

from ..async_worker import run_in_background
from ..controllers.account_controller import AccountController
from ...deployment.naming import NamingPolicy

DARK_DIALOG_STYLE = """
QDialog {
    background-color: #0f0f11;
    color: #ffffff;
}
QLabel {
    color: #ffffff;
    font-size: 13px;
}
QLineEdit {
    background-color: #18181b;
    color: #ffffff;
    border: 1px solid #27272a;
    border-radius: 6px;
    padding: 8px 12px;
    font-size: 13px;
    selection-background-color: #2563eb;
}
QLineEdit:focus {
    border: 1px solid #3b82f6;
}
QPushButton {
    background-color: #27272a;
    color: #ffffff;
    border: 1px solid #3f3f46;
    border-radius: 6px;
    padding: 8px 14px;
    font-size: 13px;
    font-weight: 500;
}
QPushButton:hover {
    background-color: #3f3f46;
}
QPushButton:pressed {
    background-color: #52525b;
}
QPushButton#btnPrimary {
    background-color: #2563eb;
    border: 1px solid #1d4ed8;
    color: #ffffff;
    font-weight: bold;
}
QPushButton#btnPrimary:hover {
    background-color: #1d4ed8;
}
QPushButton#btnPrimary:disabled {
    background-color: #1e3a8a;
    color: #93c5fd;
}
QPushButton#btnLink {
    background-color: transparent;
    border: none;
    color: #38bdf8;
    text-align: left;
    padding: 2px 4px;
    font-size: 12px;
    text-decoration: underline;
}
QPushButton#btnLink:hover {
    color: #7dd3fc;
}
QProgressBar {
    background-color: #18181b;
    border: 1px solid #27272a;
    border-radius: 4px;
    text-align: center;
    color: #ffffff;
}
QProgressBar::chunk {
    background-color: #2563eb;
    border-radius: 3px;
}
"""


class AddAccountDialog(QDialog):
    """Modal dialog for onboarding a Cloudflare account."""

    account_added = Signal(object)  # Emits ConnectionRecord on success

    def __init__(self, controller: AccountController, parent: Optional = None):
        super().__init__(parent)
        self.controller = controller
        self.generated_token_name = NamingPolicy.generate_token_name()
        self.setWindowTitle("Add Cloudflare Account")
        self.setFixedSize(540, 480)
        self.setModal(True)
        self.setStyleSheet(DARK_DIALOG_STYLE)
        self._init_ui()

    def _init_ui(self) -> None:
        layout = QVBoxLayout(self)
        layout.setContentsMargins(28, 28, 28, 28)
        layout.setSpacing(14)

        # Title & instructions
        title = QLabel("Connect Cloudflare Account")
        title.setStyleSheet("font-size: 18px; font-weight: bold; color: #ffffff;")
        layout.addWidget(title)

        desc = QLabel(
            "Enter a Cloudflare API Token with permissions for Workers (edit), "
            "D1 (edit), and Account Settings (read)."
        )
        desc.setWordWrap(True)
        desc.setStyleSheet("color: #a1a1aa; font-size: 12px; line-height: 1.4;")
        layout.addWidget(desc)

        # Suggested neutral token name preview
        token_name_frame = QFrame()
        token_name_frame.setStyleSheet(
            "background-color: #18181b; border: 1px solid #27272a; border-radius: 6px; padding: 10px;"
        )
        token_name_layout = QVBoxLayout(token_name_frame)
        token_name_layout.setContentsMargins(10, 8, 10, 8)
        token_name_layout.setSpacing(4)

        lbl_token_title = QLabel(f"Suggested Token Name: <b style='color: #38bdf8;'>{self.generated_token_name}</b>")
        lbl_token_title.setTextFormat(Qt.RichText)
        token_name_layout.addWidget(lbl_token_title)

        lbl_token_desc = QLabel("Opening Cloudflare below will pre-fill this neutral randomized name in the token creator.")
        lbl_token_desc.setStyleSheet("color: #71717a; font-size: 11px;")
        token_name_layout.addWidget(lbl_token_desc)
        layout.addWidget(token_name_frame)

        # Token helper link button
        btn_create_token = QPushButton("🔗 Create Cloudflare API Token (opens Cloudflare dashboard)")
        btn_create_token.setObjectName("btnLink")
        btn_create_token.setCursor(Qt.PointingHandCursor)
        btn_create_token.clicked.connect(self._open_token_creation_url)
        layout.addWidget(btn_create_token)

        # Connection / Account Friendly Name
        lbl_name = QLabel("Account / Connection Label (Optional):")
        layout.addWidget(lbl_name)

        self.txt_name = QLineEdit()
        self.txt_name.setPlaceholderText(f"Default: {self.generated_token_name}")
        layout.addWidget(self.txt_name)

        # Token input with Paste and Toggle Mask
        lbl_token = QLabel("Cloudflare API Token:")
        layout.addWidget(lbl_token)

        token_row = QHBoxLayout()
        token_row.setSpacing(8)

        self.txt_token = QLineEdit()
        self.txt_token.setEchoMode(QLineEdit.Password)
        self.txt_token.setPlaceholderText("Paste cfut_... or custom API token here")
        token_row.addWidget(self.txt_token, stretch=1)

        self.btn_paste = QPushButton("Paste")
        self.btn_paste.setCursor(Qt.PointingHandCursor)
        self.btn_paste.clicked.connect(self._paste_from_clipboard)
        token_row.addWidget(self.btn_paste)

        self.btn_toggle_mask = QPushButton("👁")
        self.btn_toggle_mask.setFixedWidth(38)
        self.btn_toggle_mask.setCheckable(True)
        self.btn_toggle_mask.clicked.connect(self._toggle_token_visibility)
        token_row.addWidget(self.btn_toggle_mask)

        layout.addLayout(token_row)

        # Progress / Status
        self.progress = QProgressBar()
        self.progress.setRange(0, 0)  # Indeterminate
        self.progress.setVisible(False)
        layout.addWidget(self.progress)

        self.lbl_status = QLabel("")
        self.lbl_status.setWordWrap(True)
        self.lbl_status.setStyleSheet("font-size: 12px; color: #38bdf8;")
        layout.addWidget(self.lbl_status)

        layout.addStretch()

        # Action buttons
        btn_layout = QHBoxLayout()
        btn_layout.setSpacing(12)
        btn_layout.addStretch()

        self.btn_cancel = QPushButton("Cancel")
        self.btn_cancel.clicked.connect(self.reject)
        btn_layout.addWidget(self.btn_cancel)

        self.btn_verify = QPushButton("Verify & Add")
        self.btn_verify.setObjectName("btnPrimary")
        self.btn_verify.setCursor(Qt.PointingHandCursor)
        self.btn_verify.clicked.connect(self._on_verify_clicked)
        btn_layout.addWidget(self.btn_verify)

        layout.addLayout(btn_layout)

    def _open_token_creation_url(self) -> None:
        """Opens the official Cloudflare token generation page with required scope and dynamic neutral name."""
        url = NamingPolicy.build_token_creation_url(self.generated_token_name)
        QDesktopServices.openUrl(QUrl(url))

    def _paste_from_clipboard(self) -> None:
        """Pastes token directly from system clipboard."""
        clipboard = QApplication.clipboard()
        text = clipboard.text().strip()
        if text:
            self.txt_token.setText(text)

    def _toggle_token_visibility(self) -> None:
        """Toggles masking on the token input field."""
        if self.btn_toggle_mask.isChecked():
            self.txt_token.setEchoMode(QLineEdit.Normal)
            self.btn_toggle_mask.setText("🔒")
        else:
            self.txt_token.setEchoMode(QLineEdit.Password)
            self.btn_toggle_mask.setText("👁")

    def _on_verify_clicked(self) -> None:
        name = self.txt_name.text().strip()
        token = self.txt_token.text().strip()

        if not token:
            self.lbl_status.setText("Cloudflare API Token is required.")
            self.lbl_status.setStyleSheet("color: #ef4444; font-size: 12px;")
            return

        if not name:
            name = self.generated_token_name

        # Lock UI during validation
        self.btn_verify.setEnabled(False)
        self.btn_cancel.setEnabled(False)
        self.btn_paste.setEnabled(False)
        self.txt_token.setEnabled(False)
        self.txt_name.setEnabled(False)
        self.progress.setVisible(True)
        self.lbl_status.setText("Verifying token with Cloudflare API...")
        self.lbl_status.setStyleSheet("color: #38bdf8; font-size: 12px;")

        run_in_background(
            fn=lambda: self.controller.add_connection(name, token),
            on_result=self._on_success,
            on_error=self._on_error,
        )

    def _on_success(self, conn_record: object) -> None:
        self.progress.setVisible(False)
        self.lbl_status.setText("✓ Account verified and connected successfully!")
        self.lbl_status.setStyleSheet("color: #22c55e; font-size: 12px; font-weight: bold;")
        self.account_added.emit(conn_record)
        self.accept()

    def _on_error(self, err_msg: str, err: Optional[Exception] = None) -> None:
        self.progress.setVisible(False)
        self.btn_verify.setEnabled(True)
        self.btn_cancel.setEnabled(True)
        self.btn_paste.setEnabled(True)
        self.txt_token.setEnabled(True)
        self.txt_name.setEnabled(True)
        display_msg = str(err) if err is not None else str(err_msg)
        self.lbl_status.setText(f"Verification failed: {display_msg}")
        self.lbl_status.setStyleSheet("color: #ef4444; font-size: 12px;")
