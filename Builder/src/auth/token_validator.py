"""
LuciProxy Builder - Cloudflare API Token Validator & Account Discovery
Validates API tokens, discovers accessible accounts, and performs active capability preflight.
"""

from dataclasses import dataclass, field
from typing import Any, Dict, List, Optional, Tuple

from urllib.parse import quote_plus

from ..cloudflare.client import CloudflareClient
from ..cloudflare.exceptions import AuthenticationError, CapabilityError, CloudflareError
from ..resources.naming import generate_token_name, is_name_allowed


TOKEN_TEMPLATE_BASE_URL = (
    "https://dash.cloudflare.com/profile/api-tokens?"
    "permissionGroupKeys=%5B%7B%22key%22%3A%22workers_scripts%22%2C%22type%22%3A%22edit%22%7D%2C"
    "%7B%22key%22%3A%22d1%22%2C%22type%22%3A%22edit%22%7D%2C"
    "%7B%22key%22%3A%22account_settings%22%2C%22type%22%3A%22read%22%7D%5D"
    "&accountId=%2A&zoneId=all"
)
PRECONFIGURED_TOKEN_CREATION_BASE_URL = TOKEN_TEMPLATE_BASE_URL
OFFICIAL_TOKEN_CREATION_BASE_URL = TOKEN_TEMPLATE_BASE_URL
PRECONFIGURED_TOKEN_CREATION_URL = TOKEN_TEMPLATE_BASE_URL
OFFICIAL_TOKEN_CREATION_URL = TOKEN_TEMPLATE_BASE_URL


def build_token_creation_url(token_name: Optional[str] = None) -> str:
    """
    Dynamically constructs the Cloudflare API Token creation template URL with a fresh,
    cryptographically random neutral token name (or provided custom name).
    URL-encodes the name and guarantees zero hardcoded or static token naming.
    """
    name = token_name or generate_token_name()
    encoded_name = quote_plus(name)
    return f"{TOKEN_TEMPLATE_BASE_URL}&name={encoded_name}"


def get_permission_checklist() -> str:
    """Returns the formatted in-app explanation of permissions required for deployment."""
    return (
        "Required Cloudflare API Token Permissions:\n"
        "  1. Account  > Workers Scripts  > Edit   (Deploy Worker script and configure bindings)\n"
        "  2. Account  > D1               > Edit   (Requires 'D1 Write' capability to create D1 database and initialize schema)\n"
        "  3. Account  > Account Settings > Read   (Discover accessible accounts)\n"
        "Account Resources:\n"
        "  • Include > All accounts (or choose your specific target account)"
    )


@dataclass
class PreflightReport:
    """Detailed capability preflight results for a selected Cloudflare account."""
    account_id: str
    workers_scripts_ok: bool = False
    d1_ok: bool = False
    d1_read_ok: bool = False
    d1_write_ok: bool = False
    subdomain_ok: bool = False
    subdomain: Optional[str] = None
    subdomain_note: Optional[str] = None
    errors: List[str] = field(default_factory=list)

    def __post_init__(self):
        # Sync legacy or test-constructed instances
        if self.d1_ok and not self.d1_read_ok and not self.d1_write_ok:
            self.d1_read_ok = True
            self.d1_write_ok = True
        elif self.d1_read_ok and self.d1_write_ok:
            self.d1_ok = True
        elif not self.d1_write_ok:
            self.d1_ok = False

    @property
    def all_passed(self) -> bool:
        """Returns True if all required operational capabilities are confirmed."""
        return self.workers_scripts_ok and self.d1_ok and self.d1_write_ok and (len(self.errors) == 0)

    def summary(self) -> str:
        """Formats a human-readable capability preflight report."""
        lines = [f"Capability Preflight for Account [{self.account_id}]:"]
        w_mark = "PASS" if self.workers_scripts_ok else "FAIL"
        d_mark = "PASS" if self.d1_ok and self.d1_write_ok else "FAIL"
        s_mark = "PASS" if self.subdomain_ok else "WARN"

        lines.append(f"  [{w_mark}] Workers Scripts (Edit)   : {'Confirmed' if self.workers_scripts_ok else 'Missing permission'}")
        if self.d1_ok and self.d1_write_ok:
            d_status = "Confirmed"
        elif self.d1_read_ok and not self.d1_write_ok:
            d_status = "Missing write permission (D1 Write required to create database)"
        else:
            d_status = "Missing permission"
        lines.append(f"  [{d_mark}] D1 Database (Write)      : {d_status}")
        sub_info = f"subdomain: {self.subdomain}.workers.dev" if self.subdomain else (self.subdomain_note or "Not configured")
        lines.append(f"  [{s_mark}] Workers Subdomain         : {sub_info}")

        if self.errors:
            lines.append("\nPreflight Failures:")
            for err in self.errors:
                lines.append(f"  - {err}")
        return "\n".join(lines)


