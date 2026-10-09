"""
LuciProxy Manager - Deployment Result Dialog.
Presents full deployment details and Authoritative Admin Master Key upon successful installation.
"""

from typing import Optional
from PySide6.QtCore import Qt, QUrl, QTimer
from PySide6.QtGui import QDesktopServices, QGuiApplication
from PySide6.QtWidgets import (
    QDialog,
    QVBoxLayout,
    QHBoxLayout,
    QLabel,
    QLineEdit,
    QPushButton,
    QFrame,
)

from ...deployment.models import DeploymentResult

RESULT_DIALOG_STYLE = """
QDialog {
    background-color: #0f0f11;
    color: #ffffff;
}
QLabel {
    color: #ffffff;
    font-size: 13px;
}
QFrame#metaFrame {
    background-color: #18181b;
    border: 1px solid #27272a;
    border-radius: 8px;
    padding: 12px;
}
QFrame#masterKeyFrame {
    background-color: #1c1917;
    border: 1px solid #f59e0b;
    border-radius: 8px;
    padding: 12px;
}
QLineEdit#keyDisplay {
    background-color: #0c0a09;
    color: #38bdf8;
    border: 1px solid #78350f;
    border-radius: 6px;
    padding: 8px 12px;
    font-family: monospace;
    font-size: 14px;
    font-weight: bold;
}
QPushButton {
    background-color: #27272a;
    color: #ffffff;
    border: 1px solid #3f3f46;
    border-radius: 6px;
    padding: 8px 16px;
    font-size: 13px;
    font-weight: 500;
}
QPushButton:hover {
    background-color: #3f3f46;
}
QPushButton:pressed {
    background-color: #52525b;
}
QPushButton#btnDone {
    background-color: #2563eb;
    border: 1px solid #1d4ed8;
    color: #ffffff;
    font-weight: bold;
    min-width: 100px;
}
QPushButton#btnDone:hover {
    background-color: #1d4ed8;
}
QPushButton#btnAction {
    background-color: #1f2937;
    border: 1px solid #374151;
    color: #e5e7eb;
}
QPushButton#btnAction:hover {
    background-color: #374151;
}
"""


