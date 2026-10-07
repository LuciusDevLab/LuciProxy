"""
LuciProxy Manager - Worker Deployment Models.
Data transfer objects representing results of Worker creation and update operations.
"""

from dataclasses import dataclass, field
from typing import Any, Dict, Optional


@dataclass
class DeploymentResult:
    """Represents the outcome of a Worker creation or update execution."""
    success: bool
    action: str  # 'create' | 'update'
    worker_name: str
    d1_database_id: str
    d1_binding_name: str
    worker_version: str
    source_revision: str
    bundle_sha256: str
    worker_url: Optional[str] = None
    d1_name: Optional[str] = None
    master_key: Optional[str] = None
    error: Optional[str] = None
    details: Dict[str, Any] = field(default_factory=dict)
