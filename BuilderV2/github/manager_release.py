"""
LuciProxy Manager - Manager Application Release Service.
Discovers, filters, and inspects release assets for the LuciProxy Manager channel (manager-vX.Y.Z).
Strictly rejects Worker releases ('worker-vX.Y.Z') and legacy releases ('vX.Y.Z').
Gracefully handles repositories without published Manager releases yet.
"""

from typing import Any, Dict, List, Optional

from BuilderV2.spec.versioning import is_newer_version, parse_semver
from .client import GitHubClient
from .models import (
    GitHubAssetDto,
    GitHubReleaseDto,
    ManagerReleaseMetadataDto,
)
from .release_service import ReleaseService


class ManagerReleaseService:
    """
    Service dedicated to discovering and validating LuciProxy Manager application releases.
    Exposes desktop (Windows .exe) and mobile (Android .apk) binaries.
    """

    def __init__(self, client: GitHubClient, release_service: Optional[ReleaseService] = None):
        self.client = client
        self.release_service = release_service or ReleaseService(client)

    @staticmethod
    def is_manager_tag(tag: str) -> bool:
        """
        Determines if a git tag represents a LuciProxy Manager application release.
        Accepts:
          - 'manager-vX.Y.Z' or 'manager-X.Y.Z'
        Rejects:
          - 'worker-vX.Y.Z'
          - 'vX.Y.Z' (Legacy Worker releases)
        """
        t = str(tag or "").strip()
        return t.startswith("manager-v") or t.startswith("manager-")

    def filter_manager_releases(self, releases: List[GitHubReleaseDto]) -> List[GitHubReleaseDto]:
        """Filters a list of releases, retaining strictly valid Manager releases."""
        valid: List[GitHubReleaseDto] = []
        for r in releases:
            if not r.draft and self.is_manager_tag(r.tag_name):
                valid.append(r)
        return valid

    def get_published_manager_releases(self, force_refresh: bool = False) -> List[GitHubReleaseDto]:
        """Fetches all published Manager application releases from the repository."""
        all_releases = self.release_service.get_all_published_releases(force_refresh=force_refresh)
        return self.filter_manager_releases(all_releases)

    def parse_manager_metadata(self, release: GitHubReleaseDto) -> ManagerReleaseMetadataDto:
        """
        Parses release DTO into domain ManagerReleaseMetadataDto.
        Identifies Windows executable and Android APK assets.
        """
        # Determine normalized version
        parsed = parse_semver(release.tag_name)
        if parsed:
            maj, min_v, pat, pre = parsed
            ver_str = f"{maj}.{min_v}.{pat}"
            if pre:
                ver_str += f"-{pre}"
        else:
            ver_str = release.tag_name.replace("manager-v", "").replace("manager-", "")

        windows_asset: Optional[GitHubAssetDto] = None
        android_asset: Optional[GitHubAssetDto] = None

        for a in release.assets:
            name_lower = a.name.lower()
            if name_lower.endswith(".exe") and ("setup" in name_lower or "manager" in name_lower or "luciproxy" in name_lower):
                if not windows_asset or "setup" in name_lower:
                    windows_asset = a
            elif name_lower.endswith(".apk"):
                android_asset = a

        return ManagerReleaseMetadataDto(
            version=ver_str,
            tag_name=release.tag_name,
            changelog=release.body,
            published_at=release.published_at,
            windows_asset=windows_asset,
            android_asset=android_asset,
            assets=release.assets,
            html_url=release.html_url,
        )

    def get_latest_manager_release(self, force_refresh: bool = False) -> Optional[ManagerReleaseMetadataDto]:
        """
        Finds the highest published Manager release according to semantic versioning.
        Gracefully returns None if no Manager releases exist in the repository.
        """
        manager_releases = self.get_published_manager_releases(force_refresh=force_refresh)
        if not manager_releases:
            return None

        latest = manager_releases[0]
        latest_tag = latest.tag_name
        for r in manager_releases[1:]:
            curr_tag = r.tag_name
            if is_newer_version(curr_tag, latest_tag):
                latest = r
                latest_tag = curr_tag

        return self.parse_manager_metadata(latest)

    def get_manager_release_status(self, force_refresh: bool = False) -> Dict[str, Any]:
        """
        Returns structured status suitable for user reporting or UI state.
        Gracefully handles the initial unreleased state.
        """
        meta = self.get_latest_manager_release(force_refresh=force_refresh)
        if meta is None:
            return {
                "available": False,
                "message": "No published Manager release available",
                "release": None,
            }
        return {
            "available": True,
            "message": f"Latest Manager release is {meta.tag_name}",
            "release": meta,
        }
