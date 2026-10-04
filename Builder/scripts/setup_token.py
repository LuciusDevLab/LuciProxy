"""
Secure local token input script using getpass().
Stores the verified token directly into the OS Keyring without printing or logging.
"""

import getpass
import sys
from pathlib import Path

# Add project root to sys.path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from src.storage.account_store import AccountStore
from src.auth.token_validator import verify_and_discover_accounts
from src.utils.sanitize import sanitize_text


def main():
    print("==================================================")
    print(" LuciProxy Builder - Secure Local Token Setup     ")
    print("==================================================")
    print("Enter your Cloudflare API Token below.")
    print("(Input is masked and will be stored securely in OS Keyring)\n")

    try:
        token = getpass.getpass("Cloudflare API Token: ").strip()
    except (KeyboardInterrupt, EOFError):
        print("\nAborted.")
        sys.exit(1)

    if not token:
        print("[ERROR] Token cannot be empty.")
        sys.exit(1)

    print("\nVerifying token with Cloudflare API...")
    try:
        user_info, accounts, client = verify_and_discover_accounts(token)
    except Exception as e:
        print(f"[ERROR] Verification failed: {sanitize_text(str(e))}")
        sys.exit(1)

    if not accounts:
        print("[ERROR] No Cloudflare accounts found for this token.")
        sys.exit(1)

    primary = accounts[0]
    store = AccountStore()
    store.save_account(
        account_id=primary["id"],
        name=primary.get("name", "Account"),
        email=user_info.get("email", ""),
        token=token
    )

    print("✓ Token successfully verified and stored in OS Keyring.")
    print(f"  Account:  {primary.get('name')} ({primary['id']})")
    print(f"  Token ID: {user_info.get('token_id', 'active')}")
    print("==================================================")


if __name__ == "__main__":
    main()
