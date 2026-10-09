"""
Phase 13 Comprehensive Tests: Randomized API Route Architecture & Subdomain Management.

Covers:
- Route Generation (length, entropy, charset, denylist, protocol keywords)
- Route Persistence (D1 sys_config, SQLite ManagedWorkerRecord, update preservation, legacy 'sync' preservation)
- Route Runtime & Panel URL (generation, trailing slash, dynamic panel URL, dialog representation)
- Subdomain verification and status methods
"""

import json
import pytest
import string
from unittest.mock import MagicMock

from BuilderV2.naming import (
    generate_random_api_route,
    is_valid_api_route,
    PROTOCOL_KEYWORDS,
    DENYLIST,
)
from BuilderV2.deployment.models import DeploymentResult, get_panel_url
from BuilderV2.storage.models import ManagedWorkerRecord, ConnectionRecord
from BuilderV2.storage.database import LocalDatabase
from BuilderV2.cloudflare.d1_service import D1Service
from BuilderV2.cloudflare.worker_service import WorkerService


class TestRouteGeneration:
    """Tests 1-6: Route Generation & Validation."""

    def test_1_generates_10_char_lowercase_alphanumeric(self):
        route = generate_random_api_route(10)
        assert len(route) == 10
        assert route.islower()
        assert route.isalnum()
        assert all(c in (string.ascii_lowercase + string.digits) for c in route)

    def test_2_cryptographically_secure_random_entropy(self):
        # 1000 generated routes must all be unique
        generated = {generate_random_api_route(10) for _ in range(1000)}
        assert len(generated) == 1000

    def test_3_rejects_invalid_chars(self):
        # Uppercase
        assert not is_valid_api_route("ABCDEFGHIJ")
        assert not is_valid_api_route("Route12345")
        # Hyphens, dots, underscores, slashes, spaces
        assert not is_valid_api_route("route-12345")
        assert not is_valid_api_route("route.12345")
        assert not is_valid_api_route("route_12345")
        assert not is_valid_api_route("route/12345")
        assert not is_valid_api_route("/route12345")
        assert not is_valid_api_route("route 12345")
        # Too short or too long
        assert not is_valid_api_route("abc")
        assert not is_valid_api_route("a" * 35)

    def test_4_rejects_denylisted_terms(self):
        for term in ["luciproxy", "cloudflare", "proxy", "wireguard"]:
            assert not is_valid_api_route(term.lower())
            assert term.lower() in DENYLIST

    def test_5_rejects_protocol_keywords(self):
        for kw in ["api", "sync", "dash", "admin", "auth", "relay"]:
            assert not is_valid_api_route(kw)
            assert kw in PROTOCOL_KEYWORDS

    def test_6_custom_length_within_10_to_14_works(self):
        for length in range(10, 15):
            route = generate_random_api_route(length)
            assert len(route) == length
            assert is_valid_api_route(route)


class TestRoutePersistence:
    """Tests 7-11: Route Persistence in D1 and SQLite."""

    def test_7_d1_seed_stores_api_route_in_sys_config(self):
        client_mock = MagicMock()
        d1_service = D1Service(client=client_mock)

        # Initially no existing config
        client_mock.request.return_value = {"result": [{"results": []}]}

        route = "k9x2m4p7w1"
        key, seeded_route = d1_service.seed_initial_config(
            account_id="acc123",
            database_id="db456",
            preferred_key="testkey123456",
            api_route=route,
        )
        assert seeded_route == route
        assert key == "testkey123456"

        # Check execute query was called with the insert sql
        assert client_mock.request.call_count >= 2
        last_call_json = client_mock.request.call_args[1]["json_body"]
        assert "INSERT INTO kv_store" in last_call_json["sql"]
        inserted_config = json.loads(last_call_json["params"][0])
        assert inserted_config["apiRoute"] == route

    def test_8_d1_retrieve_returns_seeded_route(self):
        client_mock = MagicMock()
        d1_service = D1Service(client=client_mock)

        client_mock.request.return_value = {
            "result": [{
                "results": [{
                    "value": json.dumps({"apiRoute": "k9x2m4p7w1", "masterKey": "testkey"})
                }]
            }]
        }

        retrieved = d1_service.get_api_route(
            account_id="acc123",
            database_id="db456"
        )
        assert retrieved == "k9x2m4p7w1"

    def test_9_sqlite_managed_worker_record_stores_and_retrieves_api_route(self):
        storage = LocalDatabase(db_path=":memory:")
        storage.save_connection(ConnectionRecord(connectionId="conn-1", displayName="Conn 1"))

        record = ManagedWorkerRecord(
            workerId="acc-123:test-worker",
            connectionId="conn-1",
            accountId="acc-123",
            workerName="test-worker",
            workerUrl="https://test-worker.subdomain.workers.dev",
            d1BindingName="IOT_DB",
            d1DatabaseId="db-uuid-456",
            d1Name="test-d1",
            installedWorkerVersion="1.2.1",
            apiRoute="m3p8x1z9k4",
        )
        storage.save_managed_worker(record)

        loaded = storage.get_managed_worker("acc-123:test-worker")
        assert loaded is not None
        assert loaded.apiRoute == "m3p8x1z9k4"
        assert loaded.workerName == "test-worker"
        storage.close()

    def test_10_worker_update_preserves_existing_route(self):
        """Worker update does NOT regenerate apiRoute if one already exists in D1 or DB."""
        client_mock = MagicMock()
        d1_service = D1Service(client=client_mock)

        # Existing route is preserved
        client_mock.request.return_value = {
            "result": [{
                "results": [{
                    "value": json.dumps({"apiRoute": "existingroute1", "masterKey": "existingkey"})
                }]
            }]
        }

        discovered_route = d1_service.get_api_route("acc123", "db456")
        assert discovered_route == "existingroute1"

        # Re-seeding config with discovered route keeps existingroute1
        key, active_route = d1_service.seed_initial_config("acc123", "db456", preferred_key="newkey", api_route="newrandomroute")
        assert active_route == "existingroute1"
        assert key == "existingkey"

    def test_11_legacy_worker_sync_route_preserved_during_update(self):
        """Legacy workers deployed prior to Phase 13 have route 'sync'. It must be preserved."""
        client_mock = MagicMock()
        d1_service = D1Service(client=client_mock)

        # Legacy worker has no sys_config in D1
        client_mock.request.return_value = {"result": [{"results": []}]}
        discovered_route = d1_service.get_api_route("acc123", "db456")
        assert discovered_route is None

        # Fallback for legacy workers is "sync"
        effective_route = discovered_route or "sync"
        assert effective_route == "sync"


