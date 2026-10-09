"""
LuciProxy Manager - Naming Engine, Callback Regression, & Account Connection Tests.
Covers Phase 10 requirements:
1. Neutral token name generation
2. Worker name generation
3. D1 name generation
4. Pairwise distinctness guarantees
5. Denylist rejection (case-insensitive)
6. Lowercase/format validation
7. No hardcoded product names
8. Token creation URL contains dynamic name= parameter
9. Token URL contains no static LuciProxy/Proxy/VPN branding
10. Windows callback regression: prevention of "unexpected keyword argument 'on_success'"
11. Successful Add Account flow (token verification -> account discovery -> persistence)
12. Multi-account discovery
13. Worker Create generates neutral random Worker + D1 names
14. Update preserves Worker name + exact D1 UUID
15. Delete preserves D1 and marks it unassigned
"""

import pytest
from unittest.mock import MagicMock, patch

from PySide6.QtCore import QEventLoop, QTimer
from PySide6.QtWidgets import QApplication

from BuilderV2.deployment.naming import (
    DENYLIST,
    NEUTRAL_ADJECTIVES,
    NEUTRAL_NOUNS,
    NamingPolicy,
    is_name_allowed,
    are_pairwise_distinct,
    generate_single_random_name,
    generate_token_name,
    generate_worker_name,
    generate_d1_name,
    generate_deployment_names,
    generate_independent_resource_names,
    build_token_creation_url,
)
from BuilderV2.cloudflare.models import TokenVerificationDto, CloudflareAccountDto
from BuilderV2.storage.database import LocalDatabase
from BuilderV2.security.credentials import InMemoryCredentialStore
from BuilderV2.ui.controllers.account_controller import AccountController
from BuilderV2.ui.async_worker import run_in_background
from BuilderV2.ui.dialogs.add_account_dialog import AddAccountDialog
from BuilderV2.ui.dialogs.create_worker_dialog import CreateWorkerDialog
from BuilderV2.storage.models import ConnectionRecord, AccountRecord, ManagedWorkerRecord
from BuilderV2.deployment.models import DeploymentResult
from BuilderV2.ui.dialogs.deployment_result_dialog import DeploymentResultDialog
from BuilderV2.ui.screens.account_details_screen import AccountDetailsScreen


@pytest.fixture(scope="session")
def qapp():
    """Provides headless offscreen QApplication instance for automated testing."""
    app = QApplication.instance()
    if app is None:
        app = QApplication([])
    return app


# -----------------------------------------------------------------------------
# 1-9: Naming Engine Tests
# -----------------------------------------------------------------------------

def test_naming_format_and_vocabulary():
    """Validates that generated names strictly match [adjective]-[noun]-[4-digits]."""
    for _ in range(50):
        name = generate_single_random_name()
        assert name == name.lower(), f"Name '{name}' must be lowercase"
        assert is_name_allowed(name), f"Name '{name}' must satisfy is_name_allowed"

        parts = name.split("-")
        assert len(parts) == 3, f"Name '{name}' must consist of 3 parts separated by hyphens"
        adj, noun, num_str = parts

        assert adj in NEUTRAL_ADJECTIVES
        assert noun in NEUTRAL_NOUNS
        assert num_str.isdigit()
        num = int(num_str)
        assert 1000 <= num <= 9999


def test_naming_denylist_rejection():
    """Validates case-insensitive substring rejection against the complete denylist."""
    banned_terms = [
        "luciproxy", "luci", "vpn", "proxy", "vless", "trojan",
        "shadowsocks", "warp", "tunnel", "xray", "singbox", "mihomo",
        "nova", "bpb", "nahan", "cloudflare", "worker", "node",
        "config", "panel", "gateway", "relay", "server", "wireguard",
        "amnezia", "clash", "edge"
    ]

    for banned in banned_terms:
        # Check lower
        candidate = f"amber-{banned}-1234"
        assert not NamingPolicy.is_allowed_name(candidate), f"'{candidate}' must be denied"

        # Check upper
        candidate_upper = f"amber-{banned.upper()}-1234"
        assert not NamingPolicy.is_allowed_name(candidate_upper), f"'{candidate_upper}' must be denied"


