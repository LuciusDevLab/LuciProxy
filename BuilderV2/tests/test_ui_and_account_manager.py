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
from PySide6.QtWidgets import QApplication, QLabel, QProgressBar

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
from BuilderV2.ui.screens.account_details_screen import AccountDetailsScreen
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
    """Validates Home screen action buttons, empty state, and account cards."""
    screen = HomeScreen()
    assert screen.btn_add_account is not None
    assert screen.btn_create_worker is not None
    assert screen.btn_update_worker is not None
    assert "+ Add Account" in screen.btn_add_account.text()
    assert "+ Create Worker" in screen.btn_create_worker.text()
    assert "Update Worker" in screen.btn_update_worker.text()

    # Empty state rendering
    screen.set_accounts([])
    assert screen.cards_layout.count() > 0

    # Populated state rendering
    sample_accounts = [
        {
            "connection_id": "c_1",
            "connection_name": "Primary Conn",
            "account_id": "acc_123456789",
            "account_name": "Prod Account",
            "workers_count": 3,
            "d1_count": 2,
            "requests": "1,500",
            "requests_num": 1500,
        }
    ]
    screen.set_accounts(sample_accounts)
    assert screen.cards_layout.count() >= 1


def test_main_window_shell_navigation(qapp, temp_db):
    """Validates Main application shell focused navigation (Home <-> Account Details)."""
    win = MainWindow(temp_db)
    assert win.stack.count() == 2  # Screen 0: Home, Screen 1: Account Details
    assert win.stack.currentIndex() == 0

    # Open Account Details
    sample_acc = {
        "connection_id": "c_test",
        "account_id": "acc_test",
        "account_name": "Test Acc",
        "connection_name": "Conn Test",
    }
    win._open_account_details(sample_acc)
    assert win.stack.currentIndex() == 1
    assert "Test Acc" in win.account_details_screen.lbl_title.text()

    # Return to Home
    win._return_to_home()
    assert win.stack.currentIndex() == 0

    from PySide6.QtCore import QThreadPool
    QThreadPool.globalInstance().waitForDone(2000)


def test_d1_database_correlation(temp_db):
    """Validates partitioning of D1 databases into linked and unassigned."""
    d1_ctrl = D1Controller(temp_db)
    databases = [
        {"uuid": "uuid-db-1", "name": "luci-proxy-db", "num_tables": 3, "file_size": 16384},
        {"uuid": "uuid-db-2", "name": "orphan-db", "num_tables": 1, "file_size": 8192},
    ]
    workers = [
        {
            "name": "luci-proxy",
            "d1_bindings": [
                {"database_id": "uuid-db-1", "binding_name": "IOT_DB", "database_name": "luci-proxy-db"}
            ]
        }
    ]

    partitioned = d1_ctrl.correlate_d1_databases(databases, workers)
    assert len(partitioned["linked"]) == 1
    assert len(partitioned["unassigned"]) == 1
    assert partitioned["linked"][0]["name"] == "luci-proxy-db"
    assert partitioned["linked"][0]["worker_name"] == "luci-proxy"
    assert partitioned["unassigned"][0]["name"] == "orphan-db"
    assert partitioned["unassigned"][0]["status"] == "Unassigned"


# =============================================================================
# 5. REQUEST USAGE & QUOTA TRUTHFULNESS REGRESSION TESTS
# =============================================================================

def test_account_details_real_usage_and_real_quota(qapp, temp_db):
    """
    Scenario 1: Real usage + Real quota.
    When authoritative API returns both usage and an explicit quota denominator,
    the UI must display 'X / Y', set progress bar bounds to Y, and show 'Quota: Y requests'.
    """
    account_ctrl = AccountController(temp_db)
    worker_ctrl = WorkerController(temp_db)
    d1_ctrl = D1Controller(temp_db)
    screen = AccountDetailsScreen(account_ctrl, worker_ctrl, d1_ctrl)

    mock_data = {
        "summary": {
            "workers_count": 2,
            "d1_count": 1,
            "requests": "1,250",
            "requests_num": 1250,
            "quota": "500,000",
            "quota_num": 500000,
        },
        "workers": [],
        "d1_partitioned": {"linked": [], "unassigned": []},
    }

    screen._on_data_loaded(mock_data)

    assert screen.lbl_req_count.text() == "1,250 / 500,000"
    assert "Quota: 500,000 requests" in screen.lbl_quota_subtitle.text()
    assert not screen.prog_requests.isHidden()
    assert screen.prog_requests.maximum() == 500000
    assert screen.prog_requests.value() == 1250
    assert "100,000" not in screen.lbl_req_count.text()
    assert "100,000" not in screen.lbl_quota_subtitle.text()


