"""
Tests for secret masking, redaction, and header sanitization.
"""

from src.utils.sanitize import mask_secret, sanitize_text, sanitize_headers


def test_mask_secret():
    assert mask_secret("abcdef1234567890", keep_start=4, keep_end=4) == "abcd********7890"
    assert mask_secret("short", keep_start=4, keep_end=4) == "*****"
    assert mask_secret("") == ""


def test_sanitize_text():
    raw_log = "Error during request: Bearer 9876543210abcdef_token_val failed"
    clean_log = sanitize_text(raw_log)
    assert "9876543210abcdef_token_val" not in clean_log
    assert "Bearer [REDACTED_TOKEN]" in clean_log

    json_str = '{"api_token": "secret_token_1234567890", "user": "admin"}'
    clean_json = sanitize_text(json_str)
    assert "secret_token_1234567890" not in clean_json
    assert "[REDACTED_TOKEN]" in clean_json


def test_sanitize_headers():
    headers = {
        "Authorization": "Bearer secret_tok_123",
        "X-Auth-Key": "my_auth_key",
        "Content-Type": "application/json",
        "User-Agent": "LuciProxy"
    }
    clean = sanitize_headers(headers)
    assert clean["Authorization"] == "[REDACTED]"
    assert clean["X-Auth-Key"] == "[REDACTED]"
    assert clean["Content-Type"] == "application/json"
    assert clean["User-Agent"] == "LuciProxy"


def test_sanitize_text_with_explicit_token():
    token = "cf_secret_alpha_bravo_998877"
    raw_traceback = f"Traceback: failed to connect using {token} at line 42"
    clean = sanitize_text(raw_traceback, token_to_mask=token)
    assert token not in clean
    assert "[REDACTED_TOKEN]" in clean


def test_exception_format_actionable_redaction():
    from src.cloudflare.exceptions import CloudflareError
    err = CloudflareError(
        message="Request Bearer secret_abcdef_123456 failed",
        step="API Preflight",
        reason="Bearer secret_abcdef_123456 was rejected"
    )
    formatted = err.format_actionable()
    assert "secret_abcdef_123456" not in formatted
    assert "[REDACTED_TOKEN]" in formatted

