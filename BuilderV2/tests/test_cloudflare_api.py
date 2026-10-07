"""
Unit Tests for Phase 3 - Cloudflare API Client and Service Layer.
All tests use mocked HTTP responses (Zero real network calls, zero real tokens).
Validates:
1. Token Verification Success & Failure
2. Multi-Account Discovery
3. Pagination Handling
4. Worker Listing & Settings
5. D1 Binding Extraction (Zero, Single, Multiple Bindings)
6. D1 Metadata Lookup
7. HTTP Error Mapping (401, 403, 404, 429, 5xx)
8. Network Connection / Timeout Failures
9. Malformed API Responses
10. GraphQL Error Handling
11. Security Invariant: Zero Token Leakage in Exceptions
"""

from unittest.mock import MagicMock, patch
import pytest
import requests

from BuilderV2.cloudflare.client import CloudflareClient
from BuilderV2.cloudflare.account_service import AccountService
from BuilderV2.cloudflare.worker_service import WorkerService
from BuilderV2.cloudflare.d1_service import D1Service
from BuilderV2.cloudflare.analytics_service import AnalyticsService
from BuilderV2.cloudflare.exceptions import (
    AuthenticationError,
    PermissionDeniedError,
    ResourceNotFoundError,
    RateLimitError,
    CloudflareUnavailableError,
    NetworkConnectionError,
    MalformedApiResponseError,
    GraphQLError,
    sanitize_message,
)


MOCK_TOKEN = "dummy-test-token-000000000000000000000000"


@pytest.fixture
def mock_session():
    return MagicMock(spec=requests.Session)


@pytest.fixture
def cf_client(mock_session):
    return CloudflareClient(token=MOCK_TOKEN, session=mock_session)


# 1. Token Verification Tests
def test_token_verification_success(cf_client, mock_session):
    """Verifies successful token validation mapping to TokenVerificationDto."""
    mock_resp = MagicMock()
    mock_resp.status_code = 200
    mock_resp.json.return_value = {
        "success": True,
        "result": {
            "id": "mock_token_id_123",
            "status": "active",
            "expires_on": "2027-01-01T00:00:00Z"
        }
    }
    mock_session.request.return_value = mock_resp

    svc = AccountService(cf_client)
    res = svc.verify_token()
    assert res.status == "active"
    assert res.id == "mock_token_id_123"
    assert res.expires_on == "2027-01-01T00:00:00Z"


def test_token_verification_failure_401(cf_client, mock_session):
    """Verifies that HTTP 401 raises AuthenticationError."""
    mock_resp = MagicMock()
    mock_resp.status_code = 401
    mock_resp.json.return_value = {
        "success": False,
        "errors": [{"code": 1000, "message": "Invalid token"}]
    }
    mock_session.request.return_value = mock_resp

    svc = AccountService(cf_client)
    with pytest.raises(AuthenticationError) as exc_info:
        svc.verify_token()
    assert exc_info.value.status_code == 401
    assert "Invalid token" in str(exc_info.value)


# 2. Multi-Account Discovery
def test_multi_account_response(cf_client, mock_session):
    """Verifies ONE Token -> MANY Accounts normalization."""
    mock_resp = MagicMock()
    mock_resp.status_code = 200
    mock_resp.json.return_value = {
        "success": True,
        "result": [
            {"id": "acc-1", "name": "Personal Account", "type": "standard"},
            {"id": "acc-2", "name": "Work Account", "type": "enterprise"},
        ],
        "result_info": {"page": 1, "per_page": 50, "count": 2, "total_count": 2}
    }
    mock_session.request.return_value = mock_resp

    svc = AccountService(cf_client)
    accounts = svc.list_accounts()
    assert len(accounts) == 2
    assert accounts[0].id == "acc-1"
    assert accounts[0].name == "Personal Account"
    assert accounts[1].id == "acc-2"
    assert accounts[1].name == "Work Account"


# 3. Pagination Handling
def test_pagination_multiple_pages(cf_client, mock_session):
    """Verifies that paginate() accumulates all pages correctly."""
    resp1 = MagicMock()
    resp1.status_code = 200
    resp1.json.return_value = {
        "success": True,
        "result": [{"id": f"item-{i}"} for i in range(1, 3)],
        "result_info": {"page": 1, "per_page": 2, "count": 2, "total_count": 4}
    }

    resp2 = MagicMock()
    resp2.status_code = 200
    resp2.json.return_value = {
        "success": True,
        "result": [{"id": f"item-{i}"} for i in range(3, 5)],
        "result_info": {"page": 2, "per_page": 2, "count": 2, "total_count": 4}
    }

    mock_session.request.side_effect = [resp1, resp2]

    items = cf_client.paginate("/test/endpoint", page_size=2)
    assert len(items) == 4
    assert [i["id"] for i in items] == ["item-1", "item-2", "item-3", "item-4"]


