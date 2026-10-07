"""
Unit and Integration Tests for WorkerSourceService and WorkerInstaller.
Tests immutable source-based deployment, atomic updates, D1 binding preservation,
and safety invariants.
"""

import io
import json
from pathlib import Path
import tempfile
from unittest.mock import MagicMock, patch
import zipfile

import pytest

from BuilderV2.spec.versioning import WorkerVersionSignal
from BuilderV2.worker_source.models import WorkerSourceSnapshot, DeploymentPackage
from BuilderV2.worker_source.bundler import WorkerBundler
from BuilderV2.worker_source.source_service import WorkerSourceService, REQUIRED_SOURCE_FILES
from BuilderV2.deployment.models import DeploymentResult
from BuilderV2.deployment.naming import generate_deployment_names, is_name_allowed
from BuilderV2.deployment.installer import WorkerInstaller
from BuilderV2.storage.database import LocalDatabase
from BuilderV2.storage.models import ConnectionRecord, AccountRecord, ManagedWorkerRecord
from BuilderV2.security.credentials import InMemoryCredentialStore
from BuilderV2.cloudflare.models import (
    WorkerSummaryDto,
    DiscoveredD1BindingDto,
    D1DatabaseDto,
    WorkerDeploymentDto,
)


@pytest.fixture
def temp_dir():
    with tempfile.TemporaryDirectory() as td:
        yield Path(td)


@pytest.fixture
def memory_db():
    db = LocalDatabase(db_path=":memory:", credential_store=InMemoryCredentialStore())
    conn_rec = ConnectionRecord(
        connectionId="test-conn-1",
        displayName="Test CF Connection",
        status="active"
    )
    db.save_connection(conn_rec)
    db.credential_store.save_token("test-conn-1", "test-token-12345")
    acc_rec = AccountRecord(
        accountId="test-account-1",
        connectionId="test-conn-1",
        accountName="Test Account"
    )
    db.save_account(acc_rec)
    return db


@pytest.fixture
def mock_source_dir(temp_dir):
    """Creates a mock valid LuciProxy source tree."""
    s_dir = temp_dir / "LuciProxy"
    s_dir.mkdir(parents=True)
    (s_dir / "src").mkdir(parents=True)
    (s_dir / "src" / "db").mkdir(parents=True)
    (s_dir / "src" / "assets").mkdir(parents=True)

    (s_dir / "src" / "index.js").write_text("export default { fetch() { return new Response('ok'); } };", encoding="utf-8")
    (s_dir / "src" / "config.js").write_text("export const CURRENT_VERSION = '1.2.1';", encoding="utf-8")
    (s_dir / "src" / "db" / "d1.js").write_text("export function getDbBinding(env) { return env.IOT_DB; }", encoding="utf-8")
    (s_dir / "src" / "assets" / "loaders.js").write_text("export function renderDashboard() {}", encoding="utf-8")
    (s_dir / "package.json").write_text('{"name": "luciproxy", "type": "module", "version": "1.2.1"}', encoding="utf-8")
    (s_dir / "dist").mkdir(parents=True)
    (s_dir / "dist" / "index.js").write_text("/* pre-bundled fallback */\nexport default { fetch() {} };", encoding="utf-8")
    return s_dir


# =============================================================================
# 1. WORKER SOURCE SERVICE TESTS
# =============================================================================

def test_validate_source_revision():
    """Verify that source revision accepts 40-hex SHA and rejects invalid formats."""
    valid_sha = "3aafad12745c59a849610d603fc22b22f656ac36"
    assert WorkerSourceService.validate_source_revision(valid_sha) is True
    assert WorkerSourceService.validate_source_revision(valid_sha.upper()) is True

    # Rejections
    assert WorkerSourceService.validate_source_revision(None) is False
    assert WorkerSourceService.validate_source_revision("") is False
    assert WorkerSourceService.validate_source_revision("main") is False
    assert WorkerSourceService.validate_source_revision("worker-v1.2.1") is False
    assert WorkerSourceService.validate_source_revision("WORKTREE-UNCOMMITTED") is False
    assert WorkerSourceService.validate_source_revision("3aafad12745c59a849610d603fc22b22f656ac3") is False  # 39 chars
    assert WorkerSourceService.validate_source_revision("3aafad12745c59a849610d603fc22b22f656ac366") is False  # 41 chars
    assert WorkerSourceService.validate_source_revision("zzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzz") is False


