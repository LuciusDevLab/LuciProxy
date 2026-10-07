"""
LuciProxy Manager - Local Database Entity Models.
Strictly separates Manager Application State from Per-Worker State.
"""

from dataclasses import dataclass
from typing import Optional


@dataclass
class AppStateRecord:
    currentManagerVersion: str
    lastManagerUpdateCheck: Optional[str] = None
    latestDiscoveredManagerVersion: Optional[str] = None
    updatedAt: Optional[str] = None


@dataclass
class ConnectionRecord:
    connectionId: str
    displayName: str
    status: str = "active"
    createdAt: Optional[str] = None
    lastVerifiedAt: Optional[str] = None


@dataclass
class AccountRecord:
    accountId: str
    connectionId: str
    accountName: str
    isDefault: bool = False
    lastSyncedAt: Optional[str] = None


@dataclass
class ManagedWorkerRecord:
    workerId: str
    connectionId: str
    accountId: str
    workerName: str
    workerUrl: str
    d1BindingName: Optional[str] = None
    d1DatabaseId: Optional[str] = None
    d1Name: Optional[str] = None
    installedWorkerVersion: str = "v1.2.0"  # Strictly installedWorkerVersion, NEVER installedVersion
    lastWorkerUpdateCheck: Optional[str] = None
    latestDiscoveredWorkerVersion: Optional[str] = None
    lastUpdatedAt: Optional[str] = None
    status: str = "unknown"  # "up_to_date" | "update_available" | "unknown"


@dataclass
class D1DatabaseRecord:
    databaseId: str
    accountId: str
    connectionId: str
    name: str
    tableCount: int = 0
    fileSize: int = 0
    lastSyncedAt: Optional[str] = None


@dataclass
class UpdateHistoryRecord:
    historyId: str
    workerName: str
    accountId: str
    previousWorkerVersion: str
    updatedWorkerVersion: str
    d1DatabaseId: str
    d1BindingName: str
    updatedAt: str
    status: str  # "success" | "failed"
    workerId: Optional[str] = None
    details: Optional[str] = None
