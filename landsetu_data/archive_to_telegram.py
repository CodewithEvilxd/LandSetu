"""
LandSetu — Multi-State Telegram Archival Engine
Transfers complete Raw, Processed, and Export datasets for Delhi, Haryana, and Bihar
into the private offsite Telegram cold-storage vault (-1004255903074).
"""

import os
import sys
import time
import json
import hashlib
import urllib.request
import urllib.error
import sqlite3
from datetime import datetime, timezone

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ENV_PATH = os.path.join(BASE_DIR, "backend", ".env")
DB_PATH = os.path.join(BASE_DIR, "backend", "data", "landsetu.db")
MANIFEST_OUT = os.path.join(BASE_DIR, "backend", "data", "processed", "TELEGRAM_ARCHIVE_MANIFEST.json")

def load_env():
    env = {}
    if os.path.exists(ENV_PATH):
        with open(ENV_PATH, "r", encoding="utf-8") as f:
            for line in f:
                line = line.strip()
                if line and not line.startswith("#") and "=" in line:
                    k, v = line.split("=", 1)
                    env[k.strip()] = v.strip()
    return env

def compute_sha256(filepath: str) -> str:
    h = hashlib.sha256()
    with open(filepath, "rb") as f:
        while chunk := f.read(65536):
            h.update(chunk)
    return h.hexdigest()

def upload_document(token: str, chat_id: str, filepath: str, caption: str) -> dict:
    url = f"https://api.telegram.org/bot{token}/sendDocument"
    boundary = f"----WebKitFormBoundary{int(time.time() * 1000)}"
    filename = os.path.basename(filepath)

    with open(filepath, "rb") as f:
        file_bytes = f.read()

    body = bytearray()
    # chat_id field
    body.extend(f"--{boundary}\r\n".encode("utf-8"))
    body.extend(f'Content-Disposition: form-data; name="chat_id"\r\n\r\n{chat_id}\r\n'.encode("utf-8"))

    # caption field
    body.extend(f"--{boundary}\r\n".encode("utf-8"))
    body.extend(f'Content-Disposition: form-data; name="caption"\r\n\r\n{caption}\r\n'.encode("utf-8"))

    # document field
    body.extend(f"--{boundary}\r\n".encode("utf-8"))
    body.extend(f'Content-Disposition: form-data; name="document"; filename="{filename}"\r\n'.encode("utf-8"))
    body.extend(b"Content-Type: application/octet-stream\r\n\r\n")
    body.extend(file_bytes)
    body.extend(f"\r\n--{boundary}--\r\n".encode("utf-8"))

    req = urllib.request.Request(
        url,
        data=bytes(body),
        headers={"Content-Type": f"multipart/form-data; boundary={boundary}"}
    )

    try:
        with urllib.request.urlopen(req, timeout=45) as resp:
            resp_bytes = resp.read()
            return json.loads(resp_bytes.decode("utf-8"))
    except urllib.error.HTTPError as e:
        err_content = e.read().decode("utf-8", errors="replace")
        retry_after = 5
        try:
            j = json.loads(err_content)
            retry_after = j.get("parameters", {}).get("retry_after", 5)
        except Exception:
            pass
        return {"ok": False, "error_code": e.code, "retry_after": retry_after, "description": err_content}
    except Exception as e:
        return {"ok": False, "error": str(e)}