# 4. Worker Listing & Settings
def test_worker_listing(cf_client, mock_session):
    """Verifies worker scripts listing and DTO mapping."""
    mock_resp = MagicMock()
    mock_resp.status_code = 200
    mock_resp.json.return_value = {
        "success": True,
        "result": [
            {"id": "amber-finch", "name": "amber-finch", "created_on": "2026-10-01T00:00:00Z"},
            {"id": "blue-wolf", "name": "blue-wolf", "created_on": "2026-10-02T00:00:00Z"}
        ]
    }
    mock_session.request.return_value = mock_resp

    svc = WorkerService(cf_client)
    workers = svc.list_workers("acc-test")
    assert len(workers) == 2
    assert workers[0].name == "amber-finch"
    assert workers[1].name == "blue-wolf"


# 5. D1 Binding Discovery (Zero, Single, Multiple Bindings)
def test_d1_binding_discovery_zero_bindings(cf_client, mock_session):
    """Verifies that Worker with no D1 bindings returns an empty list."""
    mock_resp = MagicMock()
    mock_resp.status_code = 200
    mock_resp.json.return_value = {
        "success": True,
        "result": {
            "bindings": [
                {"type": "kv_namespace", "name": "MY_KV", "namespace_id": "kv-123"}
            ]
        }
    }
    mock_session.request.return_value = mock_resp

    svc = WorkerService(cf_client)
    discovered = svc.discover_worker_d1_bindings("acc-test", "test-worker")
    assert discovered == []


def test_d1_binding_discovery_single_binding(cf_client, mock_session):
    """Verifies single D1 binding discovery with resolved D1 metadata."""
    settings_resp = MagicMock()
    settings_resp.status_code = 200
    settings_resp.json.return_value = {
        "success": True,
        "result": {
            "bindings": [
                {"type": "d1", "name": "IOT_DB", "id": "8ce04f50-d253-4791-92da-1ebda064e373"}
            ]
        }
    }

    d1_detail_resp = MagicMock()
    d1_detail_resp.status_code = 200
    d1_detail_resp.json.return_value = {
        "success": True,
        "result": {
            "uuid": "8ce04f50-d253-4791-92da-1ebda064e373",
            "name": "silent-otter-5931",
            "num_tables": 3,
            "file_size": 16384
        }
    }

    mock_session.request.side_effect = [settings_resp, d1_detail_resp]

    svc = WorkerService(cf_client)
    discovered = svc.discover_worker_d1_bindings("acc-test", "test-worker")
    assert len(discovered) == 1
    assert discovered[0].binding_name == "IOT_DB"
    assert discovered[0].database_id == "8ce04f50-d253-4791-92da-1ebda064e373"
    assert discovered[0].database_name == "silent-otter-5931"
    assert discovered[0].database is not None
    assert discovered[0].database.num_tables == 3


def test_d1_binding_discovery_multiple_bindings_never_picks_single(cf_client, mock_session):
    """
    CRITICAL SPECIFICATION TEST:
    When a Worker has multiple D1 bindings, ALL bindings must be returned.
    The service must NEVER silently pick one.
    """
    settings_resp = MagicMock()
    settings_resp.status_code = 200
    settings_resp.json.return_value = {
        "success": True,
        "result": {
            "bindings": [
                {"type": "d1", "name": "PRIMARY_DB", "id": "uuid-db-1"},
                {"type": "d1", "name": "ANALYTICS_DB", "id": "uuid-db-2"}
            ]
        }
    }

    d1_resp_1 = MagicMock()
    d1_resp_1.status_code = 200
    d1_resp_1.json.return_value = {"success": True, "result": {"uuid": "uuid-db-1", "name": "primary-d1"}}

    d1_resp_2 = MagicMock()
    d1_resp_2.status_code = 200
    d1_resp_2.json.return_value = {"success": True, "result": {"uuid": "uuid-db-2", "name": "analytics-d1"}}

    mock_session.request.side_effect = [settings_resp, d1_resp_1, d1_resp_2]

    svc = WorkerService(cf_client)
    discovered = svc.discover_worker_d1_bindings("acc-test", "multi-db-worker")
    assert len(discovered) == 2
    assert discovered[0].binding_name == "PRIMARY_DB"
    assert discovered[0].database_name == "primary-d1"
    assert discovered[1].binding_name == "ANALYTICS_DB"
    assert discovered[1].database_name == "analytics-d1"


