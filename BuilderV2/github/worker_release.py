"""
LuciProxy Manager - Worker Release Service.
Discovers, filters, parses manifests, and verifies integrity for LuciProxy Worker releases.
Accepts modern 'worker-vX.Y.Z' and legacy 'vX.Y.Z' releases.
Strictly rejects all 'manager-vX.Y.Z' releases.
"""

import json
from typing import Any, Dict, List, Optional, Tuple

from BuilderV2.spec.versioning import is_newer_version
from .client import GitHubClient
from .exceptions import (
    AssetNotFoundError,
    IntegrityVerificationError,
    MalformedManifestError,
)
from .integrity import IntegrityVerifier
from .models import (
    GitHubAssetDto,
    GitHubReleaseDto,
    IntegrityResultDto,
    WorkerManifestDto,
)
from .release_service import ReleaseService


class WorkerReleaseService:
    """
    Service dedicated to discovering and downloading LuciProxy Worker releases.
    Integrates manifest parsing and cryptographic SHA-256 verification.
    """

    def __init__(self, client: GitHubClient, release_service: Optional[ReleaseService] = None):
        self.client = client
        self.release_service = release_service or ReleaseService(client)
        self.verifier = IntegrityVerifier()

    @staticmethod
    def is_worker_tag(tag: str) -> bool:
        """
        Determines if a git tag represents a LuciProxy Worker release.
        Accepts:
          - 'worker-vX.Y.Z' or 'worker-X.Y.Z'
          - 'vX.Y.Z' (Legacy Worker release baseline)
        Rejects:
          - 'manager-vX.Y.Z' (Application release)
        """
        t = str(tag or "").strip()
        if not t or t.startswith("manager-"):
            return False
        if t.startswith("worker-v") or t.startswith("worker-"):
            return True
        # Legacy releases: v1.2.0, v1.1.0, 1.2.0
        import re
        if re.match(r"^v?\d+\.\d+\.\d+", t):
            return True
        return False

    def filter_worker_releases(self, releases: List[GitHubReleaseDto]) -> List[GitHubReleaseDto]:
        """Filters a list of releases, retaining only valid Worker releases."""
        valid: List[GitHubReleaseDto] = []
        for r in releases:
            if not r.draft and self.is_worker_tag(r.tag_name):
                valid.append(r)
        return valid

    def get_published_worker_releases(self, force_refresh: bool = False) -> List[GitHubReleaseDto]:
        """Fetches all published Worker releases from the repository."""
        all_releases = self.release_service.get_all_published_releases(force_refresh=force_refresh)
        return self.filter_worker_releases(all_releases)

    def get_latest_worker_release(self, force_refresh: bool = False) -> Optional[GitHubReleaseDto]:
        """
        Finds the highest published Worker release according to semantic versioning.
        Supports numerical comparison (e.g. v1.10.0 > v1.9.0).
        """
        worker_releases = self.get_published_worker_releases(force_refresh=force_refresh)
        if not worker_releases:
            return None

        latest = worker_releases[0]
        latest_tag = latest.tag_name
        for r in worker_releases[1:]:
            curr_tag = r.tag_name
            if is_newer_version(curr_tag, latest_tag):
                latest = r
                latest_tag = curr_tag
        return latest

    def get_worker_manifest(self, release: GitHubReleaseDto) -> WorkerManifestDto:
        """
        Extracts and parses manifest.json from a Worker release.
        Raises AssetNotFoundError if manifest.json is missing.
        Raises MalformedManifestError if manifest is invalid JSON or missing required fields.
        """
        manifest_asset = self.release_service.find_release_asset(release, "manifest.json")
        if not manifest_asset:
            raise AssetNotFoundError(
                f"Release '{release.tag_name}' does not contain required asset 'manifest.json'",
                step="Discover Worker Manifest"
            )

        raw_bytes = self.release_service.download_asset_content(manifest_asset)
        try:
            data = json.loads(raw_bytes.decode("utf-8"))
        except Exception as e:
            raise MalformedManifestError(
                f"manifest.json in release '{release.tag_name}' is not valid JSON: {e}",
                step="Parse Worker Manifest"
            ) from e

        if not isinstance(data, dict):
            raise MalformedManifestError(
                f"manifest.json in release '{release.tag_name}' must be a JSON object",
                step="Parse Worker Manifest"
            )

        # Extract required version
        version = data.get("luciproxy_version") or data.get("version")
        if not version:
            raise MalformedManifestError(
                f"manifest.json in release '{release.tag_name}' is missing required field 'luciproxy_version'",
                step="Parse Worker Manifest"
            )

        # Extract required SHA-256
        artifact_sha256 = data.get("artifact_sha256") or data.get("sha256")
        if not artifact_sha256:
            raise MalformedManifestError(
                f"manifest.json in release '{release.tag_name}' is missing required field 'artifact_sha256'",
                step="Parse Worker Manifest"
            )

        return WorkerManifestDto(
            version=str(version).strip(),
            artifact_sha256=str(artifact_sha256).strip().lower(),
            main_module=str(data.get("main_module", "index.js")),
            d1_binding_name=str(data.get("d1_binding_name", "IOT_DB")),
            compatibility_date=str(data.get("compatibility_date", "2026-10-01")),
            compatibility_flags=list(data.get("compatibility_flags", ["nodejs_compat"])),
            git_commit=data.get("git_commit"),
            source_revision=data.get("source_revision"),
            build_timestamp=data.get("build_timestamp"),
            raw=data,
        )

    def download_and_verify_worker_bundle(
        self,
        release: GitHubReleaseDto,
        manifest: Optional[WorkerManifestDto] = None
    ) -> Tuple[bytes, IntegrityResultDto]:
        """
        CRITICAL SECURITY PIPELINE:
        1. Resolves manifest.json to get authoritative expected SHA-256.
        2. Locates worker_bundle.js in release assets.
        3. Downloads worker_bundle.js bytes.
        4. Computes actual SHA-256 and compares to manifest declaration.
        5. If mismatch: ABORTS immediately by raising IntegrityVerificationError.
        6. Returns (bundle_bytes, integrity_result).
        """
        if manifest is None:
            manifest = self.get_worker_manifest(release)

        bundle_asset = self.release_service.find_release_asset(release, "worker_bundle.js")
        if not bundle_asset:
            raise AssetNotFoundError(
                f"Release '{release.tag_name}' does not contain required asset 'worker_bundle.js'",
                step="Locate Worker Bundle Asset"
            )

        bundle_bytes = self.release_service.download_asset_content(bundle_asset)

        # Cryptographic verification against manifest and GitHub asset digest if present
        integrity = self.verifier.verify(
            content=bundle_bytes,
            expected_sha256=manifest.artifact_sha256,
            artifact_name="worker_bundle.js",
            github_digest=bundle_asset.digest,
            step=f"Verify Worker Bundle ({release.tag_name})"
        )

        return bundle_bytes, integrity
