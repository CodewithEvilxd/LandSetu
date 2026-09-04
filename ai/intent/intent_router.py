"""
LandSetu AI Intent Router & Multilingual Entity Recognition
Supports:
- English, Hindi (Devanagari), and Hinglish queries
- Entities: STATE, DISTRICT, TEHSIL, VILLAGE, KHASRA, KHATA, KHATAUNI, KHEWAT, OWNER_NAME
- Intent Routing: PARCEL_LOOKUP, LEGAL_STATUTE, POLICY_SCENARIO, ACQUISITION_RISK, GIS_SPATIAL, REGIONAL_COMPARISON, DOCUMENT_SEARCH
"""

import re
from typing import Dict, List, Optional, Any

KNOWN_STATES = [
    "Delhi", "Haryana", "Uttar Pradesh", "Maharashtra", "Madhya Pradesh", "Karnataka",
    "Tamil Nadu", "Bihar", "Odisha", "Rajasthan", "Gujarat", "West Bengal", "Punjab", "Andhra Pradesh"
]

HINDI_STATE_MAP = {
    "दिल्ली": "Delhi",
    "हरियाणा": "Haryana",
    "उत्तर प्रदेश": "Uttar Pradesh",
    "महाराष्ट्र": "Maharashtra",
    "बिहार": "Bihar",
    "पंजाब": "Punjab",
    "राजस्थान": "Rajasthan"
}

KNOWN_DISTRICTS = [
    "North Delhi", "South Delhi", "South West Delhi", "North West Delhi", "New Delhi",
    "Gurugram", "Faridabad", "Sonipat", "Rohtak", "Ambala", "Karnal", "Panipat",
    "Patna", "Gaya", "Muzaffarpur", "Bhagalpur", "Darbhanga",
    "Lucknow", "Jhansi", "Gautam Buddha Nagar", "Pune", "Aurangabad"
]

KNOWN_VILLAGES = [
    "Alipur", "Bawana", "Kanjhawala", "Bijwasan", "Najafgarh",
    "Wazirabad", "Badshahpur", "Manesar", "Kundli", "Rampur Dehat", "Wagholi",
    "Sabbalpur", "Didarganj", "Jethuli", "Phulwarisharif"
]

HINDI_VILLAGE_MAP = {
    "वजीराबाद": "Wazirabad",
    "अलीपुर": "Alipur",
    "बवाना": "Bawana",
    "कंझावला": "Kanjhawala",
    "मानेसर": "Manesar",
    "कुंडली": "Kundli",
    "सबबलपुर": "Sabbalpur",
    "सब्बलपुर": "Sabbalpur",
    "दीदारगंज": "Didarganj",
    "फुलवारीशरीफ": "Phulwarisharif"
}