def test_fetch_version_signal_from_file(temp_dir):
    """Verify parsing and validation of local version.json signal."""
    v_file = temp_dir / "version.json"
    valid_payload = {
        "version": "1.2.1",
        "source_revision": "3aafad12745c59a849610d603fc22b22f656ac36",
        "repo_url": "https://github.com/LuciusDevLab/LuciProxy"
    }
    v_file.write_text(json.dumps(valid_payload), encoding="utf-8")

    service = WorkerSourceService()
    signal = service.fetch_version_signal(local_file=v_file)
    assert signal.version == "1.2.1"
    assert signal.source_revision == "3aafad12745c59a849610d603fc22b22f656ac36"


def test_fetch_version_signal_rejects_dirty_revision(temp_dir):
    """Verify error when version.json declares non-commit revision."""
    v_file = temp_dir / "version.json"
    dirty_payload = {
        "version": "1.2.1",
        "source_revision": "WORKTREE-UNCOMMITTED"
    }
    v_file.write_text(json.dumps(dirty_payload), encoding="utf-8")

    service = WorkerSourceService()
    with pytest.raises(ValueError, match="invalid source_revision"):
        service.fetch_version_signal(local_file=v_file)


def test_validate_source_tree(mock_source_dir, temp_dir):
    """Verify detection of complete vs incomplete source trees."""
    service = WorkerSourceService()
    is_valid, missing = service.validate_source_tree(mock_source_dir)
    assert is_valid is True
    assert len(missing) == 0

    # Incomplete directory
    empty_dir = temp_dir / "empty"
    empty_dir.mkdir()
    is_valid_empty, missing_empty = service.validate_source_tree(empty_dir)
    assert is_valid_empty is False
    assert len(missing_empty) == len(REQUIRED_SOURCE_FILES)


def test_download_source_at_revision_and_extract(temp_dir):
    """Verify downloading zipball and extracting only LuciProxy files with security guard."""
    revision = "3aafad12745c59a849610d603fc22b22f656ac36"

    # Create an in-memory zipball mimicking GitHub's structure
    buf = io.BytesIO()
    with zipfile.ZipFile(buf, "w") as zf:
        prefix = "LuciusDevLab-LuciProxy-3aafad1"
        zf.writestr(f"{prefix}/README.md", "Repository Readme")
        zf.writestr(f"{prefix}/LuciProxy/src/index.js", "export default {};")
        zf.writestr(f"{prefix}/LuciProxy/src/config.js", "export const V = '1.2.1';")
        zf.writestr(f"{prefix}/LuciProxy/src/db/d1.js", "export const db = 1;")
        zf.writestr(f"{prefix}/LuciProxy/src/assets/loaders.js", "export const ld = 1;")
        zf.writestr(f"{prefix}/LuciProxy/package.json", '{"name":"luciproxy"}')

    zip_bytes = buf.getvalue()

    mock_resp = MagicMock()
    mock_resp.ok = True
    mock_resp.content = zip_bytes

    mock_session = MagicMock()
    mock_session.get.return_value = mock_resp

    service = WorkerSourceService(cache_dir=temp_dir / "cache", session=mock_session)
    snapshot = service.download_source_at_revision(revision)

    assert snapshot.is_valid is True
    assert snapshot.revision == revision
    assert (snapshot.source_dir / "src" / "index.js").exists()
    assert (snapshot.source_dir / "package.json").exists()
    # README from repo root should NOT be in LuciProxy extracted folder
    assert not (snapshot.source_dir / "README.md").exists()


def test_bundle_source(mock_source_dir):
    """Verify local bundler compiles and returns DeploymentPackage."""
    bundler = WorkerBundler()
    service = WorkerSourceService(bundler=bundler)

    snapshot = WorkerSourceSnapshot(
        revision="3aafad12745c59a849610d603fc22b22f656ac36",
        source_dir=mock_source_dir
    )

    pkg = service.build_deployment_package(snapshot, "1.2.1")
    assert pkg.version == "1.2.1"
    assert pkg.source_revision == snapshot.revision
    assert pkg.main_module == "index.js"
    assert len(pkg.bundle_code) > 0
    assert len(pkg.bundle_sha256) == 64
    assert pkg.d1_binding_name == "IOT_DB"


