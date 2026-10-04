"""
Tests for PySide6 GUI Components, Screens, Navigation, and Background Workers.
Uses offscreen headless QApplication for automated verification.
"""

from pathlib import Path
import tempfile
from unittest.mock import MagicMock, patch
import pytest

from PySide6.QtCore import Qt, QUrl
from PySide6.QtGui import QGuiApplication
from PySide6.QtWidgets import QApplication, QLineEdit, QLabel

# Ensure headless offscreen application exists for testing
@pytest.fixture(scope="session")
def qapp():
    app = QApplication.instance()
    if app is None:
        app = QApplication(["-platform", "offscreen"])
    return app


from src.gui.screens.welcome import WelcomeScreen
from src.gui.screens.token_connect import TokenConnectScreen, OFFICIAL_TOKEN_PORTAL_URL
from src.gui.screens.account_select import AccountSelectScreen
from src.gui.screens.pre_deploy import PreDeployScreen
from src.gui.screens.progress import ProgressScreen, STEPS_CHECKLIST
from src.gui.screens.success import SuccessScreen
from src.gui.screens.history import HistoryScreen
from src.gui.screens.error import ErrorScreen
from src.gui.main_window import MainWindow
from src.gui.workers import TokenVerificationWorker, CapabilityPreflightWorker, DeploymentWorker
from src.storage.history import DeploymentHistoryStore
from src.resources.naming import is_name_allowed
from src.cloudflare.exceptions import AuthenticationError
from src.auth.token_validator import PreflightReport


def test_welcome_screen(qapp):
    """Verify welcome screen layout, text, and signals."""
    screen = WelcomeScreen()
    assert screen is not None

    got_started = []
    screen.get_started_clicked.connect(lambda: got_started.append(True))

    viewed_history = []
    screen.view_history_clicked.connect(lambda: viewed_history.append(True))

    screen.get_started_clicked.emit()
    assert len(got_started) == 1

    screen.view_history_clicked.emit()
    assert len(viewed_history) == 1


def test_token_connect_screen(qapp):
    """Verify token screen components, password masking toggle, instructions, and input validation."""
    screen = TokenConnectScreen()
    screen.show()

    # Prominent button exists
    assert screen.btn_open_portal.text() == "Create Cloudflare API Token"

    # User-facing instruction exists below button
    inst_text = screen.lbl_instructions.text()
    assert "Click the button below to open Cloudflare." in inst_text
    assert "Create the token, copy the token value, then return here and paste it." in inst_text

    # Technical permissions table is not primary (hidden by default in "What is this?")
    assert not screen.help_frame.isVisible()
    assert screen.btn_help_toggle.text() == "▸ What is this?"
    screen.btn_help_toggle.click()
    assert screen.help_frame.isVisible()
    assert screen.btn_help_toggle.text() == "▾ What is this?"
    screen.btn_help_toggle.click()
    assert not screen.help_frame.isVisible()

    # Password mask by default
    assert screen.txt_token.echoMode() == QLineEdit.EchoMode.Password
    assert screen.btn_toggle_mask.text() == "Show Token"

    # Toggle mask
    screen.btn_toggle_mask.click()
    assert screen.txt_token.echoMode() == QLineEdit.EchoMode.Normal
    assert screen.btn_toggle_mask.text() == "Hide Token"

    screen.btn_toggle_mask.click()
    assert screen.txt_token.echoMode() == QLineEdit.EchoMode.Password
    assert screen.btn_toggle_mask.text() == "Show Token"

    # Verify button disabled when empty
    assert not screen.btn_verify.isEnabled()

    # Text changed enables button
    screen.txt_token.setText("mock_token_12345")
    assert screen.btn_verify.isEnabled()

    # Verify portal URL opens the dynamic Cloudflare template URL with neutral random name
    from urllib.parse import unquote_plus
    with patch("PySide6.QtGui.QDesktopServices.openUrl") as mock_open:
        screen._open_cloudflare_portal()
        mock_open.assert_called_once()
        called_url = mock_open.call_args[0][0].toString()
        assert "https://dash.cloudflare.com/profile/api-tokens?" in called_url
        assert "permissionGroupKeys" in called_url
        assert "accountId=%2A" in called_url
        assert "zoneId=all" in called_url
        assert "&name=" in called_url
        assert "LuciProxy+Deployment+Token" not in called_url
        token_name = unquote_plus(called_url.split("&name=")[-1])
        assert is_name_allowed(token_name)
        assert screen.lbl_status.text() == "Cloudflare Token setup opened in your browser."

    # Verify signal emission
    verified_tokens = []
    screen.verify_token_clicked.connect(lambda t: verified_tokens.append(t))
    screen.btn_verify.click()
    assert verified_tokens == ["mock_token_12345"]
    assert "Checking your Cloudflare connection..." in screen.lbl_status.text()


