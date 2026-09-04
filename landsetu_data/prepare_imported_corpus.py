"""
LandSetu — 2-Layer Corpus Compiler: Generate Compact JSONL & GZ Archives
Compiles normalized land records, legal corpus, research corpus, GIS index, and metadata
into `backend/data/imported/` for high-throughput, low-storage runtime querying.
"""

import os
import json
import gzip
import sqlite3
from datetime import datetime, timezone

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DB_PATH = os.path.join(BASE_DIR, "backend", "data", "landsetu.db")
RAW_DIR = os.path.join(BASE_DIR, "backend", "data", "raw")
IMPORTED_DIR = os.path.join(BASE_DIR, "backend", "data", "imported")
PROCESSED_DIR = os.path.join(BASE_DIR, "backend", "data", "processed")

def ensure_imported_dir():
    os.makedirs(IMPORTED_DIR, exist_ok=True)

def write_jsonl_and_gz(filename_base: str, records: list[dict]):
    jsonl_path = os.path.join(IMPORTED_DIR, f"{filename_base}.jsonl")
    gz_path = os.path.join(IMPORTED_DIR, f"{filename_base}.jsonl.gz")

    with open(jsonl_path, "w", encoding="utf-8") as f_out:
        for r in records:
            f_out.write(json.dumps(r, ensure_ascii=False) + "\n")

    with gzip.open(gz_path, "wt", encoding="utf-8") as f_gz:
        for r in records:
            f_gz.write(json.dumps(r, ensure_ascii=False) + "\n")

    plain_size = os.path.getsize(jsonl_path)
    gz_size = os.path.getsize(gz_path)
    compression_ratio = (1 - (gz_size / plain_size)) * 100 if plain_size > 0 else 0
    print(f" -> Compiled {filename_base}.jsonl ({len(records)} rows | {plain_size} B -> {gz_size} B, {compression_ratio:.1f}% compression)")
    return jsonl_path, gz_path

def compile_land_records():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    cur = conn.cursor()

    parcels = cur.execute("SELECT * FROM land_parcels ORDER BY state, village, parcel_uid").fetchall()
    records = []

    for p in parcels:
        uid = p["parcel_uid"]
        rights = [dict(r) for r in cur.execute("SELECT * FROM parcel_rights WHERE parcel_uid = ?", (uid,)).fetchall()]
        accounts = [dict(a) for a in cur.execute("SELECT * FROM parcel_accounts WHERE parcel_uid = ?", (uid,)).fetchall()]
        mutations = [dict(m) for m in cur.execute("SELECT * FROM parcel_mutations WHERE parcel_uid = ?", (uid,)).fetchall()]
        encumbrances = [dict(e) for e in cur.execute("SELECT * FROM parcel_encumbrances WHERE parcel_uid = ?", (uid,)).fetchall()]
        evidence = [dict(ev) for ev in cur.execute("SELECT * FROM parcel_evidence WHERE parcel_uid = ?", (uid,)).fetchall()]
        geom = cur.execute("SELECT centroid_lat, centroid_lng, bbox_json, source_crs, quality_flag FROM parcel_geometries WHERE parcel_uid = ?", (uid,)).fetchone()

        rec = {
            "entity_type": "land_parcel",
            "parcel_uid": p["parcel_uid"],
            "state": p["state"],
            "district": p["district"],
            "subdivision": p["subdivision"],
            "tehsil": p["tehsil"],
            "village": p["village"],
            "native_identifier": p["native_identifier"],
            "identifier_type": p["identifier_type"],
            "account_identifier": p["account_identifier"],
            "area": p["area"],
            "area_unit": p["area_unit"],
            "area_raw": p["area_raw"],
            "land_use": p["land_use"],
            "source_system": p["source_system"],
            "source_id": p["source_id"],
            "geometry_summary": dict(geom) if geom else None,
            "rights_holders": rights,
            "accounts": accounts,
            "mutations": mutations,
            "encumbrances": encumbrances,
            "evidence_count": len(evidence),
            "updated_at": p["updated_at"]
        }
        records.append(rec)

    conn.close()
    return write_jsonl_and_gz("land_records", records)

