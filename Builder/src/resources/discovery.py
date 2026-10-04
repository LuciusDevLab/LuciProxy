"""
LuciProxy Builder - Resource Discovery & Deployment Planner
Inspects local LuciProxy project and Cloudflare account to build a deterministic deployment plan.
"""

from dataclasses import dataclass, field
import json
from pathlib import Path
from typing import Any, Dict, List, Optional

from ..cloudflare.client import CloudflareClient
from ..cloudflare.exceptions import CloudflareError


@dataclass
class DeploymentPlan:
    """Contains the calculated deployment strategy and required actions."""
    account_id: str
    account_email: str
    worker_name: str
    worker_exists: bool
    d1_name: str
    d1_id: Optional[str]
    d1_needs_creation: bool
    subdomain: Optional[str]
    target_url: str
    bindings: List[Dict[str, Any]] = field(default_factory=list)
    is_update: bool = False
    actions: List[str] = field(default_factory=list)

    def summary(self) -> str:
        lines = [
            f"Account:         {self.account_email} ({self.account_id})",
            f"Worker Name:     {self.worker_name} ({'Update Existing' if self.is_update else 'Create New'})",
            f"D1 Database:     {self.d1_name} ({'Reuse Existing: ' + self.d1_id if not self.d1_needs_creation else 'Create New'})",
            f"Target URL:      {self.target_url}",
            f"Planned Actions: {len(self.actions)} actions scheduled",
        ]
        for a in self.actions:
            lines.append(f"  - {a}")
        return "\n".join(lines)


class ResourceDiscovery:
    """Discovers local project requirements and checks remote Cloudflare state."""

    def __init__(self, project_dir: Path, client: CloudflareClient, account_id: str):
        self.project_dir = Path(project_dir)
        self.client = client
        self.account_id = account_id

    def inspect_local_project(self) -> Dict[str, Any]:
        """Validates that local LuciProxy files exist and extracts base config."""
        main_file = self.project_dir / "src" / "index.js"
        if not main_file.exists():
            raise FileNotFoundError(f"LuciProxy entry point not found at {main_file}")

        config_file = self.project_dir / "src" / "config.js"
        if not config_file.exists():
            raise FileNotFoundError(f"LuciProxy config not found at {config_file}")

        # Check for wrangler config if present
        wrangler_jsonc = self.project_dir / "wrangler.jsonc"
        worker_name = "luciproxy-gate"
        d1_name = "luciproxy-db"

        if wrangler_jsonc.exists():
            try:
                # Basic strip of comments for jsonc
                text = wrangler_jsonc.read_text(encoding="utf-8")
                clean_lines = [l for l in text.splitlines() if not l.strip().startswith("//")]
                cfg = json.loads("\n".join(clean_lines))
                if cfg.get("name"):
                    worker_name = cfg["name"]
                d1_bindings = cfg.get("d1_databases", [])
                if d1_bindings and d1_bindings[0].get("database_name"):
                    d1_name = d1_bindings[0]["database_name"]
            except Exception:
                pass

        return {
            "worker_name": worker_name,
            "d1_name": d1_name,
            "main_file": main_file,
            "compatibility_date": "2026-10-01",
            "compatibility_flags": ["nodejs_compat"]
        }

    def plan_deployment(
        self,
        worker_name_override: Optional[str] = None,
        d1_name_override: Optional[str] = None,
        force_recreate: bool = False
    ) -> DeploymentPlan:
        """Determines what remote resources already exist and generates the plan."""
        local = self.inspect_local_project()
        worker_name = worker_name_override or local["worker_name"]
        d1_name = d1_name_override or local["d1_name"]

        # Email is non-essential metadata; eliminate GET /user dependency to keep token permissions minimal
        email = ""
        subdomain = self.client.get_workers_subdomain(self.account_id)
        if not subdomain:
            subdomain = f"{worker_name}.workers.dev"

        # 1. Check Worker existence
        existing_worker = self.client.get_worker(self.account_id, worker_name)
        worker_exists = existing_worker is not None
        is_update = worker_exists and not force_recreate

        # 2. Check D1 Database existence
        d1_list = self.client.list_d1_databases(self.account_id, name=d1_name)
        d1_id = None
        d1_needs_creation = True

        for db in d1_list:
            if db.get("name") == d1_name:
                d1_id = db.get("uuid")
                d1_needs_creation = False
                break

        actions = []
        if d1_needs_creation:
            actions.append(f"Create D1 SQLite database '{d1_name}'")
            actions.append("Initialize kv_store schema on new D1 database")
        else:
            actions.append(f"Reuse existing D1 database '{d1_name}' ({d1_id})")

        if is_update:
            actions.append(f"Update existing Worker '{worker_name}' script and bindings")
        else:
            actions.append(f"Deploy new Worker '{worker_name}' to Cloudflare edge")

        subdomain_clean = subdomain
        if subdomain_clean and not subdomain_clean.endswith(".workers.dev"):
            subdomain_clean = f"{subdomain_clean}.workers.dev"

        target_url = f"https://{worker_name}.{subdomain_clean}" if subdomain_clean else f"https://{worker_name}.workers.dev"

        actions.append(f"Enable *.workers.dev route ({target_url})")
        actions.append("Execute post-deployment verification and health check")

        bindings = []
        if d1_id:
            bindings.append({
                "type": "d1",
                "name": "IOT_DB",
                "id": d1_id
            })

        return DeploymentPlan(
            account_id=self.account_id,
            account_email=email,
            worker_name=worker_name,
            worker_exists=worker_exists,
            d1_name=d1_name,
            d1_id=d1_id,
            d1_needs_creation=d1_needs_creation,
            subdomain=subdomain,
            target_url=target_url,
            bindings=bindings,
            is_update=is_update,
            actions=actions
        )
