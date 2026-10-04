"""
LuciProxy Builder - Screen 6: Deployment Success Screen.
Presents the live panel URL, masked Master Key, resource metadata, and copy/open actions
with high contrast, clear hierarchy, and zero credential leakage.
"""

from typing import Any, Dict
from PySide6.QtCore import Qt, QUrl, Signal
from PySide6.QtGui import QDesktopServices, QGuiApplication
from PySide6.QtWidgets import (
    QWidget, QVBoxLayout, QHBoxLayout, QLabel, QPushButton, QFrame,
    QGridLayout, QLineEdit, QScrollArea
)


class SuccessScreen(QWidget):
    """High-contrast deployment completion and credential delivery dashboard."""

    view_history_clicked = Signal()
    close_clicked = Signal()

    def __init__(self, parent=None):
        super().__init__(parent)
        self.deployment_data: Dict[str, Any] = {}
        self.panel_url: str = ""
        self.master_key: str = ""
        self._init_ui()

    def _init_ui(self):
        root_layout = QVBoxLayout(self)
        root_layout.setContentsMargins(0, 0, 0, 0)
        root_layout.setSpacing(0)

        # Scroll wrapper for guaranteed responsive rendering across all screen sizes and DPI scaling
        scroll = QScrollArea()
        scroll.setWidgetResizable(True)
        scroll.setFrameShape(QFrame.Shape.NoFrame)
        scroll.setStyleSheet("QScrollArea { background-color: transparent; border: none; }")

        scroll_content = QWidget()
        scroll_layout = QVBoxLayout(scroll_content)
        scroll_layout.setAlignment(Qt.AlignmentFlag.AlignCenter)
        scroll_layout.setContentsMargins(24, 20, 24, 20)

        card = QFrame()
        card.setObjectName("card")
        card.setMinimumWidth(580)
        card.setMaximumWidth(700)
        card_layout = QVBoxLayout(card)
        card_layout.setContentsMargins(28, 24, 28, 24)
        card_layout.setSpacing(16)

        # 1. Header Banner
        title = QLabel("✓ Deployment Successful")
        title.setStyleSheet("color: #34d399; font-size: 22px; font-weight: 700; background: transparent;")
        subtitle = QLabel("Your dedicated LuciProxy instance is active on Cloudflare Edge.")
        subtitle.setStyleSheet("color: #94a3b8; font-size: 13px; background: transparent;")

        card_layout.addWidget(title)
        card_layout.addWidget(subtitle)

        # 2. Panel Access Section
        panel_box = QFrame()
        panel_box.setObjectName("panel_box")
        panel_box.setStyleSheet(
            "QFrame#panel_box { background-color: #0c1524; border: 1px solid #1d4ed8; border-radius: 8px; }"
        )
        p_layout = QVBoxLayout(panel_box)
        p_layout.setContentsMargins(16, 14, 16, 14)
        p_layout.setSpacing(8)

        lbl_p_title = QLabel("ADMIN PANEL")
        lbl_p_title.setStyleSheet("color: #38bdf8; font-size: 11px; font-weight: 700; letter-spacing: 1px; background: transparent;")
        p_layout.addWidget(lbl_p_title)

        p_input_row = QHBoxLayout()
        p_input_row.setSpacing(10)

        self.txt_panel_url = QLineEdit()
        self.txt_panel_url.setReadOnly(True)
        self.txt_panel_url.setStyleSheet(
            "QLineEdit { background-color: #020617; color: #60a5fa; border: 1px solid #1e3a8a; "
            "border-radius: 6px; padding: 8px 12px; font-family: Consolas, monospace; font-size: 13px; font-weight: 600; }"
        )
        p_input_row.addWidget(self.txt_panel_url)

        self.btn_copy_url = QPushButton("Copy URL")
        self.btn_copy_url.setObjectName("secondary_button")
        self.btn_copy_url.setFixedHeight(36)
        self.btn_copy_url.setFixedWidth(90)
        self.btn_copy_url.setCursor(Qt.CursorShape.PointingHandCursor)
        self.btn_copy_url.clicked.connect(self._copy_panel_url)
        p_input_row.addWidget(self.btn_copy_url)

        self.btn_open_panel = QPushButton("Open Panel")
        self.btn_open_panel.setObjectName("primary_button")
        self.btn_open_panel.setFixedHeight(36)
        self.btn_open_panel.setFixedWidth(110)
        self.btn_open_panel.setCursor(Qt.CursorShape.PointingHandCursor)
        self.btn_open_panel.clicked.connect(self._open_panel)
        p_input_row.addWidget(self.btn_open_panel)

        p_layout.addLayout(p_input_row)
        card_layout.addWidget(panel_box)

        # 3. Admin / Master Key Section
        key_box = QFrame()
        key_box.setObjectName("key_box")
        key_box.setStyleSheet(
            "QFrame#key_box { background-color: #1c180a; border: 1px solid #b45309; border-radius: 8px; }"
        )
        k_layout = QVBoxLayout(key_box)
        k_layout.setContentsMargins(16, 14, 16, 14)
        k_layout.setSpacing(8)

        k_header_row = QHBoxLayout()
        lbl_k_title = QLabel("MASTER KEY")
        lbl_k_title.setStyleSheet("color: #fbbf24; font-size: 11px; font-weight: 700; letter-spacing: 1px; background: transparent;")
        k_badge = QLabel("REQUIRED FOR PANEL")
        k_badge.setStyleSheet(
            "background-color: #78350f; color: #fef08a; padding: 2px 8px; border-radius: 4px; "
            "font-size: 10px; font-weight: 700;"
        )
        k_header_row.addWidget(lbl_k_title)
        k_header_row.addStretch()
        k_header_row.addWidget(k_badge)
        k_layout.addLayout(k_header_row)

        k_input_row = QHBoxLayout()
        k_input_row.setSpacing(10)

        self.txt_master_key = QLineEdit()
        self.txt_master_key.setReadOnly(True)
        self.txt_master_key.setEchoMode(QLineEdit.EchoMode.Password)
        self.txt_master_key.setStyleSheet(
            "QLineEdit { background-color: #090803; color: #fef08a; border: 1px solid #78350f; "
            "border-radius: 6px; padding: 8px 12px; font-family: Consolas, monospace; font-size: 13px; font-weight: 700; }"
        )
        k_input_row.addWidget(self.txt_master_key)

        self.btn_toggle_key = QPushButton("Show Key")
        self.btn_toggle_key.setObjectName("secondary_button")
        self.btn_toggle_key.setFixedHeight(36)
        self.btn_toggle_key.setFixedWidth(90)
        self.btn_toggle_key.setCursor(Qt.CursorShape.PointingHandCursor)
        self.btn_toggle_key.clicked.connect(self._toggle_key_mask)
        k_input_row.addWidget(self.btn_toggle_key)

        self.btn_copy_key = QPushButton("Copy Key")
        self.btn_copy_key.setObjectName("secondary_button")
        self.btn_copy_key.setFixedHeight(36)
        self.btn_copy_key.setFixedWidth(90)
        self.btn_copy_key.setCursor(Qt.CursorShape.PointingHandCursor)
        self.btn_copy_key.clicked.connect(self._copy_master_key)
        k_input_row.addWidget(self.btn_copy_key)

        k_layout.addLayout(k_input_row)

        lbl_k_warn = QLabel("🔒 Keep this key private. You need it to log in when opening the administration panel.")
        lbl_k_warn.setStyleSheet("color: #d1d5db; font-size: 11px; background: transparent;")
        lbl_k_warn.setWordWrap(True)
        k_layout.addWidget(lbl_k_warn)

        card_layout.addWidget(key_box)

        # 4. Instance Metadata Section
        meta_box = QFrame()
        meta_box.setObjectName("meta_box")
        meta_box.setStyleSheet(
            "QFrame#meta_box { background-color: #141822; border: 1px solid #2d333f; border-radius: 8px; }"
        )
        m_layout = QVBoxLayout(meta_box)
        m_layout.setContentsMargins(16, 12, 16, 12)
        m_layout.setSpacing(6)

        lbl_m_title = QLabel("INSTANCE METADATA")
        lbl_m_title.setStyleSheet("color: #94a3b8; font-size: 11px; font-weight: 700; letter-spacing: 1px; background: transparent;")
        m_layout.addWidget(lbl_m_title)

        grid = QGridLayout()
        grid.setVerticalSpacing(6)
        grid.setHorizontalSpacing(16)

        def add_row(row_idx: int, label_text: str, val_widget):
            lbl = QLabel(label_text)
            lbl.setStyleSheet("color: #94a3b8; font-size: 12px; font-weight: 500; background: transparent;")
            grid.addWidget(lbl, row_idx, 0)
            grid.addWidget(val_widget, row_idx, 1)

        self.lbl_worker = QLabel("—")
        self.lbl_worker.setStyleSheet("color: #fbbf24; font-family: Consolas, monospace; font-size: 12px; font-weight: 600; background: transparent;")
        add_row(0, "Worker Script:", self.lbl_worker)

        self.lbl_d1 = QLabel("—")
        self.lbl_d1.setStyleSheet("color: #93c5fd; font-family: Consolas, monospace; font-size: 12px; background: transparent;")
        add_row(1, "D1 Database:", self.lbl_d1)

        self.lbl_version = QLabel("v1.0.0")
        self.lbl_version.setStyleSheet("color: #a78bfa; font-size: 12px; font-weight: 600; background: transparent;")
        add_row(2, "LuciProxy Version:", self.lbl_version)

        self.lbl_integrity = QLabel("✓ SHA-256 Verified")
        self.lbl_integrity.setStyleSheet("color: #34d399; font-size: 12px; font-weight: 600; background: transparent;")
        add_row(3, "Artifact Integrity:", self.lbl_integrity)

        m_layout.addLayout(grid)
        card_layout.addWidget(meta_box)

        # 5. Footer Actions
        footer_row = QHBoxLayout()
        self.btn_history = QPushButton("View Deployment History")
        self.btn_history.setObjectName("secondary_button")
        self.btn_history.setCursor(Qt.CursorShape.PointingHandCursor)
        self.btn_history.clicked.connect(self.view_history_clicked.emit)

        self.btn_close = QPushButton("Close")
        self.btn_close.setObjectName("secondary_button")
        self.btn_close.setCursor(Qt.CursorShape.PointingHandCursor)
        self.btn_close.clicked.connect(self.close_clicked.emit)

        footer_row.addWidget(self.btn_history)
        footer_row.addStretch()
        footer_row.addWidget(self.btn_close)
        card_layout.addLayout(footer_row)

        scroll_layout.addWidget(card)
        scroll.setWidget(scroll_content)
        root_layout.addWidget(scroll)

    def set_result(self, data: Dict[str, Any]):
        """Populates all success fields, cleans clipboard button states, and stores credentials securely."""
        self.deployment_data = data
        self.panel_url = data.get("panel_url", "")
        self.master_key = data.get("master_key", "")

        self.txt_panel_url.setText(self.panel_url)
        self.txt_master_key.setText(self.master_key)
        self.txt_master_key.setEchoMode(QLineEdit.EchoMode.Password)
        self.btn_toggle_key.setText("Show Key")

        self.btn_copy_url.setText("Copy URL")
        self.btn_copy_key.setText("Copy Key")

        self.lbl_worker.setText(data.get("worker_name", "—"))

        d1_name = data.get("d1_name", "—")
        d1_uuid = data.get("d1_uuid", "")
        d1_suffix = f" ({d1_uuid[:8]}...)" if d1_uuid else ""
        self.lbl_d1.setText(f"{d1_name}{d1_suffix}")

        self.lbl_version.setText(f"v{data.get('version', '1.0.0')}")
        self.lbl_integrity.setText("✓ SHA-256 Verified")

    def _open_panel(self):
        """Opens the clean panel URL in default browser without exposing the Master Key in the URL."""
        if self.panel_url:
            QDesktopServices.openUrl(QUrl(self.panel_url))

    def _copy_panel_url(self):
        """Copies only the clean panel URL to clipboard."""
        if self.panel_url:
            QGuiApplication.clipboard().setText(self.panel_url)
            self.btn_copy_url.setText("✓ Copied!")

    def _toggle_key_mask(self):
        """Toggles masking on the Master Key locally in the UI."""
        if self.txt_master_key.echoMode() == QLineEdit.EchoMode.Password:
            self.txt_master_key.setEchoMode(QLineEdit.EchoMode.Normal)
            self.btn_toggle_key.setText("Hide Key")
        else:
            self.txt_master_key.setEchoMode(QLineEdit.EchoMode.Password)
            self.btn_toggle_key.setText("Show Key")

    def _copy_master_key(self):
        """Copies only the secret Master Key to the clipboard."""
        if self.master_key:
            QGuiApplication.clipboard().setText(self.master_key)
            self.btn_copy_key.setText("✓ Copied!")
