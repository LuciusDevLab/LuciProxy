"""
LuciProxy Builder - Screen 5: Deployment Progress Screen.
Real-time step-by-step graphical checklist and responsive progress visualization.
"""

from typing import Dict, List
from PySide6.QtCore import Qt
from PySide6.QtWidgets import (
    QWidget, QVBoxLayout, QLabel, QFrame, QProgressBar, QScrollArea
)


STEPS_CHECKLIST = [
    ("Verifying Token & Access", "Validating credentials and account access"),
    ("Preparing Deployment", "Validating neutral resource identifiers"),
    ("Creating D1 Database", "Provisioning remote SQLite database via REST API"),
    ("Initializing D1 Schema", "Executing table creation DDL (kv_store)"),
    ("Verifying D1 Schema", "Confirming table presence in SQLite master"),
    ("Verifying Worker Artifact", "Validating embedded bundle SHA-256 integrity"),
    ("Uploading Worker Script", "Multipart upload with dynamic D1 binding"),
    ("Configuring Worker Secret", "Provisioning MASTER_KEY via Cloudflare Secrets API"),
    ("Configuring workers.dev", "Account subdomain discovery & activation"),
    ("Enabling Worker Route", "Activating subdomain traffic routing"),
    ("Running Health Checks", "Testing edge HTTPS reachability and panel"),
    ("Saving Deployment History", "Recording deployment metadata locally")
]


class ProgressScreen(QWidget):
    """Graphical progress checklist for deployment."""

    def __init__(self, parent=None):
        super().__init__(parent)
        self.step_widgets: List[Dict[str, QLabel]] = []
        self._init_ui()

    def _init_ui(self):
        layout = QVBoxLayout(self)
        layout.setAlignment(Qt.AlignmentFlag.AlignCenter)
        layout.setContentsMargins(30, 20, 30, 20)

        card = QFrame()
        card.setObjectName("card")
        card.setMinimumWidth(580)
        card.setMaximumWidth(700)
        card_layout = QVBoxLayout(card)
        card_layout.setContentsMargins(28, 28, 28, 28)
        card_layout.setSpacing(16)

        title = QLabel("Deploying LuciProxy...")
        title.setObjectName("title")
        self.lbl_subtitle = QLabel("Executing pure Cloudflare REST API pipeline. Please wait...")
        self.lbl_subtitle.setObjectName("subtitle")
        self.lbl_subtitle.setWordWrap(True)

        card_layout.addWidget(title)
        card_layout.addWidget(self.lbl_subtitle)

        # Main Progress Bar
        self.prog_bar = QProgressBar()
        self.prog_bar.setRange(0, len(STEPS_CHECKLIST))
        self.prog_bar.setValue(0)
        card_layout.addWidget(self.prog_bar)

        # Scroll Area for Checklist
        scroll = QScrollArea()
        scroll.setWidgetResizable(True)
        scroll.setFixedHeight(260)
        scroll.setStyleSheet("background-color: transparent;")

        container = QWidget()
        self.items_layout = QVBoxLayout(container)
        self.items_layout.setSpacing(8)
        self.items_layout.setContentsMargins(4, 4, 4, 4)

        for step_title, step_desc in STEPS_CHECKLIST:
            row = QFrame()
            row.setStyleSheet("QFrame { background-color: #171a22; border-radius: 6px; padding: 6px 10px; }")
            r_layout = QVBoxLayout(row)
            r_layout.setContentsMargins(4, 4, 4, 4)
            r_layout.setSpacing(2)

            header_lbl = QLabel(f"⏳  <b>{step_title}</b>")
            header_lbl.setStyleSheet("color: #6b7280; font-size: 13px; background: transparent;")
            desc_lbl = QLabel(f"<span style='color: #4b5563; font-size: 11px;'>{step_desc}</span>")
            desc_lbl.setStyleSheet("background: transparent;")

            r_layout.addWidget(header_lbl)
            r_layout.addWidget(desc_lbl)

            self.items_layout.addWidget(row)
            self.step_widgets.append({
                "frame": row,
                "header": header_lbl,
                "desc": desc_lbl,
                "title": step_title
            })

        self.items_layout.addStretch()
        scroll.setWidget(container)
        card_layout.addWidget(scroll)

        layout.addWidget(card)

    def reset_progress(self):
        self.prog_bar.setValue(0)
        self.lbl_subtitle.setText("Executing pure Cloudflare REST API pipeline. Please wait...")
        for w in self.step_widgets:
            w["frame"].setStyleSheet("QFrame { background-color: #171a22; border-radius: 6px; padding: 6px 10px; }")
            w["header"].setText(f"⏳  <b>{w['title']}</b>")
            w["header"].setStyleSheet("color: #6b7280; font-size: 13px; background: transparent;")

    def update_step(self, step_num: int, total_steps: int, title: str, details: str):
        self.prog_bar.setValue(step_num)
        self.lbl_subtitle.setText(f"<b>Step {step_num}/{total_steps}:</b> {title} — {details}")

        # Mark preceding steps as completed (green)
        for idx, w in enumerate(self.step_widgets):
            step_idx = idx + 1
            if step_idx < step_num:
                w["frame"].setStyleSheet("QFrame { background-color: #064e3b; border-radius: 6px; padding: 6px 10px; }")
                w["header"].setText(f"✓  <b>{w['title']}</b>")
                w["header"].setStyleSheet("color: #34d399; font-size: 13px; background: transparent;")
            elif step_idx == step_num:
                # Active step (blue)
                w["frame"].setStyleSheet("QFrame { background-color: #1e3a5f; border-radius: 6px; padding: 6px 10px; }")
                w["header"].setText(f"🔄  <b>{w['title']}</b>")
                w["header"].setStyleSheet("color: #60a5fa; font-size: 13px; background: transparent;")
            else:
                # Pending step (gray)
                w["frame"].setStyleSheet("QFrame { background-color: #171a22; border-radius: 6px; padding: 6px 10px; }")
                w["header"].setText(f"⏳  <b>{w['title']}</b>")
                w["header"].setStyleSheet("color: #6b7280; font-size: 13px; background: transparent;")
