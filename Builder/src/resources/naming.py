"""
LuciProxy Builder - Secure Neutral Resource Naming Engine
Generates cryptographically random, neutral resource names for Workers and D1 databases
with an extensible, case-insensitive denylist preventing disclosure of service purpose.
"""

import re
import secrets
from typing import Optional, Set, Tuple


# Centralized, case-insensitive denylist forbidding proxy, tunneling, VPN, or node terminology
DENYLIST: Set[str] = {
    "vpn",
    "proxy",
    "edge",
    "tunnel",
    "vless",
    "trojan",
    "xray",
    "clash",
    "singbox",
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
    "luciproxy",
    "luci"
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


def is_name_allowed(name: str) -> bool:
    """
    Validates that a name complies with Cloudflare constraints and contains zero denylist terms.
    Checks substring matching case-insensitively.
    """
    if not name or not isinstance(name, str):
        return False

    name_lower = name.lower()

    # Cloudflare format check
    if not CLOUDFLARE_NAME_PATTERN.match(name_lower):
        return False

    # Denylist check
    for banned in DENYLIST:
        if banned in name_lower:
            return False

    return True


def generate_single_random_name() -> str:
    """
    Generates a cryptographically random neutral resource name.
    Format: [neutral-adjective]-[neutral-noun]-[4-digits]
    Example: 'amber-finch-4827'
    """
    max_attempts = 100
    for _ in range(max_attempts):
        adj = secrets.choice(NEUTRAL_ADJECTIVES)
        noun = secrets.choice(NEUTRAL_NOUNS)
        num = secrets.randbelow(9000) + 1000  # 1000 - 9999

        candidate = f"{adj}-{noun}-{num}"
        if is_name_allowed(candidate):
            return candidate

    raise RuntimeError("Failed to generate a valid neutral name within iteration limits.")


def generate_token_name(exclude: Optional[Set[str]] = None) -> str:
    """
    Generates an independent, cryptographically random neutral name for a Cloudflare API Token.
    Validates against the centralized denylist and guarantees it is distinct from any excluded names
    (such as Worker or D1 names).
    """
    exclude_set = {n.lower() for n in exclude} if exclude else set()
    for _ in range(100):
        candidate = generate_single_random_name()
        if candidate.lower() not in exclude_set:
            return candidate
    raise RuntimeError("Failed to generate distinct neutral token name within iteration limits.")


def generate_deployment_names(exclude: Optional[Set[str]] = None) -> Tuple[str, str]:
    """
    Generates two independent random names for a fresh deployment:
    1. Worker Script Name
    2. D1 Database Name
    Guarantees that both names are distinct, neutral, validated, and optionally distinct
    from an excluded name (such as the API Token name).
    """
    exclude_set = {n.lower() for n in exclude} if exclude else set()
    worker_name = generate_single_random_name()
    while worker_name.lower() in exclude_set:
        worker_name = generate_single_random_name()

    d1_name = generate_single_random_name()
    while d1_name == worker_name or d1_name.lower() in exclude_set:
        d1_name = generate_single_random_name()

    return worker_name, d1_name


def generate_independent_resource_names() -> Tuple[str, str, str]:
    """
    Generates three independent, pairwise distinct random neutral names:
    (token_name, worker_name, d1_name)
    Guarantees pairwise distinctness:
      len({token_name, worker_name, d1_name}) == 3
      token_name != worker_name
      token_name != d1_name
      worker_name != d1_name
    """
    for _ in range(100):
        token_name = generate_token_name()
        worker_name, d1_name = generate_deployment_names(exclude={token_name})
        if len({token_name, worker_name, d1_name}) == 3 and token_name != worker_name and token_name != d1_name and worker_name != d1_name:
            return token_name, worker_name, d1_name
    raise RuntimeError("Failed to generate pairwise distinct resource names within iteration limits.")