def collect_archive_targets() -> list[dict]:
    targets = []
    data_dir = os.path.join(BASE_DIR, "backend", "data")

    # 1. Delhi Raw Assets
    delhi_dir = os.path.join(data_dir, "raw", "delhi")
    if os.path.exists(delhi_dir):
        for root, _, files in os.walk(delhi_dir):
            for f in files:
                p = os.path.join(root, f)
                targets.append({"category": "RAW_DELHI", "state": "Delhi", "path": p})

    # 2. Haryana Raw Assets
    haryana_dir = os.path.join(data_dir, "raw", "haryana")
    if os.path.exists(haryana_dir):
        for root, _, files in os.walk(haryana_dir):
            for f in files:
                p = os.path.join(root, f)
                targets.append({"category": "RAW_HARYANA", "state": "Haryana", "path": p})

    # 3. Bihar Raw Assets
    bihar_dir = os.path.join(data_dir, "raw", "bihar")
    if os.path.exists(bihar_dir):
        for root, _, files in os.walk(bihar_dir):
            for f in files:
                p = os.path.join(root, f)
                targets.append({"category": "RAW_BIHAR", "state": "Bihar", "path": p})

    # 4. Processed 2-Layer Imported Corpus
    imported_dir = os.path.join(data_dir, "imported")
    if os.path.exists(imported_dir):
        for f in os.listdir(imported_dir):
            p = os.path.join(imported_dir, f)
            if os.path.isfile(p):
                targets.append({"category": "PROCESSED_CORPUS", "state": "Multi-State", "path": p})

    # 5. Core Quality & Coverage Reports
    processed_dir = os.path.join(data_dir, "processed")
    reports = [
        "STATE_COVERAGE_REPORT.json",
        "DELHI_DATA_QUALITY.json",
        "HARYANA_DATA_QUALITY.json",
        "BIHAR_DATA_QUALITY.json",
        "DEMO_PARCEL_MANIFEST.json"
    ]
    for r in reports:
        p = os.path.join(processed_dir, r)
        if os.path.exists(p):
            targets.append({"category": "PROCESSED_REPORT", "state": "Multi-State", "path": p})

    # 6. Full Export Bundle
    export_bundle = os.path.join(data_dir, "exports", "landsetu_export_full.json")
    if os.path.exists(export_bundle):
        targets.append({"category": "EXPORT_BUNDLE", "state": "Multi-State", "path": export_bundle})

    # 7. National Raw Datasets (DILRMP, NJDG, NHAI, Bhuvan, etc.)
    raw_root = os.path.join(data_dir, "raw")
    if os.path.exists(raw_root):
        for f in os.listdir(raw_root):
            p = os.path.join(raw_root, f)
            if os.path.isfile(p):
                targets.append({"category": "RAW_NATIONAL", "state": "National", "path": p})

    # 8. Machine Learning Model Artifacts & Training Calibration Data
    models_dir = os.path.join(data_dir, "models")
    if os.path.exists(models_dir):
        for f in os.listdir(models_dir):
            p = os.path.join(models_dir, f)
            if os.path.isfile(p):
                targets.append({"category": "ML_MODEL_ARTIFACT", "state": "National", "path": p})

    # 9. Source Provenance Registry
    source_reg = os.path.join(data_dir, "source_registry.json")
    if os.path.exists(source_reg):
        targets.append({"category": "SOURCE_REGISTRY", "state": "National", "path": source_reg})

    # 10. AI RAG Knowledge Corpus
    ai_corpus = os.path.join(processed_dir, "ai_corpus.json")
    if os.path.exists(ai_corpus):
        targets.append({"category": "AI_RAG_CORPUS", "state": "National", "path": ai_corpus})

    return targets

def update_db_ledger(sha256: str, size_bytes: int, local_path: str, archive_ref: str):
    try:
        conn = sqlite3.connect(DB_PATH)
        cur = conn.cursor()
        cur.execute("""
            INSERT INTO storage_objects (sha256, original_path, size_bytes, mime_type, tier, archive_status, archive_ref, verified_at)
            VALUES (?, ?, ?, 'application/octet-stream', 'archive', 'archived', ?, CURRENT_TIMESTAMP)
            ON CONFLICT(sha256) DO UPDATE SET
                archive_ref = excluded.archive_ref,
                archive_status = 'archived',
                verified_at = CURRENT_TIMESTAMP
        """, (sha256, local_path, size_bytes, archive_ref))
        conn.commit()
        conn.close()
    except Exception as e:
        print(f"    [!] Warning: Failed to update DB ledger for {sha256}: {e}")

