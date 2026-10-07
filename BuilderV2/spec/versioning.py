"""
LuciProxy Manager / BuilderV2 - Dual Channel Versioning Specification Engine
Enforces strict separation between Worker releases (worker-vX.Y.Z, legacy vX.Y.Z)
and Manager application releases (manager-vX.Y.Z).
"""

from dataclasses import dataclass, field
import re
from typing import Any, Dict, List, Optional, Tuple


@dataclass
class WorkerVersionSignal:
    """
    Authoritative representation of the Worker version signal declared in version.json.
    - version: canonical Worker version (e.g. '1.2.1')
    - source_revision: exact immutable git commit SHA (e.g. '3aafad12745c59a849610d603fc22b22f656ac36')
    """
    version: str
    source_revision: Optional[str] = None
    repo_url: Optional[str] = None
    release_url: Optional[str] = None
    changelog: Optional[str] = None
    released_at: Optional[str] = None
    raw: Dict[str, Any] = field(default_factory=dict)


def parse_worker_version_signal(data: Dict[str, Any]) -> WorkerVersionSignal:
    """
    Parses and validates canonical Worker version signal from version.json dictionary.
    Canonical Worker version field is 'version'.
    Immutable commit pointer is 'source_revision'.
    """
    if not isinstance(data, dict):
        raise ValueError("version.json content must be a JSON dictionary")

    version = str(data.get("version") or data.get("luciproxy_version") or "").strip()
    if not version:
        raise ValueError("version.json is missing authoritative 'version' field")

    source_revision = data.get("source_revision")
    if source_revision is not None:
        source_revision = str(source_revision).strip()
        if not source_revision:
            source_revision = None

    return WorkerVersionSignal(
        version=version,
        source_revision=source_revision,
        repo_url=data.get("repo_url"),
        release_url=data.get("release_url"),
        changelog=data.get("changelog"),
        released_at=data.get("released_at"),
        raw=data,
    )


def parse_semver(version_str: str) -> Optional[Tuple[int, int, int, str]]:
    """
    Parses a semantic version string into (major, minor, patch, prerelease).
    Normalizes optional leading 'v', 'worker-v', or 'manager-v'.
    """
    cleaned = str(version_str or "").strip()
    # Strip common prefixes
    for prefix in ("worker-v", "worker-", "manager-v", "manager-", "v", "V"):
        if cleaned.startswith(prefix):
            cleaned = cleaned[len(prefix):]
            break

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


def is_newer_version(candidate: str, baseline: str) -> bool:
    """
    Returns True if candidate version is strictly newer than baseline version.
    Supports proper numeric triple comparison (e.g. 1.10.0 > 1.9.0).
    """
    c_parsed = parse_semver(candidate)
    b_parsed = parse_semver(baseline)
    if not c_parsed or not b_parsed:
        return False

    c_maj, c_min, c_pat, c_pre = c_parsed
    b_maj, b_min, b_pat, b_pre = b_parsed

    if (c_maj, c_min, c_pat) > (b_maj, b_min, b_pat):
        return True
    if (c_maj, c_min, c_pat) < (b_maj, b_min, b_pat):
        return False

    # Equal numeric triples: formal release is newer than prerelease
    if not c_pre and b_pre:
        return True
    if c_pre and not b_pre:
        return False
    if c_pre and b_pre:
        return c_pre > b_pre

    return False


