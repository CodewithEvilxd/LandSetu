"""
LandSetu Comprehensive Parcel Resolution Evaluator CLI
Evaluates parcel resolution across Delhi, Haryana, and Bihar for composite IDs, single IDs, Hindi, and absent records.
Outputs: ai/evaluation/parcel_eval_results.json
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

OUTPUT_PATH = os.path.join(PROJECT_ROOT, "ai", "evaluation", "parcel_eval_results.json")

TEST_CASES = [
    {
        "id": "RES-DEL-01",
        "state": "Delhi",
        "query": "खसरा 142 अलीपुर दिल्ली के बारे में बताओ",
        "expected_identifier": "142",
        "expected_village": "Alipur",
        "should_resolve": True
    },
    {
        "id": "RES-HAR-01",
        "state": "Haryana",
        "query": "What is the area and owner of khasra 215 in wazirabad haryana?",
        "expected_identifier": "215",
        "expected_village": "Wazirabad",
        "should_resolve": True
    },
    {
        "id": "RES-BIH-01",
        "state": "Bihar",
        "query": "बिहार पटना सबबलपुर खेसरा संख्या 312 का रकबा और रैयत विवरण",
        "expected_identifier": "312",
        "expected_village": "Sabbalpur",
        "should_resolve": True
    },
    {
        "id": "RES-BIH-COMPOSITE",
        "state": "Bihar",
        "query": "BIHAR|PATNA|PATNA_SADAR|SABBALPUR|313",
        "expected_identifier": "313",
        "expected_village": "Sabbalpur",
        "should_resolve": True
    },
    {
        "id": "RES-DEL-COMPOSITE",
        "state": "Delhi",
        "query": "DELHI|NORTH_DELHI|ALIPUR|ALIPUR|142",
        "expected_identifier": "142",
        "expected_village": "Alipur",
        "should_resolve": True
    },
    {
        "id": "RES-NONEXISTENT",
        "state": "Unknown",
        "query": "Khasra 9999 in Village Nonexistent",
        "expected_identifier": "9999",
        "expected_village": "Nonexistent",
        "should_resolve": False
    }
]

def run_parcel_resolution():
    print("=======================================================")
    print(" LANDSETU PARCEL RESOLUTION BENCHMARK (3 STATES)")
    print("=======================================================")

    search_engine = HybridSearchEngine()
    rag = RAGSynthesizer(search_engine)

    results = []
    passed_count = 0

    for tc in TEST_CASES:
        t_id = tc["id"]
        q = tc["query"]
        expected_id = tc["expected_identifier"]
        expected_vil = tc["expected_village"]
        should_resolve = tc["should_resolve"]

        ans_obj = rag.answer(q)
        ans_text = ans_obj.get("answer_text", "")
        map_act = ans_obj.get("map_action")
        ev_state = ans_obj.get("evidence_state")

        did_resolve = bool(map_act and map_act.get("parcel_uid"))
        correct_behavior = (did_resolve == should_resolve)

        if correct_behavior:
            passed_count += 1

        results.append({
            "test_id": t_id,
            "query": q,
            "state": tc["state"],
            "expected_identifier": expected_id,
            "should_resolve": should_resolve,
            "did_resolve": did_resolve,
            "resolved_uid": map_act.get("parcel_uid") if map_act else None,
            "passed": correct_behavior
        })

        safe_q = q.encode("ascii", "backslashreplace").decode()
        status = "[PASS]" if correct_behavior else "[FAIL]"
        print(f" {status} {t_id}: '{safe_q}' -> Resolved: {did_resolve} (Expected: {should_resolve})")

    pass_rate = round((passed_count / len(TEST_CASES) * 100.0), 2)
    summary = {
        "evaluated_at": datetime.now(timezone.utc).isoformat(),
        "total_cases": len(TEST_CASES),
        "passed_count": passed_count,
        "pass_rate_pct": pass_rate,
        "results": results
    }

    os.makedirs(os.path.dirname(OUTPUT_PATH), exist_ok=True)
    with open(OUTPUT_PATH, "w", encoding="utf-8") as f:
        json.dump(summary, f, indent=2, ensure_ascii=False)

    print(f"\n[SUCCESS] Parcel Resolution Benchmark Complete! Pass Rate: {pass_rate}% ({passed_count}/{len(TEST_CASES)})")
    print(f"          Report saved to: {OUTPUT_PATH}")
    return summary

if __name__ == "__main__":
    run_parcel_resolution()
