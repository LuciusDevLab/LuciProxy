"""
LuciProxy Manager - Create Worker Dialog.
Runs the full 9-step deployment pipeline using WorkerSourceService and CloudflareClient
with real-time thread-safe progress reporting, D1 creation, and verification.
"""

from typing import Any, Dict, List, Optional
from PySide6.QtCore import Qt, Signal
from PySide6.QtWidgets import (
    QDialog,
    QVBoxLayout,
    QHBoxLayout,
    QLabel,
    QLineEdit,
    QComboBox,
    QPushButton,
    QProgressBar,
    QFrame,
)

from ..async_worker import run_in_background
from ..controllers.account_controller import AccountController
from ..controllers.worker_controller import WorkerController
from ...deployment.naming import NamingPolicy
from .deployment_result_dialog import DeploymentResultDialog

DARK_DIALOG_STYLE = """
QDialog {
    background-color: #0f0f11;
    color: #ffffff;
}
QLabel {
    color: #ffffff;
    font-size: 13px;
}
QLineEdit, QComboBox {
    background-color: #18181b;
    color: #ffffff;
    border: 1px solid #27272a;
    border-radius: 6px;
    padding: 8px 12px;
    font-size: 13px;
    selection-background-color: #2563eb;
}
QLineEdit:focus, QComboBox:focus {
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
QProgressBar {
    background-color: #18181b;
    border: 1px solid #27272a;
    border-radius: 3px;
    text-align: center;
    color: #ffffff;
    height: 6px;
    max-height: 6px;
}
QProgressBar::chunk {
    background-color: #2563eb;
    border-radius: 2px;
}
"""


