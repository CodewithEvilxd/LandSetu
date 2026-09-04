import sqlite3
import json
import os
import glob

def audit_database():
    db_path = "backend/data/landsetu.db"
    print("=" * 60)
    print("      LANDSETU COMPREHENSIVE DUMMY DATA AUDIT")
    print("=" * 60)
    
    if not os.path.exists(db_path):
        print(f"Error: {db_path} not found.")
        return
        
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    tables = cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'").fetchall()
    print(f"[*] Auditing all {len(tables)} tables in {db_path}...\n")
    
    keywords = ["dummy", "mock", "fake", "placeholder", "lorem", "sample_user", "test_user"]
    flagged = []
    total_rows = 0
    
    for (tbl,) in tables:
        count = cursor.execute(f'SELECT count(*) FROM "{tbl}"').fetchone()[0]
        total_rows += count
        cols = [col[1] for col in cursor.execute(f'PRAGMA table_info("{tbl}")').fetchall()]
        
        for c in cols:
            for kw in keywords:
                try:
                    q = f'SELECT count(*) FROM "{tbl}" WHERE LOWER(CAST("{c}" AS TEXT)) LIKE ?'
                    m = cursor.execute(q, (f"%{kw}%",)).fetchone()[0]
                    if m > 0:
                        # fetch sample
                        sample = cursor.execute(f'SELECT "{c}" FROM "{tbl}" WHERE LOWER(CAST("{c}" AS TEXT)) LIKE ? LIMIT 1', (f"%{kw}%",)).fetchone()[0]
                        flagged.append({"table": tbl, "column": c, "keyword": kw, "matches": m, "sample": str(sample)[:80]})
                except Exception:
                    pass
        print(f"  - Table: {tbl:35} | Total Rows: {count:>5}")

    print(f"\n[+] Total rows inspected across all tables: {total_rows}")
    print("\n" + "=" * 60)
    print("      DATABASE AUDIT FINDINGS")
    print("=" * 60)
    if not flagged:
        print("[CLEAN] 0 dummy/mock/fake records found in SQLite database!")
    else:
        print(f"[!] Found {len(flagged)} suspicious records:")
        for f in flagged:
            print(f"    - Table: {f['table']}, Col: {f['column']}, Keyword: '{f['keyword']}', Count: {f['matches']}, Sample: {f['sample']}")

    # Check Raw & Ingested JSON/JSONL datasets
    print("\n" + "=" * 60)
    print("      AUDITING INGESTED RAW & PROCESSED JSON DATASETS")
    print("=" * 60)
    
    data_files = glob.glob("backend/data/**/*.json", recursive=True) + glob.glob("backend/data/**/*.jsonl", recursive=True)
    json_flags = []
    
    for fpath in data_files:
        if "node_modules" in fpath or ".git" in fpath:
            continue
        try:
            with open(fpath, "r", encoding="utf-8", errors="ignore") as f:
                content = f.read().lower()
                for kw in ["dummy", "fake_khasra", "mock_record", "placeholder_owner", "lorem ipsum"]:
                    if kw in content:
                        json_flags.append({"file": fpath, "keyword": kw})
        except Exception:
            pass

    if not json_flags:
        print("[CLEAN] 0 dummy/mock/fake entries found in raw and processed JSON/JSONL files!")
    else:
        print(f"[!] Suspicious JSON matches:")
        for j in json_flags:
            print(f"    - File: {j['file']} contains '{j['keyword']}'")

if __name__ == "__main__":
    audit_database()