def test_worker_bundle_reproducibility():
    """
    Forensic verification test:
    Verifies that the real WorkerBundler compiles the real pinned Worker source commit
    with 100% bit-for-bit repeatability across repeated runs.
    Pinned commit: 3aafad12745c59a849610d603fc22b22f656ac36
    Expected SHA-256: 06fefda1c8ccac907f690bf549fcfcf1138b827b4ae0abed6e31496a07026cef
    Expected size: 321150 bytes
    """
    pinned_commit = "3aafad12745c59a849610d603fc22b22f656ac36"
    expected_sha256 = "06fefda1c8ccac907f690bf549fcfcf1138b827b4ae0abed6e31496a07026cef"
    expected_size = 321150

    bundler = WorkerBundler()
    esbuild_path = bundler.get_esbuild_path()
    assert esbuild_path is not None and esbuild_path.exists(), "Standalone esbuild binary must be available"

    service = WorkerSourceService(bundler=bundler)
    snapshot = service.download_source_at_revision(pinned_commit)
    assert snapshot.is_valid is True

    # Execute 3 consecutive real builds using real WorkerBundler
    run_results = []
    for _ in range(3):
        pkg = service.build_deployment_package(snapshot, "1.2.1")
        run_results.append((len(pkg.bundle_code), pkg.bundle_sha256))

    # All runs must be bit-for-bit identical
    sizes = [sz for sz, _ in run_results]
    hashes = [h for _, h in run_results]

    assert len(set(sizes)) == 1, f"Sizes differed across runs: {sizes}"
    assert len(set(hashes)) == 1, f"Hashes differed across runs: {hashes}"

    # Must match official release artifact values exactly
    assert sizes[0] == expected_size, f"Size mismatch: got {sizes[0]}, expected {expected_size}"
    assert hashes[0] == expected_sha256, f"Hash mismatch: got {hashes[0]}, expected {expected_sha256}"


# =============================================================================
# 2. WORKER INSTALLER (CREATE WORKER) TESTS
# =============================================================================

