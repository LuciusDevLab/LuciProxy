"""
LuciProxy Manager - Secure Neutral Resource Naming Engine.
Generates cryptographically random, neutral resource names for Workers, D1 databases,
and Cloudflare API Tokens with an extensible, case-insensitive denylist preventing
disclosure of service purpose.
"""

import json
import re
import secrets
import urllib.parse
from typing import Optional, Set, Tuple


# Centralized, case-insensitive denylist forbidding proxy, tunneling, VPN, protocol, or product terminology
DENYLIST: Set[str] = {
    "luciproxy",
    "luci",
    "vpn",
    "proxy",
    "edge",
    "tunnel",
    "vless",
    "trojan",
    "xray",
    "clash",
    "singbox",
    "mihomo",
    "wireguard",
    "amnezia",
    "shadowsocks",
    "warp",
    "gateway",
    "relay",
    "server",
    "config",
    "panel",
    "node",
    "nova",
    "bpb",
    "nahan",
    "cloudflare",
    "worker",
}

# Curated, safe, neutral English adjectives (nature, colors, aesthetics)
NEUTRAL_ADJECTIVES = [
    "amber", "autumn", "azure", "bright", "brisk", "calm", "clear", "cool",
    "coral", "crisp", "crystal", "dawn", "dusk", "fair", "frosty", "gentle",
    "golden", "grand", "green", "harbor", "hollow", "iron", "jade", "light",
    "lofty", "lunar", "maple", "misty", "noble", "ocean", "pale", "peaceful",
    "pure", "quiet", "rapid", "river", "ruby", "rustic", "serene", "silent",
    "silver", "simple", "smooth", "solar", "spring", "stellar", "stone", "subtle",
    "summer", "swift", "tranquil", "valiant", "velvet", "vibrant", "warm", "wild",
    "winter", "wooden"
]

# Curated, safe, neutral English nouns (flora, fauna, geography, astronomy)
NEUTRAL_NOUNS = [
    "birch", "brook", "canyon", "cedar", "cliff", "cloud", "clover", "creek",
    "elm", "falcon", "fern", "finch", "forest", "glade", "glen", "grove",
    "harbor", "hawk", "heron", "hill", "island", "lake", "lark", "leaf",
    "meadow", "moon", "moss", "mountain", "oak", "oasis", "orchard", "orchid",
    "peak", "pebble", "pine", "quarry", "rain", "ridge", "river", "robin",
    "sand", "sea", "sparrow", "spring", "star", "stone", "stream", "summit",
    "valley", "wave", "willow", "wind", "woods"
]

# Cloudflare resource name format constraint: 1-63 chars, lowercase alphanumeric and hyphens
CLOUDFLARE_NAME_PATTERN = re.compile(r"^[a-z0-9][a-z0-9-]{1,61}[a-z0-9]$")

# Official Cloudflare API Token creation template permissions:
# 1. Workers Scripts (edit)
# 2. D1 (edit)
# 3. Account Settings (read)
TOKEN_PERMISSION_GROUP_KEYS_JSON = json.dumps([
    {"key": "workers_scripts", "type": "edit"},
    {"key": "d1", "type": "edit"},
    {"key": "account_settings", "type": "read"}
], separators=(',', ':'))


