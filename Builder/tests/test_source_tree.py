"""
Tests for LuciProxy Source Tree Snapshotter, Embedded Manager, Manifests, and Dual-Mode Resolution.
"""

import json
from pathlib import Path
import sys
import tempfile
from unittest.mock import patch
import pytest

from src.deployment.source_tree import (
    DEFAULT_EXCLUSION_PATTERNS,
    SourceFileEntry,
    SourceTreeManifest,
    SourceTreeManager,
    compute_file_sha256,
    is_path_excluded,
)


def test_is_path_excluded():
    """Verify that only explicitly banned cache/VCS/transient files are excluded."""
    # Banned files / directories
    assert is_path_excluded(".wrangler")
    assert is_path_excluded(".wrangler/tmp/bundle.js")
    assert is_path_excluded("subdir/.wrangler/cache")
    assert is_path_excluded("node_modules/foo/package.json")
    assert is_path_excluded(".git/HEAD")
    assert is_path_excluded("__pycache__/foo.pyc")
    assert is_path_excluded("file.pyc")
    assert is_path_excluded(".DS_Store")
    assert is_path_excluded("Thumbs.db")
    assert is_path_excluded("desktop.ini")
    assert is_path_excluded("temp.tmp")

    # Allowed production files
    assert not is_path_excluded("src/index.js")
    assert not is_path_excluded("src/config.js")
    assert not is_path_excluded("src/api/sync.js")
    assert not is_path_excluded("dist/index.js")
    assert not is_path_excluded("dist/index.js.map")
    assert not is_path_excluded("package.json")
    assert not is_path_excluded("wrangler.json")
    assert not is_path_excluded("tests/protocols.test.js")
    assert not is_path_excluded("public/favicon.ico")
    assert not is_path_excluded("docs/README.md")


def test_development_mode_resolves_sibling_luciproxy():
    """Verify that in development mode, the sibling folder '../LuciProxy' is authoritative."""
    mgr = SourceTreeManager()
    with patch.object(sys, "frozen", False, create=True):
        dev_dir = mgr.get_development_source_dir()
        assert dev_dir is not None
        assert dev_dir.exists()
        assert (dev_dir / "package.json").exists()
        assert (dev_dir / "src" / "index.js").exists()

        auth_dir = mgr.get_authoritative_source_dir()
        assert auth_dir == dev_dir


def test_packaged_mode_strictly_uses_embedded_payload():
    """
    Verify that in packaged (frozen) mode:
    1. It uses sys._MEIPASS embedded payload.
    2. It strictly MUST NOT access or fallback to sibling '../LuciProxy'.
    3. It raises FileNotFoundError if the embedded payload is missing.
    """
    with tempfile.TemporaryDirectory() as tmp_meipass:
        meipass = Path(tmp_meipass)
        embedded_tree = meipass / "assets" / "luciproxy_payload" / "LuciProxy"
        embedded_tree.mkdir(parents=True)
        (embedded_tree / "package.json").write_text('{"name": "embedded-luciproxy"}', encoding="utf-8")
        (embedded_tree / "src").mkdir()
        (embedded_tree / "src" / "index.js").write_text("// embedded worker", encoding="utf-8")

        with patch.object(sys, "frozen", True, create=True), \
             patch.object(sys, "_MEIPASS", str(meipass), create=True):
            mgr = SourceTreeManager()
            assert mgr.is_packaged is True

            auth_dir = mgr.get_authoritative_source_dir()
            assert auth_dir == embedded_tree
            assert (auth_dir / "src" / "index.js").read_text(encoding="utf-8") == "// embedded worker"


def test_packaged_mode_fails_if_embedded_payload_missing():
    """Verify that packaged mode fails fast if the embedded payload is missing in the binary."""
    with tempfile.TemporaryDirectory() as tmp_empty_meipass:
        with patch.object(sys, "frozen", True, create=True), \
             patch.object(sys, "_MEIPASS", tmp_empty_meipass, create=True):
            mgr = SourceTreeManager()
            assert mgr.is_packaged is True

            with pytest.raises(FileNotFoundError, match="Embedded LuciProxy payload directory was not found"):
                mgr.get_authoritative_source_dir()


