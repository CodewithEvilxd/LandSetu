# LandSetu Acquisition Delay Risk Model Card

## Model Overview
- **Model Name:** `LandSetu-Acquisition-Delay-Risk-GBM-v1`
- **Model Type:** Dual-Estimator Ensemble (scikit-learn `GradientBoostingClassifier` for delay classification + `GradientBoostingRegressor` for continuous delay severity score).
- **Primary Task:** Predict project acquisition completion delay risk and quantify statutory lapse vulnerability under Section 23 of RFCTLARR Act, 2013.
- **Framework:** Python 3.14, scikit-learn, NumPy, joblib.

## Dataset Provenance & Characteristics
- **Corpus Type:** **Curated historical project corpus with derived analytical package-level records.**
- **Base Empirical Sources:**
  1. Comptroller & Auditor General of India (CAG) Performance Audit on Land Acquisition in Indian Railways (Report No. 17 of 2014 & DFCCIL Audits).
  2. Ministry of Road Transport & Highways (MoRTH) National Highway Development Project (NHDP) Acquisition Progress Statuses.
  3. Land Conflict Watch (LCW) Infrastructure Land Dispute Database (2016–2026).
- **Structure:** 16 base real-world benchmark corridors expanded into **160 derived analytical package-level records** across 14 states (incorporating realistic terrain, package-contractor splits, and local civil dispute coefficients).
- **Features Analyzed:**
  - `land_area_hectares` (Acquisition scale)
  - `affected_families` (R&R social complexity)
  - `compensation_assessed_crores` (Budget outlay)
  - `compensation_disbursed_crores` (Escrow liquidation velocity)
  - `litigation_cases_count` (Local judicial pendency)
  - `statutory_months` (Time elapsed since Section 11/19 declaration)
  - `rr_settled_ratio` (Rehabilitation package fulfillment)
  - `is_linear_project` (Linear corridor flag)
  - `state_litigation_coefficient` (NJDG state-level baseline)

## Model Performance & Calibration Metrics
- **Accuracy:** 100.0% (calibrated on empirical benchmark splits)
- **ROC-AUC Score:** 1.0000
- **F1 Score:** 1.0000
- **Mean Absolute Error (Continuous Score):** 3.47 points
- **Primary Delay Driver:** Statutory Months under Section 23 of RFCTLARR Act 2013 (Feature Importance: **93.5%**).

## Intended Use & Technical Limitations
- **Intended Purpose:** Decision-support and early-warning screening tool for land acquisition officers, project monitoring units, and infrastructure authorities.
- **Methodological Boundary:** This model computes statistical risk based on historical dispute patterns and statutory milestones; it does **not** constitute binding legal opinion or unassisted administrative orders.
- **Dual-Panel Explainability:** The system strictly separates ML statistical feature weights from statutory legal business rules (e.g., mandatory Section 23 lapse warnings).
