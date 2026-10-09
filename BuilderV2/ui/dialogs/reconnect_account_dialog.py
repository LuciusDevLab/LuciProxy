"""
LuciProxy Manager - Reconnect Account Credential Dialog.
Allows users to re-supply and verify a Cloudflare API Token for an existing connection
when credentials in the platform secure vault are missing or need updating.
Tokens are verified against Cloudflare API and saved strictly into platform secure vault.
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


class ReconnectAccountDialog(QDialog):
    """Modal dialog for rehydrating an API token for an existing connection."""

    reconnected = Signal()  # Emitted when token is successfully verified and stored

    def __init__(
        self,
        connection_id: str,
        connection_name: str,
        controller: AccountController,
        parent: Optional = None
    ):
        super().__init__(parent)
        self.connection_id = connection_id
        self.connection_name = connection_name or "Cloudflare Connection"
        self.controller = controller
        self.generated_token_name = NamingPolicy.generate_token_name()

        self.setWindowTitle("Reconnect Cloudflare Account")
        self.setFixedSize(540, 440)
        self.setModal(True)
        self.setStyleSheet(DARK_DIALOG_STYLE)
        self._init_ui()

    def _init_ui(self) -> None:
        layout = QVBoxLayout(self)
        layout.setContentsMargins(28, 28, 28, 28)
        layout.setSpacing(14)

        # Title & instructions
        title = QLabel("Reconnect API Credential")
        title.setStyleSheet("font-size: 18px; font-weight: bold; color: #ffffff;")
        layout.addWidget(title)

        desc = QLabel(
            f"Supply a Cloudflare API Token for connection <b>{self.connection_name}</b> "
            f"({self.connection_id}). Tokens are securely preserved in Windows Credential Manager."
        )
        desc.setWordWrap(True)
        desc.setStyleSheet("color: #a1a1aa; font-size: 12px; line-height: 1.4;")
        layout.addWidget(desc)

        # Token helper link button
        btn_create_token = QPushButton("🔗 Create Cloudflare API Token (opens Cloudflare dashboard)")
        btn_create_token.setObjectName("btnLink")
        btn_create_token.setCursor(Qt.PointingHandCursor)
        btn_create_token.clicked.connect(self._open_token_creation_url)
        layout.addWidget(btn_create_token)

        # Token field
        lbl_token = QLabel("Cloudflare API Token *")
        lbl_token.setStyleSheet("font-weight: bold; font-size: 13px; color: #ffffff; margin-top: 6px;")
        layout.addWidget(lbl_token)

        token_input_layout = QHBoxLayout()
        token_input_layout.setSpacing(8)

        self.txt_token = QLineEdit()
        self.txt_token.setEchoMode(QLineEdit.Password)
        self.txt_token.setPlaceholderText("Enter or paste Cloudflare API token")
        token_input_layout.addWidget(self.txt_token)

        self.btn_toggle_mask = QPushButton("👁")
        self.btn_toggle_mask.setCheckable(True)
        self.btn_toggle_mask.setFixedWidth(40)
        self.btn_toggle_mask.setToolTip("Toggle token masking")
        self.btn_toggle_mask.clicked.connect(self._toggle_token_visibility)
        token_input_layout.addWidget(self.btn_toggle_mask)

        self.btn_paste = QPushButton("Paste")
        self.btn_paste.setFixedWidth(64)
        self.btn_paste.clicked.connect(self._paste_from_clipboard)
        token_input_layout.addWidget(self.btn_paste)

        layout.addLayout(token_input_layout)

        # Progress indicator
        self.progress = QProgressBar()
        self.progress.setRange(0, 0)
        self.progress.setFixedHeight(4)
        self.progress.setVisible(False)
        layout.addWidget(self.progress)

        # Status feedback label
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

        self.btn_reconnect = QPushButton("Verify & Reconnect")
        self.btn_reconnect.setObjectName("btnPrimary")
        self.btn_reconnect.setCursor(Qt.PointingHandCursor)
        self.btn_reconnect.clicked.connect(self._on_reconnect_clicked)
        btn_layout.addWidget(self.btn_reconnect)

        layout.addLayout(btn_layout)

    def _open_token_creation_url(self) -> None:
        url = NamingPolicy.build_token_creation_url(self.generated_token_name)
        QDesktopServices.openUrl(QUrl(url))

    def _paste_from_clipboard(self) -> None:
        clipboard = QApplication.clipboard()
        text = clipboard.text().strip()
        if text:
            self.txt_token.setText(text)

    def _toggle_token_visibility(self) -> None:
        if self.btn_toggle_mask.isChecked():
            self.txt_token.setEchoMode(QLineEdit.Normal)
            self.btn_toggle_mask.setText("🔒")
        else:
            self.txt_token.setEchoMode(QLineEdit.Password)
            self.btn_toggle_mask.setText("👁")

    def _on_reconnect_clicked(self) -> None:
        token = self.txt_token.text().strip()
        if not token:
            self.lbl_status.setText("Cloudflare API Token is required.")
            self.lbl_status.setStyleSheet("color: #ef4444; font-size: 12px;")
            return

        self.btn_reconnect.setEnabled(False)
        self.btn_cancel.setEnabled(False)
        self.btn_paste.setEnabled(False)
        self.txt_token.setEnabled(False)
        self.progress.setVisible(True)
        self.lbl_status.setText("Verifying token with Cloudflare API...")
        self.lbl_status.setStyleSheet("color: #38bdf8; font-size: 12px;")

        run_in_background(
            fn=lambda: self.controller.reconnect_connection(self.connection_id, token),
            on_result=self._on_success,
            on_error=self._on_error,
        )

    def _on_success(self, _: bool) -> None:
        self.progress.setVisible(False)
        self.lbl_status.setText("✓ Connection reconnected and verified successfully!")
        self.lbl_status.setStyleSheet("color: #22c55e; font-size: 12px; font-weight: bold;")
        self.reconnected.emit()
        self.accept()

    def _on_error(self, err_msg: str, err: Optional[Exception] = None) -> None:
        self.progress.setVisible(False)
        self.btn_reconnect.setEnabled(True)
        self.btn_cancel.setEnabled(True)
        self.btn_paste.setEnabled(True)
        self.txt_token.setEnabled(True)
        display_msg = str(err) if err is not None else str(err_msg)
        self.lbl_status.setText(f"Reconnection failed: {display_msg}")
        self.lbl_status.setStyleSheet("color: #ef4444; font-size: 12px;")
