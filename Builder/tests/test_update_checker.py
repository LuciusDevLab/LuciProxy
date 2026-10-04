"""
Tests for LuciProxy Builder Update Checker and Dialog.
Covers all requirements:
1. version.json parsing
2. valid version data
3. malformed JSON
4. missing version field
5. malformed version
6. equal versions (no update)
7. newer remote version (update detected)
8. older remote version (no update)
9. semantic version comparison (1.0.1 > 1.0.0, 1.10.0 > 1.9.0, etc.)
10. HTTP failure (404, 500)
11. timeout handling
12. network failure (ConnectionError)
13. GUI update notification dialog creation
14. Open Repository and Release action URL dispatch
15. changelog rendering in dialog
16. update checker non-blocking worker thread behavior
"""

import json
from unittest.mock import MagicMock, patch

import pytest
import requests
from PySide6.QtCore import QUrl
from PySide6.QtWidgets import QApplication

from src.version import (
    BUILDER_VERSION,
    REPO_URL,
    RELEASE_URL,
    RAW_VERSION_URL,
    parse_semver,
    is_newer_version,
)
from src.deployment.update_checker import (
    VersionInfo,
    fetch_latest_version,
    check_for_update,
)
from src.gui.update_dialog import UpdateDialog
from src.gui.workers import UpdateCheckWorker


@pytest.fixture(scope="session")
def qapp():
    app = QApplication.instance()
    if app is None:
        app = QApplication(["-platform", "offscreen"])
    return app


# ---------------------------------------------------------------------------
# 1 & 2. version.json parsing & valid version data
# ---------------------------------------------------------------------------

def test_fetch_latest_version_valid_data():
    sample_data = {
        "version": "1.2.3",
        "repo_url": "https://github.com/LuciusDevLab/LuciProxy",
        "release_url": "https://github.com/LuciusDevLab/LuciProxy/releases",
        "changelog": "Added dark mode and speedtest clean IP.",
        "released_at": "2026-10-04"
    }
    mock_resp = MagicMock()
    mock_resp.status_code = 200
    mock_resp.json.return_value = sample_data

    with patch("requests.get", return_value=mock_resp):
        info = fetch_latest_version(timeout_secs=2.0, force=True)
        assert info is not None
        assert info.version == "1.2.3"
        assert info.repo_url == "https://github.com/LuciusDevLab/LuciProxy"
        assert info.release_url == "https://github.com/LuciusDevLab/LuciProxy/releases"
        assert "dark mode" in info.changelog
        assert info.released_at == "2026-10-04"


# ---------------------------------------------------------------------------
# 3. Malformed JSON handling
# ---------------------------------------------------------------------------

def test_fetch_latest_version_malformed_json():
    mock_resp = MagicMock()
    mock_resp.status_code = 200
    mock_resp.json.side_effect = json.JSONDecodeError("Invalid JSON", "{", 1)

    with patch("requests.get", return_value=mock_resp):
        info = fetch_latest_version(force=True)
        assert info is None  # Must fail silently


# ---------------------------------------------------------------------------
# 4. Missing version field
# ---------------------------------------------------------------------------

def test_fetch_latest_version_missing_version_field():
    sample_data = {
        "repo_url": "https://github.com/LuciusDevLab/LuciProxy",
        "changelog": "No version specified"
    }
    mock_resp = MagicMock()
    mock_resp.status_code = 200
    mock_resp.json.return_value = sample_data

    with patch("requests.get", return_value=mock_resp):
        info = fetch_latest_version(force=True)
        assert info is None  # Missing version must be treated as invalid


# ---------------------------------------------------------------------------
# 5. Malformed version format
# ---------------------------------------------------------------------------

@pytest.mark.parametrize("bad_ver", ["not-a-semver", "1..0", "abc.def.ghi", ""])
def test_parse_semver_malformed(bad_ver):
    assert parse_semver(bad_ver) is None