# 6. D1 Database Metadata Lookup
def test_d1_metadata_lookup(cf_client, mock_session):
    """Verifies D1Service database metadata retrieval."""
    mock_resp = MagicMock()
    mock_resp.status_code = 200
    mock_resp.json.return_value = {
        "success": True,
        "result": {
            "uuid": "d1-test-uuid",
            "name": "cool-sea-3351",
            "num_tables": 4,
            "file_size": 32768,
            "created_at": "2026-10-06T12:00:00Z"
        }
    }
    mock_session.request.return_value = mock_resp

    d1_svc = D1Service(cf_client)
    db = d1_svc.get_d1_database("acc-test", "d1-test-uuid")
    assert db is not None
    assert db.uuid == "d1-test-uuid"
    assert db.name == "cool-sea-3351"
    assert db.num_tables == 4
    assert db.file_size == 32768


# 7. HTTP Status Mapping Tests (403, 404, 429, 5xx)
def test_http_403_permission_denied(cf_client, mock_session):
    mock_resp = MagicMock()
    mock_resp.status_code = 403
    mock_resp.json.return_value = {
        "success": False,
        "errors": [{"code": 10000, "message": "Authentication error: Missing permissions"}]
    }
    mock_session.request.return_value = mock_resp

    with pytest.raises(PermissionDeniedError) as exc_info:
        cf_client.request("GET", "/accounts")
    assert exc_info.value.status_code == 403


def test_http_404_resource_not_found(cf_client, mock_session):
    mock_resp = MagicMock()
    mock_resp.status_code = 404
    mock_resp.json.return_value = {
        "success": False,
        "errors": [{"code": 10009, "message": "Script not found"}]
    }
    mock_session.request.return_value = mock_resp

    with pytest.raises(ResourceNotFoundError) as exc_info:
        cf_client.request("GET", "/accounts/acc/workers/scripts/missing")
    assert exc_info.value.status_code == 404


def test_http_429_rate_limit(cf_client, mock_session):
    mock_resp = MagicMock()
    mock_resp.status_code = 429
    mock_resp.headers = {"Retry-After": "5"}
    mock_resp.json.return_value = {
        "success": False,
        "errors": [{"code": 10014, "message": "Rate limit exceeded"}]
    }
    # Unsafe POST does not retry
    mock_session.request.return_value = mock_resp

    with pytest.raises(RateLimitError) as exc_info:
        cf_client.request("POST", "/accounts/acc/d1/database", json_body={"name": "test"})
    assert exc_info.value.status_code == 429
    assert exc_info.value.retry_after == 5


def test_http_5xx_cloudflare_unavailable(cf_client, mock_session):
    mock_resp = MagicMock()
    mock_resp.status_code = 502
    mock_resp.text = "Bad Gateway"
    mock_session.request.return_value = mock_resp

    with pytest.raises(CloudflareUnavailableError) as exc_info:
        cf_client.request("GET", "/accounts")
    assert exc_info.value.status_code == 502


# 8. Network Connection / Timeout Failures
def test_network_connection_timeout(cf_client, mock_session):
    mock_session.request.side_effect = requests.Timeout("Connection timed out after 30s")

    with pytest.raises(NetworkConnectionError) as exc_info:
        cf_client.request("GET", "/accounts")
    assert "Connection timed out" in str(exc_info.value)


# 9. Malformed API Responses
def test_malformed_json_response(cf_client, mock_session):
    mock_resp = MagicMock()
    mock_resp.status_code = 200
    mock_resp.json.side_effect = ValueError("Invalid JSON token")
    mock_resp.text = "<html>500 Internal Server Error</html>"
    mock_session.request.return_value = mock_resp

    with pytest.raises(MalformedApiResponseError):
        cf_client.request("GET", "/accounts")


# 10. GraphQL Error Handling
def test_graphql_error_handling(cf_client, mock_session):
    mock_resp = MagicMock()
    mock_resp.status_code = 200
    mock_resp.json.return_value = {
        "errors": [{"message": "Cannot query field 'invalidField' on type 'Account'"}]
    }
    mock_session.request.return_value = mock_resp

    analytics_svc = AnalyticsService(cf_client)
    res = analytics_svc.get_worker_invocations("acc-123", "worker-test")
    assert res["available"] is False
    assert "GraphQL Analytics unavailable" in res["reason"]


# 11. Security Invariant: Token Non-Leakage in Exceptions
def test_token_non_leakage_in_exceptions():
    """
    CRITICAL SECURITY INVARIANT:
    Ensures that if an exception message includes a Cloudflare API token
    or Authorization header, it is automatically sanitized and redacted.
    """
    raw_secret_token = "cfut_SECRET_TOKEN_DO_NOT_LEAK_12345678901234567890"
    raw_err = f"Failed to authenticate with token {raw_secret_token} on endpoint"

    err = AuthenticationError(raw_err, status_code=401)
    err_str = str(err)

    assert raw_secret_token not in err_str
    assert "[REDACTED_CF_TOKEN]" in err_str

    sanitized = sanitize_message(f"Header: Authorization: Bearer {raw_secret_token}")
    assert raw_secret_token not in sanitized
    assert "Bearer [REDACTED" in sanitized
