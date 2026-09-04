"""
LandSetu AI Rebuild Index CLI
Prepares the unified corpus and reinitializes vector and BM25 search indices.
"""

import os
import sys

PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
if PROJECT_ROOT not in sys.path:
    sys.path.insert(0, PROJECT_ROOT)

from landsetu_ai.prepare_corpus import prepare_corpus
from ai.retrieval.hybrid_search import HybridSearchEngine

def rebuild_all_indexes():
    print("=======================================================")
    print(" LANDSETU REBUILD AI RETRIEVAL INDEX")
    print("=======================================================")

    # 1. Prepare latest unified corpus from DB
    prepare_corpus()

    # 2. Reinitialize search engine
    print("\n[*] Initializing Hybrid Search Engine with embeddings...")
    engine = HybridSearchEngine()
    print(f"[SUCCESS] Indexed {len(engine.chunks)} searchable chunks & records.")

    # 3. Quick sanity test queries
    print("\n[*] Running Index Verification Queries:")
    test_queries = [
        "Khasra 142 Alipur Delhi",
        "Khesra 312 Sabbalpur Patna Bihar",
        "Wazirabad Gurugram Jamabandi Khasra 215",
        "Noida Sector 115 Sorkha Gata 106",
        "Greater Noida Pari Chowk Kasna Gata 406",
        "Greater Noida West Bisrakh Gata 506",
        "Section 11 RFCTLARR Act 2013"
    ]
    for q in test_queries:
        res = engine.search(q, limit=2)
        top = res[0]["chunk"]["document_title"] if res else "No match"
        print(f"  Q: '{q}' -> Top Hit: {top}")


    print("\n[SUCCESS] AI Index Rebuild Completed!")

if __name__ == "__main__":
    rebuild_all_indexes()
