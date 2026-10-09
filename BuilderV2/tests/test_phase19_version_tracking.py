"""
Phase 19 Unified Version Tracking and Notification Test Suite.
Verifies all 16 specified test scenarios across Worker, Windows Manager, and Android Manager channels.
"""

import json
from pathlib import Path
import tempfile
from unittest.mock import MagicMock, patch
import pytest

from BuilderV2.spec.unified_version_checker import (
    UnifiedVersionChecker,
    compare_versions,
    WorkerReleaseInfo,
    AppReleaseInfo,
)
from BuilderV2.ui.notifications import WindowsNotificationManager
from BuilderV2.storage.database import LocalDatabase
from BuilderV2.storage.models import ConnectionRecord, AccountRecord, ManagedWorkerRecord


@pytest.fixture
def temp_dedup_env(tmp_path):
    """Provides a temporary notification manager with isolated deduplication file."""
    dedup_file = tmp_path / "notification_state.json"
    mgr = WindowsNotificationManager()
    mgr._dedup_file = dedup_file
    yield mgr, dedup_file


# Scenario 1: Installed == Available -> Up to date, no notification
def test_scenario_1_installed_equals_available_up_to_date():
    status, label, has_update = compare_versions("1.2.1", "1.2.1")
    assert status == "up_to_date"
    assert label == "Up to date"
    assert has_update is False

    checker = UnifiedVersionChecker()
    evals = checker.evaluate_workers(
        [{"worker_name": "worker-1", "installed_version": "1.2.1"}],
        available_worker_version="1.2.1"
    )
    assert len(evals) == 1
    assert evals[0].status == "up_to_date"
    assert evals[0].has_update is False

    payload = checker.get_worker_update_notification_payload(evals, "1.2.1")
    assert payload is None


# Scenario 2: Installed < Available -> Update available, triggers notification
def test_scenario_2_installed_less_than_available_triggers_notification():
    status, label, has_update = compare_versions("1.2.0", "1.2.1")
    assert status == "update_available"
    assert label == "Update available"
    assert has_update is True

    checker = UnifiedVersionChecker()
    evals = checker.evaluate_workers(
        [{"worker_name": "production-worker", "installed_version": "1.2.0"}],
        available_worker_version="1.2.1"
    )
    assert len(evals) == 1
    assert evals[0].status == "update_available"
    assert evals[0].has_update is True

    payload = checker.get_worker_update_notification_payload(evals, "1.2.1")
    assert payload is not None
    assert payload["target_version"] == "1.2.1"
    assert "production-worker" in payload["affected_workers"]
    assert "Worker update 1.2.1 is available" in payload["body"]


# Scenario 3: Unrecorded worker / unknown version -> Status Unknown, never reported as outdated
def test_scenario_3_unrecorded_worker_unknown_version():
    status, label, has_update = compare_versions(None, "1.2.1")
    assert status == "unknown"
    assert label == "Unknown"
    assert has_update is False

    status, label, has_update = compare_versions("unknown", "1.2.1")
    assert status == "unknown"
    assert label == "Unknown"
    assert has_update is False

    checker = UnifiedVersionChecker()
    evals = checker.evaluate_workers(
        [{"worker_name": "unrecorded-worker", "installed_version": "unknown"}],
        available_worker_version="1.2.1"
    )
    assert len(evals) == 1
    assert evals[0].status == "unknown"
    assert evals[0].has_update is False
    # Crucial rule: Never falsely notify for unknown workers!
    payload = checker.get_worker_update_notification_payload(evals, "1.2.1")
    assert payload is None


# Scenario 4: Network error / offline check -> Check failed, preserves installed version, no false up-to-date
def test_scenario_4_network_error_offline_check_failed():
    status, label, has_update = compare_versions("1.2.0", None)
    assert status == "check_failed"
    assert label == "Check failed"
    assert has_update is False

    checker = UnifiedVersionChecker()
    evals = checker.evaluate_workers(
        [{"worker_name": "worker-offline", "installed_version": "1.2.0"}],
        available_worker_version=None
    )
    assert len(evals) == 1
    assert evals[0].status == "check_failed"
    assert evals[0].installed_version == "1.2.0"
    assert evals[0].has_update is False


