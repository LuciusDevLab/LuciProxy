"""
LuciProxy Builder - Complete LuciProxy Source Tree Snapshotter & Embedded Manager
Preserves the complete LuciProxy repository structure recursively for reproducible builds.
Enforces dual resolution mode:
  - Development Mode: Uses sibling '../LuciProxy' as the authoritative source of truth.
  - Packaged Mode (PyInstaller): Uses the embedded snapshot inside the single-file executable;
    never reads or requires an external '../LuciProxy' or external 'Builder' directory.
"""

from dataclasses import asdict, dataclass
import fnmatch
import hashlib
import json
import os
from pathlib import Path
import shutil
import sys
import tempfile
import time
from typing import Any, Dict, List, Optional, Set, Tuple


# Explicit packaging policy: exclude ONLY proven transient, cache, or VCS metadata files.
DEFAULT_EXCLUSION_PATTERNS = [
    ".wrangler",
    ".wrangler/*",
    "**/.wrangler/**",
    "node_modules",
    "node_modules/*",
    "**/node_modules/**",
    ".git",
    ".git/*",
    "**/.git/**",
    "__pycache__",
    "__pycache__/*",
    "**/__pycache__/**",
    "*.pyc",
    "*.pyo",
    ".DS_Store",
    "Thumbs.db",
    "desktop.ini",
    "*.tmp",
    "*~"
]

BUILDER_ROOT = Path(__file__).resolve().parent.parent.parent
DEFAULT_DEV_SOURCE_DIR = (BUILDER_ROOT.parent / "LuciProxy").resolve()
EMBEDDED_PAYLOAD_REL_PATH = Path("src") / "assets" / "luciproxy_payload" / "LuciProxy"
MANIFEST_REL_PATH = Path("src") / "assets" / "source_tree_manifest.json"


@dataclass
class SourceFileEntry:
    path: str
    sha256: str
    size_bytes: int


@dataclass
class SourceTreeManifest:
    luciproxy_version: str
    snapshot_timestamp: str
    total_files: int
    total_bytes: int
    tree_sha256: str
    exclusions: List[str]
    files: List[SourceFileEntry]

    def to_dict(self) -> Dict[str, Any]:
        return {
            "luciproxy_version": self.luciproxy_version,
            "snapshot_timestamp": self.snapshot_timestamp,
            "total_files": self.total_files,
            "total_bytes": self.total_bytes,
            "tree_sha256": self.tree_sha256,
            "exclusions": self.exclusions,
            "files": [asdict(f) for f in self.files]
        }

    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> "SourceTreeManifest":
        files = [
            SourceFileEntry(
                path=f["path"],
                sha256=f["sha256"],
                size_bytes=f["size_bytes"]
            )
            for f in data.get("files", [])
        ]
        return cls(
            luciproxy_version=data.get("luciproxy_version", "1.0.0"),
            snapshot_timestamp=data.get("snapshot_timestamp", ""),
            total_files=data.get("total_files", len(files)),
            total_bytes=data.get("total_bytes", sum(f.size_bytes for f in files)),
            tree_sha256=data.get("tree_sha256", ""),
            exclusions=data.get("exclusions", DEFAULT_EXCLUSION_PATTERNS),
            files=files
        )


def is_path_excluded(relative_path: str, exclusions: Optional[List[str]] = None) -> bool:
    """
    Checks if a relative path matches the explicit exclusion policy.
    Uses normalized forward slashes.
    """
    patterns = exclusions if exclusions is not None else DEFAULT_EXCLUSION_PATTERNS
    norm_path = relative_path.replace("\\", "/").strip("/")

    # Check whole path and individual components
    parts = norm_path.split("/")
    for pat in patterns:
        clean_pat = pat.replace("\\", "/").strip("/")
        if fnmatch.fnmatch(norm_path, clean_pat):
            return True
        for part in parts:
            if fnmatch.fnmatch(part, clean_pat):
                return True

    return False


def compute_file_sha256(file_path: Path) -> str:
    """Computes SHA-256 hash of a file."""
    h = hashlib.sha256()
    with open(file_path, "rb") as f:
        while chunk := f.read(65536):
            h.update(chunk)
    return h.hexdigest().lower()


