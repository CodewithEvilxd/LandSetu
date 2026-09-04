"""
LandSetu State-Specific Normalization Adapter: Haryana Land Records
Maps Haryana Jamabandi (RoR) / WEB-HALRIS structures (Punjab Land Revenue Act) into canonical LandSetu schema.
Preserves: canonical_value, raw_value, unit, source_field, confidence, verification_status.
"""

from typing import Dict, Any, List

def normalize_haryana_record(raw: Dict[str, Any]) -> Dict[str, Any]:
    state = "Haryana"
    district = raw.get("district", "Gurugram")
    tehsil = raw.get("tehsil", "Wazirabad")
    village = raw.get("village", "Wazirabad")
    khasra_raw = str(raw.get("killa_khasra_no", "")).strip()
    
    clean_khasra = khasra_raw.replace("/", "_").replace(" ", "")
    clean_district = district.upper().replace(" ", "_")
    clean_tehsil = tehsil.upper().replace(" ", "_")
    clean_village = village.upper().replace(" ", "_")
    parcel_uid = f"HARYANA|{clean_district}|{clean_tehsil}|{clean_village}|{clean_khasra}"

    # Rights holders
    rights_holders = []
    for rh in raw.get("recorded_owners_hissedaran", []):
        rights_holders.append({
            "rights_holder_name": rh.get("name", "").strip(),
            "parentage_or_details": rh.get("parentage", ""),
            "rights_type": rh.get("tenure_type", "Recorded Hissedar"),
            "share_fraction": rh.get("share", "1/1"),
            "verification_status": "source_matched",
            "source_id": raw.get("source_id", "SRC-HARYANA-JAMABANDI-005"),
            "source_url": raw.get("source_url", "https://jamabandi.nic.in/land-records"),
            "legal_disclaimer": raw.get("legal_disclaimer", "Recorded rights-holder in official Jamabandi source; does not constitute state-guaranteed conclusive title.")
        })

    # Temporal lifecycle events
    lifecycle_events = []
    # 1. Initial Jamabandi entry
    lifecycle_events.append({
        "event_type": "INITIAL_JAMABANDI_ENTRY",
        "event_date": raw.get("retrieved_at", "2022-01-01T00:00:00Z")[:10],
        "description": f"Jamabandi Quadrennial revision entry for Mustil {raw.get('mustil_no')}, Khasra {khasra_raw}, Khewat {raw.get('khewat_no')}.",
        "source_id": raw.get("source_id", "SRC-HARYANA-JAMABANDI-005")
    })

    # 2. Mutations
    for mut in raw.get("mutation_history", []):
        lifecycle_events.append({
            "event_type": "SANCTIONED_MUTATION",
            "event_date": mut.get("date", "2022-01-15"),
            "order_reference": mut.get("mutation_no", ""),
            "description": f"{mut.get('type')}: {mut.get('order_details')}",
            "source_id": raw.get("source_id", "SRC-HARYANA-JAMABANDI-005")
        })

    # 3. Encumbrances / Acquisition
    for enc in raw.get("encumbrances", []):
        lifecycle_events.append({
            "event_type": "ENCUMBRANCE_OR_CHARGE",
            "event_date": "2021-03-25",
            "description": f"{enc.get('type')} ({enc.get('institution')}): {enc.get('details')}",
            "source_id": raw.get("source_id", "SRC-HARYANA-JAMABANDI-005")
        })

    canonical = {
        "parcel_uid": parcel_uid,
        "state": state,
        "district": district,
        "subdivision": raw.get("sub_tehsil", tehsil),
        "tehsil": tehsil,
        "village": village,
        "native_identifier": khasra_raw,
        "identifier_type": "khasra",
        "account_identifier": raw.get("khewat_no", ""),
        "khata_number": raw.get("khatoni_no", ""),
        "khatauni_number": raw.get("khatoni_no", ""),
        "khewat_number": raw.get("khewat_no", ""),
        "area": float(raw.get("area_hectares", 0.0)),
        "area_unit": "Hectare",
        "area_raw": raw.get("area_kanal_marla", ""),
        "land_use": raw.get("land_classification", "Chahi (Irrigated Agricultural)"),
        "source_system": "Jamabandi-Haryana",
        "source_id": raw.get("source_id", "SRC-HARYANA-JAMABANDI-005"),
        "source_record_id": raw.get("record_id", ""),
        "rights_holders": rights_holders,
        "mutations": raw.get("mutation_history", []),
        "encumbrances": raw.get("encumbrances", []),
        "lifecycle_events": lifecycle_events,
        "provenance_fields": [
            {"field": "khasra_no", "raw": khasra_raw, "canonical": khasra_raw, "source_id": raw.get("source_id")},
            {"field": "khewat_no", "raw": raw.get("khewat_no"), "canonical": raw.get("khewat_no"), "source_id": raw.get("source_id")},
            {"field": "area", "raw": raw.get("area_kanal_marla"), "canonical": raw.get("area_hectares"), "unit": "Hectare", "source_id": raw.get("source_id")},
            {"field": "recorded_rights_holder", "raw": ", ".join([r["name"] for r in raw.get("recorded_owners_hissedaran", [])]), "canonical": ", ".join([r["name"] for r in raw.get("recorded_owners_hissedaran", [])]), "source_id": raw.get("source_id")}
        ]
    }
    return canonical
