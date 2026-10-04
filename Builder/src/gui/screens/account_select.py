"""
LuciProxy Builder - Screen 3: Account Selection Screen.
Allows switching or choosing among multiple accessible Cloudflare accounts.
"""

from typing import Any, Dict, List
from PySide6.QtCore import Qt, Signal
from PySide6.QtWidgets import (
    QWidget, QVBoxLayout, QHBoxLayout, QLabel, QPushButton, QFrame,
    QRadioButton, QButtonGroup, QScrollArea
)


class AccountSelectScreen(QWidget):
    """Account selection interface for multi-account Cloudflare tokens."""

    back_clicked = Signal()
    account_selected = Signal(dict)  # emits selected account dict

    def __init__(self, parent=None):
        super().__init__(parent)
        self.accounts: List[Dict[str, Any]] = []
        self._init_ui()

    def _init_ui(self):
        layout = QVBoxLayout(self)
        layout.setAlignment(Qt.AlignmentFlag.AlignCenter)
        layout.setContentsMargins(30, 30, 30, 30)

        card = QFrame()
        card.setObjectName("card")
        card.setMinimumWidth(560)
        card.setMaximumWidth(700)
        card_layout = QVBoxLayout(card)
        card_layout.setContentsMargins(28, 28, 28, 28)
        card_layout.setSpacing(18)

        title = QLabel("Select Cloudflare Account")
        title.setObjectName("title")
        subtitle = QLabel("Multiple accounts found with this API token. Choose where to deploy:")
        subtitle.setObjectName("subtitle")
        subtitle.setWordWrap(True)

        card_layout.addWidget(title)
        card_layout.addWidget(subtitle)

        # Scroll area for account choices
        self.scroll = QScrollArea()
        self.scroll.setWidgetResizable(True)
        self.scroll.setMaximumHeight(220)

        self.accounts_container = QWidget()
        self.accounts_layout = QVBoxLayout(self.accounts_container)
        self.accounts_layout.setSpacing(8)
        self.button_group = QButtonGroup(self)
        self.scroll.setWidget(self.accounts_container)

        card_layout.addWidget(self.scroll)

        # Buttons
        btn_row = QHBoxLayout()
        btn_back = QPushButton("Back")
        btn_back.setObjectName("secondary_button")
        btn_back.clicked.connect(self.back_clicked.emit)

        self.btn_continue = QPushButton("Continue")
        self.btn_continue.setObjectName("primary_button")
        self.btn_continue.clicked.connect(self._on_continue_clicked)

        btn_row.addWidget(btn_back)
        btn_row.addStretch()
        btn_row.addWidget(self.btn_continue)
        card_layout.addLayout(btn_row)

        layout.addWidget(card)

    def set_accounts(self, accounts: List[Dict[str, Any]]):
        self.accounts = accounts
        # Clear existing buttons
        for btn in self.button_group.buttons():
            self.button_group.removeButton(btn)
            btn.deleteLater()

        for i in reversed(range(self.accounts_layout.count())):
            item = self.accounts_layout.itemAt(i)
            if item.widget():
                item.widget().deleteLater()

        for idx, acc in enumerate(accounts):
            acc_name = acc.get("name", "Cloudflare Account")
            acc_id = acc.get("id", "")
            radio = QRadioButton(f"{acc_name} ({acc_id})")
            self.button_group.addButton(radio, idx)
            self.accounts_layout.addWidget(radio)

            if idx == 0:
                radio.setChecked(True)

        self.btn_continue.setEnabled(len(accounts) > 0)

    def _on_continue_clicked(self):
        checked_id = self.button_group.checkedId()
        if 0 <= checked_id < len(self.accounts):
            self.account_selected.emit(self.accounts[checked_id])
