"""
Unit test suite for Phase 4: GitHub Releases, Discovery & Cryptographic Integrity Verification.
Covers release filtering, dual-channel isolation, legacy tags, asset discovery,
manifest parsing, SHA-256 integrity verification, ETag caching, rate-limit backoff, and errors.
"""

import json
from pathlib import Path
import pytest
from unittest.mock import MagicMock, patch

from BuilderV2.github import (
    AssetNotFoundError,
    CacheInfo,
    GitHubApiError,
    GitHubAssetDto,
    GitHubClient,
    GitHubRateLimitError,
    GitHubReleaseDto,
    IntegrityResultDto,
    IntegrityVerificationError,
    MalformedManifestError,
    MalformedResponseError,
    ManagerReleaseMetadataDto,
    ManagerReleaseService,
    NetworkTimeoutError,
    ReleaseService,
    ResourceNotFoundError,
    WorkerManifestDto,
    WorkerReleaseService,
    IntegrityVerifier,
)
from BuilderV2.spec.versioning import is_newer_version


# =============================================================================
# FIXTURES & SAMPLE DATA
# =============================================================================

@pytest.fixture
def mock_session():
    return MagicMock()


@pytest.fixture
def gh_client(mock_session):
    return GitHubClient(
        owner="LuciusDevLab",
        repo="LuciProxy",
        session=mock_session,
        min_check_interval=3600
    )


SAMPLE_RAW_RELEASES = [
    {
        "id": 101,
        "tag_name": "v1.2.0",
        "name": "LuciProxy v1.2.0 Legacy",
        "body": "Legacy frozen release",
        "draft": False,
        "prerelease": False,
        "published_at": "2026-10-03T19:00:00Z",
        "assets": [
            {
                "id": 501,
                "name": "LuciProxy-Builder.exe",
                "size": 25000000,
                "browser_download_url": "https://github.com/LuciusDevLab/LuciProxy/releases/download/v1.2.0/LuciProxy-Builder.exe"
            }
        ]
    },
    {
        "id": 102,
        "tag_name": "worker-v1.2.1",
        "name": "Worker Patch 1.2.1",
        "body": "Worker minor patch",
        "draft": False,
        "prerelease": False,
        "published_at": "2026-10-04T10:00:00Z",
        "assets": [
            {
                "id": 502,
                "name": "worker_bundle.js",
                "size": 150000,
                "browser_download_url": "https://github.com/LuciusDevLab/LuciProxy/releases/download/worker-v1.2.1/worker_bundle.js"
            },
            {
                "id": 503,
                "name": "manifest.json",
                "size": 500,
                "browser_download_url": "https://github.com/LuciusDevLab/LuciProxy/releases/download/worker-v1.2.1/manifest.json"
            }
        ]
    },
    {
        "id": 103,
        "tag_name": "worker-v1.3.0",
        "name": "Worker 1.3.0 Feature Release",
        "body": "Worker feature release",
        "draft": False,
        "prerelease": False,
        "published_at": "2026-10-05T12:00:00Z",
        "assets": [
            {
                "id": 504,
                "name": "worker_bundle.js",
                "size": 160000,
                "browser_download_url": "https://github.com/LuciusDevLab/LuciProxy/releases/download/worker-v1.3.0/worker_bundle.js"
            },
            {
                "id": 505,
                "name": "manifest.json",
                "size": 520,
                "browser_download_url": "https://github.com/LuciusDevLab/LuciProxy/releases/download/worker-v1.3.0/manifest.json"
            }
        ]
    },
    {
        "id": 104,
        "tag_name": "manager-v2.0.0",
        "name": "Manager 2.0.0 Initial Release",
        "body": "LuciProxy Manager v2 release",
        "draft": False,
        "prerelease": False,
        "published_at": "2026-10-06T08:00:00Z",
        "assets": [
            {
                "id": 506,
                "name": "LuciProxy-Manager-Setup.exe",
                "size": 45000000,
                "browser_download_url": "https://github.com/LuciusDevLab/LuciProxy/releases/download/manager-v2.0.0/LuciProxy-Manager-Setup.exe"
            },
            {
                "id": 507,
                "name": "LuciProxy-Manager.apk",
                "size": 18000000,
                "browser_download_url": "https://github.com/LuciusDevLab/LuciProxy/releases/download/manager-v2.0.0/LuciProxy-Manager.apk"
            }
        ]
    },
    {
        "id": 105,
        "tag_name": "manager-v2.1.0",
        "name": "Manager 2.1.0 Update",
        "body": "Manager 2.1.0 changelog with improvements",
        "draft": False,
        "prerelease": False,
        "published_at": "2026-10-07T05:00:00Z",
        "assets": [
            {
                "id": 508,
                "name": "LuciProxy-Manager-Setup.exe",
                "size": 46000000,
                "browser_download_url": "https://github.com/LuciusDevLab/LuciProxy/releases/download/manager-v2.1.0/LuciProxy-Manager-Setup.exe"
            },
            {
                "id": 509,
                "name": "LuciProxy-Manager.apk",
                "size": 19000000,
                "browser_download_url": "https://github.com/LuciusDevLab/LuciProxy/releases/download/manager-v2.1.0/LuciProxy-Manager.apk"
            }
        ]
    },
    {
        "id": 106,
        "tag_name": "worker-v2.0.0-draft",
        "name": "Draft release",
        "body": "Should be ignored",
        "draft": True,
        "prerelease": False,
        "assets": []
    },
    {
        "id": 107,
        "tag_name": "unsupported-release-tag",
        "name": "Random Tag",
        "body": "Should be ignored",
        "draft": False,
        "prerelease": False,
        "assets": []
    }
]


