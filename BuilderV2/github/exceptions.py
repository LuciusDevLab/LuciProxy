"""
LuciProxy Manager - GitHub and Integrity Exceptions.
Typed exceptions for GitHub release discovery, API failures, caching,
manifest validation, and cryptographic integrity verification.
"""

from typing import Any, Dict, List, Optional


class GitHubError(Exception):
    """Base exception for all GitHub interaction errors."""

    def __init__(self, message: str, step: Optional[str] = None):
        self.message = message
        self.step = step
        super().__init__(self.message)

    def __str__(self) -> str:
        step_str = f" during '{self.step}'" if self.step else ""
        return f"{self.message}{step_str}"


class GitHubApiError(GitHubError):
    """Raised when GitHub REST API returns an HTTP error."""

    def __init__(
        self,
        message: str,
        status_code: Optional[int] = None,
        errors: Optional[List[Dict[str, Any]]] = None,
        step: Optional[str] = None
    ):
        self.status_code = status_code
        self.errors = errors or []
        super().__init__(message, step=step)

    def __str__(self) -> str:
        code_str = f" [HTTP {self.status_code}]" if self.status_code else ""
        step_str = f" during '{self.step}'" if self.step else ""
        return f"{self.message}{code_str}{step_str}"


class GitHubRateLimitError(GitHubApiError):
    """Raised when GitHub API rate limit is exceeded (HTTP 403 / 429)."""

    def __init__(
        self,
        message: str,
        reset_time: Optional[int] = None,
        retry_after: Optional[int] = None,
        step: Optional[str] = None
    ):
        self.reset_time = reset_time
        self.retry_after = retry_after
        super().__init__(message, status_code=429, step=step)


class ResourceNotFoundError(GitHubApiError):
    """Raised when a repository, release, tag, or asset is not found (HTTP 404)."""
    pass


class NetworkTimeoutError(GitHubError):
    """Raised when network connection or request to GitHub times out."""
    pass


class MalformedResponseError(GitHubError):
    """Raised when GitHub returns invalid or unparseable JSON."""
    pass


class AssetNotFoundError(GitHubError):
    """Raised when a required release asset (e.g. worker_bundle.js, manifest.json) is missing."""
    pass


class MalformedManifestError(GitHubError):
    """Raised when manifest.json is invalid, unparseable, or missing required fields."""
    pass


class IntegrityVerificationError(GitHubError):
    """
    CRITICAL: Raised when cryptographic SHA-256 verification fails.
    Indicates potential corruption, tampering, or mismatched release artifact.
    Deployment MUST immediately abort when this error is raised.
    """

    def __init__(
        self,
        message: str,
        expected_sha256: Optional[str] = None,
        actual_sha256: Optional[str] = None,
        artifact_name: Optional[str] = None,
        step: Optional[str] = None
    ):
        self.expected_sha256 = expected_sha256
        self.actual_sha256 = actual_sha256
        self.artifact_name = artifact_name
        super().__init__(message, step=step)


class InvalidVersionError(GitHubError):
    """Raised when a release tag cannot be parsed into semantic versioning."""
    pass
