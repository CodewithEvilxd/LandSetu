import json
import os
import re
from typing import List, Dict, Any, Optional
from ai.embeddings.embedder import generate_embedding, cosine_similarity

STOPWORDS = {
    "a", "an", "the", "and", "or", "but", "if", "because", "as", "what",
    "which", "who", "whom", "this", "that", "these", "those", "am", "is",
    "are", "was", "were", "be", "been", "being", "have", "has", "had",
    "having", "do", "does", "did", "doing", "would", "should", "could",
    "ought", "i", "you", "he", "she", "it", "we", "they", "its", "their",
    "of", "at", "by", "for", "with", "about", "against", "between", "into",
    "through", "during", "before", "after", "above", "below", "to", "from",
    "up", "down", "in", "out", "on", "off", "over", "under", "again", "further",
    "then", "once", "here", "there", "when", "where", "why", "how", "all",
    "any", "both", "each", "few", "more", "most", "other", "some", "such",
    "no", "nor", "not", "only", "own", "same", "so", "than", "too", "very",
    # Hindi / Hinglish Stopwords (Roman and Devanagari)
    "ka", "ki", "ke", "ko", "se", "me", "mein", "par", "hai", "hain", "tha", "the", "thi",
    "liye", "kya", "kaun", "kiska", "kiske", "kiski", "apna", "apne", "ye", "yeh", "wo", "woh",
    "bhi", "aur", "ya", "to", "toh", "kar", "kare", "karna", "raha", "rahe", "rahi", "hoga", "hogi", "hoge", "si", "sa",
    "kaise", "karein", "kiya", "jaata", "jaati", "gaya", "gayi", "hote", "hota", "hoti", "wale", "wali", "wala", "huye", "karte", "karti", "karta",
    # Devanagari Stopwords
    "का", "की", "के", "को", "से", "में", "पर", "है", "हैं", "था", "थी", "थे", "लिए",
    "क्या", "कौन", "किसका", "किसकी", "किसके", "अपना", "अपने", "यह", "वह", "भी", "और",
    "या", "तो", "कर", "करे", "करें", "करना", "रहा", "रहे", "रही", "होगा", "होगी", "होंगे",
    "कैसे", "किया", "जाता", "जाती", "गया", "गई", "होते", "होता", "होती", "वाले", "वाली",
    "होने", "करते", "सकते", "सकता", "सकती", "चाहिए", "द्वारा", "तक", "हुए", "हुई", "हुआ"
}