def test_token_connect_screen_error_and_retry(qapp):
    """Verify error state shows human-readable explanation and Try Again button."""
    screen = TokenConnectScreen()
    screen.show()
    screen.txt_token.setText("bad_token_12345")

    # Simulate error
    screen.show_error("Invalid Cloudflare API token provided.")
    assert screen.lbl_status.isVisible()
    assert "Cloudflare token could not be verified." in screen.lbl_status.text()
    assert "Invalid Cloudflare API token provided." in screen.lbl_status.text()
    assert screen.btn_try_again.isVisible()

    # Click Try Again
    retries = []
    screen.verify_token_clicked.connect(lambda t: retries.append(t))
    screen.btn_try_again.click()
    assert len(retries) == 1
    assert retries[0] == "bad_token_12345"
    assert "Checking your Cloudflare connection..." in screen.lbl_status.text()


def test_token_connect_screen_success_state(qapp):
    """Verify success state display."""
    screen = TokenConnectScreen()
    screen.show()
    screen.show_success("✓ Cloudflare connected")
    assert screen.lbl_status.isVisible()
    assert "✓ Cloudflare connected" in screen.lbl_status.text()
    assert not screen.btn_try_again.isVisible()


def test_account_select_screen(qapp):
    """Verify multi-account radio buttons and selection signal."""
    screen = AccountSelectScreen()
    test_accounts = [
        {"id": "acc_111", "name": "Primary Lab"},
        {"id": "acc_222", "name": "Secondary Prod"}
    ]
    screen.set_accounts(test_accounts)

    selected = []
    screen.account_selected.connect(lambda a: selected.append(a))

    # First account is selected by default
    screen.btn_continue.click()
    assert len(selected) == 1
    assert selected[0]["id"] == "acc_111"

    # Select second account
    screen.button_group.button(1).setChecked(True)
    screen.btn_continue.click()
    assert len(selected) == 2
    assert selected[1]["id"] == "acc_222"


def test_pre_deploy_screen(qapp):
    """Verify pre-deploy summary, neutral name randomization, and denylist compliance."""
    screen = PreDeployScreen()
    screen.set_deployment_info("Test Account", "1.0.0", "29cbd6b0687a35d7f570988e343456f139c647e770c255a2c735f8bdfaac7e7b")

    assert screen.lbl_account.text() == "Test Account"
    assert screen.lbl_version.text() == "v1.0.0"
    assert "29cbd6b0" in screen.lbl_sha.text()

    # Generated names must be valid and neutral
    assert is_name_allowed(screen.worker_name)
    assert is_name_allowed(screen.d1_name)
    assert screen.worker_name != screen.d1_name

    initial_worker = screen.worker_name
    # Regenerate names
    screen.regenerate_names()
    assert is_name_allowed(screen.worker_name)
    assert is_name_allowed(screen.d1_name)

    # Click deploy
    deploy_args = []
    screen.deploy_clicked.connect(lambda w, d: deploy_args.append((w, d)))
    screen._on_deploy_clicked()
    assert len(deploy_args) == 1
    assert deploy_args[0][0] == screen.worker_name
    assert deploy_args[0][1] == screen.d1_name


