"""
LuciProxy Builder - Secret Sanitization Utilities
Prevents accidental leakage of API tokens, passwords, and sensitive headers.
"""

import re
from typing import Dict, Optional


TOKEN_PATTERNS = [
    (re.compile(r"Bearer\s+([A-Za-z0-9_\-]{10,})", re.IGNORECASE), r"Bearer [REDACTED_TOKEN]"),
    (re.compile(r"(api[_-]?token['\"]?\s*[:=]\s*['\"]?)([A-Za-z0-9_\-]{10,})(['\"]?)", re.IGNORECASE), r"\1[REDACTED_TOKEN]\3"),
    (re.compile(r"(token['\"]?\s*[:=]\s*['\"]?)([A-Za-z0-9_\-]{10,})(['\"]?)", re.IGNORECASE), r"\1[REDACTED_TOKEN]\3"),
    (re.compile(r"(password['\"]?\s*[:=]\s*['\"]?)([^'\"\s,}{]{4,})(['\"]?)", re.IGNORECASE), r"\1[REDACTED_PASSWORD]\3"),
]


def mask_secret(secret: str, keep_start: int = 4, keep_end: int = 4) -> str:
    """Masks a secret string leaving only a small prefix and suffix visible."""
    if not secret:
        return ""
    if len(secret) <= keep_start + keep_end:
        return "*" * len(secret)
    return f"{secret[:keep_start]}{'*' * (len(secret) - keep_start - keep_end)}{secret[-keep_end:]}"


def sanitize_text(text: str, token_to_mask: Optional[str] = None) -> str:
    """Removes sensitive tokens and credentials from freeform log strings or error messages."""
    if not text:
        return ""
    sanitized = text
    if token_to_mask and len(token_to_mask) >= 6:
        sanitized = sanitized.replace(token_to_mask, "[REDACTED_TOKEN]")
    for pattern, replacement in TOKEN_PATTERNS:
        sanitized = pattern.sub(replacement, sanitized)
    return sanitized


def sanitize_headers(headers: Dict[str, str]) -> Dict[str, str]:
    """Returns a copy of headers with Authorization and sensitive keys redacted."""
    clean = {}
    for k, v in headers.items():
        if k.lower() in ("authorization", "x-auth-key", "x-auth-user-service-key", "cookie"):
            clean[k] = "[REDACTED]"
        else:
            clean[k] = v
    return clean
