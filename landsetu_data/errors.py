"""
LandSetu Ingestion Error Ledger Inspector CLI
Lists all recorded ingestion job errors, file exceptions, and checkpoint halts.
"""

import os
import sys
import sqlite3

PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
DB_PATH = os.path.join(PROJECT_ROOT, "backend", "data", "landsetu.db")

def inspect_errors():
    print("=======================================================")
    print(" LANDSETU INGESTION ERROR & FAILURE LEDGER")
    print("=======================================================")

    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    # 1. Failed or degraded jobs
    failed_jobs = cursor.execute("""
        SELECT job_id, state, status, started_at, error_count, error_log
        FROM ingestion_jobs
        WHERE error_count > 0 OR status != 'completed'
        ORDER BY started_at DESC
    """).fetchall()

    print(f"\n1. Ingestion Jobs with Errors or Incomplete Status: {len(failed_jobs)}")
    for j in failed_jobs:
        print(f"   Job: {j[0]} | State: {j[1]} | Status: {j[2]} | Errors: {j[4]} | Log: {j[5] or 'None'}")

    # 2. Failed job files
    failed_files = cursor.execute("""
        SELECT id, job_id, file_path, status, error_message
        FROM ingestion_job_files
        WHERE status != 'completed'
    """).fetchall()

    print(f"\n2. Incomplete or Failed Ingestion Files: {len(failed_files)}")
    for f in failed_files:
        print(f"   File: {f[2]} | Job: {f[1]} | Status: {f[3]} | Error: {f[4] or 'N/A'}")

    conn.close()

if __name__ == "__main__":
    inspect_errors()