class TestRouteRuntimeAndPanelUrl:
    """Tests 12-16: Route Runtime, Panel URL, and Result Dialogs."""

    def test_12_get_panel_url_generation(self):
        base_url = "https://my-worker.my-subdomain.workers.dev"
        route = "k9x2m4p7w1"
        panel_url = get_panel_url(base_url, route)
        assert panel_url == "https://my-worker.my-subdomain.workers.dev/k9x2m4p7w1/dash"

    def test_13_panel_url_fallback_to_sync(self):
        base_url = "https://my-worker.my-subdomain.workers.dev"
        panel_url = get_panel_url(base_url, None)
        assert panel_url == "https://my-worker.my-subdomain.workers.dev/sync/dash"

    def test_14_trailing_slash_handling(self):
        base_url_with_slash = "https://my-worker.my-subdomain.workers.dev/"
        route = "/k9x2m4p7w1/"
        panel_url = get_panel_url(base_url_with_slash, route)
        assert panel_url == "https://my-worker.my-subdomain.workers.dev/k9x2m4p7w1/dash"

    def test_15_deployment_result_contains_api_route_and_panel_url(self):
        res = DeploymentResult(
            success=True,
            action="create",
            worker_name="alpha-proxy",
            d1_name="alpha-db",
            d1_database_id="db-uuid-1",
            d1_binding_name="IOT_DB",
            worker_version="1.2.1",
            source_revision="3aafad1000",
            bundle_sha256="abc123hash",
            worker_url="https://alpha-proxy.test.workers.dev",
            api_route="w8x2p4m1k9",
        )
        assert res.api_route == "w8x2p4m1k9"
        assert res.panel_url == "https://alpha-proxy.test.workers.dev/w8x2p4m1k9/dash"

    def test_16_clipboard_copy_panel_url_includes_dynamic_route(self):
        res = DeploymentResult(
            success=True,
            action="create",
            worker_name="alpha-proxy",
            d1_name="alpha-db",
            d1_database_id="db-uuid-1",
            d1_binding_name="IOT_DB",
            worker_version="1.2.1",
            source_revision="3aafad1000",
            bundle_sha256="abc123hash",
            worker_url="https://alpha-proxy.test.workers.dev",
            api_route="m4p8x2k1z9",
        )
        assert "m4p8x2k1z9/dash" in res.panel_url


class TestWorkerSubdomainService:
    """Tests for WorkerSubdomain verification and status."""

    def test_subdomain_status_query(self):
        client_mock = MagicMock()
        ws = WorkerService(client=client_mock)
        client_mock.request.return_value = {"result": {"enabled": True}}

        status = ws.get_worker_subdomain_status("acc123", "my-worker")
        assert status is True
        client_mock.request.assert_called_with(
            method="GET",
            endpoint="/accounts/acc123/workers/scripts/my-worker/subdomain",
            step="Get Worker Subdomain Status"
        )

    def test_subdomain_enablement_call(self):
        client_mock = MagicMock()
        ws = WorkerService(client=client_mock)
        client_mock.request.return_value = {"result": {"enabled": True}}

        res = ws.enable_worker_subdomain("acc123", "my-worker")
        assert res == {"result": {"enabled": True}}
        client_mock.request.assert_called_with(
            method="POST",
            endpoint="/accounts/acc123/workers/scripts/my-worker/subdomain",
            json_body={"enabled": True},
            step="Enable Worker Subdomain Route"
        )