# Bilingual synonym mapping for cross-lingual query matching
BILINGUAL_SYNONYMS = {
    "kabja": ["अतिक्रमण", "कब्जा", "कब्ज़ा", "encroachment", "eviction", "occupation", "wrongful occupation", "trespass"],
    "kabza": ["अतिक्रमण", "कब्जा", "कब्ज़ा", "encroachment", "eviction", "occupation", "wrongful occupation", "trespass"],
    "atikraman": ["अतिक्रमण", "encroachment", "eviction", "occupation", "wrongful occupation"],
    "bedakhali": ["बेदखली", "eviction", "removal", "dispossession"],
    "dhara": ["धारा", "section", "clause", "provision"],
    "dharaen": ["धाराएं", "धाराओं", "sections", "clauses"],
    "jameen": ["भूमि", "land", "गाटा", "खसरा", "property"],
    "zameen": ["भूमि", "land", "गाटा", "खसरा", "property"],
    "bhumi": ["भूमि", "land", "गाटा", "खसरा", "property", "tenure"],
    "dakhil": ["दाखिल", "mutation", "नामांतरण", "transfer", "record of rights"],
    "kharij": ["खारिज", "mutation", "नामांतरण", "transfer", "record of rights"],
    "namantaran": ["नामांतरण", "दाखिल", "खारिज", "mutation", "transfer"],
    "niyam": ["नियम", "rules", "procedure", "guidelines"],
    "kanoon": ["कानून", "act", "statute", "code", "law"],
    "rokne": ["रोकने", "prevent", "eviction", "हटाने", "protection"],
    "gram": ["ग्राम", "village", "community", "panchayat"],
    "sabha": ["सभा", "panchayat", "council", "management committee"],
    "talab": ["तालाब", "pond", "waterbody", "water body", "pokhari"],
    "johad": ["जोहड़", "pond", "waterbody"],
    "charagah": ["चारागाह", "pasture", "commons", "grazing"],
    "malik": ["खातेदार", "owner", "titleholder", "bhumidhar"],
    "bhumidhar": ["भूमिधर", "bhumidhar", "tenure", "sankramaniya", "asankramaniya"],
    "muavja": ["मुआवजा", "प्रतिकर", "compensation", "solatium", "award"],
    "pratikar": ["प्रतिकर", "मुआवजा", "compensation", "solatium"],
    "ulpin": ["ulpin", "भू-आधार", "bhu-aadhaar", "आधार", "unique land parcel identification number", "14-digit", "dilrmp"],
    "bhuaadhaar": ["ulpin", "भू-आधार", "bhu-aadhaar", "आधार", "unique land parcel identification number", "dilrmp"],
    "bhuadhar": ["ulpin", "भू-आधार", "bhu-aadhaar", "आधार", "unique land parcel identification number", "dilrmp"],
    "आधार": ["aadhaar", "bhu-aadhaar", "ulpin", "dilrmp", "भू-आधार"],
    "भूआधार": ["ulpin", "भू-आधार", "bhu-aadhaar", "dilrmp"],
    "solatium": ["solatium", "संतोषप्रद", "section 30", "100 percent"],
    "jagpal": ["jagpal singh", "common land", "village pond", "encroachment", "eviction", "supreme court"],
    "indore": ["indore development authority", "section 24", "lapse", "deposit", "supreme court"],
    "vidya": ["vidya devi", "article 300a", "adverse possession", "compensation", "supreme court"],
    # Advanced Procedural & Colloquial Revenue Lexicon
    "hadbandi": ["मेढ़बंदी", "पत्थरगड्डी", "पैमाइश", "demarcation", "section 24", "सीमांकन", "paimash"],
    "patthargaddi": ["पत्थरगड्डी", "मेढ़बंदी", "पैमाइश", "demarcation", "section 24", "hadbandi", "hadhbandi"],
    "medh": ["मेढ़", "मेढ़बंदी", "सीमा", "boundary", "demarcation", "section 24", "hadbandi"],
    "medhbandi": ["मेढ़बंदी", "पत्थरगड्डी", "सीमांकन", "demarcation", "section 24"],
    "paimash": ["पैमाइश", "demarcation", "measurement", "survey", "section 24", "hadbandi"],
    "143": ["धारा 143", "धारा 80", "गैर-कृषि", "section 80", "non-agricultural", "conversion", "plotting", "land use"],
    "80": ["धारा 80", "धारा 143", "section 80", "non-agricultural", "conversion", "residential"],
    "gairkrishi": ["गैर-कृषि", "धारा 80", "धारा 143", "non-agricultural", "commercial", "residential"],
    "dalit": ["अनुसूचित जाति", "sc", "scheduled caste", "section 98", "collector permission", "restriction"],
    "sc": ["अनुसूचित जाति", "दलित", "section 98", "collector permission", "restriction"],
    "st": ["अनुसूचित जनजाति", "tribal", "section 98", "restriction"],
    "varasat": ["वरासत", "उत्तराधिकार", "succession", "section 108", "pauti", "foti", "वारिस"],
    "virasat": ["वरासत", "उत्तराधिकार", "succession", "section 108", "pauti", "foti", "वारिस"],
    "pauti": ["वरासत", "उत्तराधिकार", "succession", "section 108", "pauti", "foti", "warisan"],
    "foti": ["वरासत", "उत्तराधिकार", "succession", "section 108", "death", "waris"],
    "batwara": ["बंटवारा", "विभाजन", "partition", "section 116", "kurra", "joint holding", "takseem"],
    "kurra": ["कुर्रा", "बंटवारा", "partition", "section 117", "fard batwara", "lots"],
    "takseem": ["तकसीम", "बंटवारा", "partition", "haryana", "section 111", "punjab land revenue"],
    "gpa": ["जीपीए", "power of attorney", "suraj lamp", "agreement to sell", "conveyance deed", "sale deed", "supreme court"],
    "dlr": ["delhi land reforms", "धारा 81", "section 81", "ejectment", "gaon sabha", "delhi"],
    "81": ["धारा 81", "section 81", "delhi land reforms", "ejectment", "gaon sabha"],
    "jamabandi": ["जमाबंदी", "fard", "record of rights", "haryana", "punjab land revenue", "inteqal"],
    "girdawari": ["गिरदावरी", "khasra girdawari", "crop inspection", "harvest", "haryana", "patwari"],
    "inteqal": ["इंतकाल", "mutation", "नामांतरण", "haryana", "jalsa-e-aam", "patwari"],
    "larra": ["larra", "प्राधिकरण", "authority", "section 64", "reference", "enhancement"],
    "byaj": ["ब्याज", "interest", "section 80", "section 77", "15 percent", "delayed compensation"],
    "radhy": ["radhy shyam", "urgency clause", "section 17", "section 5a", "greater noida", "supreme court"],
    "shyam": ["radhy shyam", "urgency clause", "section 17", "supreme court"],
    "suraj": ["suraj lamp", "gpa", "power of attorney", "registered deed", "supreme court"],
    "lamp": ["suraj lamp", "gpa", "power of attorney", "supreme court"],
    "fard": ["फर्द", "jamabandi", "record of rights", "khatauni", "हरियाणा"],
    "nigrani": ["निगरानी", "revision", "पुनरीक्षण", "section 210", "board of revenue", "राजस्व परिषद"],
    "ghoshanatmak": ["घोषणात्मक", "declaratory suit", "swatva", "section 144", "sdm"],
    "swatva": ["स्वत्व", "declaratory suit", "title", "section 144", "sdm"]
}

