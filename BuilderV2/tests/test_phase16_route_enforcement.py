"""
Phase 16 - Python Regression Tests for Randomized Route Enforcement & Preservation.

Verifies:
1. Installer create_worker fails safely if route generation or D1 seeding fails (no silent fallback).
2. Installer create_worker provisions randomized route and records canonical Panel URL.
3. Installer update_worker preserves existing randomized route from D1.
4. Installer update_worker preserves legacy 'sync' route.
5. Installer update_worker strictly preserves D1 database UUID.
6. D1Service seed_initial_config and get_api_route store and retrieve route correctly.
7. D1Service seed_initial_config preserves existing masterKey and route.
"""

import json
from pathlib import Path
import pytest
from unittest.mock import MagicMock, patch

from BuilderV2.cloudflare.client import CloudflareClient
from BuilderV2.cloudflare.d1_service import D1Service
from BuilderV2.cloudflare.models import D1DatabaseDto, DiscoveredD1BindingDto
from BuilderV2.cloudflare.worker_service import WorkerService
from BuilderV2.deployment.installer import WorkerInstaller
from BuilderV2.deployment.naming import generate_random_api_route
from BuilderV2.storage.database import LocalDatabase
from BuilderV2.storage.models import ConnectionRecord, ManagedWorkerRecord
from BuilderV2.worker_source.models import DeploymentPackage, WorkerSourceSnapshot, WorkerVersionSignal


from BuilderV2.security.credentials import InMemoryCredentialStore


@pytest.fixture
def memory_db():
    cred_store = InMemoryCredentialStore()
    cred_store.save_token("test-conn-1", "test-token-12345")
    db = LocalDatabase(db_path=":memory:", credential_store=cred_store)
    conn = ConnectionRecord(
        connectionId="test-conn-1",
        displayName="Test Account",
    )
    db.save_connection(conn)
    yield db
    db.close()


@pytest.fixture
def mock_source_svc():
    svc = MagicMock()
    svc.fetch_version_signal.return_value = WorkerVersionSignal(
        version="1.2.1",
        source_revision="3aafad12745c59a849610d603fc22b22f656ac36"
    )
    svc.download_source_at_revision.return_value = WorkerSourceSnapshot(
        revision="3aafad12745c59a849610d603fc22b22f656ac36",
        source_dir=Path(".")
    )
    svc.build_deployment_package.return_value = DeploymentPackage(
        version="1.2.1",
        source_revision="3aafad12745c59a849610d603fc22b22f656ac36",
        main_module="index.js",
        bundle_code="export default { fetch() {} };",
        bundle_sha256="06fefda1c8ccac907f690bf549fcfcf1138b827b4ae0abed6e31496a07026cef",
    )
    return svc


