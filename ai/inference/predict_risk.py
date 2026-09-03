import os
import sys
import json
import joblib
import numpy as np

def predict_project_risk(input_features: dict) -> dict:
    model_path = "backend/data/models/acquisition_delay_model.joblib" if os.path.exists("backend/data/models/acquisition_delay_model.joblib") else "ai/models/acquisition_delay_model.joblib"
    data = joblib.load(model_path)
    clf = data["classifier"]
    reg = data["regressor"]
    features = data["features"]
    
    # Extract feature vector
    land_area = float(input_features.get("land_area_hectares", 100.0))
    affected_families = float(input_features.get("affected_families", 200.0))
    comp_assessed = float(input_features.get("compensation_assessed_crores", 50.0))
    comp_disbursed = float(input_features.get("compensation_disbursed_crores", 40.0))
    comp_ratio = comp_disbursed / max(comp_assessed, 0.01)
    litigation = float(input_features.get("litigation_cases_count", 0))
    statutory_months = float(input_features.get("statutory_months", 12.0))
    rr_ratio = float(input_features.get("rr_settled_ratio", 0.8))
    is_linear = 1.0 if input_features.get("is_linear_project", True) else 0.0
    state = str(input_features.get("state", ""))
    
    # Ground state litigation coefficient in official NJDG dataset
    high_lit = 0.0
    njdg_path = "backend/data/raw/njdg_land_disputes.json"
    if os.path.exists(njdg_path) and state:
        try:
            with open(njdg_path, "r", encoding="utf-8") as f:
                njdg_data = json.load(f)
                for row in njdg_data:
                    if row.get("state_ut", "").lower() == state.lower():
                        if row.get("land_disputes_share_pct", 0) >= 60.0 or row.get("median_disposal_time_years", 0) >= 6.5:
                            high_lit = 1.0
                        break
        except Exception:
            high_lit = 1.0 if state.lower() in ["uttar pradesh", "maharashtra", "bihar", "madhya pradesh", "rajasthan", "karnataka"] else 0.0
    elif state.lower() in ["uttar pradesh", "maharashtra", "bihar", "madhya pradesh", "rajasthan", "karnataka"]:
        high_lit = 1.0
    
    feature_row = [
        land_area, affected_families, comp_assessed, comp_ratio,
        litigation, statutory_months, rr_ratio, is_linear, high_lit
    ]
    import pandas as pd
    X = pd.DataFrame([feature_row], columns=features)
    
    prob_delay = float(clf.predict_proba(X)[0][1])
    risk_score = float(np.clip(reg.predict(X)[0], 0.0, 100.0))
    
    if risk_score >= 70.0:
        category = "High"
    elif risk_score >= 40.0:
        category = "Medium"
    else:
        category = "Low"
        
    # Explainable delay drivers calculation
    delay_drivers = []
    if comp_ratio < 0.75:
        delay_drivers.append({
            "driver": "Compensation Disbursement Backlog",
            "impact_pct": round((1.0 - comp_ratio) * 45, 1),
            "severity": "High" if comp_ratio < 0.6 else "Medium",
            "details": f"Only {comp_ratio*100:.1f}% of assessed compensation disbursed (deficit of ₹{comp_assessed - comp_disbursed:.1f} Cr)."
        })
    if litigation > 5:
        delay_drivers.append({
            "driver": "Pending Judicial Title Disputes",
            "impact_pct": round(min(litigation * 2.5, 30.0), 1),
            "severity": "High" if litigation > 20 else "Medium",
            "details": f"{int(litigation)} active writ petitions / civil disputes pending in courts."
        })
    if rr_ratio < 0.8:
        delay_drivers.append({
            "driver": "Rehabilitation & Resettlement (R&R) Deficit",
            "impact_pct": round((1.0 - rr_ratio) * 30, 1),
            "severity": "High" if rr_ratio < 0.5 else "Medium",
            "details": f"Only {rr_ratio*100:.1f}% of affected families successfully resettled."
        })
    if statutory_months > 18.0:
        delay_drivers.append({
            "driver": "Statutory Lapse Risk (Section 23 LARR Act)",
            "impact_pct": round(min((statutory_months - 12) * 2.0, 20.0), 1),
            "severity": "High" if statutory_months > 24 else "Medium",
            "details": f"{statutory_months:.1f} months elapsed since Sec 11 notification (statutory limit 12 months)."
        })
        
    if not delay_drivers:
        delay_drivers.append({
            "driver": "Routine Administrative Monitoring",
            "impact_pct": 5.0,
            "severity": "Low",
            "details": "All milestones within statutory thresholds."
        })
        
    # Actionable mitigation recommendations
    recommendations = []
    if comp_ratio < 0.75:
        recommendations.append("Expedite Special Land Acquisition Officer (SLAO) bank escrow account releases to achieve >90% disbursement.")
    if litigation > 5:
        recommendations.append("Convene district Lok Adalat or Land Acquisition, Rehabilitation & Resettlement Authority (LARRA) fast-track bench.")
    if rr_ratio < 0.8:
        recommendations.append("Accelerate basic civic amenities hand-over at designated R&R resettlement colonies.")
    if statutory_months > 18.0:
        recommendations.append("Issue immediate gazette declaration under Section 19(1) to avoid total lapse of acquisition proceedings.")
    if not recommendations:
        recommendations.append("Maintain monthly milestone auditing and GIS boundary verification.")
        
    return {
        "risk_score": round(risk_score, 1),
        "risk_category": category,
        "probability_of_delay": round(prob_delay, 3),
        "model_version": "LandSetu-Acquisition-Delay-Risk-GBM-v1",
        "delay_drivers": delay_drivers,
        "actionable_recommendations": recommendations
    }

if __name__ == "__main__":
    if len(sys.argv) > 1:
        payload = json.loads(sys.argv[1])
        result = predict_project_risk(payload)
        print(json.dumps(result))
    else:
        # Default test
        test_case = {
            "land_area_hectares": 1240.0,
            "affected_families": 4650,
            "compensation_assessed_crores": 940.0,
            "compensation_disbursed_crores": 510.0,
            "litigation_cases_count": 86,
            "statutory_months": 26.0,
            "rr_settled_ratio": 0.48,
            "is_linear_project": False,
            "state": "Andhra Pradesh"
        }
        res = predict_project_risk(test_case)
        print("Test Case Result:")
        print(json.dumps(res, indent=2))
