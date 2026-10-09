"""
Unit and regression tests for Phase 15:
- Verifies UpdateWorkerDialog and DeleteWorkerDialog constructors and call sites.
- Verifies AccountDetailsScreen._open_update_worker and _open_delete_worker.
- Proves no TypeError on dialog launch.
- Validates D1 preservation guarantees during update and delete.
"""

from unittest.mock import MagicMock, patch
import pytest
from PySide6.QtWidgets import QApplication

from BuilderV2.security.credentials import InMemoryCredentialStore
from BuilderV2.storage.database import LocalDatabase
from BuilderV2.storage.models import ConnectionRecord, AccountRecord
from BuilderV2.ui.controllers.account_controller import AccountController
from BuilderV2.ui.controllers.worker_controller import WorkerController
from BuilderV2.ui.controllers.d1_controller import D1Controller
from BuilderV2.ui.dialogs.update_worker_dialog import UpdateWorkerDialog
from BuilderV2.ui.dialogs.delete_worker_dialog import DeleteWorkerDialog
from BuilderV2.ui.screens.account_details_screen import AccountDetailsScreen


@pytest.fixture(scope="session")
def qapp():
    app = QApplication.instance()
    if app is None:
        app = QApplication(["-platform", "offscreen"])
    return app


@pytest.fixture
def temp_db(tmp_path):
    db_file = tmp_path / "test_p15.db"
    store = InMemoryCredentialStore()
    db = LocalDatabase(db_path=str(db_file), credential_store=store)
    yield db
    db.close()


def test_update_worker_dialog_constructor(qapp, temp_db):
    """Proves UpdateWorkerDialog instantiates cleanly with account_ctrl and worker_ctrl."""
    account_ctrl = AccountController(temp_db)
    worker_ctrl = WorkerController(temp_db, temp_db.credential_store)

    conn = ConnectionRecord(connectionId="conn_1", displayName="Test Conn", status="connected")
    temp_db.save_connection(conn, token="tok_1")
    acc = AccountRecord(accountId="acc_1", connectionId="conn_1", accountName="My Account")
    temp_db.save_account(acc)

    with patch.object(UpdateWorkerDialog, "_load_accounts"):
        dialog = UpdateWorkerDialog(
            account_ctrl=account_ctrl,
            worker_ctrl=worker_ctrl,
            preselected_account_id="acc_1",
            preselected_worker_name="worker-alpha",
        )
        assert dialog.account_ctrl is account_ctrl
        assert dialog.worker_ctrl is worker_ctrl
        assert dialog.preselected_account_id == "acc_1"
        assert dialog.preselected_worker_name == "worker-alpha"
        dialog.close()


def test_delete_worker_dialog_constructor(qapp, temp_db):
    """Proves DeleteWorkerDialog instantiates cleanly and binds D1 preservation details."""
    worker_ctrl = WorkerController(temp_db, temp_db.credential_store)

    dialog = DeleteWorkerDialog(
        worker_ctrl=worker_ctrl,
        connection_id="conn_1",
        account_id="acc_1",
        worker_name="worker-alpha",
        d1_display_name="luciproxy-db",
        d1_id="d1-uuid-12345678-abcd",
    )
    assert dialog.worker_ctrl is worker_ctrl
    assert dialog.connection_id == "conn_1"
    assert dialog.account_id == "acc_1"
    assert dialog.worker_name == "worker-alpha"
    assert dialog.d1_display_name == "luciproxy-db"
    assert dialog.d1_id == "d1-uuid-12345678-abcd"
    dialog.close()


def test_account_details_screen_open_update_worker_with_credentials(qapp, temp_db, monkeypatch):
    """Proves AccountDetailsScreen._open_update_worker invokes dialog with matching parameters without TypeError."""
    account_ctrl = AccountController(temp_db)
    worker_ctrl = WorkerController(temp_db, temp_db.credential_store)
    d1_ctrl = D1Controller(temp_db, temp_db.credential_store)

    conn = ConnectionRecord(connectionId="conn_1", displayName="Test Conn", status="connected")
    temp_db.save_connection(conn, token="valid_tok")
    acc = AccountRecord(accountId="acc_1", connectionId="conn_1", accountName="My Account")
    temp_db.save_account(acc)

    screen = AccountDetailsScreen(account_ctrl, worker_ctrl, d1_ctrl)
    screen.load_account(
        connection_id="conn_1",
        account_id="acc_1",
        account_name="My Account",
        connection_name="Test Conn",
    )

    dialog_instances = []
    original_init = UpdateWorkerDialog.__init__

    def mock_init(self, *args, **kwargs):
        original_init(self, *args, **kwargs)
        dialog_instances.append(self)

    monkeypatch.setattr(UpdateWorkerDialog, "__init__", mock_init)
    monkeypatch.setattr(UpdateWorkerDialog, "exec", lambda self: None)

    # Calling _open_update_worker should not raise TypeError
    screen._open_update_worker("worker-prod")

    assert len(dialog_instances) == 1
    dlg = dialog_instances[0]
    assert dlg.account_ctrl is account_ctrl
    assert dlg.worker_ctrl is worker_ctrl
    assert dlg.preselected_account_id == "acc_1"
    assert dlg.preselected_worker_name == "worker-prod"


