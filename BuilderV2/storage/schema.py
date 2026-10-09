"""
LuciProxy Manager - SQLite Database Schemas and DDL.
API tokens are strictly forbidden from this schema and reside exclusively
in the platform-native secure credential store.
"""

CURRENT_SCHEMA_VERSION = 3

# Initial baseline schema (Version 1)
SCHEMA_V1_SQL = """
-- Schema migration tracking
CREATE TABLE IF NOT EXISTS schema_version (
    version INTEGER PRIMARY KEY,
    applied_at TEXT NOT NULL,
    description TEXT
);

-- Singleton Application State (strictly Manager application metadata)
CREATE TABLE IF NOT EXISTS app_state (
    id INTEGER PRIMARY KEY CHECK (id = 1),
    currentManagerVersion TEXT NOT NULL,
    lastManagerUpdateCheck TEXT,
    latestDiscoveredManagerVersion TEXT,
    updatedAt TEXT NOT NULL
);

-- Cloudflare Connections (one connection may access multiple accounts)
-- Sensitive API Token is NEVER stored here; kept in secure credential store.
CREATE TABLE IF NOT EXISTS cloudflare_connections (
    connectionId TEXT PRIMARY KEY,
    displayName TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'active',
    createdAt TEXT NOT NULL,
    lastVerifiedAt TEXT
);

-- Cloudflare Accounts associated with a connection
CREATE TABLE IF NOT EXISTS cloudflare_accounts (
    accountId TEXT NOT NULL,
    connectionId TEXT NOT NULL,
    accountName TEXT NOT NULL,
    isDefault INTEGER NOT NULL DEFAULT 0,
    lastSyncedAt TEXT,
    PRIMARY KEY (accountId, connectionId),
    FOREIGN KEY (connectionId) REFERENCES cloudflare_connections(connectionId) ON DELETE CASCADE
);

-- Managed Workers (Cached UI state only; Cloudflare remains authoritative)
-- Uses explicit 'installedWorkerVersion' - NEVER ambiguous 'installedVersion'
CREATE TABLE IF NOT EXISTS managed_workers (
    workerId TEXT PRIMARY KEY,
    connectionId TEXT NOT NULL,
    accountId TEXT NOT NULL,
    workerName TEXT NOT NULL,
    workerUrl TEXT NOT NULL,
    d1BindingName TEXT,
    d1DatabaseId TEXT,
    d1Name TEXT,
    installedWorkerVersion TEXT NOT NULL,
    lastWorkerUpdateCheck TEXT,
    latestDiscoveredWorkerVersion TEXT,
    lastUpdatedAt TEXT,
    status TEXT NOT NULL DEFAULT 'unknown',
    FOREIGN KEY (connectionId) REFERENCES cloudflare_connections(connectionId) ON DELETE CASCADE
);

-- Discovered D1 Databases (Cached discovery metadata)
CREATE TABLE IF NOT EXISTS d1_databases (
    databaseId TEXT NOT NULL,
    accountId TEXT NOT NULL,
    connectionId TEXT NOT NULL,
    name TEXT NOT NULL,
    tableCount INTEGER DEFAULT 0,
    fileSize INTEGER DEFAULT 0,
    lastSyncedAt TEXT,
    PRIMARY KEY (databaseId, accountId),
    FOREIGN KEY (connectionId) REFERENCES cloudflare_connections(connectionId) ON DELETE CASCADE
);

-- Update Execution History
CREATE TABLE IF NOT EXISTS update_history (
    historyId TEXT PRIMARY KEY,
    workerId TEXT,
    workerName TEXT NOT NULL,
    accountId TEXT NOT NULL,
    previousWorkerVersion TEXT NOT NULL,
    updatedWorkerVersion TEXT NOT NULL,
    d1DatabaseId TEXT NOT NULL,
    d1BindingName TEXT NOT NULL,
    updatedAt TEXT NOT NULL,
    status TEXT NOT NULL,
    details TEXT
);

-- High-performance indexes
CREATE INDEX IF NOT EXISTS idx_workers_account ON managed_workers(accountId);
CREATE INDEX IF NOT EXISTS idx_workers_connection ON managed_workers(connectionId);
CREATE INDEX IF NOT EXISTS idx_workers_name ON managed_workers(workerName);
CREATE INDEX IF NOT EXISTS idx_accounts_conn ON cloudflare_accounts(connectionId);
CREATE INDEX IF NOT EXISTS idx_d1_account ON d1_databases(accountId);
"""

# Migration from V1 to V2: adds audit columns / indices if upgrading
MIGRATION_V1_TO_V2_SQL = """
-- Version 2 migration: add index on update_history and connection verification status index
CREATE INDEX IF NOT EXISTS idx_history_worker ON update_history(workerName);
CREATE INDEX IF NOT EXISTS idx_history_time ON update_history(updatedAt);
CREATE INDEX IF NOT EXISTS idx_conn_status ON cloudflare_connections(status);
"""

# Migration from V2 to V3: add apiRoute column to managed_workers
MIGRATION_V2_TO_V3_SQL = """
-- Version 3 migration: add apiRoute column to managed_workers
ALTER TABLE managed_workers ADD COLUMN apiRoute TEXT NOT NULL DEFAULT 'sync';
"""