# =============================================================================
# 1. RELEASE PARSING & DTO MAPPING
# =============================================================================

def test_release_parsing_and_dto_mapping(gh_client, mock_session):
    mock_resp = MagicMock()
    mock_resp.status_code = 200
    mock_resp.headers = {"ETag": 'W/"test-etag-1"'}
    mock_resp.json.return_value = SAMPLE_RAW_RELEASES
    mock_session.request.return_value = mock_resp

    rel_svc = ReleaseService(gh_client)
    releases = rel_svc.get_all_published_releases()

    # Draft releases (id 106) must be excluded
    assert len(releases) == 6
    tags = [r.tag_name for r in releases]
    assert "v1.2.0" in tags
    assert "worker-v1.3.0" in tags
    assert "manager-v2.1.0" in tags
    assert "worker-v2.0.0-draft" not in tags

    # Verify asset structure
    mgr_rel = next(r for r in releases if r.tag_name == "manager-v2.1.0")
    assert len(mgr_rel.assets) == 2
    assert mgr_rel.assets[0].name == "LuciProxy-Manager-Setup.exe"
    assert mgr_rel.assets[1].name == "LuciProxy-Manager.apk"


# =============================================================================
# 2. WORKER RELEASE FILTERING & LATEST SELECTION
# =============================================================================

def test_worker_release_filtering_and_latest(gh_client, mock_session):
    """
    Validates Section 5 specification:
    Input: v1.2.0, worker-v1.2.1, worker-v1.3.0, manager-v2.0.0, manager-v2.1.0
    Worker latest must be: worker-v1.3.0
    Manager releases must be strictly rejected.
    """
    mock_resp = MagicMock()
    mock_resp.status_code = 200
    mock_resp.json.return_value = SAMPLE_RAW_RELEASES
    mock_session.request.return_value = mock_resp

    worker_svc = WorkerReleaseService(gh_client)
    worker_releases = worker_svc.get_published_worker_releases()

    worker_tags = [r.tag_name for r in worker_releases]
    assert worker_tags == ["v1.2.0", "worker-v1.2.1", "worker-v1.3.0"]
    assert "manager-v2.0.0" not in worker_tags
    assert "manager-v2.1.0" not in worker_tags

    latest = worker_svc.get_latest_worker_release()
    assert latest is not None
    assert latest.tag_name == "worker-v1.3.0"


# =============================================================================
# 3. MANAGER RELEASE FILTERING & LATEST SELECTION
# =============================================================================

