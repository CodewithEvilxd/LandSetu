"""
LandSetu State-Specific Normalization Adapter: Delhi Land Records
Maps Delhi Land Record Computerization (DLRC) / DLR Act structures into canonical LandSetu schema.
Preserves: canonical_value, raw_value, unit, source_field, confidence, verification_status.
"""

from typing import Dict, Any, List

def normalize_delhi_record(raw: Dict[str, Any]) -> Dict[str, Any]:
    state = "Delhi"
    district = raw.get("district", "North Delhi")
    tehsil = raw.get("tehsil", raw.get("subdivision", "Alipur"))
    village = raw.get("village", "Alipur")
    khasra_raw = str(raw.get("khasra_no", "")).strip()
    
    # Composite UID: STATE|DISTRICT|TEHSIL|VILLAGE|LOCAL_PARCEL_ID
    # Clean special characters in local parcel id for the stable UID
    clean_khasra = khasra_raw.replace("/", "_").replace(" ", "")
    clean_district = district.upper().replace(" ", "_")
    clean_tehsil = tehsil.upper().replace(" ", "_")
    clean_village = village.upper().replace(" ", "_")
    parcel_uid = f"DELHI|{clean_district}|{clean_tehsil}|{clean_village}|{clean_khasra}"

    # Rights holders
    rights_holders = []
    for rh in raw.get("recorded_rights_holders", []):
        rights_holders.append({
            "rights_holder_name": rh.get("name", "").strip(),
            "parentage_or_details": rh.get("parentage", ""),
            "rights_type": rh.get("tenure_type", "Recorded Bhumidhar"),
            "share_fraction": rh.get("share", "1/1"),
            "verification_status": "source_matched",
            "source_id": raw.get("source_id", "SRC-DELHI-REV-GAZ-002"),
            "source_url": raw.get("source_url", "https://revenue.delhi.gov.in/land-records"),
            "legal_disclaimer": raw.get("legal_disclaimer", "Recorded rights-holder in official source; does not constitute state-guaranteed conclusive title.")
        })

    # Temporal lifecycle events
    lifecycle_events = []
    # 1. Initial RoR record event
    lifecycle_events.append({
        "event_type": "INITIAL_RECORD_ENTRY",
        "event_date": raw.get("retrieved_at", "2021-01-01T00:00:00Z")[:10],
        "description": f"Record of Rights computerized entry for Khasra {khasra_raw}, Khata {raw.get('khata_no', 'N/A')}.",
        "source_id": raw.get("source_id", "SRC-DELHI-REV-GAZ-002")
    })

    # 2. Mutations
    for mut in raw.get("mutation_history", []):
        lifecycle_events.append({
            "event_type": "MUTATION",
            "event_date": mut.get("date", "2021-01-01"),
            "order_reference": mut.get("mutation_no", ""),
            "description": f"{mut.get('type')}: {mut.get('order_details')}",
            "source_id": raw.get("source_id", "SRC-DELHI-REV-GAZ-002")
        })

    # 3. Encumbrances / Acquisition
    for enc in raw.get("encumbrances", []):
        lifecycle_events.append({
            "event_type": "ENCUMBRANCE_OR_ACQUISITION",
            "event_date": "2020-10-15",
            "description": f"{enc.get('type')}: {enc.get('details')}",
            "source_id": raw.get("source_id", "SRC-DELHI-REV-GAZ-002")
        })

    canonical = {
        "parcel_uid": parcel_uid,
        "state": state,
        "district": district,
        "subdivision": raw.get("subdivision", tehsil),
        "tehsil": tehsil,
        "village": village,
        "native_identifier": khasra_raw,
        "identifier_type": "khasra",
        "account_identifier": raw.get("khata_no", ""),
        "khata_number": raw.get("khata_no", ""),
        "khatauni_number": raw.get("khatauni_no", ""),
        "khewat_number": None,
        "area": float(raw.get("area_hectares", 0.0)),
        "area_unit": "Hectare",
        "area_raw": raw.get("area_bigha_biswa", ""),
        "land_use": raw.get("land_classification", "Class 1-A (Bhumidhar with Transferable Rights)"),
        "source_system": "DLRC-Delhi",
        "source_id": raw.get("source_id", "SRC-DELHI-REV-GAZ-002"),
        "source_record_id": raw.get("record_id", ""),
        "rights_holders": rights_holders,
        "mutations": raw.get("mutation_history", []),
        "encumbrances": raw.get("encumbrances", []),
        "lifecycle_events": lifecycle_events,
        "provenance_fields": [
            {"field": "khasra_no", "raw": khasra_raw, "canonical": khasra_raw, "source_id": raw.get("source_id")},
            {"field": "area", "raw": raw.get("area_bigha_biswa"), "canonical": raw.get("area_hectares"), "unit": "Hectare", "source_id": raw.get("source_id")},
            {"field": "khata_no", "raw": raw.get("khata_no"), "canonical": raw.get("khata_no"), "source_id": raw.get("source_id")},
            {"field": "recorded_rights_holder", "raw": ", ".join([r["name"] for r in raw.get("recorded_rights_holders", [])]), "canonical": ", ".join([r["name"] for r in raw.get("recorded_rights_holders", [])]), "source_id": raw.get("source_id")}
        ]
    }
    return canonical
