"""
LandSetu Source Discovery: Master Source Registry for Delhi & Haryana Official Land Governance Sources
Compliant with strict legal/data safety guidelines:
- Records access modes: official_document, public_web_search, public_gis_service, manual_authorized_import, unavailable
- Zero scraping of protected/CAPTCHA interfaces
- Zero credential harvesting
"""

import json
import os
from typing import List, Dict, Any

OFFICIAL_SOURCES: List[Dict[str, Any]] = [
    # --- DELHI OFFICIAL SOURCES ---
    {
        "source_id": "SRC-DELHI-DLRC-001",
        "source_name": "Indraprastha Bhulekh / Delhi Land Record Computerization (DLRC)",
        "publisher": "Department of Revenue, Government of NCT of Delhi",
        "state": "Delhi",
        "domain": "Record of Rights (RoR), Khatauni & Village Cadastre",
        "official_url": "https://dlrc.delhi.gov.in/",
        "access_mode": "public_web_search",
        "api_url": None,
        "download_url": None,
        "data_format": "Interactive HTML / Digital Signed PDF",
        "coverage": "11 Revenue Districts, Subdivisions & Revenue Villages of Delhi",
        "license_note": "Government of NCT of Delhi Official Citizen Service Portal",
        "terms_note": "Protected citizen search interface with session controls. Direct bulk REST API is not publicly advertised.",
        "status": "connected_via_connector",
        "parser_version": "v1.0.0",
        "fields_exposed": ["District", "Subdivision", "Village", "Khata", "Khasra", "Area", "Recorded Rights-Holder", "Share", "Remarks", "Signed Khatauni", "GIS Map View"]
    },
    {
        "source_id": "SRC-DELHI-REV-GAZ-002",
        "source_name": "Delhi Revenue Department Statutory Gazette Notifications & Land Acquisition Records",
        "publisher": "Revenue Department, Government of NCT of Delhi & Land & Building Department",
        "state": "Delhi",
        "domain": "Statutory Land Acquisition Notifications (RFCTLARR Sec 11, 19, 23)",
        "official_url": "https://revenue.delhi.gov.in/",
        "access_mode": "official_document",
        "api_url": None,
        "download_url": "https://land.delhi.gov.in/land-acquisition-notifications",
        "data_format": "Official Gazette PDF / Sourced JSON",
        "coverage": "Infrastructure corridors (UER-II, Delhi Metro Phase IV, Barapullah Phase III)",
        "license_note": "Delhi Gazette Public Lawful Record",
        "terms_note": "Published statutory notifications specifying Khasra numbers, recorded owners, rect numbers, areas, and awards.",
        "status": "active_ingested",
        "parser_version": "v1.0.0",
        "fields_exposed": ["Project Name", "Notification Number", "Section", "District", "Village", "Khasra No", "Area", "Recorded Tenure Holder", "Compensation Award Status"]
    },
    {
        "source_id": "SRC-DELHI-DORIS-003",
        "source_name": "Delhi Online Registration Information System (DORIS) / NGDRS Delhi",
        "publisher": "Department of Revenue, Government of NCT of Delhi",
        "state": "Delhi",
        "domain": "Property Deed Registration & Sub-Registrar Records",
        "official_url": "https://ddoris.delhigovt.nic.in/",
        "access_mode": "public_web_search",
        "api_url": None,
        "download_url": None,
        "data_format": "HTML / e-Search Reference",
        "coverage": "Sub-Registrar Offices (SROs) in Delhi",
        "license_note": "Public Property Registration e-Search",
        "terms_note": "Public search metadata exposed for registered deeds; bulk export restricted.",
        "status": "connected_via_connector",
        "parser_version": "v1.0.0",
        "fields_exposed": ["Deed Number", "Registration Date", "SRO Office", "Locality", "Khasra/Mustil Ref", "First/Second Party Metadata"]
    },
    {
        "source_id": "SRC-DELHI-GIS-004",
        "source_name": "Delhi Geospatial Cadastral Survey & Revenue Village Boundaries",
        "publisher": "Delhi Geospatial Data Infrastructure (GSDL) / Survey of India / DILRMP",
        "state": "Delhi",
        "domain": "Cadastral Parcel Geometries & Revenue Village Maps",
        "official_url": "https://revenue.delhi.gov.in/revenue-maps",
        "access_mode": "public_gis_service",
        "api_url": None,
        "download_url": None,
        "data_format": "GeoJSON (EPSG:4326)",
        "coverage": "Selected verified revenue villages with cadastral survey maps",
        "license_note": "Open Geospatial Prototype Attribution / DILRMP",
        "terms_note": "Cadastral parcel boundaries with coordinate integrity.",
        "status": "active_ingested",
        "parser_version": "v1.0.0",
        "fields_exposed": ["parcel_uid", "khasra_no", "polygon_geometry", "centroid", "area_sqm", "village_boundary"]
    },

    # --- HARYANA OFFICIAL SOURCES ---
    {
        "source_id": "SRC-HARYANA-JAMABANDI-005",
        "source_name": "Haryana Jamabandi Land Records Portal",
        "publisher": "Department of Revenue and Disaster Management, Government of Haryana",
        "state": "Haryana",
        "domain": "Jamabandi (Record of Rights), Mutation (Intaqal), Registered Deeds",
        "official_url": "https://jamabandi.nic.in/",
        "access_mode": "public_web_search",
        "api_url": None,
        "download_url": None,
        "data_format": "Interactive HTML / Nakal PDF",
        "coverage": "22 Districts, Tehsils & Revenue Villages of Haryana",
        "license_note": "Government of Haryana Official Revenue Service Portal",
        "terms_note": "Public citizen search by Khewat, Khasra, Owner Name, and Mutation. Bulk API unavailable.",
        "status": "connected_via_connector",
        "parser_version": "v1.0.0",
        "fields_exposed": ["District", "Tehsil", "Village", "Khewat", "Khatoni", "Mustil/Khasra", "Area (Kanal-Marla)", "Recorded Owner (Hissedar)", "Cultivator (Kashtkar)", "Sanctioned Mutation"]
    },
    {
        "source_id": "SRC-HARYANA-HALRIS-006",
        "source_name": "WEB-HALRIS (Haryana Land Records Information System)",
        "publisher": "Haryana IT & Department of Revenue and Disaster Management",
        "state": "Haryana",
        "domain": "Integrated Registration & Land Record Mutation Workflow",
        "official_url": "https://haryanait.gov.in/web-halris/",
        "access_mode": "official_document",
        "api_url": None,
        "download_url": None,
        "data_format": "System Integration Specifications & Gazette Reports",
        "coverage": "All Tehsils & SROs across Haryana",
        "license_note": "Official Haryana State IT Architecture",
        "terms_note": "Institutional portal linking deed registration at SRO with automatic mutation notice at Tehsil.",
        "status": "connected_via_connector",
        "parser_version": "v1.0.0",
        "fields_exposed": ["Deed Ref", "Automatic Mutation Status", "Sanctioning Authority", "Rejection Grounds", "Notice Period"]
    },
    {
        "source_id": "SRC-HARYANA-BHUNAKSHA-007",
        "source_name": "Haryana BhuNaksha Cadastral Mapping Portal",
        "publisher": "National Informatics Centre (NIC) & Revenue Department Haryana",
        "state": "Haryana",
        "domain": "Cadastral Parcel Geometries, Village Maps & Tatima Shajra",
        "official_url": "https://maps.revenueharyana.gov.in/",
        "access_mode": "public_gis_service",
        "api_url": None,
        "download_url": None,
        "data_format": "GeoJSON / Vector Layer (EPSG:4326)",
        "coverage": "Cadastral surveyed revenue villages (e.g. Gurugram, Sonipat, Rohtak clusters)",
        "license_note": "NIC BhuNaksha Geospatial Framework",
        "terms_note": "Cadastral parcel polygons with Khasra numbers and area bounds.",
        "status": "active_ingested",
        "parser_version": "v1.0.0",
        "fields_exposed": ["parcel_uid", "khasra_no", "mustil_no", "polygon_geometry", "centroid", "area_sqm", "adjacent_khasras"]
    },
    {
        "source_id": "SRC-HARYANA-ACQ-GAZ-008",
        "source_name": "Haryana Land Acquisition Awards & Gazette Notifications",
        "publisher": "Haryana Revenue Department & HSIIDC / NHAI Monitoring",
        "state": "Haryana",
        "domain": "Infrastructure Acquisition Awards (KMP Expressway, Dwarka Expressway, Regional Rail)",
        "official_url": "https://revenueharyana.gov.in/",
        "access_mode": "official_document",
        "api_url": None,
        "download_url": None,
        "data_format": "Gazette PDF / Sourced JSON",
        "coverage": "Kundli-Manesar-Palwal Corridor & Gurugram-Faridabad Industrial Slices",
        "license_note": "Haryana Government Gazette Official Public Enactments",
        "terms_note": "Legally gazetted awards with Khasra, Khewat, area, and compensation details.",
        "status": "active_ingested",
        "parser_version": "v1.0.0",
        "fields_exposed": ["Project Name", "Gazette Notification", "Section", "Village", "Khasra No", "Khewat No", "Area", "Recorded Owner", "Disbursement Status"]
    }
]

def get_all_sources() -> List[Dict[str, Any]]:
    return OFFICIAL_SOURCES

def get_sources_by_state(state: str) -> List[Dict[str, Any]]:
    return [s for s in OFFICIAL_SOURCES if s["state"].lower() == state.lower()]

def export_registry_json(output_path: str):
    os.makedirs(os.path.dirname(os.path.abspath(output_path)), exist_ok=True)
    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(OFFICIAL_SOURCES, f, indent=2, ensure_ascii=False)
    print(f"[Source Registry] Exported {len(OFFICIAL_SOURCES)} verified official sources to {output_path}")

if __name__ == "__main__":
    export_registry_json("backend/data/raw/source_registry_delhi_haryana.json")
