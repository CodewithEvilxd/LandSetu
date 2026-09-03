import time
import json
from ai.retrieval.hybrid_search import HybridSearchEngine
from ai.generation.rag_synthesizer import RAGSynthesizer

def run_rag_evaluation():
    engine = HybridSearchEngine()
    rag = RAGSynthesizer(engine)

    test_cases = [
        # 1. Statutory Milestones & RFCTLARR Act 2013
        {
            "id": "EVAL-01",
            "question": "What is the statutory period under Section 23 of the LARR Act 2013 for the Collector to make an award before proceedings lapse?",
            "expected_doc_id": "DOC-RFCTLARR-2013",
            "should_refuse": False
        },
        {
            "id": "EVAL-02",
            "question": "Explain the Social Impact Assessment consultation requirements under Section 4 of LARR Act 2013.",
            "expected_doc_id": "DOC-RFCTLARR-2013",
            "should_refuse": False
        },
        {
            "id": "EVAL-03",
            "question": "What are the publication requirements for a preliminary notification under Section 11 of the 2013 Act?",
            "expected_doc_id": "DOC-RFCTLARR-2013",
            "should_refuse": False
        },
        {
            "id": "EVAL-04",
            "question": "What is the time limit for issuing a declaration under Section 19 after the preliminary notification?",
            "expected_doc_id": "DOC-RFCTLARR-2013",
            "should_refuse": False
        },
        {
            "id": "EVAL-05",
            "question": "How is solatium calculated under Section 30 of the RFCTLARR Act 2013?",
            "expected_doc_id": "DOC-RFCTLARR-2013",
            "should_refuse": False
        },
        {
            "id": "EVAL-06",
            "question": "What happens if acquired land remains unutilized for 5 years under Section 101?",
            "expected_doc_id": "DOC-RFCTLARR-2013",
            "should_refuse": False
        },

        # 2. DILRMP Operational Guidelines & Standards
        {
            "id": "EVAL-07",
            "question": "What is ULPIN or Bhu-Aadhaar and what standard is it based on?",
            "expected_doc_id": "DOC-DILRMP-GUIDELINES",
            "should_refuse": False
        },
        {
            "id": "EVAL-08",
            "question": "Explain the integration of Sub-Registrar Offices (SRO) and revenue tehsils under DILRMP.",
            "expected_doc_id": "DOC-DILRMP-GUIDELINES",
            "should_refuse": False
        },
        {
            "id": "EVAL-09",
            "question": "What are the core technical standards for cadastral map digitization under DILRMP?",
            "expected_doc_id": "DOC-DILRMP-GUIDELINES",
            "should_refuse": False
        },

        # 3. Judicial Statistics & Conclusive Titling Policy
        {
            "id": "EVAL-10",
            "question": "What percentage of civil cases in district courts represent land and property disputes according to NJDG data?",
            "expected_doc_id": "DOC-PRS-BRIEF-LAND",
            "should_refuse": False
        },
        {
            "id": "EVAL-11",
            "question": "Explain the difference between presumptive titling and the Torrens conclusive titling system in India.",
            "expected_doc_id": "DOC-PRS-BRIEF-LAND",
            "should_refuse": False
        },

        # 4. Multilingual Hindi Query Support
        {
            "id": "EVAL-12",
            "question": "भू-अभिलेख और खतौनी में ULPIN भू-आधार कैसे दर्ज किया जाता है?",
            "expected_doc_id": "DOC-DILRMP-GUIDELINES",
            "should_refuse": False
        },

        # 5. Out-of-Domain Refusal Cases (Strict Hallucination Prevention)
        {
            "id": "EVAL-13",
            "question": "What is the capital of France and its metro train ticketing rules?",
            "expected_doc_id": None,
            "should_refuse": True
        },
        {
            "id": "EVAL-14",
            "question": "How to bake a chocolate cake in a convection microwave oven?",
            "expected_doc_id": None,
            "should_refuse": True
        },
        {
            "id": "EVAL-15",
            "question": "Who won the ICC Cricket Men's World Cup final in 2011?",
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

    total_query_tests = len([t for t in test_cases if not t["should_refuse"]])
    total_refusal_tests = len([t for t in test_cases if t["should_refuse"]])

    summary = {
        "total_evaluated": len(test_cases),
        "grounded_statutory_queries": total_query_tests,
        "adversarial_refusal_queries": total_refusal_tests,
        "retrieval_hit_rate_at_4": round(hits / total_query_tests, 4) if total_query_tests else 1.0,
        "citation_validity_rate": round(citations_valid / len(test_cases), 4),
        "unsupported_refusal_rate": round(refusals_correct / total_refusal_tests, 4) if total_refusal_tests else 1.0,
        "average_latency_ms": round(sum(c["latency_ms"] for c in case_results) / len(case_results), 2),
        "evaluated_at": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
        "test_case_results": case_results
    }

    with open("ai/evaluation/rag_eval_results.json", "w", encoding="utf-8") as f:
        json.dump(summary, f, indent=2, ensure_ascii=False)

    print("RAG Evaluation Benchmark (15 Comprehensive Cases) Complete:")
    print(json.dumps(summary, indent=2))
    return summary

if __name__ == "__main__":
    run_rag_evaluation()
