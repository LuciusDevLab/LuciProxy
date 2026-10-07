"""
Unit and UI test suite for Phase 5: Account Manager, Core UI, and Multi-Account Isolation.
Covers connection onboarding, credential vault security, D1 binding rendering,
dual-channel version separation, and offscreen PySide6 widget interactions.
"""

from pathlib import Path
import tempfile
from unittest.mock import MagicMock, patch
import pytest

from PySide6.QtCore import Qt
from PySide6.QtWidgets import QApplication

from BuilderV2.security.credentials import InMemoryCredentialStore
from BuilderV2.storage.database import LocalDatabase
from BuilderV2.storage.models import ConnectionRecord, AccountRecord
from BuilderV2.cloudflare.models import (
    TokenVerificationDto,
    CloudflareAccountDto,
    WorkerSummaryDto,
    DiscoveredD1BindingDto,
)
from BuilderV2.ui.controllers.account_controller import AccountController
from BuilderV2.ui.controllers.worker_controller import WorkerController
from BuilderV2.ui.controllers.d1_controller import D1Controller
from BuilderV2.ui.controllers.release_controller import ReleaseController
from BuilderV2.ui.screens.home_screen import HomeScreen
from BuilderV2.ui.screens.accounts_screen import AccountsScreen
from BuilderV2.ui.screens.workers_screen import WorkersScreen
from BuilderV2.ui.screens.settings_screen import SettingsScreen
from BuilderV2.ui.main_window import MainWindow


@pytest.fixture(scope="session")
def qapp():
    """Provides headless offscreen QApplication instance for automated testing."""
    app = QApplication.instance()
    if app is None:
        app = QApplication(["-platform", "offscreen"])
    return app


@pytest.fixture
def temp_db(tmp_path):
    db_file = tmp_path / "test_manager.db"
    store = InMemoryCredentialStore()
    db = LocalDatabase(db_path=str(db_file), credential_store=store)
    yield db
    db.close()


# =============================================================================
# 1. ACCOUNT MANAGER & MULTI-ACCOUNT ISOLATION
# =============================================================================

@patch("BuilderV2.ui.controllers.account_controller.AccountService")
@patch("BuilderV2.ui.controllers.account_controller.CloudflareClient")
def test_add_connection_one_token_multiple_accounts(mock_cf_client, mock_acc_svc_cls, temp_db):
    """
    Validates Section 5 & 6:
    One token -> Multiple Cloudflare accounts discovered and stored.
    Token is stored strictly in credential store, NEVER in SQLite.
    """
    mock_svc = MagicMock()
    mock_svc.verify_token.return_value = TokenVerificationDto(status="active", id="tok-123")
    mock_svc.list_accounts.return_value = [
        CloudflareAccountDto(id="acc-1", name="Personal Account", type="standard"),
        CloudflareAccountDto(id="acc-2", name="Org Account", type="enterprise"),
    ]
    mock_acc_svc_cls.return_value = mock_svc

    ctrl = AccountController(temp_db)
    raw_token = "cfut_secret_token_alpha_1234567890"

    conn = ctrl.add_connection("My Main Connection", raw_token)

    # 1. Connection recorded in SQLite
    conns = ctrl.list_connections()
    assert len(conns) == 1
    assert conns[0].displayName == "My Main Connection"
    assert conns[0].connectionId == conn.connectionId

    # 2. Token stored in vault
    stored_token = temp_db.credential_store.get_token(conn.connectionId)
    assert stored_token == raw_token

    # 3. Two accounts saved in SQLite
    accounts = ctrl.get_accounts_for_connection(conn.connectionId)
    assert len(accounts) == 2
    acc_ids = [a.accountId for a in accounts]
    assert "acc-1" in acc_ids
    assert "acc-2" in acc_ids

    # 4. CRITICAL SECURITY AUDIT: Verify raw token NEVER entered SQLite file
    db_bytes = Path(temp_db.db_path).read_bytes()
    assert raw_token.encode("utf-8") not in db_bytes


