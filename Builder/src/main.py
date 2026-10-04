"""
LuciProxy Builder - Main CLI Application Entry Point
Interactive wizard and automated deployment automation tool for LuciProxy.
Pure Cloudflare REST API native: zero external runtime dependencies.
"""

import argparse
from datetime import datetime
from pathlib import Path
from typing import Optional

from .auth.token_validator import (
    build_token_creation_url,
    get_permission_checklist,
    verify_and_discover_accounts,
    run_capability_preflight,
    validate_and_discover_account
)
from .cloudflare.client import CloudflareClient
from .cloudflare.exceptions import CloudflareError, AuthenticationError
from .deployment.deployer import Deployer
from .storage.account_store import AccountStore
from .storage.history import DeploymentHistoryStore
from .utils import console


class BuilderCLI:
    """Manages CLI menus, interactive workflows, and arguments."""

    def __init__(self, store_dir: Optional[Path] = None):
        self.account_store = AccountStore(config_dir=store_dir)
        self.history_store = DeploymentHistoryStore(config_dir=store_dir)

    def interactive_menu(self) -> None:
        """Main interactive loop."""
        console.banner()

        while True:
            active_acc = self.account_store.get_active_account()
            active_str = f"{active_acc['email']} ({active_acc['id'][:8]}...)" if active_acc else "None"

            print(f"Active Account: {console.BOLD}{active_str}{console.RESET}\n")
            print("  1. Select Cloudflare Account")
            print("  2. Add Cloudflare Account")
            print("  3. Deploy LuciProxy (Fresh Deployment)")
            print("  4. View Deployment History")
            print("  5. Remove Saved Account")
            print("  6. Exit\n")

            try:
                choice = input("Enter choice [1-6]: ").strip()
            except (KeyboardInterrupt, EOFError):
                print("\nExiting.")
                break

            if choice == "1":
                self.action_select_account()
            elif choice == "2":
                self.action_add_account()
            elif choice == "3":
                self.action_deploy(dry_run=False)
            elif choice == "4":
                self.action_view_history()
            elif choice == "5":
                self.action_remove_account()
            elif choice in ("6", "q", "exit"):
                console.info("Goodbye.")
                break
            else:
                console.warn("Invalid choice, please select 1-6.")

            print()

    def action_add_account(self) -> Optional[dict]:
        """Guides the user through creating, validating, and saving an API token."""
        print()
        console.info("To deploy LuciProxy, you need a Cloudflare API Token.")
        url = build_token_creation_url()
        print(f"\n1. Open Cloudflare API Tokens in your browser:\n   {console.CYAN}{url}{console.RESET}\n")
        print(get_permission_checklist())
        print("\n2. Click 'Create Token', choose 'Create Custom Token', follow the checklist, and copy the token.")

        token = input("\nEnter Cloudflare API Token: ").strip()
        if not token:
            console.warn("Operation cancelled.")
            return None

        console.step(1, 3, "Verifying API Token & discovering accounts")
        try:
            user_info, accounts, client = verify_and_discover_accounts(token)
            console.step_ok("VERIFIED")
        except AuthenticationError as e:
            console.step_fail("INVALID")
            console.error(e.format_actionable())
            return None
        except Exception as e:
            console.step_fail("ERROR")
            console.error(str(e))
            return None

        # Account Selection (Auto-select if single account, prompt if multiple)
        if len(accounts) == 1:
            chosen_account = accounts[0]
            console.info(f"Using account: {chosen_account.get('name', 'Account')} ({chosen_account['id'][:8]}...)")
        else:
            print(f"\nFound {len(accounts)} accessible Cloudflare Accounts:")
            for idx, acc in enumerate(accounts, 1):
                print(f"  {idx}. {acc.get('name', 'Account')} (ID: {acc['id']})")
            choice = input(f"\nSelect target account [1-{len(accounts)}]: ").strip()
            try:
                idx = int(choice) - 1
                if 0 <= idx < len(accounts):
                    chosen_account = accounts[idx]
                else:
                    console.warn("Invalid selection, defaulting to primary account.")
                    chosen_account = accounts[0]
            except ValueError:
                console.warn("Invalid input, defaulting to primary account.")
                chosen_account = accounts[0]

        account_id = chosen_account["id"]
        account_name = chosen_account.get("name", f"Account-{account_id[:8]}")

        console.step(2, 3, f"Running capability preflight for '{account_name}'")
        try:
            report = run_capability_preflight(client, account_id)
            if not report.all_passed:
                console.step_fail("PREFLIGHT FAILED")
                console.error(report.summary())
                return None
            console.step_ok("CAPABILITIES CONFIRMED")
        except Exception as e:
            console.step_fail("PREFLIGHT ERROR")
            console.error(str(e))
            return None

        console.step(3, 3, f"Saving account {user_info['email']}")
        saved = self.account_store.save_account(
            account_id=account_id,
            name=account_name,
            email=user_info["email"],
            token=token,
            subdomain=report.subdomain
        )
        console.step_ok("SAVED")

        if self.account_store.is_keyring_available():
            console.success(f"Account '{user_info['email']}' saved securely in OS Keyring and set as active.")
        else:
            console.warn("OS Keyring unavailable. Token held in volatile in-memory session only (will expire on exit).")

        return saved

    def action_select_account(self) -> None:
        """Allows switching between registered Cloudflare accounts."""
        accounts = self.account_store.list_accounts()
        if not accounts:
            console.warn("No saved accounts found. Please add an account first.")
            return

        print("\nSaved Cloudflare Accounts:")
        for idx, acc in enumerate(accounts, 1):
            mark = f" {console.GREEN}[active]{console.RESET}" if acc.get("is_active") else ""
            print(f"  {idx}. {acc['email']} (ID: {acc['id'][:8]}...){mark}")

        choice = input(f"\nSelect account [1-{len(accounts)}] or 0 to cancel: ").strip()
        if not choice or choice == "0":
            return

        try:
            idx = int(choice) - 1
            if 0 <= idx < len(accounts):
                self.account_store.set_active_account(accounts[idx]["id"])
                console.success(f"Switched active account to {accounts[idx]['email']}.")
            else:
                console.warn("Invalid selection.")
        except ValueError:
            console.warn("Please enter a valid number.")

    def action_remove_account(self) -> None:
        """Deletes a saved account and its stored credential."""
        accounts = self.account_store.list_accounts()
        if not accounts:
            console.warn("No accounts to remove.")
            return

        print("\nSelect Account to Remove:")
        for idx, acc in enumerate(accounts, 1):
            print(f"  {idx}. {acc['email']} (ID: {acc['id'][:8]}...)")

        choice = input(f"\nEnter number [1-{len(accounts)}] or 0 to cancel: ").strip()
        if not choice or choice == "0":
            return

        try:
            idx = int(choice) - 1
            if 0 <= idx < len(accounts):
                acc_id = accounts[idx]["id"]
                confirm = input(f"Are you sure you want to remove {accounts[idx]['email']}? [y/N]: ").strip().lower()
                if confirm == "y":
                    self.account_store.remove_account(acc_id)
                    console.success(f"Removed account {accounts[idx]['email']}.")
                else:
                    console.info("Removal cancelled.")
        except ValueError:
            console.warn("Invalid input.")

    def action_view_history(self) -> None:
        """Displays saved deployment history."""
        records = self.history_store.list_records()
        if not records:
            console.info("No deployment records found.")
            return

        print(f"\n{console.BOLD}Deployment History ({len(records)} total):{console.RESET}")
        for idx, rec in enumerate(records, 1):
            print(f"\n  [{idx}] Deployment: {rec.deployment_id}")
            print(f"      Timestamp:     {rec.timestamp}")
            print(f"      Worker Name:   {rec.worker_name}")
            print(f"      D1 Database:   {rec.d1_name} ({rec.d1_uuid[:8]}...)")
            print(f"      Panel URL:     {console.CYAN}{rec.panel_url}{console.RESET}")
            print(f"      LuciProxy Ver: v{rec.luciproxy_version} ({rec.artifact_sha256[:8]}...)")

    def action_deploy(
        self,
        dry_run: bool = False,
        auto_confirm: bool = False
    ) -> Optional[dict]:
        """Executes a fresh API-native deployment with random resource names."""
        acc = self.account_store.get_active_account()
        if not acc:
            console.warn("No active Cloudflare account. Please add or select an account first.")
            acc = self.action_add_account()
            if not acc:
                return None

        token = self.account_store.get_token_for_account(acc["id"])
        if not token:
            console.error("Could not retrieve token from secure store. Please re-add account.")
            return None

        client = CloudflareClient(token)

        print(f"\n{console.BOLD}Starting Fresh LuciProxy Deployment...{console.RESET}")
        print(f"Target Account: {acc.get('name', 'Account')} ({acc['email']})")

        if not dry_run and not auto_confirm:
            confirm = input("Deploy new Worker and D1 database? [Y/n]: ").strip().lower()
            if confirm in ("n", "no"):
                console.info("Deployment aborted by user.")
                return None

        deployer = Deployer(
            client=client,
            account_id=acc["id"],
            account_name=acc.get("name", "Account"),
            history_store=self.history_store
        )

        try:
            res = deployer.execute_deployment(dry_run=dry_run)
        except CloudflareError as e:
            console.error(e.format_actionable())
            return None
        except Exception as e:
            console.error(f"Unexpected error during deployment: {e}")
            return None

        if res.get("success") and not dry_run:
            print(f"\n{console.GREEN}{console.BOLD}===================================================={console.RESET}")
            print(f"{console.GREEN}{console.BOLD}        LUCIProxy Successfully Deployed!            {console.RESET}")
            print(f"{console.GREEN}{console.BOLD}===================================================={console.RESET}")
            print(f"Deployment ID:        {res.get('deployment_id', 'N/A')}")
            print(f"Deployment Time:      {datetime.utcnow().isoformat()}Z")
            print(f"Worker Script:        {res['worker_name']}")
            print(f"D1 Database:          {res['d1_name']} ({res['d1_uuid'][:8]}...)")
            print(f"Embedded Version:     v{res['version']}")
            print(f"Artifact SHA-256:     {res['artifact_sha256']}")
            print(f"\nPanel URL:            {console.CYAN}{console.BOLD}{res['panel_url']}{console.RESET}")
            print(f"Subscription URL:     {console.CYAN}{res['sub_url']}{console.RESET}")
            print(f"\n{console.BOLD}>>> Copy Panel URL:   {console.CYAN}{res['panel_url']}{console.RESET}\n")

        return res


