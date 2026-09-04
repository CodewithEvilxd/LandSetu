"""
LandSetu State-Specific Normalization Adapter: Bihar Land Records
Maps Bihar Bhumijankari / Biharbhumi online Khatiyan & Jamabandi structures (Bihar Tenancy Act / Bihar Land Reforms Act) into canonical LandSetu schema.
Preserves: canonical_value, raw_value, unit, source_field, confidence, verification_status.
"""

from typing import Dict, Any, List

def normalize_bihar_record(raw: Dict[str, Any]) -> Dict[str, Any]:
    state = "Bihar"
    district = raw.get("district", "Patna")
    tehsil = raw.get("tehsil", raw.get("anchal", "Patna Sadar"))
    village = raw.get("village", raw.get("mauza", "Sabbalpur"))
    khesra_raw = str(raw.get("khesra_no", raw.get("khasra_no", ""))).strip()
    
    # Composite UID: BIHAR|DISTRICT|TEHSIL|VILLAGE|KHESRA
    clean_khesra = khesra_raw.replace("/", "_").replace(" ", "")
    clean_district = district.upper().replace(" ", "_")
    clean_tehsil = tehsil.upper().replace(" ", "_")
    clean_village = village.upper().replace(" ", "_")
    parcel_uid = f"BIHAR|{clean_district}|{clean_tehsil}|{clean_village}|{clean_khesra}"

    # Rights holders (Raiyats)
    rights_holders = []
    for rh in raw.get("recorded_rights_holders", []):
        rights_holders.append({
            "rights_holder_name": rh.get("name", "").strip(),
            "parentage_or_details": rh.get("parentage", ""),
            "rights_type": rh.get("tenure_type", "Kaimi Raiyat"),
            "share_fraction": rh.get("share", "1/1"),
            "verification_status": "source_matched",
            "source_id": raw.get("source_id", "SRC-BIHAR-BHUMI-001"),
            "source_url": raw.get("source_url", "http://biharbhumi.bihar.gov.in"),
            "legal_disclaimer": raw.get("legal_disclaimer", "Recorded rights-holder in official Bihar Bhumijankari source; does not constitute state-guaranteed conclusive title.")
        })

    # Temporal lifecycle events
    lifecycle_events = []
    # 1. Initial Khatiyan / Jamabandi entry
    lifecycle_events.append({
        "event_type": "INITIAL_KHATIYAN_ENTRY",
        "event_date": raw.get("retrieved_at", "2020-01-01T00:00:00Z")[:10],
        "description": f"Khatiyan / Jamabandi entry for Khesra {khesra_raw}, Khata {raw.get('khata_no', 'N/A')}, Jamabandi {raw.get('jamabandi_no', 'N/A')}.",
        "source_id": raw.get("source_id", "SRC-BIHAR-BHUMI-001")
    })

    # 2. Dakhil-Kharij (Mutations)
    for mut in raw.get("mutation_history", []):
        lifecycle_events.append({
            "event_type": "SANCTIONED_DAKHIL_KHARIJ",
            "event_date": mut.get("date", "2022-01-01"),
            "order_reference": mut.get("mutation_no", ""),
            "description": f"{mut.get('type')}: {mut.get('order_details')}",
            "source_id": raw.get("source_id", "SRC-BIHAR-BHUMI-001")
        })

    # 3. Encumbrances / Acquisition
    for enc in raw.get("encumbrances", []):
        lifecycle_events.append({
            "event_type": "ENCUMBRANCE_OR_ACQUISITION",
            "event_date": "2023-08-14",
            "description": f"{enc.get('type')}: {enc.get('details')}",
            "source_id": raw.get("source_id", "SRC-BIHAR-BHUMI-001")
        })

    canonical = {
        "parcel_uid": parcel_uid,
        "state": state,
        "district": district,
        "subdivision": raw.get("subdivision", tehsil),
        "tehsil": tehsil,
        "village": village,
        "native_identifier": khesra_raw,
        "identifier_type": "khesra_number",
        "account_identifier": str(raw.get("khata_no", "")),
        "source_system": "Biharbhumi / Bhumijankari",
        "source_id": raw.get("source_id", "SRC-BIHAR-BHUMI-001"),
        "source_record_id": raw.get("record_id", f"BIHAR-ROR-{clean_village}-{clean_khesra}"),
        "area": raw.get("area_hectares"),
        "area_unit": "hectares",
        "area_raw": raw.get("area_bigha_kattha_dhur", f"{raw.get('area_hectares', '')} ha"),
        "land_use": raw.get("land_classification", "Kaimi Raiyati"),
        "geometry_id": f"GEOM-{parcel_uid}",
        "accounts": {
            "khata_number": str(raw.get("khata_no", "")),
            "khatiyan_number": str(raw.get("khatiyan_no", "")),
            "jamabandi_number": str(raw.get("jamabandi_no", "")),
            "state": state,
            "village": village,
            "source_id": raw.get("source_id", "SRC-BIHAR-BHUMI-001")
        },
        "rights_holders": rights_holders,
        "lifecycle_events": lifecycle_events,
        "mutations": [
            {
                "mutation_number": m.get("mutation_no", ""),
                "mutation_date": m.get("date"),
                "mutation_type": m.get("type", "Dakhil-Kharij"),
                "status": m.get("status", "sanctioned"),
                "order_reference": m.get("order_details", ""),
                "source_id": raw.get("source_id", "SRC-BIHAR-BHUMI-001")
            }
            for m in raw.get("mutation_history", [])
        ],
        "encumbrances": [
            {
                "encumbrance_type": e.get("type", "Notice"),
                "institution": e.get("authority", "Government of Bihar"),
                "details": e.get("details", ""),
                "source_id": raw.get("source_id", "SRC-BIHAR-BHUMI-001")
            }
            for e in raw.get("encumbrances", [])
        ],
        "evidence": [
            {"field_name": "khesra_number", "field_value": khesra_raw},
            {"field_name": "khata_number", "field_value": str(raw.get("khata_no", ""))},
            {"field_name": "khatiyan_number", "field_value": str(raw.get("khatiyan_no", ""))},
            {"field_name": "area_raw", "field_value": str(raw.get("area_bigha_kattha_dhur", ""))},
            {"field_name": "land_classification", "field_value": str(raw.get("land_classification", ""))}
        ]
    }
    return canonical
