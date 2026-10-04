"""
LuciProxy Builder - Lightweight Upstream Update Checker.
Performs anonymous, non-blocking check against public GitHub version.json
with zero telemetry and fail-silent behavior on network issues.
"""

from dataclasses import dataclass
import logging
import time
from typing import Optional
import requests

from ..version import (
    BUILDER_VERSION,
    RAW_VERSION_URL,
    REPO_URL,
    RELEASE_URL,
    is_newer_version,
    parse_semver,
)

logger = logging.getLogger("luciproxy.builder.update_checker")

# In-memory timestamp of last check to debounce rapid successive invocations
_LAST_CHECK_TIME = 0.0
_MIN_CHECK_INTERVAL_SECS = 30.0


@dataclass
class VersionInfo:
    """Represents remote release metadata from version.json."""
    version: str
    repo_url: str
    release_url: str
    changelog: str
    released_at: str


def fetch_latest_version(
    url: str = RAW_VERSION_URL,
    timeout_secs: float = 4.0,
    force: bool = False
) -> Optional[VersionInfo]:
    """
    Fetches and parses remote version.json from GitHub anonymously.
    Returns VersionInfo if valid JSON with required fields is fetched.
    Returns None on any network failure, timeout, HTTP error, or malformed data.
    Never raises exceptions.
    """
    global _LAST_CHECK_TIME
    now = time.time()
    if not force and (now - _LAST_CHECK_TIME) < _MIN_CHECK_INTERVAL_SECS:
        logger.debug("Skipping update check; debounced within %ds interval.", _MIN_CHECK_INTERVAL_SECS)
        return None

    _LAST_CHECK_TIME = now

    headers = {
        "User-Agent": "LuciProxy-Builder-UpdateChecker/1.0",
        "Accept": "application/json",
    }

    try:
        resp = requests.get(
            url,
            headers=headers,
            timeout=timeout_secs,
            allow_redirects=True
        )

        if resp.status_code != 200:
            logger.debug("Update check returned HTTP %d from %s", resp.status_code, url)
            return None

        data = resp.json()
        if not isinstance(data, dict):
            logger.debug("version.json is not a valid JSON dictionary")
            return None

        # Validate required fields
        version = str(data.get("version") or "").strip()
        repo_url = str(data.get("repo_url") or REPO_URL).strip()
        release_url = str(data.get("release_url") or RELEASE_URL).strip()
        changelog = str(data.get("changelog") or "Bug fixes and performance improvements.").strip()
        released_at = str(data.get("released_at") or "").strip()

        if not version or parse_semver(version) is None:
            logger.debug("version.json missing or invalid authoritative 'version' field: %s", version)
            return None

        return VersionInfo(
            version=version,
            repo_url=repo_url,
            release_url=release_url,
            changelog=changelog,
            released_at=released_at,
        )

    except requests.exceptions.Timeout:
        logger.debug("Update check timed out after %.1fs", timeout_secs)
        return None
    except requests.exceptions.RequestException as e:
        logger.debug("Update check network error: %s", e)
        return None
    except Exception as e:
        logger.debug("Unexpected error during update check: %s", e)
        return None


def check_for_update(
    current_version: str = BUILDER_VERSION,
    url: str = RAW_VERSION_URL,
    timeout_secs: float = 4.0,
    force: bool = False
) -> Optional[VersionInfo]:
    """
    Checks if a newer release exists on GitHub.
    Returns VersionInfo if remote version > current_version.
    Returns None if remote version <= current_version or check failed.
    """
    remote_info = fetch_latest_version(url=url, timeout_secs=timeout_secs, force=force)
    if not remote_info:
        return None

    if is_newer_version(remote=remote_info.version, current=current_version):
        logger.info(
            "Newer Builder version found: %s (current: %s)",
            remote_info.version,
            current_version
        )
        return remote_info

    logger.debug("Current Builder version %s is up-to-date.", current_version)
    return None
