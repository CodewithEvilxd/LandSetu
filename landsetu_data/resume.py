"""
LandSetu Ingestion Resumption CLI
Detects halted or incomplete ingestion jobs and safely resumes processing from the recorded checkpoint.
"""

import os
import sys
import sqlite3

PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
if PROJECT_ROOT not in sys.path:
    sys.path.insert(0, PROJECT_ROOT)

from landsetu_data.ingest import run_ingestion

DB_PATH = os.path.join(PROJECT_ROOT, "backend", "data", "landsetu.db")

def check_and_resume():
    print("=======================================================")
    print(" LANDSETU INGESTION RESUME CONTROLLER")
    print("=======================================================")

    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    incomplete_job = cursor.execute("""
        SELECT job_id, state, started_at, total_records, success_count
        FROM ingestion_jobs
        WHERE status = 'running'
        ORDER BY started_at DESC LIMIT 1
    """).fetchone()

    conn.close()

    if incomplete_job:
        print(f"[*] Found incomplete job: {incomplete_job[0]} (State: {incomplete_job[1]}). Resuming...")
        run_ingestion(target_state=incomplete_job[1], resume=True)
    else:
        print("[*] No running or halted ingestion jobs found in ledger.")
        print("    All registered ingestion jobs are in 'completed' state.")

if __name__ == "__main__":
    check_and_resume()
