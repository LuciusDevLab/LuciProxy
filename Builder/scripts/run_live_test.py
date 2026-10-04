"""
Runner script for Live Cloudflare Integration Verification.
Reads token from environment variable or stdin.
Never writes token to disk, logs, or command-line arguments.
"""

import os
import sys
from pathlib import Path

# Add project root to sys.path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from src.storage.account_store import AccountStore
from src.validation.live_verifier import LiveIntegrationVerifier


def main():
    token = os.environ.get("CLOUDFLARE_API_TOKEN") or os.environ.get("CF_API_TOKEN")
    if not token:
        # Check AccountStore active account
        store = AccountStore()
        active = store.get_active_account()
        if active:
            token = store.get_token_for_account(active["id"])

    if not token and len(sys.argv) > 1 and sys.argv[1] == "--stdin":
        token = sys.stdin.read().strip()

    if not token:
        print("[ERROR] No Cloudflare API Token found.")
        print("Please set the CLOUDFLARE_API_TOKEN environment variable or supply it via --stdin.")
        sys.exit(1)

    verifier = LiveIntegrationVerifier(token=token)
    report = verifier.run_disposable_verification()

    print("\n========================================================")
    print("           LIVE CLOUDFLARE VERIFICATION REPORT          ")
    print("========================================================")
    print(f"Overall Status:        {'SUCCESS' if report.success else 'FAILED'}")
    print(f"Worker Name:           {report.worker_name}")
    print(f"D1 Database Name:      {report.d1_name}")
    print(f"D1 Database UUID:      {report.d1_uuid}")
    print(f"Account Subdomain:     {report.subdomain}.workers.dev")
    print(f"Worker Edge URL:       {report.worker_url}")
    print(f"Admin Panel URL:       {report.panel_url}")
    print("\nStage Execution Log:")
    print("--------------------------------------------------------")
    for s in report.stages:
        print(f"[{s.status:<4}] Step {s.step:<2}: {s.name:<32} {s.method} {s.endpoint} ({s.elapsed_ms}ms)")
        print(f"       Details: {s.details}")

    print("\nHTTPS Live Verification Results:")
    print("--------------------------------------------------------")
    for k, v in report.https_verification.items():
        print(f"  {k}: {v}")

    print("\nDisposable Cleanup Results:")
    print("--------------------------------------------------------")
    for k, v in report.cleanup_result.items():
        print(f"  {k}: {v}")

    if report.api_differences:
        print("\nObserved API Differences:")
        print("--------------------------------------------------------")
        for diff in report.api_differences:
            print(f"  * {diff}")

    print("========================================================\n")
    sys.exit(0 if report.success else 1)


if __name__ == "__main__":
    main()