@patch("BuilderV2.ui.controllers.account_controller.AccountService")
@patch("BuilderV2.ui.controllers.account_controller.CloudflareClient")
def test_multiple_connections_and_account_isolation(mock_cf_client, mock_acc_svc_cls, temp_db):
    """
    Validates Section 6:
    Many tokens -> Many accounts.
    Guarantees strict isolation between connections.
    """
    mock_svc = MagicMock()
    mock_svc.verify_token.return_value = TokenVerificationDto(status="active", id="tok-ok")

    # Connection 1 has Acc 1
    mock_svc.list_accounts.return_value = [CloudflareAccountDto(id="acc-alpha", name="Alpha Account")]
    mock_acc_svc_cls.return_value = mock_svc

    ctrl = AccountController(temp_db)
    conn1 = ctrl.add_connection("Connection 1", "cfut_token_1_1111111111111111")

    # Connection 2 has Acc 2 & 3
    mock_svc.list_accounts.return_value = [
        CloudflareAccountDto(id="acc-beta-1", name="Beta 1"),
        CloudflareAccountDto(id="acc-beta-2", name="Beta 2"),
    ]
    conn2 = ctrl.add_connection("Connection 2", "cfut_token_2_2222222222222222")

    # Verify separate connections
    all_conns = ctrl.list_connections()
    assert len(all_conns) == 2

    # Verify strict isolation
    c1_accs = ctrl.get_accounts_for_connection(conn1.connectionId)
    assert len(c1_accs) == 1
    assert c1_accs[0].accountId == "acc-alpha"

    c2_accs = ctrl.get_accounts_for_connection(conn2.connectionId)
    assert len(c2_accs) == 2
    assert {a.accountId for a in c2_accs} == {"acc-beta-1", "acc-beta-2"}


def test_logout_removes_token_and_cascades_metadata(temp_db):
    """
    Validates Section 7:
    Logout / Remove Connection deletes token from vault and cascades SQLite data.
    """
    conn_id = "conn_logout_test"
    temp_db.save_connection(
        ConnectionRecord(connectionId=conn_id, displayName="Test Logout", status="connected"),
        token="cfut_logout_token_secret"
    )
    temp_db.save_account(AccountRecord(accountId="acc-to-delete", connectionId=conn_id, accountName="Acc"))

    ctrl = AccountController(temp_db)
    assert temp_db.credential_store.has_token(conn_id) is True
    assert len(ctrl.list_connections()) == 1

    # Execute logout / remove
    ctrl.remove_connection(conn_id)

    # Token wiped from vault
    assert temp_db.credential_store.has_token(conn_id) is False
    assert temp_db.credential_store.get_token(conn_id) is None

    # Metadata removed from SQLite
    assert len(ctrl.list_connections()) == 0
    assert len(ctrl.get_accounts_for_connection(conn_id)) == 0


def test_delete_all_local_data_resets_everything(temp_db):
    """
    Validates Section 8:
    Delete All Local Data purges all tokens, accounts, and resets state.
    """
    temp_db.save_connection(ConnectionRecord(connectionId="c1", displayName="C1"), token="tok1")
    temp_db.save_connection(ConnectionRecord(connectionId="c2", displayName="C2"), token="tok2")
    temp_db.save_account(AccountRecord(accountId="a1", connectionId="c1", accountName="A1"))

    ctrl = AccountController(temp_db)
    assert len(ctrl.list_connections()) == 2
    assert temp_db.credential_store.has_token("c1") is True

    # Nuclear reset
    ctrl.delete_all_local_data()

    assert len(ctrl.list_connections()) == 0
    assert temp_db.credential_store.has_token("c1") is False
    assert temp_db.credential_store.has_token("c2") is False


# =============================================================================
# 2. WORKER CONTROLLER & D1 BINDING RENDERING
# =============================================================================

@patch("BuilderV2.ui.controllers.worker_controller.WorkerService")
@patch("BuilderV2.ui.controllers.worker_controller.D1Service")
@patch("BuilderV2.ui.controllers.worker_controller.CloudflareClient")
def test_worker_d1_binding_rendering_scenarios(mock_cf, mock_d1_cls, mock_wrk_cls, temp_db):
    """
    Validates Section 11:
    - 0 D1 bindings -> "No D1 binding detected"
    - 1 D1 binding -> shows database name and binding name
    - Multiple D1 bindings -> shows ALL bindings, never picks one silently!
    """
    conn_id = "c_worker_test"
    temp_db.save_connection(ConnectionRecord(connectionId=conn_id, displayName="Test"), token="tok_dummy")
    ctrl = WorkerController(temp_db)

    mock_wrk = MagicMock()
    mock_wrk.list_workers.return_value = [
        WorkerSummaryDto(id="w1", name="worker-zero-d1"),
        WorkerSummaryDto(id="w2", name="worker-single-d1"),
        WorkerSummaryDto(id="w3", name="worker-multi-d1"),
    ]

    def mock_discover(account_id, script_name):
        if script_name == "worker-zero-d1":
            return []
        elif script_name == "worker-single-d1":
            return [
                DiscoveredD1BindingDto(
                    binding_name="IOT_DB",
                    database_id="uuid-d1-single",
                    database_name="production-db"
                )
            ]
        elif script_name == "worker-multi-d1":
            return [
                DiscoveredD1BindingDto(
                    binding_name="PRIMARY_DB",
                    database_id="uuid-d1-1",
                    database_name="main-db"
                ),
                DiscoveredD1BindingDto(
                    binding_name="LOGS_DB",
                    database_id="uuid-d1-2",
                    database_name="analytics-db"
                ),
            ]
        return []

    mock_wrk.discover_worker_d1_bindings.side_effect = mock_discover
    mock_wrk_cls.return_value = mock_wrk

    results = ctrl.list_workers(conn_id, "acc-123")
    assert len(results) == 3

    # Case 1: Zero bindings
    assert results[0]["name"] == "worker-zero-d1"
    assert results[0]["d1_display"] == "No D1 binding detected"

    # Case 2: Single binding
    assert results[1]["name"] == "worker-single-d1"
    assert results[1]["d1_display"] == "production-db (IOT_DB)"
    assert results[1]["is_luciproxy"] is True

    # Case 3: Multiple bindings (Must list all!)
    assert results[2]["name"] == "worker-multi-d1"
    assert "2 Bindings:" in results[2]["d1_display"]
    assert "main-db (PRIMARY_DB)" in results[2]["d1_display"]
    assert "analytics-db (LOGS_DB)" in results[2]["d1_display"]


