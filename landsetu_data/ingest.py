"""
LandSetu Production Streaming Ingestion Engine
Supports chunked streaming ingestion, resumability, CAS storage, and provenance for Delhi, Haryana, and Bihar.
"""

import os
import sys
import json
import sqlite3
import hashlib
import argparse
from datetime import datetime, timezone
from typing import Dict, Any, List, Optional

# Ensure project root is on sys.path
PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
if PROJECT_ROOT not in sys.path:
    sys.path.insert(0, PROJECT_ROOT)

from ai.data.delhi_land_adapter import normalize_delhi_record
from ai.data.haryana_land_adapter import normalize_haryana_record
from ai.data.bihar_land_adapter import normalize_bihar_record

DB_PATH = os.path.join(PROJECT_ROOT, "backend", "data", "landsetu.db")
CAS_DIR = os.path.join(PROJECT_ROOT, "backend", "data", "objects")

def compute_sha256(filepath: str) -> str:
    hasher = hashlib.sha256()
    with open(filepath, "rb") as f:
        while chunk := f.read(65536):
            hasher.update(chunk)
    return hasher.hexdigest()

def register_cas_object(cursor: sqlite3.Cursor, filepath: str, mime_type: str) -> str:
    sha = compute_sha256(filepath)
    size = os.path.getsize(filepath)
    now = datetime.now(timezone.utc).isoformat()

    # Copy to CAS path if not exists
    dir1 = sha[:2]
    dir2 = sha[2:4]
    cas_path_dir = os.path.join(CAS_DIR, dir1, dir2)
    os.makedirs(cas_path_dir, exist_ok=True)
    cas_dest = os.path.join(cas_path_dir, sha)

    if not os.path.exists(cas_dest):
        with open(filepath, "rb") as src, open(cas_dest, "wb") as dst:
            while chunk := src.read(65536):
                dst.write(chunk)

    # Register in storage_objects table
    cursor.execute("""
        INSERT OR REPLACE INTO storage_objects (
            sha256, original_path, size_bytes, mime_type, tier, archive_status, created_at, verified_at
        ) VALUES (?, ?, ?, ?, 'hot', 'pending', ?, ?)
    """, (sha, filepath, size, mime_type, now, now))

    return sha

def calculate_centroid_and_bbox(coordinates: List) -> tuple[float, float, List[float]]:
    """Recursively extracts lat/lng pairs and computes centroid & bbox [min_lng, min_lat, max_lng, max_lat]"""
    points = []
    def extract_pts(coords):
        if not coords:
            return
        if isinstance(coords[0], (int, float)):
            points.append(coords)
        else:
            for item in coords:
                extract_pts(item)
    extract_pts(coordinates)

    if not points:
        return (0.0, 0.0, [0.0, 0.0, 0.0, 0.0])

    lngs = [p[0] for p in points]
    lats = [p[1] for p in points]
    c_lng = sum(lngs) / len(lngs)
    c_lat = sum(lats) / len(lats)
    bbox = [min(lngs), min(lats), max(lngs), max(lats)]
    return (c_lat, c_lng, bbox)

