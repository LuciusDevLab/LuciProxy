"""
LuciProxy Manager - Local SQLite Database Engine.
Provides transactional CRUD for Connections, Accounts, Managed Workers,
D1 metadata, App State, and Update History.

Strict Invariants:
1. API Tokens are NEVER written to this database or any table.
2. Manager Application Version != Worker Version.
3. Local state is cache / UI state only (Cloudflare remains authoritative).
"""

from datetime import datetime
import os
from pathlib import Path
import sqlite3
from typing import Any, Dict, List, Optional

from .migrations import MigrationManager
from .models import (
    AppStateRecord,
    ConnectionRecord,
    AccountRecord,
    ManagedWorkerRecord,
    D1DatabaseRecord,
    UpdateHistoryRecord,
)
from ..security.credentials import SecureCredentialStore, InMemoryCredentialStore


DEFAULT_MANAGER_VERSION = "2.0.0"


class LocalDatabase:
    """Authoritative local SQLite storage engine for LuciProxy Manager."""

    def __init__(
        self,
        db_path: str = ":memory:",
        credential_store: Optional[SecureCredentialStore] = None
    ):
        self.db_path = str(db_path)
        self.credential_store = credential_store or InMemoryCredentialStore()
        self._conn: Optional[sqlite3.Connection] = None
        self._init_database()

    def _get_connection(self) -> sqlite3.Connection:
        if self._conn is None:
            if self.db_path != ":memory:":
                Path(self.db_path).parent.mkdir(parents=True, exist_ok=True)
            self._conn = sqlite3.connect(self.db_path, check_same_thread=False)
            self._conn.row_factory = sqlite3.Row
            self._conn.execute("PRAGMA foreign_keys = ON")
        return self._conn

    def _init_database(self) -> None:
        """Applies migrations and initializes baseline app_state if absent."""
        conn = self._get_connection()
        MigrationManager.apply_migrations(conn)

        # Initialize default app_state record (singleton row id=1) if empty
        with conn:
            cursor = conn.cursor()
            cursor.execute("SELECT id FROM app_state WHERE id = 1")
            if not cursor.fetchone():
                now = datetime.utcnow().isoformat() + "Z"
                cursor.execute(
                    """
                    INSERT INTO app_state (
                        id, currentManagerVersion, lastManagerUpdateCheck,
                        latestDiscoveredManagerVersion, updatedAt
                    ) VALUES (1, ?, NULL, NULL, ?)
                    """,
                    (DEFAULT_MANAGER_VERSION, now),
                )

    def close(self) -> None:
        """Closes the underlying database connection."""
        if self._conn is not None:
            self._conn.close()
            self._conn = None

    # =========================================================================
    # APP STATE METHODS (Manager application metadata)
    # =========================================================================

    def get_app_state(self) -> AppStateRecord:
        """Retrieves singleton Manager application state."""
        conn = self._get_connection()
        cursor = conn.cursor()
        cursor.execute(
            """
            SELECT currentManagerVersion, lastManagerUpdateCheck,
                   latestDiscoveredManagerVersion, updatedAt
            FROM app_state WHERE id = 1
            """
        )
        row = cursor.fetchone()
        if not row:
            return AppStateRecord(currentManagerVersion=DEFAULT_MANAGER_VERSION)
        return AppStateRecord(
            currentManagerVersion=row["currentManagerVersion"],
            lastManagerUpdateCheck=row["lastManagerUpdateCheck"],
            latestDiscoveredManagerVersion=row["latestDiscoveredManagerVersion"],
            updatedAt=row["updatedAt"],
        )

    def update_app_state(
        self,
        current_manager_version: Optional[str] = None,
        last_check: Optional[str] = None,
        latest_discovered: Optional[str] = None,
    ) -> AppStateRecord:
        """Updates Manager application state metadata."""
        conn = self._get_connection()
        curr = self.get_app_state()
        new_ver = current_manager_version or curr.currentManagerVersion
        new_check = last_check if last_check is not None else curr.lastManagerUpdateCheck
        new_disc = latest_discovered if latest_discovered is not None else curr.latestDiscoveredManagerVersion
        now = datetime.utcnow().isoformat() + "Z"

        with conn:
            conn.execute(
                """
                UPDATE app_state
                SET currentManagerVersion = ?,
                    lastManagerUpdateCheck = ?,
                    latestDiscoveredManagerVersion = ?,
                    updatedAt = ?
                WHERE id = 1
                """,
                (new_ver, new_check, new_disc, now),
            )
        return self.get_app_state()

    # =========================================================================
    # CLOUDFLARE CONNECTIONS METHODS
    # =========================================================================

    def save_connection(
        self,
        connection: ConnectionRecord,
        token: Optional[str] = None
    ) -> None:
        """
        Saves or updates a Cloudflare connection metadata in SQLite.
        If a token is provided, it is stored STRICTLY in the platform SecureCredentialStore
        and NEVER in SQLite.
        """
        conn = self._get_connection()
        now = connection.createdAt or (datetime.utcnow().isoformat() + "Z")

        # 1. Store token in secure credential store
        if token:
            self.credential_store.save_token(connection.connectionId, token)

        # 2. Store non-secret metadata in SQLite
        with conn:
            conn.execute(
                """
                INSERT INTO cloudflare_connections (
                    connectionId, displayName, status, createdAt, lastVerifiedAt
                ) VALUES (?, ?, ?, ?, ?)
                ON CONFLICT(connectionId) DO UPDATE SET
                    displayName = excluded.displayName,
                    status = excluded.status,
                    lastVerifiedAt = excluded.lastVerifiedAt
                """,
                (
                    connection.connectionId,
                    connection.displayName,
                    connection.status,
                    now,
                    connection.lastVerifiedAt,
                ),
            )

    def get_connection(self, connection_id: str) -> Optional[ConnectionRecord]:
        """Retrieves connection metadata by ID."""
        conn = self._get_connection()
        cursor = conn.cursor()
        cursor.execute(
            """
            SELECT connectionId, displayName, status, createdAt, lastVerifiedAt
            FROM cloudflare_connections WHERE connectionId = ?
            """,
            (connection_id,),
        )
        row = cursor.fetchone()
        if not row:
            return None
        return ConnectionRecord(
            connectionId=row["connectionId"],
            displayName=row["displayName"],
            status=row["status"],
            createdAt=row["createdAt"],
            lastVerifiedAt=row["lastVerifiedAt"],
        )

    def update_connection_status(
        self,
        connection_id: str,
        status: str,
        verified_at: Optional[str] = None
    ) -> bool:
        """Updates the status and optional lastVerifiedAt timestamp for a connection."""
        conn = self._get_connection()
        now = verified_at or (datetime.utcnow().isoformat() + "Z")
        with conn:
            cursor = conn.cursor()
            cursor.execute(
                """
                UPDATE cloudflare_connections
                SET status = ?, lastVerifiedAt = ?
                WHERE connectionId = ?
                """,
                (status, now, connection_id),
            )
            return cursor.rowcount > 0

    def list_connections(self) -> List[ConnectionRecord]:
        """Lists all saved Cloudflare connections."""
        conn = self._get_connection()
        cursor = conn.cursor()
        cursor.execute(
            """
            SELECT connectionId, displayName, status, createdAt, lastVerifiedAt
            FROM cloudflare_connections ORDER BY createdAt ASC
            """
        )
        return [
            ConnectionRecord(
                connectionId=r["connectionId"],
                displayName=r["displayName"],
                status=r["status"],
                createdAt=r["createdAt"],
                lastVerifiedAt=r["lastVerifiedAt"],
            )
            for r in cursor.fetchall()
        ]

    def logout_connection(self, connection_id: str) -> bool:
        """
        Logs out a connection completely:
        1. Deletes token from SecureCredentialStore.
        2. Deletes row from cloudflare_connections (CASCADE deletes accounts, workers, d1s).
        Returns True if deleted, False if not found.
        """
        conn = self._get_connection()
        # 1. Delete token from secure store
        self.credential_store.delete_token(connection_id)

        # 2. Delete metadata from SQLite with cascading cleanup
        with conn:
            cursor = conn.cursor()
            cursor.execute("DELETE FROM cloudflare_connections WHERE connectionId = ?", (connection_id,))
            return cursor.rowcount > 0

    delete_connection = logout_connection

    # =========================================================================
    # CLOUDFLARE ACCOUNTS METHODS
    # =========================================================================

    def save_account(self, account: AccountRecord) -> None:
        """Saves or updates account association metadata."""
        conn = self._get_connection()
        now = account.lastSyncedAt or (datetime.utcnow().isoformat() + "Z")
        with conn:
            conn.execute(
                """
                INSERT INTO cloudflare_accounts (
                    accountId, connectionId, accountName, isDefault, lastSyncedAt
                ) VALUES (?, ?, ?, ?, ?)
                ON CONFLICT(accountId, connectionId) DO UPDATE SET
                    accountName = excluded.accountName,
                    isDefault = excluded.isDefault,
                    lastSyncedAt = excluded.lastSyncedAt
                """,
                (
                    account.accountId,
                    account.connectionId,
                    account.accountName,
                    1 if account.isDefault else 0,
                    now,
                ),
            )

    def list_accounts_for_connection(self, connection_id: str) -> List[AccountRecord]:
        """Lists accounts discovered for a connection."""
        conn = self._get_connection()
        cursor = conn.cursor()
        cursor.execute(
            """
            SELECT accountId, connectionId, accountName, isDefault, lastSyncedAt
            FROM cloudflare_accounts WHERE connectionId = ?
            ORDER BY isDefault DESC, accountName ASC
            """,
            (connection_id,),
        )
        return [
            AccountRecord(
                accountId=r["accountId"],
                connectionId=r["connectionId"],
                accountName=r["accountName"],
                isDefault=bool(r["isDefault"]),
                lastSyncedAt=r["lastSyncedAt"],
            )
            for r in cursor.fetchall()
        ]

    def set_default_account(self, connection_id: str, account_id: str) -> None:
        """Designates an account as the default for its connection."""
        conn = self._get_connection()
        with conn:
            conn.execute(
                "UPDATE cloudflare_accounts SET isDefault = 0 WHERE connectionId = ?",
                (connection_id,),
            )
            conn.execute(
                """
                UPDATE cloudflare_accounts SET isDefault = 1
                WHERE connectionId = ? AND accountId = ?
                """,
                (connection_id, account_id),
            )

    # =========================================================================
    # MANAGED WORKERS METHODS (Per-Worker state)
    # =========================================================================

    def save_managed_worker(self, worker: ManagedWorkerRecord) -> None:
        """
        Saves or updates per-worker managed state.
        Preserves 'installedWorkerVersion' distinction.
        """
        conn = self._get_connection()
        now = worker.lastUpdatedAt or (datetime.utcnow().isoformat() + "Z")
        with conn:
            conn.execute(
                """
                INSERT INTO managed_workers (
                    workerId, connectionId, accountId, workerName, workerUrl,
                    d1BindingName, d1DatabaseId, d1Name, installedWorkerVersion,
                    apiRoute,
                    lastWorkerUpdateCheck, latestDiscoveredWorkerVersion,
                    lastUpdatedAt, status
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                ON CONFLICT(workerId) DO UPDATE SET
                    workerName = excluded.workerName,
                    workerUrl = excluded.workerUrl,
                    d1BindingName = excluded.d1BindingName,
                    d1DatabaseId = excluded.d1DatabaseId,
                    d1Name = excluded.d1Name,
                    installedWorkerVersion = excluded.installedWorkerVersion,
                    apiRoute = excluded.apiRoute,
                    lastWorkerUpdateCheck = excluded.lastWorkerUpdateCheck,
                    latestDiscoveredWorkerVersion = excluded.latestDiscoveredWorkerVersion,
                    lastUpdatedAt = excluded.lastUpdatedAt,
                    status = excluded.status
                """,
                (
                    worker.workerId,
                    worker.connectionId,
                    worker.accountId,
                    worker.workerName,
                    worker.workerUrl,
                    worker.d1BindingName,
                    worker.d1DatabaseId,
                    worker.d1Name,
                    worker.installedWorkerVersion,
                    str(worker.apiRoute).strip() if isinstance(getattr(worker, "apiRoute", None), str) and worker.apiRoute.strip() else "sync",
                    worker.lastWorkerUpdateCheck,
                    worker.latestDiscoveredWorkerVersion,
                    now,
                    worker.status,
                ),
            )

    def get_managed_worker(self, worker_id: str) -> Optional[ManagedWorkerRecord]:
        """Retrieves a managed worker by ID."""
        conn = self._get_connection()
        cursor = conn.cursor()
        cursor.execute(
            """
            SELECT workerId, connectionId, accountId, workerName, workerUrl,
                   d1BindingName, d1DatabaseId, d1Name, installedWorkerVersion,
                   apiRoute,
                   lastWorkerUpdateCheck, latestDiscoveredWorkerVersion,
                   lastUpdatedAt, status
            FROM managed_workers WHERE workerId = ?
            """,
            (worker_id,),
        )
        row = cursor.fetchone()
        if not row:
            return None
        return ManagedWorkerRecord(
            workerId=row["workerId"],
            connectionId=row["connectionId"],
            accountId=row["accountId"],
            workerName=row["workerName"],
            workerUrl=row["workerUrl"],
            d1BindingName=row["d1BindingName"],
            d1DatabaseId=row["d1DatabaseId"],
            d1Name=row["d1Name"],
            installedWorkerVersion=row["installedWorkerVersion"],
            apiRoute=row["apiRoute"] if ("apiRoute" in row.keys() and row["apiRoute"]) else "sync",
            lastWorkerUpdateCheck=row["lastWorkerUpdateCheck"],
            latestDiscoveredWorkerVersion=row["latestDiscoveredWorkerVersion"],
            lastUpdatedAt=row["lastUpdatedAt"],
            status=row["status"],
        )

    def get_managed_worker_by_name(self, account_id: str, worker_name: str) -> Optional[ManagedWorkerRecord]:
        """Retrieves a managed worker by account and worker name."""
        conn = self._get_connection()
        cursor = conn.cursor()
        cursor.execute(
            """
            SELECT workerId, connectionId, accountId, workerName, workerUrl,
                   d1BindingName, d1DatabaseId, d1Name, installedWorkerVersion,
                   apiRoute,
                   lastWorkerUpdateCheck, latestDiscoveredWorkerVersion,
                   lastUpdatedAt, status
            FROM managed_workers WHERE accountId = ? AND workerName = ?
            """,
            (account_id, worker_name),
        )
        row = cursor.fetchone()
        if not row:
            return None
        return ManagedWorkerRecord(
            workerId=row["workerId"],
            connectionId=row["connectionId"],
            accountId=row["accountId"],
            workerName=row["workerName"],
            workerUrl=row["workerUrl"],
            d1BindingName=row["d1BindingName"],
            d1DatabaseId=row["d1DatabaseId"],
            d1Name=row["d1Name"],
            installedWorkerVersion=row["installedWorkerVersion"],
            apiRoute=row["apiRoute"] if ("apiRoute" in row.keys() and row["apiRoute"]) else "sync",
            lastWorkerUpdateCheck=row["lastWorkerUpdateCheck"],
            latestDiscoveredWorkerVersion=row["latestDiscoveredWorkerVersion"],
            lastUpdatedAt=row["lastUpdatedAt"],
            status=row["status"],
        )

    def list_managed_workers(self, account_id: Optional[str] = None) -> List[ManagedWorkerRecord]:
        """Lists managed workers, optionally filtered by account."""
        conn = self._get_connection()
        cursor = conn.cursor()
        if account_id:
            cursor.execute(
                """
                SELECT workerId, connectionId, accountId, workerName, workerUrl,
                       d1BindingName, d1DatabaseId, d1Name, installedWorkerVersion,
                       apiRoute,
                       lastWorkerUpdateCheck, latestDiscoveredWorkerVersion,
                       lastUpdatedAt, status
                FROM managed_workers WHERE accountId = ? ORDER BY workerName ASC
                """,
                (account_id,),
            )
        else:
            cursor.execute(
                """
                SELECT workerId, connectionId, accountId, workerName, workerUrl,
                       d1BindingName, d1DatabaseId, d1Name, installedWorkerVersion,
                       apiRoute,
                       lastWorkerUpdateCheck, latestDiscoveredWorkerVersion,
                       lastUpdatedAt, status
                FROM managed_workers ORDER BY workerName ASC
                """
            )
        return [
            ManagedWorkerRecord(
                workerId=r["workerId"],
                connectionId=r["connectionId"],
                accountId=r["accountId"],
                workerName=r["workerName"],
                workerUrl=r["workerUrl"],
                d1BindingName=r["d1BindingName"],
                d1DatabaseId=r["d1DatabaseId"],
                d1Name=r["d1Name"],
                installedWorkerVersion=r["installedWorkerVersion"],
                apiRoute=r["apiRoute"] if ("apiRoute" in r.keys() and r["apiRoute"]) else "sync",
                lastWorkerUpdateCheck=r["lastWorkerUpdateCheck"],
                latestDiscoveredWorkerVersion=r["latestDiscoveredWorkerVersion"],
                lastUpdatedAt=r["lastUpdatedAt"],
                status=r["status"],
            )
            for r in cursor.fetchall()
        ]

    def update_worker_version(
        self,
        worker_id: str,
        new_installed_version: str,
        status: str = "up_to_date"
    ) -> None:
        """Updates installedWorkerVersion after successful Worker deployment."""
        conn = self._get_connection()
        now = datetime.utcnow().isoformat() + "Z"
        with conn:
            conn.execute(
                """
                UPDATE managed_workers
                SET installedWorkerVersion = ?,
                    status = ?,
                    lastUpdatedAt = ?
                WHERE workerId = ?
                """,
                (new_installed_version, status, now, worker_id),
            )

    def delete_managed_worker(self, worker_id: str) -> bool:
        """Deletes a worker record from local metadata."""
        conn = self._get_connection()
        with conn:
            cursor = conn.cursor()
            cursor.execute("DELETE FROM managed_workers WHERE workerId = ?", (worker_id,))
            return cursor.rowcount > 0

    # =========================================================================
    # D1 DATABASES (Cached discovery metadata)
    # =========================================================================

    def save_d1_database(self, d1: D1DatabaseRecord) -> None:
        """Caches discovered D1 database metadata."""
        conn = self._get_connection()
        now = d1.lastSyncedAt or (datetime.utcnow().isoformat() + "Z")
        with conn:
            conn.execute(
                """
                INSERT INTO d1_databases (
                    databaseId, accountId, connectionId, name, tableCount, fileSize, lastSyncedAt
                ) VALUES (?, ?, ?, ?, ?, ?, ?)
                ON CONFLICT(databaseId, accountId) DO UPDATE SET
                    name = excluded.name,
                    tableCount = excluded.tableCount,
                    fileSize = excluded.fileSize,
                    lastSyncedAt = excluded.lastSyncedAt
                """,
                (
                    d1.databaseId,
                    d1.accountId,
                    d1.connectionId,
                    d1.name,
                    d1.tableCount,
                    d1.fileSize,
                    now,
                ),
            )

    def list_d1_databases(self, account_id: str) -> List[D1DatabaseRecord]:
        """Lists cached D1 databases for an account."""
        conn = self._get_connection()
        cursor = conn.cursor()
        cursor.execute(
            """
            SELECT databaseId, accountId, connectionId, name, tableCount, fileSize, lastSyncedAt
            FROM d1_databases WHERE accountId = ? ORDER BY name ASC
            """,
            (account_id,),
        )
        return [
            D1DatabaseRecord(
                databaseId=r["databaseId"],
                accountId=r["accountId"],
                connectionId=r["connectionId"],
                name=r["name"],
                tableCount=r["tableCount"],
                fileSize=r["fileSize"],
                lastSyncedAt=r["lastSyncedAt"],
            )
            for r in cursor.fetchall()
        ]

    # =========================================================================
    # UPDATE HISTORY METHODS
    # =========================================================================

    def record_update_history(self, record: UpdateHistoryRecord) -> None:
        """Appends an update event to the local audit history."""
        conn = self._get_connection()
        with conn:
            conn.execute(
                """
                INSERT INTO update_history (
                    historyId, workerId, workerName, accountId,
                    previousWorkerVersion, updatedWorkerVersion,
                    d1DatabaseId, d1BindingName, updatedAt, status, details
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """,
                (
                    record.historyId,
                    record.workerId,
                    record.workerName,
                    record.accountId,
                    record.previousWorkerVersion,
                    record.updatedWorkerVersion,
                    record.d1DatabaseId,
                    record.d1BindingName,
                    record.updatedAt,
                    record.status,
                    record.details,
                ),
            )

    def list_update_history(
        self,
        worker_name: Optional[str] = None,
        account_id: Optional[str] = None
    ) -> List[UpdateHistoryRecord]:
        """Lists audit history records."""
        conn = self._get_connection()
        cursor = conn.cursor()
        if worker_name and account_id:
            cursor.execute(
                """
                SELECT historyId, workerId, workerName, accountId,
                       previousWorkerVersion, updatedWorkerVersion,
                       d1DatabaseId, d1BindingName, updatedAt, status, details
                FROM update_history WHERE workerName = ? AND accountId = ? ORDER BY updatedAt DESC
                """,
                (worker_name, account_id),
            )
        elif worker_name:
            cursor.execute(
                """
                SELECT historyId, workerId, workerName, accountId,
                       previousWorkerVersion, updatedWorkerVersion,
                       d1DatabaseId, d1BindingName, updatedAt, status, details
                FROM update_history WHERE (workerName = ? OR accountId = ?) ORDER BY updatedAt DESC
                """,
                (worker_name, worker_name),
            )
        elif account_id:
            cursor.execute(
                """
                SELECT historyId, workerId, workerName, accountId,
                       previousWorkerVersion, updatedWorkerVersion,
                       d1DatabaseId, d1BindingName, updatedAt, status, details
                FROM update_history WHERE accountId = ? ORDER BY updatedAt DESC
                """,
                (account_id,),
            )
        else:
            cursor.execute(
                """
                SELECT historyId, workerId, workerName, accountId,
                       previousWorkerVersion, updatedWorkerVersion,
                       d1DatabaseId, d1BindingName, updatedAt, status, details
                FROM update_history ORDER BY updatedAt DESC
                """
            )
        return [

            UpdateHistoryRecord(
                historyId=r["historyId"],
                workerId=r["workerId"],
                workerName=r["workerName"],
                accountId=r["accountId"],
                previousWorkerVersion=r["previousWorkerVersion"],
                updatedWorkerVersion=r["updatedWorkerVersion"],
                d1DatabaseId=r["d1DatabaseId"],
                d1BindingName=r["d1BindingName"],
                updatedAt=r["updatedAt"],
                status=r["status"],
                details=r["details"],
            )
            for r in cursor.fetchall()
        ]

    # =========================================================================
    # PURGE & DATA LIFECYCLE (Delete All Local Data)
    # =========================================================================

    def delete_all_local_data(self) -> None:
        """
        Irreversible purge of all local metadata and credentials:
        1. Purges all tokens from SecureCredentialStore.
        2. Drops/truncates all database tables in SQLite.
        3. Re-applies clean migrations.
        4. Resets app_state to baseline defaults.
        """
        # 1. Purge all tokens from secure credential vault
        self.credential_store.delete_all_tokens()

        # 2. Purge all SQLite tables
        conn = self._get_connection()
        with conn:
            conn.execute("PRAGMA foreign_keys = OFF")
            tables = [
                "update_history",
                "d1_databases",
                "managed_workers",
                "cloudflare_accounts",
                "cloudflare_connections",
                "app_state",
                "schema_version",
            ]
            for t in tables:
                conn.execute(f"DROP TABLE IF EXISTS {t}")
            conn.execute("PRAGMA foreign_keys = ON")

        # 3. Re-initialize database schema
        self._init_database()

    # =========================================================================
    # AUDIT VERIFICATION (Token Leakage Assertion)
    # =========================================================================

    def assert_no_tokens_in_database(self, known_tokens: List[str]) -> bool:
        """
        Audits raw SQLite database bytes and all text columns to guarantee
        that zero API tokens were persisted in SQLite.
        Raises AssertionError if any token is detected.
        """
        conn = self._get_connection()
        cursor = conn.cursor()

        # 1. Inspect all rows and columns in SQLite
        tables = [
            "app_state",
            "cloudflare_connections",
            "cloudflare_accounts",
            "managed_workers",
            "d1_databases",
            "update_history",
        ]
        for t in tables:
            cursor.execute(f"SELECT * FROM {t}")
            for row in cursor.fetchall():
                for val in row:
                    val_str = str(val or "")
                    for token in known_tokens:
                        if token and token in val_str:
                            raise AssertionError(
                                f"SECURITY BREACH: API Token found in table '{t}', column value '{val_str}'!"
                            )

        # 2. Inspect raw file bytes if on disk
        if self.db_path != ":memory:" and os.path.exists(self.db_path):
            raw_bytes = Path(self.db_path).read_bytes()
            for token in known_tokens:
                if token and token.encode("utf-8") in raw_bytes:
                    raise AssertionError(
                        f"SECURITY BREACH: Raw API Token bytes detected inside SQLite file '{self.db_path}'!"
                    )

        return True
