"""
LuciProxy Manager - Account Details Screen.
Displays comprehensive account state:
1. Account info & Daily request usage (with authoritative quota if provided)
2. Workers in this account rendered as clean, responsive cards with individual [ Update ] and [ Delete ] actions
3. D1 Databases partitioned cleanly into Linked Databases and Unassigned Databases
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
    QTableWidget,
    QTableWidgetItem,
    QHeaderView,
    QScrollArea,
    QFrame,
    QMessageBox,
)

from ..async_worker import run_in_background
from ..controllers.account_controller import AccountController
from ..controllers.worker_controller import WorkerController
from ..controllers.d1_controller import D1Controller
from ..dialogs.update_worker_dialog import UpdateWorkerDialog
from ..dialogs.delete_worker_dialog import DeleteWorkerDialog
from ..dialogs.create_worker_dialog import CreateWorkerDialog
from ..dialogs.reconnect_account_dialog import ReconnectAccountDialog

ACCOUNT_DETAILS_STYLE = """
QWidget {
    background-color: #0a0a0a;
    color: #ffffff;
}
QFrame#cardFrame {
    background-color: #111111;
    border: 1px solid #27272a;
    border-radius: 8px;
    padding: 16px;
}
QLabel#sectionTitle {
    font-size: 16px;
    font-weight: bold;
    color: #ffffff;
}
QProgressBar {
    background-color: #18181b;
    border: 1px solid #27272a;
    border-radius: 4px;
    text-align: center;
    color: #ffffff;
    height: 18px;
    font-size: 11px;
    font-weight: bold;
}
QProgressBar::chunk {
    background-color: #2563eb;
    border-radius: 3px;
}
QTableWidget {
    background-color: #111111;
    alternate-background-color: #161616;
    color: #ffffff;
    border: 1px solid #27272a;
    border-radius: 6px;
    gridline-color: #27272a;
}
QTableWidget::item {
    padding: 8px 12px;
    color: #ffffff;
}
QTableWidget::item:selected {
    background-color: #1e3a8a;
    color: #ffffff;
}
QHeaderView::section {
    background-color: #18181b;
    color: #a1a1aa;
    border: 1px solid #27272a;
    padding: 8px 12px;
    font-weight: bold;
    font-size: 12px;
}
QPushButton {
    background-color: #27272a;
    color: #ffffff;
    border: 1px solid #3f3f46;
    border-radius: 6px;
    padding: 6px 14px;
    font-size: 12px;
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
}
QPushButton#btnPrimary:hover {
    background-color: #1d4ed8;
}
QPushButton#btnBack {
    background-color: #18181b;
    border: 1px solid #27272a;
    color: #e2e8f0;
    font-weight: bold;
    padding: 8px 16px;
}
QPushButton#btnBack:hover {
    background-color: #27272a;
}
"""


class AccountDetailsScreen(QWidget):
    """Account Details view with workers and partitioned D1 databases."""

    back_requested = Signal()
    refresh_all_requested = Signal()

    def __init__(
        self,
        account_ctrl: AccountController,
        worker_ctrl: WorkerController,
        d1_ctrl: D1Controller,
        parent: Optional = None,
    ):
        super().__init__(parent)
        self.account_ctrl = account_ctrl
        self.worker_ctrl = worker_ctrl
        self.d1_ctrl = d1_ctrl

        self.connection_id: Optional[str] = None
        self.account_id: Optional[str] = None
        self.account_name: str = ""
        self.connection_name: str = ""

        self._workers: List[Dict[str, Any]] = []
        self._d1_databases: List[Dict[str, Any]] = []

        self.setStyleSheet(ACCOUNT_DETAILS_STYLE)
        self._init_ui()

    def _init_ui(self) -> None:
        main_layout = QVBoxLayout(self)
        main_layout.setContentsMargins(24, 24, 24, 24)
        main_layout.setSpacing(16)

        # 1. Top Navigation Bar: [ Back ] | Account Name | [ Create Worker ] [ Refresh ]
        top_bar = QHBoxLayout()
        top_bar.setSpacing(12)

        self.btn_back = QPushButton("← Back to Accounts")
        self.btn_back.setObjectName("btnBack")
        self.btn_back.setCursor(Qt.PointingHandCursor)
        self.btn_back.clicked.connect(self.back_requested.emit)
        top_bar.addWidget(self.btn_back)

        self.lbl_title = QLabel("Account Details")
        self.lbl_title.setStyleSheet("font-size: 20px; font-weight: bold; color: #ffffff;")
        top_bar.addWidget(self.lbl_title)

        top_bar.addStretch()

        self.btn_create_worker = QPushButton("+ Create Worker")
        self.btn_create_worker.setObjectName("btnPrimary")
        self.btn_create_worker.setCursor(Qt.PointingHandCursor)
        self.btn_create_worker.clicked.connect(self._open_create_worker)
        top_bar.addWidget(self.btn_create_worker)

        self.btn_refresh = QPushButton("⟳ Refresh")
        self.btn_refresh.setCursor(Qt.PointingHandCursor)
        self.btn_refresh.clicked.connect(self.reload)
        top_bar.addWidget(self.btn_refresh)

        main_layout.addLayout(top_bar)

        # Scroll Area for main content
        scroll = QScrollArea()
        scroll.setWidgetResizable(True)
        scroll.setStyleSheet("QScrollArea { border: none; background: transparent; }")

        content_widget = QWidget()
        self.content_layout = QVBoxLayout(content_widget)
        self.content_layout.setContentsMargins(0, 0, 0, 0)
        self.content_layout.setSpacing(18)

        # Reconnect Warning Banner (visible when API credential is unavailable)
        self.banner_reconnect = QFrame()
        self.banner_reconnect.setStyleSheet(
            "background-color: #271c0c; border: 1px solid #b45309; border-radius: 8px; padding: 10px 14px;"
        )
        banner_layout = QHBoxLayout(self.banner_reconnect)
        banner_layout.setContentsMargins(10, 6, 10, 6)
        banner_layout.setSpacing(12)

        lbl_warn_icon = QLabel("⚠️")
        lbl_warn_icon.setStyleSheet("font-size: 18px;")
        banner_layout.addWidget(lbl_warn_icon)

        lbl_warn_text = QLabel(
            "<b>API Credential Unavailable:</b> No Cloudflare token found in secure storage for this connection. "
            "Live data cannot be refreshed until reconnected."
        )
        lbl_warn_text.setStyleSheet("color: #fde68a; font-size: 12px;")
        lbl_warn_text.setWordWrap(True)
        banner_layout.addWidget(lbl_warn_text, stretch=1)

        self.btn_reconnect_banner = QPushButton("Reconnect Account")
        self.btn_reconnect_banner.setStyleSheet(
            "background-color: #d97706; color: #ffffff; font-weight: bold; border: none; "
            "border-radius: 6px; padding: 6px 14px; font-size: 12px;"
        )
        self.btn_reconnect_banner.setCursor(Qt.PointingHandCursor)
        self.btn_reconnect_banner.clicked.connect(self._open_reconnect_dialog)
        banner_layout.addWidget(self.btn_reconnect_banner)

        self.banner_reconnect.setVisible(False)
        self.content_layout.addWidget(self.banner_reconnect)

        # 2. Account Overview & Quota Card
        self.card_overview = QFrame()
        self.card_overview.setObjectName("cardFrame")
        ov_layout = QVBoxLayout(self.card_overview)
        ov_layout.setSpacing(12)

        self.lbl_account_meta = QLabel("Loading account details...")
        self.lbl_account_meta.setStyleSheet("font-size: 13px; color: #a1a1aa;")
        ov_layout.addWidget(self.lbl_account_meta)

        # Requests usage row
        req_header_layout = QHBoxLayout()
        lbl_req_title = QLabel("Requests Used Today:")
        lbl_req_title.setStyleSheet("font-weight: bold; color: #ffffff; font-size: 13px;")
        req_header_layout.addWidget(lbl_req_title)

        self.lbl_req_count = QLabel("Unavailable")
        self.lbl_req_count.setStyleSheet("font-weight: bold; color: #38bdf8; font-size: 13px;")
        req_header_layout.addWidget(self.lbl_req_count)
        req_header_layout.addStretch()

        self.lbl_quota_subtitle = QLabel("Quota: Unavailable")
        self.lbl_quota_subtitle.setStyleSheet("color: #71717a; font-size: 11px;")
        req_header_layout.addWidget(self.lbl_quota_subtitle)
        ov_layout.addLayout(req_header_layout)

        self.prog_requests = QProgressBar()
        self.prog_requests.setVisible(False)
        ov_layout.addWidget(self.prog_requests)

        self.content_layout.addWidget(self.card_overview)

        # 3. Workers Section
        lbl_workers_section = QLabel("Workers in this Account")
        lbl_workers_section.setObjectName("sectionTitle")
        self.content_layout.addWidget(lbl_workers_section)

        # Responsive card container for Workers
        self.workers_container = QWidget()
        self.workers_layout = QVBoxLayout(self.workers_container)
        self.workers_layout.setContentsMargins(0, 0, 0, 0)
        self.workers_layout.setSpacing(10)
        self.content_layout.addWidget(self.workers_container)

        # 4. D1 Databases Section
        lbl_d1_section = QLabel("D1 Databases in this Account")
        lbl_d1_section.setObjectName("sectionTitle")
        self.content_layout.addWidget(lbl_d1_section)

        # Linked Databases Subheading & Table
        lbl_linked = QLabel("🔗 Linked Databases (Bound to Workers)")
        lbl_linked.setStyleSheet("font-size: 14px; font-weight: 600; color: #38bdf8; margin-top: 6px;")
        self.content_layout.addWidget(lbl_linked)

        self.tbl_d1_linked = QTableWidget()
        self.tbl_d1_linked.setColumnCount(5)
        self.tbl_d1_linked.setHorizontalHeaderLabels([
            "Database Name", "UUID", "Linked Worker", "Binding Name", "Tables"
        ])
        self.tbl_d1_linked.horizontalHeader().setSectionResizeMode(0, QHeaderView.Interactive)
        self.tbl_d1_linked.horizontalHeader().setSectionResizeMode(1, QHeaderView.Stretch)
        self.tbl_d1_linked.horizontalHeader().setSectionResizeMode(2, QHeaderView.Interactive)
        self.tbl_d1_linked.horizontalHeader().setSectionResizeMode(3, QHeaderView.Interactive)
        self.tbl_d1_linked.horizontalHeader().setSectionResizeMode(4, QHeaderView.ResizeToContents)
        self.tbl_d1_linked.setColumnWidth(0, 180)
        self.tbl_d1_linked.setColumnWidth(2, 160)
        self.tbl_d1_linked.setColumnWidth(3, 110)
        self.tbl_d1_linked.setColumnWidth(4, 70)
        self.tbl_d1_linked.verticalHeader().setDefaultSectionSize(36)
        self.tbl_d1_linked.verticalHeader().setVisible(False)
        self.tbl_d1_linked.setMinimumHeight(140)
        self.tbl_d1_linked.setAlternatingRowColors(True)
        self.tbl_d1_linked.setEditTriggers(QTableWidget.NoEditTriggers)
        self.content_layout.addWidget(self.tbl_d1_linked)

        # Unassigned Databases Subheading & Table
        lbl_unassigned = QLabel("📦 Unassigned Databases (Not bound to any Worker)")
        lbl_unassigned.setStyleSheet("font-size: 14px; font-weight: 600; color: #eab308; margin-top: 10px;")
        self.content_layout.addWidget(lbl_unassigned)

        self.tbl_d1_unassigned = QTableWidget()
        self.tbl_d1_unassigned.setColumnCount(4)
        self.tbl_d1_unassigned.setHorizontalHeaderLabels([
            "Database Name", "UUID", "Status", "Tables"
        ])
        self.tbl_d1_unassigned.horizontalHeader().setSectionResizeMode(0, QHeaderView.Interactive)
        self.tbl_d1_unassigned.horizontalHeader().setSectionResizeMode(1, QHeaderView.Stretch)
        self.tbl_d1_unassigned.horizontalHeader().setSectionResizeMode(2, QHeaderView.Interactive)
        self.tbl_d1_unassigned.horizontalHeader().setSectionResizeMode(3, QHeaderView.ResizeToContents)
        self.tbl_d1_unassigned.setColumnWidth(0, 200)
        self.tbl_d1_unassigned.setColumnWidth(2, 110)
        self.tbl_d1_unassigned.setColumnWidth(3, 70)
        self.tbl_d1_unassigned.verticalHeader().setDefaultSectionSize(36)
        self.tbl_d1_unassigned.verticalHeader().setVisible(False)
        self.tbl_d1_unassigned.setMinimumHeight(140)
        self.tbl_d1_unassigned.setAlternatingRowColors(True)
        self.tbl_d1_unassigned.setEditTriggers(QTableWidget.NoEditTriggers)
        self.content_layout.addWidget(self.tbl_d1_unassigned)

        scroll.setWidget(content_widget)
        main_layout.addWidget(scroll)

    def load_account(
        self,
        connection_id: str,
        account_id: str,
        account_name: str = "",
        connection_name: str = ""
    ) -> None:
        """Loads and displays account details."""
        self.connection_id = connection_id
        self.account_id = account_id
        self.account_name = account_name or "Cloudflare Account"
        self.connection_name = connection_name or "Active Connection"

        self.lbl_title.setText(f"Account: {self.account_name}")
        self.lbl_account_meta.setText(
            f"Account ID: <b>{self.account_id}</b> | Connection: <b>{self.connection_name}</b> | Status: <span style='color: #22c55e;'>Connected</span>"
        )
        self.reload()

    def reload(self) -> None:
        """Asynchronously loads workers, D1 databases, and analytics."""
        if not self.connection_id or not self.account_id:
            return

        conn_id = self.connection_id
        acc_id = self.account_id

        self.btn_refresh.setEnabled(False)
        self.btn_refresh.setText("Loading...")

        def fetch_all():
            has_token = self.account_ctrl.has_credential(conn_id)
            if not has_token:
                return {
                    "credential_missing": True,
                    "summary": {
                        "workers_count": 0,
                        "d1_count": 0,
                        "requests": "Unavailable",
                        "requests_num": None,
                        "quota": "Unavailable",
                        "quota_num": None,
                    },
                    "workers": [],
                    "d1_partitioned": {"linked": [], "unassigned": []},
                }

            summary = self.account_ctrl.get_account_summary(conn_id, acc_id)
            workers = self.worker_ctrl.list_workers(conn_id, acc_id)
            d1_dbs = self.d1_ctrl.list_d1_databases(conn_id, acc_id)
            d1_partitioned = self.d1_ctrl.correlate_d1_databases(d1_dbs, workers)
            return {
                "credential_missing": False,
                "summary": summary,
                "workers": workers,
                "d1_partitioned": d1_partitioned,
            }

        run_in_background(
            fn=fetch_all,
            on_success=self._on_data_loaded,
            on_error=self._on_data_error,
        )

    def _on_data_loaded(self, data: Dict[str, Any]) -> None:
        self.btn_refresh.setEnabled(True)
        self.btn_refresh.setText("⟳ Refresh")

        is_missing = data.get("credential_missing", False)
        self.banner_reconnect.setVisible(is_missing)

        if is_missing:
            self.lbl_account_meta.setText(
                f"Account ID: <b>{self.account_id}</b> | Connection: <b>{self.connection_name}</b> | "
                f"Status: <span style='color: #f59e0b; font-weight: bold;'>Credential Unavailable</span>"
            )
            self.btn_create_worker.setEnabled(False)
            self.btn_create_worker.setToolTip("Reconnect account credential to create workers.")
        else:
            self.lbl_account_meta.setText(
                f"Account ID: <b>{self.account_id}</b> | Connection: <b>{self.connection_name}</b> | "
                f"Status: <span style='color: #22c55e;'>Connected</span>"
            )
            self.btn_create_worker.setEnabled(True)
            self.btn_create_worker.setToolTip("")

        summary = data["summary"]
        self._workers = data["workers"]
        d1_partitioned = data["d1_partitioned"]

        # Update Request Usage & Quota
        req_num = summary.get("requests_num")
        quota_num = summary.get("quota_num")

        if req_num is not None:
            if quota_num is not None and quota_num > 0:
                self.lbl_req_count.setText(f"{req_num:,} / {quota_num:,}")
                self.lbl_quota_subtitle.setText(f"Quota: {quota_num:,} requests")
                self.prog_requests.setVisible(True)
                self.prog_requests.setRange(0, quota_num)
                self.prog_requests.setValue(min(req_num, quota_num))
                self.prog_requests.setFormat(f"%v / {quota_num:,} requests (%p%)")
            else:
                self.lbl_req_count.setText(f"{req_num:,}")
                self.lbl_quota_subtitle.setText("Quota: Unavailable")
                self.prog_requests.setVisible(False)
        else:
            self.lbl_req_count.setText("Unavailable")
            self.lbl_quota_subtitle.setText("Quota: Unavailable")
            self.prog_requests.setVisible(False)

        # Populate Workers Card List
        self._populate_workers_cards(self._workers)

        # Populate D1 Tables
        self._populate_d1_tables(d1_partitioned)

    def _on_data_error(self, err: Exception) -> None:
        self.btn_refresh.setEnabled(True)
        self.btn_refresh.setText("⟳ Refresh")
        QMessageBox.warning(self, "Load Error", f"Failed to refresh account data:\n{err}")

    def _populate_workers_cards(self, workers: List[Dict[str, Any]]) -> None:
        # Clear existing worker card widgets
        while self.workers_layout.count():
            item = self.workers_layout.takeAt(0)
            widget = item.widget()
            if widget:
                widget.deleteLater()

        if not workers:
            empty_frame = QFrame()
            empty_frame.setStyleSheet(
                "background-color: #111111; border: 1px dashed #27272a; border-radius: 8px; padding: 24px;"
            )
            empty_layout = QVBoxLayout(empty_frame)
            lbl_empty = QLabel("No Workers deployed in this account.")
            lbl_empty.setStyleSheet("color: #71717a; font-size: 13px;")
            lbl_empty.setAlignment(Qt.AlignCenter)
            empty_layout.addWidget(lbl_empty)
            self.workers_layout.addWidget(empty_frame)
            return

        for w in workers:
            card = QFrame()
            card.setStyleSheet(
                "QFrame { background-color: #111111; border: 1px solid #27272a; border-radius: 8px; padding: 12px 16px; }"
                "QFrame:hover { border: 1px solid #3f3f46; }"
            )
            card_layout = QHBoxLayout(card)
            card_layout.setContentsMargins(14, 12, 14, 12)
            card_layout.setSpacing(16)

            # Left side: Name, badges, and linked D1
            left_col = QVBoxLayout()
            left_col.setSpacing(6)

            # Top row: Name + badges
            top_row = QHBoxLayout()
            top_row.setSpacing(8)

            lbl_name = QLabel(w["name"])
            lbl_name.setStyleSheet("font-size: 15px; font-weight: bold; color: #ffffff;")
            top_row.addWidget(lbl_name)

            # Status badge
            lbl_status = QLabel("● Active")
            lbl_status.setStyleSheet(
                "color: #22c55e; background-color: #052e16; border: 1px solid #14532d; "
                "border-radius: 4px; padding: 2px 8px; font-size: 11px; font-weight: 600;"
            )
            top_row.addWidget(lbl_status)

            # Version badges: Installed & Latest Available
            inst_ver = w.get("installed_version", "Unknown")
            avail_ver = w.get("latest_version", "Unknown")
            has_update = w.get("has_update", False)
            v_status = w.get("version_status", "unknown")

            inst_label = f"Installed: v{inst_ver}" if not str(inst_ver).startswith("v") and inst_ver != "Unknown" else f"Installed: {inst_ver}"
            lbl_ver = QLabel(inst_label)
            lbl_ver.setStyleSheet(
                "color: #38bdf8; background-color: #082f49; border: 1px solid #0369a1; "
                "border-radius: 4px; padding: 2px 8px; font-size: 11px; font-weight: 600;"
            )
            top_row.addWidget(lbl_ver)

            if avail_ver and avail_ver != "Unknown":
                lbl_avail = QLabel(f"Latest: v{avail_ver}" if not str(avail_ver).startswith("v") else f"Latest: {avail_ver}")
                lbl_avail.setStyleSheet(
                    "color: #94a3b8; background-color: #1e293b; border: 1px solid #334155; "
                    "border-radius: 4px; padding: 2px 8px; font-size: 11px; font-weight: 600;"
                )
                top_row.addWidget(lbl_avail)

            if has_update:
                lbl_upd = QLabel("● Update Available")
                lbl_upd.setStyleSheet(
                    "color: #f59e0b; background-color: #451a03; border: 1px solid #78350f; "
                    "border-radius: 4px; padding: 2px 8px; font-size: 11px; font-weight: bold;"
                )
                top_row.addWidget(lbl_upd)
            elif v_status == "up_to_date":
                lbl_uptodate = QLabel("● Up to date")
                lbl_uptodate.setStyleSheet(
                    "color: #22c55e; background-color: #052e16; border: 1px solid #14532d; "
                    "border-radius: 4px; padding: 2px 8px; font-size: 11px; font-weight: 600;"
                )
                top_row.addWidget(lbl_uptodate)
            elif v_status == "newer_than_published":
                lbl_dev = QLabel("● Dev Build")
                lbl_dev.setStyleSheet(
                    "color: #c084fc; background-color: #3b0764; border: 1px solid #581c87; "
                    "border-radius: 4px; padding: 2px 8px; font-size: 11px; font-weight: 600;"
                )
                top_row.addWidget(lbl_dev)

            if w.get("is_luciproxy"):
                lbl_lp = QLabel("LuciProxy")
                lbl_lp.setStyleSheet(
                    "color: #c084fc; background-color: #3b0764; border: 1px solid #581c87; "
                    "border-radius: 4px; padding: 2px 8px; font-size: 11px; font-weight: 600;"
                )
                top_row.addWidget(lbl_lp)

            top_row.addStretch()
            left_col.addLayout(top_row)

            # Bottom row: Linked D1 info
            d1_display = w.get("d1_display", "No binding")
            lbl_d1 = QLabel(f"🔗 Linked Database: {d1_display}")
            lbl_d1.setStyleSheet("color: #9ca3af; font-size: 12px;")
            left_col.addWidget(lbl_d1)

            card_layout.addLayout(left_col, stretch=1)

            # Right side: Action buttons [ Update ] [ Delete ] with min width >= 95px
            act_layout = QHBoxLayout()
            act_layout.setSpacing(10)

            btn_update = QPushButton("⟳ Update")
            btn_update.setStyleSheet(
                "QPushButton { background-color: #0284c7; border: 1px solid #0369a1; color: white; "
                "padding: 7px 16px; border-radius: 6px; font-weight: bold; font-size: 12px; min-width: 95px; } "
                "QPushButton:hover { background-color: #0369a1; }"
            )
            btn_update.setMinimumWidth(95)
            btn_update.setCursor(Qt.PointingHandCursor)
            btn_update.clicked.connect(lambda _, wrk=w: self._open_update_worker(wrk["name"]))
            act_layout.addWidget(btn_update)

            btn_delete = QPushButton("🗑 Delete")
            btn_delete.setStyleSheet(
                "QPushButton { background-color: #dc2626; border: 1px solid #b91c1c; color: white; "
                "padding: 7px 16px; border-radius: 6px; font-weight: bold; font-size: 12px; min-width: 95px; } "
                "QPushButton:hover { background-color: #b91c1c; }"
            )
            btn_delete.setMinimumWidth(95)
            btn_delete.setCursor(Qt.PointingHandCursor)
            btn_delete.clicked.connect(lambda _, wrk=w: self._open_delete_worker(wrk))
            act_layout.addWidget(btn_delete)

            card_layout.addLayout(act_layout)
            self.workers_layout.addWidget(card)

    def _populate_d1_tables(self, d1_partitioned: Dict[str, List[Dict[str, Any]]]) -> None:
        linked = d1_partitioned.get("linked", [])
        unassigned = d1_partitioned.get("unassigned", [])

        # Linked Table
        self.tbl_d1_linked.setRowCount(len(linked))
        for row, db in enumerate(linked):
            self.tbl_d1_linked.setItem(row, 0, QTableWidgetItem(db["name"]))
            self.tbl_d1_linked.setItem(row, 1, QTableWidgetItem(db["uuid"]))
            self.tbl_d1_linked.setItem(row, 2, QTableWidgetItem(db["worker_name"]))
            self.tbl_d1_linked.setItem(row, 3, QTableWidgetItem(db["binding_name"]))
            self.tbl_d1_linked.setItem(row, 4, QTableWidgetItem(str(db.get("num_tables", 0))))

        # Unassigned Table
        self.tbl_d1_unassigned.setRowCount(len(unassigned))
        for row, db in enumerate(unassigned):
            self.tbl_d1_unassigned.setItem(row, 0, QTableWidgetItem(db["name"]))
            self.tbl_d1_unassigned.setItem(row, 1, QTableWidgetItem(db["uuid"]))
            item_status = QTableWidgetItem("Unassigned")
            item_status.setForeground(Qt.yellow)
            self.tbl_d1_unassigned.setItem(row, 2, item_status)
            self.tbl_d1_unassigned.setItem(row, 3, QTableWidgetItem(str(db.get("num_tables", 0))))

    def _open_create_worker(self) -> None:
        if not self.account_ctrl.has_credential(self.connection_id):
            QMessageBox.information(
                self,
                "Reconnect Required",
                "Cannot deploy a worker because the API token for this connection is not available in secure storage.\n\nPlease click 'Reconnect Account' first."
            )
            self._open_reconnect_dialog()
            return

        dialog = CreateWorkerDialog(
            account_ctrl=self.account_ctrl,
            worker_ctrl=self.worker_ctrl,
            preselected_account_id=self.account_id,
            parent=self,
        )
        dialog.worker_created.connect(lambda _: self.reload())
        dialog.exec()

    def _open_reconnect_dialog(self) -> None:
        dialog = ReconnectAccountDialog(
            connection_id=self.connection_id,
            connection_name=self.connection_name,
            controller=self.account_ctrl,
            parent=self,
        )
        dialog.reconnected.connect(self._on_reconnected)
        dialog.exec()

    def _on_reconnected(self) -> None:
        self.reload()
        self.refresh_all_requested.emit()

    def _open_update_worker(self, worker_name: str) -> None:
        if not self.account_ctrl.has_credential(self.connection_id):
            QMessageBox.information(
                self,
                "Reconnect Required",
                "Cannot update a worker because the API token for this connection is not available in secure storage.\n\nPlease click 'Reconnect Account' first.",
            )
            self._open_reconnect_dialog()
            return

        dialog = UpdateWorkerDialog(
            account_ctrl=self.account_ctrl,
            worker_ctrl=self.worker_ctrl,
            preselected_account_id=self.account_id,
            preselected_worker_name=worker_name,
            parent=self,
        )
        dialog.worker_updated.connect(lambda _: self.reload())
        dialog.exec()

    def _open_delete_worker(self, worker_data: Dict[str, Any]) -> None:
        if not self.account_ctrl.has_credential(self.connection_id):
            QMessageBox.information(
                self,
                "Reconnect Required",
                "Cannot delete a worker because the API token for this connection is not available in secure storage.\n\nPlease click 'Reconnect Account' first.",
            )
            self._open_reconnect_dialog()
            return

        worker_name = worker_data.get("name", "")
        bindings = worker_data.get("d1_bindings") or []
        d1_display_name = worker_data.get("d1_display", "Unknown")
        d1_id = "Unknown"

        if bindings:
            b = bindings[0]
            if hasattr(b, "database_id") and b.database_id:
                d1_id = b.database_id
                d1_display_name = getattr(b, "database_name", None) or getattr(b, "binding_name", None) or d1_display_name
            elif isinstance(b, dict):
                d1_id = b.get("database_id") or "Unknown"
                d1_display_name = b.get("database_name") or b.get("binding_name") or d1_display_name

        dialog = DeleteWorkerDialog(
            worker_ctrl=self.worker_ctrl,
            connection_id=self.connection_id,
            account_id=self.account_id,
            worker_name=worker_name,
            d1_display_name=d1_display_name,
            d1_id=d1_id,
            parent=self,
        )
        dialog.worker_deleted.connect(lambda _: self.reload())
        dialog.exec()
