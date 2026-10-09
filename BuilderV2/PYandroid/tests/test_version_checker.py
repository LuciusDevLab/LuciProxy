import json
import pytest
from unittest.mock import MagicMock, patch

from BuilderV2.PYandroid.src.core.version_checker import (
    parse_semver,
    is_newer_version,
    compare_versions,
    PortableVersionChecker,
)
from BuilderV2.PYandroid.src.bridge.interface import LuciproxyBridge


def test_parse_semver():
    assert parse_semver("1.2.1") == (1, 2, 1, "")
    assert parse_semver("v1.2.1") == (1, 2, 1, "")
    assert parse_semver("worker-v1.2.2") == (1, 2, 2, "")
    assert parse_semver("manager-v2.0.0") == (2, 0, 0, "")
    assert parse_semver("1.2.3-beta.1") == (1, 2, 3, "beta.1")
    assert parse_semver("invalid") is None
    assert parse_semver("") is None


def test_is_newer_version():
    assert is_newer_version("1.2.2", "1.2.1") is True
    assert is_newer_version("1.10.0", "1.9.0") is True  # Numerical comparison, not lexical!
    assert is_newer_version("2.0.0", "1.99.99") is True
    assert is_newer_version("1.2.1", "1.2.1") is False
    assert is_newer_version("1.2.0", "1.2.1") is False
    assert is_newer_version("v1.2.2", "v1.2.1") is True


def test_compare_versions_up_to_date():
    status, label, has_update = compare_versions("1.2.1", "1.2.1")
    assert status == "up_to_date"
    assert label == "Up to date"
    assert has_update is False


def test_compare_versions_update_available():
    status, label, has_update = compare_versions("1.2.0", "1.2.1")
    assert status == "update_available"
    assert label == "Update available"
    assert has_update is True


def test_compare_versions_unknown_installed():
    status, label, has_update = compare_versions("unknown", "1.2.1")
    assert status == "unknown"
    assert label == "Unknown"
    assert has_update is False

    status, label, has_update = compare_versions("", "1.2.1")
    assert status == "unknown"
    assert has_update is False


def test_compare_versions_check_failed_available():
    status, label, has_update = compare_versions("1.2.1", "")
    assert status == "check_failed"
    assert label == "Check failed"
    assert has_update is False


def test_compare_versions_newer_than_published_dev():
    status, label, has_update = compare_versions("1.3.0", "1.2.1")
    assert status == "newer_than_published"
    assert has_update is False


def test_portable_checker_offline_handling():
    checker = PortableVersionChecker()
    # Mock requests to fail
    with patch("requests.Session.get", side_effect=Exception("Network error")):
        res = checker.check_all(
            platform="android",
            installed_app_version="2.0.0",
            managed_workers=[{"account_id": "acc1", "worker_name": "worker1", "installed_version": "1.2.0"}]
        )
        assert res["success"] is False
        assert res["app_evaluation"]["status"] == "check_failed"
        assert res["worker_evaluations"][0]["status"] == "check_failed"
        assert res["workers_needing_update_count"] == 0


def test_portable_checker_successful_check():
    checker = PortableVersionChecker()
    worker_manifest = {
        "version": "1.2.2",
        "source_revision": "abc1234",
        "changelog": "Bugfixes"
    }
    manager_manifest = {
        "channels": {
            "android": {
                "version": "2.1.0",
                "download_url": "https://github.com/LuciusDevLab/LuciProxy/releases/download/v2.1.0/app.apk",
                "notes": "Parity release"
            },
            "windows": {
                "version": "2.1.0",
                "download_url": "https://github.com/LuciusDevLab/LuciProxy/releases/download/v2.1.0/setup.exe"
            }
        }
    }

    def mock_get(*args, **kwargs):
        url = str(args[0] if args else kwargs.get("url", ""))
        mock = MagicMock()
        mock.status_code = 200
        mock.ok = True
        if "manager_version.json" in url:
            mock.json.return_value = manager_manifest
        elif "version.json" in url:
            mock.json.return_value = worker_manifest
        else:
            mock.json.return_value = {}
        return mock

    with patch("requests.Session.get", side_effect=mock_get):
        res = checker.check_all(
            platform="android",
            installed_app_version="2.0.0",
            managed_workers=[
                {"account_id": "acc1", "worker_name": "worker-old", "installed_version": "1.2.1", "installed_source_revision": "old_rev"},
                {"account_id": "acc1", "worker_name": "worker-current", "installed_version": "1.2.2", "installed_source_revision": "abc1234"},
                {"account_id": "acc1", "worker_name": "worker-unknown", "installed_version": "unknown"}
            ]
        )
        assert res["success"] is True
        assert res["app_evaluation"]["has_update"] is True
        assert res["app_evaluation"]["available_version"] == "2.1.0"

        # Old worker needs update
        assert res["worker_evaluations"][0]["has_update"] is True
        assert res["worker_evaluations"][0]["status"] == "update_available"

        # Current worker is up to date
        assert res["worker_evaluations"][1]["has_update"] is False
        assert res["worker_evaluations"][1]["status"] == "up_to_date"

        # Unknown worker is unknown, not falsely updated
        assert res["worker_evaluations"][2]["has_update"] is False
        assert res["worker_evaluations"][2]["status"] == "unknown"


def test_bridge_check_updates_integration():
    bridge = LuciproxyBridge()
    with patch.object(PortableVersionChecker, "check_all") as mock_check:
        mock_check.return_value = {
            "success": True,
            "error": None,
            "platform": "android",
            "app_evaluation": {"status": "up_to_date"},
            "worker_evaluations": [],
            "workers_needing_update_count": 0,
        }
        res_json = bridge.check_updates_json(platform="android", installed_app_version="2.0.0", managed_workers_json="[]")
        res = json.loads(res_json)
        assert res["success"] is True
        assert res["app_evaluation"]["status"] == "up_to_date"