def test_create_worker_provisions_d1_and_deploys(memory_db, mock_source_dir):
    """
    Verify create_worker:
    1. Creates fresh D1 database with UUID.
    2. Initializes schema.
    3. Uploads multipart Worker script with IOT_DB pointing to D1 UUID.
    4. Sets MASTER_KEY secret.
    5. Saves managed_workers and update_history in SQLite.
    """
    mock_source_svc = MagicMock()
    mock_source_svc.fetch_version_signal.return_value = WorkerVersionSignal(
        version="1.2.1",
        source_revision="3aafad12745c59a849610d603fc22b22f656ac36"
    )
    mock_source_svc.download_source_at_revision.return_value = WorkerSourceSnapshot(
        revision="3aafad12745c59a849610d603fc22b22f656ac36",
        source_dir=mock_source_dir
    )
    mock_source_svc.build_deployment_package.return_value = DeploymentPackage(
        version="1.2.1",
        source_revision="3aafad12745c59a849610d603fc22b22f656ac36",
        main_module="index.js",
        bundle_code="export default { fetch() {} };",
        bundle_sha256="06fefda1c8ccac907f690bf549fcfcf1138b827b4ae0abed6e31496a07026cef",
    )

    installer = WorkerInstaller(db=memory_db, source_service=mock_source_svc)

    with patch("BuilderV2.deployment.installer.CloudflareClient") as MockCFClient, \
         patch("BuilderV2.deployment.installer.D1Service") as MockD1Svc, \
         patch("BuilderV2.deployment.installer.WorkerService") as MockWorkerSvc:

        d1_instance = MockD1Svc.return_value
        d1_instance.create_d1_database.return_value = D1DatabaseDto(
            uuid="new-d1-uuid-12345",
            name="amber-brook-1001"
        )
        d1_instance.verify_schema.return_value = True
        d1_instance.seed_master_key.return_value = "generated-master-key-xyz"

        worker_instance = MockWorkerSvc.return_value
        worker_instance.get_account_subdomain.return_value = "mysubdomain"
        worker_instance.upload_worker_multipart.return_value = {"id": "amber-finch-2002"}

        result = installer.create_worker(
            connection_id="test-conn-1",
            account_id="test-account-1",
            worker_name="amber-finch-2002",
            d1_name="amber-brook-1001"
        )

        assert result.success is True
        assert result.action == "create"
        assert result.worker_name == "amber-finch-2002"
        assert result.d1_database_id == "new-d1-uuid-12345"
        assert result.d1_binding_name == "IOT_DB"
        assert result.worker_version == "1.2.1"
        assert result.master_key == "generated-master-key-xyz"

        # Verify D1 creation & schema initialization called
        d1_instance.create_d1_database.assert_called_once_with("test-account-1", "amber-brook-1001")
        d1_instance.initialize_schema.assert_called_once_with("test-account-1", "new-d1-uuid-12345")
        d1_instance.seed_master_key.assert_called_once()

        # Verify Worker upload called with multipart containing IOT_DB binding to new UUID
        worker_instance.upload_worker_multipart.assert_called_once()
        call_args = worker_instance.upload_worker_multipart.call_args[0]
        assert call_args[0] == "test-account-1"
        assert call_args[1] == "amber-finch-2002"
        files_dict = call_args[2]
        meta_json = json.loads(files_dict["metadata"][1])
        assert meta_json["bindings"][0]["name"] == "IOT_DB"
        assert meta_json["bindings"][0]["id"] == "new-d1-uuid-12345"

        # Verify MASTER_KEY configured via Secrets API
        worker_instance.put_worker_secret.assert_called_once_with(
            "test-account-1", "amber-finch-2002", "MASTER_KEY", "generated-master-key-xyz"
        )

        # Verify SQLite record created in managed_workers
        managed = memory_db.get_managed_worker("test-account-1:amber-finch-2002")
        assert managed is not None
        assert managed.installedWorkerVersion == "1.2.1"
        assert managed.d1DatabaseId == "new-d1-uuid-12345"
        assert managed.d1BindingName == "IOT_DB"

        # Verify update_history record created
        history = memory_db.list_update_history("test-account-1")
        assert len(history) == 1
        assert history[0].updatedWorkerVersion == "1.2.1"
        assert history[0].d1DatabaseId == "new-d1-uuid-12345"


# =============================================================================
# 3. WORKER INSTALLER (UPDATE WORKER & D1 PRESERVATION) TESTS
# =============================================================================

