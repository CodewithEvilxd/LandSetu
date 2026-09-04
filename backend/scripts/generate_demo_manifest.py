"""
LandSetu: Dynamic Real-Parcel Demo Manifest Generator
Queries the live ingested database to discover valid parcels with verified provenance,
cryptographic checksums, and cadastral geometries.
Outputs: backend/data/processed/DEMO_PARCEL_MANIFEST.json
"""

import sqlite3
import json
import os

DB_PATH = "backend/data/landsetu.db"
OUTPUT_PATH = "backend/data/processed/DEMO_PARCEL_MANIFEST.json"

def generate_demo_manifest():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    # Query 1 Delhi parcel with geometry and evidence
    cursor.execute("""
        SELECT p.parcel_uid, p.state, p.district, p.tehsil, p.village, p.native_identifier,
               p.source_id, p.source_record_id, g.geometry_id, e.checksum_sha256
        FROM land_parcels p
        JOIN parcel_geometries g ON p.parcel_uid = g.parcel_uid
        JOIN parcel_evidence e ON p.parcel_uid = e.parcel_uid
        WHERE p.state = 'Delhi'
        LIMIT 1
    """)
    delhi_row = cursor.fetchone()

    # Query 1 Haryana parcel with geometry and evidence
    cursor.execute("""
        SELECT p.parcel_uid, p.state, p.district, p.tehsil, p.village, p.native_identifier,
               p.source_id, p.source_record_id, g.geometry_id, e.checksum_sha256
        FROM land_parcels p
        JOIN parcel_geometries g ON p.parcel_uid = g.parcel_uid
        JOIN parcel_evidence e ON p.parcel_uid = e.parcel_uid
        WHERE p.state = 'Haryana'
        LIMIT 1
    """)
    haryana_row = cursor.fetchone()

    # Query 1 Bihar parcel with geometry and evidence
    cursor.execute("""
        SELECT p.parcel_uid, p.state, p.district, p.tehsil, p.village, p.native_identifier,
               p.source_id, p.source_record_id, g.geometry_id, e.checksum_sha256
        FROM land_parcels p
        JOIN parcel_geometries g ON p.parcel_uid = g.parcel_uid
        JOIN parcel_evidence e ON p.parcel_uid = e.parcel_uid
        WHERE p.state = 'Bihar'
        LIMIT 1
    """)
    bihar_row = cursor.fetchone()

    conn.close()

    if not delhi_row:
        raise RuntimeError("FAIL-CLOSED: No verified Delhi parcel with geometry and evidence found in database.")
    if not haryana_row:
        raise RuntimeError("FAIL-CLOSED: No verified Haryana parcel with geometry and evidence found in database.")
    if not bihar_row:
        raise RuntimeError("FAIL-CLOSED: No verified Bihar parcel with geometry and evidence found in database.")

    manifest = {
        "generated_by": "LandSetu Dynamic Demo Parcel Manifest Generator",
        "description": "Verified real parcels dynamically queried from live ingested database for e2e demo and testing.",
        "delhi_demo_parcel": {
            "parcel_uid": delhi_row[0],
            "state": delhi_row[1],
            "district": delhi_row[2],
            "tehsil": delhi_row[3],
            "village": delhi_row[4],
            "native_identifier": delhi_row[5],
            "source_id": delhi_row[6],
            "source_record_id": delhi_row[7],
            "geometry_id": delhi_row[8],
            "checksum_sha256": delhi_row[9],
            "geometry_available": True
        },
        "haryana_demo_parcel": {
            "parcel_uid": haryana_row[0],
            "state": haryana_row[1],
            "district": haryana_row[2],
            "tehsil": haryana_row[3],
            "village": haryana_row[4],
            "native_identifier": haryana_row[5],
            "source_id": haryana_row[6],
            "source_record_id": haryana_row[7],
            "geometry_id": haryana_row[8],
            "checksum_sha256": haryana_row[9],
            "geometry_available": True
        },
        "bihar_demo_parcel": {
            "parcel_uid": bihar_row[0],
            "state": bihar_row[1],
            "district": bihar_row[2],
            "tehsil": bihar_row[3],
            "village": bihar_row[4],
            "native_identifier": bihar_row[5],
            "source_id": bihar_row[6],
            "source_record_id": bihar_row[7],
            "geometry_id": bihar_row[8],
            "checksum_sha256": bihar_row[9],
            "geometry_available": True
        }
    }

    os.makedirs(os.path.dirname(os.path.abspath(OUTPUT_PATH)), exist_ok=True)
    with open(OUTPUT_PATH, "w", encoding="utf-8") as f:
        json.dump(manifest, f, indent=2, ensure_ascii=False)

    print(f"[Demo Manifest Generated] Successfully generated {OUTPUT_PATH}")
    print(f" -> Delhi Demo Parcel: {manifest['delhi_demo_parcel']['parcel_uid']} (Khasra {manifest['delhi_demo_parcel']['native_identifier']})")
    print(f" -> Haryana Demo Parcel: {manifest['haryana_demo_parcel']['parcel_uid']} (Khasra {manifest['haryana_demo_parcel']['native_identifier']})")
    print(f" -> Bihar Demo Parcel: {manifest['bihar_demo_parcel']['parcel_uid']} (Khesra {manifest['bihar_demo_parcel']['native_identifier']})")
    return manifest

if __name__ == "__main__":
    generate_demo_manifest()

