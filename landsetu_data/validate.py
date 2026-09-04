"""
LandSetu Data Quality Validation Engine
Performs rigorous structural, geometric, and provenance audits on ingested parcels.
Outputs:
- backend/data/processed/DELHI_DATA_QUALITY.json
- backend/data/processed/HARYANA_DATA_QUALITY.json
- backend/data/processed/BIHAR_DATA_QUALITY.json
"""

import os
import sys
import json
import sqlite3
from datetime import datetime, timezone

PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
DB_PATH = os.path.join(PROJECT_ROOT, "backend", "data", "landsetu.db")
PROCESSED_DIR = os.path.join(PROJECT_ROOT, "backend", "data", "processed")

def validate_state_parcels(state: str) -> dict:
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    parcels = cursor.execute("""
        SELECT p.parcel_uid, p.native_identifier, p.state, p.district, p.tehsil, p.village,
               p.area, p.area_unit, p.area_raw, p.geometry_id, g.geojson, g.bbox_json
        FROM land_parcels p
        LEFT JOIN parcel_geometries g ON p.parcel_uid = g.parcel_uid
        WHERE p.state = ? COLLATE NOCASE
    """, (state,)).fetchall()

    total_parcels = len(parcels)
    valid_parcels = 0
    geom_valid = 0
    area_grounded = 0
    provenance_grounded = 0
    issues = []

    for p in parcels:
        p_uid = p[0]
        native_id = p[1]
        area = p[6]
        geom_id = p[9]
        geojson_str = p[10]

        parcel_issues = []

        # 1. Identifier check
        if not native_id:
            parcel_issues.append("Missing native identifier")

        # 2. Area check
        if area is not None and area > 0:
            area_grounded += 1
        else:
            parcel_issues.append("Missing or non-positive area")

        # 3. Geometry check
        if geom_id and geojson_str:
            try:
                geom = json.loads(geojson_str)
                coords = geom.get("coordinates", [])
                if coords:
                    geom_valid += 1
                else:
                    parcel_issues.append("Empty geometry coordinates")
            except Exception:
                parcel_issues.append("Invalid GeoJSON geometry")
        else:
            parcel_issues.append("No linked cadastral geometry")

        # 4. Provenance check
        ev_count = cursor.execute("""
            SELECT COUNT(*) FROM parcel_evidence WHERE parcel_uid = ?
        """, (p_uid,)).fetchone()[0]

        if ev_count > 0:
            provenance_grounded += 1
        else:
            parcel_issues.append("Missing field-level provenance evidence")

        # Check validity
        if len(parcel_issues) == 0:
            valid_parcels += 1
        else:
            issues.append({"parcel_uid": p_uid, "issues": parcel_issues})

    conn.close()

    quality_score = 0.0
    if total_parcels > 0:
        score_comp = (
            (valid_parcels / total_parcels) * 0.4 +
            (geom_valid / total_parcels) * 0.3 +
            (area_grounded / total_parcels) * 0.15 +
            (provenance_grounded / total_parcels) * 0.15
        )
        quality_score = round(score_comp * 100.0, 2)

    report = {
        "state": state,
        "audited_at": datetime.now(timezone.utc).isoformat(),
        "total_parcels_audited": total_parcels,
        "valid_parcels_count": valid_parcels,
        "geometry_valid_count": geom_valid,
        "area_grounded_count": area_grounded,
        "provenance_verified_count": provenance_grounded,
        "composite_quality_score": quality_score,
        "status": "PASSED" if quality_score >= 80.0 else "FLAGGED",
        "validation_issues_count": len(issues),
        "issues": issues
    }

    out_file = os.path.join(PROCESSED_DIR, f"{state.upper()}_DATA_QUALITY.json")
    with open(out_file, "w", encoding="utf-8") as f:
        json.dump(report, f, indent=2, ensure_ascii=False)

    print(f"[Data Quality Validated] {state:<8}: Score {quality_score}% | Valid: {valid_parcels}/{total_parcels} -> {out_file}")
    return report

def validate_all():
    print("=======================================================")
    print(" LANDSETU OFFICIAL STATE DATA QUALITY VALIDATION")
    print("=======================================================")
    for st in ["Delhi", "Haryana", "Bihar"]:
        validate_state_parcels(st)

if __name__ == "__main__":
    validate_all()
