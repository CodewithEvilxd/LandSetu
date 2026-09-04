import os
import json
import time
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, Dict, Any, List

from ai.intent.intent_router import detect_query_intent
from ai.retrieval.hybrid_search import HybridSearchEngine
from ai.generation.rag_synthesizer import RAGSynthesizer
from ai.ocr.field_extractor import extract_land_record_from_text
from ai.ocr.image_ocr import extract_from_image_or_pdf, parse_revenue_document
from ai.inference.predict_risk import predict_project_risk

app = FastAPI(
    title="LandSetu AI Agent Engine",
    description="Dedicated AI Service for Grounded RAG, OCR Extraction, and Acquisition Delay Risk Prediction",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

from fastapi.responses import Response

@app.get("/favicon.ico", include_in_schema=False)
async def favicon():
    return Response(status_code=204)

@app.get("/")
async def root():
    return {
        "status": "healthy",
        "service": "LandSetu AI Agent Microservice",
        "version": "1.0.0",
        "endpoints": [
            "/health",
            "/docs",
            "/api/ai/ask",
            "/api/ai/search",
            "/api/ai/intent",
            "/api/ai/ocr/extract",
            "/api/ai/risk/predict"
        ]
    }

search_engine = HybridSearchEngine()
rag_synthesizer = RAGSynthesizer(search_engine)

class QueryRequest(BaseModel):
    query: str
    jurisdiction: Optional[str] = None
    document_type: Optional[str] = None
    limit: Optional[int] = 5

class OCRExtractRequest(BaseModel):
    document_name: str
    raw_ocr_text: str
    record_id: Optional[str] = None

class PDFExtractFileRequest(BaseModel):
    file_path: str
    document_name: Optional[str] = ""

class RiskPredictRequest(BaseModel):
    land_area_hectares: float
    affected_families: float
    compensation_assessed_crores: float
    compensation_disbursed_crores: float
    litigation_cases_count: float
    statutory_months: float
    rr_settled_ratio: float
    is_linear_project: bool = True
    state: str = ""

@app.get("/health")
def health():
    return {
        "status": "healthy",
        "service": "LandSetu-AI-Agent",
        "version": "1.0.0",
        "engine": "Python 3.14 + FastAPI + scikit-learn + NumPy",
        "indexed_chunks_count": len(search_engine.chunks)
    }

@app.get("/api/ai/embeddings/info")
def embedding_info():
    from ai.embeddings.embedder import get_embedding_adapter
    return get_embedding_adapter().get_metadata()

@app.post("/api/ai/intent")
def get_intent(payload: QueryRequest):
    return detect_query_intent(payload.query)

@app.post("/api/ai/search")
def search(payload: QueryRequest):
    return search_engine.search(
        query=payload.query,
        jurisdiction=payload.jurisdiction,
        document_type=payload.document_type,
        limit=payload.limit or 5
    )

@app.post("/api/ai/ask")
def ask(payload: QueryRequest):
    return rag_synthesizer.answer(payload.query)

class OCRFileExtractRequest(BaseModel):
    file_path: str
    document_name: Optional[str] = ""
    record_id: Optional[str] = None

@app.post("/api/ai/ocr/extract")
def ocr_extract(payload: OCRExtractRequest):
    lines = payload.raw_ocr_text.splitlines() if payload.raw_ocr_text else []
    return parse_revenue_document(
        document_name=payload.document_name,
        raw_text=payload.raw_ocr_text,
        record_id=payload.record_id or f"REC-OCR-{int(time.time()*1000)}",
        raw_lines=lines
    )

def _resolve_file_path(p: str) -> str:
    if os.path.exists(p):
        return os.path.abspath(p)
    candidates = [
        os.path.join(os.getcwd(), p),
        os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), p),
        os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "backend", p)
    ]
    for c in candidates:
        if os.path.exists(c):
            return os.path.abspath(c)
    return p

@app.post("/api/ai/ocr/extract-file")
def ocr_extract_file(payload: OCRFileExtractRequest):
    resolved = _resolve_file_path(payload.file_path)
    if not os.path.exists(resolved):
        raise HTTPException(status_code=404, detail=f"File not found: {payload.file_path} (resolved as: {resolved})")
    try:
        return extract_from_image_or_pdf(
            file_path=resolved,
            document_name=payload.document_name,
            record_id=payload.record_id
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/ai/ocr/extract-pdf")
def ocr_extract_pdf(payload: PDFExtractFileRequest):
    resolved = _resolve_file_path(payload.file_path)
    if not os.path.exists(resolved):
        raise HTTPException(status_code=404, detail=f"File not found: {payload.file_path} (resolved as: {resolved})")
    try:
        return extract_from_image_or_pdf(
            file_path=resolved,
            document_name=payload.document_name
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/ai/risk/predict")
def risk_predict(payload: RiskPredictRequest):
    return predict_project_risk(payload.model_dump())

@app.get("/api/ai/eval-metrics")
def eval_metrics():
    metrics_path = "ai/evaluation/metrics.json"
    rag_metrics_path = "ai/evaluation/rag_eval_results.json"
    risk_metrics = {}
    rag_metrics = {}
    if os.path.exists(metrics_path):
        with open(metrics_path, "r", encoding="utf-8") as f:
            risk_metrics = json.load(f)
    if os.path.exists(rag_metrics_path):
        with open(rag_metrics_path, "r", encoding="utf-8") as f:
            rag_metrics = json.load(f)
    return {
        "acquisition_delay_model": risk_metrics,
        "rag_retrieval_and_citations": rag_metrics
    }

@app.get("/api/ai/model-card")
def get_model_card():
    card_path = "docs/models/risk_model_card.md"
    if os.path.exists(card_path):
        with open(card_path, "r", encoding="utf-8") as f:
            return {"model_card_markdown": f.read()}
    raise HTTPException(status_code=404, detail="Model card not found")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("ai.server:app", host="127.0.0.1", port=5001, reload=True)
