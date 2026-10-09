"""
Unit tests for DeploymentEngine and WorkerSourceProvider in PYandroid.
Proves worker creation, in-place update, script deletion with D1 preservation,
and canonical bundle resolution with hash verification.
"""

from unittest.mock import MagicMock, patch
import pytest

from BuilderV2.PYandroid.src.core.deployment import (
    DeploymentEngine,
    WorkerSourceProvider,
    CANONICAL_WORKER_VERSION,
    EXPECTED_BUNDLE_SHA256,
    EXPECTED_BUNDLE_SIZE,
)
from BuilderV2.PYandroid.src.core.models import D1BindingDto


@pytest.fixture
def mock_client():
    client = MagicMock()
    client.get_account_subdomain.return_value = "my-subdomain"
    client.create_d1_database.return_value = {"uuid": "d1-uuid-12345", "name": "d1-test-db"}
    client.initialize_d1_schema.return_value = True
    client.seed_d1_config.return_value = True
    client.upload_worker_multipart.return_value = {"id": "worker-1"}
    client.put_worker_secret.return_value = True
    client.enable_worker_subdomain.return_value = True
    client.delete_worker_script.return_value = True
    client.get_d1_sys_config.return_value = {"apiRoute": "active12345", "masterKey": "master-uuid"}
    return client


def test_deploy_worker_lifecycle(mock_client):
    """Proves fresh worker deployment executes all 8 steps, sets D1 schema, seeds config, and uploads bundle."""
    engine = DeploymentEngine(mock_client)
    progress_steps = []

    result = engine.deploy_worker(
        account_id="acc_123",
        worker_name="relay-node-test",
        d1_name="d1-test-db",
        progress_callback=lambda step, total, stage, detail: progress_steps.append(step),
    )

    assert result.success is True
    assert result.worker_name == "relay-node-test"
    assert result.d1_name == "d1-test-db"
    assert result.d1_database_id == "d1-uuid-12345"
    assert len(result.api_route) == 10
    assert result.api_route.isalnum() and result.api_route.islower()
    assert result.worker_url == "https://relay-node-test.my-subdomain.workers.dev"
    assert result.panel_url == f"https://relay-node-test.my-subdomain.workers.dev/{result.api_route}/dash"
    assert len(progress_steps) == 8

    # Assert 8-step client calls
    mock_client.get_account_subdomain.assert_called_once_with("acc_123")
    mock_client.create_d1_database.assert_called_once_with("acc_123", "d1-test-db")
    mock_client.initialize_d1_schema.assert_called_once_with("acc_123", "d1-uuid-12345")
    mock_client.seed_d1_config.assert_called_once_with(
        account_id="acc_123",
        database_id="d1-uuid-12345",
        master_key=result.uuid,
        api_route=result.api_route,
    )
    mock_client.upload_worker_multipart.assert_called_once()
    upload_kwargs = mock_client.upload_worker_multipart.call_args[1]
    assert upload_kwargs["account_id"] == "acc_123"
    assert upload_kwargs["worker_name"] == "relay-node-test"
    assert upload_kwargs["d1_uuid"] == "d1-uuid-12345"
    assert len(upload_kwargs["bundle_code"]) > 1000

    mock_client.put_worker_secret.assert_called_once_with(
        account_id="acc_123",
        script_name="relay-node-test",
        secret_name="MASTER_KEY",
        secret_text=result.uuid,
    )
    mock_client.enable_worker_subdomain.assert_called_once_with("acc_123", "relay-node-test")


def test_update_worker_preserves_d1(mock_client):
    """Proves in-place update strictly preserves existing D1 database binding, apiRoute, and masterKey."""
    mock_client.get_worker_bindings.return_value = [
        D1BindingDto(
            binding_name="IOT_DB",
            database_id="d1-existing-uuid-9999",
            database_name="production-db",
        )
    ]

    engine = DeploymentEngine(mock_client)
    result = engine.update_worker(
        account_id="acc_123",
        worker_name="relay-node-test",
    )

    assert result.success is True
    assert result.worker_name == "relay-node-test"
    assert result.d1_database_id == "d1-existing-uuid-9999"
    assert result.d1_name == "production-db"
    assert result.api_route == "active12345"

    # Verify upload was called with preserved D1 UUID
    upload_kwargs = mock_client.upload_worker_multipart.call_args[1]
    assert upload_kwargs["account_id"] == "acc_123"
    assert upload_kwargs["worker_name"] == "relay-node-test"
    assert upload_kwargs["d1_uuid"] == "d1-existing-uuid-9999"

    # Verify secret configured with preserved master key
    mock_client.put_worker_secret.assert_called_once_with(
        account_id="acc_123",
        script_name="relay-node-test",
        secret_name="MASTER_KEY",
        secret_text="master-uuid",
    )


def test_delete_worker_preserves_d1(mock_client):
    """Proves delete_worker delegates to delete_worker_script, preserving D1."""
    engine = DeploymentEngine(mock_client)
    ok = engine.delete_worker("acc_123", "worker-to-delete")

    assert ok is True
    mock_client.delete_worker_script.assert_called_once_with("acc_123", "worker-to-delete")


def test_source_provider_resolves_canonical_bundle():
    """Proves WorkerSourceProvider acquires bundle matching EXPECTED_BUNDLE_SHA256."""
    provider = WorkerSourceProvider()
    bundle_code, sha256, version, revision = provider.get_bundle()

    assert version == CANONICAL_WORKER_VERSION
    assert sha256 == EXPECTED_BUNDLE_SHA256
    assert len(bundle_code) == EXPECTED_BUNDLE_SIZE
    assert "LuciProxy" in bundle_code or "export default" in bundle_code
