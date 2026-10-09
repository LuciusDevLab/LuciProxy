"""
LuciProxy Manager - Windows Native Notification System.
Provides desktop notifications via PySide6 QSystemTrayIcon with persistent deduplication.
Ensures OS notifications are triggered ONCE per release and never repeatedly on every launch.
Gracefully degrades if system tray or notification support is unavailable on the host.
"""

import json
from pathlib import Path
from typing import Optional
from PySide6.QtCore import QObject, Signal
from PySide6.QtGui import QIcon
from PySide6.QtWidgets import QSystemTrayIcon

from ..storage.database import LocalDatabase


class WindowsNotificationManager(QObject):
    """
    Manages desktop system notifications for LuciProxy Manager.
    Features:
    - Non-intrusive QSystemTrayIcon balloon/toast messages.
    - Persistent event-level deduplication to prevent repetitive spam.
    - Zero external dependency overhead (100% PySide6 native).
    """

    notification_clicked = Signal()

    def __init__(self, db: Optional[LocalDatabase] = None, parent: Optional[QObject] = None):
        super().__init__(parent)
        self.db = db
        self.tray_icon: Optional[QSystemTrayIcon] = None
        self._init_tray()
        self._dedup_file = Path(__file__).resolve().parent.parent / "storage" / "notification_state.json"

    def _init_tray(self) -> None:
        """Initializes system tray icon if platform supports it."""
        try:
            from PySide6.QtWidgets import QApplication
            if not QApplication.instance():
                self.tray_icon = None
                return
            if QSystemTrayIcon.isSystemTrayAvailable():
                self.tray_icon = QSystemTrayIcon(self)
                # Set icon if available
                icon_path = Path(__file__).resolve().parent.parent.parent / "Builder" / "icon.ico"
                if icon_path.exists():
                    self.tray_icon.setIcon(QIcon(str(icon_path)))
                self.tray_icon.show()
        except Exception:
            self.tray_icon = None

    def _load_dedup_state(self) -> dict:
        """Loads persistent deduplication state from disk."""
        if self._dedup_file.exists():
            try:
                return json.loads(self._dedup_file.read_text(encoding="utf-8"))
            except Exception:
                pass
        return {}

    def _save_dedup_state(self, state: dict) -> None:
        """Persists deduplication state to disk."""
        try:
            self._dedup_file.parent.mkdir(parents=True, exist_ok=True)
            self._dedup_file.write_text(json.dumps(state, indent=2), encoding="utf-8")
        except Exception:
            pass

    def should_notify_worker(self, latest_version: str) -> bool:
        """Returns True if the user has NOT yet been notified of this specific worker version."""
        if not latest_version or latest_version.lower() in ("unknown", "none"):
            return False
        state = self._load_dedup_state()
        return state.get("last_notified_worker_version") != latest_version

    def mark_worker_notified(self, latest_version: str) -> None:
        """Marks this worker version as having triggered an OS notification."""
        state = self._load_dedup_state()
        state["last_notified_worker_version"] = latest_version
        self._save_dedup_state(state)

    def should_notify_manager(self, latest_version: str) -> bool:
        """Returns True if the user has NOT yet been notified of this specific manager version."""
        if not latest_version or latest_version.lower() in ("unknown", "none"):
            return False
        state = self._load_dedup_state()
        return state.get("last_notified_manager_version") != latest_version

    def mark_manager_notified(self, latest_version: str) -> None:
        """Marks this manager version as having triggered an OS notification."""
        state = self._load_dedup_state()
        state["last_notified_manager_version"] = latest_version
        self._save_dedup_state(state)

    def show_worker_update_notification(
        self,
        latest_version: str,
        affected_count: int = 1,
        worker_name: Optional[str] = None
    ) -> bool:
        """
        Emits desktop notification for Worker update if not previously notified.
        Returns True if notification was emitted, False if deduplicated or unavailable.
        """
        if not self.should_notify_worker(latest_version):
            return False

        title = "🛡️ LuciProxy Worker Update Available"
        if affected_count == 1 and worker_name:
            msg = f"Version {latest_version} is available for Worker '{worker_name}'."
        else:
            msg = f"Version {latest_version} is available for {affected_count} Worker(s)."

        try:
            emitted = self._show_message(title, msg)
        except Exception:
            emitted = False
        if emitted:
            self.mark_worker_notified(latest_version)
        return emitted

    def show_manager_update_notification(
        self,
        latest_version: str,
        changelog: Optional[str] = None
    ) -> bool:
        """
        Emits desktop notification for Manager update if not previously notified.
        Returns True if notification was emitted, False if deduplicated or unavailable.
        """
        if not self.should_notify_manager(latest_version):
            return False

        title = "⚡ LuciProxy Manager Update"
        msg = f"LuciProxy Manager {latest_version} is now available."
        if changelog:
            short_cl = changelog.strip().split("\n")[0][:100]
            msg += f"\n{short_cl}"

        try:
            emitted = self._show_message(title, msg)
        except Exception:
            emitted = False
        if emitted:
            self.mark_manager_notified(latest_version)
        return emitted

    def _show_message(self, title: str, message: str) -> bool:
        """Safely delivers toast message via QSystemTrayIcon."""
        try:
            from PySide6.QtWidgets import QApplication
            if not QApplication.instance() or not self.tray_icon:
                return False
            if QSystemTrayIcon.supportsMessages():
                self.tray_icon.showMessage(
                    title,
                    message,
                    QSystemTrayIcon.Information,
                    8000
                )
                return True
        except Exception:
            pass
        return False
