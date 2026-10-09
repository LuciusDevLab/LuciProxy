"""
LuciProxy PYandroid - Core Domain Models & DTOs.
100% Pure Python standard library dataclasses.
"""

from dataclasses import dataclass, field, asdict
from typing import Any, Dict, List, Optional


@dataclass
class TokenVerificationDto:
    valid: bool
    status: str
    token_id: Optional[str] = None
    expires_on: Optional[str] = None
    error: Optional[str] = None

    def to_dict(self) -> Dict[str, Any]:
        return asdict(self)


@dataclass
class CloudflareAccountDto:
    id: str
    name: str

    def to_dict(self) -> Dict[str, Any]:
        return asdict(self)


@dataclass
class D1BindingDto:
    binding_name: str
    database_id: str
    database_name: Optional[str] = None

    def to_dict(self) -> Dict[str, Any]:
        return asdict(self)


@dataclass
class WorkerSummaryDto:
    id: str
    name: str
    modified_on: Optional[str] = None
    is_luciproxy: bool = False
    d1_bindings: List[D1BindingDto] = field(default_factory=list)
    d1_display: str = "No binding"
    installed_version: str = "Unrecorded"

    def to_dict(self) -> Dict[str, Any]:
        return asdict(self)


@dataclass
class AccountSummaryDto:
    account_id: str
    account_name: str
    requests: str = "Unavailable"
    requests_num: Optional[int] = None
    quota: str = "Unavailable"
    quota_num: Optional[int] = None
    workers_count: int = 0
    d1_count: int = 0

    def to_dict(self) -> Dict[str, Any]:
        return asdict(self)


@dataclass
class DeploymentResult:
    success: bool
    worker_name: str
    worker_url: str
    panel_url: str
    api_route: str
    d1_name: str
    d1_database_id: str
    uuid: str
    version: str
    error: Optional[str] = None

    def to_dict(self) -> Dict[str, Any]:
        return asdict(self)