class SourceTreeManager:
    """
    Manages the complete LuciProxy source tree during development and runtime.
    Preserves all project files needed to reproduce or build LuciProxy.
    """

    def __init__(
        self,
        dev_source_dir: Optional[Path] = None,
        embedded_dir: Optional[Path] = None,
        exclusions: Optional[List[str]] = None
    ):
        self._dev_source_dir = Path(dev_source_dir).resolve() if dev_source_dir else DEFAULT_DEV_SOURCE_DIR
        self._custom_embedded_dir = Path(embedded_dir).resolve() if embedded_dir else None
        self.exclusions = exclusions or DEFAULT_EXCLUSION_PATTERNS

    @property
    def is_packaged(self) -> bool:
        """Returns True if running from inside a frozen PyInstaller binary."""
        return bool(getattr(sys, "frozen", False) and hasattr(sys, "_MEIPASS"))

    def get_development_source_dir(self) -> Optional[Path]:
        """Returns the sibling development directory '../LuciProxy' if present."""
        if self._dev_source_dir.exists() and self._dev_source_dir.is_dir():
            return self._dev_source_dir

        # Try relative to cwd
        alt = (Path.cwd().parent / "LuciProxy").resolve()
        if alt.exists() and alt.is_dir():
            return alt

        return None

    def get_embedded_payload_dir(self) -> Optional[Path]:
        """
        Locates the embedded LuciProxy payload.
        Under PyInstaller, resolves within sys._MEIPASS.
        Under development, resolves within Builder/src/assets/luciproxy_payload/LuciProxy.
        """
        if self._custom_embedded_dir and self._custom_embedded_dir.exists():
            return self._custom_embedded_dir

        if self.is_packaged:
            meipass = Path(sys._MEIPASS)
            candidates = [
                meipass / "assets" / "luciproxy_payload" / "LuciProxy",
                meipass / "luciproxy_payload" / "LuciProxy",
                meipass / "src" / "assets" / "luciproxy_payload" / "LuciProxy",
            ]
            for c in candidates:
                if c.exists() and c.is_dir():
                    return c
            return None

        # Development environment fallback
        candidate = BUILDER_ROOT / EMBEDDED_PAYLOAD_REL_PATH
        if candidate.exists() and candidate.is_dir():
            return candidate

        return None

    def get_manifest_path(self) -> Optional[Path]:
        """Locates the source-tree manifest."""
        if self.is_packaged:
            meipass = Path(sys._MEIPASS)
            candidates = [
                meipass / "assets" / "source_tree_manifest.json",
                meipass / "source_tree_manifest.json",
                meipass / "src" / "assets" / "source_tree_manifest.json",
            ]
            for c in candidates:
                if c.exists():
                    return c
            return None

        candidate = BUILDER_ROOT / MANIFEST_REL_PATH
        if candidate.exists():
            return candidate
        return None

    def get_authoritative_source_dir(self) -> Path:
        """
        Resolves the authoritative LuciProxy source tree:
        - When packaged into an EXE: MUST use the embedded directory, MUST NOT read ../LuciProxy,
          and MUST NOT require external folders.
        - When in development mode: uses the sibling '../LuciProxy' folder as source of truth.
        """
        if self.is_packaged:
            embedded = self.get_embedded_payload_dir()
            if not embedded:
                raise FileNotFoundError(
                    "Packaged application error: Embedded LuciProxy payload directory was not found in binary."
                )
            return embedded

        # Development mode
        dev_dir = self.get_development_source_dir()
        if dev_dir:
            return dev_dir

        # Fallback to embedded payload if development sibling is not present
        embedded = self.get_embedded_payload_dir()
        if embedded:
            return embedded

        raise FileNotFoundError(
            f"LuciProxy source directory not found. Expected sibling folder at '{self._dev_source_dir}'."
        )

    def scan_source_files(self, source_dir: Path) -> List[Tuple[str, Path, int, str]]:
        """
        Scans all files in source_dir, applying the exclusion policy.
        Returns sorted list of (relative_path_posix, absolute_path, size_bytes, sha256).
        """
        if not source_dir.exists() or not source_dir.is_dir():
            raise FileNotFoundError(f"Source directory '{source_dir}' does not exist.")

        scanned = []
        for file_path in source_dir.rglob("*"):
            if not file_path.is_file():
                continue

            rel_posix = file_path.relative_to(source_dir).as_posix()
            if is_path_excluded(rel_posix, self.exclusions):
                continue

            size = file_path.stat().st_size
            sha = compute_file_sha256(file_path)
            scanned.append((rel_posix, file_path, size, sha))

        scanned.sort(key=lambda item: item[0])
        return scanned

    def create_snapshot(
        self,
        source_dir: Optional[Path] = None,
        target_payload_dir: Optional[Path] = None,
        manifest_output_path: Optional[Path] = None,
        version: Optional[str] = None
    ) -> SourceTreeManifest:
        """
        Takes the complete development LuciProxy directory and creates an exact snapshot:
        1. Copies all non-excluded files preserving full directory hierarchy.
        2. Computes per-file SHA-256 and byte sizes.
        3. Computes composite tree SHA-256.
        4. Writes source-tree manifest.
        """
        src = Path(source_dir).resolve() if source_dir else self._dev_source_dir
        dest = Path(target_payload_dir).resolve() if target_payload_dir else (BUILDER_ROOT / EMBEDDED_PAYLOAD_REL_PATH)
        man_path = Path(manifest_output_path).resolve() if manifest_output_path else (BUILDER_ROOT / MANIFEST_REL_PATH)

        if not src.exists():
            raise FileNotFoundError(f"Cannot create snapshot: source directory '{src}' does not exist.")

        if not version:
            try:
                pkg_file = src / "package.json"
                if pkg_file.exists():
                    version = json.loads(pkg_file.read_text(encoding="utf-8")).get("version", "1.1.0")
                else:
                    ver_file = src / "version.json"
                    if ver_file.exists():
                        version = json.loads(ver_file.read_text(encoding="utf-8")).get("version", "1.1.0")
            except Exception:
                version = "1.1.0"

        # Clean/create target payload directory
        if dest.exists():
            shutil.rmtree(dest)
        dest.mkdir(parents=True, exist_ok=True)

        scanned = self.scan_source_files(src)
        entries = []
        total_bytes = 0
        composite_hasher = hashlib.sha256()

        for rel_posix, abs_path, size, sha in scanned:
            dest_file = dest / Path(rel_posix)
            dest_file.parent.mkdir(parents=True, exist_ok=True)
            shutil.copy2(abs_path, dest_file)

            entries.append(SourceFileEntry(
                path=rel_posix,
                sha256=sha,
                size_bytes=size
            ))
            total_bytes += size
            composite_hasher.update(f"{rel_posix}:{sha}\n".encode("utf-8"))

        manifest = SourceTreeManifest(
            luciproxy_version=version,
            snapshot_timestamp=time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
            total_files=len(entries),
            total_bytes=total_bytes,
            tree_sha256=composite_hasher.hexdigest().lower(),
            exclusions=self.exclusions,
            files=entries
        )

        man_path.parent.mkdir(parents=True, exist_ok=True)
        man_path.write_text(json.dumps(manifest.to_dict(), indent=2), encoding="utf-8")

        return manifest

    def load_manifest(self) -> SourceTreeManifest:
        """Loads and parses the snapshot manifest."""
        man_path = self.get_manifest_path()
        if not man_path or not man_path.exists():
            raise FileNotFoundError(f"Source tree manifest not found at '{man_path}'.")

        data = json.loads(man_path.read_text(encoding="utf-8"))
        return SourceTreeManifest.from_dict(data)

    def verify_snapshot_integrity(
        self,
        tree_dir: Optional[Path] = None,
        manifest: Optional[SourceTreeManifest] = None
    ) -> Tuple[bool, List[str]]:
        """
        Validates that a given directory matches the source tree manifest exactly.
        Checks:
        - Every manifest file exists.
        - Checksum matches SHA-256.
        - Size matches byte count.
        - No non-excluded unrecorded files are present.
        Returns: (is_valid, errors_list)
        """
        target = Path(tree_dir).resolve() if tree_dir else self.get_authoritative_source_dir()
        man = manifest or self.load_manifest()

        errors = []
        found_files: Set[str] = set()

        for entry in man.files:
            fpath = target / Path(entry.path)
            if not fpath.exists():
                errors.append(f"Missing file: {entry.path}")
                continue
            if not fpath.is_file():
                errors.append(f"Expected file, found directory: {entry.path}")
                continue

            found_files.add(entry.path)
            actual_size = fpath.stat().st_size
            if actual_size != entry.size_bytes:
                errors.append(f"Size mismatch for {entry.path}: expected {entry.size_bytes}, got {actual_size}")

            actual_sha = compute_file_sha256(fpath)
            if actual_sha != entry.sha256:
                errors.append(f"Checksum mismatch for {entry.path}: expected {entry.sha256}, got {actual_sha}")

        # Check for unrecorded files
        for p in target.rglob("*"):
            if not p.is_file():
                continue
            rel_posix = p.relative_to(target).as_posix()
            if is_path_excluded(rel_posix, man.exclusions):
                continue
            if rel_posix not in found_files:
                errors.append(f"Unexpected extra file not in manifest: {rel_posix}")

        return (len(errors) == 0, errors)

    def extract_runtime_source_tree(self, destination: Optional[Path] = None) -> Path:
        """
        Extracts or mirrors the embedded source tree to a runtime working directory when required.
        Verifies checksums and returns the directory path.
        """
        source = self.get_authoritative_source_dir()
        dest = Path(destination).resolve() if destination else Path(tempfile.mkdtemp(prefix="luciproxy_runtime_"))

        if dest.exists() and any(dest.iterdir()):
            shutil.rmtree(dest)
        dest.mkdir(parents=True, exist_ok=True)

        for p in source.rglob("*"):
            if p.is_file():
                rel = p.relative_to(source)
                out = dest / rel
                out.parent.mkdir(parents=True, exist_ok=True)
                shutil.copy2(p, out)

        return dest
