"""
LandSetu Source Discovery: Download & Ingestion Manifest Builder
Computes SHA-256 cryptographic hashes for all raw files in the data lake
and writes retrieval_manifest.json and checksums.json.
"""

import os
import hashlib
import json
from datetime import datetime, timezone
from typing import Dict, Any, List

def compute_sha256(filepath: str) -> str:
    sha = hashlib.sha256()
    with open(filepath, "rb") as f:
        while chunk := f.read(65536):
            sha.update(chunk)
    return sha.hexdigest()

def build_manifest_for_directory(base_dir: str, state: str, source_id: str, publisher: str, source_url: str) -> Dict[str, Any]:
    manifest = {
        "state": state,
        "source_id": source_id,
        "publisher": publisher,
        "source_url": source_url,
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "files": []
    }
    checksums = {}

    if not os.path.exists(base_dir):
        return manifest

    for root, _, files in os.walk(base_dir):
        for f in sorted(files):
            if f in ["retrieval_manifest.json", "checksums.json", "source_registry.json"]:
                continue
            full_path = os.path.join(root, f)
            rel_path = os.path.relpath(full_path, base_dir).replace("\\", "/")
            file_hash = compute_sha256(full_path)
            file_size = os.path.getsize(full_path)

            entry = {
                "relative_path": rel_path,
                "file_size_bytes": file_size,
                "checksum_sha256": file_hash,
                "retrieved_at": datetime.now(timezone.utc).isoformat(),
                "parser_version": "v1.0.0"
            }
            manifest["files"].append(entry)
            checksums[rel_path] = file_hash

    # Write manifest and checksums
    manifest_path = os.path.join(base_dir, "retrieval_manifest.json")
    with open(manifest_path, "w", encoding="utf-8") as mf:
        json.dump(manifest, mf, indent=2, ensure_ascii=False)

    checksum_path = os.path.join(base_dir, "checksums.json")
    with open(checksum_path, "w", encoding="utf-8") as cf:
        json.dump(checksums, cf, indent=2, ensure_ascii=False)

    print(f"[Manifest Builder] {state.upper()}: Processed {len(manifest['files'])} raw files -> {manifest_path}")
    return manifest

if __name__ == "__main__":
    build_manifest_for_directory("backend/data/raw/delhi", "Delhi", "SRC-DELHI-REV-GAZ-002", "Department of Revenue, Govt. of NCT of Delhi", "https://revenue.delhi.gov.in/")
    build_manifest_for_directory("backend/data/raw/haryana", "Haryana", "SRC-HARYANA-JAMABANDI-005", "Department of Revenue and Disaster Management, Haryana", "https://jamabandi.nic.in/")
