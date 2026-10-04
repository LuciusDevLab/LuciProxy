"""
LuciProxy Builder - PySide6 GUI Application Launcher.
Initializes QApplication, configures application metadata, and presents MainWindow.
"""

import sys
from pathlib import Path
from typing import Optional

from PySide6.QtCore import Qt
from PySide6.QtGui import QIcon
from PySide6.QtWidgets import QApplication

from .main_window import MainWindow


def launch_gui(store_dir: Optional[Path] = None) -> int:
    """Initializes and runs the PySide6 Graphical Builder."""
    app = QApplication.instance()
    if app is None:
        # Enable High DPI scaling
        app = QApplication(sys.argv)

    from ..version import BUILDER_VERSION

    app.setApplicationName("LuciProxy Builder")
    app.setOrganizationName("LuciusDevLab")
    app.setApplicationVersion(BUILDER_VERSION)

    window = MainWindow(store_dir=store_dir)
    window.show()

    return app.exec()


if __name__ == "__main__":
    sys.exit(launch_gui())
