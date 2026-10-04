"""
Tests for CloudflareClient abstraction with mocked API responses.
"""

from unittest.mock import MagicMock
import pytest
import requests

from src.cloudflare.client import CloudflareClient
from src.cloudflare.exceptions import (
    AuthenticationError,
    ResourceCollisionError,
    QuotaExceededError,
    CloudflareError
)


def mock_response(status_code: int, json_data: dict, ok: bool = True):
    resp = MagicMock(spec=requests.Response)
    resp.status_code = status_code
    resp.ok = ok
    resp.json.return_value = json_data
    resp.text = str(json_data)
    return resp


def test_verify_token_success():
    session = MagicMock(spec=requests.Session)
    session.request.return_value = mock_response(200, {
        "success": True,
        "result": {"id": "tok_123", "status": "active"}
    })

    client = CloudflareClient("mock_token", session=session)
    result = client.verify_token()
    assert result["status"] == "active"
    assert result["id"] == "tok_123"


def test_verify_token_invalid_401():
    session = MagicMock(spec=requests.Session)
    session.request.return_value = mock_response(401, {
        "success": False,
        "errors": [{"code": 10000, "message": "Authentication error"}]
    }, ok=False)

    client = CloudflareClient("invalid_token", session=session)
    with pytest.raises(AuthenticationError) as exc_info:
        client.verify_token()
    assert "Invalid or expired" in exc_info.value.reason


def test_permission_denied_403():
    session = MagicMock(spec=requests.Session)
    session.request.return_value = mock_response(403, {
        "success": False,
        "errors": [{"code": 10001, "message": "Missing permissions"}]
    }, ok=False)

    client = CloudflareClient("limited_token", session=session)
    with pytest.raises(AuthenticationError) as exc_info:
        client.list_accounts()
    assert "lacks required permissions" in exc_info.value.reason


def test_rate_limit_429():
    session = MagicMock(spec=requests.Session)
    session.request.return_value = mock_response(429, {
        "success": False,
        "errors": [{"code": 10013, "message": "Rate limit exceeded"}]
    }, ok=False)

    client = CloudflareClient("mock_token", session=session)
    with pytest.raises(QuotaExceededError) as exc_info:
        client.list_d1_databases("acc_123")
    assert "rate limit exceeded" in str(exc_info.value)


def test_d1_database_operations():
    session = MagicMock(spec=requests.Session)
    # Mock list D1
    session.request.return_value = mock_response(200, {
        "success": True,
        "result": [{"uuid": "d1_uuid_123", "name": "luciproxy-db"}]
    })

    client = CloudflareClient("mock_token", session=session)
    dbs = client.list_d1_databases("acc_123", name="luciproxy-db")
    assert len(dbs) == 1
    assert dbs[0]["uuid"] == "d1_uuid_123"

    # Mock execute D1 query
    session.request.return_value = mock_response(200, {
        "success": True,
        "result": [{"results": [{"ping": 1}], "success": True}]
    })
    res = client.execute_d1_query("acc_123", "d1_uuid_123", "SELECT 1 as ping;")
    assert len(res) == 1
    assert res[0]["results"][0]["ping"] == 1


def test_worker_collision_error():
    session = MagicMock(spec=requests.Session)
    session.request.return_value = mock_response(400, {
        "success": False,
        "errors": [{"code": 7400, "message": "database name already exists"}]
    }, ok=False)

    client = CloudflareClient("mock_token", session=session)
    with pytest.raises(ResourceCollisionError):
        client.create_d1_database("acc_123", "existing-db")


def test_token_initialization_validation():
    with pytest.raises(AuthenticationError) as exc1:
        CloudflareClient("")
    assert "cannot be empty" in str(exc1.value)

    with pytest.raises(AuthenticationError) as exc2:
        CloudflareClient("token with spaces")
    assert "invalid characters or whitespace" in str(exc2.value)


def test_probe_workers_capability():
    session = MagicMock(spec=requests.Session)
    # Success
    session.request.return_value = mock_response(200, {"success": True, "result": []})
    client = CloudflareClient("mock_token", session=session)
    ok, err = client.probe_workers_capability("acc_123")
    assert ok is True
    assert err is None

    # 403 Forbidden
    session.request.return_value = mock_response(403, {
        "success": False,
        "errors": [{"code": 10001, "message": "Missing permissions"}]
    }, ok=False)
    ok, err = client.probe_workers_capability("acc_123")
    assert ok is False
    assert "Workers Scripts: Edit" in err


def test_probe_d1_capability():
    session = MagicMock(spec=requests.Session)
    # Success (both Read and Write succeed)
    session.request.return_value = mock_response(200, {"success": True, "result": []})
    client = CloudflareClient("mock_token", session=session)
    ok, err = client.probe_d1_capability("acc_123")
    assert ok is True
    assert err is None

    # 403 Forbidden on Read probe
    session.request.return_value = mock_response(403, {
        "success": False,
        "errors": [{"code": 10001, "message": "Missing permissions"}]
    }, ok=False)
    ok, err = client.probe_d1_capability("acc_123")
    assert ok is False
    assert "D1 Read" in err


