"""
LuciProxy Manager - Cloudflare API Domain Data Transfer Objects (DTOs).
Normalized typed models separating API response parsing from internal business logic.
"""

from dataclasses import dataclass, field
from typing import Any, Dict, List, Optional


@dataclass
class TokenVerificationDto:
    status: str
    id: Optional[str] = None
    expires_on: Optional[str] = None
    not_before: Optional[str] = None


@dataclass
class CloudflareAccountDto:
    id: str
    name: str
    type: Optional[str] = None


@dataclass
class WorkerSummaryDto:
    id: str
    name: str
    created_on: Optional[str] = None
    modified_on: Optional[str] = None
    usage_model: Optional[str] = None
    tags: List[str] = field(default_factory=list)


@dataclass
class WorkerBindingDto:
    type: str
    name: str
    database_id: Optional[str] = None
    namespace_id: Optional[str] = None
    raw: Dict[str, Any] = field(default_factory=dict)


@dataclass
class D1DatabaseDto:
    uuid: str
    name: str
    version: Optional[str] = None
    num_tables: int = 0
    file_size: int = 0
    created_at: Optional[str] = None


@dataclass
class DiscoveredD1BindingDto:
    binding_name: str
    database_id: str
    database_name: Optional[str] = None
    database: Optional[D1DatabaseDto] = None


@dataclass
class WorkerDeploymentDto:
    id: Optional[str] = None
    version_id: Optional[str] = None
    created_on: Optional[str] = None
    annotations: Dict[str, Any] = field(default_factory=dict)
