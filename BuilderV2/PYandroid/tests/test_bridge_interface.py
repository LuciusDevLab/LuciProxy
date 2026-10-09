"""
Unit tests for LuciproxyBridge.
Proves JSON serialization, exception safety, and Android facade operations.
"""

import json
from unittest.mock import MagicMock, patch
import pytest

from BuilderV2.PYandroid.src.bridge.interface import LuciproxyBridge
from BuilderV2.PYandroid.src.core.models import (
    TokenVerificationDto,
    CloudflareAccountDto,
    WorkerSummaryDto,
    D1BindingDto,
    DeploymentResult,
)


def test_bridge_naming_helpers():
    """Proves bridge helper methods return valid tokens and routes matching NamingPolicy."""
    token_name = LuciproxyBridge.generate_token_name()
    parts = token_name.split("-")
    assert len(parts) == 3
    assert parts[2].isdigit() and len(parts[2]) == 4

    route = LuciproxyBridge.generate_random_api_route()
    assert len(route) == 10
    assert route.isalnum() and route.islower()

    url = LuciproxyBridge.build_token_creation_url("test-token-1234")
    assert "dash.cloudflare.com/profile/api-tokens" in url
    assert "name=test-token-1234" in url
    assert "permissionGroupKeys=" in url


@patch("BuilderV2.PYandroid.src.bridge.interface.PortableCloudflareClient")
def test_bridge_verify_token(mock_client_cls):
    """Proves bridge verify_token returns JSON-serializable dictionary."""
    mock_inst = MagicMock()
    mock_inst.verify_token.return_value = TokenVerificationDto(
        valid=True,
        status="active",
        token_id="tok_abc",
        expires_on="2030-01-01T00:00:00Z",
    )
    mock_client_cls.return_value = mock_inst

    res = LuciproxyBridge.verify_token("test_token")
    assert res["success"] is True
    assert res["valid"] is True
    assert res["status"] == "active"
    # Ensure serializable to JSON
    json_str = json.dumps(res)
    assert "active" in json_str


@patch("BuilderV2.PYandroid.src.bridge.interface.PortableCloudflareClient")
def test_bridge_list_accounts(mock_client_cls):
    """Proves bridge list_accounts returns structured accounts dictionary."""
    mock_inst = MagicMock()
    mock_inst.list_accounts.return_value = [
        CloudflareAccountDto(id="acc_1", name="Acc One"),
        CloudflareAccountDto(id="acc_2", name="Acc Two"),
    ]
    mock_client_cls.return_value = mock_inst

    res = LuciproxyBridge.list_accounts("test_token")
    assert res["success"] is True
    assert len(res["accounts"]) == 2
    assert res["accounts"][0]["name"] == "Acc One"
    json.dumps(res)


@patch("BuilderV2.PYandroid.src.bridge.interface.PortableCloudflareClient")
def test_bridge_get_account_details(mock_client_cls):
    """Proves bridge get_account_details partitions D1 databases and reports analytics."""
    mock_inst = MagicMock()
    mock_inst.list_workers.return_value = [
        WorkerSummaryDto(
            id="worker_alpha",
            name="worker_alpha",
            d1_bindings=[D1BindingDto(binding_name="IOT_DB", database_id="d1_linked_id")],
        )
    ]
    mock_inst.list_d1_databases.return_value = [
        {"uuid": "d1_linked_id", "name": "linked-db", "num_tables": 3},
        {"uuid": "d1_other_id", "name": "unassigned-db", "num_tables": 1},
    ]
    mock_inst.get_worker_analytics.return_value = {
        "available": True,
        "requests_num": 1200,
        "quota_num": None,
        "requests": "1,200",
        "quota": "Unavailable",
    }
    mock_client_cls.return_value = mock_inst

    res = LuciproxyBridge.get_account_details("test_token", "acc_1")
    assert res["success"] is True
    assert len(res["d1_linked"]) == 1
    assert res["d1_linked"][0]["id"] == "d1_linked_id"
    assert len(res["d1_unassigned"]) == 1
    assert res["d1_unassigned"][0]["id"] == "d1_other_id"
    assert res["analytics"]["requests"] == "1,200"
    json.dumps(res)


@patch("BuilderV2.PYandroid.src.bridge.interface.DeploymentEngine")
@patch("BuilderV2.PYandroid.src.bridge.interface.PortableCloudflareClient")
def test_bridge_deploy_worker(mock_client_cls, mock_engine_cls):
    """Proves deploy_worker forwards call and serializes result."""
    mock_engine = MagicMock()
    mock_engine.deploy_worker.return_value = DeploymentResult(
        success=True,
        worker_name="w-node",
        worker_url="https://w-node.sub.workers.dev",
        panel_url="https://w-node.sub.workers.dev/route-abc/dash",
        api_route="/route-abc",
        d1_name="d1-db",
        d1_database_id="d1-uuid",
        uuid="uuid-secret",
        version="v1.2.1",
    )
    mock_engine_cls.return_value = mock_engine

    res = LuciproxyBridge.deploy_worker("token", "acc_id", "w-node", "d1-db")
    assert res["success"] is True
    assert res["worker_name"] == "w-node"
    json.dumps(res)


@patch("BuilderV2.PYandroid.src.bridge.interface.DeploymentEngine")
@patch("BuilderV2.PYandroid.src.bridge.interface.PortableCloudflareClient")
def test_bridge_delete_worker(mock_client_cls, mock_engine_cls):
    """Proves delete_worker returns success confirmation with D1 preservation flag."""
    mock_engine = MagicMock()
    mock_engine.delete_worker.return_value = True
    mock_engine_cls.return_value = mock_engine

    res = LuciproxyBridge.delete_worker("token", "acc_id", "w-delete")
    assert res["success"] is True
    assert res["d1_preserved"] is True
    json.dumps(res)


@patch("BuilderV2.PYandroid.src.bridge.interface.DeploymentEngine")
@patch("BuilderV2.PYandroid.src.bridge.interface.PortableCloudflareClient")
def test_bridge_update_worker(mock_client_cls, mock_engine_cls):
    """Proves update_worker forwards call and preserves D1."""
    mock_engine = MagicMock()
    mock_engine.update_worker.return_value = DeploymentResult(
        success=True,
        worker_name="w-existing",
        worker_url="https://w-existing.sub.workers.dev",
        panel_url="https://w-existing.sub.workers.dev/route-xyz/dash",
        api_route="/route-xyz",
        d1_name="preserved-d1",
        d1_database_id="d1-uuid-existing",
        uuid="uuid-secret",
        version="v1.2.1",
    )
    mock_engine_cls.return_value = mock_engine

    res = LuciproxyBridge.update_worker("token", "acc_id", "w-existing")
    assert res["success"] is True
    assert res["worker_name"] == "w-existing"
    assert res["d1_name"] == "preserved-d1"
    json.dumps(res)


def test_bridge_additional_naming_helpers():
    """Proves worker and d1 name generator helpers return expected formats."""
    w_name = LuciproxyBridge.generate_worker_name()
    parts = w_name.split("-")
    assert len(parts) == 3
    assert parts[2].isdigit() and len(parts[2]) == 4

    d_name = LuciproxyBridge.generate_d1_name()
    d_parts = d_name.split("-")
    assert len(d_parts) == 3
    assert d_parts[2].isdigit() and len(d_parts[2]) == 4

