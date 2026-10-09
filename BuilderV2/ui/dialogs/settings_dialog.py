"""
LuciProxy Manager - Settings & Reset Dialog.
Displays version metadata, decoupled Worker source signal, and provides nuclear data reset.
"""

from typing import Optional
from PySide6.QtCore import Qt, Signal
from PySide6.QtWidgets import (
    QDialog,
    QVBoxLayout,
    QHBoxLayout,
    QLabel,
    QPushButton,
    QMessageBox,
    QFrame,
)

from ..controllers.account_controller import AccountController

DARK_DIALOG_STYLE = """
QDialog {
    background-color: #0f0f11;
    color: #ffffff;
}
QLabel {
    color: #ffffff;
    font-size: 13px;
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
QPushButton#btnDanger {
    background-color: #dc2626;
    border: 1px solid #b91c1c;
    color: #ffffff;
    font-weight: bold;
}
QPushButton#btnDanger:hover {
    background-color: #b91c1c;
}
"""


class SettingsDialog(QDialog):
    """Modal dialog for application settings and nuclear local data reset."""

    data_reset = Signal()

    def __init__(self, account_ctrl: AccountController, parent: Optional = None):
        super().__init__(parent)
        self.account_ctrl = account_ctrl

        self.setWindowTitle("Settings")
        self.setFixedSize(480, 380)
        self.setModal(True)
        self.setStyleSheet(DARK_DIALOG_STYLE)
        self._init_ui()

    def _init_ui(self) -> None:
        layout = QVBoxLayout(self)
        layout.setContentsMargins(28, 28, 28, 28)
        layout.setSpacing(16)

        # Title
        title = QLabel("Application Settings")
        title.setStyleSheet("font-size: 18px; font-weight: bold; color: #ffffff;")
        layout.addWidget(title)

        # Version Info Box
        info_frame = QFrame()
        info_frame.setStyleSheet(
            "background-color: #141416; border: 1px solid #27272a; border-radius: 8px; padding: 14px;"
        )
        info_layout = QVBoxLayout(info_frame)
        info_layout.setSpacing(6)

        lbl_mgr = QLabel("<b>LuciProxy Manager:</b> v2.0.0 (Windows x64)")
        lbl_mgr.setStyleSheet("color: #ffffff; font-size: 13px;")
        info_layout.addWidget(lbl_mgr)

        lbl_wrk = QLabel("<b>Target Worker Version:</b> v1.2.1")
        lbl_wrk.setStyleSheet("color: #38bdf8; font-size: 13px;")
        info_layout.addWidget(lbl_wrk)

        lbl_sha = QLabel("<b>Worker Commit SHA:</b> 3aafad12745c59a849610d603fc22b22f656ac36")
        lbl_sha.setStyleSheet("color: #9ca3af; font-size: 11px; font-family: monospace;")
        info_layout.addWidget(lbl_sha)

        layout.addWidget(info_frame)

        # Nuclear Reset Section
        reset_frame = QFrame()
        reset_frame.setStyleSheet(
            "background-color: #1a1215; border: 1px solid #7f1d1d; border-radius: 8px; padding: 14px;"
        )
        reset_layout = QVBoxLayout(reset_frame)
        reset_layout.setSpacing(8)

        lbl_reset_title = QLabel("Nuclear Reset")
        lbl_reset_title.setStyleSheet("color: #f87171; font-weight: bold; font-size: 13px;")
        reset_layout.addWidget(lbl_reset_title)

        lbl_reset_desc = QLabel(
            "Deletes all stored accounts, credentials in OS vault, and cached records from SQLite. "
            "Remote Cloudflare resources remain untouched."
        )
        lbl_reset_desc.setWordWrap(True)
        lbl_reset_desc.setStyleSheet("color: #d1d5db; font-size: 11px;")
        reset_layout.addWidget(lbl_reset_desc)

        btn_reset = QPushButton("Reset All Local Data")
        btn_reset.setObjectName("btnDanger")
        btn_reset.setCursor(Qt.PointingHandCursor)
        btn_reset.clicked.connect(self._on_reset_clicked)
        reset_layout.addWidget(btn_reset)

        layout.addWidget(reset_frame)

        layout.addStretch()

        # Close button
        btn_layout = QHBoxLayout()
        btn_layout.addStretch()
        btn_close = QPushButton("Close")
        btn_close.clicked.connect(self.accept)
        btn_layout.addWidget(btn_close)
        layout.addLayout(btn_layout)

    def _on_reset_clicked(self) -> None:
        reply = QMessageBox.question(
            self,
            "Confirm Nuclear Reset",
            "Are you sure you want to delete all stored credentials and local database records?\n\n"
            "This will remove all account links in this application.",
            QMessageBox.Yes | QMessageBox.No,
            QMessageBox.No,
        )
        if reply == QMessageBox.Yes:
            self.account_ctrl.delete_all_local_data()
            self.data_reset.emit()
            self.accept()