def test_probe_d1_capability_read_ok_write_forbidden():
    """
    Regression Test (Failure Mode): D1 Read permission is available (GET succeeds),
    but D1 Write permission is missing (POST probe returns 403).
    Preflight capability probe MUST fail and explicitly identify D1 Write.
    """
    session = MagicMock(spec=requests.Session)

    def side_effect(method, url, **kwargs):
        if method == "GET":
            return mock_response(200, {"success": True, "result": []})
        elif method == "POST":
            return mock_response(403, {
                "success": False,
                "errors": [{"code": 10001, "message": "Missing permissions"}]
            }, ok=False)
        return mock_response(404, {"success": False}, ok=False)

    session.request.side_effect = side_effect
    client = CloudflareClient("mock_token", session=session)

    # 1. Read capability succeeds
    read_ok, read_err = client.probe_d1_read_capability("acc_123")
    assert read_ok is True
    assert read_err is None

    # 2. Write capability probe fails
    write_ok, write_err = client.probe_d1_write_capability("acc_123")
    assert write_ok is False
    assert "D1 Write" in write_err
    assert "POST /accounts/acc_123/d1/database" in write_err

    # 3. Overall D1 capability probe MUST fail
    ok, err = client.probe_d1_capability("acc_123")
    assert ok is False
    assert "D1 Write" in err


def test_probe_d1_capability_both_pass_with_400_probe():
    """
    Authoritative Non-Destructive Probe:
    GET returns 200 (Read OK).
    POST with empty body returns 400 (Bad Request: schema validation failed, no DB created).
    HTTP 400 confirms write authorization succeeded!
    """
    session = MagicMock(spec=requests.Session)

    def side_effect(method, url, **kwargs):
        if method == "GET":
            return mock_response(200, {"success": True, "result": []})
        elif method == "POST":
            # 400 indicates authorization passed; request rejected for missing body/name
            return mock_response(400, {
                "success": False,
                "errors": [{"code": 7400, "message": "name is required"}]
            }, ok=False)
        return mock_response(404, {"success": False}, ok=False)

    session.request.side_effect = side_effect
    client = CloudflareClient("mock_token", session=session)

    ok, err = client.probe_d1_capability("acc_123")
    assert ok is True
    assert err is None


def test_create_d1_database_precise_write_permission_error():
    """
    Regression Test: Actual POST /accounts/{account_id}/d1/database returns 403 Forbidden.
    Error MUST identify Capability: D1 Write, Operation: Create D1 Database, Endpoint, and suggested action.
    """
    session = MagicMock(spec=requests.Session)
    session.request.return_value = mock_response(403, {
        "success": False,
        "errors": [{"code": 10000, "message": "Authentication error"}]
    }, ok=False)

    client = CloudflareClient("mock_token", session=session)
    with pytest.raises(AuthenticationError) as exc_info:
        client.create_d1_database("acc_target", "new-db")

    err = exc_info.value
    assert err.capability == "D1 Write"
    assert err.operation == "Create D1 Database"
    assert err.endpoint == "POST /accounts/acc_target/d1/database"
    assert "D1 Write" in err.suggested_action
    formatted = err.format_actionable()
    assert "Capability:       D1 Write" in formatted
    assert "Operation:        Create D1 Database" in formatted
    assert "Endpoint:         POST /accounts/acc_target/d1/database" in formatted
    assert "Suggested Action: Create a new Cloudflare API Token using the Builder's current preconfigured template / ensure D1 Write permission is enabled." in formatted


def test_create_d1_database_quota_limit_7406():
    """
    Regression Test: Cloudflare returns HTTP 403 with code 7406:
    "System limit reached: databases per account (10)".
    Must raise QuotaExceededError, NOT AuthenticationError!
    Must state D1 database limit reached for this account and suggest deleting unused DBs or upgrading.
    Must NOT call this a permission error.
    """
    session = MagicMock(spec=requests.Session)
    session.request.return_value = mock_response(403, {
        "result": None,
        "success": False,
        "errors": [{"code": 7406, "message": "System limit reached: databases per account (10)"}],
        "messages": []
    }, ok=False)

    client = CloudflareClient("mock_token", session=session)
    with pytest.raises(QuotaExceededError) as exc_info:
        client.create_d1_database("acc_target", "new-db")

    err = exc_info.value
    assert err.step == "Create D1 Database"
    assert err.reason == "Cloudflare D1 database limit reached for this account."
    assert "Delete unused D1 databases in Cloudflare Dashboard or upgrade the account to Workers Paid." in err.suggested_action
    assert err.status_code == 403
    assert err.capability is None  # NOT a capability/permission error
    assert "permission" not in (err.reason or "").lower()

    formatted = err.format_actionable()
    assert "Step:             Create D1 Database" in formatted
    assert "Reason:           Cloudflare D1 database limit reached for this account." in formatted
    assert "Suggested Action: Delete unused D1 databases in Cloudflare Dashboard or upgrade the account to Workers Paid." in formatted
    assert "Capability:" not in formatted


