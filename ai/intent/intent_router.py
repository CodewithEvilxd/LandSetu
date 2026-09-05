"""
LandSetu AI Intent Router & Multilingual Entity Recognition
Supports:
- English, Hindi (Devanagari), and Hinglish queries
- Entities: STATE, DISTRICT, TEHSIL, VILLAGE, KHASRA, GATA, KHATA, KHATAUNI, KHEWAT, OWNER_NAME
- Smart Intent Routing:
  * PARCEL_LOOKUP (when specific parcel, gata, or owner is queried)
  * LEGAL_STATUTE (UP Revenue Code, RFCTLARR 2013, DILRMP, Supreme Court rulings)
  * POLICY_SCENARIO (Policy Lab, what-if simulations)
  * ACQUISITION_RISK (infrastructure delay, project risk, CAG audits)
  * GIS_SPATIAL (boundary, satellite, cadastral map)
  * REGIONAL_COMPARISON (inter-state land governance comparisons)
"""

import re
import sys
from typing import Dict, List, Optional, Any

if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding="utf-8")
    except Exception:
        pass

KNOWN_STATES = [
    "Delhi", "Haryana", "Uttar Pradesh", "Maharashtra", "Madhya Pradesh", "Karnataka",
    "Tamil Nadu", "Bihar", "Odisha", "Rajasthan", "Gujarat", "West Bengal", "Punjab",
    "Andhra Pradesh", "Himachal Pradesh", "Uttarakhand", "Jharkhand", "Chhattisgarh",
    "Telangana", "Kerala", "Assam", "Goa", "Jammu and Kashmir"
]

HINDI_STATE_MAP = {
    "दिल्ली": "Delhi",
    "हरियाणा": "Haryana",
    "उत्तर प्रदेश": "Uttar Pradesh",
    "यूपी": "Uttar Pradesh",
    "महाराष्ट्र": "Maharashtra",
    "बिहार": "Bihar",
    "पंजाब": "Punjab",
    "राजस्थान": "Rajasthan",
    "हिमाचल प्रदेश": "Himachal Pradesh",
    "हिमाचल": "Himachal Pradesh",
    "उत्तराखंड": "Uttarakhand",
    "झारखंड": "Jharkhand",
    "छत्तीसगढ़": "Chhattisgarh",
    "मध्य प्रदेश": "Madhya Pradesh",
    "एमपी": "Madhya Pradesh",
    "गुजरात": "Gujarat",
    "कर्नाटक": "Karnataka",
    "केरल": "Kerala",
    "तमिलनाडु": "Tamil Nadu",
    "ओडिशा": "Odisha",
    "पश्चिम बंगाल": "West Bengal",
    "बंगाल": "West Bengal",
    "असम": "Assam",
    "आंध्र प्रदेश": "Andhra Pradesh",
    "तेलंगाना": "Telangana",
    "गोवा": "Goa"
}

KNOWN_DISTRICTS = [
    "Gautam Buddha Nagar", "Noida", "Greater Noida", "Dadri", "Sadar Noida",
    "North Delhi", "South Delhi", "South West Delhi", "North West Delhi", "New Delhi",
    "Gurugram", "Faridabad", "Sonipat", "Rohtak", "Ambala", "Karnal", "Panipat",
    "Patna", "Gaya", "Muzaffarpur", "Bhagalpur", "Darbhanga",
    "Lucknow", "Jhansi", "Pune", "Aurangabad"
]

HINDI_DISTRICT_MAP = {
    "गौतम बुद्ध नगर": "Gautam Buddha Nagar",
    "गौतमबुद्ध नगर": "Gautam Buddha Nagar",
    "नोएडा": "Gautam Buddha Nagar",
    "ग्रेटर नोएडा": "Gautam Buddha Nagar",
    "दादरी": "Dadri",
    "गुरुग्राम": "Gurugram",
    "गुड़गांव": "Gurugram",
    "उत्तरी दिल्ली": "North Delhi",
    "पटना": "Patna"
}

