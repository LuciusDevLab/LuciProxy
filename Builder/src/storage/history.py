"""
LuciProxy Builder - Persistent Deployment History Manager
Tracks deployment metadata, resource identifiers, panel URLs, and verification results in %APPDATA%/luciproxy/deployments.json.
"""

from dataclasses import asdict, dataclass, field
from datetime import datetime, timezone
import json
import os
from pathlib import Path
import secrets
from typing import Any, Dict, List, Optional


@dataclass
class DeploymentRecord:
    deployment_id: str
    timestamp: str
    account_id: str
    account_name: str
    worker_name: str
    d1_name: str
    d1_uuid: str
    worker_url: str
    panel_url: str
    luciproxy_version: str
    artifact_sha256: str
    verification_results: Dict[str, Any] = field(default_factory=dict)
    status: str = "active"


class DeploymentHistoryStore:
    """Manages persistent deployment history across multiple accounts and runs."""

    def __init__(self, config_dir: Optional[Path] = None):
        if config_dir is None:
            appdata = os.environ.get("APPDATA")
            if appdata:
                self.config_dir = Path(appdata) / "luciproxy"
            else:
                self.config_dir = Path.home() / ".config" / "luciproxy"
        else:
            self.config_dir = Path(config_dir)

        self.config_dir.mkdir(parents=True, exist_ok=True)
        self.history_file = self.config_dir / "deployments.json"

    def _load_raw(self) -> List[Dict[str, Any]]:
        if not self.history_file.exists():
            return []
        try:
            with open(self.history_file, "r", encoding="utf-8") as f:
                data = json.load(f)
                return data if isinstance(data, list) else []
        except Exception:
            return []

    def _save_raw(self, items: List[Dict[str, Any]]) -> None:
        temp_file = self.history_file.with_suffix(".tmp")
        try:
            with open(temp_file, "w", encoding="utf-8") as f:
                json.dump(items, f, indent=2)
            temp_file.replace(self.history_file)
        except Exception:
            with open(self.history_file, "w", encoding="utf-8") as f:
                json.dump(items, f, indent=2)

    def list_records(self, account_id: Optional[str] = None) -> List[DeploymentRecord]:
        """Returns all deployment records, optionally filtered by account ID."""
        raw_list = self._load_raw()
        records = []
        for item in raw_list:
            if not isinstance(item, dict):
                continue
            if account_id and item.get("account_id") != account_id:
                continue
            records.append(DeploymentRecord(
                deployment_id=item.get("deployment_id", ""),
                timestamp=item.get("timestamp", ""),
                account_id=item.get("account_id", ""),
                account_name=item.get("account_name", ""),
                worker_name=item.get("worker_name", ""),
                d1_name=item.get("d1_name", ""),
                d1_uuid=item.get("d1_uuid", ""),
                worker_url=item.get("worker_url", ""),
                panel_url=item.get("panel_url", ""),
                luciproxy_version=item.get("luciproxy_version", ""),
                artifact_sha256=item.get("artifact_sha256", ""),
                verification_results=item.get("verification_results", {}),
                status=item.get("status", "active")
            ))
        return records

    def save_record(
        self,
        account_id: str,
        account_name: str,
        worker_name: str,
        d1_name: str,
        d1_uuid: str,
        worker_url: str,
        panel_url: str,
        luciproxy_version: str,
        artifact_sha256: str,
        verification_results: Optional[Dict[str, Any]] = None
    ) -> DeploymentRecord:
        """Creates and appends a new deployment record."""
        now_utc = datetime.now(timezone.utc).strftime("%Y%m%d_%H%M%S")
        rand_suffix = secrets.token_hex(2)
        deployment_id = f"dep_{now_utc}_{rand_suffix}"

        record = DeploymentRecord(
            deployment_id=deployment_id,
            timestamp=datetime.now(timezone.utc).isoformat(),
            account_id=account_id,
            account_name=account_name,
            worker_name=worker_name,
            d1_name=d1_name,
            d1_uuid=d1_uuid,
            worker_url=worker_url,
            panel_url=panel_url,
            luciproxy_version=luciproxy_version,
            artifact_sha256=artifact_sha256,
            verification_results=verification_results or {},
            status="active"
        )

        raw = self._load_raw()
        raw.insert(0, asdict(record))
        self._save_raw(raw)
        return record

    def get_record(self, deployment_id: str) -> Optional[DeploymentRecord]:
        """Retrieves a specific record by deployment ID."""
        for rec in self.list_records():
            if rec.deployment_id == deployment_id:
                return rec
        return None

    def remove_record(self, deployment_id: str) -> bool:
        """Removes a deployment record by ID."""
        raw = self._load_raw()
        filtered = [item for item in raw if item.get("deployment_id") != deployment_id]
        if len(filtered) != len(raw):
            self._save_raw(filtered)
            return True
        return False
