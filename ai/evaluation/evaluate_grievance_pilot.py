import json
import os
import sys
from collections import defaultdict

if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding="utf-8")
    except Exception:
        pass

def evaluate():
    file_path = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "data", "pilot_grievances_60.json")
    if not os.path.exists(file_path):
        file_path = "ai/data/pilot_grievances_60.json"

    with open(file_path, "r", encoding="utf-8") as f:
        records = json.load(f)

    total = len(records)
    baseline_correct = sum(1 for r in records if r["category"] == r["baseline_pred"])
    nlp_correct = sum(1 for r in records if r["category"] == r["nlp_pred"])

    categories = sorted(list(set(r["category"] for r in records)))

    def calc_metrics(pred_key):
        tp = defaultdict(int)
        fp = defaultdict(int)
        fn = defaultdict(int)
        for r in records:
            actual = r["category"]
            pred = r[pred_key]
            if actual == pred:
                tp[actual] += 1
            else:
                fp[pred] += 1
                fn[actual] += 1

        precisions = []
        recalls = []
        f1s = []
        for c in categories:
            p = tp[c] / (tp[c] + fp[c]) if (tp[c] + fp[c]) > 0 else 0
            r = tp[c] / (tp[c] + fn[c]) if (tp[c] + fn[c]) > 0 else 0
            f1 = (2 * p * r) / (p + r) if (p + r) > 0 else 0
            precisions.append(p)
            recalls.append(r)
            f1s.append(f1)

        macro_p = sum(precisions) / len(precisions)
        macro_r = sum(recalls) / len(recalls)
        macro_f1 = sum(f1s) / len(f1s)
        return macro_p, macro_r, macro_f1

    b_p, b_r, b_f1 = calc_metrics("baseline_pred")
    n_p, n_r, n_f1 = calc_metrics("nlp_pred")

    print("\n" + "="*70)
    print(f"LANDSETU EMPIRICAL EVALUATION: PILOT DATASET (N = {total})")
    print("="*70)
    print(f"{'Metric':<25} | {'Keyword Baseline':<20} | {'LandSetu NLP Pipeline':<20}")
    print("-"*70)
    print(f"{'Classification Accuracy':<25} | {baseline_correct/total*100:<19.1f}% | {nlp_correct/total*100:<19.1f}%")
    print(f"{'Macro Precision':<25} | {b_p*100:<19.1f}% | {n_p*100:<19.1f}%")
    print(f"{'Macro Recall':<25} | {b_r*100:<19.1f}% | {n_r*100:<19.1f}%")
    print(f"{'Macro F1-Score':<25} | {b_f1*100:<19.1f}% | {n_f1*100:<19.1f}%")
    print("="*70)
    print(f"Absolute Improvement: +{((nlp_correct - baseline_correct)/total)*100:.1f} Percentage Points")
    print("Dataset File: ai/data/pilot_grievances_60.json")
    print("="*70 + "\n")

if __name__ == "__main__":
    evaluate()
