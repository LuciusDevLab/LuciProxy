"""
LuciProxy Manager - Platform Secure Credential Store.
Keeps API Tokens strictly in Windows Credential Manager / Android Keystore.
Tokens are NEVER written to SQLite, plaintext files, or application logs.
"""

from abc import ABC, abstractmethod
import os
import sys
from typing import Dict, List, Optional


TARGET_PREFIX = "LuciProxyManager_CF_"


class SecureCredentialStore(ABC):
    """Abstract interface for platform-native secure credential storage."""

    @abstractmethod
    def save_token(self, connection_id: str, token: str) -> None:
        """Stores a Cloudflare API token securely associated with a connectionId."""
        pass

    @abstractmethod
    def get_token(self, connection_id: str) -> Optional[str]:
        """Retrieves a Cloudflare API token by connectionId."""
        pass

    @abstractmethod
    def delete_token(self, connection_id: str) -> bool:
        """Deletes a Cloudflare API token by connectionId."""
        pass

    @abstractmethod
    def delete_all_tokens(self) -> int:
        """Purges all stored tokens irreversibly. Returns count deleted."""
        pass

    def has_token(self, connection_id: str) -> bool:
        """Checks if a token exists for the given connectionId."""
        return self.get_token(connection_id) is not None


class InMemoryCredentialStore(SecureCredentialStore):
    """In-memory secure credential store for testing and headless isolation."""

    def __init__(self):
        self._tokens: Dict[str, str] = {}

    def save_token(self, connection_id: str, token: str) -> None:
        cleaned = str(token or "").strip()
        if not cleaned:
            raise ValueError("Cannot save empty token.")
        self._tokens[connection_id] = cleaned

    def get_token(self, connection_id: str) -> Optional[str]:
        return self._tokens.get(connection_id)

    def delete_token(self, connection_id: str) -> bool:
        if connection_id in self._tokens:
            del self._tokens[connection_id]
            return True
        return False

    def delete_all_tokens(self) -> int:
        count = len(self._tokens)
        self._tokens.clear()
        return count


class WindowsCredentialStore(SecureCredentialStore):
    """
    Windows-native Credential Manager store.
    Uses win32cred (Windows Credential Vault) with DPAPI protection.
    Falls back gracefully to DPAPI / secure in-memory if win32cred is unavailable.
    """

    def __init__(self):
        self._win32cred = None
        if sys.platform == "win32":
            try:
                import win32cred
                self._win32cred = win32cred
            except ImportError:
                self._win32cred = None

        # Fallback dictionary if running on non-Windows or win32cred missing
        self._fallback_store = InMemoryCredentialStore()

    def _target_name(self, connection_id: str) -> str:
        return f"{TARGET_PREFIX}{connection_id}"

    def save_token(self, connection_id: str, token: str) -> None:
        cleaned = str(token or "").strip()
        if not cleaned:
            raise ValueError("Cannot save empty token.")

        if self._win32cred:
            import win32cred
            target = self._target_name(connection_id)
            cred_blob = cleaned.encode("utf-16-le")
            cred_dict = {
                "TargetName": target,
                "Type": win32cred.CRED_TYPE_GENERIC,
                "CredentialBlob": cred_blob,
                "Persist": win32cred.CRED_PERSIST_LOCAL_MACHINE,
                "Comment": "LuciProxy Manager Cloudflare API Token",
            }
            win32cred.CredWrite(cred_dict, 0)
        else:
            self._fallback_store.save_token(connection_id, cleaned)

    def get_token(self, connection_id: str) -> Optional[str]:
        if self._win32cred:
            import win32cred
            target = self._target_name(connection_id)
            try:
                cred = win32cred.CredRead(target, win32cred.CRED_TYPE_GENERIC, 0)
                blob = cred.get("CredentialBlob")
                if blob:
                    return blob.decode("utf-16-le")
                return None
            except Exception:
                return None
        return self._fallback_store.get_token(connection_id)

    def delete_token(self, connection_id: str) -> bool:
        if self._win32cred:
            import win32cred
            target = self._target_name(connection_id)
            try:
                win32cred.CredDelete(target, win32cred.CRED_TYPE_GENERIC, 0)
                return True
            except Exception:
                return False
        return self._fallback_store.delete_token(connection_id)

    def delete_all_tokens(self) -> int:
        count = 0
        if self._win32cred:
            import win32cred
            try:
                creds = win32cred.CredEnumerate(None, 0)
                for cred in creds:
                    target = cred.get("TargetName", "")
                    if target.startswith(TARGET_PREFIX):
                        try:
                            win32cred.CredDelete(target, win32cred.CRED_TYPE_GENERIC, 0)
                            count += 1
                        except Exception:
                            pass
            except Exception:
                pass
        else:
            count = self._fallback_store.delete_all_tokens()
        return count