def test_update_worker_preserves_existing_d1_database(memory_db, mock_source_dir):
    """
    CRITICAL INVARIANT TEST:
    Verify update_worker:
    1. Discovers existing remote D1 binding ('existing-d1-uuid-9999').
    2. NEVER calls create_d1_database or delete_d1_database.
    3. Deploys updated code with exact existing D1 binding intact.
    4. Updates SQLite state and logs audit record.
    """
    # Seed local SQLite managed worker record representing installed v1.2.0
    initial_managed = ManagedWorkerRecord(
        workerId="test-account-1:amber-finch-2002",
        connectionId="test-conn-1",
        accountId="test-account-1",
        workerName="amber-finch-2002",
        workerUrl="https://amber-finch-2002.mysubdomain.workers.dev",
        d1BindingName="IOT_DB",
        d1DatabaseId="existing-d1-uuid-9999",
        d1Name="my-production-d1",
        installedWorkerVersion="v1.2.0",
        status="update_available"
    )
    memory_db.save_managed_worker(initial_managed)

    mock_source_svc = MagicMock()
    mock_source_svc.fetch_version_signal.return_value = WorkerVersionSignal(
        version="1.2.1",
        source_revision="3aafad12745c59a849610d603fc22b22f656ac36"
    )
    mock_source_svc.download_source_at_revision.return_value = WorkerSourceSnapshot(
        revision="3aafad12745c59a849610d603fc22b22f656ac36",
        source_dir=mock_source_dir
    )
    mock_source_svc.build_deployment_package.return_value = DeploymentPackage(
        version="1.2.1",
        source_revision="3aafad12745c59a849610d603fc22b22f656ac36",
        main_module="index.js",
        bundle_code="export default { fetch() {} };",
        bundle_sha256="06fefda1c8ccac907f690bf549fcfcf1138b827b4ae0abed6e31496a07026cef",
    )

    installer = WorkerInstaller(db=memory_db, source_service=mock_source_svc)

    with patch("BuilderV2.deployment.installer.CloudflareClient"), \
         patch("BuilderV2.deployment.installer.D1Service") as MockD1Svc, \
         patch("BuilderV2.deployment.installer.WorkerService") as MockWorkerSvc:

        d1_instance = MockD1Svc.return_value
        worker_instance = MockWorkerSvc.return_value

        # Remote worker inspection
        worker_instance.get_worker.return_value = WorkerSummaryDto(
            id="amber-finch-2002",
            name="amber-finch-2002"
        )
        # Discovered bindings contains the existing production D1 database
        worker_instance.discover_worker_d1_bindings.return_value = [
            DiscoveredD1BindingDto(
                binding_name="IOT_DB",
                database_id="existing-d1-uuid-9999",
                database_name="my-production-d1"
            )
        ]
        worker_instance.get_account_subdomain.return_value = "mysubdomain"
        worker_instance.upload_worker_multipart.return_value = {"id": "amber-finch-2002"}

        result = installer.update_worker(
            connection_id="test-conn-1",
            account_id="test-account-1",
            worker_name="amber-finch-2002"
        )

        assert result.success is True
        assert result.action == "update"
        assert result.worker_name == "amber-finch-2002"
        assert result.worker_version == "1.2.1"
        assert result.d1_database_id == "existing-d1-uuid-9999"

        # STRICT INVARIANT: D1 creation was NOT called
        d1_instance.create_d1_database.assert_not_called()
        d1_instance.seed_master_key.assert_not_called()

        # Verify upload preserved existing D1 UUID
        worker_instance.upload_worker_multipart.assert_called_once()
        call_args = worker_instance.upload_worker_multipart.call_args[0]
        files_dict = call_args[2]
        meta_json = json.loads(files_dict["metadata"][1])
        assert meta_json["bindings"][0]["name"] == "IOT_DB"
        assert meta_json["bindings"][0]["id"] == "existing-d1-uuid-9999"

        # Verify local SQLite updated to 1.2.1
        updated = memory_db.get_managed_worker("test-account-1:amber-finch-2002")
        assert updated.installedWorkerVersion == "1.2.1"
        assert updated.d1DatabaseId == "existing-d1-uuid-9999"
        assert updated.status == "up_to_date"

        # Verify update_history contains record
        hist = memory_db.list_update_history("test-account-1")
        assert len(hist) == 1
        assert hist[0].previousWorkerVersion == "v1.2.0"
        assert hist[0].updatedWorkerVersion == "1.2.1"
        assert hist[0].d1DatabaseId == "existing-d1-uuid-9999"
        assert hist[0].status == "success"


def test_update_worker_aborts_if_no_d1_database(memory_db, mock_source_dir):
    """Verify that update_worker aborts safely if worker has no linked D1 database."""
    mock_source_svc = MagicMock()
    installer = WorkerInstaller(db=memory_db, source_service=mock_source_svc)

    with patch("BuilderV2.deployment.installer.CloudflareClient"), \
         patch("BuilderV2.deployment.installer.D1Service"), \
         patch("BuilderV2.deployment.installer.WorkerService") as MockWorkerSvc:

        worker_instance = MockWorkerSvc.return_value
        worker_instance.get_worker.return_value = WorkerSummaryDto(id="bare-worker", name="bare-worker")
        # No D1 bindings discovered
        worker_instance.discover_worker_d1_bindings.return_value = []

        result = installer.update_worker(
            connection_id="test-conn-1",
            account_id="test-account-1",
            worker_name="bare-worker"
        )

        assert result.success is False
        assert "no linked d1 database bindings" in result.error.lower()
        worker_instance.upload_worker_multipart.assert_not_called()



