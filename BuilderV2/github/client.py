"""
LuciProxy Manager - GitHub HTTP Client Layer.
Centralized HTTP client abstraction for interacting with GitHub Releases API.
Implements ETag caching (If-None-Match / HTTP 304), rate limit inspection,
credential isolation (zero Cloudflare token transmission), and resilient error handling.
"""

import time
from typing import Any, Dict, List, Optional
import requests
from requests.adapters import HTTPAdapter
from urllib3.util.retry import Retry

from .exceptions import (
    GitHubApiError,
    GitHubRateLimitError,
    MalformedResponseError,
    NetworkTimeoutError,
    ResourceNotFoundError,
)
from .models import CacheInfo


class _CacheEntry:
    def __init__(self, etag: Optional[str], data: Any, cached_at: float):
        self.etag = etag
        self.data = data
        self.cached_at = cached_at
        self.last_refresh = cached_at


class GitHubClient:
    """
    HTTP client for GitHub REST API (https://api.github.com).
    Encapsulates ETag caching, rate-limit backoff, and timeouts.
    """

    DEFAULT_API_BASE = "https://api.github.com"
    DEFAULT_OWNER = "LuciusDevLab"
    DEFAULT_REPO = "LuciProxy"
    DEFAULT_MIN_CHECK_INTERVAL = 3600  # 1 hour default automated interval

    def __init__(
        self,
        owner: str = DEFAULT_OWNER,
        repo: str = DEFAULT_REPO,
        api_base: str = DEFAULT_API_BASE,
        github_token: Optional[str] = None,
        timeout: int = 15,
        min_check_interval: int = DEFAULT_MIN_CHECK_INTERVAL,
        session: Optional[requests.Session] = None
    ):
        self.owner = owner
        self.repo = repo
        self.api_base = api_base.rstrip("/")
        self.github_token = github_token.strip() if github_token else None
        self.timeout = timeout
        self.min_check_interval = min_check_interval

        # Internal ETag cache: endpoint -> _CacheEntry
        self._cache: Dict[str, _CacheEntry] = {}

        if session is not None:
            self.session = session
        else:
            self.session = requests.Session()
            retries = Retry(
                total=2,
                backoff_factor=1.0,
                status_forcelist=[500, 502, 503, 504],
                raise_on_status=False
            )
            adapter = HTTPAdapter(max_retries=retries, pool_connections=5, pool_maxsize=10)
            self.session.mount("https://", adapter)
            self.session.mount("http://", adapter)

    def _default_headers(self) -> Dict[str, str]:
        headers = {
            "Accept": "application/vnd.github+json",
            "User-Agent": "LuciProxy-Manager/2.0",
            "X-GitHub-Api-Version": "2022-11-28",
        }
        # Optional GitHub Personal Access Token for higher rate limits (NEVER Cloudflare tokens!)
        if self.github_token:
            headers["Authorization"] = f"token {self.github_token}"
        return headers

    def get_cache_info(self, endpoint: str) -> Optional[CacheInfo]:
        """Returns cache metadata for an endpoint if present in cache."""
        entry = self._cache.get(endpoint)
        if not entry:
            return None
        now = time.time()
        return CacheInfo(
            etag=entry.etag,
            cached_at=entry.cached_at,
            last_refresh=entry.last_refresh,
            age_seconds=now - entry.last_refresh,
        )

    def clear_cache(self, endpoint: Optional[str] = None) -> None:
        """Clears cache for a specific endpoint or all endpoints."""
        if endpoint:
            self._cache.pop(endpoint, None)
        else:
            self._cache.clear()

    def request(
        self,
        method: str,
        endpoint: str,
        params: Optional[Dict[str, Any]] = None,
        use_cache: bool = True,
        force_refresh: bool = False,
        step: Optional[str] = None
    ) -> Any:
        """
        Executes an HTTP request to GitHub REST API.
        Integrates ETag caching (If-None-Match) and local check intervals.
        """
        endpoint = endpoint if endpoint.startswith("/") else f"/{endpoint}"
        url = f"{self.api_base}{endpoint}"
        now = time.time()

        # Check local TTL cache before hitting network
        cache_entry = self._cache.get(endpoint)
        if use_cache and not force_refresh and cache_entry is not None:
            if (now - cache_entry.last_refresh) < self.min_check_interval:
                return cache_entry.data

        headers = self._default_headers()
        if use_cache and cache_entry and cache_entry.etag:
            headers["If-None-Match"] = cache_entry.etag

        try:
            resp = self.session.request(
                method=method.upper(),
                url=url,
                params=params,
                headers=headers,
                timeout=self.timeout
            )
        except (requests.exceptions.Timeout, requests.exceptions.ConnectTimeout) as e:
            raise NetworkTimeoutError(f"GitHub request timed out connecting to {url}", step=step) from e
        except requests.exceptions.RequestException as e:
            raise GitHubApiError(f"Network transport error: {e}", step=step) from e

        # Handle 304 Not Modified
        if resp.status_code == 304 and cache_entry is not None:
            cache_entry.last_refresh = now
            return cache_entry.data

        # Handle Rate Limit (HTTP 403 or 429)
        if resp.status_code in (403, 429):
            remaining = resp.headers.get("x-ratelimit-remaining")
            reset_ts = resp.headers.get("x-ratelimit-reset")
            retry_after = resp.headers.get("retry-after")
            reset_int = int(reset_ts) if reset_ts and reset_ts.isdigit() else None
            retry_int = int(retry_after) if retry_after and retry_after.isdigit() else None

            # GitHub returns 403 with message "API rate limit exceeded"
            err_text = resp.text
            if remaining == "0" or "rate limit" in err_text.lower():
                raise GitHubRateLimitError(
                    f"GitHub API rate limit exceeded. Reset at {reset_int}",
                    reset_time=reset_int,
                    retry_after=retry_int,
                    step=step
                )

        # Handle 404 Not Found
        if resp.status_code == 404:
            raise ResourceNotFoundError(
                f"Resource not found on GitHub: {endpoint}",
                status_code=404,
                step=step
            )

        # Handle other HTTP errors
        if resp.status_code >= 400:
            raise GitHubApiError(
                f"GitHub API returned HTTP {resp.status_code}: {resp.text}",
                status_code=resp.status_code,
                step=step
            )

        # Parse JSON response
        try:
            data = resp.json()
        except Exception as e:
            raise MalformedResponseError(
                f"Invalid JSON received from GitHub endpoint {endpoint}: {resp.text[:200]}",
                step=step
            ) from e

        # Update cache if applicable
        if use_cache and method.upper() == "GET":
            etag = resp.headers.get("ETag")
            self._cache[endpoint] = _CacheEntry(etag=etag, data=data, cached_at=now)

        return data

    def download_asset(self, download_url: str, step: str = "Download Release Asset") -> bytes:
        """
        Downloads binary asset directly from GitHub or redirect CDN (AWS S3).
        Strips authorization headers on cross-domain redirects to avoid security leaks.
        """
        headers = {"User-Agent": "LuciProxy-Manager/2.0"}
        try:
            resp = self.session.get(
                download_url,
                headers=headers,
                allow_redirects=True,
                timeout=max(self.timeout, 30)
            )
            if resp.status_code == 404:
                raise ResourceNotFoundError(f"Asset download returned HTTP 404: {download_url}", status_code=404, step=step)
            if resp.status_code >= 400:
                raise GitHubApiError(f"Asset download failed with HTTP {resp.status_code}", status_code=resp.status_code, step=step)
            return resp.content
        except requests.exceptions.Timeout as e:
            raise NetworkTimeoutError(f"Asset download timed out: {download_url}", step=step) from e
        except requests.exceptions.RequestException as e:
            raise GitHubApiError(f"Network error during asset download: {e}", step=step) from e
