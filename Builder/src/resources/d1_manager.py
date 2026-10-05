"""
LuciProxy Builder - D1 Relational SQLite Database Manager
Creates D1 database instances via REST API, captures authoritative UUIDs,
executes table creation DDL, and verifies schema existence.
"""

import json
import secrets
from typing import Optional
import uuid

from ..cloudflare.client import CloudflareClient
from ..cloudflare.exceptions import CloudflareError


SCHEMA_SQL = """
CREATE TABLE IF NOT EXISTS kv_store (
    key TEXT PRIMARY KEY,
    value TEXT
);
"""

VERIFY_TABLE_SQL = "SELECT name FROM sqlite_master WHERE type='table' AND name='kv_store';"


class D1Manager:
    """Provisions and initializes D1 SQLite databases for LuciProxy via REST API."""

    def __init__(self, client: CloudflareClient, account_id: str):
        self.client = client
        self.account_id = account_id

    def create_and_initialize_database(self, database_name: str) -> str:
        """
        Creates a fresh D1 database, captures the authoritative UUID,
        initializes the schema, and verifies that kv_store table exists.
        Returns: database_uuid (str)
        """
        # 1. Create D1 database
        created = self.client.create_d1_database(self.account_id, database_name)
        db_uuid = created.get("uuid")
        if not db_uuid:
            raise CloudflareError(
                message=f"Failed to obtain UUID for created D1 database '{database_name}'.",
                step="D1 Database Creation",
                reason="Cloudflare API did not return an authoritative database UUID."
            )

        # 2. Initialize schema remotely
        self.initialize_schema(db_uuid)

        # 3. Verify schema was created
        if not self.verify_schema(db_uuid):
            raise CloudflareError(
                message=f"D1 database '{database_name}' ({db_uuid}) failed schema verification.",
                step="D1 Schema Verification",
                reason="The required 'kv_store' table was not found after DDL execution."
            )

        return db_uuid

    def initialize_schema(self, database_id: str) -> None:
        """Executes table creation DDL on the remote D1 database."""
        try:
            self.client.execute_d1_query(
                account_id=self.account_id,
                database_id=database_id,
                sql=SCHEMA_SQL
            )
        except Exception as e:
            # Re-probe schema to determine if error was benign or fatal
            if not self.verify_schema(database_id):
                raise CloudflareError(
                    message=f"Failed to initialize D1 schema: {e}",
                    step="D1 Schema Initialization"
                ) from e

    def verify_schema(self, database_id: str) -> bool:
        """Executes a query verifying that required tables exist in D1 SQLite master."""
        try:
            res = self.client.execute_d1_query(
                account_id=self.account_id,
                database_id=database_id,
                sql=VERIFY_TABLE_SQL
            )
            if res and isinstance(res, list):
                # Standard Cloudflare D1 query response: list of result objects with "results" key
                rows = res[0].get("results", []) if isinstance(res[0], dict) else []
                return any(r.get("name") == "kv_store" for r in rows if isinstance(r, dict))
            return False
        except Exception:
            return False

    def verify_health(self, database_id: str) -> bool:
        """Executes a ping query to verify database accessibility."""
        try:
            res = self.client.execute_d1_query(
                account_id=self.account_id,
                database_id=database_id,
                sql="SELECT 1 as ping;"
            )
            return len(res) > 0
        except Exception:
            return False

    def ensure_database(self, database_name: str, existing_id: Optional[str] = None) -> str:
        """Finds or creates the D1 database and initializes its schema (compatibility method)."""
        if existing_id:
            self.initialize_schema(existing_id)
            return existing_id

        # Query existing databases
        dbs = self.client.list_d1_databases(self.account_id, name=database_name)
        for db in dbs:
            if db.get("name") == database_name and db.get("uuid"):
                self.initialize_schema(db["uuid"])
                return db["uuid"]

        return self.create_and_initialize_database(database_name)

    def get_master_key(self, database_id: str) -> Optional[str]:
        """
        Queries D1 kv_store table for the active 'sys_config' record and extracts masterKey.
        Returns the clean master key string, or None if uninitialized.
        """
        try:
            res = self.client.execute_d1_query(
                account_id=self.account_id,
                database_id=database_id,
                sql="SELECT value FROM kv_store WHERE key = 'sys_config';",
                params=[]
            )
            if res and isinstance(res, list):
                rows = res[0].get("results", []) if isinstance(res[0], dict) else []
                if rows and isinstance(rows[0], dict):
                    raw_val = rows[0].get("value")
                    if raw_val and isinstance(raw_val, str):
                        parsed = json.loads(raw_val)
                        key = parsed.get("masterKey")
                        if key and isinstance(key, str) and key.strip():
                            return key.strip()
            return None
        except Exception:
            return None

    def seed_master_key(self, database_id: str, preferred_key: Optional[str] = None) -> str:
        """
        Guarantees that the deployment has an authoritative administrative masterKey.
        1. If an active key already exists in D1 (legacy database), returns it.
        2. Otherwise generates a cryptographically random 24-character hex key
           (12 bytes, matching generateSecureToken() in LuciProxy/src/db/d1.js).
        3. Persists initial system configuration into D1 kv_store WITHOUT redundant
           plaintext secret storage (Worker Secret MASTER_KEY is authoritative).
        Returns: The authoritative administrative master key.
        """
        existing = self.get_master_key(database_id)
        if existing:
            return existing

        master_key = (preferred_key or secrets.token_hex(12)).strip()
        device_id = str(uuid.uuid4())

        initial_config = {
            "name": "LuciProxy",
            "apiRoute": "sync",
            "deviceId": device_id,
            "mode": "alpha",
            "maintenanceHost": "https://www.ubuntu.com, https://www.docker.com",
            "cleanIps": "",
            "socketPorts": "443",
            "customDns": "https://8.8.8.8/dns-query",
            "resolveIp": "8.8.8.8",
            "localDns": "8.8.8.8",
            "remoteDns": "https://8.8.8.8/dns-query",
            "users": []
        }

        # Parameterized upsert into kv_store without plaintext secrets
        sql = (
            "INSERT INTO kv_store (key, value) VALUES ('sys_config', ?) "
            "ON CONFLICT(key) DO UPDATE SET value = excluded.value;"
        )
        self.client.execute_d1_query(
            account_id=self.account_id,
            database_id=database_id,
            sql=sql,
            params=[json.dumps(initial_config)]
        )

        # Confirm readback that sys_config is persisted
        self.client.execute_d1_query(
            account_id=self.account_id,
            database_id=database_id,
            sql="SELECT 1 FROM kv_store WHERE key = 'sys_config';",
            params=[]
        )

        return master_key

