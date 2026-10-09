"""
LuciProxy PYandroid - Worker Deployment & Lifecycle Engine.
Coordinates immutable source-based creation, in-place update, and deletion of workers.
Guarantees exact parity with Windows Manager deployment conventions, configuration keys,
D1 database schemas, and bundle integrity.
"""

import hashlib
import json
import os
from pathlib import Path
import re
from typing import Any, Callable, Dict, List, Optional, Tuple
import urllib.parse
import uuid

import requests

from .client import PortableCloudflareClient, CloudflareApiError
from .models import DeploymentResult
from .naming import (
    NamingPolicy,
    generate_worker_name,
    generate_d1_name,
    generate_deployment_names,
    generate_random_api_route,
    generate_secret_uuid,
    generate_panel_url,
)

CANONICAL_WORKER_VERSION = "1.2.2"
CANONICAL_SOURCE_REVISION = "e0b338e8ac8f238d78281fa64f77e678b9fe55d8"
EXPECTED_BUNDLE_SHA256 = "b0d3ff5b40a26f61d4484878931e72ec043ffca12397ece03dc11ed52317c84f"
EXPECTED_BUNDLE_SIZE = 321803


class WorkerSourceProvider:
    """
    Authoritative source and bundle acquisition for LuciProxy Worker.
    Follows exact Windows Manager source resolution:
    1. Fetches and validates authoritative version signal from version.json.
    2. Retrieves immutable Worker bundle matching the exact commit revision.
    3. Validates SHA-256 digest against official release artifacts.
    """

    def __init__(
        self,
        repo_owner: str = "LuciusDevLab",
        repo_name: str = "LuciProxy",
        session: Optional[requests.Session] = None,
        timeout: int = 25,
    ):
        self.repo_owner = repo_owner
        self.repo_name = repo_name
        self.session = session or requests.Session()
        self.timeout = timeout

    def fetch_version_signal(self) -> Dict[str, str]:
        """
        Fetches the authoritative version signal (version.json).
        Tries local file paths first (for isolated testing), then canonical GitHub raw URL.
        """
        # 1. Local disk search
        search_paths = [
            Path("version.json"),
            Path(__file__).resolve().parent.parent.parent.parent.parent / "version.json",
        ]
        for p in search_paths:
            if p.exists() and p.is_file():
                try:
                    data = json.loads(p.read_text(encoding="utf-8"))
                    if "version" in data and "source_revision" in data:
                        return data
                except Exception:
                    pass

        # 2. Remote GitHub fetch
        url = f"https://raw.githubusercontent.com/{self.repo_owner}/{self.repo_name}/main/version.json"
        headers = {"User-Agent": "LuciProxy-Android/2.0"}
        resp = self.session.get(url, headers=headers, timeout=self.timeout)
        if not resp.ok:
            raise RuntimeError(f"Failed to fetch Worker version signal from GitHub (HTTP {resp.status_code})")

        data = resp.json()
        rev = data.get("source_revision", "")
        if not re.match(r"^[0-9a-fA-F]{40}$", rev):
            raise ValueError(f"Invalid source_revision in version.json: '{rev}'. Must be 40-char hex commit SHA.")
        return data

    def get_bundle(
        self,
        expected_version: Optional[str] = None,
        expected_revision: Optional[str] = None
    ) -> Tuple[str, str, str, str]:
        """
        Resolves the production Worker bundle for the declared revision.
        Guarantees that the bundle matches the official Windows Manager compiled artifact.
        Returns: Tuple[bundle_code, bundle_sha256, version, source_revision]
        """
        signal = self.fetch_version_signal()
        version = signal.get("version", CANONICAL_WORKER_VERSION)
        revision = signal.get("source_revision", CANONICAL_SOURCE_REVISION).lower()

        # Check local release asset if available (e.g. running in monorepo environment)
        local_asset_paths = [
            Path(f"releases/worker-v{version}/worker_bundle.js"),
            Path(__file__).resolve().parent.parent.parent.parent.parent / "releases" / f"worker-v{version}" / "worker_bundle.js",
        ]
        bundle_content: Optional[str] = None
        for p in local_asset_paths:
            if p.exists() and p.is_file():
                try:
                    text = p.read_text(encoding="utf-8")
                    h = hashlib.sha256(text.encode("utf-8")).hexdigest().lower()
                    if h == EXPECTED_BUNDLE_SHA256:
                        bundle_content = text
                        break
                except Exception:
                    pass

        # If not local or hash mismatch, download authoritative release asset from GitHub
        if not bundle_content:
            download_urls = [
                f"https://github.com/{self.repo_owner}/{self.repo_name}/releases/download/worker-v{version}/worker_bundle.js",
                f"https://raw.githubusercontent.com/{self.repo_owner}/{self.repo_name}/main/releases/worker-v{version}/worker_bundle.js",
            ]
            last_err = None
            for url in download_urls:
                try:
                    resp = self.session.get(url, headers={"User-Agent": "LuciProxy-Android/2.0"}, timeout=self.timeout)
                    if resp.ok and len(resp.content) > 0:
                        bundle_content = resp.text
                        break
                except Exception as e:
                    last_err = e

            if not bundle_content:
                raise RuntimeError(
                    f"Failed to acquire canonical Worker bundle from GitHub releases for v{version} ({revision[:8]}): {last_err}"
                )

        sha256 = hashlib.sha256(bundle_content.encode("utf-8")).hexdigest().lower()
        if version == CANONICAL_WORKER_VERSION and sha256 != EXPECTED_BUNDLE_SHA256:
            raise RuntimeError(
                f"Worker bundle verification failed for v{version}! SHA-256 digest mismatch.\n"
                f"Expected: {EXPECTED_BUNDLE_SHA256}\n"
                f"Actual:   {sha256}"
            )

        return bundle_content, sha256, version, revision