def detect_query_intent(query: str) -> Dict[str, Any]:
    lower = query.lower()
    
    # 1. State detection (English & Devanagari Hindi)
    found_states = []
    for s in KNOWN_STATES:
        if s.lower() in lower:
            found_states.append(s)
    for h_state, en_state in HINDI_STATE_MAP.items():
        if h_state in query and en_state not in found_states:
            found_states.append(en_state)

    # 2. District detection
    found_districts = [d for d in KNOWN_DISTRICTS if d.lower() in lower]

    # 3. Village detection (English & Devanagari Hindi)
    found_villages = [v for v in KNOWN_VILLAGES if v.lower() in lower]
    for h_v, en_v in HINDI_VILLAGE_MAP.items():
        if h_v in query and en_v not in found_villages:
            found_villages.append(en_v)

    # 4. Land parcel identifiers regex extraction
    composite_match = re.search(r"([A-Za-z]+)\|([A-Za-z_]+)\|([A-Za-z_]+)\|([A-Za-z_]+)\|([0-9]+(?:[\/_][0-9]+)?)", query)
    if composite_match:
        c_state, c_dist, c_sub, c_vill, c_khasra = composite_match.groups()
        extracted_khasra = c_khasra
        if not found_villages:
            found_villages.append(c_vill.replace("_", " ").title())
        if not found_states:
            found_states.append(c_state.title())
    else:
        khasra_match = re.search(r"(?:khasra|khesra|खसरा|खेसरा|killa|plot)\s*(?:no\.?|number|संख्या)?\s*([0-9]+(?:[\/_][0-9]+)?)", query, re.IGNORECASE)
        extracted_khasra = khasra_match.group(1) if khasra_match else None

    khata_match = re.search(r"(?:khata|खाता)\s*(?:no\.?|number|संख्या)?\s*([0-9]+)", query, re.IGNORECASE)
    khatauni_match = re.search(r"(?:khatauni|khatiyan|खतौनी|खतियान)\s*(?:no\.?|number|संख्या)?\s*([0-9]+)", query, re.IGNORECASE)
    khewat_match = re.search(r"(?:khewat|jamabandi|खेवट|जमाबंदी)\s*(?:no\.?|number|संख्या)?\s*([0-9]+)", query, re.IGNORECASE)

    extracted_khata = khata_match.group(1) if khata_match else None
    extracted_khatauni = khatauni_match.group(1) if khatauni_match else None
    extracted_khewat = khewat_match.group(1) if khewat_match else None

    # Owner inquiry detection
    is_owner_query = any(k in lower or k in query for k in [
        "kiske naam", "owner", "malik", "मालिक", "किसके नाम", "rights holder",
        "tenure holder", "account holder", "raiyat", "रैयत", "kaimi"
    ])

    # Statutory sections
    section_matches = re.findall(r"(?:section|sec\.?)\s*(\d+[a-zA-Z]?)", query, re.IGNORECASE)
    act_sections = [f"Section {m}" for m in section_matches]

    # Intent determination
    intent = "GENERAL_RESEARCH"
    confidence = 0.85

    # Check parcel lookup first
    if extracted_khasra or extracted_khata or extracted_khatauni or extracted_khewat or (found_villages and is_owner_query) or any(k in lower or k in query for k in ["jamabandi", "जमाबंदी", "fard", "फर्द", "khasra", "खसरा", "khesra", "खेसरा", "khatauni", "खतौनी", "khatiyan", "खतियान", "dakhil kharij", "दाखिल खारिज"]):
        intent = "PARCEL_LOOKUP"
        confidence = 0.96

    elif any(k in lower for k in ["scenario", "policy lab", "simulate", "what if", "intervention"]):
        intent = "POLICY_SCENARIO"
        confidence = 0.95
    elif any(k in lower for k in ["risk", "delay", "bottleneck", "acquisition project"]):
        intent = "ACQUISITION_RISK"
        confidence = 0.92
    elif any(k in lower for k in ["map", "gis", "satellite", "watershed", "spatial", "boundary", "remote sensing", "cadastre"]):
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
            "districts": found_districts if found_districts else None,
            "villages": found_villages if found_villages else None,
            "khasra": extracted_khasra,
            "khata": extracted_khata,
            "khatauni": extracted_khatauni,
            "khewat": extracted_khewat,
            "is_owner_inquiry": is_owner_query,
            "act_sections": act_sections if act_sections else None
        },
        "suggested_filters": {
            "jurisdiction": found_states[0] if len(found_states) == 1 else None,
            "document_type": "Central Primary Legislation" if intent == "LEGAL_STATUTE" else None,
            "category": "Infrastructure" if intent == "ACQUISITION_RISK" else None
        }
    }

if __name__ == "__main__":
    queries = [
        "Delhi, Village Alipur, Khasra 142 ke baare mein batao",
        "खसरा संख्या 215 गाँव वजीराबाद हरियाणा किसके नाम है?",
        "What is the statutory deadline under Section 23 of RFCTLARR Act 2013?",
        "Compare cadastral map digitization between Delhi and Haryana"
    ]
    for q in queries:
        safe_q = q.encode('ascii', 'backslashreplace').decode()
        print(f"\nQuery: {safe_q}")
        import json
        out = detect_query_intent(q)
        print(json.dumps(out, indent=2, default=str))
