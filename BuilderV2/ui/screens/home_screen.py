"""
LuciProxy Manager - Home Screen.
Core operational center featuring primary action buttons:
[ Add Account ], [ Create Worker ], [ Update Worker ]
and dynamically populated Cloudflare account cards with quota progress bars.
"""

from typing import Any, Dict, List, Optional
from PySide6.QtCore import Qt, Signal
from PySide6.QtWidgets import (
    QWidget,
    QVBoxLayout,
    QHBoxLayout,
    QLabel,
    QPushButton,
    QProgressBar,
    QScrollArea,
    QFrame,
)

HOME_SCREEN_STYLE = """
QWidget {
    background-color: #0a0a0a;
    color: #ffffff;
}
QFrame#actionBanner {
    background-color: #111111;
    border: 1px solid #27272a;
    border-radius: 10px;
    padding: 16px;
}
QFrame#accountCard {
    background-color: #111111;
    border: 1px solid #27272a;
    border-radius: 10px;
    padding: 16px;
}
QFrame#accountCard:hover {
    border: 1px solid #3b82f6;
    background-color: #141416;
}
QProgressBar {
    background-color: #18181b;
    border: 1px solid #27272a;
    border-radius: 4px;
    text-align: center;
    color: #ffffff;
    height: 16px;
    font-size: 10px;
    font-weight: bold;
}
QProgressBar::chunk {
    background-color: #2563eb;
    border-radius: 3px;
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
QPushButton#btnPrimary {
    background-color: #2563eb;
    border: 1px solid #1d4ed8;
    color: #ffffff;
    font-weight: bold;
    font-size: 14px;
    padding: 10px 20px;
}
QPushButton#btnPrimary:hover {
    background-color: #1d4ed8;
}
QPushButton#btnSecondary {
    background-color: #0284c7;
    border: 1px solid #0369a1;
    color: #ffffff;
    font-weight: bold;
    font-size: 14px;
    padding: 10px 20px;
}
QPushButton#btnSecondary:hover {
    background-color: #0369a1;
}
QPushButton#btnTertiary {
    background-color: #18181b;
    border: 1px solid #27272a;
    color: #ffffff;
    font-weight: 600;
    font-size: 14px;
    padding: 10px 18px;
}
QPushButton#btnTertiary:hover {
    background-color: #27272a;
}
QPushButton#btnOpen {
    background-color: #2563eb;
    border: 1px solid #1d4ed8;
    color: #ffffff;
    font-weight: bold;
    font-size: 13px;
    padding: 8px 18px;
}
QPushButton#btnOpen:hover {
    background-color: #1d4ed8;
}
"""


