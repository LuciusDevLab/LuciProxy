"""
Tests for token_validator.py: token verification, account discovery, and capability preflight.
"""

from unittest.mock import MagicMock, patch
import pytest

from src.auth.token_validator import (
    build_token_creation_url,
    get_permission_checklist,
    verify_and_discover_accounts,
    run_capability_preflight,
    validate_and_discover_account,
    OFFICIAL_TOKEN_CREATION_URL,
    PRECONFIGURED_TOKEN_CREATION_URL,
)
from src.cloudflare.client import CloudflareClient
from src.cloudflare.exceptions import AuthenticationError, CloudflareError


from urllib.parse import unquote_plus
from src.resources.naming import is_name_allowed


def test_dynamic_token_creation_url():
    """Verify dynamic token template URL with randomized neutral names and proper encoding."""
    url1 = build_token_creation_url()
    url2 = build_token_creation_url()

    # 1. URL base parameters
    for u in (url1, url2):
        assert "https://dash.cloudflare.com/profile/api-tokens?" in u
        assert "permissionGroupKeys" in u
        assert "accountId=%2A" in u
        assert "zoneId=all" in u
        assert "workers_scripts" in u
        assert "d1" in u
        assert "account_settings" in u
        # Zero hardcoded or fixed names
        assert "LuciProxy+Deployment+Token" not in u
        assert "luciproxy" not in u.lower()

    # 2. Extract and validate random names from URLs
    name1 = unquote_plus(url1.split("&name=")[-1])
    name2 = unquote_plus(url2.split("&name=")[-1])

    assert is_name_allowed(name1)
    assert is_name_allowed(name2)

    # 3. Consecutive calls generate different names with overwhelming probability
    generated_names = {unquote_plus(build_token_creation_url().split("&name=")[-1]) for _ in range(25)}
    assert len(generated_names) >= 20

    # 4. Supports explicit token name parameter
    custom_url = build_token_creation_url("amber-finch-4827")
    assert "&name=amber-finch-4827" in custom_url


def test_permission_checklist_content():
    checklist = get_permission_checklist()
    assert "Workers Scripts" in checklist
    assert "D1" in checklist
    assert "Account Settings" in checklist
    assert "User Details" not in checklist


def test_verify_and_discover_accounts_success():
    with patch("src.auth.token_validator.CloudflareClient") as MockClient:
        client_inst = MockClient.return_value
        client_inst.verify_token.return_value = {"id": "tok_123", "status": "active"}
        client_inst.list_accounts.return_value = [
            {"id": "acc_001", "name": "Primary Org"},
            {"id": "acc_002", "name": "Secondary Org"}
        ]

        user_info, accounts, client = verify_and_discover_accounts("mock_valid_token")

        assert len(accounts) == 2
        assert accounts[0]["id"] == "acc_001"
        assert accounts[1]["id"] == "acc_002"
        assert client == client_inst


def test_verify_and_discover_accounts_with_template_permissions():
    """Verify that a token with ONLY template permissions (no User Details Read) succeeds."""
    with patch("src.auth.token_validator.CloudflareClient") as MockClient:
        client_inst = MockClient.return_value
        # /user/tokens/verify succeeds
        client_inst.verify_token.return_value = {"id": "template_token_456", "status": "active"}
        # /accounts succeeds with Account Settings: Read
        client_inst.list_accounts.return_value = [{"id": "acc_abc", "name": "Template Account"}]
        # If /user is called, it would fail with 403 (User Details Read not granted)
        client_inst.get_user_details.side_effect = AuthenticationError(
            "This endpoint requires 'User Details: Read'.",
            status_code=403
        )

        user_info, accounts, client = verify_and_discover_accounts("template_token_val")

        assert len(accounts) == 1
        assert accounts[0]["id"] == "acc_abc"
        assert user_info["token_id"] == "template_token_456"
        # Ensure get_user_details was NOT even called
        client_inst.get_user_details.assert_not_called()


def test_verify_and_discover_accounts_empty_token():
    with pytest.raises(AuthenticationError) as exc:
        verify_and_discover_accounts("")
    assert "cannot be empty" in str(exc.value)


