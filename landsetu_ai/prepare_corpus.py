"""
LandSetu AI Corpus Preparation CLI
Builds structured text corpus from legal statutes, policy guidelines, and verified land records.
Outputs: backend/data/processed/ai_corpus.json
"""

import os
import sys
import json
import sqlite3
from datetime import datetime, timezone

if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding="utf-8")
    except Exception:
        pass

PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
DB_PATH = os.path.join(PROJECT_ROOT, "backend", "data", "landsetu.db")
OUTPUT_PATH = os.path.join(PROJECT_ROOT, "backend", "data", "processed", "ai_corpus.json")

def prepare_corpus():
    print("=======================================================")
    print(" LANDSETU AI RETRIEVAL CORPUS PREPARATION")
    print("=======================================================")

    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    corpus = []

    # 1. Statutory Document Chunks
    doc_chunks = cursor.execute("""
        SELECT chunk_id, document_title, section, topic, content, jurisdiction, publisher, source_url
        FROM document_chunks
    """).fetchall()

    for c in doc_chunks:
        chunk_id, title, sec, topic, content, juris, pub, url = c
        corpus.append({
            "id": chunk_id,
            "type": "statutory_chunk",
            "title": f"{title} - {sec or topic or 'Provisions'}",
            "text": f"{title}\nSection/Topic: {sec or topic}\n{content}",
            "metadata": {
                "jurisdiction": juris,
                "publisher": pub,
                "source_url": url,
                "domain": "Legal & Statutory"
            }
        })

    # 2. Ingested Official Land Parcels (Indexed as Evidence Records)
    parcels = cursor.execute("""
        SELECT p.parcel_uid, p.state, p.district, p.tehsil, p.village, p.native_identifier,
               p.identifier_type, p.area_raw, p.land_use, p.source_system, p.source_id, p.source_record_id
        FROM land_parcels p
    """).fetchall()

    for p in parcels:
        p_uid, state, dist, tehsil, village, native_id, id_type, area_raw, land_use, sys_name, src_id, src_rec = p

        # Get rights holders
        rights = cursor.execute("SELECT rights_holder_name, rights_type, share_fraction, parentage_or_details FROM parcel_rights WHERE parcel_uid = ?", (p_uid,)).fetchall()
        rh_strs = [f"{r[0]} ({r[1]}, share: {r[2]}, {r[3]})" for r in rights]

        # Get mutations
        muts = cursor.execute("SELECT mutation_number, mutation_date, mutation_type, status, order_reference FROM parcel_mutations WHERE parcel_uid = ?", (p_uid,)).fetchall()
        mut_strs = [f"Mutation {m[0]} ({m[2]}, {m[1]}): {m[4]}" for m in muts]

        text = (
            f"Land Parcel Record ({state})\n"
            f"State: {state} | District: {dist} | Tehsil: {tehsil} | Village: {village}\n"
            f"Identifier: {id_type.capitalize()} {native_id}\n"
            f"Area: {area_raw or 'Not recorded'} | Land Classification: {land_use or 'General'}\n"
            f"Source System: {sys_name} ({src_id}) | Record ID: {src_rec}\n"
            f"Recorded Rights Holders: {'; '.join(rh_strs) if rh_strs else 'None recorded'}\n"
            f"Mutations: {'; '.join(mut_strs) if mut_strs else 'None recorded'}"
        )

        corpus.append({
            "id": f"CORPUS-PARCEL-{p_uid}",
            "type": "parcel_intelligence",
            "title": f"{state} {village} Parcel {native_id}",
            "text": text,
            "metadata": {
                "parcel_uid": p_uid,
                "state": state,
                "village": village,
                "native_identifier": native_id,
                "source_id": src_id,
                "domain": "Cadastral Intelligence"
            }
        })

    conn.close()

    os.makedirs(os.path.dirname(OUTPUT_PATH), exist_ok=True)
    with open(OUTPUT_PATH, "w", encoding="utf-8") as f:
        json.dump(corpus, f, indent=2, ensure_ascii=False)

    root_output = os.path.join(PROJECT_ROOT, "data", "processed", "ai_corpus.json")
    if os.path.exists(os.path.dirname(root_output)):
        with open(root_output, "w", encoding="utf-8") as f:
            json.dump(corpus, f, indent=2, ensure_ascii=False)

    print(f"[SUCCESS] Prepared AI Corpus with {len(corpus)} items.")
    print(f"          - Statutory Chunks: {len(doc_chunks)}")
    print(f"          - Land Parcels:     {len(parcels)}")
    print(f"          - Saved to:         {OUTPUT_PATH}")
    print(f"          - Saved to:         {OUTPUT_PATH}")
    return corpus

if __name__ == "__main__":
    prepare_corpus()
