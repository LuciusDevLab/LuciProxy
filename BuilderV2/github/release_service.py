"""
LuciProxy Manager - GitHub Release Discovery Service.
Discovers published releases, queries tags, and extracts asset metadata.
"""

from typing import Any, Dict, List, Optional

from .client import GitHubClient
from .exceptions import ResourceNotFoundError
from .models import GitHubAssetDto, GitHubReleaseDto


class ReleaseService:
    """Base service for discovering releases and assets from GitHub repository."""

    def __init__(self, client: GitHubClient):
        self.client = client

    @property
    def owner(self) -> str:
        return self.client.owner

    @property
    def repo(self) -> str:
        return self.client.repo

    def _parse_asset(self, raw_asset: Dict[str, Any]) -> GitHubAssetDto:
        return GitHubAssetDto(
            id=int(raw_asset.get("id", 0)),
            name=str(raw_asset.get("name", "")).strip(),
            size=int(raw_asset.get("size", 0)),
            browser_download_url=str(raw_asset.get("browser_download_url", "")),
            content_type=raw_asset.get("content_type"),
            digest=raw_asset.get("digest"),
            raw=raw_asset,
        )

    def _parse_release(self, raw_release: Dict[str, Any]) -> GitHubReleaseDto:
        raw_assets = raw_release.get("assets", []) or []
        assets = [self._parse_asset(a) for a in raw_assets if isinstance(a, dict)]
        return GitHubReleaseDto(
            id=int(raw_release.get("id", 0)),
            tag_name=str(raw_release.get("tag_name", "")).strip(),
            name=raw_release.get("name"),
            body=raw_release.get("body"),
            draft=bool(raw_release.get("draft", False)),
            prerelease=bool(raw_release.get("prerelease", False)),
            published_at=raw_release.get("published_at"),
            assets=assets,
            html_url=raw_release.get("html_url"),
            raw=raw_release,
        )

    def get_all_published_releases(self, force_refresh: bool = False) -> List[GitHubReleaseDto]:
        """
        Retrieves all published releases for the repository.
        Excludes draft releases and invalid payloads.
        """
        endpoint = f"/repos/{self.owner}/{self.repo}/releases"
        raw_list = self.client.request(
            method="GET",
            endpoint=endpoint,
            force_refresh=force_refresh,
            step="List Published Releases"
        )
        if not isinstance(raw_list, list):
            return []

        published: List[GitHubReleaseDto] = []
        for r in raw_list:
            if not isinstance(r, dict):
                continue
            dto = self._parse_release(r)
            if not dto.draft and dto.tag_name:
                published.append(dto)
        return published

    def get_release_by_tag(self, tag: str, force_refresh: bool = False) -> Optional[GitHubReleaseDto]:
        """
        Retrieves release details for a specific git tag.
        Returns None if release or tag does not exist.
        """
        clean_tag = str(tag or "").strip()
        if not clean_tag:
            return None
        endpoint = f"/repos/{self.owner}/{self.repo}/releases/tags/{clean_tag}"
        try:
            raw = self.client.request(
                method="GET",
                endpoint=endpoint,
                force_refresh=force_refresh,
                step=f"Get Release By Tag '{clean_tag}'"
            )
            if isinstance(raw, dict):
                return self._parse_release(raw)
        except ResourceNotFoundError:
            return None
        return None

    def find_release_asset(self, release: GitHubReleaseDto, asset_name: str) -> Optional[GitHubAssetDto]:
        """Finds an asset by name (case-insensitive) on a release."""
        target = asset_name.strip().lower()
        for a in release.assets:
            if a.name.strip().lower() == target:
                return a
        return None

    def download_asset_content(self, asset: GitHubAssetDto) -> bytes:
        """Downloads binary content of a release asset."""
        return self.client.download_asset(asset.browser_download_url, step=f"Download {asset.name}")
