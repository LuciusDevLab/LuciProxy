"""
Tests for Embedded Artifact Manager, manifest parsing, SHA-256 validation, and multipart payload.
"""

import hashlib
import json
from pathlib import Path
import tempfile
import pytest

from src.deployment.artifact import EmbeddedArtifactManager, ArtifactManifest


def test_load_manifest_production():
    """Verify that the embedded production manifest is valid and parseable."""
    mgr = EmbeddedArtifactManager()
    manifest = mgr.load_manifest()

    assert manifest.luciproxy_version == "1.1.0"
    assert manifest.git_commit == "5b32a2b7d6656f393a047cd3b2a65441021cadad"
    assert len(manifest.artifact_sha256) == 64
    assert manifest.artifact_sha256 == hashlib.sha256(mgr.bundle_file.read_text(encoding="utf-8").encode("utf-8")).hexdigest().lower()
    assert manifest.d1_binding_name == "IOT_DB"
    assert manifest.main_module == "index.js"
    assert "nodejs_compat" in manifest.compatibility_flags


def test_load_manifest_missing_file():
    """Verify FileNotFoundError when manifest does not exist."""
    with tempfile.TemporaryDirectory() as tmpdir:
        mgr = EmbeddedArtifactManager(assets_dir=Path(tmpdir))
        with pytest.raises(FileNotFoundError):
            mgr.load_manifest()


def test_load_manifest_malformed_json():
    """Verify ValueError when manifest is invalid JSON."""
    with tempfile.TemporaryDirectory() as tmpdir:
        tmp_path = Path(tmpdir)
        (tmp_path / "manifest.json").write_text("{bad-json", encoding="utf-8")
        mgr = EmbeddedArtifactManager(assets_dir=tmp_path)
        with pytest.raises(ValueError, match="Malformed embedded manifest JSON"):
            mgr.load_manifest()


def test_load_manifest_missing_required_keys():
    """Verify ValueError when manifest is missing required keys."""
    with tempfile.TemporaryDirectory() as tmpdir:
        tmp_path = Path(tmpdir)
        (tmp_path / "manifest.json").write_text(json.dumps({"version": "1.0.0"}), encoding="utf-8")
        mgr = EmbeddedArtifactManager(assets_dir=tmp_path)
        with pytest.raises(ValueError, match="Manifest missing required key"):
            mgr.load_manifest()


def test_load_and_verify_bundle_production():
    """Verify that the production bundle matches the signed SHA-256 hash in the manifest."""
    mgr = EmbeddedArtifactManager()
    code, manifest = mgr.load_and_verify_bundle()

    assert isinstance(code, str)
    assert len(code) > 100000  # Production bundle is ~195 KiB
    assert manifest.artifact_sha256 == hashlib.sha256(code.encode("utf-8")).hexdigest().lower()


def test_load_and_verify_bundle_tampered():
    """Verify that any modification to the bundle content triggers a checksum mismatch error."""
    with tempfile.TemporaryDirectory() as tmpdir:
        tmp_path = Path(tmpdir)
        # Create manifest with an arbitrary expected SHA-256
        manifest_data = {
            "luciproxy_version": "1.0.0",
            "git_commit": "abc1234",
            "artifact_sha256": "0000000000000000000000000000000000000000000000000000000000000000",
            "builder_version": "1.0.0",
            "build_timestamp": "2026-10-03T18:00:00Z",
            "compatibility_date": "2026-10-01",
            "compatibility_flags": ["nodejs_compat"],
            "main_module": "index.js",
            "d1_binding_name": "IOT_DB"
        }
        (tmp_path / "manifest.json").write_text(json.dumps(manifest_data), encoding="utf-8")
        (tmp_path / "worker_bundle.js").write_text("// Tampered malicious code", encoding="utf-8")

        mgr = EmbeddedArtifactManager(assets_dir=tmp_path)
        with pytest.raises(ValueError, match="Embedded Worker bundle checksum mismatch"):
            mgr.load_and_verify_bundle()


def test_prepare_multipart_payload():
    """Verify multipart payload preparation and dynamic D1 UUID binding."""
    mgr = EmbeddedArtifactManager()
    worker_name = "amber-finch-4827"
    d1_uuid = "11112222-3333-4444-5555-666677778888"

    metadata, files = mgr.prepare_multipart_payload(worker_name, d1_uuid)

    assert metadata["main_module"] == "index.js"
    assert metadata["compatibility_date"] == "2026-10-01"
    assert "nodejs_compat" in metadata["compatibility_flags"]
    assert len(metadata["bindings"]) == 1
    binding = metadata["bindings"][0]
    assert binding["type"] == "d1"
    assert binding["name"] == "IOT_DB"
    assert binding["id"] == d1_uuid

    assert "metadata" in files
    meta_name, meta_content, meta_type = files["metadata"]
    assert meta_name is None
    assert meta_type == "application/json"
    parsed_meta = json.loads(meta_content)
    assert parsed_meta["bindings"][0]["id"] == d1_uuid

    assert "index.js" in files
    script_name, script_content, script_type = files["index.js"]
    assert script_name == "index.js"
    assert script_type == "application/javascript+module"
    assert len(script_content) > 100000


def test_prepare_multipart_payload_never_emits_plaintext_master_key():
    """Verify that MASTER_KEY is NEVER emitted as a plain_text binding or inside metadata JSON."""
    mgr = EmbeddedArtifactManager()
    worker_name = "amber-finch-4827"
    d1_uuid = "11112222-3333-4444-5555-666677778888"
    secret_key = "0123456789abcdef01234567"

    metadata, files = mgr.prepare_multipart_payload(worker_name, d1_uuid, master_key=secret_key)

    # 1. Plaintext MASTER_KEY must not exist in bindings
    for binding in metadata.get("bindings", []):
        assert binding.get("name") != "MASTER_KEY", "MASTER_KEY must not be in metadata bindings"
        assert binding.get("type") != "plain_text", "plain_text binding type must not be used"

    # 2. Bindings should only contain non-secret resources (e.g. D1)
    assert len(metadata["bindings"]) == 1
    assert metadata["bindings"][0]["type"] == "d1"
    assert metadata["bindings"][0]["id"] == d1_uuid

    # 3. Serialized metadata JSON must not contain secret text or plain_text
    meta_name, meta_json, meta_type = files["metadata"]
    assert secret_key not in meta_json, "Raw secret string found inside metadata JSON payload!"
    assert "plain_text" not in meta_json, "plain_text binding found inside metadata JSON payload!"
