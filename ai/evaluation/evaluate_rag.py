import time
import json
from ai.retrieval.hybrid_search import HybridSearchEngine
from ai.generation.rag_synthesizer import RAGSynthesizer

def run_rag_evaluation():
    engine = HybridSearchEngine()
    rag = RAGSynthesizer(engine)

    test_cases = [
        {
            "id": "EVAL-01",
            "question": "What is the statutory period under Section 23 of the LARR Act 2013 for the Collector to make an award before proceedings lapse?",
            "expected_doc_id": "DOC-RFCTLARR-2013",
            "should_refuse": False
        },
        {
            "id": "EVAL-02",
            "question": "Explain the Social Impact Assessment consultation requirements under Section 4.",
            "expected_doc_id": "DOC-RFCTLARR-2013",
            "should_refuse": False
        },
        {
            "id": "EVAL-03",
            "question": "What is ULPIN or Bhu-Aadhaar and what standard is it based on?",
            "expected_doc_id": "DOC-DILRMP-GUIDELINES",
            "should_refuse": False
        },
        {
            "id": "EVAL-04",
            "question": "What percentage of civil cases in district courts represent land and property disputes according to NJDG data?",
            "expected_doc_id": "DOC-PRS-BRIEF-LAND",
            "should_refuse": False
        },
        {
            "id": "EVAL-05",
            "question": "What is the capital of France and its metro train ticketing rules?",
            "expected_doc_id": None,
            "should_refuse": True
        }
    ]

    hits = 0
    citations_valid = 0
    refusals_correct = 0
    case_results = []

    for test in test_cases:
        t0 = time.time()
        resp = rag.answer(test["question"])
        latency_ms = round((time.time() - t0) * 1000, 2)

        if not test["should_refuse"] and test["expected_doc_id"]:
            found = any(c["document_id"] == test["expected_doc_id"] for c in resp["evidence_cards"])
            if found:
                hits += 1

        if test["should_refuse"]:
            if resp["evidence_state"] == "insufficient":
                refusals_correct += 1

        if resp["citations"]["is_valid"]:
            citations_valid += 1

        case_results.append({
            "test_id": test["id"],
            "question": test["question"],
            "evidence_state": resp["evidence_state"],
            "retrieved_count": len(resp["evidence_cards"]),
            "top_document": resp["evidence_cards"][0]["document_id"] if resp["evidence_cards"] else None,
            "citations_valid": resp["citations"]["is_valid"],
            "latency_ms": latency_ms
        })

    summary = {
        "total_evaluated": len(test_cases),
        "retrieval_hit_rate_at_4": round(hits / 4, 2),
        "citation_validity_rate": round(citations_valid / len(test_cases), 2),
        "unsupported_refusal_rate": round(refusals_correct / 1, 2),
        "average_latency_ms": round(sum(r["latency_ms"] for r in case_results) / len(case_results), 2),
        "evaluated_at": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
        "test_case_results": case_results
    }

    with open("ai/evaluation/rag_eval_results.json", "w", encoding="utf-8") as f:
        json.dump(summary, f, indent=2)

    print("RAG Evaluation Benchmark Complete:")
    print(json.dumps(summary, indent=2))
    return summary

if __name__ == "__main__":
    run_rag_evaluation()
