"""
Simple versioned SQL migration runner.

Tracks applied migrations in a `schema_migrations` table.
SQL files in backend/migrations/ are executed in sorted order.
"""

import sys
import os
from pathlib import Path

from sqlalchemy import create_engine, text

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from backend.app.config.settings import get_settings


MIGRATIONS_DIR = Path(__file__).resolve().parent / "migrations"


def run_migrations():
    settings = get_settings()
    engine = create_engine(settings.DATABASE_URL)

    with engine.connect() as conn:
        conn.execute(text("""
            CREATE TABLE IF NOT EXISTS schema_migrations (
                version VARCHAR(255) PRIMARY KEY,
                applied_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
            )
        """))
        conn.commit()

        applied = {
            row[0]
            for row in conn.execute(
                text("SELECT version FROM schema_migrations")
            ).fetchall()
        }

        sql_files = sorted(MIGRATIONS_DIR.glob("*.sql"))
        new_count = 0

        for f in sql_files:
            version = f.name
            if version in applied:
                continue

            print(f"  Applying {version} ...")
            sql = f.read_text()
            for statement in sql.split(";"):
                statement = statement.strip()
                if statement:
                    conn.execute(text(statement))

            conn.execute(
                text("INSERT INTO schema_migrations (version) VALUES (:v)"),
                {"v": version},
            )
            conn.commit()
            new_count += 1

        if new_count == 0:
            print("  Database is up to date.")
        else:
            print(f"  Applied {new_count} migration(s).")


if __name__ == "__main__":
    run_migrations()
