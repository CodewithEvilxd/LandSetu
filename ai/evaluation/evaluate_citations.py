import sys
import os
import json
import sqlite3
import hashlib

if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding="utf-8")
    except Exception:
        pass

def run_citation_evaluation():
    print("=================================================")
    print(" CITATION VALIDITY & PROVENANCE INTEGRITY EVAL")
    print("=================================================")

    db_path = "backend/data/landsetu.db"
    conn = sqlite3.connect(db_path)
    conn.row_factory = sqlite3.Row

    passed = 0
    failed = 0

    def assert_check(name: str, condition: bool, err_msg: str = ""):
        nonlocal passed, failed
        if condition:
            print(f"[PASS] {name}")
            passed += 1
        else:
            print(f"[FAIL] {name}: {err_msg}")
            failed += 1

    # 1. Check sources table has non-empty valid SHA-256 digests
    sources = conn.execute("SELECT * FROM sources").fetchall()
    valid_source_hashes = 0
    for s in sources:
        sha = s["checksum_sha256"] or ""
        if len(sha) == 64 and all(c in "0123456789abcdefABCDEF" for c in sha):
            valid_source_hashes += 1
    assert_check(
        "All registered official sources have valid 64-char SHA-256 checksums",
        valid_source_hashes == len(sources) and len(sources) > 0,
        f"Valid: {valid_source_hashes}/{len(sources)}"
    )

    # 2. Check parcel_evidence table has verified status and valid checksums
    evidence_rows = conn.execute("SELECT * FROM parcel_evidence").fetchall()
    verified_status_count = 0
    valid_checksums = 0
    for ev in evidence_rows:
        if ev["verification_status"] in ("verified", "source_matched"):
            verified_status_count += 1
        sha = ev["checksum_sha256"] or ""
        if len(sha) == 64 and all(c in "0123456789abcdefABCDEF" for c in sha):
            valid_checksums += 1

    assert_check(
        f"All {len(evidence_rows)} field-level evidence rows have 'source_matched' verification status",
        verified_status_count == len(evidence_rows) and len(evidence_rows) > 0,
        f"Verified: {verified_status_count}/{len(evidence_rows)}"
    )

    assert_check(
        f"All {len(evidence_rows)} field-level evidence rows have immutable 64-char SHA-256 checksums",
        valid_checksums == len(evidence_rows) and len(evidence_rows) > 0,
        f"Valid checksums: {valid_checksums}/{len(evidence_rows)}"
    )

    # 3. Verify raw data lake files match recorded SHA-256 hashes
    manifest_configs = [
        ("backend/data/raw/delhi", "backend/data/raw/delhi/retrieval_manifest.json"),
        ("backend/data/raw/haryana", "backend/data/raw/haryana/retrieval_manifest.json")
    ]
    verified_manifest_files = 0
    total_manifest_files = 0

    for base_dir, mp in manifest_configs:
        if os.path.exists(mp):
            with open(mp, "r", encoding="utf-8") as f:
                manifest = json.load(f)
            for f_info in manifest.get("files", []):
                total_manifest_files += 1
                rel_path = f_info.get("relative_path")
                expected_sha = f_info.get("checksum_sha256")
                f_path = os.path.join(base_dir, rel_path) if rel_path else None
                if f_path and os.path.exists(f_path) and expected_sha:
                    with open(f_path, "rb") as rf:
                        actual_sha = hashlib.sha256(rf.read()).hexdigest()
                    if actual_sha.lower() == expected_sha.lower():
                        verified_manifest_files += 1

    assert_check(
        f"Raw data lake manifests cryptographically match files on disk ({verified_manifest_files}/{total_manifest_files})",
        verified_manifest_files == total_manifest_files and total_manifest_files > 0,
        f"Verified: {verified_manifest_files}/{total_manifest_files}"
    )

    # 4. Check that no parcel in the database has empty provenance
    parcels_without_evidence = conn.execute("""
        SELECT COUNT(*) as count FROM land_parcels p
        LEFT JOIN parcel_evidence e ON p.parcel_uid = e.parcel_uid
        WHERE e.evidence_id IS NULL
    """).fetchone()["count"]

    assert_check(
        "Zero parcels in database have unlinked or empty provenance",
        parcels_without_evidence == 0,
        f"Unlinked parcels: {parcels_without_evidence}"
    )

    print("-------------------------------------------------")
    print(f"TOTAL: {passed + failed} | PASSED: {passed} | FAILED: {failed}")
    print("-------------------------------------------------")

    output_path = "ai/evaluation/citation_eval_results.json"
    with open(output_path, "w", encoding="utf-8") as f:
        json.dump({
            "total_checks": passed + failed,
            "passed": passed,
            "failed": failed,
            "integrity_score_pct": (passed / (passed + failed)) * 100,
            "evidence_count": len(evidence_rows),
            "sources_count": len(sources)
        }, f, indent=2)

    conn.close()

    if failed > 0:
        sys.exit(1)

if __name__ == "__main__":
    run_citation_evaluation()