def main() -> None:
    """Argument parser and entry point (defaults to PySide6 GUI)."""
    import sys
    parser = argparse.ArgumentParser(description="LuciProxy Builder - Cloudflare Edge Deployment Automation")
    parser.add_argument("--gui", action="store_true", help="Launch Graphical User Interface (default)")
    parser.add_argument("--cli", action="store_true", help="Launch interactive CLI menu instead of Graphical UI")
    parser.add_argument("--dry-run", action="store_true", help="Simulate deployment without modifying Cloudflare resources")
    parser.add_argument("--deploy", action="store_true", help="Run deployment non-interactively using active account")
    parser.add_argument("-y", "--yes", action="store_true", help="Automatically proceed without confirmation prompt")
    parser.add_argument("--history", action="store_true", help="Display local deployment history")
    parser.add_argument("--smoke-test", action="store_true", help="Run automated self-contained smoke verification test")

    args = parser.parse_args()

    if args.smoke_test:
        from .validation.smoke_test import run_smoke_test
        import os
        os._exit(run_smoke_test())

    cli = BuilderCLI()

    if args.history:
        cli.action_view_history()
    elif args.dry_run or args.deploy:
        cli.action_deploy(
            dry_run=args.dry_run,
            auto_confirm=args.yes
        )
    elif args.cli:
        cli.interactive_menu()
    else:
        # Default: Launch PySide6 Graphical Builder
        try:
            from .gui.app import launch_gui
            sys.exit(launch_gui())
        except Exception as e:
            console.error(f"Failed to launch GUI: {e}. Falling back to CLI.")
            cli.interactive_menu()


if __name__ == "__main__":
    main()
