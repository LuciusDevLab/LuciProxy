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

    def correlate_d1_databases(
        self,
        databases: List[Dict[str, Any]],
        workers: List[Dict[str, Any]]
    ) -> Dict[str, List[Dict[str, Any]]]:
        """
        Partitions D1 databases into:
        - 'linked': Databases bound to one or more workers (D1 Name, UUID, Linked Worker Name, Binding Name)
        - 'unassigned': Databases with no worker bindings (D1 Name, UUID, Status: "Unassigned")
        """
        binding_map: Dict[str, List[Dict[str, str]]] = {}
        for w in workers:
            w_name = w.get("name", "Unknown")
            bindings = w.get("d1_bindings", [])
            for b in bindings:
                db_id = getattr(b, "database_id", None) or (b.get("database_id") if isinstance(b, dict) else None)
                b_name = getattr(b, "binding_name", None) or (b.get("binding_name") if isinstance(b, dict) else None) or "IOT_DB"
                if db_id:
                    if db_id not in binding_map:
                        binding_map[db_id] = []
                    binding_map[db_id].append({
                        "worker_name": w_name,
                        "binding_name": b_name
                    })

        linked: List[Dict[str, Any]] = []
        unassigned: List[Dict[str, Any]] = []

        for db in databases:
            db_uuid = db.get("uuid", "")
            if db_uuid in binding_map:
                links = binding_map[db_uuid]
                worker_names = ", ".join(l["worker_name"] for l in links)
                binding_names = ", ".join(l["binding_name"] for l in links)
                linked.append({
                    "uuid": db_uuid,
                    "name": db.get("name", "Unknown"),
                    "worker_name": worker_names,
                    "binding_name": binding_names,
                    "num_tables": db.get("num_tables", 0),
                    "file_size": db.get("file_size", 0),
                    "created_at": db.get("created_at", "Unknown"),
                })
            else:
                unassigned.append({
                    "uuid": db_uuid,
                    "name": db.get("name", "Unknown"),
                    "status": "Unassigned",
                    "num_tables": db.get("num_tables", 0),
                    "file_size": db.get("file_size", 0),
                    "created_at": db.get("created_at", "Unknown"),
                })

        return {
            "linked": linked,
            "unassigned": unassigned
        }
