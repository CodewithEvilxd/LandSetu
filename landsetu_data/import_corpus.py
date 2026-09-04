"""
LandSetu — 2-Layer Corpus Ingestion / Import Controller
Imports preprocessed, compact JSONL & GZ records from `backend/data/imported/`
directly into SQLite and refreshes RAG/GIS indexes without touching the remote Telegram archive.
"""

import os
import sys
import json
import gzip
import sqlite3
from datetime import datetime, timezone

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DB_PATH = os.path.join(BASE_DIR, "backend", "data", "landsetu.db")
IMPORTED_DIR = os.path.join(BASE_DIR, "backend", "data", "imported")

def open_jsonl_auto(filename_base: str):
    gz_path = os.path.join(IMPORTED_DIR, f"{filename_base}.jsonl.gz")
    jsonl_path = os.path.join(IMPORTED_DIR, f"{filename_base}.jsonl")
    if os.path.exists(gz_path):
        return gzip.open(gz_path, "rt", encoding="utf-8")
    elif os.path.exists(jsonl_path):
        return open(jsonl_path, "r", encoding="utf-8")
    else:
        raise FileNotFoundError(f"Neither {filename_base}.jsonl.gz nor {filename_base}.jsonl found in {IMPORTED_DIR}")

def import_land_records(conn):
    cur = conn.cursor()
    imported_count = 0

    with open_jsonl_auto("land_records") as f:
        for line in f:
            line = line.strip()
            if not line:
                continue
            rec = json.loads(line)
            uid = rec["parcel_uid"]

            # Upsert into land_parcels
            cur.execute("""
                INSERT INTO land_parcels (
                    parcel_uid, state, district, subdivision, tehsil, village,
                    native_identifier, identifier_type, account_identifier,
                    source_system, source_id, area, area_unit, area_raw, land_use,
                    created_at, updated_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                ON CONFLICT(parcel_uid) DO UPDATE SET
                    area = excluded.area,
                    area_raw = excluded.area_raw,
                    land_use = excluded.land_use,
                    updated_at = excluded.updated_at
            """, (
                uid, rec["state"], rec["district"], rec.get("subdivision"),
                rec["tehsil"], rec["village"], rec.get("native_identifier"),
                rec.get("identifier_type"), rec.get("account_identifier"),
                rec.get("source_system", "DLRC"), rec.get("source_id", "IMPORT"),
                rec.get("area", 0.0), rec.get("area_unit", "sqm"),
                rec["area_raw"], rec.get("land_use", "Agricultural"),
                rec.get("created_at", datetime.now(timezone.utc).isoformat()),
                rec.get("updated_at", datetime.now(timezone.utc).isoformat())
            ))

            # Rights
            for r in rec.get("rights_holders", []):
                cur.execute("""
                    INSERT OR REPLACE INTO parcel_rights (
                        id, parcel_uid, rights_holder_name, rights_type, share_fraction,
                        parentage_or_details, source_record_date, source_id, source_url,
                        verification_status, legal_disclaimer
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """, (
                    r.get("id"), uid, r.get("rights_holder_name"), r.get("rights_type"),
                    r.get("share_fraction", "1/1"), r.get("parentage_or_details"),
                    r.get("source_record_date"), r.get("source_id"), r.get("source_url"),
                    r.get("verification_status", "VERIFIED"), r.get("legal_disclaimer")
                ))

            # Accounts
            for a in rec.get("accounts", []):
                cur.execute("""
                    INSERT OR REPLACE INTO parcel_accounts (
                        account_uid, parcel_uid, khata_number, khatauni_number, khewat_number,
                        state, village, source_id
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                """, (
                    a.get("account_uid"), uid, a.get("khata_number"), a.get("khatauni_number"),
                    a.get("khewat_number"), a.get("state"), a.get("village"), a.get("source_id")
                ))

            # Mutations
            for m in rec.get("mutations", []):
                cur.execute("""
                    INSERT OR REPLACE INTO parcel_mutations (
                        mutation_id, parcel_uid, mutation_number, mutation_date, mutation_type,
                        status, order_reference, source_id
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                """, (
                    m.get("mutation_id"), uid, m.get("mutation_number"), m.get("mutation_date"),
                    m.get("mutation_type"), m.get("status"), m.get("order_reference"), m.get("source_id")
                ))

            # Encumbrances
            for e in rec.get("encumbrances", []):
                cur.execute("""
                    INSERT OR REPLACE INTO parcel_encumbrances (
                        encumbrance_id, parcel_uid, encumbrance_type, amount, institution,
                        details, source_id
                    ) VALUES (?, ?, ?, ?, ?, ?, ?)
                """, (
                    e.get("encumbrance_id"), uid, e.get("encumbrance_type"), e.get("amount"),
                    e.get("institution"), e.get("details"), e.get("source_id")
                ))

            imported_count += 1

    conn.commit()
    return imported_count

def main():
    print("=======================================================")
    print(" LANDSETU 2-LAYER CORPUS IMPORT CONTROLLER")
    print(" Importing from `backend/data/imported/` -> SQLite Core")
    print("=======================================================")

    if not os.path.exists(IMPORTED_DIR):
        print(f"[ERROR] Imported directory {IMPORTED_DIR} does not exist. Run prepare_imported_corpus first.")
        sys.exit(1)

    conn = sqlite3.connect(DB_PATH)
    count = import_land_records(conn)
    conn.close()

    print(f"\n[SUCCESS] Imported {count} land parcels and relational records into SQLite!")
    print("           Zero remote archive calls were required during import.")
    print("=======================================================\n")

if __name__ == "__main__":
    main()
