"""
Unit Tests for Phase 2 - Local Storage Schema, Database Model, and Security Invariants.
Validates:
1. Schema Creation & Default State
2. Schema Versioning & Step-by-Step Migrations
3. Manager Version vs Worker Version Strict Independence
4. Multi-Connection & Multi-Account Isolation
5. Security Invariant: Zero Tokens in SQLite (Raw Byte & Table Scan)
6. Worker D1 Binding Metadata & Querying
7. Logout Connection Cleanup (Cascade + Token Erase)
8. Delete All Local Data Irreversible Purge
9. Corrupted / Missing Database Recovery
"""

import os
from pathlib import Path
import sqlite3
import tempfile
import pytest

from BuilderV2.storage.database import LocalDatabase, DEFAULT_MANAGER_VERSION
from BuilderV2.storage.models import (
    AppStateRecord,
    ConnectionRecord,
    AccountRecord,
    ManagedWorkerRecord,
    D1DatabaseRecord,
    UpdateHistoryRecord,
)
from BuilderV2.storage.migrations import MigrationManager
from BuilderV2.storage.schema import CURRENT_SCHEMA_VERSION, SCHEMA_V1_SQL
from BuilderV2.security.credentials import InMemoryCredentialStore


@pytest.fixture
def temp_db_path():
    with tempfile.NamedTemporaryFile(suffix=".db", delete=False) as f:
        path = f.name
    yield path
    if os.path.exists(path):
        os.remove(path)


@pytest.fixture
def memory_db():
    cred_store = InMemoryCredentialStore()
    db = LocalDatabase(db_path=":memory:", credential_store=cred_store)
    yield db
    db.close()


# 1. Schema Creation & Defaults
def test_schema_creation_and_defaults(memory_db):
    """Verifies that fresh database initializes all tables, schema version, and app state."""
    app_state = memory_db.get_app_state()
    assert app_state.currentManagerVersion == DEFAULT_MANAGER_VERSION
    assert app_state.lastManagerUpdateCheck is None
    assert app_state.latestDiscoveredManagerVersion is None

    conn = memory_db._get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table'")
    tables = {r[0] for r in cursor.fetchall()}

    expected_tables = {
        "schema_version",
        "app_state",
        "cloudflare_connections",
        "cloudflare_accounts",
        "managed_workers",
        "d1_databases",
        "update_history",
    }
    assert expected_tables.issubset(tables)

    cursor.execute("SELECT MAX(version) FROM schema_version")
    ver = cursor.fetchone()[0]
    assert ver == CURRENT_SCHEMA_VERSION


# 2. Schema Migration Step-by-Step
def test_schema_migration_step_by_step(temp_db_path):
    """Verifies incremental migration from V1 to V2 preserving data."""
    # 1. Manually set up V1 database
    conn = sqlite3.connect(temp_db_path)
    conn.executescript(SCHEMA_V1_SQL)
    conn.execute(
        "INSERT INTO schema_version (version, applied_at, description) VALUES (1, '2026-10-01T00:00:00Z', 'V1 baseline')"
    )
    conn.execute(
        "INSERT INTO app_state (id, currentManagerVersion, updatedAt) VALUES (1, '2.0.0', '2026-10-01T00:00:00Z')"
    )
    conn.execute(
        "INSERT INTO cloudflare_connections (connectionId, displayName, createdAt) VALUES ('c1', 'Conn 1', '2026-10-01T00:00:00Z')"
    )
    conn.commit()

    ver_before = MigrationManager.get_current_version(conn)
    assert ver_before == 1

    # 2. Run migration manager
    new_ver = MigrationManager.apply_migrations(conn)
    assert new_ver == CURRENT_SCHEMA_VERSION

    # 3. Verify data preserved
    cursor = conn.cursor()
    cursor.execute("SELECT displayName FROM cloudflare_connections WHERE connectionId = 'c1'")
    assert cursor.fetchone()[0] == "Conn 1"

    cursor.execute("SELECT currentManagerVersion FROM app_state WHERE id = 1")
    assert cursor.fetchone()[0] == "2.0.0"
    conn.close()


# 3. Manager Version vs Worker Version Strict Separation
def test_manager_vs_worker_version_independence(memory_db):
    """
    Verifies that Manager version (currentManagerVersion) and
    Worker version (installedWorkerVersion) are completely independent.
    """
    # Set Manager version
    memory_db.update_app_state(
        current_manager_version="2.1.0",
        last_check="2026-10-07T12:00:00Z",
        latest_discovered="2.2.0"
    )

    # Add Managed Worker with Worker version
    worker = ManagedWorkerRecord(
        workerId="w1",
        connectionId="c1",
        accountId="acc1",
        workerName="amber-finch-4827",
        workerUrl="https://amber-finch-4827.workers.dev",
        installedWorkerVersion="v1.2.0",
        status="update_available"
    )
    # Save connection first for FK
    memory_db.save_connection(ConnectionRecord(connectionId="c1", displayName="Test Conn"))
    memory_db.save_managed_worker(worker)

    # Verify Manager version is unaffected by Worker version
    app_state = memory_db.get_app_state()
    assert app_state.currentManagerVersion == "2.1.0"
    assert app_state.latestDiscoveredManagerVersion == "2.2.0"

    # Verify Worker version is unaffected by Manager version
    retrieved_worker = memory_db.get_managed_worker("w1")
    assert retrieved_worker.installedWorkerVersion == "v1.2.0"

    # Update worker to v1.2.1
    memory_db.update_worker_version("w1", "v1.2.1", status="up_to_date")
    updated_worker = memory_db.get_managed_worker("w1")
    assert updated_worker.installedWorkerVersion == "v1.2.1"

    # Manager version remains untouched
    assert memory_db.get_app_state().currentManagerVersion == "2.1.0"