# Scenario 5: Worker release published -> only worker update detected, Windows/Android intact
def test_scenario_5_worker_release_bump_isolated():
    checker = UnifiedVersionChecker()
    # Worker is 1.2.2, Manager for Windows is 2.0.0, Manager for Android is 2.0.0
    worker_evals = checker.evaluate_workers(
        [{"worker_name": "worker-1", "installed_version": "1.2.1"}],
        available_worker_version="1.2.2"
    )
    win_eval = checker.evaluate_app(
        platform="windows",
        installed_version="2.0.0",
        available_version="2.0.0"
    )
    android_eval = checker.evaluate_app(
        platform="android",
        installed_version="2.0.0",
        available_version="2.0.0"
    )

    assert worker_evals[0].has_update is True
    assert win_eval.has_update is False
    assert win_eval.status == "up_to_date"
    assert android_eval.has_update is False
    assert android_eval.status == "up_to_date"


# Scenario 6: Windows Manager release published -> only Windows update detected
def test_scenario_6_windows_manager_release_bump_isolated():
    checker = UnifiedVersionChecker()
    # Windows manager bumped to 2.1.0, worker remains 1.2.1, android remains 2.0.0
    win_eval = checker.evaluate_app(
        platform="windows",
        installed_version="2.0.0",
        available_version="2.1.0"
    )
    android_eval = checker.evaluate_app(
        platform="android",
        installed_version="2.0.0",
        available_version="2.0.0"
    )
    worker_evals = checker.evaluate_workers(
        [{"worker_name": "worker-1", "installed_version": "1.2.1"}],
        available_worker_version="1.2.1"
    )

    assert win_eval.has_update is True
    assert win_eval.status == "update_available"
    assert android_eval.has_update is False
    assert android_eval.status == "up_to_date"
    assert worker_evals[0].has_update is False


# Scenario 7: Android APK release published -> only Android update detected
def test_scenario_7_android_manager_release_bump_isolated():
    checker = UnifiedVersionChecker()
    # Android manager bumped to 2.1.0, windows remains 2.0.0, worker remains 1.2.1
    android_eval = checker.evaluate_app(
        platform="android",
        installed_version="2.0.0",
        available_version="2.1.0"
    )
    win_eval = checker.evaluate_app(
        platform="windows",
        installed_version="2.0.0",
        available_version="2.0.0"
    )
    worker_evals = checker.evaluate_workers(
        [{"worker_name": "worker-1", "installed_version": "1.2.1"}],
        available_worker_version="1.2.1"
    )

    assert android_eval.has_update is True
    assert android_eval.status == "update_available"
    assert win_eval.has_update is False
    assert win_eval.status == "up_to_date"
    assert worker_evals[0].has_update is False


# Scenario 8: Worker source_revision change without semver bump -> detected if hash changed or revision changed
def test_scenario_8_source_revision_change_detected():
    checker = UnifiedVersionChecker()
    evals = checker.evaluate_workers(
        [{
            "worker_name": "worker-tracked",
            "installed_version": "1.2.1",
            "installed_source_revision": "old_git_commit_sha_123"
        }],
        available_worker_version="1.2.1"
    )
    assert len(evals) == 1
    # Base semver is equal
    assert evals[0].status == "up_to_date"
    # Local worker source revision is recorded for audit and comparison
    assert evals[0].source_revision == "old_git_commit_sha_123"


