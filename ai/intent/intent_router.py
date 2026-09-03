import re
from typing import Dict, List, Optional, Any

KNOWN_STATES = [
    "Uttar Pradesh", "Maharashtra", "Madhya Pradesh", "Karnataka",
    "Tamil Nadu", "Bihar", "Odisha", "Rajasthan", "Gujarat", "West Bengal", "Punjab", "Haryana", "Andhra Pradesh"
]

KNOWN_TOPICS = [
    "acquisition", "compensation", "resettlement", "r&r", "khasra", "khata", "survey",
    "dispute", "litigation", "pendency", "dilrmp", "ulpin", "bhu-aadhaar", "cadastral",
    "mutation", "leasing", "watershed", "satellite", "bhuvan", "ndvi"
]

def detect_query_intent(query: str) -> Dict[str, Any]:
    lower = query.lower()
    found_states = [s for s in KNOWN_STATES if s.lower() in lower]
    found_topics = [t for t in KNOWN_TOPICS if t in lower]
    
    section_matches = re.findall(r"(?:section|sec\.?)\s*(\d+[a-zA-Z]?)", query, re.IGNORECASE)
    act_sections = [f"Section {m}" for m in section_matches]
    
    intent = "GENERAL_RESEARCH"
    confidence = 0.85
    
    if any(k in lower for k in ["scenario", "policy lab", "simulate", "what if", "intervention"]):
        intent = "POLICY_SCENARIO"
        confidence = 0.95
    elif any(k in lower for k in ["risk", "delay", "bottleneck", "acquisition project"]):
        intent = "ACQUISITION_RISK"
        confidence = 0.92
    elif any(k in lower for k in ["map", "gis", "satellite", "watershed", "spatial", "boundary", "remote sensing"]):
        intent = "GIS_SPATIAL"
        confidence = 0.90
    elif any(k in lower for k in ["compare", "trend", "pendency"]) or len(found_states) >= 2:
        intent = "REGIONAL_COMPARISON"
        confidence = 0.92
    elif act_sections or any(k in lower for k in ["act", "law", "section", "statute", "rfctlarr", "legislation"]):
        intent = "LEGAL_STATUTE"
        confidence = 0.94
    elif any(k in lower for k in ["find document", "report", "guidelines", "brief", "circular"]):
        intent = "DOCUMENT_SEARCH"
        confidence = 0.88

    return {
        "intent": intent,
        "confidence": confidence,
        "extracted_entities": {
            "states": found_states if found_states else None,
            "act_sections": act_sections if act_sections else None,
            "topics": found_topics if found_topics else None
        },
        "suggested_filters": {
            "jurisdiction": found_states[0] if len(found_states) == 1 else None,
            "document_type": "Central Primary Legislation" if intent == "LEGAL_STATUTE" else None,
            "category": "Infrastructure" if intent == "ACQUISITION_RISK" else None
        }
    }
