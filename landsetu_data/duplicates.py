"""
LandSetu Duplicate & Collision Scanner CLI
Scans for duplicate composite identifiers, primary key conflicts, and ambiguous village mappings.
"""

import os
import sys
import sqlite3

PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
DB_PATH = os.path.join(PROJECT_ROOT, "backend", "data", "landsetu.db")

def check_duplicates():
    print("=======================================================")
    print(" LANDSETU DUPLICATE & COLLISION SCANNER")
    print("=======================================================")

    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    # 1. Check duplicate parcel_uid in land_parcels
    dups_uid = cursor.execute("""
        SELECT parcel_uid, COUNT(*) as c
        FROM land_parcels
        GROUP BY parcel_uid
        HAVING c > 1
    """).fetchall()

    print(f"\n1. Duplicate Parcel UIDs in land_parcels: {len(dups_uid)}")
    for d in dups_uid:
        print(f"   [COLLISION] {d[0]} repeated {d[1]} times")

    # 2. Check identical (state, village, native_identifier) with different UIDs
    dups_native = cursor.execute("""
        SELECT state, village, native_identifier, COUNT(DISTINCT parcel_uid) as c
        FROM land_parcels
        GROUP BY state, village, native_identifier
        HAVING c > 1
    """).fetchall()

    print(f"\n2. Ambiguous Native Identifiers in Same Village: {len(dups_native)}")
    for d in dups_native:
        print(f"   [AMBIGUOUS] {d[0]} -> {d[1]} -> Khasra/Khesra {d[2]} has {d[3]} distinct UIDs")

    # 3. Check duplicate parcel_geometries
    dups_geom = cursor.execute("""
        SELECT parcel_uid, COUNT(*) as c
        FROM parcel_geometries
        GROUP BY parcel_uid
        HAVING c > 1
    """).fetchall()

    print(f"\n3. Duplicate Geometries per Parcel UID: {len(dups_geom)}")

    conn.close()

    clean = len(dups_uid) == 0 and len(dups_native) == 0 and len(dups_geom) == 0
    print("\n-------------------------------------------------------")
    print(f"Deduplication Health Status: {'CLEAN - ZERO DUPLICATES' if clean else 'COLLISIONS DETECTED'}")

if __name__ == "__main__":
    check_duplicates()