def test_manager_release_filtering_and_latest(gh_client, mock_session):
    """
    Validates Section 6 specification:
    Input: v1.2.0, worker-v1.2.1, worker-v1.3.0, manager-v2.0.0, manager-v2.1.0
    Manager latest must be: manager-v2.1.0
    Worker releases and legacy v1.2.0 must be rejected.
    """
    mock_resp = MagicMock()
    mock_resp.status_code = 200
    mock_resp.json.return_value = SAMPLE_RAW_RELEASES
    mock_session.request.return_value = mock_resp

    mgr_svc = ManagerReleaseService(gh_client)
    mgr_releases = mgr_svc.get_published_manager_releases()

    mgr_tags = [r.tag_name for r in mgr_releases]
    assert mgr_tags == ["manager-v2.0.0", "manager-v2.1.0"]
    assert "v1.2.0" not in mgr_tags
    assert "worker-v1.3.0" not in mgr_tags

    latest_meta = mgr_svc.get_latest_manager_release()
    assert latest_meta is not None
    assert latest_meta.tag_name == "manager-v2.1.0"
    assert latest_meta.version == "2.1.0"
    assert latest_meta.windows_asset is not None
    assert latest_meta.windows_asset.name == "LuciProxy-Manager-Setup.exe"
    assert latest_meta.android_asset is not None
    assert latest_meta.android_asset.name == "LuciProxy-Manager.apk"


# =============================================================================
# 4. LEGACY v1.2.0 WORKER CHANNEL COMPATIBILITY
# =============================================================================

def test_legacy_v1_2_0_worker_compatibility(gh_client, mock_session):
    """
    Validates Section 7 & 20:
    v1.2.0 is accepted as Worker release, and rejected by ManagerReleaseService.
    """
    worker_svc = WorkerReleaseService(gh_client)
    mgr_svc = ManagerReleaseService(gh_client)

    assert worker_svc.is_worker_tag("v1.2.0") is True
    assert mgr_svc.is_manager_tag("v1.2.0") is False

    assert worker_svc.is_worker_tag("v1.1.0") is True
    assert mgr_svc.is_manager_tag("v1.1.0") is False


# =============================================================================
# 5. SEMANTIC VERSION COMPARISON ACCURACY
# =============================================================================

def test_semantic_version_comparison_numeric():
    # Numeric triples: 1.10.0 > 1.9.0
    assert is_newer_version("v1.10.0", "v1.9.0") is True
    assert is_newer_version("worker-v1.10.0", "worker-v1.9.0") is True
    assert is_newer_version("worker-v1.9.0", "worker-v1.10.0") is False

    # Manager versions
    assert is_newer_version("manager-v2.1.0", "manager-v2.0.9") is True
    assert is_newer_version("manager-v2.0.0", "manager-v2.1.0") is False

    # Prereleases: formal release is newer than release candidate
    assert is_newer_version("v1.2.0", "v1.2.0-rc.1") is True
    assert is_newer_version("v1.2.0-rc.1", "v1.2.0") is False


# =============================================================================
# 6. GRACEFUL HANDLING OF EMPTY MANAGER RELEASES
# =============================================================================

def test_graceful_empty_manager_releases(gh_client, mock_session):
    """
    Validates Section 20:
    When repository only has Worker releases (as is currently the case with v1.2.0),
    ManagerReleaseService returns None / graceful message without crashing.
    """
    only_worker_releases = [
        {"id": 1, "tag_name": "v1.2.0", "draft": False, "assets": []},
        {"id": 2, "tag_name": "v1.1.0", "draft": False, "assets": []},
    ]
    mock_resp = MagicMock()
    mock_resp.status_code = 200
    mock_resp.json.return_value = only_worker_releases
    mock_session.request.return_value = mock_resp

    mgr_svc = ManagerReleaseService(gh_client)
    latest = mgr_svc.get_latest_manager_release()
    assert latest is None

    status = mgr_svc.get_manager_release_status()
    assert status["available"] is False
    assert status["message"] == "No published Manager release available"
    assert status["release"] is None


# =============================================================================
# 7. ASSET DISCOVERY & MANIFEST PARSING
# =============================================================================

def test_worker_manifest_parsing_success(gh_client, mock_session):
    rel_svc = ReleaseService(gh_client)
    worker_svc = WorkerReleaseService(gh_client, release_service=rel_svc)

    valid_manifest_payload = {
        "luciproxy_version": "1.3.0",
        "artifact_sha256": "abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890",
        "main_module": "index.js",
        "d1_binding_name": "IOT_DB",
        "compatibility_date": "2026-10-01",
        "compatibility_flags": ["nodejs_compat"]
    }
    manifest_bytes = json.dumps(valid_manifest_payload).encode("utf-8")

    release = GitHubReleaseDto(
        id=103,
        tag_name="worker-v1.3.0",
        assets=[
            GitHubAssetDto(
                id=505,
                name="manifest.json",
                size=len(manifest_bytes),
                browser_download_url="https://github.com/download/manifest.json"
            )
        ]
    )

    mock_resp = MagicMock()
    mock_resp.status_code = 200
    mock_resp.content = manifest_bytes
    mock_session.get.return_value = mock_resp

    manifest = worker_svc.get_worker_manifest(release)
    assert manifest.version == "1.3.0"
    assert manifest.artifact_sha256 == "abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890"
    assert manifest.d1_binding_name == "IOT_DB"
    assert "nodejs_compat" in manifest.compatibility_flags


