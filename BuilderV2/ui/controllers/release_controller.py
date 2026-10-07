"""
LuciProxy Manager - Release & Version Controller.
Coordinates dual-channel release discovery for Worker releases and Manager application updates.
"""

from datetime import datetime
from typing import Any, Dict, Optional

from ...github import (
    GitHubClient,
    ReleaseService,
    WorkerReleaseService,
    ManagerReleaseService,
)
from ...storage.database import LocalDatabase


class ReleaseController:
    """Coordinates release checks for both Worker and Manager application channels."""

    def __init__(self, db: LocalDatabase, github_client: Optional[GitHubClient] = None):
        self.db = db
        self.gh_client = github_client or GitHubClient()
        self.release_svc = ReleaseService(self.gh_client)
        self.worker_svc = WorkerReleaseService(self.gh_client, release_service=self.release_svc)
        self.manager_svc = ManagerReleaseService(self.gh_client, release_service=self.release_svc)

    def get_version_status(self, force_refresh: bool = False) -> Dict[str, Any]:
        """
        Queries GitHub and local app state to evaluate both version channels.
        Guarantees that Worker updates and Manager updates are strictly decoupled.
        """
        app_state = self.db.get_app_state()
        current_manager = app_state.currentManagerVersion or "2.0.0"

        # 1. Check Worker channel (modern + legacy)
        latest_worker_dto = self.worker_svc.get_latest_worker_release(force_refresh=force_refresh)
        latest_worker_tag = latest_worker_dto.tag_name if latest_worker_dto else "None"
        is_legacy_worker = latest_worker_tag.startswith("v") and not latest_worker_tag.startswith("worker-")

        # 2. Check Manager channel (manager-vX.Y.Z only)
        mgr_status = self.manager_svc.get_manager_release_status(force_refresh=force_refresh)
        latest_mgr_tag = (
            mgr_status["release"].tag_name
            if (mgr_status["available"] and mgr_status["release"])
            else "No published Manager release available"
        )

        now_str = datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S UTC")
        self.db.update_app_state(
            last_check=now_str,
            latest_discovered=latest_mgr_tag if mgr_status["available"] else None
        )

        return {
            "current_manager_version": f"v{current_manager}" if not current_manager.startswith("v") else current_manager,
            "latest_manager_version": latest_mgr_tag,
            "manager_update_available": mgr_status["available"],
            "latest_worker_version": latest_worker_tag,
            "is_legacy_worker": is_legacy_worker,
            "last_check": now_str,
        }

    def get_worker_source_signal(self) -> Optional[Any]:
        """Fetches the authoritative Worker source version signal (version.json)."""
        try:
            from ...worker_source.source_service import WorkerSourceService
            source_svc = WorkerSourceService()
            return source_svc.fetch_version_signal()
        except Exception:
            return None

