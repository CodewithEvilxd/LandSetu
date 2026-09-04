"""
LandSetu Core RAG Evaluator CLI
Evaluates extractive synthesis, grounding, and response accuracy across legal, policy, and parcel queries.
Outputs: ai/evaluation/rag_eval_results.json
"""

import os
import sys
import json
from datetime import datetime, timezone

PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
if PROJECT_ROOT not in sys.path:
    sys.path.insert(0, PROJECT_ROOT)

from ai.retrieval.hybrid_search import HybridSearchEngine
from ai.generation.rag_synthesizer import RAGSynthesizer

OUTPUT_PATH = os.path.join(PROJECT_ROOT, "ai", "evaluation", "rag_eval_results.json")

TEST_QUERIES = [
    {
        "id": "Q-DEL-01",
        "query": "Details for Khasra 142 in Village Alipur, Delhi",
        "expected_intent": "PARCEL_LOOKUP",
        "expected_keywords": ["142", "Alipur", "Satish Kumar", "0.842"]
    },
    {
        "id": "Q-HAR-01",
        "query": "Who is the recorded owner for Khasra 215 in Wazirabad, Gurugram, Haryana?",
        "expected_intent": "PARCEL_LOOKUP",
        "expected_keywords": ["215", "Wazirabad", "Kuldeep Singh", "0.505"]
    },
    {
        "id": "Q-BIH-01",
        "query": "What are the details of Khesra 312 in Sabbalpur, Patna, Bihar?",
        "expected_intent": "PARCEL_LOOKUP",
        "expected_keywords": ["312", "Sabbalpur", "Awadhesh Prasad Singh", "0.632"]
    },
    {
        "id": "Q-LEG-01",
        "query": "What is the statutory deadline under Section 23 of the RFCTLARR Act 2013?",
        "expected_intent": "LEGAL_STATUTE",
        "expected_keywords": ["Section 23", "award", "Collector", "twelve months"]
    },
    {
        "id": "Q-MISS-01",
        "query": "What is the mortgage status of Khasra 9999 in Nonexistent Village?",
        "expected_intent": "PARCEL_LOOKUP",
        "expected_keywords": ["not available", "corpus"]
    }
]

def run_evaluation():
    print("=======================================================")
    print(" LANDSETU CORE RAG BENCHMARK EVALUATION")
    print("=======================================================")

    search_engine = HybridSearchEngine()
    synthesizer = RAGSynthesizer(search_engine)

    results = []
    passed_count = 0

    for item in TEST_QUERIES:
        q_id = item["id"]
        query = item["query"]
        expected_intent = item["expected_intent"]
        expected_kw = item["expected_keywords"]

        synth_result = synthesizer.synthesize(query)
        ans = synth_result.get("answer", "")
        intent = synth_result.get("intent_routed", "")
        cits = synth_result.get("citations", [])

        # Check keyword hits
        kw_hits = [kw for kw in expected_kw if kw.lower() in ans.lower()]
        has_keywords = len(kw_hits) >= max(1, len(expected_kw) // 2)
        intent_matched = intent == expected_intent
        passed = intent_matched and has_keywords

        if passed:
            passed_count += 1

        results.append({
            "test_id": q_id,
            "query": query,
            "intent_routed": intent,
            "intent_matched": intent_matched,
            "keyword_hits": kw_hits,
            "passed": passed,
            "citations_count": len(cits),
            "answer_preview": ans[:160] + "..." if len(ans) > 160 else ans
        })

        status = "[PASS]" if passed else "[FAIL]"
        print(f" {status} {q_id}: '{query}' -> Intent: {intent} (Passed: {passed})")

    pass_rate = round((passed_count / len(TEST_QUERIES) * 100.0), 2)
    summary = {
        "evaluated_at": datetime.now(timezone.utc).isoformat(),
        "total_queries": len(TEST_QUERIES),
        "passed_count": passed_count,
        "pass_rate_pct": pass_rate,
        "results": results
    }

    os.makedirs(os.path.dirname(OUTPUT_PATH), exist_ok=True)
    with open(OUTPUT_PATH, "w", encoding="utf-8") as f:
        json.dump(summary, f, indent=2, ensure_ascii=False)

    print(f"\n[SUCCESS] RAG Evaluation Complete! Pass Rate: {pass_rate}% ({passed_count}/{len(TEST_QUERIES)})")
    print(f"          Report saved to: {OUTPUT_PATH}")
    return summary

if __name__ == "__main__":
    run_evaluation()