def test_update_worker_aborts_if_ambiguous_d1_bindings(memory_db, mock_source_dir):
    """Verify that update_worker aborts safely if worker has ambiguous non-primary D1 bindings."""
    mock_source_svc = MagicMock()
    installer = WorkerInstaller(db=memory_db, source_service=mock_source_svc)

    with patch("BuilderV2.deployment.installer.CloudflareClient"), \
         patch("BuilderV2.deployment.installer.D1Service"), \
         patch("BuilderV2.deployment.installer.WorkerService") as MockWorkerSvc:

        worker_instance = MockWorkerSvc.return_value
        worker_instance.get_worker.return_value = WorkerSummaryDto(id="multi-d1", name="multi-d1")
        # Multiple ambiguous bindings with arbitrary names
        worker_instance.discover_worker_d1_bindings.return_value = [
            DiscoveredD1BindingDto(binding_name="CUSTOM_DB_1", database_id="uuid-1"),
            DiscoveredD1BindingDto(binding_name="CUSTOM_DB_2", database_id="uuid-2"),
        ]

        result = installer.update_worker(
            connection_id="test-conn-1",
            account_id="test-account-1",
            worker_name="multi-d1"
        )

        assert result.success is False
        assert "ambiguous d1 bindings" in result.error.lower()
        worker_instance.upload_worker_multipart.assert_not_called()


def test_update_worker_handles_upload_failure(memory_db, mock_source_dir):
    """Verify that update failure records failure in audit log without corrupting state."""
    initial_managed = ManagedWorkerRecord(
        workerId="test-account-1:amber-finch-2002",
        connectionId="test-conn-1",
        accountId="test-account-1",
        workerName="amber-finch-2002",
        workerUrl="https://amber-finch-2002.mysubdomain.workers.dev",
        d1BindingName="IOT_DB",
        d1DatabaseId="existing-d1-uuid-9999",
        d1Name="my-production-d1",
        installedWorkerVersion="v1.2.0",
        status="update_available"
    )
    memory_db.save_managed_worker(initial_managed)

    mock_source_svc = MagicMock()
    mock_source_svc.fetch_version_signal.return_value = WorkerVersionSignal(
        version="1.2.1",
        source_revision="3aafad12745c59a849610d603fc22b22f656ac36"
    )
    mock_source_svc.download_source_at_revision.return_value = WorkerSourceSnapshot(
        revision="3aafad12745c59a849610d603fc22b22f656ac36",
        source_dir=mock_source_dir
    )
    mock_source_svc.build_deployment_package.return_value = DeploymentPackage(
        version="1.2.1",
        source_revision="3aafad12745c59a849610d603fc22b22f656ac36",
        main_module="index.js",
        bundle_code="code",
        bundle_sha256="sha",
    )

    installer = WorkerInstaller(db=memory_db, source_service=mock_source_svc)

    with patch("BuilderV2.deployment.installer.CloudflareClient"), \
         patch("BuilderV2.deployment.installer.D1Service"), \
         patch("BuilderV2.deployment.installer.WorkerService") as MockWorkerSvc:

        worker_instance = MockWorkerSvc.return_value
        worker_instance.get_worker.return_value = WorkerSummaryDto(id="amber-finch-2002", name="amber-finch-2002")
        worker_instance.discover_worker_d1_bindings.return_value = [
            DiscoveredD1BindingDto(binding_name="IOT_DB", database_id="existing-d1-uuid-9999")
        ]
        # Simulate network or API error during script upload
        worker_instance.upload_worker_multipart.side_effect = RuntimeError("Cloudflare Edge unavailable")

        result = installer.update_worker(
            connection_id="test-conn-1",
            account_id="test-account-1",
            worker_name="amber-finch-2002"
        )

        assert result.success is False
        assert "cloudflare edge unavailable" in result.error.lower()

        # Database state remained at previous version
        managed = memory_db.get_managed_worker("test-account-1:amber-finch-2002")
        assert managed.installedWorkerVersion == "v1.2.0"

        # Audit log records failed update attempt
        hist = memory_db.list_update_history("test-account-1")
        assert len(hist) == 1
        assert hist[0].status == "failed"
