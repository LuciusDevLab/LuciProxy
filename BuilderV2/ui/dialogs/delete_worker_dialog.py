"""
LuciProxy Manager - Delete Worker Confirmation Dialog.
Explicitly guarantees D1 database preservation and informs the user before
performing remote deletion via Cloudflare REST API.
"""

from typing import Optional
from PySide6.QtCore import Qt, Signal
from PySide6.QtWidgets import (
    QDialog,
    QVBoxLayout,
    QHBoxLayout,
    QLabel,
    QPushButton,
    QProgressBar,
    QFrame,
)

from ..async_worker import run_in_background
from ..controllers.worker_controller import WorkerController

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
QPushButton#btnDanger:disabled {
    background-color: #7f1d1d;
    color: #fca5a5;
}
QProgressBar {
    background-color: #18181b;
    border: 1px solid #27272a;
    border-radius: 4px;
    text-align: center;
    color: #ffffff;
    height: 16px;
}
QProgressBar::chunk {
    background-color: #dc2626;
    border-radius: 3px;
}
"""


class DeleteWorkerDialog(QDialog):
    """Modal confirmation dialog for deleting a worker while preserving its D1 database."""

    worker_deleted = Signal(str)  # Emits worker_name on success

    def __init__(
        self,
        worker_ctrl: WorkerController,
        connection_id: str,
        account_id: str,
        worker_name: str,
        d1_display_name: str = "Unknown",
        d1_id: str = "Unknown",
        parent: Optional = None,
    ):
        super().__init__(parent)
        self.worker_ctrl = worker_ctrl
        self.connection_id = connection_id
        self.account_id = account_id
        self.worker_name = worker_name
        self.d1_display_name = d1_display_name
        self.d1_id = d1_id

        self.setWindowTitle("Delete Worker Confirmation")
        self.setFixedSize(500, 360)
        self.setModal(True)
        self.setStyleSheet(DARK_DIALOG_STYLE)
        self._init_ui()

    def _init_ui(self) -> None:
        layout = QVBoxLayout(self)
        layout.setContentsMargins(28, 28, 28, 28)
        layout.setSpacing(16)

        # Title
        title = QLabel("Confirm Worker Deletion")
        title.setStyleSheet("font-size: 18px; font-weight: bold; color: #f87171;")
        layout.addWidget(title)

        # Warning / Confirmation Banner
        warn_frame = QFrame()
        warn_frame.setStyleSheet(
            "background-color: #1f1315; border: 1px solid #7f1d1d; border-radius: 8px; padding: 14px;"
        )
        warn_layout = QVBoxLayout(warn_frame)
        warn_layout.setSpacing(8)

        lbl_msg = QLabel(
            f"Are you sure you want to delete worker '<b>{self.worker_name}</b>'?"
        )
        lbl_msg.setWordWrap(True)
        lbl_msg.setStyleSheet("color: #ffffff; font-size: 14px;")
        warn_layout.addWidget(lbl_msg)

        lbl_d1_notice = QLabel(
            f"🛡️ <b>D1 Preservation Guarantee:</b><br>"
            f"The linked D1 database '<b>{self.d1_display_name}</b>' ({self.d1_id[:8]}...) "
            f"will be <b>PRESERVED</b> and not deleted."
        )
        lbl_d1_notice.setWordWrap(True)
        lbl_d1_notice.setStyleSheet("color: #34d399; font-size: 12px; line-height: 1.4;")
        warn_layout.addWidget(lbl_d1_notice)

        layout.addWidget(warn_frame)

        # Details
        info_label = QLabel(
            f"Worker Name: {self.worker_name}\n"
            f"Account ID: {self.account_id}\n"
            f"Action: DELETE /accounts/{self.account_id[:8]}.../workers/scripts/{self.worker_name}"
        )
        info_label.setStyleSheet("color: #9ca3af; font-size: 12px; font-family: monospace;")
        layout.addWidget(info_label)

        # Progress / Status
        self.progress = QProgressBar()
        self.progress.setRange(0, 0)
        self.progress.setVisible(False)
        layout.addWidget(self.progress)

        self.lbl_status = QLabel("")
        self.lbl_status.setWordWrap(True)
        layout.addWidget(self.lbl_status)

        layout.addStretch()

        # Action Buttons
        btn_layout = QHBoxLayout()
        btn_layout.setSpacing(12)
        btn_layout.addStretch()

        self.btn_cancel = QPushButton("Cancel")
        self.btn_cancel.clicked.connect(self.reject)
        btn_layout.addWidget(self.btn_cancel)

        self.btn_delete = QPushButton("Delete Worker")
        self.btn_delete.setObjectName("btnDanger")
        self.btn_delete.setCursor(Qt.PointingHandCursor)
        self.btn_delete.clicked.connect(self._on_delete_clicked)
        btn_layout.addWidget(self.btn_delete)

        layout.addLayout(btn_layout)

    def _on_delete_clicked(self) -> None:
        self.btn_delete.setEnabled(False)
        self.btn_cancel.setEnabled(False)
        self.progress.setVisible(True)
        self.lbl_status.setText("Deleting worker script from Cloudflare...")
        self.lbl_status.setStyleSheet("color: #38bdf8; font-size: 12px;")

        run_in_background(
            fn=lambda: self.worker_ctrl.delete_worker(
                connection_id=self.connection_id,
                account_id=self.account_id,
                worker_name=self.worker_name,
            ),
            on_success=self._on_delete_success,
            on_error=self._on_delete_error,
        )

    def _on_delete_success(self, _: object) -> None:
        self.progress.setVisible(False)
        self.lbl_status.setText("✓ Worker deleted successfully. D1 database preserved.")
        self.lbl_status.setStyleSheet("color: #22c55e; font-size: 12px; font-weight: bold;")
        self.worker_deleted.emit(self.worker_name)
        self.accept()

    def _on_delete_error(self, err: Exception) -> None:
        self.progress.setVisible(False)
        self.btn_delete.setEnabled(True)
        self.btn_cancel.setEnabled(True)
        self.lbl_status.setText(f"Delete failed: {err}")
        self.lbl_status.setStyleSheet("color: #ef4444; font-size: 12px;")
