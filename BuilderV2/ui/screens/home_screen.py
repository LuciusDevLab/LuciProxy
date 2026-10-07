"""
LuciProxy Manager - Home Screen Widget.
Prominently features [ Create Worker ] and [ Update Worker ] entry points,
dual-channel update summary, connected account totals, and GitHub check status.
"""

from typing import Optional
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


class HomeScreen(QWidget):
    """Home screen providing the primary operational overview and action entry points."""

    create_worker_requested = Signal()
    update_worker_requested = Signal()
    refresh_requested = Signal()

    def __init__(self, parent: Optional = None):
        super().__init__(parent)
        self._init_ui()

    def _init_ui(self) -> None:
        layout = QVBoxLayout(self)
        layout.setContentsMargins(32, 32, 32, 32)
        layout.setSpacing(24)

        # 1. Header Banner
        header_layout = QVBoxLayout()
        header_layout.setSpacing(6)

        title_label = QLabel("LuciProxy Manager")
        title_label.setObjectName("appTitle")
        title_label.setStyleSheet("font-size: 26px; font-weight: bold; color: #1e293b;")

        self.version_badge = QLabel("Manager v2.0.0")
        self.version_badge.setObjectName("versionBadge")
        self.version_badge.setStyleSheet(
            "font-size: 14px; font-weight: 600; color: #0284c7; "
            "background-color: #e0f2fe; border-radius: 6px; padding: 4px 10px; max-width: 140px;"
        )

        header_layout.addWidget(title_label)
        header_layout.addWidget(self.version_badge)
        layout.addLayout(header_layout)

        # 2. Prominent Action Buttons Section
        actions_frame = QFrame()
        actions_frame.setStyleSheet(
            "background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 16px;"
        )
        actions_layout = QHBoxLayout(actions_frame)
        actions_layout.setSpacing(16)

        self.btn_create_worker = QPushButton("+ Create Worker")
        self.btn_create_worker.setObjectName("btnCreateWorker")
        self.btn_create_worker.setCursor(Qt.PointingHandCursor)
        self.btn_create_worker.setStyleSheet(
            "QPushButton { background-color: #2563eb; color: white; font-size: 16px; font-weight: bold; "
            "padding: 14px 28px; border-radius: 8px; border: none; } "
            "QPushButton:hover { background-color: #1d4ed8; } "
            "QPushButton:pressed { background-color: #1e40af; }"
        )
        self.btn_create_worker.clicked.connect(self._on_create_worker_clicked)

        self.btn_update_worker = QPushButton("⟳ Update Worker")
        self.btn_update_worker.setObjectName("btnUpdateWorker")
        self.btn_update_worker.setCursor(Qt.PointingHandCursor)
        self.btn_update_worker.setStyleSheet(
            "QPushButton { background-color: #0284c7; color: white; font-size: 16px; font-weight: bold; "
            "padding: 14px 28px; border-radius: 8px; border: none; } "
            "QPushButton:hover { background-color: #0369a1; } "
            "QPushButton:pressed { background-color: #075985; }"
        )
        self.btn_update_worker.clicked.connect(self._on_update_worker_clicked)

        actions_layout.addWidget(self.btn_create_worker)
        actions_layout.addWidget(self.btn_update_worker)
        actions_layout.addStretch()

        layout.addWidget(actions_frame)

        # 3. Overview Metric Cards Grid
        cards_layout = QHBoxLayout()
        cards_layout.setSpacing(16)

        # Accounts Card
        self.card_accounts = self._create_metric_card("Cloudflare Accounts", "0 Connected", "0 Accounts accessible")
        cards_layout.addWidget(self.card_accounts)

        # Workers Card
        self.card_workers = self._create_metric_card("Workers", "0 Managed", "Ready to deploy")
        cards_layout.addWidget(self.card_workers)

        # Updates Card
        self.card_updates = self._create_metric_card("Updates", "Checking...", "Dual-channel sync")
        cards_layout.addWidget(self.card_updates)

        layout.addLayout(cards_layout)

        # 4. Status Bar / GitHub Last Checked
        status_layout = QHBoxLayout()
        self.lbl_github_status = QLabel("GitHub Status: Not checked yet")
        self.lbl_github_status.setStyleSheet("color: #64748b; font-size: 13px;")

        self.btn_refresh = QPushButton("⟳ Check Updates")
        self.btn_refresh.setCursor(Qt.PointingHandCursor)
        self.btn_refresh.setStyleSheet(
            "QPushButton { background: none; border: 1px solid #cbd5e1; border-radius: 6px; padding: 6px 12px; color: #475569; } "
            "QPushButton:hover { background-color: #f1f5f9; }"
        )
        self.btn_refresh.clicked.connect(self.refresh_requested.emit)

        status_layout.addWidget(self.lbl_github_status)
        status_layout.addStretch()
        status_layout.addWidget(self.btn_refresh)

        layout.addLayout(status_layout)
        layout.addStretch()

    def _create_metric_card(self, title: str, main_val: str, subtitle: str) -> QFrame:
        card = QFrame()
        card.setStyleSheet(
            "QFrame { background-color: white; border: 1px solid #e2e8f0; border-radius: 10px; padding: 16px; } "
            "QFrame:hover { border-color: #cbd5e1; }"
        )
        card_layout = QVBoxLayout(card)
        card_layout.setSpacing(4)

        t_lbl = QLabel(title)
        t_lbl.setStyleSheet("font-size: 13px; font-weight: 600; color: #64748b; text-transform: uppercase;")

        m_lbl = QLabel(main_val)
        m_lbl.setObjectName(f"val_{title.replace(' ', '')}")
        m_lbl.setStyleSheet("font-size: 22px; font-weight: bold; color: #0f172a;")

        s_lbl = QLabel(subtitle)
        s_lbl.setObjectName(f"sub_{title.replace(' ', '')}")
        s_lbl.setStyleSheet("font-size: 12px; color: #94a3b8;")

        card_layout.addWidget(t_lbl)
        card_layout.addWidget(m_lbl)
        card_layout.addWidget(s_lbl)
        return card

    def update_metrics(
        self,
        connections_count: int,
        accounts_count: int,
        workers_count: int,
        manager_version: str,
        worker_version: str,
        github_status: str
    ) -> None:
        """Updates UI display with current system metrics."""
        self.version_badge.setText(f"Manager {manager_version}")

        # Accounts
        m_acc = self.card_accounts.findChild(QLabel, "val_CloudflareAccounts")
        s_acc = self.card_accounts.findChild(QLabel, "sub_CloudflareAccounts")
        if m_acc:
            m_acc.setText(f"{connections_count} Connected")
        if s_acc:
            s_acc.setText(f"{accounts_count} Accounts accessible")

        # Workers
        m_wrk = self.card_workers.findChild(QLabel, "val_Workers")
        s_wrk = self.card_workers.findChild(QLabel, "sub_Workers")
        if m_wrk:
            m_wrk.setText(f"{workers_count} Managed")
        if s_wrk:
            s_wrk.setText(f"Worker Release: {worker_version}")

        # Updates
        m_upd = self.card_updates.findChild(QLabel, "val_Updates")
        s_upd = self.card_updates.findChild(QLabel, "sub_Updates")
        if m_upd:
            m_upd.setText(f"Worker: {worker_version}")
        if s_upd:
            s_upd.setText(f"Manager: {manager_version}")

        # GitHub Status
        self.lbl_github_status.setText(f"GitHub Status: {github_status}")

    def _on_create_worker_clicked(self) -> None:
        """Action entry point for Create Worker."""
        self.create_worker_requested.emit()
        QMessageBox.information(
            self,
            "Create Worker",
            "Create Worker Wizard entry point ready.\n\n"
            "Worker deployment orchestration is scheduled for Phase 6."
        )

    def _on_update_worker_clicked(self) -> None:
        """Action entry point for Update Worker."""
        self.update_worker_requested.emit()
        QMessageBox.information(
            self,
            "Update Worker",
            "Update Worker Wizard entry point ready.\n\n"
            "Worker update orchestration is scheduled for Phase 6."
        )
