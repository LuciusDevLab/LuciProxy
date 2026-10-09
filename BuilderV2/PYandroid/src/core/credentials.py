"""
LuciProxy PYandroid - Abstract Credential Interface.
Decouples business logic from OS-specific secure vaults.
"""

from abc import ABC, abstractmethod
from typing import Dict, Optional


class SecureCredentialStore(ABC):
    """Abstract interface for platform-specific secure storage (Android Keystore / Windows CredMgr)."""

    @abstractmethod
    def get_token(self, connection_id: str) -> Optional[str]:
        """Retrieves plaintext token into memory for active network operations."""
        pass

    @abstractmethod
    def save_token(self, connection_id: str, token: str) -> None:
        """Persists token into encrypted hardware-backed storage."""
        pass

    @abstractmethod
    def delete_token(self, connection_id: str) -> bool:
        """Removes token from secure storage."""
        pass

    @abstractmethod
    def has_token(self, connection_id: str) -> bool:
        """Checks if a valid token exists for this connection ID."""
        pass


class InMemoryCredentialStore(SecureCredentialStore):
    """
    Ephemeral in-memory implementation for testing, prototyping,
    and passing decrypted tokens across JNI / Chaquopy boundaries.
    """

    def __init__(self):
        self._vault: Dict[str, str] = {}

    def get_token(self, connection_id: str) -> Optional[str]:
        return self._vault.get(connection_id)

    def save_token(self, connection_id: str, token: str) -> None:
        if not token:
            raise ValueError("Token cannot be empty.")
        self._vault[connection_id] = token

    def delete_token(self, connection_id: str) -> bool:
        return self._vault.pop(connection_id, None) is not None

    def has_token(self, connection_id: str) -> bool:
        return connection_id in self._vault and bool(self._vault[connection_id])