def compile_legal_corpus():
    legal_path = os.path.join(RAW_DIR, "official_legal_policy_documents.json")
    records = []
    if os.path.exists(legal_path):
        with open(legal_path, "r", encoding="utf-8") as f:
            data = json.load(f)
            docs = data if isinstance(data, list) else data.get("documents", [])
            for d in docs:
                records.append({
                    "entity_type": "legal_statute",
                    "doc_id": d.get("document_id") or d.get("id"),
                    "title": d.get("title"),
                    "statute_type": d.get("document_type") or d.get("type"),
                    "jurisdiction": d.get("jurisdiction", "National"),
                    "year": d.get("date_enacted") or d.get("year"),
                    "authority": d.get("publisher") or d.get("authority"),
                    "key_provisions": d.get("key_provisions", []),
                    "summary": d.get("summary")
                })
    
    # Also add state-specific tenancy provisions
    state_laws = [
        {
            "entity_type": "legal_statute",
            "doc_id": "STAT-DLRC-1954",
            "title": "Delhi Land Reforms Act, 1954",
            "statute_type": "Primary State Act",
            "jurisdiction": "Delhi",
            "year": 1954,
            "authority": "Revenue Department, Govt of NCT of Delhi",
            "key_provisions": ["Section 1-A (Bhumidhari Tenure)", "Gaon Sabha Vesting of Waste Lands", "Ceiling on Agricultural Land Transfers"]
        },
        {
            "entity_type": "legal_statute",
            "doc_id": "STAT-PLRA-1887",
            "title": "Punjab Land Revenue Act, 1887 (as applicable to Haryana)",
            "statute_type": "Primary State Revenue Code",
            "jurisdiction": "Haryana",
            "year": 1887,
            "authority": "Revenue & Disaster Management Dept, Haryana",
            "key_provisions": ["Jamabandi (Record of Rights)", "Intiqal (Mutation Sanction Procedure)", "Batwara (Partition of Joint Holdings)"]
        },
        {
            "entity_type": "legal_statute",
            "doc_id": "STAT-BTA-1885",
            "title": "Bihar Tenancy Act, 1885 & Bihar Land Reforms Act, 1950",
            "statute_type": "Primary State Tenancy & Abolition Code",
            "jurisdiction": "Bihar",
            "year": 1885,
            "authority": "Revenue & Land Reforms Dept, Govt of Bihar",
            "key_provisions": ["Khatiyan Classification (Cadastral vs Revisional)", "Kaimi Raiyati vs Sikmi Tenancy Rights", "Dakhil-Kharij (Online Mutation Verification)"]
        }
    ]
    records.extend(state_laws)
    return write_jsonl_and_gz("legal_corpus", records)

def compile_research_corpus():
    records = []
    # NJDG Civil Disputes
    njdg_path = os.path.join(RAW_DIR, "njdg_land_disputes.json")
    if os.path.exists(njdg_path):
        with open(njdg_path, "r", encoding="utf-8") as f:
            njdg = json.load(f)
            records.append({
                "entity_type": "research_dataset",
                "dataset_id": "DS-NJDG-001",
                "domain": "Judicial Litigation & Land Disputes",
                "source": "National Judicial Data Grid (NJDG)",
                "data": njdg
            })

    # DILRMP National Status
    dilrmp_path = os.path.join(RAW_DIR, "dilrmp_national_status.json")
    if os.path.exists(dilrmp_path):
        with open(dilrmp_path, "r", encoding="utf-8") as f:
            dilrmp = json.load(f)
            records.append({
                "entity_type": "research_dataset",
                "dataset_id": "DS-DILRMP-002",
                "domain": "Land Records Modernization Progress",
                "source": "Digital India Land Records Modernization Programme (DoLR)",
                "data": dilrmp
            })

    # Linear Infrastructure & CAG Acquisition Projects
    acq_path = os.path.join(RAW_DIR, "real_historical_acquisition_projects.json")
    if os.path.exists(acq_path):
        with open(acq_path, "r", encoding="utf-8") as f:
            acq = json.load(f)
            records.append({
                "entity_type": "research_dataset",
                "dataset_id": "DS-CAG-LCW-003",
                "domain": "Infrastructure Land Acquisition Delay Risk Analysis",
                "source": "Comptroller & Auditor General (CAG) & MoRTH",
                "corridors_analyzed": len(acq.get("projects", [])) if isinstance(acq, dict) else 16,
                "summary": "16 national infrastructure corridors calibrated against Section 23 statutory award timelines"
            })

    return write_jsonl_and_gz("research_corpus", records)

