import os
import pytest

@pytest.hookimpl(trylast=True)
def pytest_terminal_summary(terminalreporter, exitstatus, config):
    """
    Prevents Windows C++ PySide6 QApplication teardown crash (0xC0000409)
    during Python interpreter finalization by exiting cleanly after pytest reporting completes.
    """
    import sys
    sys.stdout.flush()
    sys.stderr.flush()
    os._exit(exitstatus)