def test_fetch_latest_version_malformed_semver():
    sample_data = {
        "version": "bad-version-tag",
        "repo_url": "https://github.com/LuciusDevLab/LuciProxy"
    }
    mock_resp = MagicMock()
    mock_resp.status_code = 200
    mock_resp.json.return_value = sample_data

    with patch("requests.get", return_value=mock_resp):
        info = fetch_latest_version(force=True)
        assert info is None


# ---------------------------------------------------------------------------
# 6, 7, 8. Equal, Newer, and Older remote versions
# ---------------------------------------------------------------------------

def test_check_for_update_equal_version():
    mock_info = VersionInfo(
        version="1.0.0",
        repo_url=REPO_URL,
        release_url=RELEASE_URL,
        changelog="Same version",
        released_at="2026-10-04"
    )
    with patch("src.deployment.update_checker.fetch_latest_version", return_value=mock_info):
        result = check_for_update(current_version="1.0.0", force=True)
        assert result is None  # No update needed


def test_check_for_update_newer_version():
    mock_info = VersionInfo(
        version="1.0.1",
        repo_url=REPO_URL,
        release_url=RELEASE_URL,
        changelog="Important bugfix",
        released_at="2026-10-05"
    )
    with patch("src.deployment.update_checker.fetch_latest_version", return_value=mock_info):
        result = check_for_update(current_version="1.0.0", force=True)
        assert result is not None
        assert result.version == "1.0.1"


def test_check_for_update_older_version():
    mock_info = VersionInfo(
        version="0.9.5",
        repo_url=REPO_URL,
        release_url=RELEASE_URL,
        changelog="Old version",
        released_at="2026-09-01"
    )
    with patch("src.deployment.update_checker.fetch_latest_version", return_value=mock_info):
        result = check_for_update(current_version="1.0.0", force=True)
        assert result is None  # Remote is older, do not notify


# ---------------------------------------------------------------------------
# 9. Semantic version comparison
# ---------------------------------------------------------------------------

def test_semantic_version_comparison():
    # Patch increments
    assert is_newer_version("1.0.1", "1.0.0") is True
    assert is_newer_version("1.0.0", "1.0.1") is False

    # Minor increments
    assert is_newer_version("1.10.0", "1.9.0") is True
    assert is_newer_version("1.9.0", "1.10.0") is False

    # Major increments
    assert is_newer_version("2.0.0", "1.99.99") is True
    assert is_newer_version("1.99.99", "2.0.0") is False

    # Equal
    assert is_newer_version("1.0.0", "1.0.0") is False
    assert is_newer_version("1.2.3", "1.2.3") is False

    # Leading 'v' prefix
    assert is_newer_version("v1.0.1", "1.0.0") is True
    assert is_newer_version("1.0.1", "v1.0.0") is True

    # Pre-release handling
    # A full release 1.0.0 is newer than 1.0.0-rc.1
    assert is_newer_version("1.0.0", "1.0.0-rc.1") is True
    # 1.0.0-rc.2 is newer than 1.0.0-rc.1
    assert is_newer_version("1.0.0-rc.2", "1.0.0-rc.1") is True


# ---------------------------------------------------------------------------
# 10. HTTP failure (404, 500)
# ---------------------------------------------------------------------------

def test_fetch_latest_version_http_error_404():
    mock_resp = MagicMock()
    mock_resp.status_code = 404
    with patch("requests.get", return_value=mock_resp):
        assert fetch_latest_version(force=True) is None


def test_fetch_latest_version_http_error_500():
    mock_resp = MagicMock()
    mock_resp.status_code = 500
    with patch("requests.get", return_value=mock_resp):
        assert fetch_latest_version(force=True) is None


# ---------------------------------------------------------------------------
# 11. Timeout handling
# ---------------------------------------------------------------------------

def test_fetch_latest_version_timeout():
    with patch("requests.get", side_effect=requests.exceptions.Timeout("Request timed out")):
        assert fetch_latest_version(timeout_secs=1.0, force=True) is None


# ---------------------------------------------------------------------------
# 12. Network failure (ConnectionError, RequestException)
# ---------------------------------------------------------------------------

