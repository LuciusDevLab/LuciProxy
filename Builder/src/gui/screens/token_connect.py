"""
LuciProxy Builder - Screen 2: Cloudflare Token Connection Screen.
Guides the user to create a preconfigured Cloudflare API token and verifies credentials securely.
"""

from PySide6.QtCore import Qt, QUrl, Signal
from PySide6.QtGui import QDesktopServices
from PySide6.QtWidgets import (
    QWidget, QVBoxLayout, QHBoxLayout, QLabel, QPushButton, QLineEdit, QFrame, QProgressBar
)

from ...auth.token_validator import build_token_creation_url, TOKEN_TEMPLATE_BASE_URL

# Preconfigured Cloudflare Token creation portal base URL
PRECONFIGURED_TOKEN_PORTAL_BASE_URL = TOKEN_TEMPLATE_BASE_URL
OFFICIAL_TOKEN_PORTAL_BASE_URL = TOKEN_TEMPLATE_BASE_URL
PRECONFIGURED_TOKEN_PORTAL_URL = TOKEN_TEMPLATE_BASE_URL
OFFICIAL_TOKEN_PORTAL_URL = TOKEN_TEMPLATE_BASE_URL


class TokenConnectScreen(QWidget):
    """Token creation guide, masked input, and API verification screen."""

    back_clicked = Signal()
    verify_token_clicked = Signal(str)

    def __init__(self, parent=None):
        super().__init__(parent)
        self.last_generated_token_url: str = ""
        self.last_generated_token_name: str = ""
        self._init_ui()

    def _init_ui(self):
        layout = QVBoxLayout(self)
        layout.setAlignment(Qt.AlignmentFlag.AlignCenter)
        layout.setContentsMargins(30, 20, 30, 20)

        card = QFrame()
        card.setObjectName("card")
        card.setMinimumWidth(580)
        card.setMaximumWidth(700)
        card_layout = QVBoxLayout(card)
        card_layout.setContentsMargins(28, 28, 28, 28)
        card_layout.setSpacing(16)

        # Header
        title = QLabel("Connect Cloudflare")
        title.setObjectName("title")
        subtitle = QLabel("Deploy directly to your Cloudflare account with a secure API Token.")
        subtitle.setObjectName("subtitle")
        subtitle.setWordWrap(True)

        card_layout.addWidget(title)
        card_layout.addWidget(subtitle)

        # 1. Prominent Button: Create Cloudflare API Token
        self.btn_open_portal = QPushButton("Create Cloudflare API Token")
        self.btn_open_portal.setObjectName("primary_button")
        self.btn_open_portal.setCursor(Qt.CursorShape.PointingHandCursor)
        self.btn_open_portal.clicked.connect(self._open_cloudflare_portal)
        card_layout.addWidget(self.btn_open_portal)

        # 2. Simple User-Facing Instructions directly below the button
        self.lbl_instructions = QLabel(
            "Click the button below to open Cloudflare.\n"
            "Create the token, copy the token value, then return here and paste it."
        )
        self.lbl_instructions.setWordWrap(True)
        self.lbl_instructions.setStyleSheet("color: #9ca3af; font-size: 13px; line-height: 1.4;")
        card_layout.addWidget(self.lbl_instructions)

        # Optional expandable "What is this?" section for technical users
        self.btn_help_toggle = QPushButton("▸ What is this?")
        self.btn_help_toggle.setStyleSheet(
            "background: transparent; color: #60a5fa; border: none; text-align: left; font-size: 11px; padding: 0;"
        )
        self.btn_help_toggle.setCursor(Qt.CursorShape.PointingHandCursor)
        self.btn_help_toggle.clicked.connect(self._toggle_help)
        card_layout.addWidget(self.btn_help_toggle)

        self.help_frame = QFrame()
        self.help_frame.setStyleSheet(
            "QFrame { background-color: #171920; border: 1px solid #2d333f; border-radius: 6px; padding: 10px; }"
        )
        self.help_frame.setVisible(False)
        help_layout = QVBoxLayout(self.help_frame)
        help_layout.setContentsMargins(10, 8, 10, 8)
        help_layout.setSpacing(6)

        help_title = QLabel("<b>Preconfigured Cloudflare Permissions:</b>")
        help_title.setStyleSheet("color: #93c5fd; font-size: 12px;")
        help_layout.addWidget(help_title)

        p1 = QLabel("☑ <b>Workers Scripts:</b> Edit <span style='color:#9ca3af;'>— Upload & activate Edge Workers</span>")
        p2 = QLabel("☑ <b>D1:</b> Edit / Write <span style='color:#9ca3af;'>— Provision SQLite databases & tables (D1 Write)</span>")
        p3 = QLabel("☑ <b>Account Settings:</b> Read <span style='color:#9ca3af;'>— Discover account identifiers</span>")

        for p in (p1, p2, p3):
            p.setTextFormat(Qt.TextFormat.RichText)
            help_layout.addWidget(p)

        card_layout.addWidget(self.help_frame)

        # 3. Token Input
        lbl_input = QLabel("Cloudflare API Token")
        lbl_input.setObjectName("section_heading")
        card_layout.addWidget(lbl_input)

        input_row = QHBoxLayout()
        self.txt_token = QLineEdit()
        self.txt_token.setEchoMode(QLineEdit.EchoMode.Password)
        self.txt_token.setPlaceholderText("Paste your Cloudflare API Token")
        self.txt_token.textChanged.connect(self._on_token_text_changed)


        self.btn_toggle_mask = QPushButton("Show Token")
        self.btn_toggle_mask.setObjectName("secondary_button")
        self.btn_toggle_mask.setFixedWidth(100)
        self.btn_toggle_mask.clicked.connect(self._toggle_mask)

        input_row.addWidget(self.txt_token)
        input_row.addWidget(self.btn_toggle_mask)
        card_layout.addLayout(input_row)

        # Status and Progress
        self.lbl_status = QLabel("")
        self.lbl_status.setWordWrap(True)
        self.lbl_status.setStyleSheet("color: #60a5fa; font-size: 12px;")
        self.lbl_status.setVisible(False)
        card_layout.addWidget(self.lbl_status)

        self.prog_bar = QProgressBar()
        self.prog_bar.setRange(0, 0)  # indeterminate
        self.prog_bar.setVisible(False)
        card_layout.addWidget(self.prog_bar)

        # Action Buttons
        btn_row = QHBoxLayout()
        self.btn_back = QPushButton("Back")
        self.btn_back.setObjectName("secondary_button")
        self.btn_back.clicked.connect(self.back_clicked.emit)

        self.btn_try_again = QPushButton("Try Again")
        self.btn_try_again.setObjectName("secondary_button")
        self.btn_try_again.setVisible(False)
        self.btn_try_again.clicked.connect(self._on_try_again_clicked)

        self.btn_verify = QPushButton("Verify Token")
        self.btn_verify.setObjectName("primary_button")
        self.btn_verify.setEnabled(False)
        self.btn_verify.clicked.connect(self._on_verify_clicked)

        btn_row.addWidget(self.btn_back)
        btn_row.addWidget(self.btn_try_again)
        btn_row.addStretch()
        btn_row.addWidget(self.btn_verify)
        card_layout.addLayout(btn_row)

        layout.addWidget(card)

    def _open_cloudflare_portal(self):
        """
        Generates a fresh neutral random Token name, constructs the dynamic Cloudflare
        Token creation template URL, and opens the default browser.
        """
        from urllib.parse import unquote_plus
        url_str = build_token_creation_url()
        self.last_generated_token_url = url_str
        if "&name=" in url_str:
            self.last_generated_token_name = unquote_plus(url_str.split("&name=")[-1])
        QDesktopServices.openUrl(QUrl(url_str))
        self.lbl_status.setText("Cloudflare Token setup opened in your browser.")
        self.lbl_status.setStyleSheet("color: #60a5fa; font-size: 12px;")
        self.lbl_status.setVisible(True)

    def _toggle_help(self):
        """Toggles visibility of optional 'What is this?' technical explanation."""
        is_visible = not self.help_frame.isVisible()
        self.help_frame.setVisible(is_visible)
        self.btn_help_toggle.setText("▾ What is this?" if is_visible else "▸ What is this?")

    def _toggle_mask(self):
        """Toggles password masking locally without exposing or storing plaintext."""
        if self.txt_token.echoMode() == QLineEdit.EchoMode.Password:
            self.txt_token.setEchoMode(QLineEdit.EchoMode.Normal)
            self.btn_toggle_mask.setText("Hide Token")
        else:
            self.txt_token.setEchoMode(QLineEdit.EchoMode.Password)
            self.btn_toggle_mask.setText("Show Token")

    def _on_token_text_changed(self, text: str):
        self.btn_verify.setEnabled(bool(text.strip()))
        if self.btn_try_again.isVisible():
            self.btn_try_again.setVisible(False)
            self.lbl_status.setVisible(False)

    def _on_verify_clicked(self):
        token = self.txt_token.text().strip()
        if not token:
            return
        self.set_loading(True, "Checking your Cloudflare connection...")
        self.verify_token_clicked.emit(token)

    def _on_try_again_clicked(self):
        """Resets error state and allows re-attempting verification."""
        self.lbl_status.setVisible(False)
        self.btn_try_again.setVisible(False)
        self.txt_token.setEnabled(True)
        self.txt_token.setFocus()
        if self.txt_token.text().strip():
            self._on_verify_clicked()

    def set_loading(self, loading: bool, message: str = ""):
        self.txt_token.setEnabled(not loading)
        self.btn_verify.setEnabled(not loading and bool(self.txt_token.text().strip()))
        self.btn_back.setEnabled(not loading)
        self.btn_try_again.setVisible(False)
        self.prog_bar.setVisible(loading)
        self.lbl_status.setText(message)
        self.lbl_status.setVisible(bool(message))
        self.lbl_status.setStyleSheet("color: #60a5fa; font-size: 12px;")

    def show_success(self, message: str = "✓ Cloudflare connected"):
        self.set_loading(False)
        self.lbl_status.setText(message)
        self.lbl_status.setStyleSheet("color: #34d399; font-size: 13px; font-weight: bold;")
        self.lbl_status.setVisible(True)
        self.btn_try_again.setVisible(False)

    def show_error(self, message: str):
        self.set_loading(False)
        self.lbl_status.setText(f"Cloudflare token could not be verified.\n{message}")
        self.lbl_status.setStyleSheet("color: #f87171; font-size: 12px;")
        self.lbl_status.setVisible(True)
        self.btn_try_again.setVisible(True)

    def clear_input(self):
        self.txt_token.clear()
        self.lbl_status.clear()
        self.lbl_status.setVisible(False)
        self.prog_bar.setVisible(False)
        self.btn_try_again.setVisible(False)