def test_account_details_usage_with_unavailable_quota(qapp, temp_db):
    """
    Scenario 2: Usage with unavailable quota.
    When API returns real usage but NO quota denominator, the UI must NEVER invent
    or assume 100,000. It must display 'Requests: X' and 'Quota: Unavailable',
    and hide the progress bar.
    """
    account_ctrl = AccountController(temp_db)
    worker_ctrl = WorkerController(temp_db)
    d1_ctrl = D1Controller(temp_db)
    screen = AccountDetailsScreen(account_ctrl, worker_ctrl, d1_ctrl)

    mock_data = {
        "summary": {
            "workers_count": 2,
            "d1_count": 1,
            "requests": "1,250",
            "requests_num": 1250,
            "quota": "Unavailable",
            "quota_num": None,
        },
        "workers": [],
        "d1_partitioned": {"linked": [], "unassigned": []},
    }

    screen._on_data_loaded(mock_data)

    assert screen.lbl_req_count.text() == "1,250"
    assert screen.lbl_quota_subtitle.text() == "Quota: Unavailable"
    assert screen.prog_requests.isHidden()
    assert "100,000" not in screen.lbl_req_count.text()
    assert "100,000" not in screen.lbl_quota_subtitle.text()


def test_account_details_api_failure(qapp, temp_db):
    """
    Scenario 3: API failure / metrics unavailable.
    When metrics cannot be fetched, UI must display 'Unavailable' for requests and quota,
    and progress bar must remain hidden.
    """
    account_ctrl = AccountController(temp_db)
    worker_ctrl = WorkerController(temp_db)
    d1_ctrl = D1Controller(temp_db)
    screen = AccountDetailsScreen(account_ctrl, worker_ctrl, d1_ctrl)

    mock_data = {
        "summary": {
            "workers_count": 0,
            "d1_count": 0,
            "requests": "Unavailable",
            "requests_num": None,
            "quota": "Unavailable",
            "quota_num": None,
        },
        "workers": [],
        "d1_partitioned": {"linked": [], "unassigned": []},
    }

    screen._on_data_loaded(mock_data)

    assert screen.lbl_req_count.text() == "Unavailable"
    assert screen.lbl_quota_subtitle.text() == "Quota: Unavailable"
    assert screen.prog_requests.isHidden()


def test_account_details_zero_usage(qapp, temp_db):
    """
    Scenario 4: Zero usage.
    Handles zero usage correctly without confusing it with API failure.
    - 4A: Zero usage + unavailable quota -> '0', 'Quota: Unavailable', progress hidden.
    - 4B: Zero usage + real quota -> '0 / 200,000', 'Quota: 200,000 requests', progress visible at 0.
    """
    account_ctrl = AccountController(temp_db)
    worker_ctrl = WorkerController(temp_db)
    d1_ctrl = D1Controller(temp_db)
    screen = AccountDetailsScreen(account_ctrl, worker_ctrl, d1_ctrl)

    # 4A: Zero usage + unavailable quota
    mock_data_4a = {
        "summary": {
            "workers_count": 1,
            "d1_count": 1,
            "requests": "0",
            "requests_num": 0,
            "quota": "Unavailable",
            "quota_num": None,
        },
        "workers": [],
        "d1_partitioned": {"linked": [], "unassigned": []},
    }
    screen._on_data_loaded(mock_data_4a)
    assert screen.lbl_req_count.text() == "0"
    assert screen.lbl_quota_subtitle.text() == "Quota: Unavailable"
    assert screen.prog_requests.isHidden()

    # 4B: Zero usage + real quota
    mock_data_4b = {
        "summary": {
            "workers_count": 1,
            "d1_count": 1,
            "requests": "0",
            "requests_num": 0,
            "quota": "200,000",
            "quota_num": 200000,
        },
        "workers": [],
        "d1_partitioned": {"linked": [], "unassigned": []},
    }
    screen._on_data_loaded(mock_data_4b)
    assert screen.lbl_req_count.text() == "0 / 200,000"
    assert "Quota: 200,000 requests" in screen.lbl_quota_subtitle.text()
    assert not screen.prog_requests.isHidden()
    assert screen.prog_requests.maximum() == 200000
    assert screen.prog_requests.value() == 0