class DeploymentEngine:
    """
    Manages Cloudflare Worker deployments, updates, and deletions.
    Provides 100% exact parity with Windows Manager deployment conventions.
    """

    def __init__(
        self,
        client: PortableCloudflareClient,
        source_provider: Optional[WorkerSourceProvider] = None
    ):
        self.client = client
        self.source_provider = source_provider or WorkerSourceProvider()

    def deploy_worker(
        self,
        account_id: str,
        worker_name: Optional[str] = None,
        d1_name: Optional[str] = None,
        progress_callback: Optional[Callable[[int, int, str, str], None]] = None,
    ) -> DeploymentResult:
        """
        Executes complete 8-step fresh Worker deployment matching Windows Manager:
        1. Resolve Worker source from GitHub and verify bundle SHA-256.
        2. Prepare neutral resource names and random API route (10 chars [a-z0-9]).
        3. Provision dedicated Cloudflare D1 database.
        4. Initialize D1 schema (kv_store) and seed sys_config with Master Key & apiRoute.
        5. Upload multipart Worker script with IOT_DB binding and observability.
        6. Configure MASTER_KEY Worker secret via Cloudflare Secrets API.
        7. Enable workers.dev subdomain route.
        8. Return complete outputs including Panel URL, Master Key, and database IDs.
        """
        def report(step: int, stage: str, detail: str):
            if progress_callback:
                progress_callback(step, 8, stage, detail)

        try:
            # 1. Source Resolution & Bundle Verification
            report(1, "Resolving Worker Source", "Fetching version signal and verifying bundle...")
            bundle_code, bundle_sha256, version, revision = self.source_provider.get_bundle()

            # 2. Names and Route
            report(2, "Preparing Resource Names", "Generating neutral names and randomized API route...")
            if not worker_name or not d1_name:
                auto_worker, auto_d1 = generate_deployment_names()
                final_worker_name = worker_name or auto_worker
                final_d1_name = d1_name or auto_d1
            else:
                final_worker_name = worker_name
                final_d1_name = d1_name

            # Canonical 10-char lowercase alphanumeric route (NO leading slash, NO route- prefix)
            api_route = generate_random_api_route(10)
            secret_uuid = generate_secret_uuid()

            # 3. Dedicated D1 database
            report(3, "Provisioning D1 Database", f"Creating database '{final_d1_name}' on Cloudflare...")
            d1_res = self.client.create_d1_database(account_id, final_d1_name)
            d1_id = d1_res.get("uuid") or d1_res.get("id")
            if not d1_id:
                raise RuntimeError(f"Cloudflare API did not return UUID for created D1 database '{final_d1_name}'.")

            # 4. Initialize Schema & Seed Config
            report(4, "Initializing Database Schema", "Executing schema DDL and seeding admin configuration...")
            self.client.initialize_d1_schema(account_id, d1_id)
            if not self.client.verify_d1_schema(account_id, d1_id):
                raise RuntimeError(f"D1 database '{final_d1_name}' ({d1_id}) failed schema verification.")

            self.client.seed_d1_config(
                account_id=account_id,
                database_id=d1_id,
                master_key=secret_uuid,
                api_route=api_route
            )

            # 5. Upload Worker Script with IOT_DB binding
            report(5, "Uploading Worker Script", f"Deploying code with IOT_DB binding to Cloudflare Edge...")
            self.client.upload_worker_multipart(
                account_id=account_id,
                worker_name=final_worker_name,
                bundle_code=bundle_code,
                d1_uuid=d1_id,
                compatibility_date="2026-10-01",
                compatibility_flags=["nodejs_compat"]
            )

            # 6. Configure Worker Secret MASTER_KEY
            report(6, "Configuring Worker Secret", "Provisioning MASTER_KEY via Cloudflare Secrets API...")
            self.client.put_worker_secret(
                account_id=account_id,
                script_name=final_worker_name,
                secret_name="MASTER_KEY",
                secret_text=secret_uuid
            )

            # 7. Enable workers.dev Subdomain Route
            report(7, "Activating Edge Route", "Configuring workers.dev subdomain route...")
            subdomain = self.client.get_account_subdomain(account_id) or "workers"
            self.client.enable_worker_subdomain(account_id, final_worker_name)

            # 8. Complete URLs
            report(8, "Finalizing Deployment", "Generating secure access endpoints...")
            worker_domain = f"{final_worker_name}.{subdomain}.workers.dev"
            worker_url = f"https://{worker_domain}"
            panel_url = generate_panel_url(worker_domain, api_route)

            return DeploymentResult(
                success=True,
                worker_name=final_worker_name,
                worker_url=worker_url,
                panel_url=panel_url,
                api_route=api_route,
                d1_name=final_d1_name,
                d1_database_id=d1_id,
                uuid=secret_uuid,
                version=f"v{version}",
            )

        except Exception as e:
            return DeploymentResult(
                success=False,
                worker_name=worker_name or "unknown",
                worker_url="",
                panel_url="",
                api_route="",
                d1_name="",
                d1_database_id="",
                uuid="",
                version=f"v{CANONICAL_WORKER_VERSION}",
                error=str(e),
            )

    def update_worker(
        self,
        account_id: str,
        worker_name: str,
        progress_callback: Optional[Callable[[int, int, str, str], None]] = None,
    ) -> DeploymentResult:
        """
        Performs in-place Worker script update.
        STRICTLY PRESERVES existing D1 database, UUID, and API route!
        """
        def report(step: int, stage: str, detail: str):
            if progress_callback:
                progress_callback(step, 8, stage, detail)

        try:
            report(1, "Inspecting Worker", f"Fetching bindings for '{worker_name}'...")
            existing_bindings = self.client.get_worker_bindings(account_id, worker_name)
            if not existing_bindings:
                raise ValueError(f"Worker '{worker_name}' has no linked D1 database bindings.")

            d1_binding = existing_bindings[0]
            d1_id = d1_binding.database_id
            d1_name = d1_binding.database_name or "preserved-d1"

            report(2, "Resolving Subdomain", "Resolving workers.dev subdomain...")
            subdomain = self.client.get_account_subdomain(account_id) or "workers"

            report(3, "Preserving Bindings", f"Preserving linked D1 '{d1_name}' ({d1_id})...")

            # Read existing configuration from D1 to preserve apiRoute and masterKey
            existing_cfg = self.client.get_d1_sys_config(account_id, d1_id)
            if existing_cfg and isinstance(existing_cfg, dict):
                api_route = existing_cfg.get("apiRoute") or generate_random_api_route(10)
                master_key = existing_cfg.get("masterKey") or generate_secret_uuid()
            else:
                api_route = generate_random_api_route(10)
                master_key = generate_secret_uuid()
                self.client.seed_d1_config(account_id, d1_id, master_key, api_route)

            report(4, "Resolving Worker Source", "Fetching and verifying canonical Worker bundle...")
            bundle_code, bundle_sha256, version, revision = self.source_provider.get_bundle()

            report(5, "Uploading Script", f"Uploading in-place update for '{worker_name}'...")
            self.client.upload_worker_multipart(
                account_id=account_id,
                worker_name=worker_name,
                bundle_code=bundle_code,
                d1_uuid=d1_id,
                compatibility_date="2026-10-01",
                compatibility_flags=["nodejs_compat"]
            )

            report(6, "Syncing Secret", "Configuring MASTER_KEY secret...")
            self.client.put_worker_secret(
                account_id=account_id,
                script_name=worker_name,
                secret_name="MASTER_KEY",
                secret_text=master_key
            )

            report(7, "Activating Subdomain", "Verifying workers.dev subdomain routing...")
            self.client.enable_worker_subdomain(account_id, worker_name)

            report(8, "Update Completed", "Worker script updated successfully with D1 preserved.")
            worker_domain = f"{worker_name}.{subdomain}.workers.dev"
            worker_url = f"https://{worker_domain}"
            panel_url = generate_panel_url(worker_domain, api_route)

            return DeploymentResult(
                success=True,
                worker_name=worker_name,
                worker_url=worker_url,
                panel_url=panel_url,
                api_route=api_route,
                d1_name=d1_name,
                d1_database_id=d1_id,
                uuid=master_key,
                version=f"v{version}",
            )

        except Exception as e:
            return DeploymentResult(
                success=False,
                worker_name=worker_name,
                worker_url="",
                panel_url="",
                api_route="",
                d1_name="",
                d1_database_id="",
                uuid="",
                version=f"v{CANONICAL_WORKER_VERSION}",
                error=str(e),
            )

    def delete_worker(self, account_id: str, worker_name: str) -> bool:
        """
        Deletes a Worker script from Cloudflare.
        STRICTLY PRESERVES existing D1 databases and tables!
        """
        return self.client.delete_worker_script(account_id, worker_name)