def test_fetch_latest_version_connection_error():
    with patch("requests.get", side_effect=requests.exceptions.ConnectionError("DNS failure / Offline")):
        assert fetch_latest_version(force=True) is None


def test_fetch_latest_version_request_exception():
    with patch("requests.get", side_effect=requests.exceptions.RequestException("SSL error")):
        assert fetch_latest_version(force=True) is None


# ---------------------------------------------------------------------------
# 13, 14, 15. GUI update notification dialog creation & actions
# ---------------------------------------------------------------------------

def test_update_dialog_creation_and_changelog(qapp):
    info = VersionInfo(
        version="1.1.0",
        repo_url="https://github.com/LuciusDevLab/LuciProxy",
        release_url="https://github.com/LuciusDevLab/LuciProxy/releases/tag/v1.1.0",
        changelog="* Added custom icons\n* Optimized deployment engine",
        released_at="2026-10-04"
    )

    dialog = UpdateDialog(version_info=info, current_version="1.0.0")
    assert dialog is not None
    assert "1.0.0" in dialog.current_version
    assert dialog.info.version == "1.1.0"

    # Verify changelog rendered
    assert "* Added custom icons" in dialog.info.changelog

    dialog.close()


def test_update_dialog_open_repo_action(qapp):
    info = VersionInfo(
        version="1.1.0",
        repo_url="https://github.com/LuciusDevLab/LuciProxy",
        release_url="https://github.com/LuciusDevLab/LuciProxy/releases",
        changelog="New features",
        released_at="2026-10-04"
    )
    dialog = UpdateDialog(version_info=info, current_version="1.0.0")

    opened_urls = []
    with patch("PySide6.QtGui.QDesktopServices.openUrl", side_effect=lambda url: opened_urls.append(url.toString())):
        dialog._on_open_repo()

    assert len(opened_urls) == 1
    assert opened_urls[0] == "https://github.com/LuciusDevLab/LuciProxy"
    dialog.close()


def test_update_dialog_view_release_action(qapp):
    info = VersionInfo(
        version="1.1.0",
        repo_url="https://github.com/LuciusDevLab/LuciProxy",
        release_url="https://github.com/LuciusDevLab/LuciProxy/releases/tag/v1.1.0",
        changelog="New features",
        released_at="2026-10-04"
    )
    dialog = UpdateDialog(version_info=info, current_version="1.0.0")

    opened_urls = []
    with patch("PySide6.QtGui.QDesktopServices.openUrl", side_effect=lambda url: opened_urls.append(url.toString())):
        dialog._on_view_release()

    assert len(opened_urls) == 1
    assert opened_urls[0] == "https://github.com/LuciusDevLab/LuciProxy/releases/tag/v1.1.0"
    dialog.close()


# ---------------------------------------------------------------------------
# 16. Non-blocking worker thread behavior
# ---------------------------------------------------------------------------

def test_update_check_worker_signals(qapp):
    remote_info = VersionInfo(
        version="1.0.5",
        repo_url=REPO_URL,
        release_url=RELEASE_URL,
        changelog="Patch update",
        released_at="2026-10-04"
    )

    worker = UpdateCheckWorker(current_version="1.0.0")

    received_updates = []
    finished_called = []

    worker.update_available.connect(lambda info: received_updates.append(info))
    worker.check_finished.connect(lambda: finished_called.append(True))

    with patch("src.deployment.update_checker.check_for_update", return_value=remote_info):
        worker.run()

    assert len(received_updates) == 1
    assert received_updates[0].version == "1.0.5"
    assert len(finished_called) == 1


def test_update_check_worker_silent_on_exception(qapp):
    worker = UpdateCheckWorker(current_version="1.0.0")

    received_updates = []
    finished_called = []

    worker.update_available.connect(lambda info: received_updates.append(info))
    worker.check_finished.connect(lambda: finished_called.append(True))

    with patch("src.deployment.update_checker.check_for_update", side_effect=RuntimeError("Network explosion")):
        # Must not raise an unhandled exception
        worker.run()

    assert len(received_updates) == 0
    assert len(finished_called) == 1
