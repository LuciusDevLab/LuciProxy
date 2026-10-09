"""
LuciProxy Manager - Phase 12 Windows Regression Tests.
Verifies:
1. Progress region has fixed layout height (no dynamic insertion/removal)
2. Progress updates without layout jump (stable widget geometries)
3. Success reaches 100% and transitions properly
4. Failure reaches terminal state and allows retry/cancel
5. Panel URL contains /sync/dash
6. Trailing slash normalization in Panel URL generation
"""

import sys
import pytest
from unittest.mock import MagicMock

from PySide6.QtWidgets import QApplication

from BuilderV2.deployment.models import DeploymentResult, get_panel_url
from BuilderV2.ui.dialogs.create_worker_dialog import CreateWorkerDialog
from BuilderV2.ui.dialogs.deployment_result_dialog import DeploymentResultDialog


@pytest.fixture(scope="session")
def qapp():
    app = QApplication.instance()
    if app is None:
        app = QApplication(sys.argv)
    return app


# Test 5 & 6: Panel URL construction and trailing slash normalization
def test_panel_url_contains_sync_dash():
    base_url = "https://example.workers.dev"
    panel_url = get_panel_url(base_url)
    assert panel_url == "https://example.workers.dev/sync/dash"


def test_panel_url_trailing_slash_normalization():
    # Base URL with single trailing slash
    assert get_panel_url("https://example.workers.dev/") == "https://example.workers.dev/sync/dash"
    # Base URL with multiple trailing slashes
    assert get_panel_url("https://example.workers.dev///") == "https://example.workers.dev/sync/dash"
    # Base URL already ending with /sync/dash
    assert get_panel_url("https://example.workers.dev/sync/dash") == "https://example.workers.dev/sync/dash"
    assert get_panel_url("https://example.workers.dev/sync/dash/") == "https://example.workers.dev/sync/dash"
    # None or empty
    assert get_panel_url(None) is None
    assert get_panel_url("") is None


def test_deployment_result_model_panel_url():
    res = DeploymentResult(
        success=True,
        action="create",
        worker_name="light-grove-2656",
        worker_url="https://light-grove-2656.lucyrailway01.workers.dev",
        d1_database_id="d1-uuid-1234",
        d1_binding_name="IOT_DB",
        d1_name="ocean-db",
        worker_version="1.2.1",
        source_revision="3aafad1000000000000000000000000000000000",
        bundle_sha256="aabbcc",
        master_key="secret-key-12345"
    )
    assert res.panel_url == "https://light-grove-2656.lucyrailway01.workers.dev/sync/dash"


# Test 1: Progress region has fixed layout height
def test_progress_region_fixed_layout_height(qapp):
    mock_acct_ctrl = MagicMock()
    mock_acct_ctrl.list_all_accounts.return_value = [
        {"account_id": "acc-123", "account_name": "Test Account", "connection_id": "conn-1"}
    ]
    mock_worker_ctrl = MagicMock()

    dlg = CreateWorkerDialog(account_ctrl=mock_acct_ctrl, worker_ctrl=mock_worker_ctrl)
    dlg.show()

    # 1. Progress frame exists and is permanently visible with fixed height
    assert dlg.progress_frame is not None
    assert not dlg.progress_frame.isHidden()
    assert dlg.progress_frame.maximumHeight() == 74
    assert dlg.progress_frame.minimumHeight() == 74
    initial_height = dlg.progress_frame.height()

    # 2. Progress updates do NOT change the frame's height
    dlg._handle_progress_update(3, 9, "Creating D1", "Provisioning D1 database...")
    assert dlg.progress_frame.height() == initial_height

    dlg._handle_progress_update(9, 9, "Finalizing", "Completed.")
    assert dlg.progress_frame.height() == initial_height
    dlg.close()


