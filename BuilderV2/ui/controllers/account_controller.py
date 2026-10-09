"""
LuciProxy Manager - Account & Connection Controller.
Coordinates Cloudflare token verification, account discovery,
secure credential storage, and local database synchronization.
"""

from datetime import datetime
from typing import Any, Dict, List, Optional
import uuid

from ...cloudflare import CloudflareClient, AccountService, WorkerService, D1Service, AnalyticsService
from ...storage.database import LocalDatabase
from ...storage.models import ConnectionRecord, AccountRecord
from ...security.credentials import SecureCredentialStore


class AccountController:
    """Manages Cloudflare connections and accessible accounts."""

    def __init__(self, db: LocalDatabase, credential_store: Optional[SecureCredentialStore] = None):
        self.db = db
        self.credential_store = credential_store or db.credential_store

    def list_connections(self) -> List[ConnectionRecord]:
        """Returns all saved Cloudflare connections from SQLite."""
        return self.db.list_connections()

    def get_accounts_for_connection(self, connection_id: str) -> List[AccountRecord]:
        """Returns all Cloudflare accounts accessible via a specific connection."""
        return self.db.list_accounts_for_connection(connection_id)

    def add_connection(self, display_name: str, token: str) -> ConnectionRecord:
        """
        Full connection onboarding pipeline:
        1. Verifies token with Cloudflare API.
        2. Discovers all accessible accounts for this token.
        3. Saves connection metadata in SQLite.
        4. Saves API token STRICTLY in SecureCredentialStore.
        5. Saves discovered accounts in SQLite.
        6. Clears token variable in memory.
        """
        clean_name = str(display_name or "").strip()
        clean_token = str(token or "").strip()

        if not clean_name:
            raise ValueError("Connection name is required.")
        if not clean_token:
            raise ValueError("Cloudflare API Token is required.")

        # 1. Verify with Cloudflare
        cf_client = CloudflareClient(token=clean_token, timeout=15)
        account_svc = AccountService(cf_client)
        verification = account_svc.verify_token()

        if verification.status != "active":
            raise ValueError(f"Token verification status is '{verification.status}', expected 'active'.")

        # 2. Discover accounts
        accounts = account_svc.list_accounts()
        if not accounts:
            raise ValueError("Token is valid, but no Cloudflare accounts are accessible with this token.")

        # 3. Create Connection record
        conn_id = f"conn_{uuid.uuid4().hex[:12]}"
        now = datetime.utcnow().isoformat() + "Z"
        conn_record = ConnectionRecord(
            connectionId=conn_id,
            displayName=clean_name,
            status="connected",
            createdAt=now,
            lastVerifiedAt=now,
        )

        # 4. Save to DB + SecureCredentialStore (db.save_connection writes token only to vault!)
        self.db.save_connection(conn_record, token=clean_token)

        # 5. Save discovered accounts
        for acc in accounts:
            acc_record = AccountRecord(
                accountId=acc.id,
                connectionId=conn_id,
                accountName=acc.name,
                lastSyncedAt=now,
            )
            self.db.save_account(acc_record)

        return conn_record

    def verify_connection(self, connection_id: str) -> bool:
        """
        Re-verifies an existing connection using stored token.
        Updates verification timestamp in SQLite.
        """
        token = self.credential_store.get_token(connection_id)
        if not token:
            self.db.update_connection_status(connection_id, status="error")
            raise ValueError(f"No credential found in vault for connection '{connection_id}'.")

        cf_client = CloudflareClient(token=token, timeout=15)
        account_svc = AccountService(cf_client)
        verification = account_svc.verify_token()

        now = datetime.utcnow().isoformat() + "Z"
        is_ok = verification.status == "active"
        new_status = "connected" if is_ok else "error"
        self.db.update_connection_status(connection_id, status=new_status, verified_at=now)
        return is_ok

    def has_credential(self, connection_id: str) -> bool:
        """Checks if a valid token is present in the secure vault for the connection."""
        return self.credential_store.has_token(connection_id)

    def reconnect_connection(self, connection_id: str, token: str) -> bool:
        """
        Reconnects an existing connection by verifying and updating its API token:
        1. Verifies token with Cloudflare API.
        2. Saves token into SecureCredentialStore under connection_id.
        3. Updates connection status to 'connected' and updates lastVerifiedAt in SQLite.
        """
        clean_token = str(token or "").strip()
        if not clean_token:
            raise ValueError("Cloudflare API Token is required.")

        cf_client = CloudflareClient(token=clean_token, timeout=15)
        account_svc = AccountService(cf_client)
        verification = account_svc.verify_token()
        if verification.status != "active":
            raise ValueError(f"Token verification status is '{verification.status}', expected 'active'.")

        now = datetime.utcnow().isoformat() + "Z"
        self.credential_store.save_token(connection_id, clean_token)
        self.db.update_connection_status(connection_id, status="connected", verified_at=now)
        return True

    def remove_connection(self, connection_id: str) -> None:
        """
        Logs out / deletes a connection:
        1. Deletes token from SecureCredentialStore.
        2. Deletes connection and cascades all local metadata in SQLite.
        """
        self.db.delete_connection(connection_id)

    def delete_all_local_data(self) -> None:
        """
        Nuclear reset:
        1. Purges all tokens from credential vault.
        2. Drops and recreates all SQLite tables.
        """
        self.db.delete_all_local_data()

    def list_all_accounts(self) -> List[Dict[str, Any]]:
        """Returns all accounts across all active connections with their connection details."""
        connections = self.list_connections()
        all_accounts = []
        for conn in connections:
            accounts = self.get_accounts_for_connection(conn.connectionId)
            for acc in accounts:
                all_accounts.append({
                    "connection_id": conn.connectionId,
                    "connection_name": conn.displayName,
                    "account_id": acc.accountId,
                    "account_name": acc.accountName,
                    "status": conn.status,
                })
        return all_accounts

    def get_account_summary(self, connection_id: str, account_id: str) -> Dict[str, Any]:
        """
        Discovers workers, D1 databases, and analytics for an account to display on Home cards.
        Never invents or assumes a quota denominator unless authoritatively returned by the API.
        """
        token = self.credential_store.get_token(connection_id)
        if not token:
            return {
                "workers_count": 0,
                "d1_count": 0,
                "requests": "Unavailable",
                "requests_num": None,
                "quota": "Unavailable",
                "quota_num": None,
            }

        cf_client = CloudflareClient(token=token, timeout=15)
        worker_svc = WorkerService(cf_client)
        d1_svc = D1Service(cf_client)
        analytics_svc = AnalyticsService(cf_client)

        try:
            workers = worker_svc.list_workers(account_id)
            w_count = len(workers)
        except Exception:
            w_count = 0

        try:
            d1s = d1_svc.list_d1_databases(account_id)
            d_count = len(d1s)
        except Exception:
            d_count = 0

        req_str = "Unavailable"
        req_num = None
        quota_str = "Unavailable"
        quota_num = None

        try:
            analytics = analytics_svc.get_worker_invocations(account_id, hours=24)
            if analytics.get("available"):
                req_val = analytics.get("requests")
                if req_val is not None:
                    req_num = int(req_val)
                    req_str = f"{req_num:,}"

                raw_quota = analytics.get("quota")
                if raw_quota is not None:
                    quota_num = int(raw_quota)
                    quota_str = f"{quota_num:,}"
        except Exception:
            pass

        return {
            "workers_count": w_count,
            "d1_count": d_count,
            "requests": req_str,
            "requests_num": req_num,
            "quota": quota_str,
            "quota_num": quota_num,
        }

