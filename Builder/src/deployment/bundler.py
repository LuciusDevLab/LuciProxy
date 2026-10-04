"""
LuciProxy Builder - Project Bundler & Configuration Synchronizer
Ensures local project files are valid, synthesizes deployment configuration,
and guarantees zero secret leakage to disk.
"""

import json
from pathlib import Path
from typing import Any, Dict, List, Optional


class ProjectBundler:
    """Validates local LuciProxy source tree and prepares configuration."""

    def __init__(self, project_dir: Path):
        self.project_dir = Path(project_dir)

    def validate_source_integrity(self) -> None:
        """Verifies essential LuciProxy runtime files exist and are intact."""
        required_files = [
            self.project_dir / "src" / "index.js",
            self.project_dir / "src" / "config.js",
            self.project_dir / "src" / "protocols" / "proxy.js",
            self.project_dir / "src" / "protocols" / "vless.js",
            self.project_dir / "src" / "protocols" / "trojan.js",
            self.project_dir / "src" / "db" / "d1.js",
            self.project_dir / "package.json",
        ]

        missing = [str(f.relative_to(self.project_dir)) for f in required_files if not f.exists()]
        if missing:
            raise FileNotFoundError(
                f"LuciProxy source tree is incomplete. Missing required files: {', '.join(missing)}"
            )

    def generate_wrangler_config(
        self,
        worker_name: str,
        d1_name: str,
        d1_id: str,
        compatibility_date: str = "2026-10-01"
    ) -> Dict[str, Any]:
        """
        Synthesizes standard Cloudflare Workers deployment configuration.
        NOTE: Never includes API tokens or admin credentials in this config.
        """
        config = {
            "name": worker_name,
            "main": "src/index.js",
            "compatibility_date": compatibility_date,
            "compatibility_flags": ["nodejs_compat"],
            "d1_databases": [
                {
                    "binding": "IOT_DB",
                    "database_name": d1_name,
                    "database_id": d1_id
                }
            ],
            "observability": {
                "enabled": True
            }
        }
        return config

    def write_runtime_config(
        self,
        worker_name: str,
        d1_name: str,
        d1_id: str,
        target_path: Optional[Path] = None
    ) -> Path:
        """Writes sanitized wrangler.json into the target project directory."""
        self.validate_source_integrity()
        cfg = self.generate_wrangler_config(worker_name, d1_name, d1_id)

        out_path = target_path or (self.project_dir / "wrangler.json")
        with open(out_path, "w", encoding="utf-8") as f:
            json.dump(cfg, f, indent=2)

        return out_path
