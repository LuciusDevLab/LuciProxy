"""
Phase 14 Regression Suite - Windows Credential Persistence and Account Rehydration.
Verifies:
1. WindowsCredentialStore native Windows Credential Manager integration.
2. Cross-instance persistence simulating process boundary restarts.
3. Multiple connection isolation and token updating.
4. Nonexistent connection handling (returns None, never crashes).
5. AccountController has_credential and reconnect_connection pipeline.
6. Graceful AccountDetailsScreen behavior when credentials are unavailable.
"""

from datetime import datetime
import sys
from unittest.mock import MagicMock, patch
import pytest

from BuilderV2.security.credentials import (
    WindowsCredentialStore,
    InMemoryCredentialStore,
    TARGET_PREFIX,
)
from BuilderV2.storage.database import LocalDatabase
from BuilderV2.storage.models import ConnectionRecord, AccountRecord
from BuilderV2.ui.controllers.account_controller import AccountController


@pytest.fixture
def mock_db():
    store = InMemoryCredentialStore()
    db = LocalDatabase(db_path=":memory:", credential_store=store)
    yield db
    db.close()


class TestWindowsCredentialStore:
    """Tests WindowsCredentialStore on Windows native vault and simulated environments."""

    @pytest.mark.skipif(sys.platform != "win32", reason="Requires Windows platform")
    def test_native_windows_credential_store_persistence(self):
        """Verifies real Windows Credential Manager persistence across independent instances."""
        test_conn_id = f"conn_reg_test_{int(datetime.utcnow().timestamp())}"
        test_token = "cfut_sample_token_for_persistence_testing_9876543210"

        store_writer = WindowsCredentialStore()
        if not store_writer.is_native:
            pytest.skip("Windows Credential Manager advapi32 not accessible in current environment")

        try:
            # 1. Save token
            store_writer.save_token(test_conn_id, test_token)
            assert store_writer.has_token(test_conn_id) is True
            assert store_writer.get_token(test_conn_id) == test_token

            # 2. Independent second instance simulating application relaunch after exit
            store_reader = WindowsCredentialStore()
            assert store_reader.has_token(test_conn_id) is True
            assert store_reader.get_token(test_conn_id) == test_token

            # 3. Update token
            updated_token = "cfut_updated_token_value_123456789"
            store_writer.save_token(test_conn_id, updated_token)
            assert store_reader.get_token(test_conn_id) == updated_token

            # 4. Delete token
            assert store_reader.delete_token(test_conn_id) is True
            assert store_reader.has_token(test_conn_id) is False
            assert store_reader.get_token(test_conn_id) is None
        finally:
            # Clean up
            store_writer.delete_token(test_conn_id)

    @pytest.mark.skipif(sys.platform != "win32", reason="Requires Windows platform")
    def test_native_multiple_connection_isolation(self):
        """Verifies distinct connection IDs do not collide in Windows Credential Manager."""
        ts = int(datetime.utcnow().timestamp())
        conn_1 = f"conn_reg_iso_1_{ts}"
        conn_2 = f"conn_reg_iso_2_{ts}"
        tok_1 = "cfut_iso_token_1_alpha"
        tok_2 = "cfut_iso_token_2_beta"

        store = WindowsCredentialStore()
        if not store.is_native:
            pytest.skip("Windows Credential Manager advapi32 not accessible")

        try:
            store.save_token(conn_1, tok_1)
            store.save_token(conn_2, tok_2)

            assert store.get_token(conn_1) == tok_1
            assert store.get_token(conn_2) == tok_2

            # Delete conn_1 only
            store.delete_token(conn_1)
            assert store.get_token(conn_1) is None
            assert store.get_token(conn_2) == tok_2
        finally:
            store.delete_token(conn_1)
            store.delete_token(conn_2)

    def test_nonexistent_token_returns_none(self):
        """Verifies querying a nonexistent connection ID returns None without error."""
        store = WindowsCredentialStore()
        assert store.get_token("conn_nonexistent_999999999999") is None
        assert store.has_token("conn_nonexistent_999999999999") is False

    def test_save_empty_token_raises_value_error(self):
        """Verifies empty or whitespace token raises ValueError."""
        store = WindowsCredentialStore()
        with pytest.raises(ValueError, match="Cannot save empty token"):
            store.save_token("conn_123", "")
        with pytest.raises(ValueError, match="Cannot save empty token"):
            store.save_token("conn_123", "   ")

    def test_target_prefix_format(self):
        """Ensures canonical TARGET_PREFIX matches LuciProxyManager_CF_."""
        assert TARGET_PREFIX == "LuciProxyManager_CF_"
        store = WindowsCredentialStore()
        assert store._target_name("conn_abc") == "LuciProxyManager_CF_conn_abc"

    @pytest.mark.skipif(sys.platform != "win32", reason="Requires Windows platform")
    def test_localdatabase_process_restart_lifecycle(self, tmp_path):
        """Simulates full application exit and relaunch on Windows with LocalDatabase + WindowsCredentialStore."""
        db_file = tmp_path / "test_lifecycle_manager.db"
        ts = int(datetime.utcnow().timestamp())
        conn_id = f"conn_lifecycle_{ts}"
        tok = "cfut_lifecycle_test_token_9999"

        # Session 1: App launched, connection added, app closed
        store_session1 = WindowsCredentialStore()
        if not store_session1.is_native:
            pytest.skip("Windows Credential Manager advapi32 not accessible")

        db_session1 = LocalDatabase(db_path=str(db_file), credential_store=store_session1)
        now = datetime.utcnow().isoformat() + "Z"
        conn_record = ConnectionRecord(
            connectionId=conn_id,
            displayName="Lifecycle Account",
            status="connected",
            createdAt=now,
            lastVerifiedAt=now,
        )
        db_session1.save_connection(conn_record, token=tok)
        db_session1.close()

        # Session 2: App launched fresh from SQLite file and new WindowsCredentialStore
        store_session2 = WindowsCredentialStore()
        db_session2 = LocalDatabase(db_path=str(db_file), credential_store=store_session2)
        try:
            # Metadata retrieved from SQLite
            saved_conn = db_session2.get_connection(conn_id)
            assert saved_conn is not None
            assert saved_conn.connectionId == conn_id

            # Credential rehydrated from Windows Credential Manager
            ctrl_session2 = AccountController(db_session2)
            assert ctrl_session2.has_credential(conn_id) is True
            assert store_session2.get_token(conn_id) == tok
        finally:
            store_session2.delete_token(conn_id)
            db_session2.close()


