"""
LuciProxy Manager - Secure Neutral Resource Naming Engine.
Generates cryptographically random, neutral resource names for Workers and D1 databases
with an extensible, case-insensitive denylist preventing disclosure of service purpose.
"""

import re
import secrets
from typing import Optional, Set, Tuple

DENYLIST: Set[str] = {
    "vpn", "proxy", "edge", "tunnel", "vless", "trojan", "xray",
    "clash", "singbox", "wireguard", "amnezia", "shadowsocks",
    "warp", "gateway", "relay", "server", "config", "panel",
    "node", "luciproxy", "luci"
}

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

NEUTRAL_NOUNS = [
    "birch", "brook", "canyon", "cedar", "cliff", "cloud", "clover", "creek",
    "elm", "falcon", "fern", "finch", "forest", "glade", "glen", "grove",
    "harbor", "hawk", "heron", "hill", "island", "lake", "lark", "leaf",
    "meadow", "moon", "moss", "mountain", "oak", "oasis", "orchard", "orchid",
    "peak", "pebble", "pine", "quarry", "rain", "ridge", "river", "robin",
    "sand", "sea", "sparrow", "spring", "star", "stone", "stream", "summit",
    "valley", "wave", "willow", "wind", "woods"
]

CLOUDFLARE_NAME_PATTERN = re.compile(r"^[a-z0-9][a-z0-9-]{1,61}[a-z0-9]$")


def is_name_allowed(name: str) -> bool:
    """Validates that a name complies with Cloudflare constraints and contains zero denylist terms."""
    if not name or not isinstance(name, str):
        return False
    name_lower = name.lower()
    if not CLOUDFLARE_NAME_PATTERN.match(name_lower):
        return False
    for banned in DENYLIST:
        if banned in name_lower:
            return False
    return True


def generate_single_random_name() -> str:
    """Generates a cryptographically random neutral resource name (e.g. 'amber-finch-4827')."""
    for _ in range(100):
        adj = secrets.choice(NEUTRAL_ADJECTIVES)
        noun = secrets.choice(NEUTRAL_NOUNS)
        num = secrets.randbelow(9000) + 1000
        candidate = f"{adj}-{noun}-{num}"
        if is_name_allowed(candidate):
            return candidate
    raise RuntimeError("Failed to generate a valid neutral name within iteration limits.")


def generate_deployment_names(exclude: Optional[Set[str]] = None) -> Tuple[str, str]:
    """
    Generates two independent random names for a fresh deployment:
    (worker_name, d1_name).
    """
    exclude_set = {n.lower() for n in exclude} if exclude else set()
    worker_name = generate_single_random_name()
    while worker_name.lower() in exclude_set:
        worker_name = generate_single_random_name()

    d1_name = generate_single_random_name()
    while d1_name == worker_name or d1_name.lower() in exclude_set:
        d1_name = generate_single_random_name()

    return worker_name, d1_name