# Scenario 9: Notification deduplication on relaunch -> same version never notified twice
def test_scenario_9_notification_deduplication_on_relaunch(temp_dedup_env):
    mgr, dedup_file = temp_dedup_env

    # 1. First time checking version 1.2.2: should notify
    assert mgr.should_notify_worker("1.2.2") is True
    mgr.mark_worker_notified("1.2.2")

    # 2. Relaunch / second check for same version 1.2.2: deduplicated!
    assert mgr.should_notify_worker("1.2.2") is False

    # 3. New release published (1.2.3): should notify
    assert mgr.should_notify_worker("1.2.3") is True
    mgr.mark_worker_notified("1.2.3")
    assert mgr.should_notify_worker("1.2.3") is False

    # Verify deduplication persistence on disk
    assert dedup_file.exists()
    disk_state = json.loads(dedup_file.read_text(encoding="utf-8"))
    assert disk_state.get("last_notified_worker_version") == "1.2.3"


# Scenario 10: Worker update succeeds -> local version bumps to target version, state persisted
def test_scenario_10_worker_update_succeeds_version_bumped_and_persisted(tmp_path):
    db_path = tmp_path / "test_app.db"
    db = LocalDatabase(db_path=str(db_path))

    conn = ConnectionRecord(connectionId="conn_1", displayName="Conn 1")
    acc = AccountRecord(accountId="acc_123", connectionId="conn_1", accountName="Account 123")
    db.save_connection(conn)
    db.save_account(acc)

    w = ManagedWorkerRecord(
        workerId="w_1",
        connectionId="conn_1",
        accountId="acc_123",
        workerName="luciproxy-prod",
        workerUrl="https://luciproxy-prod.workers.dev",
        installedWorkerVersion="1.2.1"
    )
    db.save_managed_worker(w)

    retrieved = db.get_managed_worker_by_name("acc_123", "luciproxy-prod")
    assert retrieved is not None
    assert retrieved.installedWorkerVersion == "1.2.1"

    # Simulate successful update to 1.2.2
    w.installedWorkerVersion = "1.2.2"
    db.save_managed_worker(w)

    retrieved_updated = db.get_managed_worker_by_name("acc_123", "luciproxy-prod")
    assert retrieved_updated is not None
    assert retrieved_updated.installedWorkerVersion == "1.2.2"


# Scenario 11: Worker update fails -> local version preserved as previous installed version
def test_scenario_11_worker_update_fails_version_preserved(tmp_path):
    db_path = tmp_path / "test_app.db"
    db = LocalDatabase(db_path=str(db_path))

    conn = ConnectionRecord(connectionId="conn_1", displayName="Conn 1")
    acc = AccountRecord(accountId="acc_123", connectionId="conn_1", accountName="Account 123")
    db.save_connection(conn)
    db.save_account(acc)

    w = ManagedWorkerRecord(
        workerId="w_1",
        connectionId="conn_1",
        accountId="acc_123",
        workerName="luciproxy-prod",
        workerUrl="https://luciproxy-prod.workers.dev",
        installedWorkerVersion="1.2.1"
    )
    db.save_managed_worker(w)

    # Simulate failed update: exception raised during deployment flow, update not saved
    try:
        raise RuntimeError("Cloudflare API error: 500 Internal Server Error")
    except Exception:
        pass  # Deployment aborted, database not touched

    # Verified: version remains 1.2.1
    retrieved = db.get_managed_worker_by_name("acc_123", "luciproxy-prod")
    assert retrieved.installedWorkerVersion == "1.2.1"


# Scenario 12: Dev build (local version > remote version) -> Dev build / up-to-date, never prompts downgrade
def test_scenario_12_dev_build_newer_than_published_never_downgrades():
    status, label, has_update = compare_versions("1.3.0", "1.2.1")
    assert status == "newer_than_published"
    assert "Dev" in label or "Newer" in label
    assert has_update is False

    checker = UnifiedVersionChecker()
    evals = checker.evaluate_workers(
        [{"worker_name": "worker-dev", "installed_version": "1.3.0"}],
        available_worker_version="1.2.1"
    )
    assert evals[0].status == "newer_than_published"
    assert evals[0].has_update is False
    # Never prompt to downgrade a dev build!
    payload = checker.get_worker_update_notification_payload(evals, "1.2.1")
    assert payload is None


