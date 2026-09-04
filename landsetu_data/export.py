"""
LandSetu Dataset Export CLI
Exports land records, geometries, rights, and provenance into a portable bundle with SHA-256 manifest.
"""

import os
import sys
import json
import sqlite3
import hashlib
import argparse
from datetime import datetime, timezone

PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
DB_PATH = os.path.join(PROJECT_ROOT, "backend", "data", "landsetu.db")
EXPORT_DIR = os.path.join(PROJECT_ROOT, "backend", "data", "exports")

def export_data(state: str = "all", output_filename: str = None):
    print(f"[*] Exporting dataset for state: {state.upper()}")
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    state_filter = ""
    params = []
    if state.lower() != "all":
        state_filter = "WHERE p.state = ? COLLATE NOCASE"
        params.append(state)

    parcels = cursor.execute(f"""
        SELECT p.parcel_uid, p.state, p.district, p.tehsil, p.village, p.native_identifier,
               p.identifier_type, p.area, p.area_unit, p.area_raw, p.land_use,
               g.geojson, g.centroid_lat, g.centroid_lng, g.bbox_json
        FROM land_parcels p
        LEFT JOIN parcel_geometries g ON p.parcel_uid = g.parcel_uid
        {state_filter}
        ORDER BY p.parcel_uid
    """, params).fetchall()

    records = []
    for p in parcels:
        p_uid = p[0]
        # Query rights
        rights = cursor.execute("SELECT rights_holder_name, rights_type, share_fraction, parentage_or_details FROM parcel_rights WHERE parcel_uid = ?", (p_uid,)).fetchall()
        # Query mutations
        mutations = cursor.execute("SELECT mutation_number, mutation_date, mutation_type, status, order_reference FROM parcel_mutations WHERE parcel_uid = ?", (p_uid,)).fetchall()
        # Query evidence
        evidence = cursor.execute("SELECT field_name, field_value, source_id, checksum_sha256 FROM parcel_evidence WHERE parcel_uid = ?", (p_uid,)).fetchall()

        records.append({
            "parcel_uid": p_uid,
            "state": p[1],
            "district": p[2],
            "tehsil": p[3],
            "village": p[4],
            "native_identifier": p[5],
            "identifier_type": p[6],
            "area": p[7],
            "area_unit": p[8],
            "area_raw": p[9],
            "land_use": p[10],
            "geometry": json.loads(p[11]) if p[11] else None,
            "centroid": [p[12], p[13]] if p[12] is not None else None,
            "bbox": json.loads(p[14]) if p[14] else None,
            "rights_holders": [{"name": r[0], "type": r[1], "share": r[2], "details": r[3]} for r in rights],
            "mutations": [{"number": m[0], "date": m[1], "type": m[2], "status": m[3], "order": m[4]} for m in mutations],
            "evidence": [{"field": e[0], "value": e[1], "source_id": e[2], "sha256": e[3]} for e in evidence]
        })

    conn.close()

    os.makedirs(EXPORT_DIR, exist_ok=True)
    if not output_filename:
        output_filename = f"landsetu_export_{state.lower()}_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
    out_path = os.path.join(EXPORT_DIR, output_filename)

    payload_json = json.dumps(records, indent=2, ensure_ascii=False)
    hasher = hashlib.sha256()
    hasher.update(payload_json.encode("utf-8"))
    payload_sha = hasher.hexdigest()

    export_bundle = {
        "export_metadata": {
            "version": "2.0.0",
            "exported_at": datetime.now(timezone.utc).isoformat(),
            "target_state": state,
            "total_parcels": len(records),
            "payload_sha256": payload_sha
        },
        "parcels": records
    }

    with open(out_path, "w", encoding="utf-8") as f:
        json.dump(export_bundle, f, indent=2, ensure_ascii=False)

    print(f"[SUCCESS] Exported {len(records)} parcels to {out_path}")
    print(f"          SHA-256: {payload_sha}")
    return out_path

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="LandSetu Export CLI")
    parser.add_argument("--state", type=str, default="all", help="State to export")
    parser.add_argument("--output", type=str, default=None, help="Output filename")
    args = parser.parse_args()

    export_data(state=args.state, output_filename=args.output)