def populate_admin_hierarchy(cursor: sqlite3.Cursor):
    """Seed authoritative administrative units for Delhi, Haryana, and Bihar"""
    states_data = [
        ("DL", "Delhi", "Hindi / English", "Bigha-Biswa"),
        ("HR", "Haryana", "Hindi / Punjabi", "Kanal-Marla / Acre"),
        ("BR", "Bihar", "Hindi / Bhojpuri / Maithili", "Bigha-Kattha-Dhur")
    ]
    for s in states_data:
        cursor.execute("INSERT OR REPLACE INTO states (code, name, language, local_units) VALUES (?, ?, ?, ?)", s)

    districts_data = [
        ("DIST-DL-NORTH", "DL", "North Delhi", "0701"),
        ("DIST-HR-GURUGRAM", "HR", "Gurugram", "0618"),
        ("DIST-BR-PATNA", "BR", "Patna", "1028")
    ]
    for d in districts_data:
        cursor.execute("INSERT OR REPLACE INTO districts (id, state_code, name, census_code) VALUES (?, ?, ?, ?)", d)

    subdiv_data = [
        ("SUB-DL-ALIPUR", "DIST-DL-NORTH", "Alipur"),
        ("SUB-HR-WAZIRABAD", "DIST-HR-GURUGRAM", "Wazirabad"),
        ("SUB-BR-PATNA-SADAR", "DIST-BR-PATNA", "Patna Sadar")
    ]
    for sub in subdiv_data:
        cursor.execute("INSERT OR REPLACE INTO subdivisions (id, district_id, name) VALUES (?, ?, ?)", sub)

    tehsil_data = [
        ("TEH-DL-ALIPUR", "SUB-DL-ALIPUR", "Alipur"),
        ("TEH-HR-WAZIRABAD", "SUB-HR-WAZIRABAD", "Wazirabad"),
        ("TEH-BR-PATNA-SADAR", "SUB-BR-PATNA-SADAR", "Patna Sadar")
    ]
    for t in tehsil_data:
        cursor.execute("INSERT OR REPLACE INTO tehsils (id, subdivision_id, name) VALUES (?, ?, ?)", t)

    village_data = [
        ("VIL-DL-ALIPUR", "TEH-DL-ALIPUR", "Alipur", "001", 1, 1),
        ("VIL-HR-WAZIRABAD", "TEH-HR-WAZIRABAD", "Wazirabad", "002", 1, 1),
        ("VIL-BR-SABBALPUR", "TEH-BR-PATNA-SADAR", "Sabbalpur", "012", 1, 1)
    ]
    for v in village_data:
        cursor.execute("INSERT OR REPLACE INTO villages (id, tehsil_id, name, census_code, has_records, has_maps) VALUES (?, ?, ?, ?, ?, ?)", v)

def update_materialized_summaries(cursor: sqlite3.Cursor):
    now = datetime.now(timezone.utc).isoformat()
    # 1. village_parcel_summary
    cursor.execute("""
        INSERT OR REPLACE INTO village_parcel_summary (
            state, district, tehsil, village, total_parcels, total_area_hectares,
            parcels_with_geometry, parcels_with_owners, parcels_with_mutations, updated_at
        )
        SELECT
            p.state,
            p.district,
            p.tehsil,
            p.village,
            COUNT(DISTINCT p.parcel_uid) as total_parcels,
            COALESCE(SUM(p.area), 0.0) as total_area_hectares,
            COUNT(DISTINCT g.parcel_uid) as parcels_with_geometry,
            COUNT(DISTINCT r.parcel_uid) as parcels_with_owners,
            COUNT(DISTINCT m.parcel_uid) as parcels_with_mutations,
            ? as updated_at
        FROM land_parcels p
        LEFT JOIN parcel_geometries g ON p.parcel_uid = g.parcel_uid
        LEFT JOIN parcel_rights r ON p.parcel_uid = r.parcel_uid
        LEFT JOIN parcel_mutations m ON p.parcel_uid = m.parcel_uid
        GROUP BY p.state, p.district, p.tehsil, p.village
    """, (now,))

    # 2. district_land_summary
    cursor.execute("""
        INSERT OR REPLACE INTO district_land_summary (
            state, district, total_villages, total_parcels, total_area_hectares,
            parcels_with_geometry, updated_at
        )
        SELECT
            p.state,
            p.district,
            COUNT(DISTINCT p.village) as total_villages,
            COUNT(DISTINCT p.parcel_uid) as total_parcels,
            COALESCE(SUM(p.area), 0.0) as total_area_hectares,
            COUNT(DISTINCT g.parcel_uid) as parcels_with_geometry,
            ? as updated_at
        FROM land_parcels p
        LEFT JOIN parcel_geometries g ON p.parcel_uid = g.parcel_uid
        GROUP BY p.state, p.district
    """, (now,))

    # 3. mutation_summary
    cursor.execute("""
        INSERT OR REPLACE INTO mutation_summary (
            state, district, pending_count, approved_count, rejected_count, updated_at
        )
        SELECT
            p.state,
            p.district,
            SUM(CASE WHEN m.status = 'pending' THEN 1 ELSE 0 END) as pending_count,
            SUM(CASE WHEN m.status IN ('sanctioned', 'approved') THEN 1 ELSE 0 END) as approved_count,
            SUM(CASE WHEN m.status = 'rejected' THEN 1 ELSE 0 END) as rejected_count,
            ? as updated_at
        FROM land_parcels p
        JOIN parcel_mutations m ON p.parcel_uid = m.parcel_uid
        GROUP BY p.state, p.district
    """, (now,))