def test_worker_manifest_missing_asset_error(gh_client):
    worker_svc = WorkerReleaseService(gh_client)
    release_without_manifest = GitHubReleaseDto(
        id=101,
        tag_name="v1.2.0",
        assets=[]
    )
    with pytest.raises(AssetNotFoundError) as exc_info:
        worker_svc.get_worker_manifest(release_without_manifest)
    assert "manifest.json" in str(exc_info.value)


def test_worker_manifest_malformed_json_error(gh_client, mock_session):
    worker_svc = WorkerReleaseService(gh_client)
    release = GitHubReleaseDto(
        id=103,
        tag_name="worker-v1.3.0",
        assets=[
            GitHubAssetDto(
                id=505,
                name="manifest.json",
                size=15,
                browser_download_url="https://github.com/download/manifest.json"
            )
        ]
    )
    mock_resp = MagicMock()
    mock_resp.status_code = 200
    mock_resp.content = b"INVALID JSON CONTENT {{"
    mock_session.get.return_value = mock_resp

    with pytest.raises(MalformedManifestError) as exc_info:
        worker_svc.get_worker_manifest(release)
    assert "not valid JSON" in str(exc_info.value)


def test_worker_manifest_missing_fields_error(gh_client, mock_session):
    worker_svc = WorkerReleaseService(gh_client)
    release = GitHubReleaseDto(
        id=103,
        tag_name="worker-v1.3.0",
        assets=[
            GitHubAssetDto(
                id=505,
                name="manifest.json",
                size=30,
                browser_download_url="https://github.com/download/manifest.json"
            )
        ]
    )
    # Missing artifact_sha256
    invalid_manifest = {"luciproxy_version": "1.3.0"}
    mock_resp = MagicMock()
    mock_resp.status_code = 200
    mock_resp.content = json.dumps(invalid_manifest).encode("utf-8")
    mock_session.get.return_value = mock_resp

    with pytest.raises(MalformedManifestError) as exc_info:
        worker_svc.get_worker_manifest(release)
    assert "missing required field 'artifact_sha256'" in str(exc_info.value)


# =============================================================================
# 8. CRYPTOGRAPHIC INTEGRITY VERIFICATION (SHA-256)
# =============================================================================

def test_sha256_match_verification_success(gh_client, mock_session):
    bundle_content = b"console.log('LuciProxy Worker 1.3.0 Bundle');"
    computed_hash = IntegrityVerifier.compute_sha256(bundle_content)

    manifest = WorkerManifestDto(
        version="1.3.0",
        artifact_sha256=computed_hash
    )

    release = GitHubReleaseDto(
        id=103,
        tag_name="worker-v1.3.0",
        assets=[
            GitHubAssetDto(
                id=504,
                name="worker_bundle.js",
                size=len(bundle_content),
                browser_download_url="https://github.com/download/worker_bundle.js",
                digest=f"sha256:{computed_hash}"
            )
        ]
    )

    mock_resp = MagicMock()
    mock_resp.status_code = 200
    mock_resp.content = bundle_content
    mock_session.get.return_value = mock_resp

    worker_svc = WorkerReleaseService(gh_client)
    downloaded_bytes, integrity = worker_svc.download_and_verify_worker_bundle(release, manifest=manifest)

    assert downloaded_bytes == bundle_content
    assert integrity.is_valid is True
    assert integrity.actual_sha256 == computed_hash
    assert integrity.expected_sha256 == computed_hash