def verify_and_discover_accounts(token: str) -> Tuple[Dict[str, Any], List[Dict[str, Any]], CloudflareClient]:
    """
    Step 1 & 2: Verifies token status and discovers accessible Cloudflare accounts.
    Eliminates unnecessary dependency on GET /user (User Details: Read).
    Only requires the operational token template permissions:
      - Workers Scripts: Edit
      - D1: Edit
      - Account Settings: Read
    Returns: (user_details, accounts_list, client)
    """
    token_clean = token.strip() if token else ""
    if not token_clean:
        raise AuthenticationError("API Token cannot be empty.", step="Token Input")

    client = CloudflareClient(token_clean)

    # 1. Verify Token (GET /user/tokens/verify - built-in token self-verification)
    verify_res = client.verify_token()
    token_status = verify_res.get("status")
    if token_status != "active":
        raise AuthenticationError(
            message=f"Cloudflare API token status is '{token_status}' (expected 'active').",
            step="Token Verification",
            reason="The provided token is not active or has been disabled.",
            suggested_action=f"Check token status at {OFFICIAL_TOKEN_CREATION_URL}"
        )

    # 2. Discover Accounts (GET /accounts - requires Account Settings: Read)
    accounts = client.list_accounts()
    if not accounts:
        raise CloudflareError(
            message="No Cloudflare accounts accessible with this API token.",
            step="Account Discovery",
            reason="Token has no access to any account or user has not created an account.",
            suggested_action="Ensure your token includes Account scope permissions ('Account Settings: Read')."
        )

    user_info = {
        "email": "",
        "user_id": "",
        "token_id": verify_res.get("id", "")
    }

    return user_info, accounts, client


def run_capability_preflight(client: CloudflareClient, account_id: str) -> PreflightReport:
    """
    Step 4: Actively probes required capabilities against the selected account.
    Relies on authoritative API responses rather than guessing static permission names.
    """
    report = PreflightReport(account_id=account_id)

    # 1. Probe Workers Scripts Capability
    w_ok, w_err = client.probe_workers_capability(account_id)
    report.workers_scripts_ok = w_ok
    if not w_ok and w_err:
        report.errors.append(f"Workers capability check failed: {w_err}")

    # 2. Probe D1 Capability (both Read and Write capabilities)
    d_ok, d_err = client.probe_d1_capability(account_id)
    report.d1_ok = d_ok
    if d_ok:
        report.d1_read_ok = True
        report.d1_write_ok = True
    else:
        if d_err and "D1 Write" in d_err:
            report.d1_read_ok = True
            report.d1_write_ok = False
        elif d_err and "D1 Read" in d_err:
            report.d1_read_ok = False
            report.d1_write_ok = False
        else:
            report.d1_read_ok = False
            report.d1_write_ok = False
        report.errors.append(f"D1 capability check failed: {d_err}")

    # 3. Probe Subdomain Capability
    s_ok, subdomain, s_note = client.probe_subdomain_capability(account_id)
    report.subdomain_ok = s_ok
    report.subdomain = subdomain
    report.subdomain_note = s_note
    if not s_ok and s_note:
        report.errors.append(f"Subdomain check failed: {s_note}")

    return report


def validate_and_discover_account(token: str) -> Tuple[Dict[str, Any], CloudflareClient]:
    """
    Legacy convenience helper: Verifies token, discovers primary account, and resolves subdomain.
    Maintains compatibility with existing caller interfaces.
    """
    user_info, accounts, client = verify_and_discover_accounts(token)

    primary_account = accounts[0]
    account_id = primary_account.get("id")
    account_name = primary_account.get("name", f"Account-{account_id[:8]}")

    subdomain = client.get_workers_subdomain(account_id)

    meta = {
        "account_id": account_id,
        "account_name": account_name,
        "email": user_info["email"],
        "subdomain": subdomain,
        "all_accounts": accounts
    }

    return meta, client
