"""
Tests for AccountStore credential management and multi-account handling.
"""

from pathlib import Path
import tempfile
from unittest.mock import patch

from src.storage.account_store import AccountStore


def test_save_and_list_accounts():
    with tempfile.TemporaryDirectory() as tmpdir:
        store = AccountStore(config_dir=Path(tmpdir))

        # Initially empty
        assert len(store.list_accounts()) == 0
        assert store.get_active_account() is None

        # Save first account
        store.save_account(
            account_id="acc_111",
            name="Primary Account",
            email="primary@example.com",
            token="token_secret_111",
            subdomain="primary.workers.dev"
        )

        accounts = store.list_accounts()
        assert len(accounts) == 1
        assert accounts[0]["id"] == "acc_111"
        assert accounts[0]["email"] == "primary@example.com"
        assert accounts[0]["is_active"] is True
        assert "token_secret_111" not in str(accounts[0])  # Token masked in metadata

        # Save second account
        store.save_account(
            account_id="acc_222",
            name="Secondary Account",
            email="secondary@example.com",
            token="token_secret_222",
            subdomain="secondary.workers.dev"
        )

        accounts = store.list_accounts()
        assert len(accounts) == 2

        # Switch active account
        assert store.set_active_account("acc_222") is True
        active = store.get_active_account()
        assert active["id"] == "acc_222"

        # Verify token retrieval
        tok1 = store.get_token_for_account("acc_111")
        tok2 = store.get_token_for_account("acc_222")
        assert tok1 == "token_secret_111"
        assert tok2 == "token_secret_222"

        # Remove account
        assert store.remove_account("acc_222") is True
        assert len(store.list_accounts()) == 1
        assert store.get_active_account()["id"] == "acc_111"  # Automatically switched active


def test_no_plaintext_fallback_file_created():
    """Confirms that when keyring is disabled, no plaintext file is written to disk."""
    with tempfile.TemporaryDirectory() as tmpdir:
        tmp_path = Path(tmpdir)
        with patch("src.storage.account_store.HAS_KEYRING", False):
            store = AccountStore(config_dir=tmp_path)

            store.save_account(
                account_id="acc_secret",
                name="Ephemeral Account",
                email="ephemeral@test.com",
                token="ultra_secret_token_123"
            )

            # Token is retrievable during active in-memory session
            assert store.get_token_for_account("acc_secret") == "ultra_secret_token_123"

            # Verify NO token fallback file exists on disk
            fallback_file = tmp_path / ".tokens_fallback"
            assert not fallback_file.exists()

            # Verify accounts.json exists but does NOT contain raw token
            meta_content = (tmp_path / "accounts.json").read_text(encoding="utf-8")
            assert "ultra_secret_token_123" not in meta_content
            assert "ultr" in meta_content and "_123" in meta_content
            assert "token_masked" in meta_content

            # A new store instance without keyring should NOT have access to the ephemeral token
            fresh_store = AccountStore(config_dir=tmp_path)
            assert fresh_store.get_token_for_account("acc_secret") is None