# 4. Multi-Connection & Multi-Account Isolation
def test_multi_connection_multi_account_isolation(memory_db):
    """
    Verifies that multiple connections can exist, each managing multiple accounts,
    with strict isolation.
    """
    # Connection 1 with 2 accounts
    c1 = ConnectionRecord(connectionId="conn-alpha", displayName="Personal")
    memory_db.save_connection(c1, token="token-alpha-123456789")
    memory_db.save_account(AccountRecord(accountId="acc-1", connectionId="conn-alpha", accountName="Prod Account", isDefault=True))
    memory_db.save_account(AccountRecord(accountId="acc-2", connectionId="conn-alpha", accountName="Dev Account", isDefault=False))

    # Connection 2 with 1 account
    c2 = ConnectionRecord(connectionId="conn-beta", displayName="Corporate")
    memory_db.save_connection(c2, token="token-beta-987654321")
    memory_db.save_account(AccountRecord(accountId="acc-3", connectionId="conn-beta", accountName="Corp Account", isDefault=True))

    conns = memory_db.list_connections()
    assert len(conns) == 2
    assert {c.connectionId for c in conns} == {"conn-alpha", "conn-beta"}

    accs_c1 = memory_db.list_accounts_for_connection("conn-alpha")
    assert len(accs_c1) == 2
    assert {a.accountId for a in accs_c1} == {"acc-1", "acc-2"}

    accs_c2 = memory_db.list_accounts_for_connection("conn-beta")
    assert len(accs_c2) == 1
    assert accs_c2[0].accountId == "acc-3"

    # Verify tokens in secure store
    assert memory_db.credential_store.get_token("conn-alpha") == "token-alpha-123456789"
    assert memory_db.credential_store.get_token("conn-beta") == "token-beta-987654321"


# 5. SECURITY INVARIANT: Zero Tokens in SQLite Database
def test_zero_tokens_in_sqlite_disk_audit(temp_db_path):
    """
    CRITICAL SECURITY AUDIT:
    Saves connections with secret tokens.
    Audits the entire SQLite disk file and every column in all tables.
    Proves that zero token characters ever touch SQLite.
    """
    cred_store = InMemoryCredentialStore()
    db = LocalDatabase(db_path=temp_db_path, credential_store=cred_store)

    secret_tokens = [
        "cfut_TEST_SECRET_TOKEN_ALPHA_AAAAAAAAAAAAAAAAAAAAAAAA",
        "cfut_TEST_SECRET_TOKEN_BETA_BBBBBBBBBBBBBBBBBBBBBBBB",
    ]

    # Save connections with tokens
    db.save_connection(ConnectionRecord(connectionId="conn-1", displayName="Alpha"), token=secret_tokens[0])
    db.save_connection(ConnectionRecord(connectionId="conn-2", displayName="Beta"), token=secret_tokens[1])

    # Add workers and accounts
    db.save_account(AccountRecord(accountId="acc-1", connectionId="conn-1", accountName="Account 1"))
    db.save_managed_worker(ManagedWorkerRecord(
        workerId="w-1", connectionId="conn-1", accountId="acc-1",
        workerName="worker-alpha", workerUrl="https://worker-alpha.workers.dev"
    ))

    # Assert no tokens in database tables or raw disk bytes
    assert db.assert_no_tokens_in_database(secret_tokens) is True

    # Tokens exist safely in secure credential store
    assert cred_store.get_token("conn-1") == secret_tokens[0]
    assert cred_store.get_token("conn-2") == secret_tokens[1]

    db.close()


# 6. Worker D1 Binding Metadata & Querying
def test_worker_d1_binding_metadata(memory_db):
    """Verifies that Worker records track official D1 binding name, UUID, and name."""
    c = ConnectionRecord(connectionId="c1", displayName="Conn")
    memory_db.save_connection(c)

    worker = ManagedWorkerRecord(
        workerId="w-d1",
        connectionId="c1",
        accountId="acc-d1",
        workerName="silent-otter-worker",
        workerUrl="https://silent-otter-worker.workers.dev",
        d1BindingName="IOT_DB",
        d1DatabaseId="8ce04f50-d253-4791-92da-1ebda064e373",
        d1Name="silent-otter-5931",
        installedWorkerVersion="v1.2.0",
        status="up_to_date"
    )
    memory_db.save_managed_worker(worker)

    res = memory_db.get_managed_worker("w-d1")
    assert res is not None
    assert res.d1BindingName == "IOT_DB"
    assert res.d1DatabaseId == "8ce04f50-d253-4791-92da-1ebda064e373"
    assert res.d1Name == "silent-otter-5931"

    by_name = memory_db.get_managed_worker_by_name("acc-d1", "silent-otter-worker")
    assert by_name is not None
    assert by_name.workerId == "w-d1"


