import sys
import json
import time

if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding="utf-8")
    except Exception:
        pass

from ai.retrieval.hybrid_search import HybridSearchEngine
from ai.generation.rag_synthesizer import RAGSynthesizer

def run_parcel_resolution_eval():
    print("=================================================")
    print(" MULTILINGUAL PARCEL RESOLUTION BENCHMARK")
    print("=================================================")

    engine = HybridSearchEngine()
    rag = RAGSynthesizer(engine)

    test_cases = [
        {
            "id": "PARCEL-EVAL-01",
            "lang": "hi",
            "query": "खसरा 142 अलीपुर दिल्ली के बारे में बताओ",
            "expected_khasra": "142",
            "expected_village": "Alipur",
            "expected_state": "Delhi",
            "should_resolve": True
        },
        {
            "id": "PARCEL-EVAL-02",
            "lang": "en",
            "query": "What is the area and owner of khasra 215 in wazirabad haryana?",
            "expected_khasra": "215",
            "expected_village": "Wazirabad",
            "expected_state": "Haryana",
            "should_resolve": True
        },
        {
            "id": "PARCEL-EVAL-03",
            "lang": "mixed",
            "query": "खसरा संख्या 143 alipur north delhi",
            "expected_khasra": "143",
            "expected_village": "Alipur",
            "expected_state": "Delhi",
            "should_resolve": True
        },
        {
            "id": "PARCEL-EVAL-04",
            "lang": "en",
            "query": "Details for composite parcel DELHI|NORTH_DELHI|ALIPUR|ALIPUR|142",
            "expected_khasra": "142",
            "expected_village": "Alipur",
            "expected_state": "Delhi",
            "should_resolve": True
        },
        {
            "id": "PARCEL-EVAL-05",
            "lang": "hi",
            "query": "खसरा 216 वजीराबाद गुरुग्राम हरियाणा का रकबा क्या है?",
            "expected_khasra": "216",
            "expected_village": "Wazirabad",
            "expected_state": "Haryana",
            "should_resolve": True
        },
        {
            "id": "PARCEL-EVAL-06",
            "lang": "adversarial_nonexistent",
            "query": "खसरा 999999 अलीपुर दिल्ली की जानकारी दो",
            "expected_khasra": "999999",
            "expected_village": "Alipur",
            "expected_state": "Delhi",
            "should_resolve": False  # Must strictly refuse
        }
    ]

    results = []
    correct_resolutions = 0
    correct_refusals = 0

    for tc in test_cases:
        t0 = time.time()
        ans = rag.answer(tc["query"])
        elapsed = time.time() - t0

        has_map_action = "map_action" in ans and ans["map_action"] is not None
        answer_text = ans.get("answer_text", "")
        evidence_state = ans.get("evidence_state", "")

        is_correct = False
        if tc["should_resolve"]:
            if has_map_action:
                ma = ans["map_action"]
                matched_khasra = str(ma.get("khasra", "")) == str(tc["expected_khasra"])
                matched_village = ma.get("village", "").lower() == tc["expected_village"].lower()
                matched_state = ma.get("state", "").lower() == tc["expected_state"].lower()
                if matched_khasra and matched_village and matched_state:
                    is_correct = True
                    correct_resolutions += 1
        else:
            # Should refuse
            refused = (not has_map_action) and ("Not available in LandSetu corpus" in answer_text or evidence_state == "insufficient")
            if refused:
                is_correct = True
                correct_refusals += 1

        status_str = "[PASS]" if is_correct else "[FAIL]"
        print(f"{status_str} {tc['id']} ({tc['lang']}): {tc['query']}")
        if not is_correct:
            print(f"       Expected should_resolve={tc['should_resolve']}, got map_action={has_map_action}")

        results.append({
            "id": tc["id"],
            "query": tc["query"],
            "lang": tc["lang"],
            "is_correct": is_correct,
            "has_map_action": has_map_action,
            "latency_ms": round(elapsed * 1000, 1)
        })

    total = len(test_cases)
    passed_total = correct_resolutions + correct_refusals
    accuracy = (passed_total / total) * 100

    print("-------------------------------------------------")
    print(f"TOTAL: {total} | PASSED: {passed_total} | ACCURACY: {accuracy:.1f}%")
    print(f"Correct Resolutions: {correct_resolutions} | Correct Refusals: {correct_refusals}")
    print("-------------------------------------------------")

    output_path = "ai/evaluation/parcel_eval_results.json"
    with open(output_path, "w", encoding="utf-8") as f:
        json.dump({
            "timestamp": time.time(),
            "total_cases": total,
            "passed": passed_total,
            "accuracy_pct": accuracy,
            "hallucination_rate_pct": 0.0 if correct_refusals == 1 else 100.0,
            "results": results
        }, f, indent=2, ensure_ascii=False)

    print(f"Results saved to {output_path}")

    if passed_total < total:
        sys.exit(1)

if __name__ == "__main__":
    run_parcel_resolution_eval()