def test_create_d1_database_quota_limit_message_fallback():
    """
    Test: Cloudflare returns HTTP 403 with 'limit reached' in error message
    even if code is non-standard. Must raise QuotaExceededError.
    """
    session = MagicMock(spec=requests.Session)
    session.request.return_value = mock_response(403, {
        "result": None,
        "success": False,
        "errors": [{"code": 9999, "message": "Account limit reached for D1 databases"}],
        "messages": []
    }, ok=False)

    client = CloudflareClient("mock_token", session=session)
    with pytest.raises(QuotaExceededError) as exc_info:
        client.create_d1_database("acc_target", "new-db")

    err = exc_info.value
    assert err.step == "Create D1 Database"
    assert err.status_code == 403
    assert err.reason == "Cloudflare D1 database limit reached for this account."


def test_probe_d1_capability_write_quota_exceeded_proves_write_permission():
    """
    If the D1 write probe returns HTTP 403 with code 7406 (quota reached),
    this proves write authorization succeeded. The probe should report success.
    """
    session = MagicMock(spec=requests.Session)

    def side_effect(method, url, **kwargs):
        if method == "GET":
            return mock_response(200, {"success": True, "result": []})
        elif method == "POST":
            return mock_response(403, {
                "success": False,
                "errors": [{"code": 7406, "message": "System limit reached: databases per account (10)"}]
            }, ok=False)
        return mock_response(404, {"success": False}, ok=False)

    session.request.side_effect = side_effect
    client = CloudflareClient("mock_token", session=session)

    ok, err = client.probe_d1_capability("acc_123")
    assert ok is True
    assert err is None


def test_probe_subdomain_capability():
    session = MagicMock(spec=requests.Session)
    # Success with existing subdomain
    session.request.return_value = mock_response(200, {
        "success": True,
        "result": {"subdomain": "myzone"}
    })
    client = CloudflareClient("mock_token", session=session)
    ok, sub, note = client.probe_subdomain_capability("acc_123")
    assert ok is True
    assert sub == "myzone"
    assert note is None

    # 404 (Not yet configured)
    session.request.return_value = mock_response(404, {
        "success": False,
        "errors": [{"code": 10009, "message": "not found"}]
    }, ok=False)
    ok, sub, note = client.probe_subdomain_capability("acc_123")
    assert ok is True
    assert sub is None
    assert "not have a workers.dev subdomain" in note


def test_put_worker_secret_payload_and_endpoint():
    """Verify put_worker_secret dispatches official PUT /accounts/.../secrets with secret_text."""
    session = MagicMock(spec=requests.Session)
    session.request.return_value = mock_response(200, {
        "success": True,
        "result": {"name": "MASTER_KEY", "type": "secret_text"}
    })

    client = CloudflareClient("mock_token", session=session)
    res = client.put_worker_secret(
        account_id="acc_123",
        script_name="amber-finch-1234",
        secret_name="MASTER_KEY",
        secret_text="0123456789abcdef01234567"
    )

    assert res["name"] == "MASTER_KEY"
    assert res["type"] == "secret_text"

    session.request.assert_called_once()
    call_kwargs = session.request.call_args[1]
    assert call_kwargs["method"] == "PUT"
    assert "/accounts/acc_123/workers/scripts/amber-finch-1234/secrets" in call_kwargs["url"]
    assert call_kwargs["json"] == {
        "name": "MASTER_KEY",
        "text": "0123456789abcdef01234567",
        "type": "secret_text"
    }


def test_put_worker_secret_empty_rejected():
    """Verify put_worker_secret rejects empty secret string before network call."""
    session = MagicMock(spec=requests.Session)
    client = CloudflareClient("mock_token", session=session)

    with pytest.raises(CloudflareError, match="cannot be empty"):
        client.put_worker_secret(
            account_id="acc_123",
            script_name="amber-finch-1234",
            secret_name="MASTER_KEY",
            secret_text="   "
        )
    session.request.assert_not_called()


def test_list_worker_secrets():
    """Verify list_worker_secrets dispatches GET /accounts/.../secrets."""
    session = MagicMock(spec=requests.Session)
    session.request.return_value = mock_response(200, {
        "success": True,
        "result": [{"name": "MASTER_KEY", "type": "secret_text"}]
    })

    client = CloudflareClient("mock_token", session=session)
    secrets = client.list_worker_secrets("acc_123", "amber-finch-1234")

    assert len(secrets) == 1
    assert secrets[0]["name"] == "MASTER_KEY"
    session.request.assert_called_once()
    call_kwargs = session.request.call_args[1]
    assert call_kwargs["method"] == "GET"
    assert "/accounts/acc_123/workers/scripts/amber-finch-1234/secrets" in call_kwargs["url"]