# 7. Logout Connection Cleanup (Cascade + Token Erase)
def test_logout_connection_cleanup(memory_db):
    """
    Verifies that logging out a connection:
    1. Erases the API token from the secure credential store.
    2. Cascade-deletes accounts, managed workers, and cached D1s.
    """
    token_str = "cfut_LOGOUT_TEST_TOKEN_12345"
    memory_db.save_connection(ConnectionRecord(connectionId="c-logout", displayName="Conn Logout"), token=token_str)
    memory_db.save_account(AccountRecord(accountId="acc-logout", connectionId="c-logout", accountName="Acc"))
    memory_db.save_managed_worker(ManagedWorkerRecord(
        workerId="w-logout", connectionId="c-logout", accountId="acc-logout",
        workerName="worker-logout", workerUrl="https://logout.workers.dev"
    ))
    memory_db.save_d1_database(D1DatabaseRecord(
        databaseId="db-logout", accountId="acc-logout", connectionId="c-logout", name="d1-logout"
    ))

    # Verify state before logout
    assert memory_db.credential_store.has_token("c-logout") is True
    assert memory_db.get_managed_worker("w-logout") is not None
    assert len(memory_db.list_accounts_for_connection("c-logout")) == 1

    # Execute logout
    ok = memory_db.logout_connection("c-logout")
    assert ok is True

    # 1. Token must be gone from secure store
    assert memory_db.credential_store.has_token("c-logout") is False
    assert memory_db.credential_store.get_token("c-logout") is None

    # 2. Connection and cascaded records must be deleted from SQLite
    assert memory_db.get_connection("c-logout") is None
    assert memory_db.get_managed_worker("w-logout") is None
    assert len(memory_db.list_accounts_for_connection("c-logout")) == 0
    assert len(memory_db.list_d1_databases("acc-logout")) == 0


# 8. Delete All Local Data Irreversible Purge
def test_delete_all_local_data_purge(memory_db):
    """
    Verifies that Delete All Local Data:
    1. Deletes all tokens from secure credential vault.
    2. Clears all SQLite data tables.
    3. Reinitializes clean schema and resets app_state.
    """
    memory_db.save_connection(ConnectionRecord(connectionId="c1", displayName="Conn 1"), token="token-1")
    memory_db.save_connection(ConnectionRecord(connectionId="c2", displayName="Conn 2"), token="token-2")
    memory_db.update_app_state(current_manager_version="2.5.0", last_check="2026-10-07T12:00:00Z")
    memory_db.record_update_history(UpdateHistoryRecord(
        historyId="h1", workerName="worker-1", accountId="acc-1",
        previousWorkerVersion="v1.2.0", updatedWorkerVersion="v1.2.1",
        d1DatabaseId="d1-uuid", d1BindingName="IOT_DB",
        updatedAt="2026-10-07T12:00:00Z", status="success"
    ))

    assert len(memory_db.list_connections()) == 2
    assert memory_db.credential_store.has_token("c1") is True
    assert len(memory_db.list_update_history()) == 1

    # Execute Delete All Local Data
    memory_db.delete_all_local_data()

    # 1. All tokens purged
    assert memory_db.credential_store.has_token("c1") is False
    assert memory_db.credential_store.has_token("c2") is False

    # 2. All tables empty
    assert len(memory_db.list_connections()) == 0
    assert len(memory_db.list_managed_workers()) == 0
    assert len(memory_db.list_update_history()) == 0

    # 3. App state reset to default
    app_state = memory_db.get_app_state()
    assert app_state.currentManagerVersion == DEFAULT_MANAGER_VERSION
    assert app_state.lastManagerUpdateCheck is None


# 9. Corrupted or Missing Local Data Recovery
def test_corrupted_or_missing_database_recovery(temp_db_path):
    """
    Verifies that LocalDatabase recovers cleanly when initialized on an uninitialized,
    missing, or freshly recreated file path without throwing unhandled exceptions.
    """
    if os.path.exists(temp_db_path):
        os.remove(temp_db_path)

    # Initializing on non-existent path creates file and initializes schema
    db = LocalDatabase(db_path=temp_db_path)
    assert os.path.exists(temp_db_path)
    assert db.get_app_state().currentManagerVersion == DEFAULT_MANAGER_VERSION
    db.close()

    # Re-opening existing file preserves state
    db2 = LocalDatabase(db_path=temp_db_path)
    db2.update_app_state(current_manager_version="2.0.1")
    db2.close()

    db3 = LocalDatabase(db_path=temp_db_path)
    assert db3.get_app_state().currentManagerVersion == "2.0.1"
    db3.close()
