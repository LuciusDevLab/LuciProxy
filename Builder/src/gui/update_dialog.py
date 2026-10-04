"""
LuciProxy Builder - Update Notification Dialog.
Displays a clean, non-intrusive dialog when a newer version is detected on GitHub.
Provides direct actions to open the repository and release notes in the browser.
"""

from PySide6.QtCore import Qt, QUrl
from PySide6.QtGui import QDesktopServices
from PySide6.QtWidgets import (
    QDialog, QVBoxLayout, QHBoxLayout, QLabel, QPushButton, QFrame, QTextEdit
)

from ..deployment.update_checker import VersionInfo
from ..version import BUILDER_VERSION


class UpdateDialog(QDialog):
    """Modal notification dialog presenting new release availability."""

    def __init__(self, parent=None, version_info: VersionInfo = None, current_version: str = BUILDER_VERSION):
        super().__init__(parent)
        self.info = version_info
        self.current_version = current_version

        self.setWindowTitle("Update Available - LuciProxy Builder")
        self.setMinimumWidth(480)
        self.setMaximumWidth(560)
        self.setModal(True)
        self._init_ui()

    def _init_ui(self):
        layout = QVBoxLayout(self)
        layout.setContentsMargins(28, 28, 28, 28)
        layout.setSpacing(18)

        # 1. Header with Icon
        header_layout = QHBoxLayout()
        header_layout.setSpacing(12)

        icon_label = QLabel("🚀")
        icon_label.setStyleSheet("font-size: 28px;")
        header_layout.addWidget(icon_label)

        title_box = QVBoxLayout()
        title_box.setSpacing(2)
        title = QLabel("New Update Available")
        title.setStyleSheet("font-size: 18px; font-weight: bold; color: #f9fafb;")
        subtitle = QLabel("A newer version of LuciProxy Builder is available.")
        subtitle.setStyleSheet("font-size: 12px; color: #9ca3af;")
        title_box.addWidget(title)
        title_box.addWidget(subtitle)
        header_layout.addLayout(title_box)
        header_layout.addStretch()

        layout.addLayout(header_layout)

        # 2. Version Comparison Card
        ver_frame = QFrame()
        ver_frame.setStyleSheet(
            "background-color: #1f2937; border: 1px solid #374151; "
            "border-radius: 8px; padding: 12px;"
        )
        ver_layout = QHBoxLayout(ver_frame)
        ver_layout.setContentsMargins(16, 12, 16, 12)

        curr_box = QVBoxLayout()
        curr_lbl = QLabel("CURRENT VERSION")
        curr_lbl.setStyleSheet("font-size: 10px; font-weight: bold; color: #9ca3af; letter-spacing: 0.5px;")
        curr_val = QLabel(f"v{self.current_version}")
        curr_val.setStyleSheet("font-size: 15px; font-weight: 600; color: #e5e7eb;")
        curr_box.addWidget(curr_lbl)
        curr_box.addWidget(curr_val)

        arrow = QLabel("➔")
        arrow.setStyleSheet("font-size: 18px; color: #06b6d4; font-weight: bold;")
        arrow.setAlignment(Qt.AlignmentFlag.AlignCenter)

        new_box = QVBoxLayout()
        new_lbl = QLabel("LATEST VERSION")
        new_lbl.setStyleSheet("font-size: 10px; font-weight: bold; color: #06b6d4; letter-spacing: 0.5px;")
        remote_ver = self.info.version if self.info else "Unknown"
        new_val = QLabel(f"v{remote_ver}")
        new_val.setStyleSheet("font-size: 15px; font-weight: 700; color: #22d3ee;")
        new_box.addWidget(new_lbl)
        new_box.addWidget(new_val)

        ver_layout.addLayout(curr_box)
        ver_layout.addStretch()
        ver_layout.addWidget(arrow)
        ver_layout.addStretch()
        ver_layout.addLayout(new_box)

        layout.addWidget(ver_frame)

        # 3. Changelog Details Card
        cl_label = QLabel("What's New:")
        cl_label.setStyleSheet("font-size: 12px; font-weight: 600; color: #d1d5db;")
        layout.addWidget(cl_label)

        changelog_text = self.info.changelog if self.info and self.info.changelog else "Bug fixes and performance improvements."
        cl_view = QTextEdit()
        cl_view.setReadOnly(True)
        cl_view.setPlainText(changelog_text)
        cl_view.setMaximumHeight(100)
        cl_view.setStyleSheet(
            "background-color: #111827; border: 1px solid #374151; "
            "border-radius: 6px; color: #e5e7eb; font-size: 12px; padding: 8px;"
        )
        layout.addWidget(cl_view)

        # 4. Action Buttons Row
        btn_layout = QHBoxLayout()
        btn_layout.setSpacing(10)

        btn_open_repo = QPushButton("Open Repository")
        btn_open_repo.setCursor(Qt.CursorShape.PointingHandCursor)
        btn_open_repo.setStyleSheet(
            "background-color: #0891b2; color: #ffffff; font-weight: bold; "
            "border: none; border-radius: 6px; padding: 8px 16px; font-size: 12px;"
        )
        btn_open_repo.clicked.connect(self._on_open_repo)

        btn_view_release = QPushButton("View Release")
        btn_view_release.setCursor(Qt.CursorShape.PointingHandCursor)
        btn_view_release.setStyleSheet(
            "background-color: #374151; color: #f3f4f6; font-weight: 600; "
            "border: 1px solid #4b5563; border-radius: 6px; padding: 8px 14px; font-size: 12px;"
        )
        btn_view_release.clicked.connect(self._on_view_release)

        btn_later = QPushButton("Later")
        btn_later.setCursor(Qt.CursorShape.PointingHandCursor)
        btn_later.setStyleSheet(
            "background-color: transparent; color: #9ca3af; font-weight: 500; "
            "border: 1px solid #374151; border-radius: 6px; padding: 8px 14px; font-size: 12px;"
        )
        btn_later.clicked.connect(self.reject)

        btn_layout.addWidget(btn_open_repo)
        btn_layout.addWidget(btn_view_release)
        btn_layout.addStretch()
        btn_layout.addWidget(btn_later)

        layout.addLayout(btn_layout)

    def _on_open_repo(self):
        url = self.info.repo_url if self.info and self.info.repo_url else "https://github.com/LuciusDevLab/LuciProxy"
        QDesktopServices.openUrl(QUrl(url))
        self.accept()

    def _on_view_release(self):
        url = self.info.release_url if self.info and self.info.release_url else "https://github.com/LuciusDevLab/LuciProxy/releases"
        QDesktopServices.openUrl(QUrl(url))
        self.accept()