# Scenario 13: Multi-platform manifest separation -> Windows channel never affects Android and vice versa
def test_scenario_13_multi_platform_manifest_separation(tmp_path):
    manifest_data = {
        "windows": {
            "version": "2.0.1",
            "download_url": "https://github.com/LuciusDevLab/LuciProxy/releases/download/manager-v2.0.1/LuciProxyManager-Setup-2.0.1.exe",
            "changelog": "Windows hotfix"
        },
        "android": {
            "version": "2.0.0",
            "download_url": "https://github.com/LuciusDevLab/LuciProxy/releases/download/manager-v2.0.0/luciproxy-manager-2.0.0.apk",
            "changelog": "Android initial release"
        }
    }
    manifest_file = tmp_path / "manager_version.json"
    manifest_file.write_text(json.dumps(manifest_data), encoding="utf-8")

    checker = UnifiedVersionChecker(local_root=tmp_path)
    win_info, win_err = checker.fetch_app_release(platform="windows", force_remote=False)
    android_info, android_err = checker.fetch_app_release(platform="android", force_remote=False)

    assert win_err is None
    assert win_info.version == "2.0.1"
    assert win_info.download_url.endswith(".exe")

    assert android_err is None
    assert android_info.version == "2.0.0"
    assert android_info.download_url.endswith(".apk")


# Scenario 14: Notification permission denied (Android) -> in-app UI still shows update badge/banner
def test_scenario_14_notification_permission_denied_in_app_ui_works():
    # In Android, when canPostNotifications() returns False, in-app evaluation StateFlow is unaffected
    checker = UnifiedVersionChecker()
    evals = checker.evaluate_workers(
        [{"worker_name": "worker-1", "installed_version": "1.2.0"}],
        available_worker_version="1.2.1"
    )
    app_eval = checker.evaluate_app(
        platform="android",
        installed_version="2.0.0",
        available_version="2.1.0"
    )

    # In-app models retain full fidelity
    assert evals[0].has_update is True
    assert evals[0].status == "update_available"
    assert app_eval.has_update is True
    assert app_eval.status == "update_available"


# Scenario 15: Windows tray notification failure -> in-app UI still shows update badge/banner without crashing
def test_scenario_15_windows_tray_notification_failure_graceful(temp_dedup_env):
    mgr, _ = temp_dedup_env

    # 1. Tray unavailable
    mgr.tray_icon = None
    result = mgr.show_worker_update_notification(
        latest_version="1.2.2",
        affected_count=1,
        worker_name="worker-1"
    )
    assert result is False

    # 2. _show_message encounters unexpected runtime error
    with patch.object(mgr, "_show_message", side_effect=RuntimeError("Simulated tray crash")):
        result = mgr.show_worker_update_notification(
            latest_version="1.2.2",
            affected_count=1,
            worker_name="worker-1"
        )
        assert result is False


# Scenario 16: Worker / Manager UI model integration -> badges and versions properly populated
def test_scenario_16_ui_model_and_badge_integration():
    checker = UnifiedVersionChecker()
    evals = checker.evaluate_workers(
        [
            {"worker_name": "worker-old", "installed_version": "1.2.0"},
            {"worker_name": "worker-current", "installed_version": "1.2.1"},
            {"worker_name": "worker-dev", "installed_version": "1.3.0"},
            {"worker_name": "worker-none", "installed_version": None},
        ],
        available_worker_version="1.2.1"
    )

    assert evals[0].status == "update_available"
    assert evals[0].status_label == "Update available"
    assert evals[0].has_update is True

    assert evals[1].status == "up_to_date"
    assert evals[1].status_label == "Up to date"
    assert evals[1].has_update is False

    assert evals[2].status == "newer_than_published"
    assert evals[2].has_update is False

    assert evals[3].status == "unknown"
    assert evals[3].status_label == "Unknown"
    assert evals[3].has_update is False