def test_sha256_mismatch_verification_abort(gh_client, mock_session):
    """
    CRITICAL: Validates that tampered content triggers IntegrityVerificationError
    and immediately aborts deployment.
    """
    legit_content = b"console.log('Valid bundle');"
    tampered_content = b"console.log('Tampered bundle with backdoor');"
    expected_hash = IntegrityVerifier.compute_sha256(legit_content)

    manifest = WorkerManifestDto(
        version="1.3.0",
        artifact_sha256=expected_hash
    )

    release = GitHubReleaseDto(
        id=103,
        tag_name="worker-v1.3.0",
        assets=[
            GitHubAssetDto(
                id=504,
                name="worker_bundle.js",
                size=len(tampered_content),
                browser_download_url="https://github.com/download/worker_bundle.js"
            )
        ]
    )

    mock_resp = MagicMock()
    mock_resp.status_code = 200
    mock_resp.content = tampered_content
    mock_session.get.return_value = mock_resp

    worker_svc = WorkerReleaseService(gh_client)
    with pytest.raises(IntegrityVerificationError) as exc_info:
        worker_svc.download_and_verify_worker_bundle(release, manifest=manifest)

    assert "Security Abort" in str(exc_info.value)
    assert exc_info.value.expected_sha256 == expected_hash
    assert exc_info.value.actual_sha256 == IntegrityVerifier.compute_sha256(tampered_content)


def test_missing_worker_bundle_asset(gh_client):
    manifest = WorkerManifestDto(version="1.3.0", artifact_sha256="abc")
    release_without_bundle = GitHubReleaseDto(id=103, tag_name="worker-v1.3.0", assets=[])

    worker_svc = WorkerReleaseService(gh_client)
    with pytest.raises(AssetNotFoundError) as exc_info:
        worker_svc.download_and_verify_worker_bundle(release_without_bundle, manifest=manifest)
    assert "worker_bundle.js" in str(exc_info.value)


# =============================================================================
# 9. ETAG CACHING & RATE LIMIT / ERROR HANDLING
# =============================================================================

def test_etag_caching_and_304_not_modified(gh_client, mock_session):
    endpoint = "/repos/LuciusDevLab/LuciProxy/releases"

    # 1. Initial request -> 200 OK with ETag
    resp1 = MagicMock()
    resp1.status_code = 200
    resp1.headers = {"ETag": '"etag-val-123"'}
    resp1.json.return_value = [{"id": 1, "tag_name": "v1.2.0"}]
    mock_session.request.return_value = resp1

    data1 = gh_client.request("GET", endpoint, force_refresh=True)
    assert len(data1) == 1
    cache_info = gh_client.get_cache_info(endpoint)
    assert cache_info is not None
    assert cache_info.etag == '"etag-val-123"'

    # 2. Second request with force_refresh -> sends If-None-Match, gets 304 Not Modified
    resp2 = MagicMock()
    resp2.status_code = 304
    resp2.headers = {}
    mock_session.request.return_value = resp2

    data2 = gh_client.request("GET", endpoint, force_refresh=True)
    assert data2 == data1  # Cached data preserved
    # Check that header was sent
    sent_headers = mock_session.request.call_args[1]["headers"]
    assert sent_headers["If-None-Match"] == '"etag-val-123"'


def test_cache_ttl_serves_without_network(gh_client, mock_session):
    endpoint = "/repos/LuciusDevLab/LuciProxy/releases"

    # Populate cache
    resp1 = MagicMock()
    resp1.status_code = 200
    resp1.headers = {"ETag": '"etag-val-123"'}
    resp1.json.return_value = [{"id": 1, "tag_name": "v1.2.0"}]
    mock_session.request.return_value = resp1

    gh_client.request("GET", endpoint, force_refresh=True)
    assert mock_session.request.call_count == 1

    # Second call with use_cache=True and within TTL -> no HTTP request made!
    cached_data = gh_client.request("GET", endpoint, use_cache=True, force_refresh=False)
    assert len(cached_data) == 1
    assert mock_session.request.call_count == 1  # No additional network hit!


def test_github_rate_limit_403_raises_typed_error(gh_client, mock_session):
    resp = MagicMock()
    resp.status_code = 403
    resp.headers = {
        "x-ratelimit-remaining": "0",
        "x-ratelimit-reset": "1760000000",
        "retry-after": "60"
    }
    resp.text = "API rate limit exceeded for IP"
    mock_session.request.return_value = resp

    with pytest.raises(GitHubRateLimitError) as exc_info:
        gh_client.request("GET", "/test", force_refresh=True)
    assert "rate limit exceeded" in str(exc_info.value).lower()
    assert exc_info.value.reset_time == 1760000000
    assert exc_info.value.retry_after == 60


def test_resource_not_found_404(gh_client, mock_session):
    resp = MagicMock()
    resp.status_code = 404
    resp.text = "Not Found"
    mock_session.request.return_value = resp

    with pytest.raises(ResourceNotFoundError):
        gh_client.request("GET", "/repos/LuciusDevLab/LuciProxy/releases/tags/nonexistent")