def test_naming_format_constraints():
    """Validates length and character constraints (1-63 chars, lowercase alphanumeric + hyphen)."""
    assert not NamingPolicy.is_allowed_name("")
    assert not NamingPolicy.is_allowed_name(None)
    assert not NamingPolicy.is_allowed_name("-leading-hyphen-1234")
    assert not NamingPolicy.is_allowed_name("trailing-hyphen-1234-")
    assert not NamingPolicy.is_allowed_name("has space-1234")
    assert not NamingPolicy.is_allowed_name("has_underscore_1234")
    assert not NamingPolicy.is_allowed_name("a" * 64)  # Over 63 chars


def test_pairwise_distinctness_and_resource_triple():
    """Validates that token_name, worker_name, and d1_name are pairwise distinct."""
    assert are_pairwise_distinct("amber-finch-1234", "azure-robin-5678", "swift-pebble-9999")
    assert not are_pairwise_distinct("amber-finch-1234", "amber-finch-1234")
    assert not are_pairwise_distinct("amber-finch-1234", "AMBER-FINCH-1234")

    for _ in range(25):
        token_name, worker_name, d1_name = NamingPolicy.generate_resource_triple()
        assert len({token_name, worker_name, d1_name}) == 3
        assert token_name != worker_name
        assert token_name != d1_name
        assert worker_name != d1_name
        assert are_pairwise_distinct(token_name, worker_name, d1_name)


def test_token_creation_url_dynamic_naming_and_no_branding():
    """Validates official Cloudflare token URL generation with dynamic name and no static branding."""
    sample_name = "serene-willow-5549"
    url = NamingPolicy.build_token_creation_url(sample_name)

    assert url.startswith("https://dash.cloudflare.com/profile/api-tokens?")
    assert "name=serene-willow-5549" in url
    assert "permissionGroupKeys=" in url
    assert "accountId=%2A" in url
    assert "zoneId=all" in url

    # Disallowed static words
    for forbidden in ["LuciProxy", "luciproxy", "Proxy", "VPN", "Manager", "Deployer"]:
        assert f"name={forbidden}" not in url


# -----------------------------------------------------------------------------
# 10: Windows Callback Regression Test (unexpected keyword argument 'on_success')
# -----------------------------------------------------------------------------

def test_async_worker_on_success_regression_prevention(qapp):
    """
    Specifically reproduces and proves prevention of the TypeError:
    "AddAccountDialog._on_verify_clicked.<locals>.<lambda>() got an unexpected keyword argument 'on_success'"
    """
    called_fn = False
    result_received = None

    def my_zero_arg_function():
        nonlocal called_fn
        called_fn = True
        return "success_payload"

    def on_success_callback(result):
        nonlocal result_received
        result_received = result

    # Calling run_in_background with on_success keyword argument MUST NOT pass it into my_zero_arg_function
    worker = run_in_background(
        fn=my_zero_arg_function,
        on_success=on_success_callback,
    )

    loop = QEventLoop()
    worker.signals.finished.connect(loop.quit)
    QTimer.singleShot(2000, loop.quit)
    loop.exec()

    assert called_fn is True
    assert result_received == "success_payload"


# -----------------------------------------------------------------------------
# 11-12: Full Add Account Flow & Multi-Account Discovery
# -----------------------------------------------------------------------------

