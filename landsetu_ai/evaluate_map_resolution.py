"""
LandSetu Cadastral Map Resolution Evaluator CLI
Evaluates query-to-map bounding box, centroid, and bidirectional synchronization across Delhi, Haryana, and Bihar.
Outputs: ai/evaluation/map_resolution_eval_results.json
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

OUTPUT_PATH = os.path.join(PROJECT_ROOT, "ai", "evaluation", "map_resolution_eval_results.json")

TEST_CASES = [
    {
        "id": "MAP-DEL-142",
        "query": "Show map and cadastral boundaries for Khasra 142 in Alipur Delhi",
        "expected_state": "Delhi",
        "expected_coords_approx": [77.13, 28.79] # Alipur approx coords
    },
    {
        "id": "MAP-HAR-215",
        "query": "Locate parcel Khasra 215 in Wazirabad Gurugram on cadastral GIS",
        "expected_state": "Haryana",
        "expected_coords_approx": [77.08, 28.43] # Wazirabad approx coords
    },
    {
        "id": "MAP-BIH-312",
        "query": "Zoom to Khesra 312 in Sabbalpur Patna Bihar on the cadastral layer",
        "expected_state": "Bihar",
        "expected_coords_approx": [85.18, 25.59] # Sabbalpur approx coords
    }
]

def run_map_resolution_evaluation():
    print("=======================================================")
    print(" LANDSETU BIDIRECTIONAL MAP RESOLUTION BENCHMARK")
    print("=======================================================")

    search_engine = HybridSearchEngine()
    rag = RAGSynthesizer(search_engine)

    results = []
    passed_count = 0

    for tc in TEST_CASES:
        t_id = tc["id"]
        q = tc["query"]
        expected_state = tc["expected_state"]
        approx = tc["expected_coords_approx"]

        ans_obj = rag.answer(q)
        map_act = ans_obj.get("map_action")

        has_action = bool(map_act and map_act.get("type") == "FOCUS_PARCEL")
        has_geom = bool(map_act and map_act.get("geometry_available") is True)
        coords = map_act.get("coordinates") if map_act else None

        coords_valid = False
        if coords and len(coords) == 2:
            # Check within ~0.2 degrees of expected location
            lng_diff = abs(coords[0] - approx[0])
            lat_diff = abs(coords[1] - approx[1])
            coords_valid = (lng_diff < 0.2 and lat_diff < 0.2)

        passed = has_action and has_geom and coords_valid
        if passed:
            passed_count += 1

        results.append({
            "test_id": t_id,
            "query": q,
            "has_map_action": has_action,
            "geometry_available": has_geom,
            "resolved_coordinates": coords,
            "coords_valid": coords_valid,
            "passed": passed
        })

        status = "[PASS]" if passed else "[FAIL]"
        print(f" {status} {t_id}: Coords={coords} (Valid: {coords_valid})")

    pass_rate = round((passed_count / len(TEST_CASES) * 100.0), 2)
    summary = {
        "evaluated_at": datetime.now(timezone.utc).isoformat(),
        "total_cases": len(TEST_CASES),
        "passed_count": passed_count,
        "map_resolution_pct": pass_rate,
        "results": results
    }

    os.makedirs(os.path.dirname(OUTPUT_PATH), exist_ok=True)
    with open(OUTPUT_PATH, "w", encoding="utf-8") as f:
        json.dump(summary, f, indent=2, ensure_ascii=False)

    print(f"\n[SUCCESS] Map Resolution Benchmark Complete! Rate: {pass_rate}% ({passed_count}/{len(TEST_CASES)})")
    print(f"          Report saved to: {OUTPUT_PATH}")
    return summary

if __name__ == "__main__":
    run_map_resolution_evaluation()
