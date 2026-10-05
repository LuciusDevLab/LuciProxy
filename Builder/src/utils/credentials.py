"""
LuciProxy Builder - Runtime Credential Resolution
Enforces strict security boundary: credentials may ONLY come from
explicit runtime sources (environment variables or active memory parameters).
No transcript files, chat logs, generated logs, or historical files are ever accessed.
"""

import os
from typing import Optional
from ..cloudflare.exceptions import AuthenticationError


def get_runtime_token(env_var: str = "CF_TOKEN") -> str:
    """
    Retrieve an explicit runtime API token from environment.

    Strict Security Policy:
    - Credentials may ONLY originate from an explicit runtime environment variable.
    - Never falls back to historical transcripts, logs, chat artifacts, or temporary files.
    - Raises AuthenticationError immediately if missing or empty without attempting any recovery.
    """
    token = os.environ.get(env_var)
    if not token or not token.strip():
        # Check standard Cloudflare API token variable
        alt_token = os.environ.get("CLOUDFLARE_API_TOKEN")
        if alt_token and alt_token.strip():
            token = alt_token
        else:
            raise AuthenticationError(
                message=f"Required runtime credential '{env_var}' is not set in environment.",
                step="Runtime Credential Resolution",
                reason="Environment variable missing or empty.",
                suggested_action=f"Provide {env_var} explicitly via process environment variables only."
            )

    cleaned = token.strip().rstrip('\\"\' \r\n')
    if not cleaned:
        raise AuthenticationError(
            message=f"Runtime credential '{env_var}' is empty after stripping whitespace.",
            step="Runtime Credential Resolution",
            reason="Empty token string.",
            suggested_action=f"Provide a valid non-empty token in {env_var}."
        )
    return cleaned
