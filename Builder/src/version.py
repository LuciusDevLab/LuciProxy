"""
LuciProxy Builder - Embedded Version and Upstream Source Registry.
Authoritative source for the local Builder version and GitHub update metadata.
"""

import re
from typing import Optional, Tuple

BUILDER_VERSION = "1.1.0"
__version__ = BUILDER_VERSION

REPO_URL = "https://github.com/LuciusDevLab/LuciProxy"
RELEASE_URL = "https://github.com/LuciusDevLab/LuciProxy/releases"
RAW_VERSION_URL = "https://raw.githubusercontent.com/LuciusDevLab/LuciProxy/main/version.json"


def parse_semver(version_str: str) -> Optional[Tuple[int, int, int, str]]:
    """
    Parses a semantic version string into (major, minor, patch, prerelease).
    Strips leading 'v' or 'V' and whitespace.
    Returns None if the string is not a valid semantic version.
    Examples:
        '1.0.0' -> (1, 0, 0, '')
        'v1.0.1' -> (1, 0, 1, '')
        '1.2.3-beta.1' -> (1, 2, 3, 'beta.1')
    """
    cleaned = str(version_str or "").strip().lstrip("vV")
    m = re.match(r"^(\d+)(?:\.(\d+))?(?:\.(\d+))?(?:-([a-zA-Z0-9.-]+))?$", cleaned)
    if not m:
        return None

    try:
        major = int(m.group(1))
        minor = int(m.group(2) or 0)
        patch = int(m.group(3) or 0)
        prerelease = m.group(4) or ""
        return (major, minor, patch, prerelease)
    except Exception:
        return None


def is_newer_version(remote: str, current: str) -> bool:
    """
    Returns True if remote version is strictly newer than current version.
    Returns False if equal, older, or if either string is invalid.
    Examples:
        is_newer_version('1.0.1', '1.0.0') -> True
        is_newer_version('1.1.0', '1.0.9') -> True
        is_newer_version('2.0.0', '1.9.9') -> True
        is_newer_version('1.10.0', '1.9.0') -> True
        is_newer_version('1.0.0', '1.0.0') -> False
        is_newer_version('0.9.9', '1.0.0') -> False
    """
    try:
        r_maj, r_min, r_pat, r_pre = parse_semver(remote)
        c_maj, c_min, c_pat, c_pre = parse_semver(current)
    except Exception:
        return False

    # 1. Compare numeric triples (major, minor, patch)
    if (r_maj, r_min, r_pat) > (c_maj, c_min, c_pat):
        return True
    if (r_maj, r_min, r_pat) < (c_maj, c_min, c_pat):
        return False

    # 2. Identical numeric triples: formal release is newer than pre-release
    # e.g., '1.0.0' is newer than '1.0.0-rc1'
    if not r_pre and c_pre:
        return True
    if r_pre and not c_pre:
        return False
    if r_pre and c_pre:
        return r_pre > c_pre

    return False
