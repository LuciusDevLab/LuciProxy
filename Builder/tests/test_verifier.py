"""
Tests for DeploymentVerifier and VerificationReport.
"""

from unittest.mock import MagicMock, patch
import requests

from src.validation.verifier import DeploymentVerifier
from src.cloudflare.client import CloudflareClient


def test_verifier_all_endpoints_pass():
    verifier = DeploymentVerifier("https://luciproxy-gate.workers.dev")

    # Mock session.get
    def mock_get(url, **kwargs):
        resp = MagicMock(spec=requests.Response)
        resp.status_code = 200
        if "dash" in url:
            resp.text = "<html>LuciProxy Dashboard View</html>"
        elif "share-settings" in url:
            resp.text = "eyJwb3J0cyI6IFs0NDMsIDg0NDNdfQ=="
        elif "raw" in url:
            resp.text = "dmxlc3M6Ly8xMTE="
        else:
            resp.text = "OK"
        return resp

    verifier.session.get = mock_get

    # Mock client for D1 health
    mock_client = MagicMock(spec=CloudflareClient)
    mock_client.execute_d1_query.return_value = [{"ping": 1}]
    verifier.client = mock_client

    report = verifier.run_all_checks(
        api_route="sync",
        account_id="acc_123",
        database_id="d1_123"
    )

    assert report.all_passed is True
    assert len(report.checks) == 5
    summary = report.summary()
    assert "ALL CHECKS PASSED" in summary


def test_verifier_endpoint_failure():
    verifier = DeploymentVerifier("https://unreachable-worker.workers.dev")

    def mock_get_fail(url, **kwargs):
        raise requests.ConnectionError("Failed to connect")

    verifier.session.get = mock_get_fail

    report = verifier.run_all_checks()
    assert report.all_passed is False
    assert report.checks[0].passed is False


def test_verifier_admin_auth_success():
    """Verify check_admin_auth passes when endpoint returns success=True."""
    verifier = DeploymentVerifier("https://luciproxy-gate.workers.dev")
    mock_resp = MagicMock(spec=requests.Response)
    mock_resp.status_code = 200
    mock_resp.json.return_value = {"success": True, "version": "1.0.0"}
    verifier.session.post = MagicMock(return_value=mock_resp)

    res = verifier.check_admin_auth(api_route="sync", master_key="my_secret_key_123")
    assert res.passed is True
    assert res.status_code == 200
    assert "verified successfully" in res.details
    assert "my_secret_key_123" not in res.details  # Zero secret leakage in logs


def test_verifier_admin_auth_failure():
    """Verify check_admin_auth fails when endpoint rejects credentials."""
    verifier = DeploymentVerifier("https://luciproxy-gate.workers.dev")
    mock_resp = MagicMock(spec=requests.Response)
    mock_resp.status_code = 401
    mock_resp.json.return_value = {"success": False, "error": "Invalid credentials"}
    verifier.session.post = MagicMock(return_value=mock_resp)

    res = verifier.check_admin_auth(api_route="sync", master_key="wrong_key")
    assert res.passed is False
    assert res.status_code == 401
    assert "rejected" in res.details