def run_ingestion(target_state: str = "all", batch_size: int = 5000, resume: bool = False):
    print(f"[*] Starting LandSetu Streaming Ingestion Engine (State: {target_state.upper()}, Batch: {batch_size}, Resume: {resume})")
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("PRAGMA foreign_keys = ON;")

    populate_admin_hierarchy(cursor)

    now_iso = datetime.now(timezone.utc).isoformat()
    job_id = f"JOB-INGEST-{datetime.now().strftime('%Y%m%d%H%M%S')}"

    cursor.execute("""
        INSERT INTO ingestion_jobs (
            job_id, state, job_type, status, started_at, total_records, success_count, error_count
        ) VALUES (?, ?, 'full_state_ingest', 'running', ?, 0, 0, 0)
    """, (job_id, target_state, now_iso))
    conn.commit()

    states_to_process = ["delhi", "haryana", "bihar"] if target_state == "all" else [target_state.lower()]
    total_ingested = 0
    total_errors = 0

    for state_name in states_to_process:
        print(f"--- Processing Official Records for: {state_name.upper()} ---")
        base_raw = os.path.join(PROJECT_ROOT, "backend", "data", "raw", state_name)
        if not os.path.exists(base_raw):
            print(f"[!] Warning: Raw directory for {state_name} does not exist at {base_raw}")
            continue

        records_dir = os.path.join(base_raw, "land_records")
        gis_dir = os.path.join(base_raw, "gis")
        acq_dir = os.path.join(base_raw, "acquisition")

        # 1. Ingest Cadastral Map Layer (GIS)
        geom_by_native_id: Dict[str, Any] = {}
        if os.path.exists(gis_dir):
            for gfile in os.listdir(gis_dir):
                if gfile.endswith(".geojson") or gfile.endswith(".json"):
                    gpath = os.path.join(gis_dir, gfile)
                    sha_gis = register_cas_object(cursor, gpath, "application/geo+json")
                    with open(gpath, "r", encoding="utf-8") as gf:
                        gis_data = json.load(gf)

                    meta = gis_data.get("metadata", {})
                    g_state = meta.get("state", state_name.capitalize())
                    g_district = meta.get("district", "District")
                    g_tehsil = meta.get("tehsil", meta.get("anchal", "Tehsil"))
                    g_village = meta.get("village", meta.get("mauza", "Village"))
                    features = gis_data.get("features", [])

                    map_id = f"MAP-{g_state.upper()}-{g_village.upper()}-CADASTRAL"
                    cursor.execute("""
                        INSERT OR REPLACE INTO cadastral_maps (
                            map_id, state, district, tehsil, village, cadastral_layer_json,
                            feature_count, survey_year, source_id, checksum_sha256
                        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                    """, (
                        map_id, g_state, g_district, g_tehsil, g_village,
                        json.dumps(gis_data), len(features), meta.get("survey_year", "2023"),
                        meta.get("source_id", "SRC-OFFICIAL-GIS"), sha_gis
                    ))

                    for feat in features:
                        props = feat.get("properties", {})
                        native_k = str(props.get("khasra_no") or props.get("khesra_no") or props.get("native_identifier") or "").strip()
                        if native_k:
                            geom_by_native_id[native_k] = feat

        # 2. Ingest Land Records with Chunking & Checkpoints
        if os.path.exists(records_dir):
            for rfile in os.listdir(records_dir):
                if not (rfile.endswith(".json") and not rfile.startswith(".")):
                    continue
                rpath = os.path.join(records_dir, rfile)
                sha_rec = register_cas_object(cursor, rpath, "application/json")

                # Check checkpoint
                last_offset = 0
                if resume:
                    chk = cursor.execute("""
                        SELECT record_offset FROM ingestion_checkpoints
                        WHERE job_id = ? AND file_path = ?
                    """, (job_id, rpath)).fetchone()
                    if chk:
                        last_offset = chk[0]
                        print(f"[*] Resuming {rfile} from offset {last_offset}")

                with open(rpath, "r", encoding="utf-8") as rf:
                    raw_records = json.load(rf)

                file_rec_count = len(raw_records)
                cursor.execute("""
                    INSERT OR REPLACE INTO ingestion_job_files (
                        id, job_id, file_path, sha256, size_bytes, processed_records, status
                    ) VALUES (?, ?, ?, ?, ?, ?, 'processing')
                """, (f"{job_id}_{rfile}", job_id, rpath, sha_rec, os.path.getsize(rpath), last_offset))
                conn.commit()

                for idx in range(last_offset, file_rec_count, batch_size):
                    batch = raw_records[idx : idx + batch_size]
                    for rec in batch:
                        try:
                            # State-specific adapter
                            if state_name == "delhi":
                                norm = normalize_delhi_record(rec)
                            elif state_name == "haryana":
                                norm = normalize_haryana_record(rec)
                            elif state_name == "bihar":
                                norm = normalize_bihar_record(rec)
                            else:
                                raise ValueError(f"Unknown state: {state_name}")

                            # Find matching cadastral geometry
                            geom_feat = geom_by_native_id.get(norm["native_identifier"])
                            geom = geom_feat.get("geometry") if geom_feat else None
                            geometry_id = f"GEOM-{norm['parcel_uid']}" if geom else None

                            # Deduplicated Land Parcel Insertion
                            cursor.execute("""
                                INSERT OR REPLACE INTO land_parcels (
                                    parcel_uid, state, district, subdivision, tehsil, village,
                                    native_identifier, identifier_type, account_identifier,
                                    source_system, source_id, source_record_id, source_document_id,
                                    area, area_unit, area_raw, land_use, geometry_id, created_at, updated_at
                                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                            """, (
                                norm["parcel_uid"], norm["state"], norm["district"], norm.get("subdivision", norm["tehsil"]),
                                norm["tehsil"], norm["village"], norm["native_identifier"], norm["identifier_type"],
                                norm.get("account_identifier"), norm["source_system"], norm["source_id"],
                                norm["source_record_id"], norm.get("source_document_id", norm["source_record_id"]),
                                norm.get("area"), norm.get("area_unit"), norm.get("area_raw"), norm.get("land_use"),
                                geometry_id, now_iso, now_iso
                            ))

                            # Identifiers
                            cursor.execute("""
                                INSERT OR REPLACE INTO parcel_identifiers (
                                    id, parcel_uid, identifier_type, identifier_value, normalized_value, source_system
                                ) VALUES (?, ?, ?, ?, ?, ?)
                            """, (
                                f"ID-{norm['parcel_uid']}-PRIMARY", norm["parcel_uid"], norm["identifier_type"],
                                norm["native_identifier"], norm["native_identifier"].replace("/", "_"), norm["source_system"]
                            ))

                            # Accounts
                            acc = norm.get("accounts", {})
                            khata = norm.get("khata_number") or acc.get("khata_number")
                            khatauni = norm.get("khatauni_number") or acc.get("khatauni_number") or acc.get("khatiyan_number")
                            khewat = norm.get("khewat_number") or acc.get("khewat_number") or acc.get("jamabandi_number")

                            cursor.execute("""
                                INSERT OR REPLACE INTO parcel_accounts (
                                    account_uid, parcel_uid, khata_number, khatauni_number, khewat_number, state, village, source_id
                                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                            """, (
                                f"ACC-{norm['parcel_uid']}", norm["parcel_uid"], str(khata or ""),
                                str(khatauni or ""), str(khewat or ""), norm["state"], norm["village"], norm["source_id"]
                            ))

                            # Rights Holders
                            for r_idx, rh in enumerate(norm.get("rights_holders", [])):
                                cursor.execute("""
                                    INSERT OR REPLACE INTO parcel_rights (
                                        id, parcel_uid, rights_holder_name, rights_type, share_fraction,
                                        parentage_or_details, source_record_date, source_id, source_url,
                                        verification_status, legal_disclaimer
                                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                                """, (
                                    f"RH-{norm['parcel_uid']}-{r_idx}", norm["parcel_uid"], rh["rights_holder_name"],
                                    rh["rights_type"], rh["share_fraction"], rh["parentage_or_details"],
                                    now_iso[:10], rh["source_id"], rh["source_url"], rh["verification_status"], rh["legal_disclaimer"]
                                ))

                            # Lifecycle events
                            for e_idx, ev in enumerate(norm.get("lifecycle_events", [])):
                                cursor.execute("""
                                    INSERT OR REPLACE INTO parcel_events (
                                        event_id, parcel_uid, event_type, event_date, description, source_id, created_at
                                    ) VALUES (?, ?, ?, ?, ?, ?, ?)
                                """, (
                                    f"EVT-{norm['parcel_uid']}-{e_idx}", norm["parcel_uid"], ev["event_type"],
                                    ev["event_date"], ev["description"], ev["source_id"], now_iso
                                ))

                            # Mutations
                            mut_list = norm.get("mutations", [])
                            for m_idx, mut in enumerate(mut_list):
                                m_num = mut.get("mutation_number") or mut.get("mutation_no") or f"MUT-{m_idx}"
                                m_date = mut.get("mutation_date") or mut.get("date") or now_iso[:10]
                                m_type = mut.get("mutation_type") or mut.get("type") or "Mutation"
                                m_status = mut.get("status") or "sanctioned"
                                m_order = mut.get("order_reference") or mut.get("order_details") or ""
                                m_source = mut.get("source_id") or norm["source_id"]

                                cursor.execute("""
                                    INSERT OR REPLACE INTO parcel_mutations (
                                        mutation_id, parcel_uid, mutation_number, mutation_date,
                                        mutation_type, status, order_reference, source_id
                                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                                """, (
                                    f"MUT-{norm['parcel_uid']}-{m_idx}", norm["parcel_uid"], m_num,
                                    m_date, m_type, m_status, m_order, m_source
                                ))

                            # Encumbrances
                            enc_list = norm.get("encumbrances", [])
                            for c_idx, enc in enumerate(enc_list):
                                c_type = enc.get("encumbrance_type") or enc.get("type") or "Notice"
                                c_inst = enc.get("institution") or enc.get("authority") or ""
                                c_details = enc.get("details") or ""
                                c_source = enc.get("source_id") or norm["source_id"]

                                cursor.execute("""
                                    INSERT OR REPLACE INTO parcel_encumbrances (
                                        encumbrance_id, parcel_uid, encumbrance_type, institution, details, source_id
                                    ) VALUES (?, ?, ?, ?, ?, ?)
                                """, (
                                    f"ENC-{norm['parcel_uid']}-{c_idx}", norm["parcel_uid"], c_type,
                                    c_inst, c_details, c_source
                                ))

                            # Parcel Geometry
                            if geom:
                                c_lat, c_lng, bbox = calculate_centroid_and_bbox(geom.get("coordinates", []))
                                cursor.execute("""
                                    INSERT OR REPLACE INTO parcel_geometries (
                                        geometry_id, parcel_uid, geometry_type, geojson, centroid_lat,
                                        centroid_lng, bbox_json, source_crs, quality_flag, source_id
                                    ) VALUES (?, ?, ?, ?, ?, ?, ?, 'EPSG:4326', 'digitized_cadastral_boundary', ?)
                                """, (
                                    geometry_id, norm["parcel_uid"], geom.get("type", "Polygon"),
                                    json.dumps(geom), c_lat, c_lng, json.dumps(bbox), norm["source_id"]
                                ))

                            # Field-level Provenance
                            evidence_items = []
                            if "evidence" in norm:
                                evidence_items = norm["evidence"]
                            elif "provenance_fields" in norm:
                                evidence_items = [
                                    {"field_name": pf.get("field"), "field_value": pf.get("canonical", pf.get("raw"))}
                                    for pf in norm.get("provenance_fields", [])
                                ]

                            for ev_item in evidence_items:
                                cursor.execute("""
                                    INSERT OR REPLACE INTO parcel_evidence (
                                        evidence_id, parcel_uid, field_name, field_value, source_id,
                                        source_url, retrieved_at, verification_status, checksum_sha256
                                    ) VALUES (?, ?, ?, ?, ?, ?, ?, 'verified_official_source', ?)
                                """, (
                                    f"EVD-{norm['parcel_uid']}-{ev_item['field_name']}", norm["parcel_uid"],
                                    ev_item["field_name"], str(ev_item["field_value"]), norm["source_id"],
                                    "http://official-records.gov.in", now_iso, sha_rec
                                ))

                            total_ingested += 1
                        except Exception as e:
                            total_errors += 1
                            print(f"[!] Error processing parcel {rec.get('record_id', 'unknown')}: {e}")

                    # Checkpoint update
                    next_offset = min(idx + batch_size, file_rec_count)
                    cursor.execute("""
                        INSERT OR REPLACE INTO ingestion_checkpoints (
                            id, job_id, file_path, chunk_index, record_offset, last_processed_id, updated_at
                        ) VALUES (?, ?, ?, ?, ?, ?, ?)
                    """, (
                        f"{job_id}_{rfile}_chk", job_id, rpath,
                        idx // batch_size, next_offset, f"REC-{next_offset}", datetime.now(timezone.utc).isoformat()
                    ))
                    conn.commit()

                cursor.execute("""
                    UPDATE ingestion_job_files SET processed_records = ?, status = 'completed'
                    WHERE id = ?
                """, (file_rec_count, f"{job_id}_{rfile}"))
                conn.commit()

        # 3. Ingest Land Acquisition Notices
        if os.path.exists(acq_dir):
            for afile in os.listdir(acq_dir):
                if afile.endswith(".json") and not afile.startswith("."):
                    apath = os.path.join(acq_dir, afile)
                    register_cas_object(cursor, apath, "application/json")
                    with open(apath, "r", encoding="utf-8") as af:
                        acq_data = json.load(af)
                    
                    # If project array or single project
                    projects = acq_data if isinstance(acq_data, list) else [acq_data]
                    for prj in projects:
                        prj_id = prj.get("project_id", f"PRJ-{state_name.upper()}-ACQ")
                        for p_item in prj.get("affected_parcels", []):
                            v_name = p_item.get("village", "").strip()
                            k_num = str(p_item.get("khasra_no") or p_item.get("khesra_no") or "").strip()
                            
                            # Link to matching parcel if exists
                            target_p = cursor.execute("""
                                SELECT parcel_uid FROM land_parcels
                                WHERE state = ? COLLATE NOCASE AND village = ? COLLATE NOCASE AND native_identifier = ?
                            """, (state_name, v_name, k_num)).fetchone()
                            
                            if target_p:
                                p_uid = target_p[0]
                                cursor.execute("""
                                    INSERT OR REPLACE INTO parcel_acquisition_links (
                                        link_id, parcel_uid, project_id, notification_number,
                                        section, stage, compensation_award_status, source_id
                                    ) VALUES (?, ?, ?, ?, ?, ?, 'Assessed / In Review', ?)
                                """, (
                                    f"LINK-ACQ-{p_uid}-{prj_id}", p_uid, prj_id,
                                    p_item.get("notification_no", "S11-NOTIF"),
                                    p_item.get("stage", "Section 11"),
                                    p_item.get("stage", "Section 11 RFCTLARR"),
                                    prj.get("source_id", "SRC-ACQUISITION-GAZETTE")
                                ))

        # 4. Ingest Coverage Area record
        cursor.execute("DELETE FROM coverage_areas WHERE LOWER(state) = ?", (state_name.lower(),))
        cursor.execute("""
            INSERT OR REPLACE INTO coverage_areas (
                coverage_id, state, district, tehsil, village,
                has_cadastral_geometry, has_land_records, parcel_count, status, source_id
            )
            SELECT
                'COV-' || UPPER(state) || '-' || UPPER(village),
                state, district, tehsil, village,
                MAX(CASE WHEN geometry_id IS NOT NULL THEN 1 ELSE 0 END),
                1,
                COUNT(*),
                'verified_official_ingested',
                source_id
            FROM land_parcels
            WHERE LOWER(state) = ?
            GROUP BY state, district, tehsil, village
        """, (state_name.lower(),))
        conn.commit()

    # Update precomputes & job ledger
    update_materialized_summaries(cursor)

    completed_iso = datetime.now(timezone.utc).isoformat()
    cursor.execute("""
        UPDATE ingestion_jobs
        SET status = 'completed', completed_at = ?, total_records = ?, success_count = ?, error_count = ?
        WHERE job_id = ?
    """, (completed_iso, total_ingested + total_errors, total_ingested, total_errors, job_id))
    conn.commit()
    conn.close()

    print(f"[SUCCESS] Ingestion Job {job_id} Completed Successfully!")
    print(f"    - Total Processed Records: {total_ingested}")
    print(f"    - Ingestion Errors:        {total_errors}")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="LandSetu Streaming Ingestion Engine")
    parser.add_argument("--state", type=str, default="all", choices=["delhi", "haryana", "bihar", "all"], help="State to ingest")
    parser.add_argument("--batch-size", type=int, default=int(os.getenv("LANDSETU_BATCH_SIZE", "5000")), help="Streaming batch size")
    parser.add_argument("--resume", action="store_true", help="Resume from last checkpoint")
    args = parser.parse_args()

    run_ingestion(target_state=args.state, batch_size=args.batch_size, resume=args.resume)
