"""
LuciProxy Manager - Cloudflare API Exceptions.
Maps HTTP status codes and Cloudflare error payloads into typed exceptions.
Enforces strict sanitization so API tokens and Authorization headers are NEVER exposed.
"""

import re
from typing import Any, Dict, List, Optional


def sanitize_message(text: str) -> str:
    """Sanitizes text to prevent any credential or token leakage in error messages."""
    if not text:
        return ""
    # Redact common token patterns: cfut_*, Bearer *, 40-char hex, etc.
    s = str(text)
    s = re.sub(r"cfut_[a-zA-Z0-9_-]{20,}", "[REDACTED_CF_TOKEN]", s)
    s = re.sub(r"Bearer\s+[a-zA-Z0-9_\-\.]{20,}", "Bearer [REDACTED_TOKEN]", s, flags=re.IGNORECASE)
    s = re.sub(r"authorization:\s*bearer\s+[^\s,]+", "authorization: Bearer [REDACTED]", s, flags=re.IGNORECASE)
    return s


class CloudflareApiError(Exception):
    """Base exception for all Cloudflare API interaction failures."""

    def __init__(
        self,
        message: str,
        status_code: Optional[int] = None,
        errors: Optional[List[Dict[str, Any]]] = None,
        step: Optional[str] = None
    ):

        self.raw_message = message
        self.message = sanitize_message(message)
        self.status_code = status_code
        self.errors = errors or []
        self.step = step
        super().__init__(self.message)

    def __str__(self) -> str:
        code_str = f" [HTTP {self.status_code}]" if self.status_code else ""
        step_str = f" during '{self.step}'" if self.step else ""
        return f"{self.message}{code_str}{step_str}"


# Backwards compatibility alias
CloudflareError = CloudflareApiError


class AuthenticationError(CloudflareApiError):

    """Raised when authentication fails (HTTP 401 - invalid or expired token)."""
    pass


class PermissionDeniedError(CloudflareApiError):
    """Raised when the token lacks required permissions (HTTP 403 Forbidden)."""
    pass


class ResourceNotFoundError(CloudflareApiError):
    """Raised when a requested resource does not exist (HTTP 404 Not Found)."""
    pass


class ConflictError(CloudflareApiError):
    """Raised when a resource name collides with an existing one (HTTP 409 Conflict)."""
    pass


class RateLimitError(CloudflareApiError):
    """Raised when API rate limits are exceeded (HTTP 429 Too Many Requests)."""

    def __init__(
        self,
        message: str,
        retry_after: Optional[int] = None,
        status_code: int = 429,
        errors: Optional[List[Dict[str, Any]]] = None,
        step: Optional[str] = None
    ):
        self.retry_after = retry_after
        super().__init__(message, status_code=status_code, errors=errors, step=step)


class CloudflareUnavailableError(CloudflareApiError):
    """Raised when Cloudflare API is temporarily down or returning 5xx responses."""
    pass


class NetworkConnectionError(CloudflareApiError):
    """Raised when the network connection to Cloudflare fails (DNS, TLS, timeout)."""
    pass


class MalformedApiResponseError(CloudflareApiError):
    """Raised when Cloudflare returns an invalid JSON or unexpected schema payload."""
    pass


class GraphQLError(CloudflareApiError):
    """Raised when a Cloudflare GraphQL Analytics query returns errors."""

    def __init__(
        self,
        message: str,
        graphql_errors: Optional[List[Dict[str, Any]]] = None,
        step: Optional[str] = None
    ):
        self.graphql_errors = graphql_errors or []
        super().__init__(message, status_code=200, step=step)
