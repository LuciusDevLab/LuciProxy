"""
LuciProxy Builder - PyInstaller Executable Entry Point
"""

import os
import sys

# Ensure project root is present in sys.path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from src.main import main


if __name__ == "__main__":
    main()