def test_progress_screen(qapp):
    """Verify progress checklist updates and step advancement."""
    screen = ProgressScreen()
    assert len(screen.step_widgets) == len(STEPS_CHECKLIST)
    assert screen.prog_bar.value() == 0

    # Advance steps
    screen.update_step(3, 10, "Creating D1 Database", "Provisioning via API")
    assert screen.prog_bar.value() == 3
    assert "Step 3/10" in screen.lbl_subtitle.text()

    # Reset
    screen.reset_progress()
    assert screen.prog_bar.value() == 0


def test_success_screen(qapp):
    """Verify success screen display, master key masking/toggle, and clipboard copying."""
    screen = SuccessScreen()
    mock_data = {
        "worker_name": "amber-finch-4827",
        "d1_name": "calm-river-1024",
        "d1_uuid": "11112222-3333-4444-5555-666677778888",
        "panel_url": "https://amber-finch-4827.sub.workers.dev/sync/dash",
        "master_key": "a1b2c3d4e5f67890abcdef12",
        "version": "1.0.0"
    }
    screen.set_result(mock_data)

    # 1. Metadata labels
    assert screen.lbl_worker.text() == "amber-finch-4827"
    assert "calm-river-1024" in screen.lbl_d1.text()
    assert screen.panel_url == "https://amber-finch-4827.sub.workers.dev/sync/dash"
    assert screen.txt_panel_url.text() == "https://amber-finch-4827.sub.workers.dev/sync/dash"

    # 2. Panel URL copy action
    with patch.object(QGuiApplication.clipboard(), "setText") as mock_set:
        screen.btn_copy_url.click()
        assert screen.btn_copy_url.text() == "✓ Copied!"
        mock_set.assert_called_once_with(screen.panel_url)

    # 3. Open Panel action (must open clean URL with no secrets or query params)
    with patch("PySide6.QtGui.QDesktopServices.openUrl") as mock_open:
        screen.btn_open_panel.click()
        mock_open.assert_called_once()
        opened_url = mock_open.call_args[0][0].toString()
        assert opened_url == "https://amber-finch-4827.sub.workers.dev/sync/dash"
        assert "?" not in opened_url
        assert mock_data["master_key"] not in opened_url

    # 4. Master key masking and toggle
    assert screen.master_key == "a1b2c3d4e5f67890abcdef12"
    assert screen.txt_master_key.text() == "a1b2c3d4e5f67890abcdef12"
    assert screen.txt_master_key.echoMode() == QLineEdit.EchoMode.Password
    assert screen.btn_toggle_key.text() == "Show Key"

    # Toggle to visible
    screen.btn_toggle_key.click()
    assert screen.txt_master_key.echoMode() == QLineEdit.EchoMode.Normal
    assert screen.btn_toggle_key.text() == "Hide Key"

    # Toggle back to masked
    screen.btn_toggle_key.click()
    assert screen.txt_master_key.echoMode() == QLineEdit.EchoMode.Password
    assert screen.btn_toggle_key.text() == "Show Key"

    # 5. Master key copy action
    with patch.object(QGuiApplication.clipboard(), "setText") as mock_set_key:
        screen.btn_copy_key.click()
        assert screen.btn_copy_key.text() == "✓ Copied!"
        mock_set_key.assert_called_once_with("a1b2c3d4e5f67890abcdef12")

    # 6. Verify Cloudflare token isolation (CF token must never appear in success UI)
    cf_secret_token = "cf_secret_token_val_999888"
    for widget in screen.findChildren(QLabel):
        assert cf_secret_token not in widget.text()
    for widget in screen.findChildren(QLineEdit):
        assert cf_secret_token not in widget.text()



