"""
LuciProxy Manager - Cloudflare D1 Service.
Handles D1 database listing, metadata discovery, query execution, and database details.
"""

import json
import secrets
from typing import Any, Dict, List, Optional
import uuid

from .client import CloudflareClient
from .models import D1DatabaseDto
from .exceptions import ResourceNotFoundError, CloudflareApiError


class D1Service:
    """Service for interacting with Cloudflare D1 relational databases."""

    def __init__(self, client: CloudflareClient):
        self.client = client

    def list_d1_databases(
        self,
        account_id: str,
        name: Optional[str] = None
    ) -> List[D1DatabaseDto]:
        """
        Lists all D1 databases for an account, handling pagination automatically.
        Endpoint: GET /client/v4/accounts/{account_id}/d1/database
        """
        params = {"name": name} if name else None
        raw_items = self.client.paginate(
            f"/accounts/{account_id}/d1/database",
            params=params,
            step="List D1 Databases"
        )

        databases: List[D1DatabaseDto] = []
        for item in raw_items:
            uuid = str(item.get("uuid", "")).strip()
            db_name = str(item.get("name", "")).strip()
            if uuid and db_name:
                databases.append(
                    D1DatabaseDto(
                        uuid=uuid,
                        name=db_name,
                        version=item.get("version"),
                        num_tables=int(item.get("num_tables") or 0),
                        file_size=int(item.get("file_size") or 0),
                        created_at=item.get("created_at"),
                    )
                )
        return databases

    def get_d1_database(
        self,
        account_id: str,
        database_id: str
    ) -> Optional[D1DatabaseDto]:
        """
        Retrieves detailed metadata for a single D1 database.
        Endpoint: GET /client/v4/accounts/{account_id}/d1/database/{database_id}
        """
        try:
            res = self.client.request(
                "GET",
                f"/accounts/{account_id}/d1/database/{database_id}",
                step="Get D1 Database Details"
            )
            item = res.get("result", {})
            if not item:
                return None
            return D1DatabaseDto(
                uuid=str(item.get("uuid", database_id)),
                name=str(item.get("name", "")),
                version=item.get("version"),
                num_tables=int(item.get("num_tables") or 0),
                file_size=int(item.get("file_size") or 0),
                created_at=item.get("created_at"),
            )
        except ResourceNotFoundError:
            return None

    def execute_query(
        self,
        account_id: str,
        database_id: str,
        sql: str,
        params: Optional[List[Any]] = None
    ) -> List[Dict[str, Any]]:
        """
        Executes a remote SQL statement or query against a D1 database.
        Endpoint: POST /client/v4/accounts/{account_id}/d1/database/{database_id}/query
        """
        res = self.client.request(
            "POST",
            f"/accounts/{account_id}/d1/database/{database_id}/query",
            json_body={"sql": sql, "params": params or []},
            step="Execute D1 Query"
        )
        result = res.get("result", [])
        return result if isinstance(result, list) else [result]

    def create_d1_database(self, account_id: str, name: str) -> D1DatabaseDto:
        """
        Creates a new D1 database instance.
        Endpoint: POST /client/v4/accounts/{account_id}/d1/database
        """
        res = self.client.request(
            "POST",
            f"/accounts/{account_id}/d1/database",
            json_body={"name": name},
            step="Create D1 Database"
        )
        result = res.get("result", {})
        return D1DatabaseDto(
            uuid=str(result.get("uuid", "")),
            name=str(result.get("name", name)),
            created_at=result.get("created_at"),
        )

    def initialize_schema(self, account_id: str, database_id: str) -> None:
        """Executes table creation DDL on the remote D1 database."""
        schema_sql = "CREATE TABLE IF NOT EXISTS kv_store (key TEXT PRIMARY KEY, value TEXT);"
        self.execute_query(account_id, database_id, schema_sql)

    def verify_schema(self, account_id: str, database_id: str) -> bool:
        """Verifies that kv_store table exists in the remote D1 database."""
        try:
            res = self.execute_query(
                account_id,
                database_id,
                "SELECT name FROM sqlite_master WHERE type='table' AND name='kv_store';"
            )
            if res and isinstance(res, list):
                rows = res[0].get("results", []) if isinstance(res[0], dict) else []
                return any(r.get("name") == "kv_store" for r in rows if isinstance(r, dict))
            return False
        except Exception:
            return False

    def get_master_key(self, account_id: str, database_id: str) -> Optional[str]:
        """
        Queries D1 kv_store table for the active 'sys_config' record and extracts masterKey.
        Returns the clean master key string, or None if uninitialized.
        """
        try:
            res = self.execute_query(
                account_id,
                database_id,
                "SELECT value FROM kv_store WHERE key = 'sys_config';",
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

    def seed_master_key(
        self,
        account_id: str,
        database_id: str,
        preferred_key: Optional[str] = None
    ) -> str:
        """
        Guarantees that the deployment has an authoritative administrative masterKey.
        1. If an active key already exists in D1 (legacy database), returns it.
        2. Otherwise generates a cryptographically random 24-character hex key
           (12 bytes, matching generateSecureToken() in LuciProxy/src/db/d1.js).
        3. Persists initial system configuration into D1 kv_store WITHOUT redundant
           plaintext secret storage (Worker Secret MASTER_KEY is authoritative).
        Returns: The authoritative administrative master key.
        """
        existing = self.get_master_key(account_id, database_id)
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

        sql = (
            "INSERT INTO kv_store (key, value) VALUES ('sys_config', ?) "
            "ON CONFLICT(key) DO UPDATE SET value = excluded.value;"
        )
        self.execute_query(
            account_id=account_id,
            database_id=database_id,
            sql=sql,
            params=[json.dumps(initial_config)]
        )

        return master_key

