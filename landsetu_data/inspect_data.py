"""
LandSetu Dataset & Ingestion Inspector CLI
Inspects active database tables, ingested records per state, CAS storage objects, and checkpoints.
"""

import os
import sys
import sqlite3
import json

PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
DB_PATH = os.path.join(PROJECT_ROOT, "backend", "data", "landsetu.db")

def inspect_database():
    if not os.path.exists(DB_PATH):
        print(f"[!] Database file does not exist at {DB_PATH}")
        sys.exit(1)

    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    print("=======================================================")
    print(" LANDSETU DATABASE & INGESTION INSPECTION REPORT")
    print("=======================================================")

    # 1. State parcel counts
    print("\n--- Ingested Land Parcels by State ---")
    rows = cursor.execute("""
        SELECT state, COUNT(*) as total_parcels,
               SUM(CASE WHEN geometry_id IS NOT NULL THEN 1 ELSE 0 END) as with_geom,
               SUM(CASE WHEN area IS NOT NULL THEN 1 ELSE 0 END) as with_area,
               COUNT(DISTINCT village) as villages_count
        FROM land_parcels
        GROUP BY state
    """).fetchall()

    for r in rows:
        print(f"State: {r[0]:<10} | Total Parcels: {r[1]:<4} | Cadastral Geom: {r[2]:<4} | Area Grounded: {r[3]:<4} | Villages: {r[4]}")

    # 2. Cadastral map layers
    print("\n--- Cadastral Map Layers ---")
    map_rows = cursor.execute("""
        SELECT map_id, state, village, feature_count, survey_year, checksum_sha256
        FROM cadastral_maps
    """).fetchall()
    for m in map_rows:
        print(f"Map: {m[0]} | State: {m[1]} | Village: {m[2]} | Features: {m[3]} | Survey Year: {m[4]}")

    # 3. Administrative boundary hierarchy
    print("\n--- Administrative Boundary Hierarchy ---")
    v_rows = cursor.execute("""
        SELECT s.name as state, d.name as district, t.name as tehsil, v.name as village
        FROM villages v
        JOIN tehsils t ON v.tehsil_id = t.id
        JOIN subdivisions sub ON t.subdivision_id = sub.id
        JOIN districts d ON sub.district_id = d.id
        JOIN states s ON d.state_code = s.code
    """).fetchall()
    for v in v_rows:
        print(f"  {v[0]} -> {v[1]} -> {v[2]} -> {v[3]}")

    # 4. Ingestion Jobs
    print("\n--- Recent Ingestion Jobs ---")
    jobs = cursor.execute("""
        SELECT job_id, state, status, started_at, total_records, success_count, error_count
        FROM ingestion_jobs
        ORDER BY started_at DESC LIMIT 5
    """).fetchall()
    for j in jobs:
        print(f"Job: {j[0]} | State: {j[1]} | Status: {j[2]} | Processed: {j[5]}/{j[4]} | Errors: {j[6]}")

    # 5. CAS Storage Objects
    print("\n--- Storage Objects (CAS Ledger) ---")
    cas_count = cursor.execute("SELECT COUNT(*), SUM(size_bytes) FROM storage_objects").fetchone()
    print(f"Total CAS Objects: {cas_count[0]} | Total Storage Size: {cas_count[1] or 0} bytes")

    # 6. Provenance Evidence Entries
    ev_count = cursor.execute("SELECT COUNT(*) FROM parcel_evidence").fetchone()[0]
    print(f"Total Field-Level Provenance Records: {ev_count}")

    conn.close()

if __name__ == "__main__":
    inspect_database()
