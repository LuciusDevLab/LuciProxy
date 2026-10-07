"""
LuciProxy Manager - GitHub Domain Models & DTOs.
Clean data transfer objects separating GitHub REST API serialization
from domain release discovery and cryptographic integrity logic.
"""

from dataclasses import dataclass, field
from typing import Any, Dict, List, Optional


@dataclass
class GitHubAssetDto:
    """Represents a file asset attached to a GitHub release."""
    id: int
    name: str
    size: int
    browser_download_url: str
    content_type: Optional[str] = None
    digest: Optional[str] = None
    raw: Dict[str, Any] = field(default_factory=dict)


@dataclass
class GitHubReleaseDto:
    """Represents a GitHub release object."""
    id: int
    tag_name: str
    name: Optional[str] = None
    body: Optional[str] = None
    draft: bool = False
    prerelease: bool = False
    published_at: Optional[str] = None
    assets: List[GitHubAssetDto] = field(default_factory=list)
    html_url: Optional[str] = None
    raw: Dict[str, Any] = field(default_factory=dict)


@dataclass
class WorkerManifestDto:
    """
    Parsed representation of worker manifest.json.
    Specifies deployment dependencies, expected artifact hash, and worker runtime settings.
    """
    version: str
    artifact_sha256: str
    main_module: str = "index.js"
    d1_binding_name: str = "IOT_DB"
    compatibility_date: str = "2026-10-01"
    compatibility_flags: List[str] = field(default_factory=lambda: ["nodejs_compat"])
    git_commit: Optional[str] = None
    source_revision: Optional[str] = None
    build_timestamp: Optional[str] = None
    raw: Dict[str, Any] = field(default_factory=dict)


@dataclass
class ManagerReleaseMetadataDto:
    """
    Parsed representation of Manager application release.
    Contains desktop/mobile installers and release changelog.
    """
    version: str
    tag_name: str
    changelog: Optional[str] = None
    published_at: Optional[str] = None
    windows_asset: Optional[GitHubAssetDto] = None
    android_asset: Optional[GitHubAssetDto] = None
    assets: List[GitHubAssetDto] = field(default_factory=list)
    html_url: Optional[str] = None


@dataclass
class IntegrityResultDto:
    """Cryptographic verification result."""
    is_valid: bool
    expected_sha256: str
    actual_sha256: str
    artifact_name: str
    error_message: Optional[str] = None


@dataclass
class CacheInfo:
    """Status metadata for cached GitHub endpoints."""
    etag: Optional[str]
    cached_at: float
    last_refresh: float
    age_seconds: float
