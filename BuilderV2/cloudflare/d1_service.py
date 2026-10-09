"""
LuciProxy Manager - Cloudflare D1 Service.
Handles D1 database listing, metadata discovery, query execution, and database details.
"""

import json
import secrets
from typing import Any, Dict, List, Optional, Tuple
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

    def get_sys_config(self, account_id: str, database_id: str) -> Optional[Dict[str, Any]]:
        """
        Queries D1 kv_store table for the active 'sys_config' record and parses JSON.
        Returns the dictionary or None if uninitialized.
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
                        return json.loads(raw_val)
            return None
        except Exception:
            return None

    def get_api_route(self, account_id: str, database_id: str) -> Optional[str]:
        """Returns the active apiRoute stored in D1 sys_config, or None if not set."""
        cfg = self.get_sys_config(account_id, database_id)
        if cfg and isinstance(cfg, dict):
            route = cfg.get("apiRoute")
            if route and isinstance(route, str) and route.strip():
                return route.strip()
        return None

    def get_master_key(self, account_id: str, database_id: str) -> Optional[str]:
        """
        Queries D1 kv_store table for the active 'sys_config' record and extracts masterKey.
        Returns the clean master key string, or None if uninitialized.
        """
        try:
            cfg = self.get_sys_config(account_id, database_id)
            if cfg and isinstance(cfg, dict):
                key = cfg.get("masterKey")
                if key and isinstance(key, str) and key.strip():
                    return key.strip()
            return None
        except Exception:
            return None

    def seed_initial_config(
        self,
        account_id: str,
        database_id: str,
        preferred_key: Optional[str] = None,
        api_route: Optional[str] = None
    ) -> Tuple[str, str]:
        """
        Guarantees that the deployment has an authoritative administrative masterKey and apiRoute.
        1. If active config already exists in D1, preserves existing key and apiRoute.
        2. Otherwise generates random key and random apiRoute, and seeds sys_config into D1.
        Returns: Tuple[master_key, active_api_route].
        """
        existing_cfg = self.get_sys_config(account_id, database_id)
        if existing_cfg and isinstance(existing_cfg, dict):
            existing_key = existing_cfg.get("masterKey")
            existing_route = existing_cfg.get("apiRoute") or "sync"
            resolved_key = (existing_key or (preferred_key or secrets.token_hex(12))).strip()
            return (resolved_key, existing_route)

        from ..deployment.naming import generate_random_api_route
        master_key = (preferred_key or secrets.token_hex(12)).strip()
        route = (api_route or generate_random_api_route(10)).strip()
        device_id = str(uuid.uuid4())

        initial_config = {
            "name": "LuciProxy",
            "masterKey": master_key,
            "apiRoute": route,
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

        return (master_key, route)

    def seed_master_key(
        self,
        account_id: str,
        database_id: str,
        preferred_key: Optional[str] = None,
        api_route: Optional[str] = None
    ) -> str:
        """
        Guarantees that the deployment has an authoritative administrative masterKey.
        Returns: The authoritative administrative master key.
        """
        key, _ = self.seed_initial_config(account_id, database_id, preferred_key, api_route)
        return key

