"""
LuciProxy Manager - Database Migration Runner.
Enforces versioned, incremental, transaction-safe schema upgrades.
"""

from datetime import datetime
import sqlite3
from typing import List, Tuple

from .schema import CURRENT_SCHEMA_VERSION, SCHEMA_V1_SQL, MIGRATION_V1_TO_V2_SQL, MIGRATION_V2_TO_V3_SQL


class MigrationManager:
    """Manages schema migrations sequentially for the local SQLite database."""

    MIGRATIONS: List[Tuple[int, str, str]] = [
        (1, "Initial baseline schema with separate app_state, connections, accounts, workers, d1, and history", SCHEMA_V1_SQL),
        (2, "Add performance indexes on update_history and connection status", MIGRATION_V1_TO_V2_SQL),
        (3, "Add apiRoute column to managed_workers", MIGRATION_V2_TO_V3_SQL),
    ]

    @classmethod
    def get_current_version(cls, conn: sqlite3.Connection) -> int:
        """Returns the highest applied schema version, or 0 if uninitialized."""
        cursor = conn.cursor()
        try:
            # Check if schema_version table exists
            cursor.execute(
                "SELECT name FROM sqlite_master WHERE type='table' AND name='schema_version'"
            )
            if not cursor.fetchone():
                return 0

            cursor.execute("SELECT MAX(version) FROM schema_version")
            row = cursor.fetchone()
            return int(row[0]) if row and row[0] is not None else 0
        except sqlite3.Error:
            return 0

    @classmethod
    def apply_migrations(cls, conn: sqlite3.Connection) -> int:
        """
        Applies all pending migrations up to CURRENT_SCHEMA_VERSION within an atomic transaction.
        Returns the new schema version.
        """
        conn.execute("PRAGMA foreign_keys = ON")
        curr_ver = cls.get_current_version(conn)

        for target_ver, desc, sql_script in cls.MIGRATIONS:
            if target_ver > curr_ver:
                with conn:
                    # Execute migration statements
                    conn.executescript(sql_script)

                    # Record version in schema_version table
                    now = datetime.utcnow().isoformat() + "Z"
                    conn.execute(
                        "INSERT INTO schema_version (version, applied_at, description) VALUES (?, ?, ?)",
                        (target_ver, now, desc)
                    )
                curr_ver = target_ver

        return curr_ver
