"""
Tests for Resource Naming Engine, neutral vocabularies, and denylist constraints.
"""

import re
import pytest
from src.resources.naming import (
    DENYLIST,
    NEUTRAL_ADJECTIVES,
    NEUTRAL_NOUNS,
    CLOUDFLARE_NAME_PATTERN,
    is_name_allowed,
    generate_single_random_name,
    generate_deployment_names,
    generate_token_name,
    generate_independent_resource_names
)


def test_neutral_vocabularies_are_clean():
    """Verify that none of the curated adjectives or nouns contain banned terms."""
    for adj in NEUTRAL_ADJECTIVES:
        assert adj.islower()
        assert adj.isalpha()
        for banned in DENYLIST:
            assert banned not in adj, f"Adjective '{adj}' contains banned term '{banned}'"

    for noun in NEUTRAL_NOUNS:
        assert noun.islower()
        assert noun.isalpha()
        for banned in DENYLIST:
            assert banned not in noun, f"Noun '{noun}' contains banned term '{banned}'"


def test_cloudflare_name_pattern():
    """Verify that the regex correctly matches valid Cloudflare resource identifiers."""
    assert CLOUDFLARE_NAME_PATTERN.match("amber-finch-1234")
    assert CLOUDFLARE_NAME_PATTERN.match("a-1")
    assert not CLOUDFLARE_NAME_PATTERN.match("-invalid-start")
    assert not CLOUDFLARE_NAME_PATTERN.match("invalid-end-")
    assert not CLOUDFLARE_NAME_PATTERN.match("Uppercase-Not-Allowed")
    assert not CLOUDFLARE_NAME_PATTERN.match("has spaces")
    # Exceeding 63 chars
    assert not CLOUDFLARE_NAME_PATTERN.match("a" * 64)


def test_is_name_allowed_accepts_neutral_names():
    """Verify that compliant names are allowed."""
    assert is_name_allowed("amber-finch-4827")
    assert is_name_allowed("calm-river-1024")
    assert is_name_allowed("crystal-peak-9999")
    assert is_name_allowed("silent-forest-5555")


def test_is_name_allowed_rejects_denylist_terms():
    """Verify that proxy/vpn/node/protocol/branding terminology is strictly rejected."""
    banned_samples = [
        "fast-proxy-1234",
        "my-vpn-node",
        "luciproxy-gate",
        "luci-worker-99",
        "edge-relay-55",
        "vless-tunnel-1",
        "trojan-server-2",
        "xray-config-3",
        "warp-endpoint",
        "wireguard-panel",
        "singbox-gateway",
        "clash-provider",
        "amnezia-node",
        "nahan-test",
        "nova-service",
        "bpb-wizard"
    ]
    for sample in banned_samples:
        assert not is_name_allowed(sample), f"Should have rejected '{sample}'"


def test_is_name_allowed_case_insensitivity():
    """Verify that denylist checking is strictly case-insensitive."""
    assert not is_name_allowed("Amber-Proxy-1234")
    assert not is_name_allowed("VLESS-tunnel")
    assert not is_name_allowed("LuciProxy-test")


def test_generate_single_random_name_structure():
    """Verify format, range, and validity of single generated names."""
    for _ in range(50):
        name = generate_single_random_name()
        assert is_name_allowed(name)
        parts = name.split("-")
        assert len(parts) == 3
        adj, noun, num = parts[0], parts[1], parts[2]
        assert adj in NEUTRAL_ADJECTIVES
        assert noun in NEUTRAL_NOUNS
        assert num.isdigit()
        assert 1000 <= int(num) <= 9999


def test_generate_deployment_names_independence():
    """Verify that Worker name and D1 name are distinct, neutral, and validated."""
    for _ in range(30):
        worker_name, d1_name = generate_deployment_names()
        assert worker_name != d1_name
        assert is_name_allowed(worker_name)
        assert is_name_allowed(d1_name)


def test_generate_token_name():
    """Verify Token name generation conforms to neutral guidelines and is distinct."""
    names = set()
    for _ in range(30):
        t_name = generate_token_name()
        assert is_name_allowed(t_name)
        names.add(t_name)
    # 30 generations should produce at least 25 distinct names with overwhelming probability
    assert len(names) >= 25


def test_generate_token_name_with_exclusions():
    """Verify Token name respects exclusions."""
    excluded = {"amber-finch-1111", "calm-river-2222"}
    for _ in range(20):
        t_name = generate_token_name(exclude=excluded)
        assert t_name not in excluded
        assert is_name_allowed(t_name)


def test_generate_independent_resource_names():
    """Verify full mutual independence and pairwise distinctness of (Token Name, Worker Name, D1 Name)."""
    for _ in range(30):
        token_name, worker_name, d1_name = generate_independent_resource_names()
        assert len({token_name, worker_name, d1_name}) == 3
        assert token_name != worker_name
        assert token_name != d1_name
        assert worker_name != d1_name
        assert is_name_allowed(token_name)
        assert is_name_allowed(worker_name)
        assert is_name_allowed(d1_name)