class HomeScreen(QWidget):
    """Home screen displaying top action buttons and account overview cards."""

    add_account_requested = Signal()
    create_worker_requested = Signal()
    update_worker_requested = Signal()
    open_account_requested = Signal(dict)
    refresh_requested = Signal()

    def __init__(self, parent: Optional = None):
        super().__init__(parent)
        self.setStyleSheet(HOME_SCREEN_STYLE)
        self._init_ui()

    def _init_ui(self) -> None:
        main_layout = QVBoxLayout(self)
        main_layout.setContentsMargins(28, 28, 28, 28)
        main_layout.setSpacing(20)

        # 1. Header Banner
        header_layout = QHBoxLayout()
        header_layout.setSpacing(12)

        title_col = QVBoxLayout()
        title_col.setSpacing(4)
        lbl_title = QLabel("LuciProxy Manager")
        lbl_title.setStyleSheet("font-size: 24px; font-weight: bold; color: #ffffff;")
        lbl_sub = QLabel("Focused Cloudflare Worker & D1 Manager")
        lbl_sub.setStyleSheet("font-size: 13px; color: #a1a1aa;")
        title_col.addWidget(lbl_title)
        title_col.addWidget(lbl_sub)
        header_layout.addLayout(title_col)

        header_layout.addStretch()

        ver_badge = QLabel("Target Worker: v1.2.1")
        ver_badge.setStyleSheet(
            "background-color: #18181b; border: 1px solid #27272a; "
            "color: #38bdf8; font-weight: bold; font-size: 12px; "
            "padding: 6px 14px; border-radius: 6px;"
        )
        header_layout.addWidget(ver_badge)

        main_layout.addLayout(header_layout)

        # Update Banner (Hidden by default, shown when updates exist)
        self.update_banner = QFrame()
        self.update_banner.setStyleSheet(
            "background-color: #172554; border: 1px solid #1e40af; border-radius: 8px; padding: 10px 16px;"
        )
        self.update_banner_layout = QHBoxLayout(self.update_banner)
        self.update_banner_layout.setContentsMargins(8, 6, 8, 6)
        self.update_banner_layout.setSpacing(12)

        self.lbl_update_banner = QLabel("")
        self.lbl_update_banner.setStyleSheet("color: #bfdbfe; font-size: 13px; font-weight: 500;")
        self.update_banner_layout.addWidget(self.lbl_update_banner)

        self.update_banner_layout.addStretch()

        self.btn_update_banner = QPushButton("Review & Update")
        self.btn_update_banner.setStyleSheet(
            "background-color: #2563eb; color: #ffffff; border: none; padding: 6px 14px; "
            "border-radius: 6px; font-weight: bold; font-size: 12px;"
        )
        self.btn_update_banner.setCursor(Qt.PointingHandCursor)
        self.btn_update_banner.clicked.connect(self.update_worker_requested.emit)
        self.update_banner_layout.addWidget(self.btn_update_banner)

        self.update_banner.setVisible(False)
        main_layout.addWidget(self.update_banner)

        # 2. Prominent Action Bar [ Add Account ] [ Create Worker ] [ Update Worker ]
        action_frame = QFrame()
        action_frame.setObjectName("actionBanner")
        action_layout = QHBoxLayout(action_frame)
        action_layout.setSpacing(14)
        action_layout.setContentsMargins(12, 10, 12, 10)

        self.btn_add_account = QPushButton("+ Add Account")
        self.btn_add_account.setObjectName("btnPrimary")
        self.btn_add_account.setCursor(Qt.PointingHandCursor)
        self.btn_add_account.clicked.connect(self.add_account_requested.emit)
        action_layout.addWidget(self.btn_add_account)

        self.btn_create_worker = QPushButton("+ Create Worker")
        self.btn_create_worker.setObjectName("btnSecondary")
        self.btn_create_worker.setCursor(Qt.PointingHandCursor)
        self.btn_create_worker.clicked.connect(self.create_worker_requested.emit)
        action_layout.addWidget(self.btn_create_worker)

        self.btn_update_worker = QPushButton("⟳ Update Worker")
        self.btn_update_worker.setObjectName("btnTertiary")
        self.btn_update_worker.setCursor(Qt.PointingHandCursor)
        self.btn_update_worker.clicked.connect(self.update_worker_requested.emit)
        action_layout.addWidget(self.btn_update_worker)

        action_layout.addStretch()

        self.btn_refresh = QPushButton("⟳ Refresh")
        self.btn_refresh.setCursor(Qt.PointingHandCursor)
        self.btn_refresh.clicked.connect(self.refresh_requested.emit)
        action_layout.addWidget(self.btn_refresh)

        main_layout.addWidget(action_frame)

        # 3. Section Title
        lbl_accounts_title = QLabel("Connected Cloudflare Accounts")
        lbl_accounts_title.setStyleSheet("font-size: 16px; font-weight: bold; color: #ffffff;")
        main_layout.addWidget(lbl_accounts_title)

        # 4. Scrollable Accounts List Area
        self.scroll_area = QScrollArea()
        self.scroll_area.setWidgetResizable(True)
        self.scroll_area.setStyleSheet("QScrollArea { border: none; background: transparent; }")

        self.cards_container = QWidget()
        self.cards_layout = QVBoxLayout(self.cards_container)
        self.cards_layout.setContentsMargins(0, 0, 0, 0)
        self.cards_layout.setSpacing(12)

        self.scroll_area.setWidget(self.cards_container)
        main_layout.addWidget(self.scroll_area)

    def set_updates_summary(
        self,
        worker_updates_count: int,
        latest_worker_version: str,
        app_has_update: bool = False,
        latest_app_version: str = "",
    ) -> None:
        """Updates the in-app update banner dynamically."""
        if worker_updates_count > 0:
            v_str = f"v{latest_worker_version}" if not latest_worker_version.startswith("v") else latest_worker_version
            self.lbl_update_banner.setText(
                f"🛡️ Worker Update Available: {v_str} is available for {worker_updates_count} Worker(s)."
            )
            self.btn_update_banner.setText("Update Worker")
            self.btn_update_banner.setVisible(True)
            self.update_banner.setVisible(True)
        elif app_has_update:
            v_str = f"v{latest_app_version}" if not latest_app_version.startswith("v") else latest_app_version
            self.lbl_update_banner.setText(
                f"⚡ Manager Update Available: LuciProxy Manager {v_str} is now available."
            )
            self.btn_update_banner.setText("Open Release")
            self.btn_update_banner.setVisible(True)
            self.update_banner.setVisible(True)
        else:
            self.update_banner.setVisible(False)

    def set_accounts(self, accounts: List[Dict[str, Any]]) -> None:
        """Renders account cards or empty state."""
        # Clear existing card widgets
        while self.cards_layout.count():
            item = self.cards_layout.takeAt(0)
            widget = item.widget()
            if widget:
                widget.deleteLater()

        if not accounts:
            self._render_empty_state()
            return

        for acc in accounts:
            card = self._create_account_card(acc)
            self.cards_layout.addWidget(card)

        self.cards_layout.addStretch()

    def _render_empty_state(self) -> None:
        empty_frame = QFrame()
        empty_frame.setStyleSheet(
            "background-color: #111111; border: 1px dashed #27272a; "
            "border-radius: 12px; padding: 40px;"
        )
        empty_layout = QVBoxLayout(empty_frame)
        empty_layout.setAlignment(Qt.AlignCenter)
        empty_layout.setSpacing(12)

        lbl_icon = QLabel("☁️")
        lbl_icon.setStyleSheet("font-size: 36px;")
        lbl_icon.setAlignment(Qt.AlignCenter)
        empty_layout.addWidget(lbl_icon)

        lbl_head = QLabel("No Cloudflare Accounts Connected")
        lbl_head.setStyleSheet("font-size: 16px; font-weight: bold; color: #ffffff;")
        lbl_head.setAlignment(Qt.AlignCenter)
        empty_layout.addWidget(lbl_head)

        lbl_desc = QLabel(
            "Click [ Add Account ] above to connect your Cloudflare account "
            "using an API token and begin deploying workers."
        )
        lbl_desc.setStyleSheet("font-size: 13px; color: #a1a1aa;")
        lbl_desc.setAlignment(Qt.AlignCenter)
        empty_layout.addWidget(lbl_desc)

        btn_add = QPushButton("+ Add Account")
        btn_add.setObjectName("btnPrimary")
        btn_add.setCursor(Qt.PointingHandCursor)
        btn_add.clicked.connect(self.add_account_requested.emit)
        empty_layout.addWidget(btn_add, alignment=Qt.AlignCenter)

        self.cards_layout.addWidget(empty_frame)
        self.cards_layout.addStretch()

    def _create_account_card(self, acc: Dict[str, Any]) -> QFrame:
        card = QFrame()
        card.setObjectName("accountCard")
        card_layout = QHBoxLayout(card)
        card_layout.setContentsMargins(16, 16, 16, 16)
        card_layout.setSpacing(20)

        # Left Column: Account Name, ID, Connection label
        left_col = QVBoxLayout()
        left_col.setSpacing(4)

        lbl_name = QLabel(acc.get("account_name", "Cloudflare Account"))
        lbl_name.setStyleSheet("font-size: 17px; font-weight: bold; color: #ffffff;")
        left_col.addWidget(lbl_name)

        lbl_id = QLabel(f"ID: {acc.get('account_id', 'Unknown')}")
        lbl_id.setStyleSheet("font-family: monospace; font-size: 11px; color: #9ca3af;")
        left_col.addWidget(lbl_id)

        has_cred = acc.get("has_credential", True)
        conn_text = f"Connection: {acc.get('connection_name', 'Default')}"
        if not has_cred:
            lbl_conn = QLabel(f"{conn_text} &nbsp;<span style='color: #f59e0b; font-weight: bold;'>[⚠️ Credential Unavailable]</span>")
        else:
            lbl_conn = QLabel(conn_text)
        lbl_conn.setStyleSheet("font-size: 11px; color: #64748b;")
        left_col.addWidget(lbl_conn)

        card_layout.addLayout(left_col, stretch=2)

        # Middle Column: Stats & Quota Progress Bar
        mid_col = QVBoxLayout()
        mid_col.setSpacing(6)

        stats_row = QHBoxLayout()
        stats_row.setSpacing(16)

        w_count = acc.get("workers_count", 0)
        lbl_workers = QLabel(f"Workers: <b>{w_count}</b>")
        lbl_workers.setStyleSheet("color: #e2e8f0; font-size: 12px;")
        stats_row.addWidget(lbl_workers)

        d1_count = acc.get("d1_count", 0)
        lbl_d1 = QLabel(f"D1 Databases: <b>{d1_count}</b>")
        lbl_d1.setStyleSheet("color: #e2e8f0; font-size: 12px;")
        stats_row.addWidget(lbl_d1)

        req_text = acc.get("requests", "Unavailable")
        req_num = acc.get("requests_num")
        quota_num = acc.get("quota_num")
        quota_text = acc.get("quota", "Unavailable")

        if req_num is not None:
            if quota_num is not None and quota_num > 0:
                lbl_req = QLabel(f"Requests: <b>{req_text} / {quota_text}</b>")
            else:
                lbl_req = QLabel(f"Requests: <b>{req_text}</b> (Quota: Unavailable)")
        else:
            lbl_req = QLabel("Requests: <b>Unavailable</b> (Quota: Unavailable)")
        lbl_req.setStyleSheet("color: #38bdf8; font-size: 12px;")
        stats_row.addWidget(lbl_req)

        stats_row.addStretch()
        mid_col.addLayout(stats_row)

        # Progress bar for requests (only rendered if authoritative quota is available)
        if req_num is not None and quota_num is not None and quota_num > 0:
            prog = QProgressBar()
            prog.setRange(0, quota_num)
            prog.setValue(min(req_num, quota_num))
            prog.setFormat(f"{req_num:,} / {quota_num:,} (%p%)")
            mid_col.addWidget(prog)

        card_layout.addLayout(mid_col, stretch=3)

        # Right Column: [ Open ] Action Button
        right_col = QVBoxLayout()
        right_col.setAlignment(Qt.AlignCenter)

        btn_open = QPushButton("Open →")
        btn_open.setObjectName("btnOpen")
        btn_open.setCursor(Qt.PointingHandCursor)
        btn_open.clicked.connect(lambda _, a=acc: self.open_account_requested.emit(a))
        right_col.addWidget(btn_open)

        card_layout.addLayout(right_col)

        return card
