"""
LuciProxy Builder - Secure Cloudflare Account & Token Storage
Leverages Windows Credential Manager (via keyring) for secret storage
with a secure permission-restricted JSON fallback for metadata.
"""

import json
import os
from pathlib import Path
from typing import Any, Dict, List, Optional

try:
    import keyring
    HAS_KEYRING = True
except ImportError:
    HAS_KEYRING = False

from ..utils.sanitize import mask_secret

SERVICE_NAME = "luciproxy-builder"


class AccountStore:
    """Manages multi-account Cloudflare credentials and metadata securely."""

    def __init__(self, config_dir: Optional[Path] = None):
        if config_dir is None:
            # Default to APPDATA on Windows, or ~/.config on Unix
            appdata = os.environ.get("APPDATA")
            if appdata:
                self.config_dir = Path(appdata) / "luciproxy"
            else:
                self.config_dir = Path.home() / ".config" / "luciproxy"
        else:
            self.config_dir = Path(config_dir)

        self.config_dir.mkdir(parents=True, exist_ok=True)
        self.metadata_file = self.config_dir / "accounts.json"
        self._ephemeral_tokens: Dict[str, str] = {}

    def _load_metadata(self) -> Dict[str, Any]:
        if not self.metadata_file.exists():
            return {"active_id": None, "accounts": []}
        try:
            with open(self.metadata_file, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception:
            return {"active_id": None, "accounts": []}

    def _save_metadata(self, data: Dict[str, Any]) -> None:
        with open(self.metadata_file, "w", encoding="utf-8") as f:
            json.dump(data, f, indent=2)
        # Attempt to restrict file permissions on Unix/POSIX
        try:
            os.chmod(self.metadata_file, 0o600)
        except Exception:
            pass

    def _store_token(self, account_id: str, token: str) -> None:
        """Stores the secret token in OS keyring, or in-memory volatile store if keyring is unavailable."""
        if HAS_KEYRING:
            try:
                keyring.set_password(SERVICE_NAME, account_id, token)
                return
            except Exception:
                pass
        # Volatile in-memory fallback - NEVER write raw credentials to disk
        self._ephemeral_tokens[account_id] = token

    def _get_token(self, account_id: str) -> Optional[str]:
        """Retrieves the secret token from OS keyring or volatile in-memory store."""
        if HAS_KEYRING:
            try:
                tok = keyring.get_password(SERVICE_NAME, account_id)
                if tok:
                    return tok
            except Exception:
                pass
        return self._ephemeral_tokens.get(account_id)

    def _delete_token(self, account_id: str) -> None:
        """Removes the secret token from OS keyring and in-memory store."""
        if HAS_KEYRING:
            try:
                keyring.delete_password(SERVICE_NAME, account_id)
            except Exception:
                pass
        self._ephemeral_tokens.pop(account_id, None)

    def is_keyring_available(self) -> bool:
        """Checks if OS keyring is functioning properly for persistence."""
        if not HAS_KEYRING:
            return False
        try:
            test_key = "__probe__"
            keyring.set_password(SERVICE_NAME, test_key, "probe")
            val = keyring.get_password(SERVICE_NAME, test_key)
            keyring.delete_password(SERVICE_NAME, test_key)
            return val == "probe"
        except Exception:
            return False

    # Public API
    def list_accounts(self) -> List[Dict[str, Any]]:
        """Returns non-sensitive metadata for all registered Cloudflare accounts."""
        meta = self._load_metadata()
        active_id = meta.get("active_id")
        accounts = []
        for acc in meta.get("accounts", []):
            acc_copy = dict(acc)
            acc_copy["is_active"] = (acc.get("id") == active_id)
            accounts.append(acc_copy)
        return accounts

    def get_active_account(self) -> Optional[Dict[str, Any]]:
        """Returns metadata for the currently selected active account."""
        meta = self._load_metadata()
        active_id = meta.get("active_id")
        if not active_id:
            return None
        for acc in meta.get("accounts", []):
            if acc.get("id") == active_id:
                acc_copy = dict(acc)
                acc_copy["is_active"] = True
                return acc_copy
        return None

    def set_active_account(self, account_id: str) -> bool:
        """Selects an account as active by account ID."""
        meta = self._load_metadata()
        exists = any(a.get("id") == account_id for a in meta.get("accounts", []))
        if not exists:
            return False
        meta["active_id"] = account_id
        self._save_metadata(meta)
        return True

    def get_token_for_account(self, account_id: str) -> Optional[str]:
        """Retrieves the raw API Token for authorized Cloudflare API operations."""
        return self._get_token(account_id)

    def save_account(
        self,
        account_id: str,
        name: str,
        email: str,
        token: str,
        subdomain: Optional[str] = None
    ) -> Dict[str, Any]:
        """Saves or updates account metadata and securely stores the API token."""
        self._store_token(account_id, token)

        meta = self._load_metadata()
        accounts = meta.get("accounts", [])

        account_entry = {
            "id": account_id,
            "name": name or f"Account-{account_id[:8]}",
            "email": email,
            "subdomain": subdomain,
            "token_masked": mask_secret(token, keep_start=4, keep_end=4)
        }

        replaced = False
        for i, acc in enumerate(accounts):
            if acc.get("id") == account_id:
                accounts[i] = account_entry
                replaced = True
                break

        if not replaced:
            accounts.append(account_entry)

        meta["accounts"] = accounts
        if not meta.get("active_id") or len(accounts) == 1:
            meta["active_id"] = account_id

        self._save_metadata(meta)
        return account_entry

    def remove_account(self, account_id: str) -> bool:
        """Removes an account from metadata and deletes token from secure store."""
        meta = self._load_metadata()
        accounts = meta.get("accounts", [])
        new_accounts = [a for a in accounts if a.get("id") != account_id]

        if len(new_accounts) == len(accounts):
            return False

        self._delete_token(account_id)

        meta["accounts"] = new_accounts
        if meta.get("active_id") == account_id:
            meta["active_id"] = new_accounts[0]["id"] if new_accounts else None

        self._save_metadata(meta)
        return True
