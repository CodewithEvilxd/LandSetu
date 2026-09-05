# LandSetu (भूमिसेतु) — SIH26019 Prototype

**National Digital Platform for Land Governance Research, Policy Innovation & Intelligence**  
*Primary Problem Statement: SIH26019*  
*Supporting Capabilities: SIH26018 (OCR & Digitization), SIH26016 (Acquisition Lifecycle & Monitoring), SIH26015 (GIS, Satellite & Spatial Analysis), SIH25017 (Predictive Delay Risk ML)*

---

## 📂 Repository Layout

```
D:\Sih Proto\
├── ai/                     # Python 3.14 FastAPI Microservice (Port 5001)
│   ├── server.py           # Central REST API (RAG, Search, Intent, OCR, Risk)
│   ├── train.py            # Calibrated ML Training Pipeline
│   ├── intent/             # Query Classification & Named Entity Recognition
│   ├── embeddings/         # 128-dimensional Domain Dense Vectors
│   ├── retrieval/          # Hybrid BM25 Lexical + Semantic Vector Search
│   ├── generation/         # Grounded RAG Synthesizer (Zero-Hallucination Thresholds)
│   ├── citation/           # Deterministic Document Citation Validator
│   ├── ocr/                # Multilingual Revenue Record OCR & Encumbrance Extractor
│   ├── inference/          # Machine Learning Delay Risk Inference
│   ├── models/             # Serialized Model Artifacts (GBM + RF) & Training CSV
│   └── evaluation/         # Automated Benchmark Suite & Scorecard
│
├── backend/                # Node.js 24 Express Server + Native SQLite (Port 5000)
│   ├── src/                # Modular Domain Routers & Services
│   │   ├── db/             # Node 24 native DatabaseSync (40 Normalized SQLite Tables)
│   │   ├── middleware/     # JWT RBAC (public, researcher, official, admin)
│   │   ├── modules/        # 14 Domain Feature Routers
│   │   └── services/       # Resilient HTTP Client Bridge to AI Microservice
│   ├── data/               # Authoritative Data Core
│   │   ├── landsetu.db     # SQLite Database (All Relational & GeoJSON Entities)
│   │   ├── raw/            # Official JSON/CSV Datasets (DILRMP, NJDG, NHAI)
│   │   ├── models/         # Persistently Synced ML Model Artifacts & CSVs
│   │   └── source_registry.json # Cryptographic SHA-256 Provenance Ledger
│   ├── scripts/            # Startup & Automation Batch Scripts
│   └── tests/              # 10 Integration & Verification Test Suites (58/58 PASSED)
│
├── frontend/               # React 18 + Vite + TypeScript Web Intelligence Portal (Port 3000)
│   ├── src/pages/          # 13 Dedicated Government & Research Intelligence Modules
│   ├── src/components/     # National Emblem Header, Role Switcher, Navbar, Leaflet Maps
│   ├── src/api/client.ts   # Strongly Typed REST API Client
│   └── src/styles/         # Human-Designed Government Intelligence Theme (Zero Emojis)
│
├── docs/                   # Authoritative SIH26019 Compliance Audits & Specs
│   ├── SIH26019_TRACEABILITY_MATRIX.md # Requirement-by-Requirement Traceability (A to L)
│   └── SIH26019_ALIGNMENT_AUDIT.md     # 20-Point Architectural & Security Audit Report
│
└── .agents/                # Complete Agent Package, Rules & Documentation
    ├── docs/               # Master Specs, Traceability Matrix, and Progress Reports
    ├── rules/              # Strict Grounding, Security, PostGIS, and Quality Rules
    └── skills/             # Antigravity Domain Skills
```

---

## 🚀 Quick Start & Service Execution

### 1. Launch All Services:
```bat
backend\scripts\start_all.bat
```

### 2. Launch Services Individually:
- **AI Microservice (Python FastAPI)**:
  ```bat
  backend\scripts\start_ai.bat
  ```
  *Runs on `http://127.0.0.1:5001`*

- **Authoritative Backend API (Node.js Express)**:
  ```bat
  backend\scripts\start_backend.bat
  ```
  *Runs on `http://localhost:5000`*

- **Web Portal (React + Vite)**:
  ```bat
  backend\scripts\start_frontend.bat
  ```
  *Runs on `http://localhost:3001` (proxies `/api` and `/health` to backend)*

---

## 🧪 Automated Testing & Verification

### 1. Run Complete Backend Test Suites (58/58 PASSED):
```powershell
cd "d:\Sih Proto\backend"
npm test
```

### 2. Run Python AI Evaluation Benchmarks (47/47 PASSED):
```powershell
cd "d:\Sih Proto"
python -m ai.evaluation.evaluate_rag
python -m ai.evaluation.evaluate_citations
python -m ai.evaluation.evaluate_parcel_resolution
```

### 3. Run ML Delay Risk Training:
```powershell
cd "d:\Sih Proto"
python ai/train.py
```
*Artifacts saved to `ai/models/` and `backend/data/models/`.*

### 4. Build Frontend for Production:
```powershell
cd "d:\Sih Proto\frontend"
npm run build
```

---

## 🏛️ Grounded Design & Quality Principles
- **Strict Grounding**: Deterministic statutory and precedent citations with SHA-256 evidence digests.
- **Zero Fabrications**: Honest attribution of calibration benchmarks and empirical datasets.
- **Cryptographic Provenance**: Every state mutation is sealed in an immutable SHA-256 hash-chain block.
- **Professional Aesthetics**: Crisp typography (Plus Jakarta Sans, JetBrains Mono), glassmorphism cards, clean SVG iconography (Lucide), and strictly zero emojis.