class CreateWorkerDialog(QDialog):
    """Modal dialog for deploying a fresh Worker from immutable source."""

    worker_created = Signal(object)  # Emits DeploymentResult
    progress_updated = Signal(int, int, str, str)  # Thread-safe (step, total, stage, detail)

    def __init__(
        self,
        account_ctrl: AccountController,
        worker_ctrl: WorkerController,
        preselected_account_id: Optional[str] = None,
        parent: Optional = None,
    ):
        super().__init__(parent)
        self.account_ctrl = account_ctrl
        self.worker_ctrl = worker_ctrl
        self.preselected_account_id = preselected_account_id

        self.setWindowTitle("Create Worker")
        self.setFixedSize(540, 500)
        self.setModal(True)
        self.setStyleSheet(DARK_DIALOG_STYLE)
        self._init_ui()
        self.progress_updated.connect(self._handle_progress_update)
        self._load_accounts()

    def _init_ui(self) -> None:
        layout = QVBoxLayout(self)
        layout.setContentsMargins(28, 24, 28, 24)
        layout.setSpacing(12)

        # Title
        title = QLabel("Deploy LuciProxy Worker")
        title.setStyleSheet("font-size: 18px; font-weight: bold; color: #ffffff;")
        layout.addWidget(title)

        desc = QLabel(
            "Deploys canonical Worker source (v1.2.1) directly to Cloudflare "
            "with a dedicated, production D1 database."
        )
        desc.setWordWrap(True)
        desc.setStyleSheet("color: #a1a1aa; font-size: 12px;")
        layout.addWidget(desc)

        # Target version banner
        ver_frame = QFrame()
        ver_frame.setStyleSheet(
            "background-color: #18181b; border: 1px solid #27272a; border-radius: 6px; padding: 8px 12px;"
        )
        ver_layout = QHBoxLayout(ver_frame)
        ver_layout.setContentsMargins(0, 0, 0, 0)
        lbl_target = QLabel("Target Worker Version:")
        lbl_target.setStyleSheet("font-weight: 600; color: #9ca3af; font-size: 12px;")
        lbl_val = QLabel("v1.2.1 (Commit 3aafad1)")
        lbl_val.setStyleSheet("color: #38bdf8; font-weight: bold; font-size: 12px;")
        ver_layout.addWidget(lbl_target)
        ver_layout.addWidget(lbl_val)
        ver_layout.addStretch()
        layout.addWidget(ver_frame)

        # Account Selection
        layout.addWidget(QLabel("Select Cloudflare Account:"))
        self.cmb_accounts = QComboBox()
        layout.addWidget(self.cmb_accounts)

        # Resource Names (Neutral & Randomized)
        initial_worker, initial_d1 = NamingPolicy.generate_deployment_names()

        # Worker Name
        layout.addWidget(QLabel("Worker Name:"))
        self.txt_worker_name = QLineEdit()
        self.txt_worker_name.setText(initial_worker)
        layout.addWidget(self.txt_worker_name)

        # D1 Database Name
        layout.addWidget(QLabel("D1 Database Name:"))
        self.txt_d1_name = QLineEdit()
        self.txt_d1_name.setText(initial_d1)
        layout.addWidget(self.txt_d1_name)

        # Progress Section (Fixed vertical height reserved area - ZERO layout shift)
        self.progress_frame = QFrame()
        self.progress_frame.setFixedHeight(74)
        self.progress_frame.setStyleSheet(
            "background-color: #141416; border: 1px solid #27272a; border-radius: 8px; padding: 8px;"
        )
        prog_layout = QVBoxLayout(self.progress_frame)
        prog_layout.setContentsMargins(10, 8, 10, 8)
        prog_layout.setSpacing(6)

        self.lbl_step = QLabel("Deployment Progress: Idle")
        self.lbl_step.setStyleSheet("color: #71717a; font-weight: 600; font-size: 12px;")
        prog_layout.addWidget(self.lbl_step)

        self.prog_bar = QProgressBar()
        self.prog_bar.setRange(0, 100)
        self.prog_bar.setValue(0)
        self.prog_bar.setTextVisible(False)
        prog_layout.addWidget(self.prog_bar)

        self.lbl_step_detail = QLabel("Ready to provision Cloudflare Worker & D1 database.")
        self.lbl_step_detail.setWordWrap(True)
        self.lbl_step_detail.setStyleSheet("color: #9ca3af; font-size: 11px;")
        prog_layout.addWidget(self.lbl_step_detail)

        self.progress_frame.setVisible(True)
        layout.addWidget(self.progress_frame)

        layout.addStretch()

        # Action Buttons
        btn_layout = QHBoxLayout()
        btn_layout.setSpacing(12)
        btn_layout.addStretch()

        self.btn_cancel = QPushButton("Cancel")
        self.btn_cancel.clicked.connect(self.reject)
        btn_layout.addWidget(self.btn_cancel)

        self.btn_deploy = QPushButton("Create & Deploy")
        self.btn_deploy.setObjectName("btnPrimary")
        self.btn_deploy.setCursor(Qt.PointingHandCursor)
        self.btn_deploy.clicked.connect(self._on_deploy_clicked)
        btn_layout.addWidget(self.btn_deploy)

        layout.addLayout(btn_layout)

    def _load_accounts(self) -> None:
        """Populates account dropdown."""
        self.cmb_accounts.clear()
        accounts = self.account_ctrl.list_all_accounts()
        if not accounts:
            self.cmb_accounts.addItem("No accounts connected", None)
            self.btn_deploy.setEnabled(False)
            return

        selected_idx = 0
        for idx, acc in enumerate(accounts):
            label = f"{acc['account_name']} ({acc['account_id'][:8]}...)"
            self.cmb_accounts.addItem(label, acc)
            if self.preselected_account_id and acc["account_id"] == self.preselected_account_id:
                selected_idx = idx

        self.cmb_accounts.setCurrentIndex(selected_idx)
        self.btn_deploy.setEnabled(True)

    def _on_deploy_clicked(self) -> None:
        acc_data = self.cmb_accounts.currentData()
        if not acc_data:
            self._show_error("Please select a valid Cloudflare account.")
            return

        worker_name = self.txt_worker_name.text().strip()
        if not worker_name:
            self._show_error("Worker name cannot be empty.")
            return

        if not NamingPolicy.is_allowed_name(worker_name):
            self._show_error("Worker name contains disallowed terminology or invalid characters.")
            return

        d1_name = self.txt_d1_name.text().strip()
        if not d1_name:
            self._show_error("D1 Database name cannot be empty.")
            return

        if not NamingPolicy.is_allowed_name(d1_name):
            self._show_error("D1 Database name contains disallowed terminology or invalid characters.")
            return

        if worker_name == d1_name:
            self._show_error("Worker name and D1 Database name must be distinct.")
            return

        # State transition: IDLE -> DEPLOYING
        self.btn_deploy.setEnabled(False)
        self.btn_cancel.setEnabled(False)
        self.cmb_accounts.setEnabled(False)
        self.txt_worker_name.setEnabled(False)
        self.txt_d1_name.setEnabled(False)

        self.prog_bar.setRange(0, 100)
        self.prog_bar.setValue(0)
        self.lbl_step.setStyleSheet("color: #38bdf8; font-weight: bold; font-size: 12px;")
        self.lbl_step.setText("Step 1/9: Preparing Deployment (0%)")
        self.lbl_step_detail.setStyleSheet("color: #9ca3af; font-size: 11px;")
        self.lbl_step_detail.setText("Resolving immutable Worker source...")

        connection_id = acc_data["connection_id"]
        account_id = acc_data["account_id"]

        def run_deploy():
            return self.worker_ctrl.create_worker(
                connection_id=connection_id,
                account_id=account_id,
                worker_name=worker_name,
                d1_name=d1_name,
                progress_callback=self._on_progress_update,
            )

        run_in_background(
            fn=run_deploy,
            on_result=self._on_deploy_success,
            on_error=lambda msg, exc: self._on_deploy_error(exc or Exception(msg)),
        )

    def _show_error(self, message: str) -> None:
        self.lbl_step.setStyleSheet("color: #ef4444; font-weight: bold; font-size: 12px;")
        self.lbl_step.setText("Validation Error")
        self.lbl_step_detail.setStyleSheet("color: #fca5a5; font-size: 11px;")
        self.lbl_step_detail.setText(message)

    def _on_progress_update(self, step: int, total: int, stage: str, detail: str) -> None:
        """Invoked from background thread; emits thread-safe Qt signal."""
        self.progress_updated.emit(step, total, stage, detail)

    def _handle_progress_update(self, step: int, total: int, stage: str, detail: str) -> None:
        """Handled strictly on UI main thread."""
        pct = int((step / total) * 100) if total > 0 else 0
        self.prog_bar.setRange(0, 100)
        self.prog_bar.setValue(pct)
        self.lbl_step.setStyleSheet("color: #38bdf8; font-weight: bold; font-size: 12px;")
        self.lbl_step.setText(f"Step {step}/{total}: {stage} ({pct}%)")
        self.lbl_step_detail.setStyleSheet("color: #9ca3af; font-size: 11px;")
        self.lbl_step_detail.setText(detail)

    def _on_deploy_success(self, result: Any) -> None:
        """State transition: DEPLOYING -> SUCCESS (terminal state)."""
        if not getattr(result, "success", False):
            err_msg = getattr(result, "error", None) or "Deployment returned failure status."
            self._on_deploy_error(Exception(err_msg))
            return

        self.prog_bar.setValue(100)
        self.lbl_step.setStyleSheet("color: #22c55e; font-weight: bold; font-size: 12px;")
        self.lbl_step.setText("✓ Deployment Complete (100%)")
        self.lbl_step_detail.setStyleSheet("color: #a7f3d0; font-size: 11px;")
        self.lbl_step_detail.setText(f"Worker '{result.worker_name}' is active on Cloudflare.")

        self.worker_created.emit(result)

        # Accept this dialog and open dedicated result modal
        parent_widget = self.parentWidget()
        self.accept()
        dlg = DeploymentResultDialog(result, parent=parent_widget)
        dlg.exec()

    def _on_deploy_error(self, err: Exception) -> None:
        """State transition: DEPLOYING -> FAILURE (terminal state with re-enabled retry)."""
        self.btn_deploy.setEnabled(True)
        self.btn_cancel.setEnabled(True)
        self.cmb_accounts.setEnabled(True)
        self.txt_worker_name.setEnabled(True)
        self.txt_d1_name.setEnabled(True)

        err_text = str(err)
        if "Deployment failed:" in err_text:
            err_text = err_text.replace("Deployment failed:", "").strip()

        self.lbl_step.setStyleSheet("color: #ef4444; font-weight: bold; font-size: 12px;")
        self.lbl_step.setText("Deployment Failed")
        self.lbl_step_detail.setStyleSheet("color: #fca5a5; font-size: 11px;")
        self.lbl_step_detail.setText(err_text)