class TestAccountControllerCredentialRehydration:
    """Tests AccountController credential verification and reconnect flows."""

    def test_has_credential_detection(self, mock_db):
        """Verifies has_credential correctly reflects vault presence."""
        ctrl = AccountController(mock_db)
        conn_id = "conn_det_001"

        assert ctrl.has_credential(conn_id) is False

        mock_db.credential_store.save_token(conn_id, "cfut_valid_test_token")
        assert ctrl.has_credential(conn_id) is True

        mock_db.credential_store.delete_token(conn_id)
        assert ctrl.has_credential(conn_id) is False

    @patch("BuilderV2.ui.controllers.account_controller.AccountService")
    @patch("BuilderV2.ui.controllers.account_controller.CloudflareClient")
    def test_reconnect_connection_success(self, mock_client_cls, mock_service_cls, mock_db):
        """Verifies reconnect_connection verifies token, stores in vault, and updates DB status."""
        conn_id = "conn_recon_001"
        now = datetime.utcnow().isoformat() + "Z"
        conn_record = ConnectionRecord(
            connectionId=conn_id,
            displayName="Test Reconnect Account",
            status="error",
            createdAt=now,
            lastVerifiedAt=now,
        )
        mock_db.save_connection(conn_record)

        # Mock Cloudflare verification
        mock_service = MagicMock()
        mock_verification = MagicMock()
        mock_verification.status = "active"
        mock_service.verify_token.return_value = mock_verification
        mock_service_cls.return_value = mock_service

        ctrl = AccountController(mock_db)
        assert ctrl.has_credential(conn_id) is False

        new_token = "cfut_freshly_reconnected_token_999"
        res = ctrl.reconnect_connection(conn_id, new_token)
        assert res is True

        # Check vault has token
        assert ctrl.has_credential(conn_id) is True
        assert mock_db.credential_store.get_token(conn_id) == new_token

        # Check connection status updated in DB
        reloaded = mock_db.get_connection(conn_id)
        assert reloaded is not None
        assert reloaded.status == "connected"

    @patch("BuilderV2.ui.controllers.account_controller.AccountService")
    @patch("BuilderV2.ui.controllers.account_controller.CloudflareClient")
    def test_reconnect_connection_invalid_token(self, mock_client_cls, mock_service_cls, mock_db):
        """Verifies reconnect_connection fails if Cloudflare token verification is not active."""
        conn_id = "conn_recon_bad"
        ctrl = AccountController(mock_db)

        mock_service = MagicMock()
        mock_verification = MagicMock()
        mock_verification.status = "invalid"
        mock_service.verify_token.return_value = mock_verification
        mock_service_cls.return_value = mock_service

        with pytest.raises(ValueError, match="Token verification status is 'invalid'"):
            ctrl.reconnect_connection(conn_id, "cfut_invalid_token")

        assert ctrl.has_credential(conn_id) is False

    def test_reconnect_empty_token_raises(self, mock_db):
        ctrl = AccountController(mock_db)
        with pytest.raises(ValueError, match="Cloudflare API Token is required"):
            ctrl.reconnect_connection("conn_test", "")


class TestAccountDetailsMissingCredentialResilience:
    """Verifies that missing credentials in controllers do not cause hard unhandled crashes."""

    def test_get_account_summary_returns_unavailable_when_token_missing(self, mock_db):
        ctrl = AccountController(mock_db)
        summary = ctrl.get_account_summary("conn_unrehydrated", "acc_123")
        assert summary["workers_count"] == 0
        assert summary["d1_count"] == 0
        assert summary["requests"] == "Unavailable"
        assert summary["quota"] == "Unavailable"
        assert summary["requests_num"] is None
        assert summary["quota_num"] is None