def test_create_snapshot_and_manifest():
    """Verify recursive snapshotting, tree preservation, and manifest generation."""
    with tempfile.TemporaryDirectory() as tmp_src, \
         tempfile.TemporaryDirectory() as tmp_dest, \
         tempfile.TemporaryDirectory() as tmp_man:

        src = Path(tmp_src)
        dest = Path(tmp_dest)
        man_file = Path(tmp_man) / "manifest.json"

        # Create mock source repository
        (src / "package.json").write_text('{"name": "test"}', encoding="utf-8")
        (src / "src").mkdir()
        (src / "src" / "index.js").write_text("console.log('hi');", encoding="utf-8")
        (src / "tests").mkdir()
        (src / "tests" / "unit.test.js").write_text("test();", encoding="utf-8")
        # Add an excluded directory
        (src / ".wrangler").mkdir()
        (src / ".wrangler" / "cache.json").write_text("cache", encoding="utf-8")

        mgr = SourceTreeManager(dev_source_dir=src)
        manifest = mgr.create_snapshot(
            source_dir=src,
            target_payload_dir=dest,
            manifest_output_path=man_file,
            version="1.2.3"
        )

        assert manifest.luciproxy_version == "1.2.3"
        assert manifest.total_files == 3  # package.json, src/index.js, tests/unit.test.js
        assert len(manifest.tree_sha256) == 64

        # Verify destination files
        assert (dest / "package.json").exists()
        assert (dest / "src" / "index.js").exists()
        assert (dest / "tests" / "unit.test.js").exists()
        assert not (dest / ".wrangler").exists()  # Excluded

        # Verify manifest JSON on disk
        saved = SourceTreeManifest.from_dict(json.loads(man_file.read_text(encoding="utf-8")))
        assert saved.total_files == 3
        assert saved.tree_sha256 == manifest.tree_sha256


def test_verify_snapshot_integrity():
    """Verify integrity check succeeds on matching tree and fails on tampering."""
    with tempfile.TemporaryDirectory() as tmp_src, \
         tempfile.TemporaryDirectory() as tmp_dest, \
         tempfile.TemporaryDirectory() as tmp_man:

        src = Path(tmp_src)
        dest = Path(tmp_dest)
        man_file = Path(tmp_man) / "manifest.json"

        (src / "package.json").write_text('{"name": "test"}', encoding="utf-8")
        (src / "src").mkdir()
        (src / "src" / "index.js").write_text("console.log('hello');", encoding="utf-8")

        mgr = SourceTreeManager(dev_source_dir=src)
        manifest = mgr.create_snapshot(
            source_dir=src,
            target_payload_dir=dest,
            manifest_output_path=man_file
        )

        # 1. Unmodified should pass
        valid, errors = mgr.verify_snapshot_integrity(tree_dir=dest, manifest=manifest)
        assert valid is True
        assert len(errors) == 0

        # 2. Tampered file should fail
        (dest / "src" / "index.js").write_text("MALICIOUS CONTENT", encoding="utf-8")
        valid, errors = mgr.verify_snapshot_integrity(tree_dir=dest, manifest=manifest)
        assert valid is False
        assert any("Checksum mismatch" in e for e in errors)

        # 3. Missing file should fail
        (dest / "src" / "index.js").unlink()
        valid, errors = mgr.verify_snapshot_integrity(tree_dir=dest, manifest=manifest)
        assert valid is False
        assert any("Missing file" in e for e in errors)

        # 4. Extra untracked file should fail
        (dest / "src" / "index.js").write_text("console.log('hello');", encoding="utf-8")
        (dest / "unexpected.js").write_text("rogue", encoding="utf-8")
        valid, errors = mgr.verify_snapshot_integrity(tree_dir=dest, manifest=manifest)
        assert valid is False
        assert any("Unexpected extra file" in e for e in errors)


def test_extract_runtime_source_tree():
    """Verify runtime extraction creates a valid temporary mirror of the source tree."""
    mgr = SourceTreeManager()
    with tempfile.TemporaryDirectory() as tmp_extract:
        dest = Path(tmp_extract) / "runtime"
        extracted = mgr.extract_runtime_source_tree(destination=dest)

        assert extracted.exists()
        assert (extracted / "package.json").exists()
        assert (extracted / "src" / "index.js").exists()
        assert (extracted / "dist" / "index.js").exists()
        assert (extracted / "tests").exists()


def test_production_embedded_snapshot_matches_manifest():
    """Verify that the actual embedded repository snapshot matches the generated source_tree_manifest.json."""
    mgr = SourceTreeManager()
    embedded_dir = mgr.get_embedded_payload_dir()
    manifest_path = mgr.get_manifest_path()

    assert embedded_dir is not None, "Embedded payload directory must exist"
    assert manifest_path is not None, "Source tree manifest must exist"

    manifest = mgr.load_manifest()
    valid, errors = mgr.verify_snapshot_integrity(tree_dir=embedded_dir, manifest=manifest)

    assert valid is True, f"Embedded payload failed integrity check: {errors}"
    assert manifest.total_files == len(manifest.files)
    assert manifest.total_files >= 39
