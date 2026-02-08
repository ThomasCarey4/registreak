#!/usr/bin/env python
"""Add streak columns to users table if they do not exist.

Usage: run with the project's Poetry environment so dependencies are available:
    poetry run python scripts/add_streak_columns.py

It reads DB connection info from environment variables:
  - DATABASE_URL (optional, falls back to psycopg2 defaults)

This script is idempotent and safe to run multiple times.
"""
import os
import sys

try:
    import psycopg2
    from psycopg2 import sql
except Exception as e:
    print("Missing dependency psycopg2. Install with `poetry add psycopg2-binary` and run via `poetry run python`.")
    raise

def main():
    db_url = os.environ.get('DATABASE_URL')

    conn = None
    try:
        if db_url:
            conn = psycopg2.connect(db_url)
        else:
            # Connect using environment or defaults (host, user, password, dbname)
            conn = psycopg2.connect()

        cur = conn.cursor()

        # Add columns if they do not exist
        queries = [
            "ALTER TABLE users ADD COLUMN IF NOT EXISTS current_streak INTEGER DEFAULT 0 NOT NULL;",
            "ALTER TABLE users ADD COLUMN IF NOT EXISTS longest_streak INTEGER DEFAULT 0 NOT NULL;",
            "ALTER TABLE users ADD COLUMN IF NOT EXISTS streak_last_date DATE;"
        ]

        for q in queries:
            print('Executing:', q)
            cur.execute(q)

        conn.commit()
        cur.close()
        print('DB update complete.')

    except Exception as exc:
        print('Error updating DB:', exc)
        sys.exit(2)
    finally:
        if conn:
            conn.close()

if __name__ == '__main__':
    main()
