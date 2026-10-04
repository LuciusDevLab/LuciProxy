"""
Tests for pure REST API Deployer, lifecycle orchestration, and collision retry handling.
"""

import json
from pathlib import Path
import tempfile
from unittest.mock import MagicMock, patch
import pytest

from src.cloudflare.client import CloudflareClient
from src.cloudflare.exceptions import CloudflareError, ResourceCollisionError
from src.deployment.deployer import Deployer
from src.storage.history import DeploymentHistoryStore
from src.validation.verifier import CheckResult, VerificationReport


@pytest.fixture
def mock_cf_client():
    client = MagicMock(spec=CloudflareClient)
    client.create_d1_database.return_value = {
        "uuid": "mock-d1-uuid-1111",
        "name": "amber-finch-1234"
    }

    def fake_query(*args, **kwargs):
        sql = kwargs.get("sql", "") or (args[2] if len(args) > 2 else "")
        if "sqlite_master" in sql:
            return [{"results": [{"name": "kv_store"}]}]
        if "SELECT value FROM kv_store" in sql:
            return [{"results": []}]
        if "ping" in sql:
            return [{"results": [{"ping": 1}]}]
        return [{"success": True}]

    client.execute_d1_query.side_effect = fake_query
    client.upload_worker_multipart.return_value = {
        "id": "amber-finch-1234",
        "success": True
    }
    client.get_workers_subdomain.return_value = "my-subdomain"
    client.enable_worker_subdomain.return_value = {"enabled": True}
    client.get_worker.return_value = {"id": "amber-finch-1234"}
    return client


def test_deployer_dry_run(mock_cf_client):
    """Verify that dry-run returns simulated plan without making Cloudflare API calls."""
    with tempfile.TemporaryDirectory() as tmpdir:
        history = DeploymentHistoryStore(config_dir=Path(tmpdir))
        deployer = Deployer(
            client=mock_cf_client,
            account_id="acc_test_123",
            account_name="Test Account",
            history_store=history
        )

        res = deployer.execute_deployment(dry_run=True, api_route="sync")

        assert res["success"] is True
        assert res["dry_run"] is True
        assert res["d1_uuid"] == "simulated-uuid-0000"
        assert res["target_url"] == f"https://{res['worker_name']}.workers.dev"
        assert res["panel_url"] == f"https://{res['worker_name']}.workers.dev/sync/dash"
        assert res["master_key"] == "simulated_master_key_12345678"

        # Verify no network mutative calls were made
        mock_cf_client.create_d1_database.assert_not_called()
        mock_cf_client.upload_worker_multipart.assert_not_called()
        assert len(history.list_records()) == 0


def test_deployer_full_deployment_success(mock_cf_client):
    """Verify complete lifecycle execution: D1, multipart upload, subdomain, verification, history."""
    with tempfile.TemporaryDirectory() as tmpdir:
        history = DeploymentHistoryStore(config_dir=Path(tmpdir))
        deployer = Deployer(
            client=mock_cf_client,
            account_id="acc_test_123",
            account_name="Test Account",
            history_store=history
        )

        with patch("requests.Session.get") as mock_get, patch("requests.Session.post") as mock_post:
            mock_resp = MagicMock()
            mock_resp.status_code = 200
            mock_resp.text = "LuciProxy dashboard html valid configs and export payload"
            mock_resp.json.return_value = {"success": True}
            mock_get.return_value = mock_resp
            mock_post.return_value = mock_resp

            res = deployer.execute_deployment(dry_run=False, api_route="sync")

            assert res["success"] is True
            assert res["dry_run"] is False
            assert res["worker_name"] is not None
            assert res["d1_name"] is not None
            assert res["d1_uuid"] == "mock-d1-uuid-1111"
            assert "https://" in res["target_url"]
            assert res["target_url"].endswith(".my-subdomain.workers.dev")
            assert res["panel_url"] == f"{res['target_url']}/sync/dash"
            assert res["sub_url"] == f"{res['target_url']}/sync"
            assert res["master_key"] is not None
            assert len(res["master_key"]) == 24

            # Check that API calls were dispatched
            mock_cf_client.create_d1_database.assert_called_once()
            mock_cf_client.upload_worker_multipart.assert_called_once()
            mock_cf_client.put_worker_secret.assert_called_once_with(
                "acc_test_123",
                res["worker_name"],
                "MASTER_KEY",
                res["master_key"]
            )
            mock_cf_client.enable_worker_subdomain.assert_called_once()

            # Verify that multipart upload payload contained NO plaintext MASTER_KEY
            uploaded_files = mock_cf_client.upload_worker_multipart.call_args[0][2]
            uploaded_meta = json.loads(uploaded_files["metadata"][1])
            for binding in uploaded_meta.get("bindings", []):
                assert binding.get("name") != "MASTER_KEY", "MASTER_KEY must not be in multipart bindings"
                assert binding.get("type") != "plain_text", "plain_text binding type must not be in multipart bindings"

            # Check history persistence
            records = history.list_records()
            assert len(records) == 1
            assert records[0].worker_name == res["worker_name"]
            assert records[0].d1_uuid == "mock-d1-uuid-1111"


