"""
LuciProxy Manager - Worker Deployment Models.
Data transfer objects representing results of Worker creation and update operations.
"""

from dataclasses import dataclass, field
from typing import Any, Dict, Optional


def get_panel_url(base_url: Optional[str], api_route: Optional[str] = None) -> Optional[str]:
    """
    Computes the canonical LuciProxy Panel URL (/<api_route>/dash) from a worker base URL.
    Normalizes trailing slashes, prevents duplicate paths, and preserves query/fragment integrity.
    """
    if not base_url or not isinstance(base_url, str):
        return None
    clean = base_url.strip()
    if not clean:
        return None
    # Strip any trailing slashes
    clean = clean.rstrip("/")
    route = (api_route or "sync").strip().strip("/")
    if not route:
        route = "sync"
    if clean.endswith(f"/{route}/dash"):
        return clean
    return f"{clean}/{route}/dash"


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
    api_route: str = "sync"
    d1_name: Optional[str] = None
    master_key: Optional[str] = None
    error: Optional[str] = None
    details: Dict[str, Any] = field(default_factory=dict)

    @property
    def panel_url(self) -> Optional[str]:
        """Canonical LuciProxy control panel URL."""
        return get_panel_url(self.worker_url, self.api_route)

