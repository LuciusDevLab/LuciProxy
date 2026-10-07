"""
LuciProxy Manager - Cloudflare API Client Foundation.
Encapsulates all HTTP operations, GraphQL queries, connection pooling,
rate-limit handling, retry strategies, and sanitized error mapping.

Strict Security Invariants:
1. API token is consumed exclusively via Authorization: Bearer <token>.
2. Tokens are NEVER logged, printed, or exposed in exceptions.
3. Non-safe mutations (POST, PUT, DELETE) are NEVER retried blindly.
"""

import json
import time
from typing import Any, Dict, List, Optional, Tuple
import requests

from .exceptions import (
    CloudflareApiError,
    AuthenticationError,
    PermissionDeniedError,
    ResourceNotFoundError,
    ConflictError,
    RateLimitError,
    CloudflareUnavailableError,
    NetworkConnectionError,
    MalformedApiResponseError,
    GraphQLError,
    sanitize_message,
)


class CloudflareClient:
    """Core REST and GraphQL client for Cloudflare API v4."""

    BASE_URL = "https://api.cloudflare.com/client/v4"
    DEFAULT_TIMEOUT = 30  # seconds
    MAX_RETRIES = 3

    def __init__(
        self,
        token: str,
        session: Optional[requests.Session] = None,
        base_url: Optional[str] = None,
        timeout: int = DEFAULT_TIMEOUT
    ):
        cleaned_token = str(token or "").strip()
        if not cleaned_token:
            raise AuthenticationError("Cloudflare API Token cannot be empty.", step="Client Initialization")
        self._token = cleaned_token
        self.base_url = (base_url or self.BASE_URL).rstrip("/")
        self.session = session or requests.Session()
        self.timeout = timeout

    def _headers(self, content_type: Optional[str] = "application/json") -> Dict[str, str]:
        headers = {
            "Authorization": f"Bearer {self._token}",
            "User-Agent": "LuciProxy-Manager/2.0",
        }
        if content_type:
            headers["Content-Type"] = content_type
        return headers

    def request(
        self,
        method: str,
        endpoint: str,
        params: Optional[Dict[str, Any]] = None,
        json_body: Optional[Any] = None,
        data: Optional[Any] = None,
        files: Optional[Dict[str, Any]] = None,
        content_type: Optional[str] = "application/json",
        step: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Executes an HTTP request against Cloudflare API v4 with error mapping and rate-limit backoff.
        Safe GET requests may retry on HTTP 429; unsafe mutations are never retried blindly.
        """
        url = f"{self.base_url}/{endpoint.lstrip('/')}"
        method_upper = method.upper()
        headers = self._headers(content_type=content_type)
        step_name = step or f"{method_upper} {endpoint}"

        retries = 0
        while True:
            try:
                resp = self.session.request(
                    method=method_upper,
                    url=url,
                    headers=headers,
                    params=params,
                    json=json_body,
                    data=data,
                    files=files,
                    timeout=self.timeout
                )
            except requests.RequestException as exc:
                raise NetworkConnectionError(
                    f"Network connection to Cloudflare failed: {exc}",
                    step=step_name
                ) from exc

            # Rate Limit (HTTP 429) Handling
            if resp.status_code == 429:
                retry_after_hdr = resp.headers.get("Retry-After")
                retry_after_sec = int(retry_after_hdr) if retry_after_hdr and retry_after_hdr.isdigit() else 2 ** retries

                # Only retry safe idempotent GET requests with bounded backoff
                if method_upper == "GET" and retries < self.MAX_RETRIES and retry_after_sec <= 10:
                    retries += 1
                    time.sleep(retry_after_sec)
                    continue

                raise RateLimitError(
                    "Cloudflare API rate limit exceeded.",
                    retry_after=retry_after_sec,
                    status_code=429,
                    step=step_name
                )

            # Cloudflare Unavailable (5xx) Handling
            if 500 <= resp.status_code <= 599:
                raise CloudflareUnavailableError(
                    f"Cloudflare service is temporarily unavailable (HTTP {resp.status_code}).",
                    status_code=resp.status_code,
                    step=step_name
                )

            # Parse JSON Response
            try:
                body = resp.json()
            except Exception as e:
                if resp.status_code == 401:
                    raise AuthenticationError("Invalid or expired Cloudflare API Token.", status_code=401, step=step_name)
                elif resp.status_code == 403:
                    raise PermissionDeniedError("Insufficient permissions on Cloudflare API Token.", status_code=403, step=step_name)
                elif resp.status_code == 404:
                    raise ResourceNotFoundError(f"Resource not found: {endpoint}", status_code=404, step=step_name)
                raise MalformedApiResponseError(
                    f"Invalid non-JSON response from Cloudflare: {resp.text[:200]}",
                    status_code=resp.status_code,
                    step=step_name
                ) from e

            # Extract Cloudflare API Errors if success is False
            if "success" in body:
                is_success = bool(body["success"])
            else:
                is_success = resp.ok
            if not is_success:
                errors = body.get("errors", [])
                err_msg = "; ".join([e.get("message", "Unknown error") for e in errors if isinstance(e, dict)]) or "Cloudflare API request failed"

                if resp.status_code == 401:
                    raise AuthenticationError(err_msg, status_code=401, errors=errors, step=step_name)
                elif resp.status_code == 403:
                    raise PermissionDeniedError(err_msg, status_code=403, errors=errors, step=step_name)
                elif resp.status_code == 404:
                    raise ResourceNotFoundError(err_msg, status_code=404, errors=errors, step=step_name)
                elif resp.status_code in (409, 400) and any("already exists" in e.get("message", "").lower() for e in errors if isinstance(e, dict)):
                    raise ConflictError(err_msg, status_code=resp.status_code, errors=errors, step=step_name)
                else:
                    raise CloudflareApiError(err_msg, status_code=resp.status_code, errors=errors, step=step_name)

            return body

    # =========================================================================
    # PAGINATION HELPER
    # =========================================================================

    def paginate(
        self,
        endpoint: str,
        params: Optional[Dict[str, Any]] = None,
        page_size: int = 50,
        step: Optional[str] = None
    ) -> List[Dict[str, Any]]:
        """
        Paginates through a Cloudflare list endpoint returning unified complete items list.
        """
        all_items: List[Dict[str, Any]] = []
        curr_page = 1
        query_params = dict(params or {})
        query_params["per_page"] = page_size

        while True:
            query_params["page"] = curr_page
            res = self.request(
                "GET",
                endpoint,
                params=query_params,
                step=f"{step or endpoint} (page {curr_page})"
            )
            items = res.get("result", [])
            if not isinstance(items, list):
                break
            all_items.extend(items)

            result_info = res.get("result_info", {})
            total_count = result_info.get("total_count")
            count = result_info.get("count", len(items))

            if count < page_size:
                break
            if total_count is not None and len(all_items) >= total_count:
                break

            curr_page += 1

        return all_items

    # =========================================================================
    # GRAPHQL ANALYTICS
    # =========================================================================

    def graphql(
        self,
        query: str,
        variables: Optional[Dict[str, Any]] = None,
        step: Optional[str] = "GraphQL Analytics Query"
    ) -> Dict[str, Any]:
        """
        Executes a GraphQL query against Cloudflare Analytics API (POST /graphql).
        Parses GraphQL-level errors and returns data payload.
        """
        payload = {"query": query, "variables": variables or {}}
        res = self.request("POST", "/graphql", json_body=payload, step=step)

        # Inspect GraphQL errors array
        if "errors" in res and res["errors"]:
            gql_errors = res["errors"]
            msg = "; ".join([e.get("message", "GraphQL error") for e in gql_errors if isinstance(e, dict)])
            raise GraphQLError(msg, graphql_errors=gql_errors, step=step)

        return res.get("data", {})
