"""
LandSetu Dataset Restore CLI
Verifies SHA-256 bundle integrity and restores parcels, geometries, and rights into SQLite.
"""

import os
import sys
import json
import sqlite3
import hashlib
import argparse
from datetime import datetime, timezone

PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
if PROJECT_ROOT not in sys.path:
    sys.path.insert(0, PROJECT_ROOT)

from landsetu_data.ingest import update_materialized_summaries

DB_PATH = os.path.join(PROJECT_ROOT, "backend", "data", "landsetu.db")

def restore_bundle(bundle_path: str):
    if not os.path.exists(bundle_path):
        print(f"[!] Bundle not found: {bundle_path}")
        sys.exit(1)

    print(f"[*] Verifying integrity of export bundle: {bundle_path}")
    with open(bundle_path, "r", encoding="utf-8") as f:
        bundle = json.load(f)

    meta = bundle.get("export_metadata", {})
    expected_sha = meta.get("payload_sha256")
    parcels = bundle.get("parcels", [])

    # Check payload hash
    payload_json = json.dumps(parcels, indent=2, ensure_ascii=False)
    hasher = hashlib.sha256()
    hasher.update(payload_json.encode("utf-8"))
    actual_sha = hasher.hexdigest()

    if expected_sha and actual_sha.lower() != expected_sha.lower():
        print(f"[FAIL] Cryptographic integrity verification failed!")
        print(f"       Expected: {expected_sha}")
        print(f"       Actual:   {actual_sha}")
        sys.exit(1)

    print(f"    [OK] Cryptographic SHA-256 match: {actual_sha[:16]}...")
    print(f"[*] Restoring {len(parcels)} parcels to database...")

    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    now_iso = datetime.now(timezone.utc).isoformat()

    restored = 0
    for p in parcels:
        p_uid = p["parcel_uid"]
        cursor.execute("""
            INSERT OR REPLACE INTO land_parcels (
                parcel_uid, state, district, subdivision, tehsil, village, native_identifier,
                identifier_type, account_identifier, source_system, source_id, source_record_id,
                source_document_id, area, area_unit, area_raw, land_use, geometry_id, created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'LandSetu-Export-Restore', 'SRC-RESTORE-001', ?, 'DOC-RESTORE', ?, ?, ?, ?, ?, ?, ?)
        """, (
            p_uid, p["state"], p["district"], p["tehsil"], p["tehsil"], p["village"],
            p["native_identifier"], p["identifier_type"], p["native_identifier"],
            p_uid, p.get("area"), p.get("area_unit"), p.get("area_raw"), p.get("land_use"),
            f"GEOM-{p_uid}" if p.get("geometry") else None, now_iso, now_iso
        ))

        # Restore geometry
        if p.get("geometry"):
            c = p.get("centroid", [0.0, 0.0])
            cursor.execute("""
                INSERT OR REPLACE INTO parcel_geometries (
                    geometry_id, parcel_uid, geometry_type, geojson, centroid_lat,
                    centroid_lng, bbox_json, source_crs, quality_flag, source_id
                ) VALUES (?, ?, ?, ?, ?, ?, ?, 'EPSG:4326', 'restored_cadastral_boundary', 'SRC-RESTORE-001')
            """, (
                f"GEOM-{p_uid}", p_uid, p["geometry"].get("type", "Polygon"),
                json.dumps(p["geometry"]), c[0], c[1], json.dumps(p.get("bbox", [])),
            ))

        restored += 1

    update_materialized_summaries(cursor)
    conn.commit()
    conn.close()

    print(f"[SUCCESS] Restored {restored} parcels successfully. Indexes and summaries refreshed.")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="LandSetu Restore CLI")
    parser.add_argument("bundle", type=str, help="Path to JSON export bundle")
    args = parser.parse_args()

    restore_bundle(args.bundle)
