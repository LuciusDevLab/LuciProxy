"""
Unit Tests for Phase 1.5 - Independent Worker and Manager Version Channels.
Validates:
1. GitHub Release Filtering across worker-*, manager-*, and legacy v* tags
2. Semantic Version Comparison (e.g. 1.10.0 > 1.9.0)
3. Notification Separation & Channel Independence (Scenarios A through F)
4. Version Manifest Isolation (version.json vs BuilderV2/app-version.json)
"""

import json
from pathlib import Path
import pytest

from BuilderV2.spec.versioning import (
    parse_semver,
    is_newer_version,
    WorkerReleaseService,
    ManagerReleaseService,
    calculate_notifications,
    WorkerVersionSignal,
    parse_worker_version_signal,
)


ROOT_DIR = Path(__file__).resolve().parent.parent.parent


# 1. Semantic Version Comparison Tests
def test_semver_numeric_ordering():
    # Minor and patch non-lexicographic ordering
    assert is_newer_version("v1.10.0", "v1.9.0") is True
    assert is_newer_version("v1.9.0", "v1.10.0") is False

    assert is_newer_version("v2.0.0", "v1.99.0") is True
    assert is_newer_version("v1.99.0", "v2.0.0") is False

    assert is_newer_version("1.2.1", "1.2.0") is True
    assert is_newer_version("1.2.0", "1.2.0") is False


def test_semver_tag_normalization():
    # worker-v and manager-v prefixes
    assert is_newer_version("worker-v1.3.0", "worker-v1.2.1") is True
    assert is_newer_version("worker-v1.2.1", "v1.2.0") is True
    assert is_newer_version("manager-v2.1.0", "manager-v2.0.0") is True


# 2. Release Channel Filtering Tests (Section 25)
def test_release_filtering_exact_scenario():
    """
    Given releases:
      - v1.2.0 (legacy worker)
      - worker-v1.2.1
      - worker-v1.3.0
      - manager-v2.0.0
      - manager-v2.1.0
    WorkerReleaseService returns worker-v1.3.0
    ManagerReleaseService returns manager-v2.1.0
    Legacy v1.2.0 recognized as Worker release.
    """
    mock_releases = [
        {"tag_name": "v1.2.0", "name": "Legacy Worker Release v1.2.0"},
        {"tag_name": "worker-v1.2.1", "name": "Worker Release v1.2.1"},
        {"tag_name": "worker-v1.3.0", "name": "Worker Release v1.3.0"},
        {"tag_name": "manager-v2.0.0", "name": "Manager Release v2.0.0"},
        {"tag_name": "manager-v2.1.0", "name": "Manager Release v2.1.0"},
    ]

    # Worker service validation
    worker_filtered = WorkerReleaseService.filter_releases(mock_releases)
    worker_tags = [r["tag_name"] for r in worker_filtered]
    assert worker_tags == ["v1.2.0", "worker-v1.2.1", "worker-v1.3.0"]
    assert "manager-v2.0.0" not in worker_tags
    assert "manager-v2.1.0" not in worker_tags

    latest_worker = WorkerReleaseService.get_latest_release(mock_releases)
    assert latest_worker is not None
    assert latest_worker["tag_name"] == "worker-v1.3.0"

    # Manager service validation
    manager_filtered = ManagerReleaseService.filter_releases(mock_releases)
    manager_tags = [r["tag_name"] for r in manager_filtered]
    assert manager_tags == ["manager-v2.0.0", "manager-v2.1.0"]
    assert "v1.2.0" not in manager_tags
    assert "worker-v1.2.1" not in manager_tags
    assert "worker-v1.3.0" not in manager_tags

    latest_manager = ManagerReleaseService.get_latest_release(mock_releases)
    assert latest_manager is not None
    assert latest_manager["tag_name"] == "manager-v2.1.0"


# 3. Notification Tests (Section 26 - Scenarios A through F)
def test_notification_scenario_a_worker_only():
    """Scenario A: New Worker release only -> Worker notification, no Manager notification."""
    workers = [{"workerName": "amber-finch-4827", "installedWorkerVersion": "v1.2.0"}]
    current_mgr = "v2.0.0"
    latest_wrk = {"tag_name": "worker-v1.2.1"}
    latest_mgr = {"tag_name": "manager-v2.0.0"}

    res = calculate_notifications(workers, current_mgr, latest_wrk, latest_mgr)
    assert res["worker_notification"] is not None
    assert res["worker_notification"]["channel"] == "luciproxy_worker_updates"
    assert "worker-v1.2.1 is available for amber-finch-4827" in res["worker_notification"]["body"]
    assert res["manager_notification"] is None