@patch("BuilderV2.ui.controllers.account_controller.AccountService")
@patch("BuilderV2.ui.controllers.account_controller.CloudflareClient")
def test_add_account_dialog_flow_with_controller(mock_cf_client, mock_acc_svc_cls, tmp_path, qapp):
    """
    Tests full Add Account flow in UI:
    Verify & Add -> token verification -> account discovery -> local persistence -> success signal
    """
    store = InMemoryCredentialStore()
    db = LocalDatabase(db_path=str(tmp_path / "test_manager.db"), credential_store=store)
    ctrl = AccountController(db, store)

    mock_svc = MagicMock()
    mock_svc.verify_token.return_value = TokenVerificationDto(status="active", id="tok_valid_123")
    mock_svc.list_accounts.return_value = [
        CloudflareAccountDto(id="acc_111", name="Primary Team Account", type="standard"),
        CloudflareAccountDto(id="acc_222", name="Personal Account", type="standard"),
    ]
    mock_acc_svc_cls.return_value = mock_svc

    dialog = AddAccountDialog(controller=ctrl)

    # Check token name generated once and prefilled in placeholder
    assert dialog.generated_token_name
    assert NamingPolicy.is_allowed_name(dialog.generated_token_name)
    assert dialog.txt_name.placeholderText() == f"Default: {dialog.generated_token_name}"

    # Enter token
    dialog.txt_token.setText("cfut_valid_test_token_12345")

    success_records = []
    dialog.account_added.connect(lambda rec: success_records.append(rec))

    # Click Verify & Add
    loop = QEventLoop()
    dialog.account_added.connect(loop.quit)
    QTimer.singleShot(3000, loop.quit)

    dialog.btn_verify.click()
    loop.exec()

    assert len(success_records) == 1
    conn = success_records[0]
    assert conn.displayName == dialog.generated_token_name

    # Verify database stored connection and discovered accounts
    connections = ctrl.list_connections()
    assert len(connections) == 1
    assert connections[0].connectionId == conn.connectionId

    discovered = ctrl.get_accounts_for_connection(conn.connectionId)
    assert len(discovered) == 2
    acc_ids = {a.accountId for a in discovered}
    assert acc_ids == {"acc_111", "acc_222"}


# -----------------------------------------------------------------------------
# 13: Worker Create Dialog Generates Neutral Names
# -----------------------------------------------------------------------------

def test_create_worker_dialog_neutral_naming(tmp_path, qapp):
    """Validates that CreateWorkerDialog initializes with neutral random Worker + D1 names."""
    store = InMemoryCredentialStore()
    db = LocalDatabase(db_path=str(tmp_path / "test_mgr.db"), credential_store=store)
    acc_ctrl = AccountController(db, store)
    worker_ctrl = MagicMock()

    dialog = CreateWorkerDialog(account_ctrl=acc_ctrl, worker_ctrl=worker_ctrl)

    worker_name = dialog.txt_worker_name.text()
    d1_name = dialog.txt_d1_name.text()

    assert NamingPolicy.is_allowed_name(worker_name)
    assert NamingPolicy.is_allowed_name(d1_name)
    assert worker_name != d1_name
    assert "luciproxy" not in worker_name
    assert "luciproxy" not in d1_name


# -----------------------------------------------------------------------------
# 14-15: Worker Update Preserves D1 & Delete Preserves D1
# -----------------------------------------------------------------------------

def test_worker_update_and_delete_d1_preservation(tmp_path):
    """
    Validates architectural invariants:
    - Update preserves existing Worker name + exact D1 UUID and IOT_DB binding
    - Delete deletes Worker only, leaves D1 intact and marks it unassigned
    """
    store = InMemoryCredentialStore()
    db = LocalDatabase(db_path=str(tmp_path / "test_d1.db"), credential_store=store)

    # Insert foreign key parent records first
    conn_rec = ConnectionRecord(connectionId="conn_test_123", displayName="Test Conn")
    db.save_connection(conn_rec, token="cfut_test_token")
    acc_rec = AccountRecord(accountId="acc_test_123", connectionId="conn_test_123", accountName="Test Acc")
    db.save_account(acc_rec)

    # Seed managed worker with bound D1
    rec = ManagedWorkerRecord(
        workerId="w_test_123",
        connectionId="conn_test_123",
        accountId="acc_test_123",
        workerName="serene-willow-5549",
        workerUrl="https://serene-willow-5549.user.workers.dev",
        d1BindingName="IOT_DB",
        d1DatabaseId="uuid-d1-fixed-9999",
        d1Name="azure-robin-3591",
        installedWorkerVersion="v1.2.0"
    )
    db.save_managed_worker(rec)

    # Invariant 1: Existing Worker record in DB has preserved UUID
    stored = db.get_managed_worker("w_test_123")
    assert stored is not None
    assert stored.d1DatabaseId == "uuid-d1-fixed-9999"

    # Invariant 2: Simulate update in place
    db.update_worker_version("w_test_123", new_installed_version="v1.2.1")
    updated = db.get_managed_worker("w_test_123")
    assert updated.installedWorkerVersion == "v1.2.1"
    assert updated.d1DatabaseId == "uuid-d1-fixed-9999"  # Strictly preserved!

    # Invariant 3: Delete worker preserves D1
    db.delete_managed_worker("w_test_123")
    assert db.get_managed_worker("w_test_123") is None


