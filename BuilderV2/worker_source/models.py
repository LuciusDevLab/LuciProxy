"""
LuciProxy Manager - Worker Source and Deployment Models.
Typed data transfer objects representing Worker source snapshots,
version signals, and deployment packages.
"""

from dataclasses import dataclass, field
from pathlib import Path
from typing import Any, Dict, List, Optional

# Re-export canonical WorkerVersionSignal from spec engine
from ..spec.versioning import WorkerVersionSignal


@dataclass
class WorkerSourceSnapshot:
    """
    Represents an extracted Worker source tree at an immutable revision.
    """
    revision: str  # 40-character commit SHA
    source_dir: Path  # Root directory of the extracted source (containing src/, package.json)
    file_count: int = 0
    is_valid: bool = True
    validation_errors: List[str] = field(default_factory=list)


@dataclass
class DeploymentPackage:
    """
    Self-contained Worker deployment bundle prepared for Cloudflare edge upload.
    """
    version: str
    source_revision: str
    main_module: str
    bundle_code: str
    bundle_sha256: str
    compatibility_date: str = "2026-10-01"
    compatibility_flags: List[str] = field(default_factory=lambda: ["nodejs_compat"])
    d1_binding_name: str = "IOT_DB"
    metadata: Dict[str, Any] = field(default_factory=dict)