def test_network_timeout_handling(gh_client, mock_session):
    import requests
    mock_session.request.side_effect = requests.exceptions.Timeout("Connection timed out")

    with pytest.raises(NetworkTimeoutError):
        gh_client.request("GET", "/repos/LuciusDevLab/LuciProxy/releases")


# =============================================================================
# 11. PHASE 6 CANONICAL WORKER RELEASE ARTIFACT VERIFICATION
# =============================================================================

def test_phase6_canonical_worker_artifact_verification(gh_client):
    """
    Validates Phase 6 canonical Worker release artifact integration:
    - Verifies 'worker-v1.2.1' tag acceptance by WorkerReleaseService
    - Verifies 'worker-v1.2.1' rejection by ManagerReleaseService
    - Verifies manifest.json parsing from releases/worker-v1.2.1/
    - Verifies cryptographic SHA-256 verification of worker_bundle.js
    - Verifies legacy 'v1.2.0' continues to be recognized as Worker release
    """
    bundle_path = Path("releases/worker-v1.2.1/worker_bundle.js")
    manifest_path = Path("releases/worker-v1.2.1/manifest.json")

    assert bundle_path.exists(), "releases/worker-v1.2.1/worker_bundle.js must exist"
    assert manifest_path.exists(), "releases/worker-v1.2.1/manifest.json must exist"

    bundle_bytes = bundle_path.read_bytes()
    manifest_bytes = manifest_path.read_bytes()

    # 1. Dual-channel tag segregation
    assert WorkerReleaseService.is_worker_tag("worker-v1.2.1") is True
    assert ManagerReleaseService.is_manager_tag("worker-v1.2.1") is False
    assert WorkerReleaseService.is_worker_tag("v1.2.0") is True  # Legacy baseline

    # 2. Release DTO simulation
    mock_manifest_asset = GitHubAssetDto(
        id=601,
        name="manifest.json",
        size=len(manifest_bytes),
        browser_download_url="https://github.com/LuciusDevLab/LuciProxy/releases/download/worker-v1.2.1/manifest.json"
    )
    mock_bundle_asset = GitHubAssetDto(
        id=602,
        name="worker_bundle.js",
        size=len(bundle_bytes),
        browser_download_url="https://github.com/LuciusDevLab/LuciProxy/releases/download/worker-v1.2.1/worker_bundle.js"
    )
    mock_release = GitHubReleaseDto(
        id=6001,
        tag_name="worker-v1.2.1",
        name="LuciProxy Worker v1.2.1",
        draft=False,
        prerelease=False,
        assets=[mock_manifest_asset, mock_bundle_asset]
    )

    # 3. Release Service filtering
    rel_svc = ReleaseService(gh_client)
    worker_svc = WorkerReleaseService(client=gh_client, release_service=rel_svc)
    manager_svc = ManagerReleaseService(client=gh_client, release_service=rel_svc)

    assert len(worker_svc.filter_worker_releases([mock_release])) == 1
    assert len(manager_svc.filter_manager_releases([mock_release])) == 0

    # 4. Mock asset downloading
    def mock_download(asset):
        if asset.name == "manifest.json":
            return manifest_bytes
        elif asset.name == "worker_bundle.js":
            return bundle_bytes
        raise ValueError(f"Unknown asset {asset.name}")

    rel_svc.download_asset_content = MagicMock(side_effect=mock_download)

    # 5. Manifest parsing
    manifest_dto = worker_svc.get_worker_manifest(mock_release)
    assert manifest_dto.version == "1.2.1"
    assert manifest_dto.artifact_sha256 == "06fefda1c8ccac907f690bf549fcfcf1138b827b4ae0abed6e31496a07026cef"
    assert manifest_dto.d1_binding_name == "IOT_DB"
    assert manifest_dto.main_module == "index.js"
    assert "nodejs_compat" in manifest_dto.compatibility_flags
    assert manifest_dto.source_revision == "3aafad12745c59a849610d603fc22b22f656ac36"
    assert manifest_dto.git_commit == "3aafad12745c59a849610d603fc22b22f656ac36"

    # 6. Cryptographic bundle verification
    downloaded_bytes, integrity = worker_svc.download_and_verify_worker_bundle(mock_release, manifest_dto)
    assert integrity.is_valid is True
    assert integrity.actual_sha256 == manifest_dto.artifact_sha256
    assert downloaded_bytes == bundle_bytes