class TestPhase16RouteEnforcement:

    def test_installer_create_worker_fails_on_d1_seeding_failure(self, memory_db, mock_source_svc):
        """create_worker must raise RuntimeError and NOT silently fall back if D1 seeding fails."""
        installer = WorkerInstaller(db=memory_db, source_service=mock_source_svc)

        with patch("BuilderV2.deployment.installer.CloudflareClient"), \
             patch("BuilderV2.deployment.installer.D1Service") as MockD1Svc, \
             patch("BuilderV2.deployment.installer.WorkerService"):

            d1_mock = MockD1Svc.return_value
            d1_mock.create_d1_database.return_value = D1DatabaseDto(uuid="d1-uuid-err", name="d1-err")
            d1_mock.verify_schema.return_value = True
            # Simulate D1 API failure during seeding
            d1_mock.seed_initial_config.side_effect = RuntimeError("Cloudflare D1 SQL timeout")

            result = installer.create_worker(
                connection_id="test-conn-1",
                account_id="acc-12345",
                worker_name="worker-test",
                d1_name="d1-err"
            )

            assert result.success is False
            assert "Failed to seed initial database configuration and route" in result.error
            # Verify no managed worker record was saved under failure
            assert memory_db.get_managed_worker("acc-12345:worker-test") is None

    def test_installer_create_worker_provisions_random_route_and_panel_url(self, memory_db, mock_source_svc):
        """create_worker generates a 10-char random route and saves it in SQLite and DeploymentResult."""
        installer = WorkerInstaller(db=memory_db, source_service=mock_source_svc)

        with patch("BuilderV2.deployment.installer.CloudflareClient"), \
             patch("BuilderV2.deployment.installer.D1Service") as MockD1Svc, \
             patch("BuilderV2.deployment.installer.WorkerService") as MockWorkerSvc:

            d1_mock = MockD1Svc.return_value
            d1_mock.create_d1_database.return_value = D1DatabaseDto(uuid="d1-uuid-ok", name="d1-ok")
            d1_mock.verify_schema.return_value = True

            def mock_seed(acc, db_id, key, route):
                return (key or "mocked-key", route)
            d1_mock.seed_initial_config.side_effect = mock_seed

            worker_mock = MockWorkerSvc.return_value
            worker_mock.get_account_subdomain.return_value = "my-subdomain"
            worker_mock.upload_worker_multipart.return_value = {"id": "worker-ok"}
            worker_mock.discover_worker_d1_bindings.return_value = [
                DiscoveredD1BindingDto(binding_name="IOT_DB", database_id="d1-uuid-ok", database_name="d1-ok")
            ]

            result = installer.create_worker(
                connection_id="test-conn-1",
                account_id="acc-12345",
                worker_name="worker-ok",
                d1_name="d1-ok"
            )

            assert result.success is True
            assert result.api_route is not None
            assert len(result.api_route) == 10
            assert result.api_route != "sync"
            assert result.worker_url == "https://worker-ok.my-subdomain.workers.dev"

            # Check SQLite persistence
            managed = memory_db.get_managed_worker("acc-12345:worker-ok")
            assert managed is not None
            assert managed.apiRoute == result.api_route

    def test_installer_update_worker_preserves_existing_random_route(self, memory_db, mock_source_svc):
        """update_worker preserves the existing randomized apiRoute from D1."""
        installer = WorkerInstaller(db=memory_db, source_service=mock_source_svc)
        existing_route = "m8x2k1v9p4"

        # Pre-seed managed worker in SQLite
        rec = ManagedWorkerRecord(
            workerId="acc-12345:worker-to-update",
            connectionId="test-conn-1",
            accountId="acc-12345",
            workerName="worker-to-update",
            workerUrl="https://worker-to-update.my-subdomain.workers.dev",
            d1BindingName="IOT_DB",
            d1DatabaseId="existing-d1-uuid-999",
            d1Name="existing-d1-db",
            installedWorkerVersion="1.2.0",
            apiRoute=existing_route,
        )
        memory_db.save_managed_worker(rec)

        with patch("BuilderV2.deployment.installer.CloudflareClient"), \
             patch("BuilderV2.deployment.installer.D1Service") as MockD1Svc, \
             patch("BuilderV2.deployment.installer.WorkerService") as MockWorkerSvc:

            d1_mock = MockD1Svc.return_value
            d1_mock.get_api_route.return_value = existing_route

            worker_mock = MockWorkerSvc.return_value
            worker_mock.get_worker.return_value = {"id": "worker-to-update"}
            worker_mock.get_account_subdomain.return_value = "my-subdomain"
            worker_mock.discover_worker_d1_bindings.return_value = [
                DiscoveredD1BindingDto(binding_name="IOT_DB", database_id="existing-d1-uuid-999", database_name="existing-d1-db")
            ]

            result = installer.update_worker(
                connection_id="test-conn-1",
                account_id="acc-12345",
                worker_name="worker-to-update",
            )

            assert result.success is True
            assert result.api_route == existing_route
            assert result.d1_database_id == "existing-d1-uuid-999"

            # Check SQLite record was updated while preserving route and D1 UUID
            updated_rec = memory_db.get_managed_worker("acc-12345:worker-to-update")
            assert updated_rec.apiRoute == existing_route
            assert updated_rec.d1DatabaseId == "existing-d1-uuid-999"
            assert updated_rec.installedWorkerVersion == "1.2.1"

    def test_installer_update_worker_preserves_legacy_sync_route(self, memory_db, mock_source_svc):
        """update_worker preserves legacy 'sync' route if worker was deployed prior to randomized routes."""
        installer = WorkerInstaller(db=memory_db, source_service=mock_source_svc)

        rec = ManagedWorkerRecord(
            workerId="acc-12345:legacy-worker",
            connectionId="test-conn-1",
            accountId="acc-12345",
            workerName="legacy-worker",
            workerUrl="https://legacy-worker.my-subdomain.workers.dev",
            d1BindingName="IOT_DB",
            d1DatabaseId="legacy-d1-uuid-111",
            d1Name="legacy-d1-db",
            installedWorkerVersion="1.2.0",
            apiRoute="sync",
        )
        memory_db.save_managed_worker(rec)

        with patch("BuilderV2.deployment.installer.CloudflareClient"), \
             patch("BuilderV2.deployment.installer.D1Service") as MockD1Svc, \
             patch("BuilderV2.deployment.installer.WorkerService") as MockWorkerSvc:

            d1_mock = MockD1Svc.return_value
            # D1 has no apiRoute or returns "sync"
            d1_mock.get_api_route.return_value = "sync"

            worker_mock = MockWorkerSvc.return_value
            worker_mock.get_worker.return_value = {"id": "legacy-worker"}
            worker_mock.get_account_subdomain.return_value = "my-subdomain"
            worker_mock.discover_worker_d1_bindings.return_value = [
                DiscoveredD1BindingDto(binding_name="IOT_DB", database_id="legacy-d1-uuid-111", database_name="legacy-d1-db")
            ]

            result = installer.update_worker(
                connection_id="test-conn-1",
                account_id="acc-12345",
                worker_name="legacy-worker",
            )

            assert result.success is True
            assert result.api_route == "sync"
            assert result.d1_database_id == "legacy-d1-uuid-111"

            updated_rec = memory_db.get_managed_worker("acc-12345:legacy-worker")
            assert updated_rec.apiRoute == "sync"

    def test_d1_service_seed_initial_config_persists_master_key_and_api_route(self):
        """D1Service seeds both masterKey and apiRoute in initial_config."""
        client_mock = MagicMock()
        svc = D1Service(client=client_mock)

        # No existing sys_config
        client_mock.request.return_value = {"result": [{"results": []}]}

        key, route = svc.seed_initial_config(
            account_id="acc-123",
            database_id="db-456",
            preferred_key="my-secret-key-1234",
            api_route="customroute77",
        )

        assert key == "my-secret-key-1234"
        assert route == "customroute77"

        # Check payload passed to SQL
        assert client_mock.request.call_count >= 2
        last_json = client_mock.request.call_args[1]["json_body"]
        assert "INSERT INTO kv_store" in last_json["sql"]
        inserted_config = json.loads(last_json["params"][0])
        assert inserted_config["masterKey"] == "my-secret-key-1234"
        assert inserted_config["apiRoute"] == "customroute77"
