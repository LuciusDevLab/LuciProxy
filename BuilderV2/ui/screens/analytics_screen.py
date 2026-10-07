"""
LuciProxy Manager - Analytics Screen Widget.
Provides UI foundation for Cloudflare GraphQL Workers metrics.
Displays request volumes, errors, subrequests, and CPU execution quantiles.
Gracefully handles accounts without GraphQL dataset permissions.
"""

from typing import Dict, Optional
from PySide6.QtCore import Qt
from PySide6.QtWidgets import (
    QWidget,
    QVBoxLayout,
    QHBoxLayout,
    QLabel,
    QPushButton,
    QComboBox,
    QFrame,
    QProgressBar,
)

from ..async_worker import run_in_background
from ..controllers.account_controller import AccountController
from ..controllers.analytics_controller import AnalyticsController


class AnalyticsScreen(QWidget):
    """Analytics UI foundation screen."""

    def __init__(
        self,
        account_controller: AccountController,
        analytics_controller: AnalyticsController,
        parent: Optional = None
    ):
        super().__init__(parent)
        self.account_controller = account_controller
        self.analytics_controller = analytics_controller
        self._init_ui()

    def _init_ui(self) -> None:
        layout = QVBoxLayout(self)
        layout.setContentsMargins(32, 32, 32, 32)
        layout.setSpacing(20)

        # Top Bar
        top_layout = QHBoxLayout()
        title = QLabel("Workers Analytics (Last 24 Hours)")
        title.setStyleSheet("font-size: 22px; font-weight: bold; color: #1e293b;")
        top_layout.addWidget(title)
        top_layout.addStretch()

        top_layout.addWidget(QLabel("Connection:"))
        self.combo_connection = QComboBox()
        self.combo_connection.setMinimumWidth(180)
        self.combo_connection.currentIndexChanged.connect(self._on_connection_changed)
        top_layout.addWidget(self.combo_connection)

        top_layout.addWidget(QLabel("Account:"))
        self.combo_account = QComboBox()
        self.combo_account.setMinimumWidth(200)
        self.combo_account.currentIndexChanged.connect(self._on_account_changed)
        top_layout.addWidget(self.combo_account)

        self.btn_refresh = QPushButton("⟳ Query Metrics")
        self.btn_refresh.clicked.connect(self.refresh_analytics)
        top_layout.addWidget(self.btn_refresh)

        layout.addLayout(top_layout)

        # Progress indicator
        self.progress = QProgressBar()
        self.progress.setRange(0, 0)
        self.progress.setVisible(False)
        layout.addWidget(self.progress)

        self.lbl_status = QLabel("Select an account to query metrics.")
        self.lbl_status.setStyleSheet("color: #64748b; font-size: 13px;")
        layout.addWidget(self.lbl_status)

        # Metrics Cards Grid
        self.cards_frame = QFrame()
        cards_layout = QHBoxLayout(self.cards_frame)
        cards_layout.setContentsMargins(0, 0, 0, 0)
        cards_layout.setSpacing(16)

        self.card_requests = self._create_card("Total Requests", "-", "Incoming edge traffic")
        cards_layout.addWidget(self.card_requests)

        self.card_errors = self._create_card("Errors", "-", "5xx / uncaught exceptions")
        cards_layout.addWidget(self.card_errors)

        self.card_subrequests = self._create_card("Subrequests", "-", "Upstream / proxy fetches")
        cards_layout.addWidget(self.card_subrequests)

        self.card_cpu = self._create_card("CPU Time", "-", "P50 / P99 microseconds")
        cards_layout.addWidget(self.card_cpu)

        layout.addWidget(self.cards_frame)

        # Notice Banner (for unavailable analytics or notes)
        self.banner = QFrame()
        self.banner.setStyleSheet(
            "background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px;"
        )
        banner_layout = QVBoxLayout(self.banner)
        self.lbl_banner = QLabel("GraphQL Analytics ready for query.")
        self.lbl_banner.setWordWrap(True)
        self.lbl_banner.setStyleSheet("color: #475569; font-size: 13px;")
        banner_layout.addWidget(self.lbl_banner)

        layout.addWidget(self.banner)
        layout.addStretch()

    def _create_card(self, title: str, main_val: str, subtitle: str) -> QFrame:
        card = QFrame()
        card.setStyleSheet(
            "background-color: white; border: 1px solid #e2e8f0; border-radius: 10px; padding: 16px;"
        )
        c_layout = QVBoxLayout(card)
        c_layout.setSpacing(4)

        t_lbl = QLabel(title)
        t_lbl.setStyleSheet("font-size: 12px; font-weight: 600; color: #64748b; text-transform: uppercase;")
        m_lbl = QLabel(main_val)
        m_lbl.setObjectName("val")
        m_lbl.setStyleSheet("font-size: 24px; font-weight: bold; color: #0f172a;")
        s_lbl = QLabel(subtitle)
        s_lbl.setObjectName("sub")
        s_lbl.setStyleSheet("font-size: 11px; color: #94a3b8;")

        c_layout.addWidget(t_lbl)
        c_layout.addWidget(m_lbl)
        c_layout.addWidget(s_lbl)
        return card

    def populate_connections(self) -> None:
        self.combo_connection.blockSignals(True)
        self.combo_connection.clear()

        connections = self.account_controller.list_connections()
        for c in connections:
            self.combo_connection.addItem(c.displayName, c.connectionId)

        self.combo_connection.blockSignals(False)
        self._on_connection_changed()

    def _on_connection_changed(self) -> None:
        conn_id = self.combo_connection.currentData()
        self.combo_account.blockSignals(True)
        self.combo_account.clear()

        if conn_id:
            accounts = self.account_controller.get_accounts_for_connection(conn_id)
            for acc in accounts:
                self.combo_account.addItem(acc.accountName, acc.accountId)

        self.combo_account.blockSignals(False)
        self._on_account_changed()

    def _on_account_changed(self) -> None:
        self.refresh_analytics()

    def refresh_analytics(self) -> None:
        conn_id = self.combo_connection.currentData()
        acc_id = self.combo_account.currentData()

        if not conn_id or not acc_id:
            self.lbl_status.setText("No connection or account selected.")
            return

        self.progress.setVisible(True)
        self.lbl_status.setText(f"Querying GraphQL analytics for {self.combo_account.currentText()}...")
        self.btn_refresh.setEnabled(False)

        def query_task():
            return self.analytics_controller.get_worker_analytics(conn_id, acc_id)

        def on_done(res: Dict):
            self.progress.setVisible(False)
            self.btn_refresh.setEnabled(True)

            if not res.get("available", False):
                self.lbl_status.setText("Analytics unavailable.")
                self.lbl_banner.setText(
                    f"Analytics unavailable for this token/account/plan.\nReason: {res.get('reason', 'Dataset permission denied')}"
                )
                self._update_card(self.card_requests, "-", "Unavailable")
                self._update_card(self.card_errors, "-", "Unavailable")
                self._update_card(self.card_subrequests, "-", "Unavailable")
                self._update_card(self.card_cpu, "-", "Unavailable")
                return

            self.lbl_status.setText("Analytics successfully loaded.")
            self.lbl_banner.setText(f"Time Window: {res.get('since')} to {res.get('until')}")

            reqs = res.get("requests", 0)
            errs = res.get("errors", 0)
            subreqs = res.get("subrequests", 0)
            p50 = res.get("cpu_time_p50", 0)
            p99 = res.get("cpu_time_p99", 0)

            self._update_card(self.card_requests, f"{reqs:,}", "Total Edge Invocations")
            self._update_card(self.card_errors, f"{errs:,}", "Reported Errors")
            self._update_card(self.card_subrequests, f"{subreqs:,}", "Subrequests")
            self._update_card(self.card_cpu, f"{p50} / {p99} μs", "P50 / P99 Execution")

        def on_fail(err: str, exc: Exception):
            self.progress.setVisible(False)
            self.btn_refresh.setEnabled(True)
            self.lbl_status.setText(f"Analytics query failed: {err}")
            self.lbl_banner.setText(f"Analytics query failed: {err}")

        run_in_background(query_task, on_result=on_done, on_error=on_fail)

    def _update_card(self, card: QFrame, val: str, sub: str) -> None:
        val_lbl = card.findChild(QLabel, "val")
        sub_lbl = card.findChild(QLabel, "sub")
        if val_lbl:
            val_lbl.setText(val)
        if sub_lbl:
            sub_lbl.setText(sub)