# Test 2: Progress updates without layout jump
def test_progress_updates_without_layout_jump(qapp):
    mock_acct_ctrl = MagicMock()
    mock_acct_ctrl.list_all_accounts.return_value = [
        {"account_id": "acc-123", "account_name": "Test Account", "connection_id": "conn-1"}
    ]
    mock_worker_ctrl = MagicMock()

    dlg = CreateWorkerDialog(account_ctrl=mock_acct_ctrl, worker_ctrl=mock_worker_ctrl)
    dlg.show()

    # Dialog size remains constant
    dlg_width = dlg.width()
    dlg_height = dlg.height()

    # Progress steps through all 9 stages
    stages = [
        (1, "Resolving Worker Source"),
        (2, "Preparing Resource Names"),
        (3, "Provisioning D1 Database"),
        (4, "Initializing Database Schema"),
        (5, "Uploading Worker Script"),
        (6, "Configuring Worker Secret"),
        (7, "Activating Edge Route"),
        (8, "Verifying Deployment"),
        (9, "Finalizing Deployment"),
    ]

    for step, name in stages:
        dlg._handle_progress_update(step, 9, name, f"Running {name}...")
        expected_pct = int((step / 9) * 100)
        assert dlg.prog_bar.value() == expected_pct
        assert f"{expected_pct}%" in dlg.lbl_step.text()
        # Geometries must never shift or jump
        assert dlg.width() == dlg_width
        assert dlg.height() == dlg_height

    dlg.close()


# Test 3: Success reaches 100%
def test_success_reaches_100_percent(qapp, monkeypatch):
    mock_acct_ctrl = MagicMock()
    mock_acct_ctrl.list_all_accounts.return_value = [
        {"account_id": "acc-123", "account_name": "Test Account", "connection_id": "conn-1"}
    ]
    mock_worker_ctrl = MagicMock()

    dlg = CreateWorkerDialog(account_ctrl=mock_acct_ctrl, worker_ctrl=mock_worker_ctrl)

    res = DeploymentResult(
        success=True,
        action="create",
        worker_name="light-grove-2656",
        worker_url="https://light-grove-2656.workers.dev",
        d1_database_id="d1-uuid-123",
        d1_binding_name="IOT_DB",
        worker_version="1.2.1",
        source_revision="3aafad1000000000000000000000000000000000",
        bundle_sha256="hash123",
        master_key="key123"
    )

    # Monkeypatch DeploymentResultDialog.exec so it does not block the test
    monkeypatch.setattr(DeploymentResultDialog, "exec", lambda self: 1)

    # Emit success
    dlg._on_deploy_success(res)
    assert dlg.prog_bar.value() == 100
    assert "100%" in dlg.lbl_step.text()
    assert "✓ Deployment Complete" in dlg.lbl_step.text()



# Test 4: Failure reaches terminal state and re-enables controls
def test_failure_reaches_terminal_state(qapp):
    mock_acct_ctrl = MagicMock()
    mock_acct_ctrl.list_all_accounts.return_value = [
        {"account_id": "acc-123", "account_name": "Test Account", "connection_id": "conn-1"}
    ]
    mock_worker_ctrl = MagicMock()

    dlg = CreateWorkerDialog(account_ctrl=mock_acct_ctrl, worker_ctrl=mock_worker_ctrl)

    # Simulate in-progress step 5 failure
    dlg._handle_progress_update(5, 9, "Uploading Worker Script", "Uploading...")
    assert dlg.prog_bar.value() == int((5 / 9) * 100)

    # Fail
    err = RuntimeError("Cloudflare API returned HTTP 400 Bad Request")
    dlg._on_deploy_error(err)

    # Terminal failure state
    assert "Deployment Failed" in dlg.lbl_step.text()
    assert "Cloudflare API returned HTTP 400" in dlg.lbl_step_detail.text()
    # Controls re-enabled for retry/cancel
    assert dlg.btn_deploy.isEnabled() is True
    assert dlg.btn_cancel.isEnabled() is True
    assert dlg.cmb_accounts.isEnabled() is True
    assert dlg.txt_worker_name.isEnabled() is True
    assert dlg.txt_d1_name.isEnabled() is True


def test_deployment_result_dialog_panel_url_and_actions(qapp):
    res = DeploymentResult(
        success=True,
        action="create",
        worker_name="cool-worker",
        worker_url="https://cool-worker.workers.dev",
        d1_database_id="uuid-999",
        d1_binding_name="IOT_DB",
        d1_name="db-999",
        worker_version="1.2.1",
        source_revision="3aafad1000000000000000000000000000000000",
        bundle_sha256="sha123",
        master_key="m-key-456"
    )

    dlg = DeploymentResultDialog(res)
    assert dlg.btn_open.text() == "🌐 Open Panel"
    assert dlg.btn_copy_url.text() == "📋 Copy Panel URL"
    assert dlg.btn_copy_key.text() == "🔑 Copy Master Key"
    assert dlg.btn_done.text() == "Done"
    assert res.panel_url == "https://cool-worker.workers.dev/sync/dash"