def test_verify_and_discover_accounts_inactive():
    with patch("src.auth.token_validator.CloudflareClient") as MockClient:
        client_inst = MockClient.return_value
        client_inst.verify_token.return_value = {"id": "tok_123", "status": "disabled"}

        with pytest.raises(AuthenticationError) as exc:
            verify_and_discover_accounts("disabled_token")
        assert "expected 'active'" in str(exc.value)


def test_verify_and_discover_accounts_no_accounts():
    with patch("src.auth.token_validator.CloudflareClient") as MockClient:
        client_inst = MockClient.return_value
        client_inst.verify_token.return_value = {"id": "tok_123", "status": "active"}
        client_inst.list_accounts.return_value = []

        with pytest.raises(CloudflareError) as exc:
            verify_and_discover_accounts("valid_token_no_accounts")
        assert "No Cloudflare accounts accessible" in str(exc.value)


def test_capability_preflight_all_pass():
    client = MagicMock(spec=CloudflareClient)
    client.probe_workers_capability.return_value = (True, None)
    client.probe_d1_capability.return_value = (True, None)
    client.probe_subdomain_capability.return_value = (True, "myzone", None)

    report = run_capability_preflight(client, "acc_123")

    assert report.all_passed is True
    assert report.workers_scripts_ok is True
    assert report.d1_ok is True
    assert report.subdomain_ok is True
    assert report.subdomain == "myzone"
    assert len(report.errors) == 0
    assert "PASS" in report.summary()


def test_capability_preflight_workers_forbidden():
    client = MagicMock(spec=CloudflareClient)
    client.probe_workers_capability.return_value = (False, "Missing 'Workers Scripts: Edit' permission.")
    client.probe_d1_capability.return_value = (True, None)
    client.probe_subdomain_capability.return_value = (True, "myzone", None)

    report = run_capability_preflight(client, "acc_123")

    assert report.all_passed is False
    assert report.workers_scripts_ok is False
    assert report.d1_ok is True
    assert len(report.errors) == 1
    assert "Workers capability check failed" in report.errors[0]
    assert "FAIL" in report.summary()


def test_capability_preflight_d1_forbidden():
    client = MagicMock(spec=CloudflareClient)
    client.probe_workers_capability.return_value = (True, None)
    client.probe_d1_capability.return_value = (False, "Missing 'D1 Read' permission.")
    client.probe_subdomain_capability.return_value = (True, "myzone", None)

    report = run_capability_preflight(client, "acc_123")

    assert report.all_passed is False
    assert report.workers_scripts_ok is True
    assert report.d1_ok is False
    assert len(report.errors) == 1
    assert "D1 capability check failed" in report.errors[0]


def test_capability_preflight_d1_read_ok_write_forbidden():
    """
    Regression Test:
    D1 list/read permission available (GET would succeed), but D1 create/write permission unavailable.
    Preflight MUST NOT claim all deployment capabilities passed.
    """
    client = MagicMock(spec=CloudflareClient)
    client.probe_workers_capability.return_value = (True, None)
    client.probe_d1_capability.return_value = (
        False,
        "Missing 'D1 Write' permission on the target account (POST /accounts/acc_123/d1/database returned HTTP 403 Forbidden)."
    )
    client.probe_subdomain_capability.return_value = (True, "myzone", None)

    report = run_capability_preflight(client, "acc_123")

    # CRITICAL: Must NOT claim passed
    assert report.all_passed is False
    assert report.workers_scripts_ok is True
    assert report.d1_ok is False
    assert report.d1_read_ok is True
    assert report.d1_write_ok is False
    assert len(report.errors) == 1
    assert "D1 Write" in report.errors[0]
    assert "[FAIL] D1 Database (Write)" in report.summary()
    assert "Missing write permission" in report.summary()


def test_validate_and_discover_account_legacy_wrapper():
    with patch("src.auth.token_validator.CloudflareClient") as MockClient:
        client_inst = MockClient.return_value
        client_inst.verify_token.return_value = {"id": "tok_123", "status": "active"}
        client_inst.list_accounts.return_value = [{"id": "acc_leg", "name": "Legacy Org"}]
        client_inst.get_workers_subdomain.return_value = "leg.workers.dev"

        meta, client = validate_and_discover_account("tok")

        assert meta["account_id"] == "acc_leg"
        assert meta["subdomain"] == "leg.workers.dev"
        assert client == client_inst
