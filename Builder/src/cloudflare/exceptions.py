"""
LuciProxy Builder - Cloudflare API Exceptions
Provides structured, actionable error reporting without leaking secrets.
"""

from typing import Optional


from ..utils.sanitize import sanitize_text


class CloudflareError(Exception):
    """Base exception for Cloudflare API operations."""

    def __init__(
        self,
        message: str,
        step: Optional[str] = None,
        reason: Optional[str] = None,
        suggested_action: Optional[str] = None,
        status_code: Optional[int] = None,
        capability: Optional[str] = None,
        operation: Optional[str] = None,
        endpoint: Optional[str] = None
    ):
        super().__init__(sanitize_text(message))
        self.step = step
        self.reason = reason
        self.suggested_action = suggested_action
        self.status_code = status_code
        self.capability = capability
        self.operation = operation
        self.endpoint = endpoint

    def format_actionable(self) -> str:
        """Returns a structured, user-friendly error explanation with secrets redacted."""
        lines = ["\n[Deployment Error]"]
        if self.capability:
            lines.append(f"Capability:       {self.capability}")
        if self.operation:
            lines.append(f"Operation:        {self.operation}")
        if self.endpoint:
            lines.append(f"Endpoint:         {self.endpoint}")
        if self.step and not self.operation:
            lines.append(f"Step:             {self.step}")
        if self.reason:
            lines.append(f"Reason:           {self.reason}")
        elif str(self):
            lines.append(f"Details:          {str(self)}")
        if self.suggested_action:
            lines.append(f"Suggested Action: {self.suggested_action}")
        return sanitize_text("\n".join(lines))


class AuthenticationError(CloudflareError):
    """Raised when the Cloudflare API token is invalid, expired, or has insufficient permissions."""
    pass


class ResourceCollisionError(CloudflareError):
    """Raised when a Worker name, D1 database, or route already exists."""
    pass


class ResourceNotFoundError(CloudflareError):
    """Raised when a requested resource does not exist."""
    pass


class QuotaExceededError(CloudflareError):
    """Raised when Cloudflare rate limits or resource limits are encountered."""
    pass


class CapabilityError(CloudflareError):
    """Raised when an active capability preflight probe fails on a specific permission."""
    pass
