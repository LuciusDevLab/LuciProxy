"""
LuciProxy Manager - Update Worker Dialog.
Performs in-place updates of existing Cloudflare Workers using immutable WorkerSourceService.
Strictly preserves existing D1 databases, UUIDs, tables, and bindings.
"""

from typing import Any, Dict, List, Optional
from PySide6.QtCore import Qt, Signal
from PySide6.QtWidgets import (
    QDialog,
    QVBoxLayout,
    QHBoxLayout,
    QLabel,
    QComboBox,
    QPushButton,
    QProgressBar,
    QFrame,
)

from ..async_worker import AsyncWorker, run_in_background
from ..controllers.account_controller import AccountController
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
QComboBox {
    background-color: #18181b;
    color: #ffffff;
    border: 1px solid #27272a;
    border-radius: 6px;
    padding: 8px 12px;
    font-size: 13px;
    selection-background-color: #2563eb;
}
QComboBox:focus {
    border: 1px solid #3b82f6;
}
QComboBox QAbstractItemView {
    background-color: #18181b;
    color: #ffffff;
    selection-background-color: #2563eb;
    border: 1px solid #27272a;
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
QPushButton#btnPrimary {
    background-color: #0284c7;
    border: 1px solid #0369a1;
    color: #ffffff;
    font-weight: bold;
}
QPushButton#btnPrimary:hover {
    background-color: #0369a1;
}
QPushButton#btnPrimary:disabled {
    background-color: #075985;
    color: #bae6fd;
}
QProgressBar {
    background-color: #18181b;
    border: 1px solid #27272a;
    border-radius: 4px;
    text-align: center;
    color: #ffffff;
    height: 20px;
}
QProgressBar::chunk {
    background-color: #0284c7;
    border-radius: 3px;
}
"""


class UpdateWorkerDialog(QDialog):
    """Modal dialog for updating a Worker to the latest canonical version."""

    worker_updated = Signal(object)  # Emits DeploymentResult

    def __init__(
        self,
        account_ctrl: AccountController,
        worker_ctrl: WorkerController,
        preselected_account_id: Optional[str] = None,
        preselected_worker_name: Optional[str] = None,
        parent: Optional = None,
    ):
        super().__init__(parent)
        self.account_ctrl = account_ctrl
        self.worker_ctrl = worker_ctrl
        self.preselected_account_id = preselected_account_id
        self.preselected_worker_name = preselected_worker_name
        self.worker_thread: Optional[AsyncWorker] = None
        self._current_workers: List[Dict[str, Any]] = []

        self.setWindowTitle("Update Worker")
        self.setFixedSize(540, 500)
        self.setModal(True)
        self.setStyleSheet(DARK_DIALOG_STYLE)
        self._init_ui()
        self._load_accounts()

    def _init_ui(self) -> None:
        layout = QVBoxLayout(self)
        layout.setContentsMargins(28, 28, 28, 28)
        layout.setSpacing(16)

        # Title
        title = QLabel("Update LuciProxy Worker")
        title.setStyleSheet("font-size: 18px; font-weight: bold; color: #ffffff;")
        layout.addWidget(title)

        desc = QLabel(
            "Upgrades the selected Worker script to canonical v1.2.1. "
            "All existing D1 databases, UUIDs, and bindings are strictly preserved."
        )
        desc.setWordWrap(True)
        desc.setStyleSheet("color: #a1a1aa; font-size: 12px;")
        layout.addWidget(desc)

        # Safety / Preservation Banner
        safety_frame = QFrame()
        safety_frame.setStyleSheet(
            "background-color: #064e3b; border: 1px solid #059669; border-radius: 6px; padding: 10px;"
        )
        safe_layout = QHBoxLayout(safety_frame)
        safe_layout.setContentsMargins(10, 6, 10, 6)
        lbl_safe = QLabel("🛡️ In-Place Update: Existing D1 database and table records will be PRESERVED.")
        lbl_safe.setStyleSheet("color: #a7f3d0; font-weight: 500; font-size: 12px;")
        safe_layout.addWidget(lbl_safe)
        layout.addWidget(safety_frame)

        # Account Selection
        layout.addWidget(QLabel("Select Cloudflare Account:"))
        self.cmb_accounts = QComboBox()
        self.cmb_accounts.currentIndexChanged.connect(self._on_account_changed)
        layout.addWidget(self.cmb_accounts)

        # Worker Selection
        layout.addWidget(QLabel("Select Worker to Update:"))
        self.cmb_workers = QComboBox()
        self.cmb_workers.currentIndexChanged.connect(self._on_worker_changed)
        layout.addWidget(self.cmb_workers)

        # Version Comparison Display
        ver_frame = QFrame()
        ver_frame.setStyleSheet(
            "background-color: #18181b; border: 1px solid #27272a; border-radius: 6px; padding: 10px;"
        )
        ver_layout = QHBoxLayout(ver_frame)
        ver_layout.setContentsMargins(10, 6, 10, 6)

        self.lbl_installed_ver = QLabel("Installed: Unknown")
        self.lbl_installed_ver.setStyleSheet("color: #9ca3af; font-size: 12px;")
        ver_layout.addWidget(self.lbl_installed_ver)

        ver_layout.addStretch()

        lbl_target_ver = QLabel("Target: v1.2.1 (3aafad1)")
        lbl_target_ver.setStyleSheet("color: #38bdf8; font-weight: bold; font-size: 12px;")
        ver_layout.addWidget(lbl_target_ver)

        layout.addWidget(ver_frame)

        # Progress Section
        self.progress_frame = QFrame()
        self.progress_frame.setStyleSheet(
            "background-color: #141416; border: 1px solid #27272a; border-radius: 8px; padding: 12px;"
        )
        prog_layout = QVBoxLayout(self.progress_frame)
        prog_layout.setContentsMargins(10, 8, 10, 8)
        prog_layout.setSpacing(8)

        self.lbl_step = QLabel("Ready to update")
        self.lbl_step.setStyleSheet("color: #38bdf8; font-weight: bold; font-size: 13px;")
        prog_layout.addWidget(self.lbl_step)

        self.lbl_step_detail = QLabel("")
        self.lbl_step_detail.setWordWrap(True)
        self.lbl_step_detail.setStyleSheet("color: #9ca3af; font-size: 12px;")
        prog_layout.addWidget(self.lbl_step_detail)

        self.prog_bar = QProgressBar()
        self.prog_bar.setRange(0, 8)
        self.prog_bar.setValue(0)
        prog_layout.addWidget(self.prog_bar)

        self.progress_frame.setVisible(False)
        layout.addWidget(self.progress_frame)

        self.lbl_error = QLabel("")
        self.lbl_error.setWordWrap(True)
        self.lbl_error.setStyleSheet("color: #ef4444; font-size: 12px;")
        layout.addWidget(self.lbl_error)

        layout.addStretch()

        # Action Buttons
        btn_layout = QHBoxLayout()
        btn_layout.setSpacing(12)
        btn_layout.addStretch()

        self.btn_cancel = QPushButton("Cancel")
        self.btn_cancel.clicked.connect(self.reject)
        btn_layout.addWidget(self.btn_cancel)

        self.btn_update = QPushButton("Update Worker")
        self.btn_update.setObjectName("btnPrimary")
        self.btn_update.setCursor(Qt.PointingHandCursor)
        self.btn_update.clicked.connect(self._on_update_clicked)
        btn_layout.addWidget(self.btn_update)

        layout.addLayout(btn_layout)

    def _load_accounts(self) -> None:
        self.cmb_accounts.blockSignals(True)
        self.cmb_accounts.clear()
        accounts = self.account_ctrl.list_all_accounts()
        if not accounts:
            self.cmb_accounts.addItem("No accounts connected", None)
            self.btn_update.setEnabled(False)
            self.cmb_accounts.blockSignals(False)
            return

        selected_idx = 0
        for idx, acc in enumerate(accounts):
            label = f"{acc['account_name']} ({acc['account_id'][:8]}...)"
            self.cmb_accounts.addItem(label, acc)
            if self.preselected_account_id and acc["account_id"] == self.preselected_account_id:
                selected_idx = idx

        self.cmb_accounts.setCurrentIndex(selected_idx)
        self.cmb_accounts.blockSignals(False)
        self._on_account_changed(selected_idx)

    def _on_account_changed(self, index: int) -> None:
        acc_data = self.cmb_accounts.currentData()
        if not acc_data:
            self.cmb_workers.clear()
            self.btn_update.setEnabled(False)
            return

        conn_id = acc_data["connection_id"]
        account_id = acc_data["account_id"]

        self.cmb_workers.clear()
        self.cmb_workers.addItem("Loading workers...", None)
        self.btn_update.setEnabled(False)

        def fetch_workers():
            return self.worker_ctrl.list_workers(conn_id, account_id)

        run_in_background(
            fn=fetch_workers,
            on_success=self._on_workers_loaded,
            on_error=self._on_workers_error,
        )

    def _on_workers_loaded(self, workers: List[Dict[str, Any]]) -> None:
        self._current_workers = workers
        self.cmb_workers.clear()
        if not workers:
            self.cmb_workers.addItem("No workers found in this account", None)
            self.btn_update.setEnabled(False)
            self.lbl_installed_ver.setText("Installed: None")
            return

        selected_idx = 0
        for idx, w in enumerate(workers):
            label = f"{w['name']} (ver: {w.get('installed_version', 'Unknown')})"
            self.cmb_workers.addItem(label, w)
            if self.preselected_worker_name and w["name"] == self.preselected_worker_name:
                selected_idx = idx

        self.cmb_workers.setCurrentIndex(selected_idx)
        self.btn_update.setEnabled(True)
        self._on_worker_changed(selected_idx)

    def _on_workers_error(self, err: Exception) -> None:
        self.cmb_workers.clear()
        self.cmb_workers.addItem("Failed to load workers", None)
        self.lbl_error.setText(f"Error loading workers: {err}")
        self.btn_update.setEnabled(False)

    def _on_worker_changed(self, index: int) -> None:
        worker_data = self.cmb_workers.currentData()
        if not worker_data:
            self.lbl_installed_ver.setText("Installed: Unknown")
            return
        ver = worker_data.get("installed_version", "Unrecorded")
        self.lbl_installed_ver.setText(f"Installed: {ver}")

    def _on_update_clicked(self) -> None:
        acc_data = self.cmb_accounts.currentData()
        worker_data = self.cmb_workers.currentData()
        if not acc_data or not worker_data:
            self.lbl_error.setText("Please select a valid account and worker.")
            return

        conn_id = acc_data["connection_id"]
        account_id = acc_data["account_id"]
        worker_name = worker_data["name"]

        # Lock UI
        self.btn_update.setEnabled(False)
        self.btn_cancel.setEnabled(False)
        self.cmb_accounts.setEnabled(False)
        self.cmb_workers.setEnabled(False)
        self.lbl_error.setText("")

        self.progress_frame.setVisible(True)
        self.prog_bar.setValue(0)
        self.lbl_step.setText("Starting in-place update...")
        self.lbl_step_detail.setText("Resolving immutable source snapshot...")

        def run_update():
            return self.worker_ctrl.update_worker(
                connection_id=conn_id,
                account_id=account_id,
                worker_name=worker_name,
                progress_callback=self._on_progress_update,
            )

        self.worker_thread = AsyncWorker(run_update)
        self.worker_thread.success.connect(self._on_update_success)
        self.worker_thread.error.connect(self._on_update_error)
        self.worker_thread.start()

    def _on_progress_update(self, step: int, total: int, stage: str, detail: str) -> None:
        self.prog_bar.setValue(step)
        self.lbl_step.setText(f"Step {step}/{total}: {stage}")
        self.lbl_step_detail.setText(detail)

    def _on_update_success(self, result: Any) -> None:
        self.prog_bar.setValue(8)
        self.lbl_step.setText("✓ Update Successful!")
        self.lbl_step.setStyleSheet("color: #22c55e; font-weight: bold; font-size: 13px;")

        d1_id_str = result.d1_database_id[:8] if result.d1_database_id else "unknown"
        detail_text = f"Worker updated to v1.2.1: {result.worker_url}\nPreserved D1: {result.d1_name} ({d1_id_str}...)"
        self.lbl_step_detail.setText(detail_text)
        self.btn_cancel.setText("Done")
        self.btn_cancel.setEnabled(True)
        self.btn_cancel.clicked.disconnect()
        self.btn_cancel.clicked.connect(self.accept)
        self.worker_updated.emit(result)

    def _on_update_error(self, err: Exception) -> None:
        self.btn_update.setEnabled(True)
        self.btn_cancel.setEnabled(True)
        self.cmb_accounts.setEnabled(True)
        self.cmb_workers.setEnabled(True)
        self.lbl_step.setText("Update Failed")
        self.lbl_step.setStyleSheet("color: #ef4444; font-weight: bold; font-size: 13px;")
        self.lbl_error.setText(str(err))
