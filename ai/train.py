import os
import json
from datetime import datetime, timezone
import numpy as np
import pandas as pd
from sklearn.ensemble import GradientBoostingClassifier, RandomForestRegressor
from sklearn.model_selection import train_test_split
from sklearn.metrics import (
    roc_auc_score,
    accuracy_score,
    precision_score,
    recall_score,
    f1_score,
    mean_absolute_error
)

try:
    import joblib
except ImportError:
    try:
        from sklearn.utils import _joblib as joblib
    except ImportError:
        import pickle as joblib

def train_acquisition_delay_model(
    output_model_path: str = "ai/models/acquisition_delay_model.joblib",
    output_metrics_path: str = "ai/evaluation/model_metrics.json",
    random_seed: int = 42
):
    print("=========================================================")
    print("  LandSetu AI: Training Acquisition Delay Risk ML Model  ")
    print("  Source: CAG Performance Audit & Land Conflict Watch   ")
    print("=========================================================")
    os.makedirs(os.path.dirname(output_model_path), exist_ok=True)
    os.makedirs(os.path.dirname(output_metrics_path), exist_ok=True)

    csv_path = "backend/data/models/training_calibration_dataset.csv"
    if not os.path.exists(csv_path):
        csv_path = "ai/models/training_calibration_dataset.csv"
    
    if not os.path.exists(csv_path):
        import sys
        sys.path.append(os.getcwd())
        from backend.scripts.build_real_project_dataset import build_real_dataset
        build_real_dataset()

    print(f"[1/4] Loading real historical project records from {csv_path}...")
    df = pd.read_csv(csv_path)
    print(f"      Total real documented project records: {len(df)}")

    training_csv_path = "ai/models/training_calibration_dataset.csv"
    df.to_csv(training_csv_path, index=False)

    features = [
        "land_area_hectares", "affected_families", "compensation_assessed_crores",
        "compensation_ratio", "litigation_cases_count", "statutory_months",
        "rr_settled_ratio", "is_linear_project", "high_litigation_state"
    ]

    X = df[features]
    y_cls = df["is_delayed"]
    y_reg = df["risk_score"]

    X_train, X_test, y_train_cls, y_test_cls, y_train_reg, y_test_reg = train_test_split(
        X, y_cls, y_reg, test_size=0.25, random_state=random_seed
    )

    print("[2/4] Fitting GradientBoostingClassifier (Delay Probability)...")
    clf = GradientBoostingClassifier(n_estimators=80, max_depth=4, learning_rate=0.08, random_state=random_seed)
    clf.fit(X_train, y_train_cls)

    print("[3/4] Fitting RandomForestRegressor (Risk Score Duration)...")
    reg = RandomForestRegressor(n_estimators=100, max_depth=5, random_state=random_seed)
    reg.fit(X_train, y_train_reg)

    y_pred_cls = clf.predict(X_test)
    y_prob_cls = clf.predict_proba(X_test)[:, 1]
    y_pred_reg = reg.predict(X_test)

    metrics = {
        "model_name": "LandSetu-Acquisition-Delay-Risk-GBM-v1",
        "algorithm": "GradientBoostingClassifier + RandomForestRegressor",
        "training_samples": len(X_train),
        "test_samples": len(X_test),
        "accuracy": float(round(accuracy_score(y_test_cls, y_pred_cls), 4)),
        "precision": float(round(precision_score(y_test_cls, y_pred_cls), 4)),
        "recall": float(round(recall_score(y_test_cls, y_pred_cls), 4)),
        "f1_score": float(round(f1_score(y_test_cls, y_pred_cls), 4)),
        "roc_auc": float(round(roc_auc_score(y_test_cls, y_prob_cls), 4)),
        "mean_absolute_error_score": float(round(mean_absolute_error(y_test_reg, y_pred_reg), 2)),
        "feature_importances": {
            feat: float(round(imp, 4))
            for feat, imp in zip(features, clf.feature_importances_)
        },
        "trained_at": datetime.now(timezone.utc).isoformat()
    }

    print("[4/4] Serializing model and saving evaluation metrics...")
    model_bundle = {
        "classifier": clf,
        "regressor": reg,
        "features": features,
        "metrics": metrics
    }

    # Save to primary ai/ directory
    joblib.dump(model_bundle, output_model_path)
    with open(output_metrics_path, "w", encoding="utf-8") as f:
        json.dump(metrics, f, indent=2)

    # Persist directly into backend/data/models/ so that backend owns and preserves all trained data
    backend_models_dir = "backend/data/models"
    os.makedirs(backend_models_dir, exist_ok=True)
    backend_model_path = os.path.join(backend_models_dir, "acquisition_delay_model.joblib")
    backend_metrics_path = os.path.join(backend_models_dir, "model_metrics.json")
    backend_csv_path = os.path.join(backend_models_dir, "training_calibration_dataset.csv")

    joblib.dump(model_bundle, backend_model_path)
    with open(backend_metrics_path, "w", encoding="utf-8") as f:
        json.dump(metrics, f, indent=2)
    df.to_csv(backend_csv_path, index=False)

    print("---------------------------------------------------------")
    print(f"SUCCESS: Model saved to -> {output_model_path}")
    print(f"SUCCESS: Model persistently saved to Backend -> {backend_model_path}")
    print(f"Accuracy:  {metrics['accuracy'] * 100:.2f}%")
    print(f"ROC-AUC:   {metrics['roc_auc']:.4f}")
    print(f"F1 Score:  {metrics['f1_score']:.4f}")
    print(f"MAE:       {metrics['mean_absolute_error_score']} points")
    print("---------------------------------------------------------")
    return metrics

if __name__ == "__main__":
    train_acquisition_delay_model()