# =============================================================================
# 3. DUAL-CHANNEL VERSION INDEPENDENCE IN UI
# =============================================================================

@patch("BuilderV2.ui.controllers.release_controller.WorkerReleaseService")
@patch("BuilderV2.ui.controllers.release_controller.ManagerReleaseService")
def test_dual_channel_version_independence(mock_mgr_svc_cls, mock_wrk_svc_cls, temp_db):
    """
    Validates Section 13 & 14:
    Worker release and Manager release are presented independently.
    Legacy v1.2.0 is categorized under Worker channel only.
    Unreleased Manager state gracefully displayed.
    """
    mock_wrk = MagicMock()
    mock_rel_dto = MagicMock()
    mock_rel_dto.tag_name = "v1.2.0"
    mock_wrk.get_latest_worker_release.return_value = mock_rel_dto
    mock_wrk_svc_cls.return_value = mock_wrk

    mock_mgr = MagicMock()
    mock_mgr.get_manager_release_status.return_value = {
        "available": False,
        "message": "No published Manager release available",
        "release": None
    }
    mock_mgr_svc_cls.return_value = mock_mgr

    ctrl = ReleaseController(temp_db)
    status = ctrl.get_version_status()

    assert status["current_manager_version"] == "v2.0.0"
    assert status["latest_manager_version"] == "No published Manager release available"
    assert status["latest_worker_version"] == "v1.2.0"
    assert status["is_legacy_worker"] is True
    assert status["manager_update_available"] is False


# =============================================================================
# 4. HEADLESS PYSIDE6 WIDGET VERIFICATION
# =============================================================================

def test_home_screen_ui_components(qapp):
    """Validates Home screen action buttons and layout."""
    screen = HomeScreen()
    assert screen.btn_create_worker is not None
    assert screen.btn_update_worker is not None
    assert "+ Create Worker" in screen.btn_create_worker.text()
    assert "Update Worker" in screen.btn_update_worker.text()

    # Update metrics and check text
    screen.update_metrics(
        connections_count=2,
        accounts_count=3,
        workers_count=5,
        manager_version="v2.0.0",
        worker_version="v1.2.0",
        github_status="Live OK"
    )
    assert screen.version_badge.text() == "Manager v2.0.0"


def test_accounts_screen_ui_table(qapp, temp_db):
    """Validates Accounts screen connection table population and selection."""
    conn = ConnectionRecord(connectionId="c_ui", displayName="UI Connection", status="connected")
    temp_db.save_connection(conn, token="tok_ui")
    temp_db.save_account(AccountRecord(accountId="a_ui", connectionId="c_ui", accountName="UI Acc"))

    ctrl = AccountController(temp_db)
    screen = AccountsScreen(ctrl)
    screen.load_connections()

    assert screen.table.rowCount() == 1
    assert screen.table.item(0, 0).text() == "UI Connection"
    assert "Connected" in screen.table.item(0, 1).text()
    assert "1 Account" in screen.table.item(0, 2).text()


def test_main_window_shell_navigation(qapp, temp_db):
    """Validates Main application shell and tab switching."""
    win = MainWindow(temp_db)
    assert win.stack.count() == 6  # Home, Workers, D1, Accounts, Analytics, Settings

    # Switch to Workers
    win.btn_nav_workers.click()
    assert win.stack.currentIndex() == 1

    # Switch to Accounts
    win.btn_nav_accounts.click()
    assert win.stack.currentIndex() == 3

    # Switch to Settings
    win.btn_nav_settings.click()
    assert win.stack.currentIndex() == 5

    from PySide6.QtCore import QThreadPool
    QThreadPool.globalInstance().waitForDone(2000)
