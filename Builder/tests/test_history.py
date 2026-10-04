"""
Tests for DeploymentHistoryStore and persistent deployment tracking.
"""

from pathlib import Path
import tempfile
import pytest

from src.storage.history import DeploymentHistoryStore, DeploymentRecord


def test_history_store_empty():
    """Verify that a fresh store returns empty lists without error."""
    with tempfile.TemporaryDirectory() as tmpdir:
        store = DeploymentHistoryStore(config_dir=Path(tmpdir))
        assert store.list_records() == []
        assert store.get_record("nonexistent") is None


def test_history_store_save_and_list():
    """Verify saving records and listing with newest first."""
    with tempfile.TemporaryDirectory() as tmpdir:
        store = DeploymentHistoryStore(config_dir=Path(tmpdir))

        rec1 = store.save_record(
            account_id="acc_1",
            account_name="Account One",
            worker_name="amber-finch-1111",
            d1_name="calm-river-2222",
            d1_uuid="uuid-1111",
            worker_url="https://amber-finch-1111.test.workers.dev",
            panel_url="https://amber-finch-1111.test.workers.dev/sync/dash",
            luciproxy_version="1.0.0",
            artifact_sha256="hash1111",
            verification_results={"api_ping": True}
        )

        rec2 = store.save_record(
            account_id="acc_2",
            account_name="Account Two",
            worker_name="crystal-peak-3333",
            d1_name="silent-forest-4444",
            d1_uuid="uuid-2222",
            worker_url="https://crystal-peak-3333.test.workers.dev",
            panel_url="https://crystal-peak-3333.test.workers.dev/sync/dash",
            luciproxy_version="1.0.0",
            artifact_sha256="hash2222"
        )

        records = store.list_records()
        assert len(records) == 2
        # rec2 was saved last, so it appears first (most recent first)
        assert records[0].deployment_id == rec2.deployment_id
        assert records[1].deployment_id == rec1.deployment_id

        # Filter by account_id
        filtered_1 = store.list_records(account_id="acc_1")
        assert len(filtered_1) == 1
        assert filtered_1[0].worker_name == "amber-finch-1111"

        filtered_2 = store.list_records(account_id="acc_2")
        assert len(filtered_2) == 1
        assert filtered_2[0].worker_name == "crystal-peak-3333"


def test_history_store_get_and_remove():
    """Verify getting a record by ID and removing it."""
    with tempfile.TemporaryDirectory() as tmpdir:
        store = DeploymentHistoryStore(config_dir=Path(tmpdir))

        rec = store.save_record(
            account_id="acc_1",
            account_name="Account One",
            worker_name="amber-finch-1111",
            d1_name="calm-river-2222",
            d1_uuid="uuid-1111",
            worker_url="https://amber-finch-1111.test.workers.dev",
            panel_url="https://amber-finch-1111.test.workers.dev/sync/dash",
            luciproxy_version="1.0.0",
            artifact_sha256="hash1111"
        )

        fetched = store.get_record(rec.deployment_id)
        assert fetched is not None
        assert fetched.deployment_id == rec.deployment_id
        assert fetched.worker_name == "amber-finch-1111"

        # Remove
        assert store.remove_record(rec.deployment_id) is True
        assert store.get_record(rec.deployment_id) is None
        assert len(store.list_records()) == 0

        # Remove non-existent
        assert store.remove_record("nonexistent") is False


def test_history_store_corrupted_json_recovery():
    """Verify that corrupted JSON is handled without crashing."""
    with tempfile.TemporaryDirectory() as tmpdir:
        cfg_path = Path(tmpdir)
        store = DeploymentHistoryStore(config_dir=cfg_path)
        hist_file = cfg_path / "deployments.json"

        # Corrupt file
        hist_file.write_text("{corrupt-json", encoding="utf-8")

        # Loading should return empty list
        assert store.list_records() == []

        # Saving should overwrite with valid JSON
        store.save_record(
            account_id="acc_1",
            account_name="Account One",
            worker_name="amber-finch-1111",
            d1_name="calm-river-2222",
            d1_uuid="uuid-1111",
            worker_url="https://url",
            panel_url="https://panel",
            luciproxy_version="1.0.0",
            artifact_sha256="hash1111"
        )
        assert len(store.list_records()) == 1