class HybridSearchEngine:
    def __init__(self, chunks_path: str = "backend/data/processed/document_chunks.json"):
        if not os.path.exists(chunks_path) and os.path.exists("data/processed/document_chunks.json"):
            chunks_path = "data/processed/document_chunks.json"

        self.chunks: List[Dict[str, Any]] = []
        if os.path.exists(chunks_path):
            with open(chunks_path, "r", encoding="utf-8") as f:
                raw_chunks = json.load(f)
                for c in raw_chunks:
                    c["embedding"] = generate_embedding(c["content"])
                    self.chunks.append(c)

        # Also load unified ai_corpus.json if available
        corpus_candidates = [
            "backend/data/processed/ai_corpus.json",
            "data/processed/ai_corpus.json"
        ]
        for c_path in corpus_candidates:
            if os.path.exists(c_path):
                with open(c_path, "r", encoding="utf-8") as f:
                    corpus_items = json.load(f)
                    for item in corpus_items:
                        # Avoid duplicate chunks already loaded
                        if any(existing.get("chunk_id") == item["id"] for existing in self.chunks):
                            continue
                        self.chunks.append({
                            "chunk_id": item["id"],
                            "document_title": item.get("title", ""),
                            "section": item.get("metadata", {}).get("native_identifier", ""),
                            "content": item["text"],
                            "jurisdiction": item.get("metadata", {}).get("jurisdiction", item.get("metadata", {}).get("state", "All India")),
                            "publisher": item.get("metadata", {}).get("publisher", "Government Records"),
                            "source_url": item.get("metadata", {}).get("source_url", "http://official-records.gov.in"),
                            "document_type": item.get("type", "General"),
                            "embedding": generate_embedding(item["text"])
                        })
                break

    def search(
        self,
        query: str,
        jurisdiction: Optional[str] = None,
        document_type: Optional[str] = None,
        limit: int = 5
    ) -> List[Dict[str, Any]]:
        if not query or not query.strip():
            return []

        query_embedding = generate_embedding(query)
        # Preserve English letters, digits, and Devanagari Hindi characters (\u0900-\u097F)
        normalized_query = re.sub(r"[^a-zA-Z0-9\s\u0900-\u097F]", " ", query.lower())
        raw_tokens = [t for t in normalized_query.split() if (len(t) >= 2 or t.isdigit())]
        query_tokens = [t for t in raw_tokens if t not in STOPWORDS]

        DOMAIN_GENERIC_TOKENS = {
            "land", "revenue", "act", "code", "section", "law", "statute", "rule", "rules",
            "niyam", "dhara", "bhumi", "jameen", "zameen", "property", "rights", "right",
            "record", "records", "title", "titling", "tenure", "system", "scheme",
            "research", "paper", "papers", "study", "studies", "report", "brief", "guidelines", "academic", "journal",
            "धारा", "कानून", "अधिनियम", "नियम", "भूमि"
        }
        discriminative_tokens = [t for t in query_tokens if t not in DOMAIN_GENERIC_TOKENS]

        candidates = []

        for chunk in self.chunks:
            chunk_jurisdiction = chunk.get("jurisdiction", "").lower()
            if jurisdiction:
                j_lower = jurisdiction.lower()
                if j_lower in chunk_jurisdiction:
                    pass
                elif any(nat in chunk_jurisdiction for nat in ["all india", "national", "central", "supreme court"]):
                    # If query specifically targets a state code/act and that state differs, skip generic central chunks
                    is_state_specific_act = any(w in normalized_query for w in [
                        "code", "revenue code", "tenancy", "land reforms", "revenue act"
                    ]) and any(s in normalized_query for s in [
                        "maharashtra", "karnataka", "punjab", "haryana", "uttar pradesh", "bihar",
                        "himachal", "rajasthan", "gujarat", "tamil nadu", "bengal", "kerala", "odisha", "mp", "madhya pradesh"
                    ]) and j_lower not in chunk_jurisdiction
                    if is_state_specific_act:
                        continue
                else:
                    continue

            if document_type and document_type.lower() not in chunk.get("document_type", "").lower():
                continue

            content_lower = chunk["content"].lower()
            title_lower = chunk.get("document_title", "").lower()
            section_lower = str(chunk.get("section", "")).lower()

            content_words = set(re.findall(r'[a-zA-Z0-9\u0900-\u097F]+', content_lower))
            title_words = set(re.findall(r'[a-zA-Z0-9\u0900-\u097F]+', title_lower))
            section_words = set(re.findall(r'[a-zA-Z0-9\u0900-\u097F]+', section_lower))

            lexical_hits = 0.0
            match_reasons = []

            for token in query_tokens:
                token_variants = [token] + BILINGUAL_SYNONYMS.get(token, [])
                matched_token = False

                for variant in token_variants:
                    v_lower = variant.lower()
                    in_section = (v_lower in section_words) or (len(v_lower) >= 3 and v_lower in section_lower)
                    in_title = (v_lower in title_words) or (len(v_lower) >= 3 and v_lower in title_lower)
                    in_content = (v_lower in content_words) or (len(v_lower) >= 4 and v_lower in content_lower)

                    if in_section:
                        # High boost for direct section match (e.g. section 67, 34, 23)
                        weight = 3.0 if token.isdigit() else 2.0
                        lexical_hits += weight
                        match_reasons.append(f"section matched '{variant}'")
                        matched_token = True
                        break
                    elif in_title:
                        weight = 2.5 if token.isdigit() else 1.8
                        lexical_hits += weight
                        match_reasons.append(f"title matched '{variant}'")
                        matched_token = True
                        break
                    elif in_content:
                        weight = 2.0 if token.isdigit() else 1.0
                        lexical_hits += weight
                        match_reasons.append(f"content matched '{variant}'")
                        matched_token = True
                        break

            # If query has specific discriminative tokens, verify at least one actually matched
            if discriminative_tokens:
                disc_hits = 0
                for dt in discriminative_tokens:
                    variants = [dt] + BILINGUAL_SYNONYMS.get(dt, [])
                    for v in variants:
                        vl = v.lower()
                        if (vl in section_words) or (vl in title_words) or (vl in content_words) or (len(vl) >= 4 and vl in content_lower):
                            disc_hits += 1
                            break
                if disc_hits == 0 or (len(discriminative_tokens) >= 3 and (disc_hits / len(discriminative_tokens)) < 0.30):
                    # Query's specific topic not matched by this chunk (only common domain words matched)
                    lexical_hits = 0.0

            lexical_score = min(1.0, lexical_hits / len(query_tokens)) if query_tokens else 0.0
            semantic_score = cosine_similarity(query_embedding, chunk.get("embedding", []))

            # If there were search query tokens but zero non-stopword hits, penalize semantic score
            if query_tokens and lexical_hits == 0:
                semantic_score *= 0.35

            # Hybrid score: 0.45 semantic + 0.55 lexical (prioritizes exact legal terms & sections)
            combined_score = (semantic_score * 0.45) + (lexical_score * 0.55)

            # Domain boost: Prioritize statutory chunks over parcel chunks when query is legal or procedural
            is_statutory_query = any(w in normalized_query for w in [
                "section", "dhara", "धारा", "act", "niyam", "नियम", "law", "statute",
                "kabja", "encroachment", "solatium", "rfctlarr", "revenue code",
                "dakhil", "kharij", "mutation", "jagpal", "guidelines", "court",
                "precedent", "tenure", "sankramaniya", "asankramaniya", "bhumidhar", "award", "sia",
                "indore", "vidya", "hadbandi", "patthargaddi", "medh", "medhbandi", "paimash",
                "143", "80", "gairkrishi", "dalit", "sc", "st", "varasat", "virasat", "pauti", "foti",
                "batwara", "kurra", "takseem", "gpa", "dlr", "81", "jamabandi", "girdawari",
                "inteqal", "larra", "byaj", "radhy", "suraj", "lamp", "nigrani", "swatva", "ghoshanatmak"
            ])
            chunk_doc_type = chunk.get("document_type", "").lower()
            chunk_id_lower = chunk.get("chunk_id", "").lower()
            is_parcel_chunk = "parcel" in chunk_doc_type or "parcel" in chunk_id_lower

            if is_statutory_query:
                if is_parcel_chunk:
                    combined_score *= 0.40  # Demote raw parcel dumps for legal/statutory queries
                else:
                    combined_score *= 1.50  # Boost primary statutes, revenue codes, and Supreme Court rulings

            if combined_score > 0.18 or lexical_hits > 0:
                candidates.append({
                    "chunk": {
                        "chunk_id": chunk.get("chunk_id", ""),
                        "document_id": chunk.get("document_id", chunk.get("chunk_id", "")),
                        "document_title": chunk.get("document_title", ""),
                        "section": chunk.get("section", ""),
                        "topic": chunk.get("topic", ""),
                        "content": chunk["content"],
                        "jurisdiction": chunk.get("jurisdiction", ""),
                        "publisher": chunk.get("publisher", ""),
                        "source_url": chunk.get("source_url", ""),
                        "document_type": chunk.get("document_type", ""),
                        "content_hash": chunk.get("content_hash", "")
                    },
                    "lexical_score": round(lexical_score, 4),
                    "semantic_score": round(semantic_score, 4),
                    "combined_score": round(combined_score, 4),
                    "match_reasons": match_reasons[:3]
                })

        candidates.sort(key=lambda x: x["combined_score"], reverse=True)
        return candidates[:limit]