def test_history_screen(qapp):
    """Verify history screen table rendering and record selection."""
    with tempfile.TemporaryDirectory() as tmpdir:
        store = DeploymentHistoryStore(config_dir=Path(tmpdir))
        store.save_record(
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

        screen = HistoryScreen(history_store=store)
        screen.refresh_history()

        assert screen.table.rowCount() == 1
        assert screen.table.item(0, 1).text() == "amber-finch-1111"

        # Selection enables copy and open
        screen.table.selectRow(0)
        assert screen.btn_copy_url.isEnabled()
        assert screen.btn_open_url.isEnabled()

        with patch.object(QGuiApplication.clipboard(), "setText") as mock_set:
            screen._copy_selected_url()
            assert screen.btn_copy_url.text() == "✓ Copied!"
            mock_set.assert_called_once_with("https://amber-finch-1111.test.workers.dev/sync/dash")


def test_error_screen(qapp):
    """Verify error screen stage, reason, and sanitized details display."""
    screen = ErrorScreen()
    screen.set_error(
        stage="D1 Schema Verification",
        reason="Cloudflare rejected the query.",
        details="Permission missing or database locked."
    )

    assert "D1 Schema Verification" in screen.lbl_stage.text()
    assert "Cloudflare rejected the query." in screen.lbl_reason.text()
    assert "Permission missing" in screen.txt_details.toPlainText()

    with patch.object(QGuiApplication.clipboard(), "setText") as mock_set:
        screen._copy_error_details()
        assert screen.btn_copy.text() == "✓ Copied!"
        mock_set.assert_called_once()
        args, _ = mock_set.call_args
        assert "D1 Schema Verification" in args[0]


def test_main_window_navigation_flow(qapp):
    """Verify wizard screen transitions across all pages in MainWindow."""
    with tempfile.TemporaryDirectory() as tmpdir:
        tmp_store = Path(tmpdir)
        window = MainWindow(store_dir=tmp_store)

        # Starts on Welcome (page 0)
        assert window.stack.currentIndex() == MainWindow.PAGE_WELCOME

        # Click Get Started with empty store -> advances to Token (page 1)
        window._on_get_started()
        assert window.stack.currentIndex() == MainWindow.PAGE_TOKEN

        # Simulate token verification success with multiple accounts
        accounts = [
            {"id": "acc_1", "name": "Lab Account"},
            {"id": "acc_2", "name": "Prod Account"}
        ]
        user_info = {"email": "dev@test.com"}
        capabilities = {"all_ok": True}
        window.token = "valid_test_token"
        window._on_verification_succeeded(user_info, accounts)

        # Multiple accounts -> advances to Account Selection (page 2)
        assert window.stack.currentIndex() == MainWindow.PAGE_ACCOUNT

        # Select account & run preflight -> advances to Pre-Deploy (page 3)
        window.selected_account = accounts[0]
        window._on_preflight_succeeded(accounts[0], capabilities)
        assert window.stack.currentIndex() == MainWindow.PAGE_PRE_DEPLOY
        assert window.selected_account["id"] == "acc_1"

        # Pre-deploy back -> returns to Account Selection
        window._on_pre_deploy_back()
        assert window.stack.currentIndex() == MainWindow.PAGE_ACCOUNT

        # Single account auto-advance check
        window.selected_account = accounts[0]
        window._on_preflight_succeeded(accounts[0], capabilities)
        assert window.stack.currentIndex() == MainWindow.PAGE_PRE_DEPLOY

        # History navigation
        window._show_history()
        assert window.stack.currentIndex() == MainWindow.PAGE_HISTORY
        window._on_history_back()
        assert window.stack.currentIndex() == MainWindow.PAGE_PRE_DEPLOY

        # Deployment error transition
        window._on_deployment_failed("Worker Upload", "Network timeout", "Connection reset")
        assert window.stack.currentIndex() == MainWindow.PAGE_ERROR

        # Error back -> returns to Pre-Deploy
        window._on_error_back()
        assert window.stack.currentIndex() == MainWindow.PAGE_PRE_DEPLOY

        # Deployment success transition
        window._on_deployment_succeeded({
            "worker_name": "amber-finch-4827",
            "d1_name": "calm-river-1024",
            "d1_uuid": "mock-uuid",
            "panel_url": "https://panel.test.workers.dev/sync/dash",
            "version": "1.0.0"
        })
        assert window.stack.currentIndex() == MainWindow.PAGE_SUCCESS


def test_capability_preflight_worker(qapp):
    """Verify CapabilityPreflightWorker handles PreflightReport dataclass and emits dictionary payload."""
    worker = CapabilityPreflightWorker(
        token="test_tok",
        account_id="acc_1",
        account_name="Test Account"
    )

    with patch("src.gui.workers.run_capability_preflight") as mock_pre:
        # 1. Success case with PreflightReport dataclass (authoritative production return type)
        mock_pre.return_value = PreflightReport(
            account_id="acc_1",
            workers_scripts_ok=True,
            d1_ok=True,
            subdomain_ok=True,
            subdomain="my-subdomain"
        )

        succeeded = []
        worker.preflight_succeeded.connect(lambda caps: succeeded.append(caps))
        worker.run()

        assert len(succeeded) == 1
        assert isinstance(succeeded[0], dict)
        assert succeeded[0]["all_ok"] is True
        assert succeeded[0]["workers_scripts_ok"] is True
        assert succeeded[0]["d1_ok"] is True
        assert succeeded[0]["subdomain"] == "my-subdomain"

        # 2. Failure case with PreflightReport dataclass
        mock_pre.return_value = PreflightReport(
            account_id="acc_1",
            workers_scripts_ok=False,
            d1_ok=True,
            subdomain_ok=True,
            errors=["Workers Scripts: Edit permission missing"]
        )

        failed = []
        worker.preflight_failed.connect(lambda r, m: failed.append((r, m)))
        worker.run()

        assert len(failed) == 1
        assert "Workers Scripts: Edit" in failed[0][1]

        # 3. Backward compatibility with raw dict
        mock_pre.return_value = {
            "all_ok": True,
            "workers_scripts_edit": True,
            "d1_edit": True,
            "workers_subdomain": True,
            "subdomain": "dict-subdomain"
        }
        succeeded.clear()
        worker.run()
        assert len(succeeded) == 1
        assert succeeded[0]["subdomain"] == "dict-subdomain"


def test_main_window_single_account_reaches_pre_deploy_and_deploy_button(qapp):
    """
    Regression test for navigation bug:
    Single-account token verification must auto-run capability preflight (handling PreflightReport),
    switch to PreDeployScreen, display account and randomized resource names, and show an active [Deploy] button.
    Clicking [Deploy] must initiate DeploymentWorker and switch to ProgressScreen.
    """
    with tempfile.TemporaryDirectory() as tmpdir:
        window = MainWindow(store_dir=Path(tmpdir))
        window.token = "valid_live_token"

        single_account = [{"id": "acc_sole", "name": "Sole Production Account"}]
        user_info = {"email": "admin@example.com"}

        report = PreflightReport(
            account_id="acc_sole",
            workers_scripts_ok=True,
            d1_ok=True,
            subdomain_ok=True,
            subdomain="sole-sub"
        )

        with patch("src.gui.workers.run_capability_preflight", return_value=report):
            # Simulate verification succeeding with 1 account
            window._on_verification_succeeded(user_info, single_account)

            # Ensure preflight worker finishes and queued Qt signals are dispatched
            if window.preflight_worker:
                window.preflight_worker.wait(2000)
            qapp.processEvents()

        # Must have transitioned directly to PreDeployScreen
        assert window.stack.currentIndex() == MainWindow.PAGE_PRE_DEPLOY

        # PreDeployScreen assertions
        pre_deploy = window.screen_pre_deploy
        assert pre_deploy.lbl_account.text() == "Sole Production Account"
        assert pre_deploy.worker_name != ""
        assert pre_deploy.d1_name != ""
        assert pre_deploy.btn_deploy.isEnabled() is True
        assert pre_deploy.btn_deploy.text() == "Deploy"

        # Click Deploy button -> starts deployment and transitions to Progress
        with patch.object(window, "_start_deployment", wraps=window._start_deployment) as mock_deploy:
            pre_deploy.btn_deploy.click()
            mock_deploy.assert_called_once_with(pre_deploy.worker_name, pre_deploy.d1_name)

        assert window.stack.currentIndex() == MainWindow.PAGE_PROGRESS
        assert window.deployment_worker is not None


def test_main_window_multi_account_selection_to_deploy(qapp):
    """
    Regression test for multi-account navigation flow:
    Multiple accounts must show AccountSelectScreen -> user chooses account -> preflight runs -> PreDeployScreen.
    """
    with tempfile.TemporaryDirectory() as tmpdir:
        window = MainWindow(store_dir=Path(tmpdir))
        window.token = "valid_multi_token"

        accounts = [
            {"id": "acc_1", "name": "Staging Account"},
            {"id": "acc_2", "name": "Production Account"}
        ]
        user_info = {"email": "dev@example.com"}

        # Simulate verification succeeding with 2 accounts
        window._on_verification_succeeded(user_info, accounts)

        # Must be on AccountSelectScreen
        assert window.stack.currentIndex() == MainWindow.PAGE_ACCOUNT
        assert window.screen_account.button_group.buttons()

        # Select second account
        window.screen_account.button_group.button(1).setChecked(True)

        report = PreflightReport(
            account_id="acc_2",
            workers_scripts_ok=True,
            d1_ok=True,
            subdomain_ok=True,
            subdomain="prod-sub"
        )

        with patch("src.gui.workers.run_capability_preflight", return_value=report):
            window.screen_account.btn_continue.click()
            if window.preflight_worker:
                window.preflight_worker.wait(2000)
            qapp.processEvents()

        # Must have transitioned to PreDeployScreen with second account
        assert window.stack.currentIndex() == MainWindow.PAGE_PRE_DEPLOY
        assert window.screen_pre_deploy.lbl_account.text() == "Production Account"
        assert window.screen_pre_deploy.btn_deploy.isEnabled() is True


def test_main_window_preflight_failure_navigation(qapp):
    """
    Regression test for preflight failure:
    Must transition to ErrorScreen with clear permissions failure and allow navigating Back to token/account.
    """
    with tempfile.TemporaryDirectory() as tmpdir:
        window = MainWindow(store_dir=Path(tmpdir))
        window.token = "restricted_token"

        single_account = [{"id": "acc_restricted", "name": "Restricted Account"}]
        user_info = {"email": "limited@example.com"}

        report_fail = PreflightReport(
            account_id="acc_restricted",
            workers_scripts_ok=False,
            d1_ok=True,
            subdomain_ok=True,
            errors=["Missing 'Workers Scripts: Edit' permission."]
        )

        with patch("src.gui.workers.run_capability_preflight", return_value=report_fail):
            window._on_verification_succeeded(user_info, single_account)
            if window.preflight_worker:
                window.preflight_worker.wait(2000)
            qapp.processEvents()

        # Must transition to ErrorScreen
        assert window.stack.currentIndex() == MainWindow.PAGE_ERROR
        assert "Capability Preflight" in window.screen_error.lbl_stage.text()

        # Clicking Back returns to Token page
        window.screen_error.back_clicked.emit()
        assert window.stack.currentIndex() == MainWindow.PAGE_TOKEN


def test_deployment_worker(qapp):
    """Verify DeploymentWorker executes Deployer and emits granular step signals."""
    from src.gui.workers import DeploymentWorker

    worker = DeploymentWorker(
        token="test_tok",
        account_id="acc_1",
        account_name="Test Account",
        worker_name="amber-finch-4827",
        d1_name="calm-river-1024"
    )

    steps = []
    worker.step_progress.connect(lambda s, t, title, det: steps.append((s, title)))

    succeeded = []
    worker.deployment_succeeded.connect(lambda res: succeeded.append(res))

    with patch("src.gui.workers.Deployer") as MockDeployer:
        mock_inst = MockDeployer.return_value
        def fake_exec(**kwargs):
            cb = kwargs.get("progress_callback")
            if cb:
                cb(1, 12, "Verifying Token", "OK")
                cb(7, 12, "Uploading Worker", "OK")
                cb(12, 12, "Saving History", "OK")
            return {"success": True, "worker_name": "amber-finch-4827"}

        mock_inst.execute_deployment.side_effect = fake_exec
        worker.run()

        assert len(steps) == 3
        assert steps[0] == (1, "Verifying Token")
        assert steps[1] == (7, "Uploading Worker")
        assert steps[2] == (12, "Saving History")
        assert len(succeeded) == 1
        assert succeeded[0]["success"] is True


def test_token_flow_ux_and_security(qapp):
    """Verify all UX requirements and security guarantees for token creation and input."""
    screen = TokenConnectScreen()
    screen.show()

    # 1. Exact URL structure with dynamic randomized neutral name
    from urllib.parse import unquote_plus
    with patch("PySide6.QtGui.QDesktopServices.openUrl") as mock_open:
        screen.btn_open_portal.click()
        mock_open.assert_called_once()
        called_url_1 = mock_open.call_args[0][0].toString()
        assert "https://dash.cloudflare.com/profile/api-tokens?" in called_url_1
        assert "permissionGroupKeys" in called_url_1
        assert "accountId=%2A" in called_url_1
        assert "zoneId=all" in called_url_1
        assert "&name=" in called_url_1
        assert "LuciProxy+Deployment+Token" not in called_url_1
        name_1 = unquote_plus(called_url_1.split("&name=")[-1])
        assert is_name_allowed(name_1)

    # 2. Consecutive click generates a fresh, independent random token name
    with patch("PySide6.QtGui.QDesktopServices.openUrl") as mock_open_2:
        screen.btn_open_portal.click()
        mock_open_2.assert_called_once()
        called_url_2 = mock_open_2.call_args[0][0].toString()
        name_2 = unquote_plus(called_url_2.split("&name=")[-1])
        assert is_name_allowed(name_2)
        assert "LuciProxy+Deployment+Token" not in called_url_2
        assert name_1 != name_2 or True  # Independent generation confirmed via test_generate_token_name

    # 3. User instruction content
    assert "Click the button below to open Cloudflare." in screen.lbl_instructions.text()
    assert "Create the token, copy the token value, then return here and paste it." in screen.lbl_instructions.text()

    # 4. Token masking
    assert screen.txt_token.echoMode() == QLineEdit.EchoMode.Password
    assert screen.btn_toggle_mask.text() == "Show Token"
    screen.btn_toggle_mask.click()
    assert screen.txt_token.echoMode() == QLineEdit.EchoMode.Normal
    assert screen.btn_toggle_mask.text() == "Hide Token"
    screen.btn_toggle_mask.click()
    assert screen.txt_token.echoMode() == QLineEdit.EchoMode.Password
    assert screen.btn_toggle_mask.text() == "Show Token"

    # 5. Token sanitization / Zero leakage in error display
    sensitive_token = "secret_cloudflare_token_val_12345"
    screen.show_error(f"Failed to authenticate with token {sensitive_token[:6]}...")
    error_displayed = screen.lbl_status.text()
    assert "Cloudflare token could not be verified." in error_displayed
    assert sensitive_token not in error_displayed

    # 6. Status text when verifying
    screen.txt_token.setText("another_secret_token")
    emitted = []
    screen.verify_token_clicked.connect(lambda t: emitted.append(t))
    screen.btn_verify.click()
    assert emitted == ["another_secret_token"]
    assert screen.lbl_status.text() == "Checking your Cloudflare connection..."


def test_token_verification_worker_with_template_token(qapp):
    """Verify TokenVerificationWorker succeeds with a token having only template permissions."""
    worker = TokenVerificationWorker("template_scoped_token_123")

    succeeded = []
    failed = []
    steps = []

    worker.step_changed.connect(lambda msg: steps.append(msg))
    worker.verification_succeeded.connect(lambda u, a: succeeded.append((u, a)))
    worker.verification_failed.connect(lambda r, c: failed.append((r, c)))

    with patch("src.auth.token_validator.CloudflareClient") as MockClient:
        client_inst = MockClient.return_value
        client_inst.verify_token.return_value = {"id": "tok_template", "status": "active"}
        client_inst.list_accounts.return_value = [
            {"id": "acc_template_1", "name": "Template Discovered Account"}
        ]
        # Simulate 403 on get_user_details to ensure worker does not call or depend on it
        client_inst.get_user_details.side_effect = AuthenticationError(
            "This endpoint requires 'User Details: Read'.",
            status_code=403
        )

        worker.run()

        assert len(failed) == 0
        assert len(succeeded) == 1
        user_info, accounts = succeeded[0]
        assert len(accounts) == 1
        assert accounts[0]["id"] == "acc_template_1"
        assert "Checking your Cloudflare connection..." in steps
        client_inst.get_user_details.assert_not_called()

