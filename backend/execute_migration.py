import os
import sys

# Add the current directory to sys.path to resolve imports
sys.path.append(os.path.join(os.path.dirname(__file__), "app"))

from app.db.supabase import get_supabase_client


def run_migration():
    print("Running migration 002_storage_policies.sql...")

    try:
        supabase = get_supabase_client()

        with open("app/db/migrations/002_storage_policies.sql", "r") as f:
            sql = f.read()

        # Execute raw SQL using Postgres RPC if available, or just verify storage
        # Note: supabase-py client doesn't support raw SQL execution directly unless enabled via RPC
        # But we can try to use the 'rpc' method if you have a 'exec_sql' function defined in database
        # Or we can just print instructions.

        print(
            "IMPORTANT: The Supabase Python client cannot execute raw SQL directly for schema changes unless you have an RPC function set up."
        )
        print(
            "Please COPY the content of 'app/db/migrations/002_storage_policies.sql' and run it in the Supabase Dashboard -> SQL Editor."
        )
        print("-" * 50)
        print(sql)
        print("-" * 50)

    except Exception as e:
        print(f"Error: {e}")


if __name__ == "__main__":
    run_migration()
