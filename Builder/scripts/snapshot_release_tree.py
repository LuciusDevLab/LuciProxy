"""
LuciProxy Builder - Release Snapshot Creation Script
Recursively snapshots the sibling '../LuciProxy' directory into the Builder embedded assets payload
and generates the source_tree_manifest.json manifest with relative paths and SHA-256 checksums.
"""

from pathlib import Path
import sys

# Ensure Builder root is on sys.path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from src.deployment.source_tree import SourceTreeManager


def main():
    print("================================================================================")
    print("        LUCIPROXY BUILDER - RELEASE SOURCE TREE SNAPSHOT & MANIFEST BUILDER      ")
    print("================================================================================\n")

    mgr = SourceTreeManager()
    dev_dir = mgr.get_development_source_dir()

    if not dev_dir or not dev_dir.exists():
        print(f"[ERROR] Development source directory not found at: {dev_dir}")
        print("Please ensure '../LuciProxy' exists as a sibling directory to 'Builder'.")
        sys.exit(1)

    print(f"Authoritative Source Directory: {dev_dir}")
    print("Scanning and snapshotting entire repository tree...")

    manifest = mgr.create_snapshot()

    print(f"\n[OK] Successfully snapshotted {manifest.total_files} files ({manifest.total_bytes:,} bytes).")
    print(f"[OK] Composite Tree SHA-256: {manifest.tree_sha256}")
    print(f"[OK] Source manifest written to: {mgr.get_manifest_path()}")

    print("\nVerifying snapshot integrity...")
    valid, errors = mgr.verify_snapshot_integrity(
        tree_dir=mgr.get_embedded_payload_dir(),
        manifest=manifest
    )

    if not valid:
        print(f"[ERROR] Snapshot verification failed with {len(errors)} error(s):")
        for err in errors:
            print(f"  - {err}")
        sys.exit(1)

    print("[OK] Snapshot verified 100% authentic against source tree manifest.")
    print("================================================================================")


if __name__ == "__main__":
    main()
