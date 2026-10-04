"""
LuciProxy Builder - Screen 4: Pre-Deployment Summary Screen.
Confirms target account, embedded artifact verification, and freshly randomized neutral resource names.
"""

from typing import Tuple
from PySide6.QtCore import Qt, Signal
from PySide6.QtWidgets import (
    QWidget, QVBoxLayout, QHBoxLayout, QLabel, QPushButton, QFrame, QGridLayout
)

from ...resources.naming import generate_deployment_names


class PreDeployScreen(QWidget):
    """Pre-deployment verification and resource summary screen."""

    back_clicked = Signal()
    deploy_clicked = Signal(str, str)  # worker_name, d1_name

    def __init__(self, parent=None):
        super().__init__(parent)
        self.worker_name = ""
        self.d1_name = ""
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

        title = QLabel("Ready to Deploy")
        title.setObjectName("title")
        subtitle = QLabel("Review configuration. Every deployment provisions dedicated, independent resources:")
        subtitle.setObjectName("subtitle")
        subtitle.setWordWrap(True)

        card_layout.addWidget(title)
        card_layout.addWidget(subtitle)

        # Summary Grid
        grid_frame = QFrame()
        grid_frame.setObjectName("grid_frame")
        grid_frame.setStyleSheet("QFrame#grid_frame { background-color: #16181f; border: 1px solid #2d333f; border-radius: 8px; padding: 14px; }")
        grid = QGridLayout(grid_frame)
        grid.setVerticalSpacing(12)
        grid.setHorizontalSpacing(16)

        def add_row(row: int, label_text: str, widget):
            lbl = QLabel(label_text)
            lbl.setStyleSheet("color: #9ca3af; font-weight: 500;")
            grid.addWidget(lbl, row, 0)
            grid.addWidget(widget, row, 1)

        self.lbl_account = QLabel("—")
        self.lbl_account.setStyleSheet("color: #f3f4f6; font-weight: 600;")
        add_row(0, "Cloudflare Account:", self.lbl_account)

        self.lbl_version = QLabel("v1.0.0")
        self.lbl_version.setStyleSheet("color: #60a5fa; font-weight: 600;")
        add_row(1, "LuciProxy Version:", self.lbl_version)

        self.lbl_sha = QLabel("—")
        self.lbl_sha.setStyleSheet("color: #34d399; font-family: monospace; font-size: 12px;")
        add_row(2, "Artifact SHA-256:", self.lbl_sha)

        self.lbl_worker = QLabel("—")
        self.lbl_worker.setStyleSheet("color: #fbbf24; font-family: monospace; font-size: 13px; font-weight: 600;")
        add_row(3, "Worker Script:", self.lbl_worker)

        self.lbl_d1 = QLabel("—")
        self.lbl_d1.setStyleSheet("color: #fbbf24; font-family: monospace; font-size: 13px; font-weight: 600;")
        add_row(4, "D1 Database:", self.lbl_d1)

        card_layout.addWidget(grid_frame)

        # Regenerate Names Action
        lbl_hint = QLabel("🔒 <i>Resource names are randomly generated and filtered against proxy/tunnel denylists.</i>")
        lbl_hint.setStyleSheet("color: #9ca3af; font-size: 11px;")
        card_layout.addWidget(lbl_hint)

        btn_regen = QPushButton("🎲 Generate New Random Names")
        btn_regen.setObjectName("secondary_button")
        btn_regen.setCursor(Qt.CursorShape.PointingHandCursor)
        btn_regen.clicked.connect(self.regenerate_names)
        card_layout.addWidget(btn_regen)

        card_layout.addSpacing(6)

        # Action Buttons
        btn_row = QHBoxLayout()
        self.btn_back = QPushButton("Back")
        self.btn_back.setObjectName("secondary_button")
        self.btn_back.clicked.connect(self.back_clicked.emit)

        self.btn_deploy = QPushButton("Deploy")
        self.btn_deploy.setObjectName("primary_button")
        self.btn_deploy.setCursor(Qt.CursorShape.PointingHandCursor)
        self.btn_deploy.setMinimumHeight(44)
        self.btn_deploy.setMinimumWidth(160)
        self.btn_deploy.clicked.connect(self._on_deploy_clicked)

        btn_row.addWidget(self.btn_back)
        btn_row.addStretch()
        btn_row.addWidget(self.btn_deploy)
        card_layout.addLayout(btn_row)

        layout.addWidget(card)

    def set_deployment_info(self, account_name: str, version: str, sha256_hash: str):
        self.lbl_account.setText(account_name)
        self.lbl_version.setText(f"v{version}")
        short_sha = f"{sha256_hash[:12]}...{sha256_hash[-8:]}" if len(sha256_hash) > 20 else sha256_hash
        self.lbl_sha.setText(short_sha)
        self.regenerate_names()
        self.btn_deploy.setEnabled(True)

    def regenerate_names(self):
        self.worker_name, self.d1_name = generate_deployment_names()
        self.lbl_worker.setText(self.worker_name)
        self.lbl_d1.setText(self.d1_name)

    def _on_deploy_clicked(self):
        self.deploy_clicked.emit(self.worker_name, self.d1_name)
