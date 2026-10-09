"""
LuciProxy PYandroid - Bridge Interface Facade.
High-level, thread-safe entrypoint for native Android (Kotlin / Java) via Chaquopy.
All operations return structured JSON-serializable dictionaries.
Tokens exist in memory only during call execution.
"""

import json
from typing import Any, Callable, Dict, List, Optional

try:
    from ..core.client import PortableCloudflareClient, CloudflareApiError
    from ..core.deployment import DeploymentEngine
    from ..core.naming import (
        generate_token_name,
        generate_random_api_route,
        validate_api_route,
        generate_panel_url,
        generate_worker_name,
        generate_d1_name,
        build_token_creation_url,
    )
    from ..core.version_checker import PortableVersionChecker
except (ImportError, ValueError):
    from core.client import PortableCloudflareClient, CloudflareApiError
    from core.deployment import DeploymentEngine
    from core.naming import (
        generate_token_name,
        generate_random_api_route,
        validate_api_route,
        generate_panel_url,
        generate_worker_name,
        generate_d1_name,
        build_token_creation_url,
    )
    from core.version_checker import PortableVersionChecker


class LuciproxyBridge:
    """Thread-safe native bridge facade for Android applications."""

    @staticmethod
    def generate_token_name() -> str:
        """Generates a neutral random token name."""
        return generate_token_name()

    @staticmethod
    def generate_worker_name() -> str:
        """Generates a neutral random worker name."""
        return generate_worker_name()

    @staticmethod
    def generate_d1_name() -> str:
        """Generates a neutral random D1 database name."""
        return generate_d1_name()

    @staticmethod
    def generate_random_api_route() -> str:
        """Generates a randomized API route."""
        return generate_random_api_route(10)

    @staticmethod
    def build_token_creation_url(token_name: Optional[str] = None) -> str:
        """Generates the official Cloudflare API Token creation URL with required permissions."""
        return build_token_creation_url(token_name)

    @staticmethod
    def verify_token(token: str) -> Dict[str, Any]:
        """
        Verifies Cloudflare API Token validity.
        Returns: {"success": bool, "valid": bool, "status": str, "error": Optional[str]}
        """
        try:
            client = PortableCloudflareClient(token=token)
            dto = client.verify_token()
            return {
                "success": True,
                "valid": dto.valid,
                "status": dto.status,
                "token_id": dto.token_id,
                "expires_on": dto.expires_on,
            }
        except Exception as e:
            return {
                "success": False,
                "valid": False,
                "status": "error",
                "error": str(e),
            }

    @staticmethod
    def list_accounts(token: str) -> Dict[str, Any]:
        """
        Discovers all Cloudflare accounts accessible with this token.
        Returns: {"success": bool, "accounts": List[{"id": str, "name": str}]}
        """
        try:
            client = PortableCloudflareClient(token=token)
            accounts = client.list_accounts()
            return {
                "success": True,
                "accounts": [a.to_dict() for a in accounts],
            }
        except Exception as e:
            return {
                "success": False,
                "accounts": [],
                "error": str(e),
            }

    @staticmethod
    def get_account_details(token: str, account_id: str) -> Dict[str, Any]:
        """
        Fetches comprehensive account details:
        - Daily request invocations (real GraphQL usage, authoritative quota)
        - Active workers with linked D1 databases
        - D1 database inventory partitioned into linked and unassigned
        """
        try:
            client = PortableCloudflareClient(token=token)
            workers = client.list_workers(account_id)
            d1_list = client.list_d1_databases(account_id)
            analytics = client.get_worker_analytics(account_id)

            # Partition D1 into linked and unassigned
            linked_d1_ids = set()
            for w in workers:
                for b in w.d1_bindings:
                    if b.database_id:
                        linked_d1_ids.add(b.database_id)

            linked_dbs = []
            unassigned_dbs = []
            for db in d1_list:
                db_id = db.get("uuid") or db.get("id") or ""
                db_dict = {
                    "id": db_id,
                    "name": db.get("name", "Unknown"),
                    "num_tables": db.get("num_tables", 0),
                }
                if db_id in linked_d1_ids:
                    linked_dbs.append(db_dict)
                else:
                    unassigned_dbs.append(db_dict)

            return {
                "success": True,
                "account_id": account_id,
                "analytics": analytics,
                "workers": [w.to_dict() for w in workers],
                "d1_linked": linked_dbs,
                "d1_unassigned": unassigned_dbs,
            }
        except Exception as e:
            return {
                "success": False,
                "error": str(e),
            }

    @staticmethod
    def deploy_worker(
        token: str,
        account_id: str,
        worker_name: Optional[str] = None,
        d1_name: Optional[str] = None,
        progress_callback: Optional[Callable[[int, int, str, str], None]] = None,
    ) -> Dict[str, Any]:
        """Deploys a new Worker with dedicated D1 database and random API route."""
        try:
            client = PortableCloudflareClient(token=token)
            engine = DeploymentEngine(client)
            result = engine.deploy_worker(
                account_id=account_id,
                worker_name=worker_name,
                d1_name=d1_name,
                progress_callback=progress_callback,
            )
            return result.to_dict()
        except Exception as e:
            return {
                "success": False,
                "error": str(e),
            }

    @staticmethod
    def update_worker(token: str, account_id: str, worker_name: str) -> Dict[str, Any]:
        """
        Upgrades an existing Worker to canonical v1.2.1.
        Strictly preserves existing D1 database, UUID, and route.
        """
        try:
            client = PortableCloudflareClient(token=token)
            engine = DeploymentEngine(client)
            result = engine.update_worker(
                account_id=account_id,
                worker_name=worker_name,
            )
            return result.to_dict()
        except Exception as e:
            return {
                "success": False,
                "error": str(e),
            }

    @staticmethod
    def delete_worker(token: str, account_id: str, worker_name: str) -> Dict[str, Any]:
        """
        Deletes a Worker script from Cloudflare.
        STRICTLY PRESERVES existing D1 databases and tables!
        """
        try:
            client = PortableCloudflareClient(token=token)
            engine = DeploymentEngine(client)
            ok = engine.delete_worker(account_id=account_id, worker_name=worker_name)
            return {
                "success": ok,
                "worker_name": worker_name,
                "d1_preserved": True,
            }
        except Exception as e:
            return {
                "success": False,
                "error": str(e),
            }

    @classmethod
    def verify_token_json(cls, token: str) -> str:
        """Verifies API token and returns result as standard JSON string."""
        return json.dumps(cls.verify_token(token))

    @classmethod
    def list_accounts_json(cls, token: str) -> str:
        """Lists accessible accounts and returns result as standard JSON string."""
        return json.dumps(cls.list_accounts(token))

    @classmethod
    def get_account_details_json(cls, token: str, account_id: str) -> str:
        """Fetches account details and returns result as standard JSON string."""
        return json.dumps(cls.get_account_details(token, account_id))

    @classmethod
    def deploy_worker_json(
        cls,
        token: str,
        account_id: str,
        worker_name: Optional[str] = None,
        d1_name: Optional[str] = None,
        progress_callback: Optional[Callable[[int, int, str, str], None]] = None,
    ) -> str:
        """Deploys a new worker and returns result as standard JSON string."""
        return json.dumps(cls.deploy_worker(token, account_id, worker_name, d1_name, progress_callback))

    @classmethod
    def update_worker_json(cls, token: str, account_id: str, worker_name: str) -> str:
        """Updates worker in-place and returns result as standard JSON string."""
        return json.dumps(cls.update_worker(token, account_id, worker_name))

    @classmethod
    def delete_worker_json(cls, token: str, account_id: str, worker_name: str) -> str:
        """Deletes worker script and returns result as standard JSON string."""
        return json.dumps(cls.delete_worker(token, account_id, worker_name))

    @classmethod
    def build_token_creation_url_json(cls, token_name: Optional[str] = None) -> str:
        """Returns token creation URL as JSON string."""
        return json.dumps({"url": cls.build_token_creation_url(token_name)})

    @staticmethod
    def check_updates(
        platform: str = "android",
        installed_app_version: str = "2.0.0",
        managed_workers: Optional[List[Dict[str, Any]]] = None,
        force_remote: bool = False
    ) -> Dict[str, Any]:
        """Checks for Worker and Manager application updates."""
        try:
            checker = PortableVersionChecker()
            return checker.check_all(
                platform=platform,
                installed_app_version=installed_app_version,
                managed_workers=managed_workers,
                force_remote=force_remote
            )
        except Exception as e:
            return {
                "success": False,
                "error": str(e),
                "platform": platform,
                "worker_release": None,
                "app_release": None,
                "app_evaluation": {
                    "installed_version": installed_app_version,
                    "available_version": None,
                    "status": "check_failed",
                    "status_label": "Check failed",
                    "has_update": False
                },
                "worker_evaluations": [],
                "workers_needing_update_count": 0,
                "worker_notification": None,
                "app_notification": None
            }

    @classmethod
    def check_updates_json(
        cls,
        platform: str = "android",
        installed_app_version: str = "2.0.0",
        managed_workers_json: Optional[str] = None,
        force_remote: bool = False
    ) -> str:
        """Checks updates and returns result as standard JSON string."""
        workers = []
        if managed_workers_json:
            try:
                workers = json.loads(managed_workers_json)
            except Exception:
                pass
        return json.dumps(cls.check_updates(
            platform=platform,
            installed_app_version=installed_app_version,
            managed_workers=workers,
            force_remote=force_remote
        ))