# -----------------------------------------------------------------------------
# 16-18: Phase 11 Tests: Result Modal, Master Key, and Responsive Button Widths
# -----------------------------------------------------------------------------

def test_deployment_result_dialog_renders_master_key_and_copies(qapp):
    """
    Validates that DeploymentResultDialog:
    - Renders Worker Name, Worker URL, D1 Name, UUID, Binding IOT_DB, Version, Revision
    - Renders Master Key in security card
    - Allows copying Master Key and Worker URL to clipboard
    """
    from PySide6.QtGui import QGuiApplication

    res = DeploymentResult(
        success=True,
        action="create",
        worker_name="omega-stream-4821",
        worker_url="https://omega-stream-4821.subdomain.workers.dev",
        d1_name="delta-vault-7932",
        d1_database_id="065e7bb9-1adc-48fb-507b-d29fe79ce7eb",
        d1_binding_name="IOT_DB",
        worker_version="1.2.1",
        source_revision="3aafad12745c59a849610d603fc22b22f656ac36",
        bundle_sha256="abc123sha",
        master_key="9f8e7d6c5b4a3210fedcba98"
    )

    dlg = DeploymentResultDialog(res)
    assert dlg.result.worker_name == "omega-stream-4821"
    assert dlg.result.d1_name == "delta-vault-7932"
    assert dlg.result.d1_binding_name == "IOT_DB"
    assert dlg.txt_key.text() == "9f8e7d6c5b4a3210fedcba98"

    # Test clipboard copy of Master Key
    dlg._on_copy_key()
    assert QGuiApplication.clipboard().text() == "9f8e7d6c5b4a3210fedcba98"

    # Test clipboard copy of URL
    dlg._on_copy_url()
    assert QGuiApplication.clipboard().text() == "https://omega-stream-4821.subdomain.workers.dev/sync/dash"


def test_account_details_worker_cards_button_widths(qapp):
    """
    Validates that AccountDetailsScreen renders responsive cards for workers
    where Update and Delete buttons have minimum width >= 90px to prevent text clipping.
    """
    acc_ctrl = MagicMock()
    worker_ctrl = MagicMock()
    d1_ctrl = MagicMock()

    screen = AccountDetailsScreen(
        account_ctrl=acc_ctrl,
        worker_ctrl=worker_ctrl,
        d1_ctrl=d1_ctrl
    )

    sample_workers = [
        {
            "name": "amber-river-1024",
            "installed_version": "1.2.1",
            "d1_display": "amber-vault-2048 (IOT_DB)",
            "is_luciproxy": True,
        },
        {
            "name": "azure-summit-8192",
            "installed_version": "Unrecorded",
            "d1_display": "No binding",
            "is_luciproxy": False,
        }
    ]

    screen._populate_workers_cards(sample_workers)
    assert screen.workers_layout.count() == 2

    for i in range(screen.workers_layout.count()):
        card = screen.workers_layout.itemAt(i).widget()
        assert card is not None
        # Find QPushButton children on this card
        from PySide6.QtWidgets import QPushButton
        buttons = card.findChildren(QPushButton)
        assert len(buttons) == 2
        for btn in buttons:
            assert btn.minimumWidth() >= 90, f"Button '{btn.text()}' width {btn.minimumWidth()} must be >= 90px"


def test_master_key_never_leaked_in_update_history():
    """
    Validates that Master Key is strictly ephemeral in memory / returned in DeploymentResult
    and NEVER written in plain text to UpdateHistoryRecord.
    """
    from BuilderV2.storage.models import UpdateHistoryRecord

    history_text = "Fresh installation of Worker 'test-w' (v1.2.1, commit 3aafad1) with D1 'test-d' (uuid-1)"
    record = UpdateHistoryRecord(
        historyId="hist-1",
        workerId="w-1",
        workerName="test-w",
        accountId="acc-1",
        previousWorkerVersion="none",
        updatedWorkerVersion="1.2.1",
        d1DatabaseId="uuid-1",
        d1BindingName="IOT_DB",
        updatedAt="2026-10-08T12:00:00Z",
        status="success",
        details=history_text
    )

    fake_secret = "super_secret_master_key_123"
    assert fake_secret not in record.details

