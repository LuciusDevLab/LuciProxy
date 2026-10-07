"""
LuciProxy Manager - Worker Source Service.
Downloads, caches, validates, and compiles Worker source trees directly from
the canonical GitHub repository at immutable commit revisions.
Zero host runtime dependencies: NO Node.js, NO npm, NO Wrangler, NO Git.
"""

import io
import json
import os
from pathlib import Path
import re
import tempfile
from typing import List, Optional, Tuple
import zipfile

import requests

from ..spec.versioning import WorkerVersionSignal, parse_worker_version_signal
from .models import WorkerSourceSnapshot, DeploymentPackage
from .bundler import WorkerBundler

CANONICAL_OWNER = "LuciusDevLab"
CANONICAL_REPO = "LuciProxy"

# Required files in a valid LuciProxy Worker source tree
REQUIRED_SOURCE_FILES = [
    Path("src") / "index.js",
    Path("src") / "config.js",
    Path("src") / "db" / "d1.js",
    Path("src") / "assets" / "loaders.js",
    Path("package.json"),
]

SHA40_PATTERN = re.compile(r"^[0-9a-fA-F]{40}$")


class SecurityError(Exception):
    """Raised when an insecure archive or path traversal is detected."""
    pass


class WorkerSourceService:

    """Manages discovery, download, caching, and bundling of Worker source revisions."""

    def __init__(
        self,
        repo_owner: str = CANONICAL_OWNER,
        repo_name: str = CANONICAL_REPO,
        cache_dir: Optional[Path] = None,
        bundler: Optional[WorkerBundler] = None,
        session: Optional[requests.Session] = None,
        timeout: int = 30,
    ):
        self.repo_owner = repo_owner
        self.repo_name = repo_name
        self.cache_dir = Path(cache_dir) if cache_dir else Path(tempfile.gettempdir()) / "luciproxy_worker_sources"
        self.bundler = bundler or WorkerBundler()
        self.session = session or requests.Session()
        self.timeout = timeout

    @staticmethod
    def validate_source_revision(revision: Optional[str]) -> bool:
        """
        Validates that a revision string is a strictly immutable 40-character hex commit SHA.
        Rejects branch names, tags, dirty indicators ('WORKTREE-UNCOMMITTED'), or malformed strings.
        """
        if not revision or not isinstance(revision, str):
            return False
        return bool(SHA40_PATTERN.match(revision.strip()))

    def fetch_version_signal(
        self,
        ref: str = "main",
        local_file: Optional[Path] = None
    ) -> WorkerVersionSignal:
        """
        Fetches and validates the authoritative Worker version signal (version.json).
        If local_file is provided and exists, reads from local disk.
        Otherwise, fetches from GitHub repository default branch.
        """
        if local_file and Path(local_file).exists():
            content = Path(local_file).read_text(encoding="utf-8")
            data = json.loads(content)
            signal = parse_worker_version_signal(data)
        else:
            url = f"https://raw.githubusercontent.com/{self.repo_owner}/{self.repo_name}/{ref}/version.json"
            headers = {"User-Agent": "LuciProxy-Manager/2.0"}
            resp = self.session.get(url, headers=headers, timeout=self.timeout)
            if not resp.ok:
                raise RuntimeError(
                    f"Failed to fetch Worker version signal from {url} (HTTP {resp.status_code})"
                )
            data = resp.json()
            signal = parse_worker_version_signal(data)



        # Enforce valid source_revision in signal
        if not self.validate_source_revision(signal.source_revision):
            raise ValueError(
                f"Authoritative Worker version signal declares invalid source_revision: '{signal.source_revision}'. "
                f"Must be a 40-character hexadecimal Git commit SHA."
            )

        return signal

    def validate_source_tree(self, source_dir: Path) -> Tuple[bool, List[str]]:
        """
        Verifies that a directory contains all required LuciProxy Worker source components.
        Returns (is_valid, list_of_missing_rel_paths).
        """
        s_path = Path(source_dir)
        missing: List[str] = []
        for req in REQUIRED_SOURCE_FILES:
            full_path = s_path / req
            if not full_path.exists():
                missing.append(str(req).replace("\\", "/"))

        return (len(missing) == 0, missing)

    def download_source_at_revision(
        self,
        source_revision: str,
        target_dir: Optional[Path] = None,
        force_redownload: bool = False
    ) -> WorkerSourceSnapshot:
        """
        Downloads Worker source tree at the exact immutable commit revision directly from GitHub.
        Extracts only LuciProxy/ source files into cache.
        Guarantees path traversal protection and verifies tree integrity.
        """
        clean_revision = str(source_revision or "").strip().lower()
        if not self.validate_source_revision(clean_revision):
            raise ValueError(
                f"Invalid Worker source revision '{source_revision}'. "
                f"Must be a 40-character hexadecimal commit SHA."
            )

        dest_dir = Path(target_dir) if target_dir else self.cache_dir / clean_revision / "LuciProxy"

        # Check existing cache
        if not force_redownload and dest_dir.exists():
            is_valid, missing = self.validate_source_tree(dest_dir)
            if is_valid:
                files = list(dest_dir.rglob("*"))
                return WorkerSourceSnapshot(
                    revision=clean_revision,
                    source_dir=dest_dir,
                    file_count=len(files),
                    is_valid=True,
                    validation_errors=[]
                )

        # Download zipball from GitHub
        url = f"https://api.github.com/repos/{self.repo_owner}/{self.repo_name}/zipball/{clean_revision}"
        headers = {
            "User-Agent": "LuciProxy-Manager/2.0",
            "Accept": "application/vnd.github+json"
        }
        resp = self.session.get(url, headers=headers, timeout=self.timeout)
        if not resp.ok:
            raise RuntimeError(
                f"Failed to download Worker source archive for revision {clean_revision} (HTTP {resp.status_code})"
            )

        dest_dir.mkdir(parents=True, exist_ok=True)

        with zipfile.ZipFile(io.BytesIO(resp.content)) as zf:
            namelist = zf.namelist()
            # GitHub archive root is typically '<owner>-<repo>-<short_sha>/'
            root_prefix = namelist[0].split("/")[0] if namelist else ""
            target_prefix = f"{root_prefix}/LuciProxy/"

            extracted_count = 0
            for member in zf.infolist():
                if member.filename.startswith(target_prefix) and not member.is_dir():
                    # Compute relative path inside LuciProxy/
                    rel_path = member.filename[len(target_prefix):]
                    out_path = dest_dir / rel_path

                    # Guard against directory traversal
                    resolved_out = out_path.resolve()
                    if not str(resolved_out).startswith(str(dest_dir.resolve())):
                        raise SecurityError(f"Directory traversal detected in archive member: {member.filename}")

                    out_path.parent.mkdir(parents=True, exist_ok=True)
                    out_path.write_bytes(zf.read(member.filename))
                    extracted_count += 1

        is_valid, missing = self.validate_source_tree(dest_dir)
        if not is_valid:
            raise RuntimeError(
                f"Extracted Worker source tree at revision {clean_revision} failed validation. "
                f"Missing required files: {missing}"
            )

        return WorkerSourceSnapshot(
            revision=clean_revision,
            source_dir=dest_dir,
            file_count=extracted_count,
            is_valid=True,
            validation_errors=[]
        )

    def build_deployment_package(
        self,
        snapshot: WorkerSourceSnapshot,
        version: str
    ) -> DeploymentPackage:
        """
        Compiles the Worker source snapshot using local standalone bundler
        and constructs an authoritative DeploymentPackage.
        """
        is_valid, missing = self.validate_source_tree(snapshot.source_dir)
        if not is_valid:
            raise RuntimeError(
                f"Cannot build deployment package: invalid source tree at {snapshot.source_dir}. "
                f"Missing: {missing}"
            )

        bundle_code, bundle_sha256 = self.bundler.bundle_worker(snapshot.source_dir)
        if not bundle_code or not bundle_code.strip():
            raise RuntimeError("Bundled Worker code is empty.")

        metadata = {
            "main_module": "index.js",
            "compatibility_date": "2026-10-01",
            "compatibility_flags": ["nodejs_compat"],
            "observability": {
                "enabled": True
            }
        }

        return DeploymentPackage(
            version=version,
            source_revision=snapshot.revision,
            main_module="index.js",
            bundle_code=bundle_code,
            bundle_sha256=bundle_sha256,
            compatibility_date="2026-10-01",
            compatibility_flags=["nodejs_compat"],
            d1_binding_name="IOT_DB",
            metadata=metadata
        )