def compile_gis_index():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    cur = conn.cursor()

    maps = cur.execute("SELECT map_id, state, district, tehsil, village, feature_count, survey_year, checksum_sha256 FROM cadastral_maps").fetchall()
    records = []
    for m in maps:
        records.append({
            "entity_type": "cadastral_map_index",
            "map_id": m["map_id"],
            "state": m["state"],
            "district": m["district"],
            "tehsil": m["tehsil"],
            "village": m["village"],
            "feature_count": m["feature_count"],
            "survey_year": m["survey_year"],
            "projection": "EPSG:4326",
            "checksum_sha256": m["checksum_sha256"]
        })

    # Add Bhuvan geospatial layers metadata
    bhuvan_path = os.path.join(RAW_DIR, "bhuvan_geospatial_layers.geojson")
    if os.path.exists(bhuvan_path):
        with open(bhuvan_path, "r", encoding="utf-8") as f:
            bhuvan = json.load(f)
            records.append({
                "entity_type": "satellite_thematic_layer",
                "layer_id": "BHUVAN-LULC-NATIONAL",
                "provider": "NRSC / ISRO Bhuvan",
                "feature_count": len(bhuvan.get("features", [])),
                "crs": "EPSG:4326"
            })

    conn.close()
    return write_jsonl_and_gz("gis_index", records)

def compile_metadata():
    records = []
    # Source Registry
    reg_path = os.path.join(BASE_DIR, "backend", "data", "source_registry.json")
    if os.path.exists(reg_path):
        with open(reg_path, "r", encoding="utf-8") as f:
            reg = json.load(f)
            sources = reg if isinstance(reg, list) else reg.get("sources", [])
            for s in sources:
                records.append({
                    "entity_type": "provenance_source",
                    "source_id": s.get("id"),
                    "name": s.get("name"),
                    "authority": s.get("authority"),
                    "jurisdiction": s.get("jurisdiction"),
                    "sha256": s.get("sha256_checksum"),
                    "retrieval_method": s.get("retrieval_method")
                })

    # State Data Quality Summaries
    for state in ["Delhi", "Haryana", "Bihar"]:
        q_path = os.path.join(PROCESSED_DIR, f"{state.upper()}_DATA_QUALITY.json")
        if os.path.exists(q_path):
            with open(q_path, "r", encoding="utf-8") as f:
                records.append({
                    "entity_type": "quality_report",
                    "state": state,
                    "data": json.load(f)
                })

    # State Coverage Report
    cov_path = os.path.join(PROCESSED_DIR, "STATE_COVERAGE_REPORT.json")
    if os.path.exists(cov_path):
        with open(cov_path, "r", encoding="utf-8") as f:
            records.append({
                "entity_type": "coverage_report",
                "data": json.load(f)
            })

    return write_jsonl_and_gz("metadata", records)

def main():
    print("=======================================================")
    print(" LANDSETU 2-LAYER CORPUS COMPILER: JSONL & GZ ARCHIVES")
    print("=======================================================")
    ensure_imported_dir()
    compile_land_records()
    compile_legal_corpus()
    compile_research_corpus()
    compile_gis_index()
    compile_metadata()
    print("\n[SUCCESS] 2-Layer Processed Corpus Compiled in `backend/data/imported/`!\n")

if __name__ == "__main__":
    main()
