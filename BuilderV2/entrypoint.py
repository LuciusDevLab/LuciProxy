"""
LuciProxy Manager v2.0.0 - PyInstaller Executable Bootstrap Entry Point.
"""

import os
import sys

# Ensure repository root / package directory is resolvable
_here = os.path.dirname(os.path.abspath(__file__))
_repo_root = os.path.dirname(_here)
if _repo_root not in sys.path:
    sys.path.insert(0, _repo_root)

from BuilderV2.app import launch_app


if __name__ == "__main__":
    sys.exit(launch_app())