def test_deployer_d1_collision_retry(mock_cf_client):
    """Verify that a D1 name collision causes a retry with a fresh random name."""
    with tempfile.TemporaryDirectory() as tmpdir:
        history = DeploymentHistoryStore(config_dir=Path(tmpdir))
        deployer = Deployer(
            client=mock_cf_client,
            account_id="acc_test_123",
            account_name="Test Account",
            history_store=history
        )

        # First call fails with collision; second call succeeds
        mock_cf_client.create_d1_database.side_effect = [
            CloudflareError("Database already exists with this name", step="D1"),
            {"uuid": "retry-uuid-2222", "name": "second-try-name"}
        ]

        with patch("requests.Session.get") as mock_get, patch("requests.Session.post") as mock_post:
            mock_resp = MagicMock()
            mock_resp.status_code = 200
            mock_resp.text = "LuciProxy dashboard html content"
            mock_resp.json.return_value = {"success": True}
            mock_get.return_value = mock_resp
            mock_post.return_value = mock_resp

            res = deployer.execute_deployment(dry_run=False, api_route="sync")

            assert res["success"] is True
            assert res["d1_uuid"] == "retry-uuid-2222"
            assert mock_cf_client.create_d1_database.call_count == 2


def test_deployer_worker_collision_retry(mock_cf_client):
    """Verify that a Worker name collision causes a retry with a fresh random name."""
    with tempfile.TemporaryDirectory() as tmpdir:
        history = DeploymentHistoryStore(config_dir=Path(tmpdir))
        deployer = Deployer(
            client=mock_cf_client,
            account_id="acc_test_123",
            account_name="Test Account",
            history_store=history
        )

        # First worker upload fails with collision; second succeeds
        mock_cf_client.upload_worker_multipart.side_effect = [
            CloudflareError("A worker already exists with that script name", step="Worker Upload"),
            {"id": "retry-worker-name", "success": True}
        ]

        with patch("requests.Session.get") as mock_get, patch("requests.Session.post") as mock_post:
            mock_resp = MagicMock()
            mock_resp.status_code = 200
            mock_resp.text = "LuciProxy dashboard html content"
            mock_resp.json.return_value = {"success": True}
            mock_get.return_value = mock_resp
            mock_post.return_value = mock_resp

            res = deployer.execute_deployment(dry_run=False, api_route="sync")

            assert res["success"] is True
            assert mock_cf_client.upload_worker_multipart.call_count == 2


def test_deployer_auth_failure_raises_cloudflare_error(mock_cf_client):
    """Verify that if live admin auth fails, execute_deployment raises CloudflareError and fails."""
    with tempfile.TemporaryDirectory() as tmpdir:
        history = DeploymentHistoryStore(config_dir=Path(tmpdir))
        deployer = Deployer(
            client=mock_cf_client,
            account_id="acc_test_123",
            account_name="Test Account",
            history_store=history
        )

        with patch("requests.Session.get") as mock_get, patch("requests.Session.post") as mock_post:
            # GET succeeds for edge probe and dashboard
            get_resp = MagicMock()
            get_resp.status_code = 200
            get_resp.text = "LuciProxy dashboard html content"
            mock_get.return_value = get_resp

            # POST fails with 401 Invalid credentials
            post_resp = MagicMock()
            post_resp.status_code = 401
            post_resp.json.return_value = {"success": False, "error": "Invalid credentials"}
            mock_post.return_value = post_resp

            with pytest.raises(CloudflareError, match="Administrative credentials rejected"):
                deployer.execute_deployment(dry_run=False, api_route="sync")


def test_deployer_secret_creation_failure_raises(mock_cf_client):
    """Verify that if put_worker_secret fails, deployment aborts cleanly."""
    with tempfile.TemporaryDirectory() as tmpdir:
        history = DeploymentHistoryStore(config_dir=Path(tmpdir))
        deployer = Deployer(
            client=mock_cf_client,
            account_id="acc_test_123",
            account_name="Test Account",
            history_store=history
        )

        mock_cf_client.put_worker_secret.side_effect = CloudflareError(
            message="Failed to create Worker secret MASTER_KEY",
            step="Configuring Worker Secret"
        )

        with pytest.raises(CloudflareError, match="Failed to create Worker secret"):
            deployer.execute_deployment(dry_run=False, api_route="sync")


def test_deployer_d1_create_permission_failure_raises(mock_cf_client):
    """Verify that if D1 database creation fails with 403, precise D1 Write error propagates."""
    from src.cloudflare.exceptions import AuthenticationError

    with tempfile.TemporaryDirectory() as tmpdir:
        history = DeploymentHistoryStore(config_dir=Path(tmpdir))
        deployer = Deployer(
            client=mock_cf_client,
            account_id="acc_test_123",
            account_name="Test Account",
            history_store=history
        )

        mock_cf_client.create_d1_database.side_effect = AuthenticationError(
            message="Permission denied while creating D1 database.",
            step="Create D1 Database",
            reason="The API Token lacks required permissions for this action.",
            suggested_action="Create a new Cloudflare API Token using the Builder's current preconfigured template / ensure D1 Write permission is enabled.",
            status_code=403,
            capability="D1 Write",
            operation="Create D1 Database",
            endpoint="POST /accounts/acc_test_123/d1/database"
        )

        with pytest.raises(AuthenticationError) as exc_info:
            deployer.execute_deployment(dry_run=False, api_route="sync")

        err = exc_info.value
        assert err.capability == "D1 Write"
        assert err.operation == "Create D1 Database"
        assert err.endpoint == "POST /accounts/acc_test_123/d1/database"
        assert "D1 Write" in err.suggested_action
        assert "POST /accounts/acc_test_123/d1/database" in err.format_actionable()


