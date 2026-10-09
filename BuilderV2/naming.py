"""
LuciProxy Manager - Canonical Naming Module.
Re-exports NamingPolicy and naming engine utilities.
"""

from .deployment.naming import (
    DENYLIST,
    NEUTRAL_ADJECTIVES,
    NEUTRAL_NOUNS,
    NamingPolicy,
    is_name_allowed,
    are_pairwise_distinct,
    generate_single_random_name,
    generate_token_name,
    generate_worker_name,
    generate_d1_name,
    generate_deployment_names,
    generate_independent_resource_names,
    build_token_creation_url,
    generate_random_api_route,
    is_valid_api_route,
    PROTOCOL_KEYWORDS,
)

__all__ = [
    "PROTOCOL_KEYWORDS",
    "DENYLIST",
    "NEUTRAL_ADJECTIVES",
    "NEUTRAL_NOUNS",
    "NamingPolicy",
    "is_name_allowed",
    "are_pairwise_distinct",
    "generate_single_random_name",
    "generate_token_name",
    "generate_worker_name",
    "generate_d1_name",
    "generate_deployment_names",
    "generate_independent_resource_names",
    "build_token_creation_url",
    "generate_random_api_route",
    "is_valid_api_route",
]
