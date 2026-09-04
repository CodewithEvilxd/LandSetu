"""
LandSetu Multilingual & Regional Terminology Evaluator CLI
Evaluates intent routing and entity extraction across Hindi, English, and regional dialect terms.
Outputs: ai/evaluation/multilingual_eval_results.json
"""

import os
import sys
import json
from datetime import datetime, timezone

PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
if PROJECT_ROOT not in sys.path:
    sys.path.insert(0, PROJECT_ROOT)

from ai.intent.intent_router import detect_query_intent
from ai.retrieval.hybrid_search import HybridSearchEngine
from ai.generation.rag_synthesizer import RAGSynthesizer

OUTPUT_PATH = os.path.join(PROJECT_ROOT, "ai", "evaluation", "multilingual_eval_results.json")

TEST_CASES = [
    {
        "id": "ML-DEL-HI",
        "query": "दिल्ली के अलीपुर गाँव का खसरा 142 किसके नाम है?",
        "expected_state": "Delhi",
        "expected_village": "Alipur",
        "expected_khasra": "142",
        "expected_intent": "PARCEL_LOOKUP"
    },
    {
        "id": "ML-HAR-HI",
        "query": "हरियाणा वजीराबाद खेवट 125 और खसरा संख्या 215 की जमाबंदी बताओ",
        "expected_state": "Haryana",
        "expected_village": "Wazirabad",
        "expected_khasra": "215",
        "expected_intent": "PARCEL_LOOKUP"
    },
    {
        "id": "ML-BIH-HI",
        "query": "बिहार पटना सबबलपुर खेसरा 312 का खतियान और रैयत का विवरण",
        "expected_state": "Bihar",
        "expected_village": "Sabbalpur",
        "expected_khasra": "312",
        "expected_intent": "PARCEL_LOOKUP"
    },
    {
        "id": "ML-COMPOSITE",
        "query": "BIHAR|PATNA|PATNA_SADAR|SABBALPUR|312",
        "expected_state": "Bihar",
        "expected_village": "Sabbalpur",
        "expected_khasra": "312",
        "expected_intent": "PARCEL_LOOKUP"
    },
    {
        "id": "ML-HINGLISH",
        "query": "Sabbalpur Bihar me khesra no 313 ka owner aur rakba kitna hai?",
        "expected_state": "Bihar",
        "expected_village": "Sabbalpur",
        "expected_khasra": "313",
        "expected_intent": "PARCEL_LOOKUP"
    }
]

def run_multilingual_evaluation():
    print("=======================================================")
    print(" LANDSETU MULTILINGUAL & REGIONAL INTENT EVALUATION")
    print("=======================================================")

    search_engine = HybridSearchEngine()
    synthesizer = RAGSynthesizer(search_engine)

    results = []
    passed_count = 0

    for tc in TEST_CASES:
        tc_id = tc["id"]
        q = tc["query"]
        intent_info = detect_query_intent(q)
        intent = intent_info.get("intent")
        ent = intent_info.get("extracted_entities", {})

        state_ok = tc["expected_state"] in (ent.get("states") or [])
        village_ok = tc["expected_village"] in (ent.get("villages") or [])
        khasra_ok = str(tc["expected_khasra"]) == str(ent.get("khasra") or "")
        intent_ok = intent == tc["expected_intent"]

        # Run synthesis check
        ans_obj = synthesizer.answer(q)
        has_answer = len(ans_obj.get("answer_text", "")) > 50

        passed = state_ok and village_ok and khasra_ok and intent_ok and has_answer
        if passed:
            passed_count += 1

        results.append({
            "test_id": tc_id,
            "query": q,
            "intent_detected": intent,
            "extracted_state": ent.get("states"),
            "extracted_village": ent.get("villages"),
            "extracted_khasra": ent.get("khasra"),
            "state_match": state_ok,
            "village_match": village_ok,
            "khasra_match": khasra_ok,
            "intent_match": intent_ok,
            "passed": passed
        })

        safe_q = q.encode("ascii", "backslashreplace").decode()
        status = "[PASS]" if passed else "[FAIL]"
        print(f" {status} {tc_id}: '{safe_q}' -> Match: State={state_ok}, Village={village_ok}, ID={khasra_ok}")

    pass_rate = round((passed_count / len(TEST_CASES) * 100.0), 2)
    summary = {
        "evaluated_at": datetime.now(timezone.utc).isoformat(),
        "total_queries": len(TEST_CASES),
        "passed_count": passed_count,
        "pass_rate_pct": pass_rate,
        "results": results
    }

    os.makedirs(os.path.dirname(OUTPUT_PATH), exist_ok=True)
    with open(OUTPUT_PATH, "w", encoding="utf-8") as f:
        json.dump(summary, f, indent=2, ensure_ascii=False)

    print(f"\n[SUCCESS] Multilingual Evaluation Complete! Pass Rate: {pass_rate}% ({passed_count}/{len(TEST_CASES)})")
    print(f"          Report saved to: {OUTPUT_PATH}")
    return summary

if __name__ == "__main__":
    run_multilingual_evaluation()
