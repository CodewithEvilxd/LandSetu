import re
import time
from typing import Dict, Any, List

def extract_land_record_from_text(
    document_name: str,
    raw_text: str,
    record_id: str = None
) -> Dict[str, Any]:
    if not record_id:
        record_id = f"REC-OCR-{int(time.time() * 1000)}"

    warnings: List[str] = []

    # Language & State detection
    state = "Unknown"
    language = "English"
    if re.search(r"उत्तर\s*प्रदेश|भूलेख|खतौनी", raw_text, re.IGNORECASE):
        state = "Uttar Pradesh"
        language = "Hindi / Revenue Dialect"
    elif re.search(r"महाराष्ट्र|हवेली|गाव नमुना|फेरफार|सातबारा", raw_text, re.IGNORECASE):
        state = "Maharashtra"
        language = "Marathi / Modi Revenue Dialect"

    # 1. Owner Name
    owner_name = "Not Identified"
    raw_owner = ""
    owner_conf = 0.50
    hindi_owner = re.search(r"खातेदार(?:\s*का\s*नाम)?\s*:\s*([^\n\r,]+)", raw_text, re.IGNORECASE)
    marathi_owner = re.search(r"खातेदार\s*:\s*([^\n\r,]+)", raw_text, re.IGNORECASE)
    if hindi_owner:
        raw_owner = hindi_owner.group(1).strip()
        owner_name = raw_owner
        owner_conf = 0.94
    elif marathi_owner:
        raw_owner = marathi_owner.group(1).strip()
        owner_name = raw_owner
        owner_conf = 0.92
    else:
        warnings.append("Owner name could not be definitively matched from standard revenue headers.")

    # 2. Khata Number
    khata = "Unknown"
    khata_conf = 0.50
    khata_match = re.search(r"खाता\s*(?:संख्या|क्र)?\s*:\s*([0-9\/\-]+)", raw_text, re.IGNORECASE)
    if khata_match:
        khata = khata_match.group(1).strip()
        khata_conf = 0.96
    else:
        warnings.append("Khata account number not found in header.")

    # 3. Khasra / Survey Number
    khasra = "Unknown"
    khasra_conf = 0.50
    khasra_match = re.search(r"(?:खसरा\s*संख्या|गट\s*क्रमांक)\s*:\s*([0-9\/\s,]+)", raw_text, re.IGNORECASE)
    if khasra_match:
        khasra = khasra_match.group(1).strip()
        khasra_conf = 0.95
    else:
        warnings.append("Khasra/Gat parcel identifier requires manual review.")

    # 4. Area
    area_hectares = 0.0
    area_conf = 0.50
    raw_area = "Not parsed"
    area_match = re.search(r"([0-9.]+)\s*(?:हेक्टेयर|हेक्टर)", raw_text, re.IGNORECASE)
    if area_match:
        area_hectares = float(area_match.group(1))
        raw_area = area_match.group(0)
        area_conf = 0.95
    else:
        area_conf = 0.65
        warnings.append("Plot area could not be parsed into metric hectares.")

    # 5. Administrative Units
    village_match = re.search(r"(?:ग्राम|गाव)\s*:\s*([^\n\r,]+)", raw_text, re.IGNORECASE)
    tehsil_match = re.search(r"(?:तहसील|तालुका)\s*:\s*([^\n\r,]+)", raw_text, re.IGNORECASE)
    district_match = re.search(r"(?:जनपद|जिल्हा)\s*:\s*([^\n\r,]+)", raw_text, re.IGNORECASE)

    # 6. Encumbrances / Bank Loan
    has_loan = bool(re.search(r"बँक|बैंक|कर्ज|बोजा|encumbrance|mortgage|dispute|stay", raw_text, re.IGNORECASE))
    mutation_match = re.search(r"(?:नामांतरण|फेरफार|आदेश)[\s\S]*?(?=\n\n|$)", raw_text, re.IGNORECASE)

    fields = {
        "owner_name": {
            "value": owner_name,
            "raw_value": raw_owner,
            "confidence": owner_conf,
            "flagged": owner_conf < 0.85
        },
        "khata_number": {
            "value": khata,
            "raw_value": khata,
            "confidence": khata_conf,
            "flagged": khata_conf < 0.85
        },
        "khasra_number": {
            "value": khasra,
            "raw_value": khasra,
            "confidence": khasra_conf,
            "flagged": khasra_conf < 0.85
        },
        "survey_plot_number": {
            "value": khasra,
            "raw_value": khasra,
            "confidence": khasra_conf,
            "flagged": khasra_conf < 0.85
        },
        "area_hectares": {
            "value": area_hectares,
            "raw_value": raw_area,
            "confidence": area_conf,
            "flagged": area_conf < 0.85
        },
        "area_local_unit": {
            "value": raw_area,
            "raw_value": raw_area,
            "confidence": 0.88,
            "flagged": False
        },
        "state": {
            "value": state,
            "raw_value": state,
            "confidence": 0.98,
            "flagged": False
        },
        "district": {
            "value": district_match.group(1).strip() if district_match else "Not Specified",
            "raw_value": district_match.group(1).strip() if district_match else "",
            "confidence": 0.95 if district_match else 0.60,
            "flagged": not bool(district_match)
        },
        "tehsil": {
            "value": tehsil_match.group(1).strip() if tehsil_match else "Not Specified",
            "raw_value": tehsil_match.group(1).strip() if tehsil_match else "",
            "confidence": 0.94 if tehsil_match else 0.60,
            "flagged": not bool(tehsil_match)
        },
        "village": {
            "value": village_match.group(1).strip() if village_match else "Not Specified",
            "raw_value": village_match.group(1).strip() if village_match else "",
            "confidence": 0.95 if village_match else 0.60,
            "flagged": not bool(village_match)
        },
        "land_classification": {
            "value": "Class 1-A (Bhumidhar with Transferable Rights)" if re.search(r"संक्रमणीय", raw_text) else "Standard Agricultural",
            "raw_value": "Class 1-A",
            "confidence": 0.90,
            "flagged": False
        },
        "mutation_details": {
            "value": mutation_match.group(0).replace("\n", " ").strip()[:120] if mutation_match else "No active mutation note",
            "raw_value": mutation_match.group(0) if mutation_match else "",
            "confidence": 0.86 if mutation_match else 0.90,
            "flagged": False
        },
        "dispute_encumbrance": {
            "value": "Active Bank Loan / Encumbrance Detected" if has_loan else "Clear (Zero Encumbrance Detected)",
            "raw_value": "Bank Loan / Charge Noted" if has_loan else "Clean Record",
            "confidence": 0.89,
            "flagged": has_loan
        }
    }

    field_items = list(fields.values())
    uncertain_count = sum(1 for f in field_items if f["flagged"])
    overall_conf = sum(f["confidence"] for f in field_items) / len(field_items)

    return {
        "record_id": record_id,
        "document_name": document_name,
        "language": language,
        "document_type": "Saat Baara (7/12 Extract)" if re.search(r"7\/12|सातबारा", raw_text) else "Khatauni (Record of Rights)",
        "raw_ocr_text": raw_text,
        "overall_confidence": round(overall_conf, 2),
        "fields": fields,
        "uncertain_field_count": uncertain_count,
        "verification_status": "pending_review" if uncertain_count > 0 else "verified",
        "validation_warnings": warnings
    }