def test_account_details_screen_open_delete_worker_with_credentials(qapp, temp_db, monkeypatch):
    """Proves AccountDetailsScreen._open_delete_worker extracts D1 metadata and launches DeleteWorkerDialog without TypeError."""
    account_ctrl = AccountController(temp_db)
    worker_ctrl = WorkerController(temp_db, temp_db.credential_store)
    d1_ctrl = D1Controller(temp_db, temp_db.credential_store)

    conn = ConnectionRecord(connectionId="conn_1", displayName="Test Conn", status="connected")
    temp_db.save_connection(conn, token="valid_tok")
    acc = AccountRecord(accountId="acc_1", connectionId="conn_1", accountName="My Account")
    temp_db.save_account(acc)

    screen = AccountDetailsScreen(account_ctrl, worker_ctrl, d1_ctrl)
    screen.load_account(
        connection_id="conn_1",
        account_id="acc_1",
        account_name="My Account",
        connection_name="Test Conn",
    )

    dialog_instances = []
    original_init = DeleteWorkerDialog.__init__

    def mock_init(self, *args, **kwargs):
        original_init(self, *args, **kwargs)
        dialog_instances.append(self)

    monkeypatch.setattr(DeleteWorkerDialog, "__init__", mock_init)
    monkeypatch.setattr(DeleteWorkerDialog, "exec", lambda self: None)

    worker_payload = {
        "name": "worker-omega",
        "d1_display": "omega-db (IOT_DB)",
        "d1_bindings": [
            MagicMock(database_id="d1-uuid-9999-0000", database_name="omega-db", binding_name="IOT_DB")
        ],
    }

    # Calling _open_delete_worker should not raise TypeError
    screen._open_delete_worker(worker_payload)

    assert len(dialog_instances) == 1
    dlg = dialog_instances[0]
    assert dlg.worker_ctrl is worker_ctrl
    assert dlg.connection_id == "conn_1"
    assert dlg.account_id == "acc_1"
    assert dlg.worker_name == "worker-omega"
    assert dlg.d1_display_name == "omega-db"
    assert dlg.d1_id == "d1-uuid-9999-0000"


def test_open_dialogs_when_credential_missing(qapp, temp_db, monkeypatch):
    """Proves that missing credential safely directs the user to reconnect dialog without throwing."""
    account_ctrl = AccountController(temp_db)
    worker_ctrl = WorkerController(temp_db, temp_db.credential_store)
    d1_ctrl = D1Controller(temp_db, temp_db.credential_store)

    conn = ConnectionRecord(connectionId="conn_empty", displayName="Empty Conn", status="connected")
    temp_db.save_connection(conn, token=None)  # No token in vault

    screen = AccountDetailsScreen(account_ctrl, worker_ctrl, d1_ctrl)
    screen.load_account(
        connection_id="conn_empty",
        account_id="acc_empty",
        account_name="Empty Acc",
        connection_name="Empty Conn",
    )

    reconnect_opened = []
    monkeypatch.setattr(screen, "_open_reconnect_dialog", lambda: reconnect_opened.append(True))
    with patch("PySide6.QtWidgets.QMessageBox.information") as mock_info:
        # Both update and delete should intercept missing credential
        screen._open_update_worker("w1")
        assert len(reconnect_opened) == 1
        assert mock_info.called

        screen._open_delete_worker({"name": "w1"})
        assert len(reconnect_opened) == 2


def test_delete_worker_preserves_d1(temp_db):
    """Proves WorkerController.delete_worker calls Cloudflare delete on script only, preserving D1."""
    worker_ctrl = WorkerController(temp_db, temp_db.credential_store)

    conn = ConnectionRecord(connectionId="conn_del", displayName="Conn", status="connected")
    temp_db.save_connection(conn, token="tok_del")

    with patch("BuilderV2.ui.controllers.worker_controller.CloudflareClient") as mock_cf_cls:
        mock_cf_inst = MagicMock()
        mock_cf_cls.return_value = mock_cf_inst

        result = worker_ctrl.delete_worker(
            connection_id="conn_del",
            account_id="acc_del",
            worker_name="target-worker",
        )
        assert result is True

        # Assert only the worker script endpoint was targeted with DELETE
        mock_cf_inst.request.assert_called_once_with(
            "DELETE",
            "/accounts/acc_del/workers/scripts/target-worker",
            step="Delete Worker Script",
        )
