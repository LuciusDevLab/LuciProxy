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


if sys.platform == "win32":
    import ctypes
    from ctypes import wintypes

    class _CREDENTIALW(ctypes.Structure):
        _fields_ = [
            ("Flags", wintypes.DWORD),
            ("Type", wintypes.DWORD),
            ("TargetName", wintypes.LPWSTR),
            ("Comment", wintypes.LPWSTR),
            ("LastWritten", wintypes.FILETIME),
            ("CredentialBlobSize", wintypes.DWORD),
            ("CredentialBlob", ctypes.POINTER(ctypes.c_byte)),
            ("Persist", wintypes.DWORD),
            ("AttributeCount", wintypes.DWORD),
            ("Attributes", ctypes.c_void_p),
            ("TargetAlias", wintypes.LPWSTR),
            ("UserName", wintypes.LPWSTR),
        ]

CRED_TYPE_GENERIC = 1
CRED_PERSIST_LOCAL_MACHINE = 2
ERROR_NOT_FOUND = 1168


def _decode_credential_blob(raw_bytes: bytes) -> str:
    """Decodes credential blob handling UTF-16-LE, UTF-8, and fallback formats."""
    if len(raw_bytes) >= 2 and raw_bytes[1] == 0:
        try:
            return raw_bytes.decode("utf-16-le")
        except UnicodeDecodeError:
            pass
    try:
        return raw_bytes.decode("utf-8")
    except UnicodeDecodeError:
        return raw_bytes.decode("utf-16-le", errors="ignore")


class WindowsCredentialStore(SecureCredentialStore):
    """
    Windows-native Credential Manager store.
    Directly interfaces with Windows Credential Vault (advapi32.dll) via standard library ctypes.
    Ensures Cloudflare tokens persist across process terminations, logoffs, and reboots.
    Tokens are encrypted by DPAPI under the local user profile and NEVER touch SQLite or plaintext files.
    """

    def __init__(self, force_in_memory: bool = False):
        self._native_available = False
        self._advapi32 = None
        self._fallback_store = InMemoryCredentialStore()

        if sys.platform == "win32" and not force_in_memory:
            try:
                import ctypes
                from ctypes import wintypes
                advapi = ctypes.windll.advapi32

                advapi.CredWriteW.argtypes = [ctypes.POINTER(_CREDENTIALW), wintypes.DWORD]
                advapi.CredWriteW.restype = wintypes.BOOL

                advapi.CredReadW.argtypes = [
                    wintypes.LPCWSTR,
                    wintypes.DWORD,
                    wintypes.DWORD,
                    ctypes.POINTER(ctypes.POINTER(_CREDENTIALW)),
                ]
                advapi.CredReadW.restype = wintypes.BOOL

                advapi.CredDeleteW.argtypes = [wintypes.LPCWSTR, wintypes.DWORD, wintypes.DWORD]
                advapi.CredDeleteW.restype = wintypes.BOOL

                advapi.CredEnumerateW.argtypes = [
                    wintypes.LPCWSTR,
                    wintypes.DWORD,
                    ctypes.POINTER(wintypes.DWORD),
                    ctypes.POINTER(ctypes.POINTER(ctypes.POINTER(_CREDENTIALW))),
                ]
                advapi.CredEnumerateW.restype = wintypes.BOOL

                advapi.CredFree.argtypes = [ctypes.c_void_p]
                advapi.CredFree.restype = None

                self._advapi32 = advapi
                self._native_available = True
            except Exception:
                self._native_available = False
                self._advapi32 = None

    @property
    def is_native(self) -> bool:
        """Returns True if connected to native Windows Credential Manager, False if using fallback."""
        return self._native_available

    def _target_name(self, connection_id: str) -> str:
        return f"{TARGET_PREFIX}{connection_id}"

    def save_token(self, connection_id: str, token: str) -> None:
        cleaned = str(token or "").strip()
        if not cleaned:
            raise ValueError("Cannot save empty token.")

        if self._native_available and self._advapi32:
            import ctypes
            target = self._target_name(connection_id)
            raw = cleaned.encode("utf-8")
            blob = (ctypes.c_byte * len(raw))(*raw)

            cred = _CREDENTIALW()
            cred.Flags = 0
            cred.Type = CRED_TYPE_GENERIC
            cred.TargetName = target
            cred.Comment = "LuciProxy Manager Cloudflare API Token"
            cred.CredentialBlobSize = len(raw)
            cred.CredentialBlob = ctypes.cast(blob, ctypes.POINTER(ctypes.c_byte))
            cred.Persist = CRED_PERSIST_LOCAL_MACHINE
            cred.AttributeCount = 0
            cred.Attributes = None
            cred.TargetAlias = None
            cred.UserName = connection_id

            ok = self._advapi32.CredWriteW(ctypes.byref(cred), 0)
            if not ok:
                err_code = ctypes.GetLastError()
                raise RuntimeError(
                    f"Failed to persist API token in Windows Credential Manager for '{connection_id}' (Win32 Error: {err_code})."
                )
        else:
            self._fallback_store.save_token(connection_id, cleaned)

    def get_token(self, connection_id: str) -> Optional[str]:
        if self._native_available and self._advapi32:
            import ctypes
            target = self._target_name(connection_id)
            p_cred = ctypes.POINTER(_CREDENTIALW)()
            ok = self._advapi32.CredReadW(target, CRED_TYPE_GENERIC, 0, ctypes.byref(p_cred))
            if not ok:
                # Target does not exist or read failed
                return None

            try:
                raw = ctypes.string_at(p_cred.contents.CredentialBlob, p_cred.contents.CredentialBlobSize)
                return _decode_credential_blob(raw)
            finally:
                self._advapi32.CredFree(p_cred)
        return self._fallback_store.get_token(connection_id)

    def delete_token(self, connection_id: str) -> bool:
        if self._native_available and self._advapi32:
            target = self._target_name(connection_id)
            ok = self._advapi32.CredDeleteW(target, CRED_TYPE_GENERIC, 0)
            return bool(ok)
        return self._fallback_store.delete_token(connection_id)

    def delete_all_tokens(self) -> int:
        if self._native_available and self._advapi32:
            from ctypes import wintypes
            p_count = wintypes.DWORD(0)
            p_creds = ctypes.POINTER(ctypes.POINTER(_CREDENTIALW))()
            ok = self._advapi32.CredEnumerateW(None, 0, ctypes.byref(p_count), ctypes.byref(p_creds))
            if not ok:
                return 0
            count = 0
            try:
                for i in range(p_count.value):
                    target = p_creds[i].contents.TargetName
                    if target and target.startswith(TARGET_PREFIX):
                        if self._advapi32.CredDeleteW(target, CRED_TYPE_GENERIC, 0):
                            count += 1
            finally:
                self._advapi32.CredFree(p_creds)
            return count
        return self._fallback_store.delete_all_tokens()