class DeploymentResultDialog(QDialog):
    """Modal dialog displaying successful Worker deployment details and Master Key."""

    def __init__(self, result: DeploymentResult, parent: Optional = None):
        super().__init__(parent)
        self.result = result
        self.setWindowTitle("Worker Deployment Successful")
        self.setFixedSize(560, 560)
        self.setModal(True)
        self.setStyleSheet(RESULT_DIALOG_STYLE)
        self._init_ui()

    def _init_ui(self) -> None:
        layout = QVBoxLayout(self)
        layout.setContentsMargins(28, 24, 28, 24)
        layout.setSpacing(14)

        # 1. Header Banner
        lbl_head = QLabel("✓ Worker Deployed Successfully")
        lbl_head.setStyleSheet("font-size: 20px; font-weight: bold; color: #22c55e;")
        layout.addWidget(lbl_head)

        lbl_sub = QLabel(
            f"Canonical LuciProxy Worker v{self.result.worker_version} is active on Cloudflare Edge."
        )
        lbl_sub.setStyleSheet("color: #a1a1aa; font-size: 13px;")
        layout.addWidget(lbl_sub)

        # 2. Metadata Frame
        meta_frame = QFrame()
        meta_frame.setObjectName("metaFrame")
        meta_layout = QVBoxLayout(meta_frame)
        meta_layout.setContentsMargins(14, 12, 14, 12)
        meta_layout.setSpacing(8)

        def add_meta_row(label: str, value: str, is_mono: bool = False, color: str = "#ffffff"):
            row = QHBoxLayout()
            lbl_l = QLabel(f"{label}:")
            lbl_l.setStyleSheet("color: #9ca3af; font-size: 12px; min-width: 120px;")
            font_family = "font-family: monospace;" if is_mono else ""
            lbl_v = QLabel(value)
            lbl_v.setStyleSheet(f"color: {color}; font-weight: 600; font-size: 12px; {font_family}")
            lbl_v.setTextInteractionFlags(Qt.TextSelectableByMouse)
            row.addWidget(lbl_l)
            row.addWidget(lbl_v)
            row.addStretch()
            meta_layout.addLayout(row)

        add_meta_row("Worker Name", self.result.worker_name, color="#ffffff")
        worker_base_url = self.result.worker_url or f"https://{self.result.worker_name}.workers.dev"
        api_route = getattr(self.result, "api_route", "sync") or "sync"
        panel_url = self.result.panel_url or f"{worker_base_url.rstrip('/')}/{api_route}/dash"
        add_meta_row("Worker Base URL", worker_base_url, is_mono=True, color="#9ca3af")
        add_meta_row("Panel URL", panel_url, is_mono=True, color="#38bdf8")
        add_meta_row("Admin/API Path", f"/{api_route}", is_mono=True, color="#fbbf24")
        add_meta_row("D1 Database", self.result.d1_name or "Dedicated Database", color="#ffffff")
        add_meta_row("D1 Database ID", self.result.d1_database_id, is_mono=True, color="#9ca3af")
        add_meta_row("Binding Name", self.result.d1_binding_name, color="#38bdf8")
        add_meta_row("Worker Version", f"v{self.result.worker_version}", color="#e2e8f0")
        source_rev = (self.result.source_revision or "")[:8]
        add_meta_row("Source Revision", source_rev, is_mono=True, color="#a1a1aa")

        layout.addWidget(meta_frame)

        # 3. Master Key Frame (Security Warning)
        if self.result.master_key:
            key_frame = QFrame()
            key_frame.setObjectName("masterKeyFrame")
            key_layout = QVBoxLayout(key_frame)
            key_layout.setContentsMargins(14, 12, 14, 12)
            key_layout.setSpacing(8)

            lbl_key_title = QLabel("🔑 Admin Master Key")
            lbl_key_title.setStyleSheet("font-weight: bold; color: #fbbf24; font-size: 14px;")
            key_layout.addWidget(lbl_key_title)

            self.txt_key = QLineEdit()
            self.txt_key.setObjectName("keyDisplay")
            self.txt_key.setReadOnly(True)
            self.txt_key.setText(self.result.master_key)
            key_layout.addWidget(self.txt_key)

            lbl_warn = QLabel(
                "⚠️ Save this Master Key securely now. It grants full administrative "
                "control and will not be displayed again."
            )
            lbl_warn.setWordWrap(True)
            lbl_warn.setStyleSheet("color: #fcd34d; font-size: 11px;")
            key_layout.addWidget(lbl_warn)

            layout.addWidget(key_frame)

        layout.addStretch()

        # 4. Action Buttons
        btn_layout = QHBoxLayout()
        btn_layout.setSpacing(10)

        self.btn_open = QPushButton("🌐 Open Panel")
        self.btn_open.setObjectName("btnAction")
        self.btn_open.setCursor(Qt.PointingHandCursor)
        self.btn_open.clicked.connect(self._on_open_panel)
        btn_layout.addWidget(self.btn_open)

        self.btn_copy_url = QPushButton("📋 Copy Panel URL")
        self.btn_copy_url.setObjectName("btnAction")
        self.btn_copy_url.setCursor(Qt.PointingHandCursor)
        self.btn_copy_url.clicked.connect(self._on_copy_panel_url)
        btn_layout.addWidget(self.btn_copy_url)

        if self.result.master_key:
            self.btn_copy_key = QPushButton("🔑 Copy Master Key")
            self.btn_copy_key.setObjectName("btnAction")
            self.btn_copy_key.setCursor(Qt.PointingHandCursor)
            self.btn_copy_key.clicked.connect(self._on_copy_key)
            btn_layout.addWidget(self.btn_copy_key)

        btn_layout.addStretch()

        self.btn_done = QPushButton("Done")
        self.btn_done.setObjectName("btnDone")
        self.btn_done.setCursor(Qt.PointingHandCursor)
        self.btn_done.clicked.connect(self.accept)
        btn_layout.addWidget(self.btn_done)

        layout.addLayout(btn_layout)

    def _on_open_panel(self) -> None:
        api_route = getattr(self.result, "api_route", "sync") or "sync"
        url = self.result.panel_url or f"{(self.result.worker_url or '').rstrip('/')}/{api_route}/dash"
        if url:
            QDesktopServices.openUrl(QUrl(url))

    def _on_open_worker(self) -> None:
        """Backward-compatible alias for _on_open_panel."""
        self._on_open_panel()

    def _on_copy_panel_url(self) -> None:
        api_route = getattr(self.result, "api_route", "sync") or "sync"
        url = self.result.panel_url or f"{(self.result.worker_url or '').rstrip('/')}/{api_route}/dash"
        if url:
            QGuiApplication.clipboard().setText(url)
            self.btn_copy_url.setText("✓ Copied Panel URL!")
            QTimer.singleShot(2000, lambda: self.btn_copy_url.setText("📋 Copy Panel URL"))

    def _on_copy_url(self) -> None:
        """Backward-compatible alias for _on_copy_panel_url."""
        self._on_copy_panel_url()

    def _on_copy_key(self) -> None:
        if self.result.master_key:
            QGuiApplication.clipboard().setText(self.result.master_key)
            self.btn_copy_key.setText("✓ Copied Key!")
            QTimer.singleShot(2000, lambda: self.btn_copy_key.setText("🔑 Copy Master Key"))

