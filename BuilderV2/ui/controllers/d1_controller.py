"""
LuciProxy Manager - D1 Database Controller.
Coordinates read-only discovery of Cloudflare D1 databases for an account.
"""

from typing import Any, Dict, List, Optional

from ...cloudflare import CloudflareClient, D1Service
from ...storage.database import LocalDatabase
from ...security.credentials import SecureCredentialStore


class D1Controller:
    """Coordinates read-only discovery of Cloudflare D1 databases."""

    def __init__(self, db: LocalDatabase, credential_store: Optional[SecureCredentialStore] = None):
        self.db = db
        self.credential_store = credential_store or db.credential_store

    def list_d1_databases(self, connection_id: str, account_id: str) -> List[Dict[str, Any]]:
        """Discovers all D1 databases under the specified connection and account."""
        token = self.credential_store.get_token(connection_id)
        if not token:
            raise ValueError(f"No token available for connection '{connection_id}'.")

        cf_client = CloudflareClient(token=token, timeout=15)
        d1_svc = D1Service(cf_client)

        databases = d1_svc.list_d1_databases(account_id)
        results: List[Dict[str, Any]] = []
        for db in databases:
            results.append({
                "uuid": db.uuid,
                "name": db.name,
                "version": db.version or "production",
                "num_tables": db.num_tables,
                "file_size": db.file_size,
                "created_at": db.created_at or "Unknown",
            })
        return results
