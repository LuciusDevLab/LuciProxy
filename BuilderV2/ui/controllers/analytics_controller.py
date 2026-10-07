"""
LuciProxy Manager - Analytics Controller.
Coordinates querying Cloudflare GraphQL Workers metrics.
"""

from typing import Any, Dict, Optional

from ...cloudflare import CloudflareClient, AnalyticsService
from ...storage.database import LocalDatabase
from ...security.credentials import SecureCredentialStore


class AnalyticsController:
    """Coordinates Cloudflare GraphQL Workers metrics queries."""

    def __init__(self, db: LocalDatabase, credential_store: Optional[SecureCredentialStore] = None):
        self.db = db
        self.credential_store = credential_store or db.credential_store

    def get_worker_analytics(
        self,
        connection_id: str,
        account_id: str,
        script_name: Optional[str] = None,
        hours: int = 24
    ) -> Dict[str, Any]:
        """Queries GraphQL Analytics for the specified account and worker."""
        token = self.credential_store.get_token(connection_id)
        if not token:
            raise ValueError(f"No token available for connection '{connection_id}'.")

        cf_client = CloudflareClient(token=token, timeout=15)
        analytics_svc = AnalyticsService(cf_client)

        return analytics_svc.get_worker_invocations(
            account_id=account_id,
            script_name=script_name,
            hours=hours
        )
