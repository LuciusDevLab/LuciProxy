"""
LuciProxy Manager v2.0.0 - PySide6 Desktop Application Entrypoint.
Initializes QApplication, platform secure credential storage, SQLite engine,
and presents the main window shell.
"""

import os
from pathlib import Path
import sys
from typing import Optional

from PySide6.QtCore import Qt
from PySide6.QtGui import QIcon
from PySide6.QtWidgets import QApplication

from .storage.database import LocalDatabase
from .security.credentials import WindowsCredentialStore, InMemoryCredentialStore
from .ui.main_window import MainWindow

APP_NAME = "LuciProxy Manager"
ORG_NAME = "LuciusDevLab"
MANAGER_VERSION = "2.0.0"


def get_default_db_path() -> Path:
    """Returns platform-standard persistent SQLite database path."""
    if sys.platform == "win32":
        base_dir = Path(os.environ.get("APPDATA", Path.home() / "AppData" / "Roaming")) / "LuciProxyManager"
    else:
        base_dir = Path.home() / ".config" / "luciproxymanager"
    base_dir.mkdir(parents=True, exist_ok=True)
    return base_dir / "manager.db"


def launch_app(
    db_path: Optional[Path] = None,
    use_in_memory: bool = False
) -> int:
    """Initializes and executes the PySide6 Graphical Manager application."""
    app = QApplication.instance()
    if app is None:
        app = QApplication(sys.argv)

    app.setApplicationName(APP_NAME)
    app.setOrganizationName(ORG_NAME)
    app.setApplicationVersion(MANAGER_VERSION)

    if use_in_memory:
        cred_store = InMemoryCredentialStore()
        db = LocalDatabase(db_path=":memory:", credential_store=cred_store)
    else:
        target_db = Path(db_path) if db_path else get_default_db_path()
        cred_store = WindowsCredentialStore() if sys.platform == "win32" else InMemoryCredentialStore()
        db = LocalDatabase(db_path=str(target_db), credential_store=cred_store)

    window = MainWindow(db=db)

    # Set icon if available
    icon_candidates = [
        Path(__file__).parent / "icon.ico",
        Path(__file__).parent.parent / "Builder" / "icon.ico",
    ]
    for ic in icon_candidates:
        if ic.exists():
            window.setWindowIcon(QIcon(str(ic)))
            break

    window.show()
    return app.exec()


if __name__ == "__main__":
    sys.exit(launch_app())
