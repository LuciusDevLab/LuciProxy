"""
LuciProxy Builder - Screen 8: Error UX Screen.
Presents human-readable, non-technical diagnostics with retry options and zero token exposure.
"""

from PySide6.QtCore import Qt, Signal
from PySide6.QtGui import QGuiApplication
from PySide6.QtWidgets import (
    QWidget, QVBoxLayout, QHBoxLayout, QLabel, QPushButton, QFrame, QTextEdit
)


class ErrorScreen(QWidget):
    """Clean error display screen with actionable remediation."""

    retry_clicked = Signal()
    back_clicked = Signal()

    def __init__(self, parent=None):
        super().__init__(parent)
        self.stage = ""
        self.reason = ""
        self.details = ""
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
        title = QLabel("⚠️ Operation Failed")
        title.setObjectName("title")
        title.setStyleSheet("color: #f87171;")
        card_layout.addWidget(title)

        # Error Context Card
        err_box = QFrame()
        err_box.setObjectName("err_box")
        err_box.setStyleSheet("QFrame#err_box { background-color: #261616; border: 1px solid #7f1d1d; border-radius: 8px; padding: 14px; }")
        eb_layout = QVBoxLayout(err_box)
        eb_layout.setSpacing(6)

        self.lbl_stage = QLabel("Stage: Deployment Pipeline")
        self.lbl_stage.setStyleSheet("color: #fca5a5; font-weight: 600; font-size: 13px; background: transparent;")
        self.lbl_reason = QLabel("Reason: Cloudflare rejected the request.")
        self.lbl_reason.setStyleSheet("color: #e5e7eb; font-size: 13px; background: transparent;")

        eb_layout.addWidget(self.lbl_stage)
        eb_layout.addWidget(self.lbl_reason)
        card_layout.addWidget(err_box)

        # Sanitized Details Text Area
        lbl_details_title = QLabel("Details:")
        lbl_details_title.setStyleSheet("color: #9ca3af; font-size: 12px;")
        card_layout.addWidget(lbl_details_title)

        self.txt_details = QTextEdit()
        self.txt_details.setReadOnly(True)
        self.txt_details.setFixedHeight(120)
        self.txt_details.setStyleSheet("background-color: #16181f; border: 1px solid #374151; font-family: monospace; font-size: 12px; color: #d1d5db;")
        card_layout.addWidget(self.txt_details)

        # Action Buttons
        btn_row = QHBoxLayout()
        btn_back = QPushButton("Back")
        btn_back.setObjectName("secondary_button")
        btn_back.clicked.connect(self.back_clicked.emit)

        self.btn_copy = QPushButton("Copy Error Details")
        self.btn_copy.setObjectName("secondary_button")
        self.btn_copy.clicked.connect(self._copy_error_details)

        btn_retry = QPushButton("Retry")
        btn_retry.setObjectName("primary_button")
        btn_retry.clicked.connect(self.retry_clicked.emit)

        btn_row.addWidget(btn_back)
        btn_row.addWidget(self.btn_copy)
        btn_row.addStretch()
        btn_row.addWidget(btn_retry)
        card_layout.addLayout(btn_row)

        layout.addWidget(card)

    def set_error(self, stage: str, reason: str, details: str):
        self.stage = stage
        self.reason = reason
        self.details = details

        self.lbl_stage.setText(f"Stage: {stage}")
        self.lbl_reason.setText(f"Reason: {reason}")
        self.txt_details.setPlainText(details)
        self.btn_copy.setText("Copy Error Details")

    def _copy_error_details(self):
        full_text = f"Stage: {self.stage}\nReason: {self.reason}\nDetails:\n{self.details}"
        QGuiApplication.clipboard().setText(full_text)
        self.btn_copy.setText("✓ Copied!")
