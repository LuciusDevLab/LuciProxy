"""
LuciProxy Manager - Cloudflare Account Service.
Handles token verification, multi-account discovery, and account metadata.
"""

from typing import List, Optional

from .client import CloudflareClient
from .models import TokenVerificationDto, CloudflareAccountDto
from .exceptions import ResourceNotFoundError


class AccountService:
    """Service for interacting with Cloudflare user and account resources."""

    def __init__(self, client: CloudflareClient):
        self.client = client

    def verify_token(self) -> TokenVerificationDto:
        """
        Validates the configured API token with Cloudflare.
        Endpoint: GET /client/v4/user/tokens/verify
        """
        # Support OAuth tokens if prefixed with cfoat_
        if getattr(self.client, "_token", "").startswith("cfoat_"):
            res = self.client.request("GET", "/user", step="Verify OAuth Token")
            user_data = res.get("result", {})
            return TokenVerificationDto(
                status="active",
                id=user_data.get("id"),
            )

        res = self.client.request("GET", "/user/tokens/verify", step="Verify Token")
        result = res.get("result", {})
        return TokenVerificationDto(
            status=result.get("status", "unknown"),
            id=result.get("id"),
            expires_on=result.get("expires_on"),
            not_before=result.get("not_before"),
        )

    def list_accounts(self) -> List[CloudflareAccountDto]:
        """
        Lists all accounts accessible by this token, handling pagination automatically.
        Endpoint: GET /client/v4/accounts
        Supports ONE Token -> MANY Accounts.
        """
        raw_accounts = self.client.paginate("/accounts", step="List Accounts")
        accounts: List[CloudflareAccountDto] = []
        for a in raw_accounts:
            acc_id = str(a.get("id", "")).strip()
            acc_name = str(a.get("name", "")).strip()
            if acc_id and acc_name:
                accounts.append(
                    CloudflareAccountDto(
                        id=acc_id,
                        name=acc_name,
                        type=a.get("type"),
                    )
                )
        return accounts

    def get_account(self, account_id: str) -> Optional[CloudflareAccountDto]:
        """
        Retrieves details for a specific Cloudflare account.
        Endpoint: GET /client/v4/accounts/{account_id}
        """
        try:
            res = self.client.request("GET", f"/accounts/{account_id}", step="Get Account")
            acc = res.get("result", {})
            if not acc:
                return None
            return CloudflareAccountDto(
                id=str(acc.get("id", "")),
                name=str(acc.get("name", "")),
                type=acc.get("type"),
            )
        except ResourceNotFoundError:
            return None
