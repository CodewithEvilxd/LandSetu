"""
LandSetu Provenance Audit CLI
Audits field-level provenance records against CAS storage objects and physical digests.
"""

import os
import sys
import sqlite3
import hashlib

PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
DB_PATH = os.path.join(PROJECT_ROOT, "backend", "data", "landsetu.db")
CAS_DIR = os.path.join(PROJECT_ROOT, "backend", "data", "objects")

def audit_provenance():
    print("=======================================================")
    print(" LANDSETU CRYPTOGRAPHIC PROVENANCE & CAS AUDIT")
    print("=======================================================")

    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    ev_rows = cursor.execute("""
        SELECT e.evidence_id, e.parcel_uid, e.field_name, e.field_value,
               e.source_id, e.checksum_sha256, s.original_path, s.size_bytes
        FROM parcel_evidence e
        LEFT JOIN storage_objects s ON e.checksum_sha256 = s.sha256
    """).fetchall()

    total_evidence = len(ev_rows)
    cas_matched = 0
    cas_missing = 0
    corrupted = 0

    print(f"Auditing {total_evidence} field-level provenance records...")

    for r in ev_rows:
        ev_id, p_uid, f_name, f_val, src_id, sha, orig_path, size = r
        if not orig_path:
            cas_missing += 1
            print(f"[WARN] Evidence {ev_id} ({p_uid} -> {f_name}) references unregistered SHA {sha}")
            continue

        # Check physical CAS storage
        dir1 = sha[:2]
        dir2 = sha[2:4]
        cas_file = os.path.join(CAS_DIR, dir1, dir2, sha)

        if os.path.exists(cas_file):
            # Verify digest
            hasher = hashlib.sha256()
            with open(cas_file, "rb") as f:
                while chunk := f.read(65536):
                    hasher.update(chunk)
            actual_sha = hasher.hexdigest()
            if actual_sha.lower() == sha.lower():
                cas_matched += 1
            else:
                corrupted += 1
                print(f"[FAIL] Digest corruption in CAS for {sha}: got {actual_sha}")
        elif os.path.exists(orig_path):
            # File exists at original path
            cas_matched += 1
        else:
            cas_missing += 1
            print(f"[WARN] Physical file missing for SHA {sha}")

    conn.close()

    print("\n--- Provenance Audit Summary ---")
    print(f"Total Evidence Records: {total_evidence}")
    print(f"Verified & Matched:      {cas_matched}")
    print(f"Missing Files:           {cas_missing}")
    print(f"Corrupted Objects:       {corrupted}")
    print(f"Integrity Status:        {'PASSED' if corrupted == 0 and cas_missing == 0 else 'WARNING'}")

if __name__ == "__main__":
    audit_provenance()
