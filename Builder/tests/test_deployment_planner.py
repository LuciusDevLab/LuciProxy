"""
Tests for ResourceDiscovery, DeploymentPlan, and ProjectBundler.
"""

from pathlib import Path
import tempfile
from unittest.mock import MagicMock

from src.resources.discovery import ResourceDiscovery, DeploymentPlan
from src.deployment.bundler import ProjectBundler
from src.cloudflare.client import CloudflareClient


def create_fake_luciproxy_dir(tmpdir: Path) -> Path:
    proj = tmpdir / "LuciProxy"
    (proj / "src" / "protocols").mkdir(parents=True)
    (proj / "src" / "db").mkdir(parents=True)

    (proj / "src" / "index.js").write_text("// entry", encoding="utf-8")
    (proj / "src" / "config.js").write_text("// config", encoding="utf-8")
    (proj / "src" / "protocols" / "proxy.js").write_text("// proxy", encoding="utf-8")
    (proj / "src" / "protocols" / "vless.js").write_text("// vless", encoding="utf-8")
    (proj / "src" / "protocols" / "trojan.js").write_text("// trojan", encoding="utf-8")
    (proj / "src" / "db" / "d1.js").write_text("// d1", encoding="utf-8")
    (proj / "package.json").write_text('{"name": "luciproxy"}', encoding="utf-8")
    return proj


def test_bundler_validation():
    with tempfile.TemporaryDirectory() as tmpdir:
        proj = create_fake_luciproxy_dir(Path(tmpdir))
        bundler = ProjectBundler(proj)

        # Should pass validation
        bundler.validate_source_integrity()

        # Generate config
        cfg = bundler.generate_wrangler_config("test-worker", "test-d1", "d1-uuid-999")
        assert cfg["name"] == "test-worker"
        assert cfg["d1_databases"][0]["binding"] == "IOT_DB"
        assert cfg["d1_databases"][0]["database_id"] == "d1-uuid-999"

        # Write config to disk
        out = bundler.write_runtime_config("test-worker", "test-d1", "d1-uuid-999")
        assert out.exists()


def test_bundler_validation_missing_files():
    import pytest
    with tempfile.TemporaryDirectory() as tmpdir:
        incomplete_proj = Path(tmpdir) / "BrokenProxy"
        incomplete_proj.mkdir()
        bundler = ProjectBundler(incomplete_proj)

        with pytest.raises(FileNotFoundError) as exc_info:
            bundler.validate_source_integrity()
        assert "Missing required files" in str(exc_info.value)



def test_plan_deployment_new_worker():
    with tempfile.TemporaryDirectory() as tmpdir:
        proj = create_fake_luciproxy_dir(Path(tmpdir))
        client = MagicMock(spec=CloudflareClient)

        client.get_user_details.return_value = {"email": "dev@test.user"}
        client.get_workers_subdomain.return_value = "devtest.workers.dev"
        client.get_worker.return_value = None  # Worker does not exist
        client.list_d1_databases.return_value = []  # D1 does not exist

        discovery = ResourceDiscovery(proj, client, "acc_test_123")
        plan = discovery.plan_deployment()

        assert plan.worker_exists is False
        assert plan.is_update is False
        assert plan.d1_needs_creation is True
        assert "Create D1 SQLite database" in plan.actions[0]
        assert plan.target_url == "https://luciproxy-gate.devtest.workers.dev"


def test_plan_deployment_existing_worker_update():
    with tempfile.TemporaryDirectory() as tmpdir:
        proj = create_fake_luciproxy_dir(Path(tmpdir))
        client = MagicMock(spec=CloudflareClient)

        client.get_user_details.return_value = {"email": "dev@test.user"}
        client.get_workers_subdomain.return_value = "devtest.workers.dev"
        client.get_worker.return_value = {"id": "luciproxy-gate"}  # Worker exists!
        client.list_d1_databases.return_value = [{"name": "luciproxy-db", "uuid": "existing-d1-uuid"}]

        discovery = ResourceDiscovery(proj, client, "acc_test_123")
        plan = discovery.plan_deployment(force_recreate=False)

        assert plan.worker_exists is True
        assert plan.is_update is True
        assert plan.d1_needs_creation is False
        assert plan.d1_id == "existing-d1-uuid"
        assert "Reuse existing D1 database" in plan.actions[0]
        assert "Update existing Worker" in plan.actions[1]
