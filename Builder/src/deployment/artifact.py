"""
LuciProxy Builder - Embedded Artifact Manager & Checksum Verifier
Loads the embedded production Worker bundle and manifest, verifies SHA-256 integrity,
and constructs the Cloudflare REST multipart upload payload.
"""

from dataclasses import dataclass
import hashlib
import json
import sys
from pathlib import Path
from typing import Any, Dict, List, Optional, Tuple


def get_default_assets_dir() -> Path:
    """Resolves assets directory in both source development and frozen PyInstaller modes."""
    if getattr(sys, "frozen", False) and hasattr(sys, "_MEIPASS"):
        meipass = Path(sys._MEIPASS)
        for cand in [meipass / "src" / "assets", meipass / "assets"]:
            if cand.exists():
                return cand
    return Path(__file__).resolve().parent.parent / "assets"


ASSETS_DIR = get_default_assets_dir()


@dataclass
class ArtifactManifest:
    luciproxy_version: str
    git_commit: str
    artifact_sha256: str
    builder_version: str
    build_timestamp: str
    compatibility_date: str
    compatibility_flags: List[str]
    main_module: str
    d1_binding_name: str


class EmbeddedArtifactManager:
    """Manages embedded LuciProxy Worker bundle loading, verification, and multipart serialization."""

    def __init__(self, assets_dir: Optional[Path] = None):
        self.assets_dir = Path(assets_dir) if assets_dir else get_default_assets_dir()
        self.manifest_file = self.assets_dir / "manifest.json"
        self.bundle_file = self.assets_dir / "worker_bundle.js"

    def load_manifest(self) -> ArtifactManifest:
        """Loads and validates the embedded production manifest."""
        if not self.manifest_file.exists():
            raise FileNotFoundError(f"Embedded manifest not found at {self.manifest_file}")

        try:
            raw = json.loads(self.manifest_file.read_text(encoding="utf-8"))
        except Exception as e:
            raise ValueError(f"Malformed embedded manifest JSON: {e}") from e

        required_keys = ["luciproxy_version", "artifact_sha256", "main_module", "d1_binding_name"]
        for key in required_keys:
            if key not in raw:
                raise ValueError(f"Manifest missing required key: '{key}'")

        return ArtifactManifest(
            luciproxy_version=raw.get("luciproxy_version", "1.0.0"),
            git_commit=raw.get("git_commit", "unknown"),
            artifact_sha256=raw.get("artifact_sha256", "").lower(),
            builder_version=raw.get("builder_version", "1.0.0"),
            build_timestamp=raw.get("build_timestamp", ""),
            compatibility_date=raw.get("compatibility_date", "2026-10-01"),
            compatibility_flags=raw.get("compatibility_flags", ["nodejs_compat"]),
            main_module=raw.get("main_module", "index.js"),
            d1_binding_name=raw.get("d1_binding_name", "IOT_DB")
        )

    def load_and_verify_bundle(self) -> Tuple[str, ArtifactManifest]:
        """
        Loads the embedded Worker bundle and validates its SHA-256 checksum against manifest.
        Raises ValueError if checksum mismatch is detected.
        Returns: (bundle_content_str, manifest)
        """
        manifest = self.load_manifest()

        if not self.bundle_file.exists():
            raise FileNotFoundError(f"Embedded Worker bundle not found at {self.bundle_file}")

        bundle_content = self.bundle_file.read_text(encoding="utf-8")
        computed_sha = hashlib.sha256(bundle_content.encode("utf-8")).hexdigest().lower()

        if computed_sha != manifest.artifact_sha256:
            raise ValueError(
                f"Embedded Worker bundle checksum mismatch! "
                f"Computed: {computed_sha}, Expected in manifest: {manifest.artifact_sha256}. "
                f"Deployment aborted to prevent running untrusted code."
            )

        return bundle_content, manifest

    def prepare_multipart_payload(
        self,
        worker_name: str,
        d1_uuid: str,
        master_key: Optional[str] = None
    ) -> Tuple[Dict[str, Any], Dict[str, Tuple[Optional[str], Any, str]]]:
        """
        Synthesizes Cloudflare Workers REST API multipart form-data payload.
        Dynamically binds the created D1 database UUID.
        Administrative credentials (MASTER_KEY) are provisioned exclusively via
        Cloudflare's official Worker Secrets API and NEVER as plaintext bindings.
        Returns: (metadata_dict, files_dict)
        """
        bundle_code, manifest = self.load_and_verify_bundle()

        bindings: List[Dict[str, Any]] = [
            {
                "type": "d1",
                "name": manifest.d1_binding_name,
                "id": d1_uuid
            }
        ]

        metadata = {
            "main_module": manifest.main_module,
            "compatibility_date": manifest.compatibility_date,
            "compatibility_flags": manifest.compatibility_flags,
            "bindings": bindings,
            "observability": {
                "enabled": True
            }
        }

        files = {
            "metadata": (None, json.dumps(metadata), "application/json"),
            manifest.main_module: (manifest.main_module, bundle_code, "application/javascript+module")
        }

        return metadata, files

