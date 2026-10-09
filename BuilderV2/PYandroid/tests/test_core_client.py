"""
Unit tests for PortableCloudflareClient.
Verifies Cloudflare API communication, error sanitization, and quota accuracy.
"""

from unittest.mock import MagicMock, patch
import pytest

from BuilderV2.PYandroid.src.core.client import PortableCloudflareClient, CloudflareApiError


def test_client_init_and_sanitization():
    """Proves client initializes and redacts tokens from error messages."""
    client = PortableCloudflareClient(token="secret_token_1234567890abcdef")
    assert client._sanitize("Error with secret_token_1234567890abcdef at endpoint") == "Error with [REDACTED_TOKEN] at endpoint"

    with pytest.raises(ValueError):
        PortableCloudflareClient(token="")


def test_verify_token_active():
    """Proves verify_token parses active Cloudflare status."""
    client = PortableCloudflareClient(token="valid_token")

    with patch.object(client, "request") as mock_req:
        mock_req.return_value = {
            "success": True,
            "result": {
                "id": "tok_xyz",
                "status": "active",
                "expires_on": "2030-01-01T00:00:00Z"
            }
        }
        res = client.verify_token()
        assert res.valid is True
        assert res.status == "active"
        assert res.token_id == "tok_xyz"


def test_list_accounts():
    """Proves list_accounts retrieves accessible accounts."""
    client = PortableCloudflareClient(token="valid_token")

    with patch.object(client, "request") as mock_req:
        mock_req.return_value = {
            "success": True,
            "result": [
                {"id": "acc_1", "name": "Account Alpha"},
                {"id": "acc_2", "name": "Account Beta"},
            ]
        }
        accounts = client.list_accounts()
        assert len(accounts) == 2
        assert accounts[0].id == "acc_1"
        assert accounts[0].name == "Account Alpha"


def test_enable_worker_subdomain():
    """Proves enable_worker_subdomain sends enabled=True to Cloudflare."""
    client = PortableCloudflareClient(token="valid_token")

    with patch.object(client, "request") as mock_req:
        mock_req.return_value = {"success": True}
        ok = client.enable_worker_subdomain("acc_1", "worker-1")
        assert ok is True
        mock_req.assert_called_once_with(
            "POST",
            "/accounts/acc_1/workers/scripts/worker-1/subdomain",
            json={"enabled": True},
        )


def test_delete_worker_script_preserves_d1():
    """Proves delete_worker_script sends DELETE strictly to workers/scripts endpoint."""
    client = PortableCloudflareClient(token="valid_token")

    with patch.object(client, "request") as mock_req:
        mock_req.return_value = {"success": True}
        ok = client.delete_worker_script("acc_1", "worker-1")
        assert ok is True
        mock_req.assert_called_once_with(
            "DELETE",
            "/accounts/acc_1/workers/scripts/worker-1",
        )


def test_analytics_reports_real_usage_and_unavailable_quota():
    """
    Proves GraphQL analytics reports real request count and sets quota to Unavailable.
    NEVER hardcodes 100,000 requests!
    """
    client = PortableCloudflareClient(token="valid_token")

    mock_resp = MagicMock()
    mock_resp.json.return_value = {
        "data": {
            "viewer": {
                "accounts": [
                    {
                        "workersInvocationsAdaptive": [
                            {"sum": {"requests": 1420}},
                            {"sum": {"requests": 80}},
                        ]
                    }
                ]
            }
        }
    }

    with patch.object(client._session, "post", return_value=mock_resp):
        res = client.get_worker_analytics("acc_1")
        assert res["available"] is True
        assert res["requests_num"] == 1500
        assert res["requests"] == "1,500"
        assert res["quota_num"] is None
        assert res["quota"] == "Unavailable"
        # Explicitly verify 100,000 is NOT returned
        assert res["quota_num"] != 100000
        assert res["quota"] != "100,000"


