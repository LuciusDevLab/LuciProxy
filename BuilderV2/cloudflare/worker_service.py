"""
LuciProxy Manager - Cloudflare Worker Service.
Handles Worker listing, settings, bindings inspection, D1 binding discovery,
deployments, and subdomain discovery.

Strict Behavioral Invariant:
discover_worker_d1_bindings() inspects official Cloudflare bindings directly
and returns ALL discovered D1 bindings without ever silently picking one.
"""

from typing import Any, Dict, List, Optional

from .client import CloudflareClient
from .d1_service import D1Service
from .models import (
    WorkerSummaryDto,
    WorkerBindingDto,
    DiscoveredD1BindingDto,
    WorkerDeploymentDto,
)
from .exceptions import ResourceNotFoundError


class WorkerService:
    """Service for interacting with Cloudflare Worker scripts and configuration."""

    def __init__(self, client: CloudflareClient, d1_service: Optional[D1Service] = None):
        self.client = client
        self.d1_service = d1_service or D1Service(client)

    def list_workers(self, account_id: str) -> List[WorkerSummaryDto]:
        """
        Lists all Worker scripts in an account, handling pagination automatically.
        Endpoint: GET /client/v4/accounts/{account_id}/workers/scripts
        """
        raw_items = self.client.paginate(
            f"/accounts/{account_id}/workers/scripts",
            step="List Workers"
        )

        workers: List[WorkerSummaryDto] = []
        for item in raw_items:
            w_id = str(item.get("id", item.get("name", ""))).strip()
            w_name = str(item.get("name", w_id)).strip()
            if w_id:
                workers.append(
                    WorkerSummaryDto(
                        id=w_id,
                        name=w_name,
                        created_on=item.get("created_on"),
                        modified_on=item.get("modified_on"),
                        usage_model=item.get("usage_model"),
                        tags=item.get("tags") or [],
                    )
                )
        return workers

    def get_worker(self, account_id: str, script_name: str) -> Optional[WorkerSummaryDto]:
        """
        Retrieves top-level metadata for a specific Worker script.
        Endpoint: GET /client/v4/accounts/{account_id}/workers/scripts/{script_name}
        """
        try:
            res = self.client.request(
                "GET",
                f"/accounts/{account_id}/workers/scripts/{script_name}",
                step="Get Worker Script"
            )
            item = res.get("result", {})
            if not item:
                return None
            return WorkerSummaryDto(
                id=str(item.get("id", script_name)),
                name=str(item.get("name", script_name)),
                created_on=item.get("created_on"),
                modified_on=item.get("modified_on"),
                usage_model=item.get("usage_model"),
                tags=item.get("tags") or [],
            )
        except ResourceNotFoundError:
            return None

    def get_worker_settings(self, account_id: str, script_name: str) -> Dict[str, Any]:
        """
        Retrieves official Worker script settings and bindings.
        Endpoint: GET /client/v4/accounts/{account_id}/workers/scripts/{script_name}/settings
        Fallback: GET /client/v4/accounts/{account_id}/workers/scripts/{script_name}/bindings
        """
        try:
            res = self.client.request(
                "GET",
                f"/accounts/{account_id}/workers/scripts/{script_name}/settings",
                step="Get Worker Settings"
            )
            return res.get("result", {})
        except ResourceNotFoundError:
            # Attempt bindings endpoint directly as fallback
            try:
                b_res = self.client.request(
                    "GET",
                    f"/accounts/{account_id}/workers/scripts/{script_name}/bindings",
                    step="Get Worker Bindings Fallback"
                )
                return {"bindings": b_res.get("result", [])}
            except Exception:
                return {}

    def get_worker_bindings(self, account_id: str, script_name: str) -> List[WorkerBindingDto]:
        """
        Extracts and normalizes all bindings declared on the Worker script.
        """
        settings = self.get_worker_settings(account_id, script_name)
        raw_bindings = settings.get("bindings", [])
        if not isinstance(raw_bindings, list):
            raw_bindings = []

        bindings: List[WorkerBindingDto] = []
        for b in raw_bindings:
            if not isinstance(b, dict):
                continue
            b_type = str(b.get("type", "")).strip().lower()
            b_name = str(b.get("name", "")).strip()
            # In Cloudflare API, D1 database id is stored in 'id' or 'database_id'
            d1_id = b.get("id") or b.get("database_id")
            kv_id = b.get("namespace_id")

            bindings.append(
                WorkerBindingDto(
                    type=b_type,
                    name=b_name,
                    database_id=str(d1_id) if d1_id else None,
                    namespace_id=str(kv_id) if kv_id else None,
                    raw=b,
                )
            )
        return bindings

    def discover_worker_d1_bindings(
        self,
        account_id: str,
        script_name: str
    ) -> List[DiscoveredD1BindingDto]:
        """
        CRITICAL SPECIFICATION METHOD:
        1. Queries actual Worker bindings from Cloudflare.
        2. Filters bindings with type == 'd1'.
        3. Extracts binding name and database_id.
        4. Resolves remote D1 metadata via D1Service.
        5. Returns ALL discovered D1 bindings without ever silently picking one.
        """
        all_bindings = self.get_worker_bindings(account_id, script_name)
        d1_bindings = [b for b in all_bindings if b.type == "d1" and b.database_id]

        discovered: List[DiscoveredD1BindingDto] = []
        for b in d1_bindings:
            db_id = b.database_id
            db_meta = None
            db_name = None
            try:
                db_meta = self.d1_service.get_d1_database(account_id, db_id)
                if db_meta:
                    db_name = db_meta.name
            except Exception:
                pass

            discovered.append(
                DiscoveredD1BindingDto(
                    binding_name=b.name,
                    database_id=db_id,
                    database_name=db_name,
                    database=db_meta,
                )
            )

        return discovered

    def get_account_subdomain(self, account_id: str) -> Optional[str]:
        """
        Retrieves the account's *.workers.dev subdomain.
        Endpoint: GET /client/v4/accounts/{account_id}/workers/subdomain
        """
        try:
            res = self.client.request(
                "GET",
                f"/accounts/{account_id}/workers/subdomain",
                step="Get Workers Subdomain"
            )
            result = res.get("result", {})
            return result.get("subdomain")
        except ResourceNotFoundError:
            return None

    def get_worker_deployments(
        self,
        account_id: str,
        script_name: str
    ) -> Optional[WorkerDeploymentDto]:
        """
        Retrieves deployment and version annotations for a Worker script.
        Endpoint: GET /client/v4/accounts/{account_id}/workers/scripts/{script_name}/deployments
        """
        try:
            res = self.client.request(
                "GET",
                f"/accounts/{account_id}/workers/scripts/{script_name}/deployments",
                step="Get Worker Deployments"
            )
            result = res.get("result", {})
            deployments = result.get("deployments", [])
            if not deployments and isinstance(result, list):
                deployments = result

            if deployments and isinstance(deployments[0], dict):
                first = deployments[0]
                return WorkerDeploymentDto(
                    id=first.get("id"),
                    version_id=first.get("version_id"),
                    created_on=first.get("created_on"),
                    annotations=first.get("annotations") or {},
                )
            return None
        except Exception:
            return None

    def upload_worker_multipart(
        self,
        account_id: str,
        script_name: str,
        files: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Uploads a complete multipart Worker module bundle with metadata and bindings.
        Endpoint: PUT /client/v4/accounts/{account_id}/workers/scripts/{script_name}
        """
        return self.client.request(
            method="PUT",
            endpoint=f"/accounts/{account_id}/workers/scripts/{script_name}",
            files=files,
            content_type=None,
            step="Upload Worker Script"
        )

    def put_worker_secret(
        self,
        account_id: str,
        script_name: str,
        secret_name: str,
        secret_text: str
    ) -> Dict[str, Any]:
        """
        Sets a Worker secret variable via Cloudflare Workers Secrets API.
        Endpoint: PUT /client/v4/accounts/{account_id}/workers/scripts/{script_name}/secrets
        """
        if not secret_text or not secret_text.strip():
            raise ValueError("Secret text cannot be empty.")
        payload = {
            "name": secret_name,
            "text": secret_text.strip(),
            "type": "secret_text"
        }
        return self.client.request(
            method="PUT",
            endpoint=f"/accounts/{account_id}/workers/scripts/{script_name}/secrets",
            json_body=payload,
            step="Put Worker Secret"
        )

    def enable_worker_subdomain(
        self,
        account_id: str,
        script_name: str,
        enabled: bool = True
    ) -> Dict[str, Any]:
        """
        Enables or disables the *.workers.dev route for a Worker script.
        Endpoint: POST /client/v4/accounts/{account_id}/workers/scripts/{script_name}/subdomain
        """
        return self.client.request(
            method="POST",
            endpoint=f"/accounts/{account_id}/workers/scripts/{script_name}/subdomain",
            json_body={"enabled": enabled},
            step="Enable Worker Subdomain Route"
        )

    def create_subdomain(
        self,
        account_id: str,
        subdomain_name: str
    ) -> Dict[str, Any]:
        """
        Registers an account's *.workers.dev subdomain prefix.
        Endpoint: PUT /client/v4/accounts/{account_id}/workers/subdomain
        """
        return self.client.request(
            method="PUT",
            endpoint=f"/accounts/{account_id}/workers/subdomain",
            json_body={"subdomain": subdomain_name},
            step="Create Account Subdomain"
        )

