"""
LandSetu Index & Materialized Summary Rebuilder CLI
Executes REINDEX across SQLite compound indices and refreshes materialized summary tables.
"""

import os
import sys
import sqlite3

PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
if PROJECT_ROOT not in sys.path:
    sys.path.insert(0, PROJECT_ROOT)

from landsetu_data.ingest import update_materialized_summaries

DB_PATH = os.path.join(PROJECT_ROOT, "backend", "data", "landsetu.db")

def rebuild():
    print("=======================================================")
    print(" LANDSETU INDEX & MATERIALIZED SUMMARY REBUILDER")
    print("=======================================================")

    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    print("[*] Rebuilding SQLite compound indexes (REINDEX)...")
    cursor.execute("REINDEX;")
    conn.commit()
    print("    [OK] Compound indexes rebuilt.")

    print("[*] Refreshing materialized summaries...")
    update_materialized_summaries(cursor)
    conn.commit()
    print("    [OK] Materialized summaries updated (village_parcel_summary, district_land_summary, mutation_summary).")

    v_count = cursor.execute("SELECT COUNT(*) FROM village_parcel_summary").fetchone()[0]
    d_count = cursor.execute("SELECT COUNT(*) FROM district_land_summary").fetchone()[0]
    m_count = cursor.execute("SELECT COUNT(*) FROM mutation_summary").fetchone()[0]

    print(f"\n--- Summary Table Row Counts ---")
    print(f"Village Parcel Summaries:  {v_count}")
    print(f"District Land Summaries:   {d_count}")
    print(f"Mutation Summaries:        {m_count}")

    conn.close()
    print("\n[SUCCESS] Reindex & precompute refresh completed.")

if __name__ == "__main__":
    rebuild()
