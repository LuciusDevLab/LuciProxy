"""
LuciProxy Builder - Screen 1: Welcome Screen.
Presents a modern, non-technical onboarding view with primary action.
"""

from PySide6.QtCore import Qt, Signal
from PySide6.QtWidgets import (
    QWidget, QVBoxLayout, QHBoxLayout, QLabel, QPushButton, QFrame, QMessageBox
)


class WelcomeScreen(QWidget):
    """Initial landing screen."""

    get_started_clicked = Signal()
    view_history_clicked = Signal()

    def __init__(self, parent=None):
        super().__init__(parent)
        self._init_ui()

    def _init_ui(self):
        layout = QVBoxLayout(self)
        layout.setAlignment(Qt.AlignmentFlag.AlignCenter)
        layout.setContentsMargins(40, 40, 40, 40)
        layout.setSpacing(24)

        # Container Card
        card = QFrame()
        card.setObjectName("card")
        card.setMinimumWidth(560)
        card.setMaximumWidth(700)
        card_layout = QVBoxLayout(card)
        card_layout.setContentsMargins(32, 32, 32, 32)
        card_layout.setSpacing(20)

        # Title & Subtitle
        title = QLabel("LuciProxy Builder")
        title.setObjectName("title")
        title.setAlignment(Qt.AlignmentFlag.AlignCenter)

        subtitle = QLabel("Deploy your instance directly to Cloudflare.")
        subtitle.setObjectName("subtitle")
        subtitle.setAlignment(Qt.AlignmentFlag.AlignCenter)

        card_layout.addWidget(title)
        card_layout.addWidget(subtitle)

        # Feature highlights in neat box
        info_frame = QFrame()
        info_frame.setObjectName("card_highlight")
        info_layout = QVBoxLayout(info_frame)
        info_layout.setSpacing(10)

        f1 = QLabel("⚡ <b>Cloudflare REST Native:</b> Zero local Node.js, npm, or Git dependencies.")
        f2 = QLabel("🔒 <b>Automated Resource Isolation:</b> Creates dedicated Worker & D1 database.")
        f3 = QLabel("🛡️ <b>Neutral Resource Naming:</b> Randomized identifier generation.")
        f4 = QLabel("📊 <b>Integrated Admin Panel:</b> Automated configuration & telemetry sync.")

        for f in (f1, f2, f3, f4):
            f.setStyleSheet("color: #d1d5db; font-size: 13px;")
            info_layout.addWidget(f)

        card_layout.addWidget(info_frame)
        card_layout.addSpacing(10)

        # Primary Action Button
        btn_start = QPushButton("Get Started")
        btn_start.setObjectName("primary_button")
        btn_start.setCursor(Qt.CursorShape.PointingHandCursor)
        btn_start.clicked.connect(self.get_started_clicked.emit)
        card_layout.addWidget(btn_start)

        # Secondary Actions
        btn_row = QHBoxLayout()
        btn_row.setSpacing(12)

        btn_history = QPushButton("Deployment History")
        btn_history.setObjectName("secondary_button")
        btn_history.setCursor(Qt.CursorShape.PointingHandCursor)
        btn_history.clicked.connect(self.view_history_clicked.emit)

        btn_about = QPushButton("About")
        btn_about.setObjectName("secondary_button")
        btn_about.setCursor(Qt.CursorShape.PointingHandCursor)
        btn_about.clicked.connect(self._show_about_dialog)

        btn_row.addWidget(btn_history)
        btn_row.addWidget(btn_about)
        card_layout.addLayout(btn_row)

        # Version footer tag
        from ...version import BUILDER_VERSION
        ver_tag = QLabel(f"Version {BUILDER_VERSION}")
        ver_tag.setStyleSheet("color: #6b7280; font-size: 11px;")
        ver_tag.setAlignment(Qt.AlignmentFlag.AlignCenter)
        card_layout.addWidget(ver_tag)

        layout.addWidget(card)

    def _show_about_dialog(self):
        from ...version import BUILDER_VERSION
        msg = QMessageBox(self)
        msg.setWindowTitle("About LuciProxy Builder")
        msg.setText(
            "<h3>LuciProxy Builder</h3>"
            f"<p><b>Version:</b> {BUILDER_VERSION}</p>"
            "<p><b>License:</b> GNU Affero General Public License v3.0 (AGPL-3.0)</p>"
            "<p><b>Copyright:</b> LuciusDevLab</p>"
            "<hr/>"
            "<p>Automated API-native Cloudflare Edge deployment wizard for LuciProxy.</p>"
            "<p>Zero external host dependencies. Direct Cloudflare REST API communication only.</p>"
        )
        msg.setIcon(QMessageBox.Icon.Information)
        msg.exec()