VILLAGE_CANONICAL_MAP = {
    "sorkha": "Sorkha Jahidabad",
    "sorkha jahidabad": "Sorkha Jahidabad",
    "सोरखा": "Sorkha Jahidabad",
    "सोरखा जाहिदाबाद": "Sorkha Jahidabad",
    "kasna": "Kasna",
    "कासना": "Kasna",
    "bisrakh": "Bisrakh Jalalpur",
    "bisrakh jalalpur": "Bisrakh Jalalpur",
    "बिसरख": "Bisrakh Jalalpur",
    "बिसरख जलालपुर": "Bisrakh Jalalpur",
    "alipur": "Alipur",
    "अलीपुर": "Alipur",
    "wazirabad": "Wazirabad",
    "वजीराबाद": "Wazirabad",
    "sabbalpur": "Sabbalpur",
    "सब्बलपुर": "Sabbalpur",
    "सबबलपुर": "Sabbalpur",
    "bawana": "Bawana",
    "बवाना": "Bawana",
    "kanjhawala": "Kanjhawala",
    "manesar": "Manesar",
    "मानेसर": "Manesar"
}

def detect_language(query: str) -> str:
    # 1. Check for Devanagari script
    if re.search(r"[\u0900-\u097F]", query):
        return "hi"
    
    # 2. Check for Hinglish markers
    lower = query.lower()
    hinglish_markers = [
        "kya", "hai", "kiska", "kiske", "kaise", "batao", "bataiye", "naam",
        "jameen", "zameen", "tehat", "kitna", "kitni", "rokne", "chahiye",
        "dijiye", "karein", "kaun", "dhara", "niyam", "parcel", "shajra",
        "kabja", "dakhil", "kharij", "malik", "namaste", "namaskar", "pranam",
        "adaab", "haal", "madad", "shuru", "karo", "bhai", "aap", "tum"
    ]
    if sum(1 for m in hinglish_markers if f" {m} " in f" {lower} ") >= 1:
        return "hinglish"
    
    return "en"