def test_notification_scenario_b_manager_only():
    """Scenario B: New Manager release only -> Manager notification, no Worker notification."""
    workers = [{"workerName": "amber-finch-4827", "installedWorkerVersion": "v1.2.1"}]
    current_mgr = "v2.0.0"
    latest_wrk = {"tag_name": "worker-v1.2.1"}
    latest_mgr = {"tag_name": "manager-v2.1.0"}

    res = calculate_notifications(workers, current_mgr, latest_wrk, latest_mgr)
    assert res["worker_notification"] is None
    assert res["manager_notification"] is not None
    assert res["manager_notification"]["channel"] == "luciproxy_manager_updates"
    assert "Manager manager-v2.1.0 is available" in res["manager_notification"]["body"]


def test_notification_scenario_c_both_new():
    """Scenario C: Both new -> Both notifications independently."""
    workers = [
        {"workerName": "amber-finch-4827", "installedWorkerVersion": "v1.2.0"},
        {"workerName": "blue-wolf-1934", "installedWorkerVersion": "v1.2.0"}
    ]
    current_mgr = "v2.0.0"
    latest_wrk = {"tag_name": "worker-v1.2.1"}
    latest_mgr = {"tag_name": "manager-v2.1.0"}

    res = calculate_notifications(workers, current_mgr, latest_wrk, latest_mgr)
    assert res["worker_notification"] is not None
    assert "worker-v1.2.1 is available for 2 Workers" in res["worker_notification"]["body"]
    assert res["manager_notification"] is not None
    assert "Manager manager-v2.1.0 is available" in res["manager_notification"]["body"]


def test_notification_scenario_d_neither_new():
    """Scenario D: Neither new -> No update notification."""
    workers = [{"workerName": "amber-finch-4827", "installedWorkerVersion": "v1.2.1"}]
    current_mgr = "v2.0.0"
    latest_wrk = {"tag_name": "worker-v1.2.1"}
    latest_mgr = {"tag_name": "manager-v2.0.0"}

    res = calculate_notifications(workers, current_mgr, latest_wrk, latest_mgr)
    assert res["worker_notification"] is None
    assert res["manager_notification"] is None


def test_notification_scenario_e_worker_current_equals_latest():
    """Scenario E: Worker current == latest -> No Worker notification."""
    workers = [{"workerName": "amber-finch-4827", "installedWorkerVersion": "worker-v1.2.1"}]
    current_mgr = "v2.0.0"
    latest_wrk = {"tag_name": "worker-v1.2.1"}
    latest_mgr = None

    res = calculate_notifications(workers, current_mgr, latest_wrk, latest_mgr)
    assert res["worker_notification"] is None


def test_notification_scenario_f_manager_current_equals_latest():
    """Scenario F: Manager current == latest -> No Manager notification."""
    workers = []
    current_mgr = "manager-v2.0.0"
    latest_wrk = None
    latest_mgr = {"tag_name": "manager-v2.0.0"}

    res = calculate_notifications(workers, current_mgr, latest_wrk, latest_mgr)
    assert res["manager_notification"] is None


# 4. Version File Separation Tests (Section 27)
def test_version_files_isolation():
    """
    Verifies:
      - root version.json exists and contains Worker v1.2.1 and source_revision
      - BuilderV2/app-version.json exists and contains Manager version 2.0.0
      - No cross-reference or conflicting fields.
    """
    worker_file = ROOT_DIR / "version.json"
    manager_file = ROOT_DIR / "BuilderV2" / "app-version.json"

    assert worker_file.exists(), "Root version.json must exist"
    assert manager_file.exists(), "BuilderV2/app-version.json must exist"

    w_data = json.loads(worker_file.read_text(encoding="utf-8"))
    m_data = json.loads(manager_file.read_text(encoding="utf-8"))

    # Worker manifest checks
    assert w_data.get("version") == "1.2.1"
    assert w_data.get("source_revision") == "3aafad12745c59a849610d603fc22b22f656ac36"
    assert "manager" not in w_data.get("version", "").lower()

    # Manager manifest checks
    assert m_data.get("version") == "2.0.0"
    assert m_data.get("release_tag") == "manager-v2.0.0"
    assert "worker" not in m_data.get("release_tag", "").lower()


def test_parse_worker_version_signal():
    """Verifies parsing and validation of canonical Worker version signal."""
    # 1. Valid synchronized signal
    payload = {
        "version": "1.2.1",
        "source_revision": "3aafad12745c59a849610d603fc22b22f656ac36",
        "repo_url": "https://github.com/LuciusDevLab/LuciProxy"
    }
    sig = parse_worker_version_signal(payload)
    assert sig.version == "1.2.1"
    assert sig.source_revision == "3aafad12745c59a849610d603fc22b22f656ac36"
    assert sig.repo_url == "https://github.com/LuciusDevLab/LuciProxy"

    # 2. Missing version raises ValueError
    with pytest.raises(ValueError, match="missing authoritative 'version' field"):
        parse_worker_version_signal({"source_revision": "abc1234"})

    # 3. Non-dict input raises ValueError
    with pytest.raises(ValueError, match="must be a JSON dictionary"):
        parse_worker_version_signal("invalid-json-string")

