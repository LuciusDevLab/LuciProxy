"""
Tests for D1 Relational SQLite Database Manager and REST lifecycle.
"""

from unittest.mock import MagicMock
import pytest

from src.cloudflare.client import CloudflareClient
from src.cloudflare.exceptions import CloudflareError
from src.resources.d1_manager import D1Manager, SCHEMA_SQL, VERIFY_TABLE_SQL


def test_d1_manager_create_and_initialize_success():
    """Verify standard happy-path D1 database creation, DDL execution, and verification."""
    mock_client = MagicMock(spec=CloudflareClient)
    mock_client.create_d1_database.return_value = {
        "uuid": "test-d1-uuid-1234",
        "name": "amber-finch-4827"
    }
    # Mock schema verification response
    mock_client.execute_d1_query.side_effect = [
        # Call 1: DDL schema execution
        [{"success": True}],
        # Call 2: SELECT name FROM sqlite_master WHERE type='table' AND name='kv_store';
        [{"results": [{"name": "kv_store"}]}]
    ]

    manager = D1Manager(mock_client, "acc_123")
    uuid = manager.create_and_initialize_database("amber-finch-4827")

    assert uuid == "test-d1-uuid-1234"
    mock_client.create_d1_database.assert_called_once_with("acc_123", "amber-finch-4827")
    assert mock_client.execute_d1_query.call_count == 2


def test_d1_manager_create_missing_uuid_raises():
    """Verify that CloudflareError is raised if API response omits the UUID."""
    mock_client = MagicMock(spec=CloudflareClient)
    mock_client.create_d1_database.return_value = {"name": "test-db"}  # Missing uuid

    manager = D1Manager(mock_client, "acc_123")
    with pytest.raises(CloudflareError, match="Failed to obtain UUID"):
        manager.create_and_initialize_database("test-db")


def test_d1_manager_schema_verification_failure_raises():
    """Verify that CloudflareError is raised if table verification fails after creation."""
    mock_client = MagicMock(spec=CloudflareClient)
    mock_client.create_d1_database.return_value = {"uuid": "test-uuid-999"}
    # Mock schema verification returning empty results
    mock_client.execute_d1_query.side_effect = [
        [{"success": True}],  # DDL execution
        [{"results": []}]     # Table check returns no tables
    ]

    manager = D1Manager(mock_client, "acc_123")
    with pytest.raises(CloudflareError, match="failed schema verification"):
        manager.create_and_initialize_database("test-db")


def test_d1_manager_verify_health():
    """Verify database health ping functionality."""
    mock_client = MagicMock(spec=CloudflareClient)
    mock_client.execute_d1_query.return_value = [{"results": [{"ping": 1}]}]

    manager = D1Manager(mock_client, "acc_123")
    assert manager.verify_health("test-uuid-123") is True

    # When query raises an error
    mock_client.execute_d1_query.side_effect = Exception("Network error")
    assert manager.verify_health("test-uuid-123") is False


def test_d1_manager_ensure_database_with_existing_id():
    """Verify ensure_database reuses and initializes existing ID when provided."""
    mock_client = MagicMock(spec=CloudflareClient)
    mock_client.execute_d1_query.return_value = [{"success": True}]

    manager = D1Manager(mock_client, "acc_123")
    uuid = manager.ensure_database("amber-finch", existing_id="preset-uuid-456")

    assert uuid == "preset-uuid-456"
    mock_client.create_d1_database.assert_not_called()


def test_d1_manager_get_master_key_found():
    """Verify get_master_key parses and extracts masterKey from D1 sys_config record."""
    mock_client = MagicMock(spec=CloudflareClient)
    mock_client.execute_d1_query.return_value = [
        {"results": [{"value": '{"name": "LuciProxy", "masterKey": "0123456789abcdef01234567"}'}]}
    ]

    manager = D1Manager(mock_client, "acc_123")
    key = manager.get_master_key("d1_uuid_test")

    assert key == "0123456789abcdef01234567"
    mock_client.execute_d1_query.assert_called_once()
    assert "SELECT value FROM kv_store WHERE key = 'sys_config'" in mock_client.execute_d1_query.call_args[1]["sql"]


def test_d1_manager_get_master_key_not_found():
    """Verify get_master_key returns None when sys_config record does not exist."""
    mock_client = MagicMock(spec=CloudflareClient)
    mock_client.execute_d1_query.return_value = [{"results": []}]

    manager = D1Manager(mock_client, "acc_123")
    key = manager.get_master_key("d1_uuid_test")

    assert key is None


def test_d1_manager_seed_master_key_creates_and_inserts():
    """Verify seed_master_key generates and inserts a fresh 24-char masterKey when uninitialized."""
    mock_client = MagicMock(spec=CloudflareClient)
    # Call 1: get_master_key returns empty
    # Call 2: INSERT query succeeds
    # Call 3: readback get_master_key succeeds
    mock_client.execute_d1_query.side_effect = [
        [{"results": []}],
        [{"success": True}],
        [{"results": []}]
    ]

    manager = D1Manager(mock_client, "acc_123")
    key = manager.seed_master_key("d1_uuid_test")

    assert len(key) == 24
    assert all(c in "0123456789abcdef" for c in key)
    assert mock_client.execute_d1_query.call_count == 3
    insert_call = mock_client.execute_d1_query.call_args_list[1]
    assert "INSERT INTO kv_store (key, value)" in insert_call[1]["sql"]
    params = insert_call[1]["params"]
    assert len(params) == 1
    assert key not in params[0], "Plaintext masterKey must not be stored in D1 sys_config payload!"
    assert "masterKey" not in params[0], "masterKey field must not be stored in D1 sys_config payload!"


def test_d1_manager_seed_master_key_preserves_existing():
    """Verify seed_master_key preserves and returns existing masterKey without overwriting."""
    mock_client = MagicMock(spec=CloudflareClient)
    mock_client.execute_d1_query.return_value = [
        {"results": [{"value": '{"masterKey": "pre_existing_admin_key"}'}]}
    ]

    manager = D1Manager(mock_client, "acc_123")
    key = manager.seed_master_key("d1_uuid_test")

    assert key == "pre_existing_admin_key"
    mock_client.execute_d1_query.assert_called_once()  # Only select, no insert
