"""
LuciProxy Builder - Terminal Console & Presentation Utilities
Compatible with Windows PowerShell, CMD, and standard ANSI terminals.
"""

import sys
from typing import Optional

try:
    import colorama
    colorama.init(autoreset=True)
    HAS_COLORAMA = True
except ImportError:
    HAS_COLORAMA = False

# ANSI Color codes
RESET = "\033[0m" if HAS_COLORAMA else ""
BOLD = "\033[1m" if HAS_COLORAMA else ""
RED = "\033[31m" if HAS_COLORAMA else ""
GREEN = "\033[32m" if HAS_COLORAMA else ""
YELLOW = "\033[33m" if HAS_COLORAMA else ""
BLUE = "\033[34m" if HAS_COLORAMA else ""
CYAN = "\033[36m" if HAS_COLORAMA else ""


def banner(version: str = "1.0.0") -> None:
    text = fr"""
{CYAN}{BOLD} _     _     ____ ___ ____                      
| |   | |   |  _ \_ _/ ___|                      
| |   | |   | |_) | | |                          
| |___| |___|  __/| | |___                       
|_____|_____|_|_ |_|_\____|_  _ __ _____  _   _ 
|  _ \ / _ \ / _ \ \/ / | | | | '_ \_  / | | | |
| |_) | (_) | (_) >  <  |_| |_| |_) / /| |_| |
|  __/ \___/ \___/_/\_\   \__, | .___/___|\__, |
|_|                       |___/|_|        |___/ {RESET}{BOLD}v{version}{RESET}
{BLUE}The Intelligent Multi-Protocol Cloudflare Worker Deployer{RESET}
"""
    print(text)


def step(index: int, total: int, action: str) -> None:
    """Prints a standard numbered deployment step."""
    sys.stdout.write(f"{BOLD}[{index}/{total}]{RESET} {action}... ")
    sys.stdout.flush()


def step_ok(msg: str = "OK") -> None:
    """Completes a step with green OK."""
    print(f"{GREEN}{BOLD}{msg}{RESET}")


def step_warn(msg: str = "WARN") -> None:
    """Completes a step with yellow WARN."""
    print(f"{YELLOW}{BOLD}{msg}{RESET}")


def step_fail(msg: str = "FAILED") -> None:
    """Completes a step with red FAILED."""
    print(f"{RED}{BOLD}{msg}{RESET}")


def info(msg: str) -> None:
    print(f"{BLUE}[INFO]{RESET} {msg}")


def success(msg: str) -> None:
    print(f"{GREEN}{BOLD}[SUCCESS]{RESET} {msg}")


def warn(msg: str) -> None:
    print(f"{YELLOW}[WARN]{RESET} {msg}")


def error(msg: str) -> None:
    print(f"{RED}{BOLD}[ERROR]{RESET} {msg}")
