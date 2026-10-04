"""
LuciProxy Builder - Screen 7: Deployment History Screen.
Lists previous deployments, status, and allows copying or opening panel URLs.
"""

from typing import List, Optional
from PySide6.QtCore import Qt, QUrl, Signal
from PySide6.QtGui import QDesktopServices, QGuiApplication
from PySide6.QtWidgets import (
    QWidget, QVBoxLayout, QHBoxLayout, QLabel, QPushButton, QFrame,
    QTableWidget, QTableWidgetItem, QHeaderView
)

from ...storage.history import DeploymentHistoryStore, DeploymentRecord


class HistoryScreen(QWidget):
    """Graphical deployment history viewer."""

    back_clicked = Signal()

    def __init__(self, history_store: Optional[DeploymentHistoryStore] = None, parent=None):
        super().__init__(parent)
        self.history_store = history_store or DeploymentHistoryStore()
        self.records: List[DeploymentRecord] = []
        self._init_ui()

    def _init_ui(self):
        layout = QVBoxLayout(self)
        layout.setAlignment(Qt.AlignmentFlag.AlignCenter)
        layout.setContentsMargins(30, 20, 30, 20)

        card = QFrame()
        card.setObjectName("card")
        card.setFixedSize(680, 520)
        card_layout = QVBoxLayout(card)
        card_layout.setContentsMargins(24, 24, 24, 24)
        card_layout.setSpacing(14)

        # Header
        title = QLabel("Deployment History")
        title.setObjectName("title")
        subtitle = QLabel("Previous deployments stored locally in secure app data:")
        subtitle.setObjectName("subtitle")

        card_layout.addWidget(title)
        card_layout.addWidget(subtitle)

        # Table
        self.table = QTableWidget()
        self.table.setColumnCount(5)
        self.table.setHorizontalHeaderLabels(["Timestamp", "Worker Name", "D1 Database", "Version", "Panel URL"])
        self.table.horizontalHeader().setSectionResizeMode(0, QHeaderView.ResizeMode.ResizeToContents)
        self.table.horizontalHeader().setSectionResizeMode(1, QHeaderView.ResizeMode.ResizeToContents)
        self.table.horizontalHeader().setSectionResizeMode(2, QHeaderView.ResizeMode.ResizeToContents)
        self.table.horizontalHeader().setSectionResizeMode(3, QHeaderView.ResizeMode.ResizeToContents)
        self.table.horizontalHeader().setSectionResizeMode(4, QHeaderView.ResizeMode.Stretch)
        self.table.setSelectionBehavior(QTableWidget.SelectionBehavior.SelectRows)
        self.table.setSelectionMode(QTableWidget.SelectionMode.SingleSelection)
        self.table.itemSelectionChanged.connect(self._on_selection_changed)

        card_layout.addWidget(self.table)

        # Action Buttons for Selected Record
        action_row = QHBoxLayout()
        self.btn_copy_url = QPushButton("Copy Panel URL")
        self.btn_copy_url.setObjectName("secondary_button")
        self.btn_copy_url.setEnabled(False)
        self.btn_copy_url.clicked.connect(self._copy_selected_url)

        self.btn_open_url = QPushButton("Open Panel")
        self.btn_open_url.setObjectName("primary_button")
        self.btn_open_url.setEnabled(False)
        self.btn_open_url.clicked.connect(self._open_selected_url)

        action_row.addWidget(self.btn_copy_url)
        action_row.addWidget(self.btn_open_url)
        action_row.addStretch()

        btn_back = QPushButton("Back")
        btn_back.setObjectName("secondary_button")
        btn_back.clicked.connect(self.back_clicked.emit)
        action_row.addWidget(btn_back)

        card_layout.addLayout(action_row)
        layout.addWidget(card)

    def refresh_history(self):
        self.records = self.history_store.list_records()
        self.table.setRowCount(len(self.records))

        for row, rec in enumerate(self.records):
            time_str = rec.timestamp[:19].replace("T", " ") if rec.timestamp else "N/A"
            self.table.setItem(row, 0, QTableWidgetItem(time_str))
            self.table.setItem(row, 1, QTableWidgetItem(rec.worker_name))
            self.table.setItem(row, 2, QTableWidgetItem(f"{rec.d1_name} ({rec.d1_uuid[:6]}...)"))
            self.table.setItem(row, 3, QTableWidgetItem(f"v{rec.luciproxy_version}"))
            self.table.setItem(row, 4, QTableWidgetItem(rec.panel_url))

        self._on_selection_changed()

    def _on_selection_changed(self):
        has_sel = len(self.table.selectedItems()) > 0
        self.btn_copy_url.setEnabled(has_sel)
        self.btn_open_url.setEnabled(has_sel)
        self.btn_copy_url.setText("Copy Panel URL")

    def _get_selected_record(self) -> Optional[DeploymentRecord]:
        selected_rows = self.table.selectionModel().selectedRows()
        if not selected_rows:
            return None
        row = selected_rows[0].row()
        if 0 <= row < len(self.records):
            return self.records[row]
        return None

    def _copy_selected_url(self):
        rec = self._get_selected_record()
        if rec and rec.panel_url:
            QGuiApplication.clipboard().setText(rec.panel_url)
            self.btn_copy_url.setText("✓ Copied!")

    def _open_selected_url(self):
        rec = self._get_selected_record()
        if rec and rec.panel_url:
            QDesktopServices.openUrl(QUrl(rec.panel_url))
