"""
Tests for BuilderCLI and dry-run simulation.
"""

from pathlib import Path
import tempfile
from unittest.mock import MagicMock, patch

from src.main import BuilderCLI
from src.cloudflare.client import CloudflareClient


def create_mock_project(tmpdir: Path) -> Path:
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


def test_cli_dry_run_execution():
    with tempfile.TemporaryDirectory() as tmpdir:
        tmp_path = Path(tmpdir)
        store_dir = tmp_path / "store"

        cli = BuilderCLI(store_dir=store_dir)

        # Pre-seed an account
        cli.account_store.save_account(
            account_id="acc_dry_run_123",
            name="Test Account",
            email="test@user.com",
            token="secret_token_123",
            subdomain="test.workers.dev"
        )

        with patch("src.main.CloudflareClient") as MockClient:
            mock_inst = MockClient.return_value
            mock_inst.get_user_details.return_value = {"email": "test@user.com"}
            mock_inst.get_workers_subdomain.return_value = "test.workers.dev"
            mock_inst.get_worker.return_value = None
            mock_inst.list_d1_databases.return_value = []

            # Execute with dry_run=True, auto_confirm=True
            res = cli.action_deploy(dry_run=True, auto_confirm=True)

            assert res is not None
            assert res["success"] is True
            assert res["dry_run"] is True
            assert res["worker_name"] is not None
            assert res["target_url"] == f"https://{res['worker_name']}.workers.dev"
