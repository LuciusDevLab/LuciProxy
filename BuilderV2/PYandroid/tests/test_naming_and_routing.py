"""
Unit tests for PYandroid Naming & Routing policies (Exact Windows Parity).
Verifies randomized neutral naming, route validation, token creation URL, and Windows parity.
"""

import json
import re
import urllib.parse
import pytest

from BuilderV2.PYandroid.src.core.naming import (
    NamingPolicy,
    generate_token_name,
    generate_worker_name,
    generate_d1_name,
    generate_deployment_names,
    generate_random_api_route,
    is_valid_api_route,
    build_token_creation_url,
    generate_secret_uuid,
    generate_panel_url,
    DENYLIST,
)
import BuilderV2.deployment.naming as windows_naming


def test_generate_token_name_format_and_denylist():
    """Proves generated token names are <adj>-<noun>-<4digits> with zero denylist terms."""
    names = {generate_token_name() for _ in range(100)}
    assert len(names) == 100
    for name in names:
        assert re.match(r"^[a-z]+-[a-z]+-\d{4}$", name)
        lower = name.lower()
        for denied in DENYLIST:
            assert denied not in lower


def test_generate_worker_and_d1_names():
    """Proves worker and D1 deployment names are pairwise distinct and allowed."""
    for _ in range(50):
        w_name, d_name = generate_deployment_names()
        assert w_name != d_name
        assert NamingPolicy.is_allowed_name(w_name)
        assert NamingPolicy.is_allowed_name(d_name)


def test_generate_and_validate_random_api_route():
    """Proves randomized API route complies strictly with 10-char [a-z0-9] format."""
    routes = {generate_random_api_route() for _ in range(100)}
    assert len(routes) == 100
    for r in routes:
        assert len(r) == 10
        assert re.match(r"^[a-z0-9]{10}$", r)
        assert is_valid_api_route(r) is True
        assert not r.startswith("/")
        assert not r.startswith("route-")

    # Negative validation
    assert is_valid_api_route("sync") is False  # In protocol keywords
    assert is_valid_api_route("proxy") is False  # Denied
    assert is_valid_api_route("abc") is False  # Too short
    assert is_valid_api_route("") is False


def test_build_token_creation_url_structure_and_permissions():
    """
    Proves build_token_creation_url constructs the official Cloudflare API token URL
    with exact permissions: workers_scripts (edit), d1 (edit), account_settings (read).
    """
    token_name = "pure-wave-5534"
    url = build_token_creation_url(token_name)

    assert url.startswith("https://dash.cloudflare.com/profile/api-tokens?")
    parsed = urllib.parse.urlparse(url)
    qs = urllib.parse.parse_qs(parsed.query)

    assert qs["accountId"] == ["*"]
    assert qs["zoneId"] == ["all"]
    assert qs["name"] == [token_name]

    # Decode permissionGroupKeys JSON
    perms_json = qs["permissionGroupKeys"][0]
    perms = json.loads(perms_json)
    assert len(perms) == 3

    perm_map = {p["key"]: p["type"] for p in perms}
    assert perm_map["workers_scripts"] == "edit"
    assert perm_map["d1"] == "edit"
    assert perm_map["account_settings"] == "read"


def test_windows_and_android_naming_url_parity():
    """
    Forensic Parity Test:
    Proves Windows Manager and Android subsystem produce 100% bit-for-bit identical
    token creation URLs for the same token name input.
    """
    test_name = "gentle-brook-4821"
    url_windows = windows_naming.build_token_creation_url(test_name)
    url_android = build_token_creation_url(test_name)

    assert url_windows == url_android

    # Verify decoded permission structures are strictly identical
    qs_win = urllib.parse.parse_qs(urllib.parse.urlparse(url_windows).query)
    qs_andr = urllib.parse.parse_qs(urllib.parse.urlparse(url_android).query)

    assert qs_win["permissionGroupKeys"] == qs_andr["permissionGroupKeys"]
    assert qs_win["accountId"] == qs_andr["accountId"]
    assert qs_win["zoneId"] == qs_andr["zoneId"]
    assert qs_win["name"] == qs_andr["name"]


def test_generate_panel_url():
    """Proves panel URL correctly embeds the random API route and dashboard path."""
    worker_domain = "pure-wave-5534.my-sub.workers.dev"
    route = "qrmxvnakzd"
    panel_url = generate_panel_url(worker_domain, route)
    assert panel_url == "https://pure-wave-5534.my-sub.workers.dev/qrmxvnakzd/dash"

    # Robust against leading https:// and trailing slashes
    panel_url_robust = generate_panel_url("https://pure-wave-5534.my-sub.workers.dev/", "/qrmxvnakzd/")
    assert panel_url_robust == "https://pure-wave-5534.my-sub.workers.dev/qrmxvnakzd/dash"


def test_generate_secret_uuid():
    """Proves secret UUID generates valid RFC 4122 v4 UUIDs."""
    uuid_val = generate_secret_uuid()
    assert re.match(r"^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$", uuid_val)
