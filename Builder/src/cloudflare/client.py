"""
LuciProxy Builder - Cloudflare API Client Abstraction Layer
Encapsulates all REST calls to Cloudflare v4 API with timeout, retry,
sanitized error reporting, and mockability.
"""

import json
from typing import Any, Dict, List, Optional, Tuple
import requests

from ..utils.sanitize import sanitize_text
from .exceptions import (
    CloudflareError,
    AuthenticationError,
    ResourceCollisionError,
    ResourceNotFoundError,
    QuotaExceededError
)


class CloudflareClient:
    """Client for interacting with Cloudflare API v4 using an API Token."""

    BASE_URL = "https://api.cloudflare.com/client/v4"
    DEFAULT_TIMEOUT = 30  # seconds

    def __init__(self, token: str, session: Optional[requests.Session] = None):
        cleaned = token.strip() if token else ""
        if not cleaned:
            raise AuthenticationError(
                message="Cloudflare API Token cannot be empty.",
                step="Token Initialization",
                reason="No token provided.",
                suggested_action="Provide a valid Cloudflare API Token."
            )
        if any(c in cleaned for c in ("\r", "\n", " ")):
            raise AuthenticationError(
                message="Cloudflare API Token contains invalid characters or whitespace.",
                step="Token Initialization",
                reason="Malformed token string.",
                suggested_action="Ensure the token was copied completely without linebreaks or spaces."
            )
        self.token = cleaned
        self.session = session or requests.Session()

    def _headers(self, content_type: Optional[str] = "application/json") -> Dict[str, str]:
        headers = {
            "Authorization": f"Bearer {self.token}",
            "User-Agent": "LuciProxy-Builder/1.0",
        }
        if content_type:
            headers["Content-Type"] = content_type
        return headers

    def _request(
        self,
        method: str,
        endpoint: str,
        params: Optional[Dict[str, Any]] = None,
        data: Optional[Any] = None,
        json_body: Optional[Any] = None,
        files: Optional[Dict[str, Any]] = None,
        content_type: Optional[str] = "application/json"
    ) -> Dict[str, Any]:
        url = f"{self.BASE_URL}/{endpoint.lstrip('/')}"
        headers = self._headers(content_type=content_type)

        try:
            resp = self.session.request(
                method=method,
                url=url,
                headers=headers,
                params=params,
                data=data,
                json=json_body,
                files=files,
                timeout=self.DEFAULT_TIMEOUT
            )
        except requests.RequestException as exc:
            raise CloudflareError(
                message=f"Network request to Cloudflare failed: {sanitize_text(str(exc))}",
                step=f"{method} {endpoint}",
                reason="Could not reach Cloudflare API. Check your internet connection or firewall/proxy.",
                suggested_action="Verify connectivity to api.cloudflare.com and retry."
            ) from exc

        # Handle HTTP status codes
        if resp.status_code == 401:
            raise AuthenticationError(
                message="Cloudflare API authentication failed.",
                step="API Token Verification",
                reason="Invalid or expired Cloudflare API Token.",
                suggested_action="Verify your API Token in the Cloudflare dashboard and ensure it has not expired.",
                status_code=401
            )
        elif resp.status_code == 403:
            # Parse body to inspect Cloudflare error codes and messages
            body = {}
            try:
                body = resp.json()
            except Exception:
                pass
            errors = body.get("errors", []) if isinstance(body, dict) else []
            err_msg = "; ".join([e.get("message", "Unknown error") for e in errors if isinstance(e, dict)]) or resp.text
            err_code = errors[0].get("code") if errors and isinstance(errors[0], dict) else None

            # Demultiplex Cloudflare D1 account database quota limit (code 7406) from permission denial
            if err_code == 7406 or "limit reached" in err_msg.lower():
                raise QuotaExceededError(
                    message=f"Cloudflare D1 database limit reached: {err_msg}",
                    step="Create D1 Database",
                    reason="Cloudflare D1 database limit reached for this account.",
                    suggested_action="Delete unused D1 databases in Cloudflare Dashboard or upgrade the account to Workers Paid.",
                    status_code=403
                )

            if method == "POST" and "/d1/database" in endpoint and not endpoint.endswith("/query"):
                raise AuthenticationError(
                    message="Permission denied by Cloudflare API.",
                    step="Create D1 Database",
                    reason="The API Token lacks required permissions for this action.",
                    suggested_action=(
                        "Create a new Cloudflare API Token using the Builder's current preconfigured template / "
                        "ensure D1 Write permission is enabled."
                    ),
                    status_code=403,
                    capability="D1 Write",
                    operation="Create D1 Database",
                    endpoint=f"POST {endpoint}"
                )
            raise AuthenticationError(
                message="Permission denied by Cloudflare API.",
                step=f"{method} {endpoint}",
                reason="The API Token lacks required permissions for this action.",
                suggested_action="Ensure your token has 'Workers Scripts: Edit', 'D1: Edit / Write', and 'Account Settings: Read' permissions.",
                status_code=403
            )
        elif resp.status_code == 429:
            raise QuotaExceededError(
                message="Cloudflare API rate limit exceeded.",
                step=f"{method} {endpoint}",
                reason="Too many requests in a short timeframe.",
                suggested_action="Wait a few moments before trying again.",
                status_code=429
            )

        try:
            body = resp.json()
        except Exception:
            if not resp.ok:
                raise CloudflareError(
                    message=f"Cloudflare returned HTTP {resp.status_code}",
                    step=f"{method} {endpoint}",
                    status_code=resp.status_code
                )
            return {"success": True}

        if not body.get("success", False):
            errors = body.get("errors", [])
            err_msg = "; ".join([e.get("message", "Unknown error") for e in errors]) or resp.text
            err_code = errors[0].get("code") if errors else None

            # D1 or Worker collision
            if err_code in (7400, 7500, 10007) or "already exists" in err_msg.lower():
                raise ResourceCollisionError(
                    message=sanitize_text(err_msg),
                    step=f"{method} {endpoint}",
                    reason="The resource name already exists in this Cloudflare account.",
                    suggested_action="Choose an alternative resource name or reuse the existing resource.",
                    status_code=resp.status_code
                )
            elif err_code in (10009, 7404) or "not found" in err_msg.lower():
                raise ResourceNotFoundError(
                    message=sanitize_text(err_msg),
                    step=f"{method} {endpoint}",
                    status_code=resp.status_code
                )

            raise CloudflareError(
                message=sanitize_text(err_msg),
                step=f"{method} {endpoint}",
                status_code=resp.status_code
            )

        return body

    # 1. User & Token Methods
    def verify_token(self) -> Dict[str, Any]:
        """Validates the API Token or OAuth access token with Cloudflare."""
        if self.token.startswith("cfoat_"):
            # Cloudflare OAuth access tokens authenticate via /user instead of /user/tokens/verify
            res = self._request("GET", "/user")
            return {"status": "active", "id": res.get("result", {}).get("id")}
        res = self._request("GET", "/user/tokens/verify")
        return res.get("result", {})

    def get_user_details(self) -> Dict[str, Any]:
        """Fetches the authenticated user profile (email, id)."""
        res = self._request("GET", "/user")
        return res.get("result", {})

    def list_accounts(self) -> List[Dict[str, Any]]:
        """Lists all accounts accessible with this token."""
        res = self._request("GET", "/accounts")
        return res.get("result", [])

    # 2. Worker Subdomains
    def get_workers_subdomain(self, account_id: str) -> Optional[str]:
        """Gets the account's *.workers.dev subdomain."""
        try:
            res = self._request("GET", f"/accounts/{account_id}/workers/subdomain")
            return res.get("result", {}).get("subdomain")
        except (ResourceNotFoundError, CloudflareError):
            return None

    # 3. Worker Scripts
    def get_worker(self, account_id: str, script_name: str) -> Optional[Dict[str, Any]]:
        """Checks if a worker script exists."""
        try:
            res = self._request("GET", f"/accounts/{account_id}/workers/scripts/{script_name}")
            return res.get("result", {})
        except ResourceNotFoundError:
            return None
        except CloudflareError as e:
            if e.status_code == 404:
                return None
            raise

    def upload_worker_script(
        self,
        account_id: str,
        script_name: str,
        script_code: str,
        bindings: Optional[List[Dict[str, Any]]] = None,
        compatibility_date: str = "2026-10-01",
        compatibility_flags: Optional[List[str]] = None
    ) -> Dict[str, Any]:
        """Uploads a worker script with module metadata and bindings."""
        if compatibility_flags is None:
            compatibility_flags = ["nodejs_compat"]

        metadata = {
            "main_module": "index.js",
            "compatibility_date": compatibility_date,
            "compatibility_flags": compatibility_flags,
            "bindings": bindings or []
        }

        files = {
            "metadata": (None, json.dumps(metadata), "application/json"),
            "index.js": ("index.js", script_code, "application/javascript+module")
        }

        # Don't specify Content-Type header so requests sets multipart boundary automatically
        return self._request(
            method="PUT",
            endpoint=f"/accounts/{account_id}/workers/scripts/{script_name}",
            files=files,
            content_type=None
        )

    def upload_worker_multipart(
        self,
        account_id: str,
        script_name: str,
        files: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Uploads a complete multipart Worker module bundle with metadata and bindings.
        Endpoint: PUT /accounts/{account_id}/workers/scripts/{script_name}
        """
        return self._request(
            method="PUT",
            endpoint=f"/accounts/{account_id}/workers/scripts/{script_name}",
            files=files,
            content_type=None
        )

    def create_workers_subdomain(self, account_id: str, subdomain_name: str) -> Dict[str, Any]:
        """
        Registers an account's *.workers.dev subdomain.
        Endpoint: PUT /accounts/{account_id}/workers/subdomain
        """
        res = self._request(
            method="PUT",
            endpoint=f"/accounts/{account_id}/workers/subdomain",
            json_body={"subdomain": subdomain_name}
        )
        return res.get("result", {})

    def enable_worker_subdomain(self, account_id: str, script_name: str, enabled: bool = True) -> Dict[str, Any]:
        """Enables the *.workers.dev route for the worker."""
        return self._request(
            method="POST",
            endpoint=f"/accounts/{account_id}/workers/scripts/{script_name}/subdomain",
            json_body={"enabled": enabled}
        )

    def get_worker_deployments(self, account_id: str, script_name: str) -> Dict[str, Any]:
        """Retrieves active deployment configuration and history for a Worker script."""
        try:
            res = self._request("GET", f"/accounts/{account_id}/workers/scripts/{script_name}/deployments")
            return res.get("result", {})
        except Exception:
            return {}

    def get_worker_versions(self, account_id: str, script_name: str) -> List[Dict[str, Any]]:
        """Lists registered Worker versions for a script."""
        try:
            res = self._request("GET", f"/accounts/{account_id}/workers/scripts/{script_name}/versions")
            return res.get("result", {}).get("items", [])
        except Exception:
            return []

    def create_worker_deployment(
        self,
        account_id: str,
        script_name: str,
        version_id: str,
        message: Optional[str] = None
    ) -> Dict[str, Any]:
        """Explicitly activates 100% traffic routing for a Worker version."""
        body: Dict[str, Any] = {
            "strategy": "percentage",
            "versions": [{"version_id": version_id, "percentage": 100}]
        }
        if message:
            body["annotations"] = {"workers/message": message}

        res = self._request(
            method="POST",
            endpoint=f"/accounts/{account_id}/workers/scripts/{script_name}/deployments",
            json_body=body
        )
        return res.get("result", {})

    def delete_worker_script(self, account_id: str, script_name: str) -> Dict[str, Any]:
        """Deletes a worker script from Cloudflare."""
        res = self._request(
            method="DELETE",
            endpoint=f"/accounts/{account_id}/workers/scripts/{script_name}"
        )
        return res.get("result", {})

    def put_worker_secret(
        self,
        account_id: str,
        script_name: str,
        secret_name: str,
        secret_text: str
    ) -> Dict[str, Any]:
        """
        Creates or updates a secret for a Cloudflare Worker using the official Secrets API.
        PUT /accounts/{account_id}/workers/scripts/{script_name}/secrets
        """
        cleaned_secret = secret_text.strip() if secret_text else ""
        if not cleaned_secret:
            raise CloudflareError(
                message="Worker secret value cannot be empty.",
                step="Put Worker Secret",
                reason="Empty secret provided."
            )
        res = self._request(
            method="PUT",
            endpoint=f"/accounts/{account_id}/workers/scripts/{script_name}/secrets",
            json_body={
                "name": secret_name,
                "text": cleaned_secret,
                "type": "secret_text"
            }
        )
        return res.get("result", {})

    def list_worker_secrets(self, account_id: str, script_name: str) -> List[Dict[str, Any]]:
        """Lists secrets associated with a Cloudflare Worker script."""
        res = self._request(
            method="GET",
            endpoint=f"/accounts/{account_id}/workers/scripts/{script_name}/secrets"
        )
        return res.get("result", [])


    # 4. D1 Relational SQLite Databases
    def list_d1_databases(self, account_id: str, name: Optional[str] = None) -> List[Dict[str, Any]]:
        """Lists D1 databases in the account."""
        params = {"name": name} if name else None
        res = self._request("GET", f"/accounts/{account_id}/d1/database", params=params)
        return res.get("result", [])

    def create_d1_database(self, account_id: str, name: str) -> Dict[str, Any]:
        """Creates a new D1 SQLite database instance."""
        try:
            res = self._request(
                method="POST",
                endpoint=f"/accounts/{account_id}/d1/database",
                json_body={"name": name}
            )
            return res.get("result", {})
        except AuthenticationError as e:
            if e.status_code == 403:
                raise AuthenticationError(
                    message=f"Permission denied while creating D1 database '{name}'.",
                    step="Create D1 Database",
                    reason="The API Token lacks required permissions for this action.",
                    suggested_action=(
                        "Create a new Cloudflare API Token using the Builder's current preconfigured template / "
                        "ensure D1 Write permission is enabled."
                    ),
                    status_code=403,
                    capability="D1 Write",
                    operation="Create D1 Database",
                    endpoint=f"POST /accounts/{account_id}/d1/database"
                ) from e
            raise

    def delete_d1_database(self, account_id: str, database_id: str) -> Dict[str, Any]:
        """Deletes a D1 SQLite database instance."""
        res = self._request(
            method="DELETE",
            endpoint=f"/accounts/{account_id}/d1/database/{database_id}"
        )
        return res.get("result", {})

    def execute_d1_query(
        self,
        account_id: str,
        database_id: str,
        sql: str,
        params: Optional[List[Any]] = None
    ) -> List[Dict[str, Any]]:
        """Executes a SQL statement on a remote D1 database."""
        res = self._request(
            method="POST",
            endpoint=f"/accounts/{account_id}/d1/database/{database_id}/query",
            json_body={"sql": sql, "params": params or []}
        )
        return res.get("result", [])

    # 5. Active Capability Probes (Preflight)
    def probe_workers_capability(self, account_id: str) -> Tuple[bool, Optional[str]]:
        """
        Actively probes if the token has Workers Scripts edit/write access on the account.
        Returns: (success: bool, error_message: Optional[str])
        """
        try:
            self._request("GET", f"/accounts/{account_id}/workers/scripts")
            return True, None
        except AuthenticationError as e:
            if e.status_code == 403 or "permission" in (e.reason or "").lower():
                return False, "Missing 'Workers Scripts: Edit' permission on the target account."
            return False, e.reason or str(e)
        except CloudflareError as e:
            if e.status_code == 403:
                return False, "Missing 'Workers Scripts: Edit' permission on the target account."
            return False, str(e)
        except Exception as e:
            return False, sanitize_text(str(e))

    def probe_d1_read_capability(self, account_id: str) -> Tuple[bool, Optional[str]]:
        """
        Actively probes if the token has D1 read access on the account.
        Returns: (success: bool, error_message: Optional[str])
        """
        try:
            self._request("GET", f"/accounts/{account_id}/d1/database")
            return True, None
        except AuthenticationError as e:
            if e.status_code == 403 or "permission" in (e.reason or "").lower():
                return False, "Missing 'D1 Read' permission on the target account."
            return False, e.reason or str(e)
        except CloudflareError as e:
            if e.status_code == 403:
                return False, "Missing 'D1 Read' permission on the target account."
            return False, str(e)
        except Exception as e:
            return False, sanitize_text(str(e))

    def probe_d1_write_capability(self, account_id: str) -> Tuple[bool, Optional[str]]:
        """
        Actively probes if the token has D1 write/creation access on the account.
        Uses a non-destructive probe to POST /accounts/{account_id}/d1/database with empty body.
        Cloudflare validates authorization before schema validation:
        - HTTP 403 indicates missing D1 Write permission.
        - HTTP 400 indicates authorization succeeded (payload rejected by schema validator, no DB created).
        Returns: (success: bool, error_message: Optional[str])
        """
        try:
            self._request("POST", f"/accounts/{account_id}/d1/database", json_body={})
            return True, None
        except QuotaExceededError:
            # Cloudflare D1 account database limit reached confirms write authorization succeeded
            return True, None
        except AuthenticationError as e:
            if e.status_code == 403 or "permission" in (e.reason or "").lower():
                return False, (
                    "Missing 'D1 Write' permission on the target account "
                    f"(POST /accounts/{account_id}/d1/database returned HTTP 403 Forbidden). "
                    "Ensure your token has 'Account > D1 > Edit' permission enabled."
                )
            return False, e.reason or str(e)
        except CloudflareError as e:
            if e.status_code == 403:
                return False, (
                    "Missing 'D1 Write' permission on the target account "
                    f"(POST /accounts/{account_id}/d1/database returned HTTP 403 Forbidden). "
                    "Ensure your token has 'Account > D1 > Edit' permission enabled."
                )
            elif e.status_code == 400:
                # HTTP 400 Bad Request confirms token is authorized for POST /d1/database
                return True, None
            return False, str(e)
        except Exception as e:
            return False, sanitize_text(str(e))

    def probe_d1_capability(self, account_id: str) -> Tuple[bool, Optional[str]]:
        """
        Actively probes D1 access on the account, validating BOTH Read and Write capabilities.
        Will NOT report success if D1 Write capability is missing.
        Returns: (success: bool, error_message: Optional[str])
        """
        read_ok, read_err = self.probe_d1_read_capability(account_id)
        if not read_ok:
            return False, read_err

        write_ok, write_err = self.probe_d1_write_capability(account_id)
        if not write_ok:
            return False, write_err

        return True, None

    def probe_subdomain_capability(self, account_id: str) -> Tuple[bool, Optional[str], Optional[str]]:
        """
        Probes workers.dev subdomain availability and permissions.
        Returns: (is_accessible: bool, subdomain: Optional[str], error_or_info: Optional[str])
        """
        try:
            res = self._request("GET", f"/accounts/{account_id}/workers/subdomain")
            subdomain = res.get("result", {}).get("subdomain")
            return True, subdomain, None
        except ResourceNotFoundError:
            return True, None, "Account does not have a workers.dev subdomain registered yet."
        except AuthenticationError as e:
            if e.status_code == 403 or "permission" in (e.reason or "").lower():
                return False, None, "Missing 'Workers Scripts: Edit' permission to query workers.dev subdomain."
            return False, None, e.reason or str(e)
        except CloudflareError as e:
            if e.status_code == 404:
                return True, None, "Account does not have a workers.dev subdomain registered yet."
            elif e.status_code == 403:
                return False, None, "Missing 'Workers Scripts: Edit' permission to query workers.dev subdomain."
            return False, None, str(e)
        except Exception as e:
            return False, None, sanitize_text(str(e))