class WorkerReleaseService:
    """
    Release service dedicated strictly to the LuciProxy Worker channel.
    Accepts:
      - 'worker-vX.Y.Z' (Modern Worker release)
      - 'vX.Y.Z' (Legacy Worker release, e.g. v1.2.0)
    Ignores:
      - 'manager-vX.Y.Z' (Manager application releases)
    """

    @staticmethod
    def is_worker_tag(tag: str) -> bool:
        t = str(tag or "").strip()
        if t.startswith("manager-"):
            return False
        if t.startswith("worker-v") or t.startswith("worker-"):
            return True
        # Legacy Worker releases pattern: vX.Y.Z
        if re.match(r"^v?\d+\.\d+\.\d+", t):
            return True
        return False

    @classmethod
    def filter_releases(cls, releases: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        valid = []
        for r in releases:
            tag = r.get("tag_name") or r.get("tag") or ""
            if cls.is_worker_tag(tag):
                valid.append(r)
        return valid

    @classmethod
    def get_latest_release(cls, releases: List[Dict[str, Any]]) -> Optional[Dict[str, Any]]:
        worker_releases = cls.filter_releases(releases)
        if not worker_releases:
            return None

        latest = worker_releases[0]
        latest_tag = latest.get("tag_name") or latest.get("tag") or ""
        for r in worker_releases[1:]:
            curr_tag = r.get("tag_name") or r.get("tag") or ""
            if is_newer_version(curr_tag, latest_tag):
                latest = r
                latest_tag = curr_tag
        return latest


class ManagerReleaseService:
    """
    Release service dedicated strictly to the LuciProxy Manager application channel.
    Accepts:
      - 'manager-vX.Y.Z'
    Ignores:
      - 'worker-vX.Y.Z'
      - 'vX.Y.Z' (Legacy Worker releases)
    """

    @staticmethod
    def is_manager_tag(tag: str) -> bool:
        t = str(tag or "").strip()
        return t.startswith("manager-v") or t.startswith("manager-")

    @classmethod
    def filter_releases(cls, releases: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        valid = []
        for r in releases:
            tag = r.get("tag_name") or r.get("tag") or ""
            if cls.is_manager_tag(tag):
                valid.append(r)
        return valid

    @classmethod
    def get_latest_release(cls, releases: List[Dict[str, Any]]) -> Optional[Dict[str, Any]]:
        manager_releases = cls.filter_releases(releases)
        if not manager_releases:
            return None

        latest = manager_releases[0]
        latest_tag = latest.get("tag_name") or latest.get("tag") or ""
        for r in manager_releases[1:]:
            curr_tag = r.get("tag_name") or r.get("tag") or ""
            if is_newer_version(curr_tag, latest_tag):
                latest = r
                latest_tag = curr_tag
        return latest


def calculate_notifications(
    installed_workers: List[Dict[str, Any]],
    current_manager_version: str,
    latest_worker_release: Optional[Dict[str, Any]],
    latest_manager_release: Optional[Dict[str, Any]]
) -> Dict[str, Any]:
    """
    Calculates notifications independently for Worker updates and Manager updates.
    Guarantees no channel cross-contamination.
    """
    notifications = {
        "worker_notification": None,
        "manager_notification": None
    }

    # 1. Manager update check
    if latest_manager_release:
        latest_mgr_tag = latest_manager_release.get("tag_name") or ""
        if is_newer_version(latest_mgr_tag, current_manager_version):
            notifications["manager_notification"] = {
                "channel": "luciproxy_manager_updates",
                "title": "LuciProxy Manager Update Available",
                "body": f"Manager {latest_mgr_tag} is available.",
                "target_version": latest_mgr_tag
            }

    # 2. Worker updates check
    if latest_worker_release and installed_workers:
        latest_wrk_tag = latest_worker_release.get("tag_name") or ""
        workers_needing_update = []
        for w in installed_workers:
            installed = w.get("installedWorkerVersion", "")
            if is_newer_version(latest_wrk_tag, installed):
                workers_needing_update.append(w.get("workerName", "Worker"))

        if workers_needing_update:
            count = len(workers_needing_update)
            body = (
                f"{latest_wrk_tag} is available for {workers_needing_update[0]}."
                if count == 1
                else f"{latest_wrk_tag} is available for {count} Workers."
            )
            notifications["worker_notification"] = {
                "channel": "luciproxy_worker_updates",
                "title": "LuciProxy Worker Update Available",
                "body": body,
                "target_version": latest_wrk_tag,
                "affected_workers": workers_needing_update
            }

    return notifications