def test_home_screen_quota_rendering_truth(qapp):
    """
    Validates that HomeScreen account cards render truthful request metrics
    and never inject a hardcoded 100,000 quota.
    """
    screen = HomeScreen()

    # Case A: Real usage without quota
    screen.set_accounts([
        {
            "connection_id": "c_1",
            "connection_name": "Conn",
            "account_id": "acc_1",
            "account_name": "Acc 1",
            "workers_count": 1,
            "d1_count": 1,
            "requests": "4,200",
            "requests_num": 4200,
            "quota": "Unavailable",
            "quota_num": None,
        }
    ])
    # Card rendered without invented 100,000 progress bar
    card = screen.cards_layout.itemAt(0).widget()
    labels = card.findChildren(QLabel)
    all_text = " ".join(l.text() for l in labels)
    assert "4,200" in all_text
    assert "100,000" not in all_text
    assert "Quota: Unavailable" in all_text
    progress_bars = card.findChildren(QProgressBar)
    assert len(progress_bars) == 0

    # Case B: Real usage with real quota
    screen.set_accounts([
        {
            "connection_id": "c_2",
            "connection_name": "Conn",
            "account_id": "acc_2",
            "account_name": "Acc 2",
            "workers_count": 1,
            "d1_count": 1,
            "requests": "4,200",
            "requests_num": 4200,
            "quota": "1,000,000",
            "quota_num": 1000000,
        }
    ])
    card_b = screen.cards_layout.itemAt(0).widget()
    labels_b = card_b.findChildren(QLabel)
    all_text_b = " ".join(l.text() for l in labels_b)
    assert "4,200 / 1,000,000" in all_text_b
    progress_bars_b = card_b.findChildren(QProgressBar)
    assert len(progress_bars_b) == 1
    assert progress_bars_b[0].maximum() == 1000000
    assert progress_bars_b[0].value() == 4200


def test_account_controller_data_flow_with_analytics_mock(temp_db, monkeypatch):
    """
    Traces complete data flow: AnalyticsService -> AccountController -> UI dict.
    Proves controller correctly maps all 4 states without inventing quota.
    """
    from BuilderV2.cloudflare.analytics_service import AnalyticsService

    ctrl = AccountController(temp_db)
    conn = ConnectionRecord(connectionId="c_flow", displayName="Flow Conn", status="connected")
    temp_db.save_connection(conn, token="tok_flow")
    temp_db.save_account(AccountRecord(accountId="acc_flow", connectionId="c_flow", accountName="Flow Acc"))

    # State 1: Real usage + Real quota
    def mock_invocations_state1(self, account_id, script_name=None, hours=24):
        return {"available": True, "requests": 5000, "quota": 250000}
    monkeypatch.setattr(AnalyticsService, "get_worker_invocations", mock_invocations_state1)
    s1 = ctrl.get_account_summary("c_flow", "acc_flow")
    assert s1["requests_num"] == 5000
    assert s1["requests"] == "5,000"
    assert s1["quota_num"] == 250000
    assert s1["quota"] == "250,000"

    # State 2: Real usage + Unavailable quota
    def mock_invocations_state2(self, account_id, script_name=None, hours=24):
        return {"available": True, "requests": 5000, "quota": None}
    monkeypatch.setattr(AnalyticsService, "get_worker_invocations", mock_invocations_state2)
    s2 = ctrl.get_account_summary("c_flow", "acc_flow")
    assert s2["requests_num"] == 5000
    assert s2["requests"] == "5,000"
    assert s2["quota_num"] is None
    assert s2["quota"] == "Unavailable"

    # State 3: API failure
    def mock_invocations_state3(self, account_id, script_name=None, hours=24):
        return {"available": False, "requests": None, "quota": None, "reason": "GraphQL Error"}
    monkeypatch.setattr(AnalyticsService, "get_worker_invocations", mock_invocations_state3)
    s3 = ctrl.get_account_summary("c_flow", "acc_flow")
    assert s3["requests_num"] is None
    assert s3["requests"] == "Unavailable"
    assert s3["quota_num"] is None
    assert s3["quota"] == "Unavailable"

    # State 4: Zero usage
    def mock_invocations_state4(self, account_id, script_name=None, hours=24):
        return {"available": True, "requests": 0, "quota": None}
    monkeypatch.setattr(AnalyticsService, "get_worker_invocations", mock_invocations_state4)
    s4 = ctrl.get_account_summary("c_flow", "acc_flow")
    assert s4["requests_num"] == 0
    assert s4["requests"] == "0"
    assert s4["quota_num"] is None
    assert s4["quota"] == "Unavailable"