def detect_query_intent(query: str) -> Dict[str, Any]:
    lower = query.lower()
    detected_lang = detect_language(query)

    # 1. State detection
    found_states = []
    for s in KNOWN_STATES:
        if s.lower() in lower:
            found_states.append(s)
    for h_state, en_state in HINDI_STATE_MAP.items():
        if h_state in query and en_state not in found_states:
            found_states.append(en_state)

    # Infer state from regional context if missing
    if not found_states:
        if any(w in lower or w in query for w in ["noida", "greater noida", "dadri", "kasna", "sorkha", "bisrakh", "गौतम बुद्ध नगर", "कासना", "सोरखा", "बिसरख", "नोएडा", "yeida", "up revenue code"]):
            found_states.append("Uttar Pradesh")
        elif any(w in lower or w in query for w in ["alipur", "bawana", "kanjhawala", "delhi land reforms", "अलीपुर", "बवाना"]):
            found_states.append("Delhi")
        elif any(w in lower or w in query for w in ["wazirabad", "gurugram", "manesar", "jamabandi", "वजीराबाद", "गुरुग्राम"]):
            found_states.append("Haryana")
        elif any(w in lower or w in query for w in ["sabbalpur", "patna", "khesra", "khatiyan", "सब्बलपुर", "पटना"]):
            found_states.append("Bihar")

    # 2. District detection
    found_districts = []
    for d in KNOWN_DISTRICTS:
        if d.lower() in lower:
            found_districts.append(d)
    for h_dist, en_dist in HINDI_DISTRICT_MAP.items():
        if h_dist in query and en_dist not in found_districts:
            found_districts.append(en_dist)

    # 3. Village detection (with canonical mapping)
    found_villages = []
    for alias, canonical in VILLAGE_CANONICAL_MAP.items():
        if alias in lower or alias in query:
            if canonical not in found_villages:
                found_villages.append(canonical)

    # 4. Land parcel identifiers regex extraction (Khasra, Gata, Khesra, Plot)
    composite_match = re.search(r"([A-Za-z]+)\|([A-Za-z_]+)\|([A-Za-z_]+)\|([A-Za-z_]+)\|([0-9]+(?:[\/_][0-9]+)?)", query)
    extracted_khasra = None

    if composite_match:
        c_state, c_dist, c_sub, c_vill, c_khasra = composite_match.groups()
        extracted_khasra = c_khasra
        if not found_villages:
            found_villages.append(c_vill.replace("_", " ").title())
        if not found_states:
            found_states.append(c_state.title())
    else:
        # Matches: "gata 105", "गाटा 401", "gata no 101", "khasra 142", "khesra 308", "plot 142", "गाटा संख्या 405"
        parcel_regex = r"(?:khasra|khesra|gata|gatashil|plot|खसरा|खेसरा|गाटा|गाटाशील|किल्ला)\s*(?:no\.?|number|संख्या|सं\.?)?\s*([0-9]+(?:[\/_][0-9]+)?)"
        parcel_match = re.search(parcel_regex, query, re.IGNORECASE)
        if parcel_match:
            extracted_khasra = parcel_match.group(1)
        else:
            # Check standalone plot numbers like "Gata-105" or "Khasra-401"
            alt_match = re.search(r"\b(?:gata|khasra)[-_]([0-9]+)\b", query, re.IGNORECASE)
            if alt_match:
                extracted_khasra = alt_match.group(1)

    khata_match = re.search(r"(?:khata|खाता)\s*(?:no\.?|number|संख्या|सं\.?)?\s*([0-9]+)", query, re.IGNORECASE)
    khatauni_match = re.search(r"(?:khatauni|khatiyan|खतौनी|खतियान)\s*(?:no\.?|number|संख्या|सं\.?)?\s*([0-9]+)", query, re.IGNORECASE)
    khewat_match = re.search(r"(?:khewat|jamabandi|खेवट|जमाबंदी)\s*(?:no\.?|number|संख्या|सं\.?)?\s*([0-9]+)", query, re.IGNORECASE)

    extracted_khata = khata_match.group(1) if khata_match else None
    extracted_khatauni = khatauni_match.group(1) if khatauni_match else None
    extracted_khewat = khewat_match.group(1) if khewat_match else None

    # Owner inquiry detection
    is_owner_query = any(k in lower or k in query for k in [
        "kiske naam", "owner", "malik", "मालिक", "किसके नाम", "rights holder",
        "tenure holder", "account holder", "raiyat", "रैयत", "kaimi", "किसका है", "किसकी है"
    ])

    # Statutory sections extraction
    section_matches = re.findall(r"(?:section|sec\.?|धारा)\s*(\d+[a-zA-Z]?)", query, re.IGNORECASE)
    act_sections = [f"Section {m}" for m in section_matches]

    # Specific land / statutory procedural keywords (avoid generic single English words like 'act', 'rules', 'process')
    statutory_procedural_keywords = [
        "revenue code", "rfctlarr", "larr act", "dilrmp", "bhu-aadhaar", "ulpin",
        "dakhil kharij", "daakhil khaarij", "mutation", "namantaran", "naamaantaran",
        "kabja", "kabza", "atikraman", "bedakhali", "dhara", "धारा", "section",
        "कानून", "राजस्व संहिता", "संहिता", "भू-अभिलेख",
        "talab", "johad", "charagah", "gram sabha", "bhumidhar", "patta", "chakbandi",
        "award deadline", "time limit", "solatium", "multiplier", "market value",
        "sia", "social impact", "tenure class", "sankramaniya", "asankramaniya",
        "statutory period", "statutory timeline", "statutory rule",
        # Procedural & Revenue Lexicon
        "hadbandi", "hadhbandi", "patthargaddi", "pathargaddi", "medh", "medhbandi", "paimash",
        "सीमांकन", "पैमाइश", "पत्थरगड्डी", "मेढ़बंदी", "मेढ़",
        "143", "80", "gair-krishi", "gair krishi", "gairkrishi", "land use", "conversion", "plotting",
        "गैर-कृषि", "प्लाटिंग", "आवासीय घोषणा",
        "dalit", "sc land", "sc zameen", "sc transfer", "collector permission", "अनुसूचित जाति", "दलित",
        "varasat", "virasat", "pauti", "foti", "warisan", "succession", "वरासत", "उत्तराधिकार", "वारिस",
        "batwara", "kurra", "takseem", "partition", "बंटवारा", "कुर्रा", "तकसीम", "हिस्सा",
        "swatva", "declaratory", "title dispute", "ghoshanatmak", "घोषणात्मक", "स्वत्व",
        "appeal", "revision", "nigrani", "board of revenue", "राजस्व परिषद", "निगरानी", "पुनरीक्षण",
        "dlr", "dlr 81", "section 81", "gaon sabha vesting", "धारा 81", "delhi land reforms",
        "jamabandi", "girdawari", "inteqal", "fard", "जमाबंदी", "गिरदावरी", "इंतकाल", "फर्द",
        "gpa", "power of attorney", "agreement to sell", "suraj lamp", "जीपीए", "पावर ऑफ अटॉर्नी",
        "radhy shyam", "urgency clause", "धारा 17", "section 17",
        "larra", "reference to authority", "15 percent", "byaj", "प्राधिकरण",
        "vidya devi", "indore dev", "jagpal singh", "article 300a"
    ]
    is_statutory_rule_query = any(w in lower or w in query for w in statutory_procedural_keywords)

    is_procedural_inquiry = any(w in lower for w in [
        "kaise", "how to", "kya niyam", "rules", "procedure", "process", "karwaye", "karein",
        "karna hai", "chahiye", "legal hai", "valid hai", "kya hoti hai", "kya hota hai",
        "kya antar hai", "difference between", "kisko de sakte hain", "kiska permission"
    ])

    # 0. ADVERSARIAL OUT-OF-DOMAIN DETECTION
    out_of_domain_patterns = [
        r"\b(cricket|football|fifa|icc|world cup|ipl|match|wicket|stadium|batsman|bowler)\b",
        r"\b(bake|cake|recipe|cooking|cook|microwave|oven|baking|chocolate|flour|bread|pizza|burger)\b",
        r"\b(capital of france|paris|eiffel tower|president of us|movies?|hollywood|bollywood|actor|actress|song)\b",
        r"\b(horoscope|astrology|zodiac|joke|riddle|funny|weather forecast|gaming|playstation)\b"
    ]
    is_out_of_domain = any(re.search(p, lower) for p in out_of_domain_patterns)
    has_explicit_land_term = bool(
        extracted_khasra or extracted_khata or extracted_khatauni or extracted_khewat or
        found_villages or found_districts or act_sections or
        any(k in lower for k in [
            "land", "property", "revenue", "cadastre", "cadastral", "khasra", "gata",
            "khata", "khatauni", "tehsil", "patwari", "lekhpal", "mutation", "dakhil",
            "kharij", "zamindari", "bhumidhar", "acquisition", "rfctlarr",
            "dilrmp", "ulpin", "bhu-aadhaar", "circle rate", "solatium",
            "encroachment", "gram sabha", "hadbandi", "patthargaddi", "varasat", "batwara",
            "jamabandi", "gpa", "dlr"
        ])
    )

    # Conversational Greeting & Introduction Detection
    greeting_patterns = [
        r"^(hello|hi|hey|heya|hlo|namaste|namaskar|pranam|ram\s*ram|adaab|good\s*(?:morning|afternoon|evening|day))(?:\s+(?:there|ai|assistant|landsetu|ji|bhai|sir|dost))?[\s\?!.]*$",
        r"^(नमस्ते|नमस्कार|प्रणाम|जय\s*श्री\s*राम|राम\s*राम|राधे\s*राधे|आदाब|सत\s*श्री\s*अकाल)(?:\s+(?:जी|भाई|सर))?[\s\?!.]*$",
        r"^(kaise\s*ho|kya\s*hal\s*hai|kya\s*haal|kya\s*hal|how\s*are\s*you|how\s*do\s*you\s*do)(?:\s+(?:bhai|ji|sir|aap))?[\s\?!.]*$",
        r"^(कैसे\s*हो|क्या\s*हाल\s*है|आप\s*कैसे\s*हैं)(?:\s+(?:जी|भाई|सर))?[\s\?!.]*$",
        r"^(who\s*are\s*you|what\s*is\s*your\s*name|aap\s*kaun\s*hain|tum\s*kaun\s*ho|introduce\s*yourself|tell\s*me\s*about\s*yourself)[\s\?!.]*$",
        r"^(आप\s*कौन\s*हैं|तुम\s*कौन\s*हो|अपना\s*परिचय\s*दें)[\s\?!.]*$",
        r"^(what\s*can\s*you\s*do|kya\s*kar\s*sakte\s*ho|help|madad|features|menu|capabilities|can\s*you\s*help\s*me|help\s*me)[\s\?!.]*$",
        r"^(आप\s*क्या\s*कर\s*सकते\s*हैं|क्या\s*मदद\s*कर\s*सकते\s*हो|मदद|सहायता)[\s\?!.]*$",
        r"^(kya\s*kya\s*features\s*hain|kya\s*madad\s*kar\s*sakte\s*ho|shuru\s*karein|how\s*to\s*use)[\s\?!.]*$"
    ]
    is_greeting = any(re.search(p, lower.strip()) for p in greeting_patterns)

    # Determine Intent
    intent = "GENERAL_RESEARCH"
    confidence = 0.85

    if is_greeting and not has_explicit_land_term:
        intent = "GREETING"
        confidence = 0.99

    elif is_out_of_domain and not has_explicit_land_term:
        intent = "OUT_OF_DOMAIN"
        confidence = 0.99

    # If it's a procedural how-to legal/revenue query, prioritize LEGAL_STATUTE even if a number was caught
    elif is_statutory_rule_query and is_procedural_inquiry:
        intent = "LEGAL_STATUTE"
        confidence = 0.97

    # 1. SPECIFIC PARCEL LOOKUP:
    # Requires an actual parcel/khasra/gata/khata number, OR an owner lookup for a specific village
    elif (extracted_khasra or extracted_khata or extracted_khatauni or extracted_khewat or (found_villages and is_owner_query)) and not (is_statutory_rule_query and not extracted_khasra):
        intent = "PARCEL_LOOKUP"
        confidence = 0.98

    # 2. LEGAL STATUTE & REVENUE PROCEDURE:
    elif is_statutory_rule_query or act_sections or any(k in lower for k in ["statute", "rfctlarr", "revenue code", "supreme court", "high court", "legislation", "amendment"]):
        intent = "LEGAL_STATUTE"
        confidence = 0.96

    # 3. ACQUISITION DELAY & PROJECT RISK:
    elif any(k in lower for k in ["risk", "delay", "bottleneck", "acquisition project", "cag", "overrun", "lapse", "stalled"]):
        intent = "ACQUISITION_RISK"
        confidence = 0.94

    # 4. POLICY LAB & SIMULATION:
    elif any(k in lower for k in ["scenario", "policy lab", "simulate", "what if", "intervention", "multiplier impact"]):
        intent = "POLICY_SCENARIO"
        confidence = 0.95

    # 5. GIS & SPATIAL:
    elif any(k in lower for k in ["map", "gis", "satellite", "watershed", "spatial", "boundary", "remote sensing", "cadastre", "shajra", "भू-नक्शा"]):
        intent = "GIS_SPATIAL"
        confidence = 0.92

    # 6. REGIONAL COMPARISON:
    elif any(k in lower for k in ["compare", "trend", "pendency", "difference between", "अंतर"]) or len(found_states) >= 2:
        intent = "REGIONAL_COMPARISON"
        confidence = 0.92

    # 7. DOCUMENT SEARCH:
    elif any(k in lower for k in ["find document", "report", "guidelines", "brief", "circular", "gazette"]):
        intent = "DOCUMENT_SEARCH"
        confidence = 0.90

    return {
        "intent": intent,
        "confidence": confidence,
        "language": detected_lang,
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
            "document_type": "State Revenue Act" if ("uttar pradesh" in [s.lower() for s in found_states]) else ("Central Primary Legislation" if intent == "LEGAL_STATUTE" else None),
            "category": "Infrastructure" if intent == "ACQUISITION_RISK" else None
        }
    }

if __name__ == "__main__":
    test_queries = [
        "Noida Sorkha Gata 105 kiska hai?",
        "Greater Noida Kasna me gata 401 ka dakhil kharij status kya hai?",
        "UP Revenue Code 2006 ke tehat dakhil kharij ka kya niyam hai?",
        "Gram Sabha ki jameen par kabja rokne ke liye kaun si dhara lagti hai?",
        "What is the statutory deadline for making an award under Section 23 of RFCTLARR Act 2013?",
        "खसरा संख्या 142 अलीपुर दिल्ली के खातेदार कौन हैं?",
        "Compare land digitisation and mutation pendency between Delhi and Uttar Pradesh"
    ]
    import json
    for tq in test_queries:
        res = detect_query_intent(tq)
        print(f"\nQuery: {tq}")
        print(f"-> Intent: {res['intent']} | Lang: {res['language']} | Village: {res['extracted_entities']['villages']} | Khasra/Gata: {res['extracted_entities']['khasra']}")