def test_d1_query_and_schema_initialization():
    """Proves execute_d1_query, initialize_d1_schema, and verify_d1_schema make correct Cloudflare D1 calls."""
    client = PortableCloudflareClient(token="valid_token")

    with patch.object(client, "request") as mock_req:
        mock_req.return_value = {
            "success": True,
            "result": [{"results": [{"cnt": 1}]}]
        }
        res = client.execute_d1_query("acc_1", "db_123", "SELECT count(*) as cnt FROM kv_store")
        assert res == [{"results": [{"cnt": 1}]}]
        mock_req.assert_called_once_with(
            "POST",
            "/accounts/acc_1/d1/database/db_123/query",
            json={"sql": "SELECT count(*) as cnt FROM kv_store", "params": []}
        )

    with patch.object(client, "execute_d1_query") as mock_exec:
        mock_exec.return_value = [{"results": []}]
        client.initialize_d1_schema("acc_1", "db_123")
        assert "CREATE TABLE IF NOT EXISTS kv_store" in mock_exec.call_args[0][2]

    with patch.object(client, "execute_d1_query") as mock_exec:
        mock_exec.return_value = [{"results": [{"name": "kv_store"}]}]
        assert client.verify_d1_schema("acc_1", "db_123") is True


def test_d1_seed_and_get_sys_config():
    """Proves seed_d1_config inserts json payload and get_d1_sys_config parses it."""
    client = PortableCloudflareClient(token="valid_token")

    with patch.object(client, "execute_d1_query") as mock_exec:
        mock_exec.return_value = [{"results": []}]
        key, route = client.seed_d1_config("acc_1", "db_123", "secret-uuid", "route12345")
        assert key == "secret-uuid"
        assert route == "route12345"
        sql_arg = mock_exec.call_args[1]["sql"] if "sql" in mock_exec.call_args[1] else mock_exec.call_args[0][2]
        params_arg = mock_exec.call_args[1]["params"] if "params" in mock_exec.call_args[1] else mock_exec.call_args[0][3]
        assert "INSERT INTO kv_store (key, value) VALUES ('sys_config'" in sql_arg
        import json
        parsed = json.loads(params_arg[0])
        assert parsed["masterKey"] == "secret-uuid"
        assert parsed["apiRoute"] == "route12345"

    with patch.object(client, "execute_d1_query") as mock_exec:
        mock_exec.return_value = [
            {"results": [{"value": '{"masterKey":"secret-uuid","apiRoute":"route12345"}'}]}
        ]
        cfg = client.get_d1_sys_config("acc_1", "db_123")
        assert cfg == {"masterKey": "secret-uuid", "apiRoute": "route12345"}


def test_put_worker_secret_and_upload_multipart():
    """Proves put_worker_secret and upload_worker_multipart issue correct REST calls."""
    client = PortableCloudflareClient(token="valid_token")

    with patch.object(client, "request") as mock_req:
        mock_req.return_value = {"success": True}
        ok = client.put_worker_secret("acc_1", "my-worker", "MASTER_KEY", "uuid-secret-val")
        assert ok["success"] is True
        mock_req.assert_called_once_with(
            "PUT",
            "/accounts/acc_1/workers/scripts/my-worker/secrets",
            json={"name": "MASTER_KEY", "text": "uuid-secret-val", "type": "secret_text"}
        )

    mock_resp = MagicMock()
    mock_resp.status_code = 200
    mock_resp.json.return_value = {"success": True, "result": {"id": "my-worker"}}

    with patch.object(client._session, "put", return_value=mock_resp) as mock_put:
        res = client.upload_worker_multipart("acc_1", "my-worker", "export default {}", "d1-uuid-456")
        assert res["id"] == "my-worker"
        assert mock_put.called
        call_url = mock_put.call_args[0][0]
        assert "/accounts/acc_1/workers/scripts/my-worker" in call_url