class NamingPolicy:
    """
    Canonical Naming Contract for LuciProxy Manager.
    Enforces neutral naming, cryptographic randomness, case-insensitive denylist checks,
    and pairwise distinctness across tokens, workers, and databases.
    """

    DENYLIST = DENYLIST
    NEUTRAL_ADJECTIVES = NEUTRAL_ADJECTIVES
    NEUTRAL_NOUNS = NEUTRAL_NOUNS

    @staticmethod
    def is_allowed_name(name: str) -> bool:
        """
        Validates that a name complies with Cloudflare constraints (1-63 chars, lowercase alphanumeric + hyphens)
        and contains zero denylist terms (case-insensitive substring check).
        """
        if not name or not isinstance(name, str):
            return False

        name_lower = name.lower()

        if not CLOUDFLARE_NAME_PATTERN.match(name_lower):
            return False

        for banned in DENYLIST:
            if banned in name_lower:
                return False

        return True

    @staticmethod
    def are_pairwise_distinct(*names: str) -> bool:
        """
        Validates that all provided names are pairwise distinct (case-insensitively).
        len({n.lower() for n in names}) == len(names)
        """
        if not names:
            return True
        lowered = [n.lower() for n in names]
        return len(lowered) == len(set(lowered))

    @staticmethod
    def generate_single_random_name() -> str:
        """
        Generates a cryptographically random neutral resource name.
        Format: [neutral-adjective]-[neutral-noun]-[4-digits] (1000-9999)
        Example: 'amber-finch-4827'
        """
        max_attempts = 100
        for _ in range(max_attempts):
            adj = secrets.choice(NEUTRAL_ADJECTIVES)
            noun = secrets.choice(NEUTRAL_NOUNS)
            num = secrets.randbelow(9000) + 1000
            candidate = f"{adj}-{noun}-{num}"
            if NamingPolicy.is_allowed_name(candidate):
                return candidate
        raise RuntimeError("Failed to generate a valid neutral name within iteration limits.")

    @staticmethod
    def generate_token_name(exclude: Optional[Set[str]] = None) -> str:
        """
        Generates an independent, cryptographically random neutral name for a Cloudflare API Token.
        Guarantees validation against centralized denylist and distinctness from excluded names.
        """
        exclude_set = {n.lower() for n in exclude} if exclude else set()
        for _ in range(100):
            candidate = NamingPolicy.generate_single_random_name()
            if candidate.lower() not in exclude_set:
                return candidate
        raise RuntimeError("Failed to generate distinct neutral token name within iteration limits.")

    @staticmethod
    def generate_worker_name(exclude: Optional[Set[str]] = None) -> str:
        """Generates an independent random neutral Worker name."""
        return NamingPolicy.generate_token_name(exclude=exclude)

    @staticmethod
    def generate_d1_name(exclude: Optional[Set[str]] = None) -> str:
        """Generates an independent random neutral D1 database name."""
        return NamingPolicy.generate_token_name(exclude=exclude)

    @staticmethod
    def generate_deployment_names(exclude: Optional[Set[str]] = None) -> Tuple[str, str]:
        """
        Generates two independent random names for a fresh deployment:
        (worker_name, d1_name)
        Guarantees worker_name != d1_name and neither in exclude set.
        """
        exclude_set = {n.lower() for n in exclude} if exclude else set()
        for _ in range(100):
            worker_name = NamingPolicy.generate_single_random_name()
            if worker_name.lower() in exclude_set:
                continue
            d1_name = NamingPolicy.generate_single_random_name()
            if d1_name.lower() in exclude_set or d1_name.lower() == worker_name.lower():
                continue
            return worker_name, d1_name
        raise RuntimeError("Failed to generate deployment names within iteration limits.")

    @staticmethod
    def generate_resource_triple() -> Tuple[str, str, str]:
        """
        Generates three independent, pairwise distinct random neutral names:
        (token_name, worker_name, d1_name)
        Guarantees:
          len({token_name, worker_name, d1_name}) == 3
          token_name != worker_name
          token_name != d1_name
          worker_name != d1_name
        """
        for _ in range(100):
            token_name = NamingPolicy.generate_token_name()
            worker_name, d1_name = NamingPolicy.generate_deployment_names(exclude={token_name})
            if NamingPolicy.are_pairwise_distinct(token_name, worker_name, d1_name):
                return token_name, worker_name, d1_name
        raise RuntimeError("Failed to generate pairwise distinct resource names within iteration limits.")

    @staticmethod
    def build_token_creation_url(token_name: Optional[str] = None) -> str:
        """
        Dynamically constructs the official Cloudflare API Token creation URL with:
        - Exact required permission scopes: workers_scripts (edit), d1 (edit), account_settings (read)
        - accountId=*
        - zoneId=all
        - dynamically generated neutral token name in the 'name' query parameter
        """
        name = token_name or NamingPolicy.generate_token_name()
        query_params = {
            "permissionGroupKeys": TOKEN_PERMISSION_GROUP_KEYS_JSON,
            "accountId": "*",
            "zoneId": "all",
            "name": name,
        }
        return f"https://dash.cloudflare.com/profile/api-tokens?{urllib.parse.urlencode(query_params)}"

    @staticmethod
    def generate_random_api_route(length: int = 10) -> str:
        """
        Generates a cryptographically secure random lowercase route for Worker API/admin endpoints.
        - Length between 10 and 14 characters
        - [a-z0-9] only
        - No slashes, whitespace, punctuation, product branding, or protocol words
        """
        if length < 10 or length > 14:
            length = 10
        alphabet = "abcdefghijklmnopqrstuvwxyz0123456789"
        for _ in range(100):
            cand = "".join(secrets.choice(alphabet) for _ in range(length))
            cand_lower = cand.lower()
            if not any(denied in cand_lower for denied in DENYLIST) and not any(proto in cand_lower for proto in PROTOCOL_KEYWORDS):
                return cand
        fallback_chars = "bcdfghjklmnpqrstvwxyz0123456789"
        return "".join(secrets.choice(fallback_chars) for _ in range(length))

    @staticmethod
    def is_valid_api_route(route: Optional[str]) -> bool:
        """
        Validates that a route consists of 6 to 32 alphanumeric lowercase characters,
        with no slashes, whitespace, punctuation, or forbidden terms.
        """
        if not route or not isinstance(route, str):
            return False
        clean = route.strip()
        if len(clean) < 6 or len(clean) > 32:
            return False
        if not re.match(r"^[a-z0-9]+$", clean):
            return False
        lower = clean.lower()
        if any(denied in lower for denied in DENYLIST) or any(proto in lower for proto in PROTOCOL_KEYWORDS):
            return False
        return True


PROTOCOL_KEYWORDS: Set[str] = {
    "vless", "trojan", "vmess", "shadowsocks", "wireguard", "amnezia",
    "proxy", "vpn", "tunnel", "sync", "dash", "admin", "api", "auth",
    "config", "relay", "gateway", "server", "luciproxy", "luci"
}

# Module-level convenience functions for backward compatibility
is_name_allowed = NamingPolicy.is_allowed_name
are_pairwise_distinct = NamingPolicy.are_pairwise_distinct
generate_single_random_name = NamingPolicy.generate_single_random_name
generate_token_name = NamingPolicy.generate_token_name
generate_worker_name = NamingPolicy.generate_worker_name
generate_d1_name = NamingPolicy.generate_d1_name
generate_deployment_names = NamingPolicy.generate_deployment_names
generate_independent_resource_names = NamingPolicy.generate_resource_triple
build_token_creation_url = NamingPolicy.build_token_creation_url
generate_random_api_route = NamingPolicy.generate_random_api_route
is_valid_api_route = NamingPolicy.is_valid_api_route