def main():
    try:
        sys.stdout.reconfigure(line_buffering=True)
    except Exception:
        pass
    print("=======================================================")
    print(" LANDSETU MULTI-STATE TELEGRAM ARCHIVAL ENGINE")
    print(" Target: Private Cloud Cold-Storage Vault (-1004255903074)")
    print("=======================================================")

    env = load_env()
    token = env.get("LANDSETU_ARCHIVE_BOT_TOKEN")
    chat_id = env.get("LANDSETU_ARCHIVE_CHAT_ID", "-1004255903074")

    if not token:
        print("[ERROR] LANDSETU_ARCHIVE_BOT_TOKEN not found in backend/.env")
        sys.exit(1)

    targets = collect_archive_targets()
    print(f"[*] Discovered {len(targets)} total artifacts for Telegram cold-storage.\n")

    existing_by_sha = {}
    if os.path.exists(MANIFEST_OUT):
        try:
            with open(MANIFEST_OUT, "r", encoding="utf-8") as f_in:
                old_doc = json.load(f_in)
                for item in old_doc.get("artifacts", []):
                    if item.get("status") == "ARCHIVED":
                        existing_by_sha[item["sha256"]] = item
        except Exception:
            pass

    if existing_by_sha:
        print(f"[*] Found {len(existing_by_sha)} already-archived artifacts in manifest.\n")

    manifest_entries = []
    success_count = 0
    fail_count = 0

    for idx, target in enumerate(targets, 1):
        fpath = target["path"]
        category = target["category"]
        state = target["state"]
        fname = os.path.basename(fpath)
        fsize = os.path.getsize(fpath)
        sha = compute_sha256(fpath)

        if sha in existing_by_sha:
            print(f"[{idx}/{len(targets)}] {category} -> {fname} (ALREADY ARCHIVED, Msg ID: {existing_by_sha[sha].get('telegram_message_id')})")
            manifest_entries.append(existing_by_sha[sha])
            success_count += 1
            continue

        caption = (
            f"[LANDSETU ARCHIVE: {category}]\n"
            f"State: {state} | File: {fname}\n"
            f"SHA256: {sha}\n"
            f"Bytes: {fsize}\n"
            f"Timestamp: {datetime.now(timezone.utc).isoformat()}"
        )

        print(f"[{idx}/{len(targets)}] Archiving {category} -> {fname} ({fsize} B)...")
        
        # Retry up to 3 times on 429
        res = None
        for attempt in range(3):
            res = upload_document(token, chat_id, fpath, caption)
            if res.get("ok"):
                break
            if res.get("error_code") == 429:
                wait_sec = res.get("retry_after", 5) + 1
                print(f"    [!] Rate limit reached. Waiting {wait_sec}s before retry...")
                time.sleep(wait_sec)
            else:
                break

        if res and res.get("ok"):
            msg_id = res["result"]["message_id"]
            doc = res["result"].get("document", {})
            file_id = doc.get("file_id", "N/A")
            archive_ref = f"telegram:msg:{msg_id}:file:{file_id}"
            print(f"    -> [SUCCESS] Archived (Msg ID: {msg_id})")
            success_count += 1

            entry = {
                "category": category,
                "state": state,
                "filename": fname,
                "local_path": os.path.relpath(fpath, BASE_DIR),
                "size_bytes": fsize,
                "sha256": sha,
                "telegram_message_id": msg_id,
                "telegram_file_id": file_id,
                "archive_ref": archive_ref,
                "archived_at": datetime.now(timezone.utc).isoformat(),
                "status": "ARCHIVED"
            }
            manifest_entries.append(entry)
            update_db_ledger(sha, fsize, os.path.relpath(fpath, BASE_DIR), archive_ref)
        else:
            print(f"    -> [FAIL] {res.get('description') or res.get('error') if res else 'Unknown error'}")
            fail_count += 1
            manifest_entries.append({
                "category": category,
                "state": state,
                "filename": fname,
                "local_path": os.path.relpath(fpath, BASE_DIR),
                "size_bytes": fsize,
                "sha256": sha,
                "error": res.get("description") or res.get("error"),
                "status": "FAILED"
            })

        # Sleep to respect Telegram rate limits (approx 1.2 seconds)
        time.sleep(1.2)

    # Write Manifest
    manifest_doc = {
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "total_targets": len(targets),
        "successful_uploads": success_count,
        "failed_uploads": fail_count,
        "telegram_chat_id": chat_id,
        "artifacts": manifest_entries
    }
    with open(MANIFEST_OUT, "w", encoding="utf-8") as f_out:
        json.dump(manifest_doc, f_out, indent=2)

    print("\n=======================================================")
    print(f" ARCHIVAL RUN COMPLETE: {success_count} SUCCESS, {fail_count} FAILED")
    print(f" Manifest written to: {MANIFEST_OUT}")
    print("=======================================================\n")

if __name__ == "__main__":
    main()
