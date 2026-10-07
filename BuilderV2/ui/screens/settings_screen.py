"""
LuciProxy Manager - Settings Screen Widget.
Displays version metadata, dual-channel status, security information,
and provides the 'Delete All Local Data' action with confirmation.
"""

from typing import Dict, Optional
from PySide6.QtCore import Qt, Signal
from PySide6.QtWidgets import (
    QWidget,
    QVBoxLayout,
    QHBoxLayout,
    QLabel,
    QPushButton,
    QFrame,
    QMessageBox,
)

from ..controllers.account_controller import AccountController
from ..controllers.release_controller import ReleaseController


class SettingsScreen(QWidget):
    """Application settings, version information, and storage maintenance screen."""

    data_purged = Signal()

    def __init__(
        self,
        account_controller: AccountController,
        release_controller: ReleaseController,
        parent: Optional = None
    ):
        super().__init__(parent)
        self.account_controller = account_controller
        self.release_controller = release_controller
        self._init_ui()

    def _init_ui(self) -> None:
        layout = QVBoxLayout(self)
        layout.setContentsMargins(32, 32, 32, 32)
        layout.setSpacing(24)

        title = QLabel("Settings & System Information")
        title.setStyleSheet("font-size: 22px; font-weight: bold; color: #1e293b;")
        layout.addWidget(title)

        # 1. Version Information Section
        ver_frame = QFrame()
        ver_frame.setStyleSheet(
            "background-color: white; border: 1px solid #e2e8f0; border-radius: 10px; padding: 18px;"
        )
        ver_layout = QVBoxLayout(ver_frame)
        ver_layout.setSpacing(10)

        v_title = QLabel("Release Channels & Versions")
        v_title.setStyleSheet("font-size: 15px; font-weight: bold; color: #0f172a;")
        ver_layout.addWidget(v_title)

        self.lbl_mgr_ver = QLabel("Manager Version: v2.0.0")
        self.lbl_mgr_ver.setStyleSheet("font-size: 13px; color: #334155;")
        ver_layout.addWidget(self.lbl_mgr_ver)

        self.lbl_latest_mgr = QLabel("Latest Discovered Manager Version: Checking...")
        self.lbl_latest_mgr.setStyleSheet("font-size: 13px; color: #334155;")
        ver_layout.addWidget(self.lbl_latest_mgr)

        self.lbl_wrk_ver = QLabel("Latest Worker Release Channel: Checking...")
        self.lbl_wrk_ver.setStyleSheet("font-size: 13px; color: #334155;")
        ver_layout.addWidget(self.lbl_wrk_ver)

        layout.addWidget(ver_frame)

        # 2. Security Information Section
        sec_frame = QFrame()
        sec_frame.setStyleSheet(
            "background-color: white; border: 1px solid #e2e8f0; border-radius: 10px; padding: 18px;"
        )
        sec_layout = QVBoxLayout(sec_frame)
        sec_layout.setSpacing(10)

        s_title = QLabel("Security & Credential Vault")
        s_title.setStyleSheet("font-size: 15px; font-weight: bold; color: #0f172a;")
        sec_layout.addWidget(s_title)

        store_name = self.account_controller.credential_store.__class__.__name__
        s_desc = QLabel(
            f"• Credential Vault: {store_name}\n"
            "• API Tokens: Kept strictly in platform secure storage; NEVER written to SQLite or logs.\n"
            "• Public GitHub Requests: Complete credential isolation (0 Cloudflare tokens transmitted).\n"
            "• Artifacts: Verified with cryptographic SHA-256 before deployment."
        )
        s_desc.setStyleSheet("font-size: 13px; color: #475569; line-height: 1.5;")
        sec_layout.addWidget(s_desc)

        layout.addWidget(sec_frame)

        # 3. Danger Zone / Maintenance Section
        danger_frame = QFrame()
        danger_frame.setStyleSheet(
            "background-color: #fef2f2; border: 1px solid #fecaca; border-radius: 10px; padding: 18px;"
        )
        danger_layout = QVBoxLayout(danger_frame)
        danger_layout.setSpacing(10)

        d_title = QLabel("Maintenance & Local Data Reset")
        d_title.setStyleSheet("font-size: 15px; font-weight: bold; color: #991b1b;")
        danger_layout.addWidget(d_title)

        d_desc = QLabel(
            "Resetting local data will purge all API tokens from the credential vault,\n"
            "delete all connection records, remove Worker metadata, and reset application state."
        )
        d_desc.setStyleSheet("font-size: 13px; color: #7f1d1d;")
        danger_layout.addWidget(d_desc)

        self.btn_delete_all = QPushButton("⚠ Delete All Local Data")
        self.btn_delete_all.setCursor(Qt.PointingHandCursor)
        self.btn_delete_all.setStyleSheet(
            "QPushButton { background-color: #dc2626; color: white; font-weight: bold; padding: 10px 18px; border-radius: 6px; max-width: 200px; } "
            "QPushButton:hover { background-color: #b91c1c; }"
        )
        self.btn_delete_all.clicked.connect(self._on_delete_all_clicked)
        danger_layout.addWidget(self.btn_delete_all)

        layout.addWidget(danger_frame)
        layout.addStretch()

    def update_version_info(self, info: Dict) -> None:
        """Updates display with dual-channel version information."""
        self.lbl_mgr_ver.setText(f"Manager Version: {info.get('current_manager_version', 'v2.0.0')}")
        self.lbl_latest_mgr.setText(f"Latest Discovered Manager Version: {info.get('latest_manager_version', 'None')}")

        wrk_tag = info.get("latest_worker_version", "None")
        is_legacy = info.get("is_legacy_worker", False)
        suffix = " (Legacy Baseline)" if is_legacy else ""
        self.lbl_wrk_ver.setText(f"Latest Worker Release Channel: {wrk_tag}{suffix}")

    def _on_delete_all_clicked(self) -> None:
        confirm = QMessageBox.warning(
            self,
            "Confirm Delete All Local Data",
            "Are you completely sure you want to delete all local data?\n\n"
            "This will permanently delete:\n"
            "• All Cloudflare API tokens from the secure vault\n"
            "• All local connection and account records in SQLite\n"
            "• All tracked Worker deployment records\n\n"
            "This action cannot be undone.",
            QMessageBox.Yes | QMessageBox.No,
            QMessageBox.No
        )
        if confirm == QMessageBox.Yes:
            self.account_controller.delete_all_local_data()
            self.data_purged.emit()
            QMessageBox.information(
                self,
                "Data Deleted",
                "All local data and secure credentials have been successfully purged."
            )
