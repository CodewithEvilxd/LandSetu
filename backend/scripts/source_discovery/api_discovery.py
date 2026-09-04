"""
LandSetu Source Discovery: API & Service Discovery Inspector
Determines whether an official government source provides:
- Open JSON / REST API
- OGC Geospatial Service (WMS / WFS / GeoJSON)
- Static downloadable publication (PDF / CSV)
- Interactive web portal (requiring human interaction / connector)
"""

from typing import Dict, Any, List
from source_registry import OFFICIAL_SOURCES

def inspect_endpoint_capabilities(source: Dict[str, Any]) -> Dict[str, Any]:
    url = source.get("official_url", "")
    mode = source.get("access_mode", "")
    
    classification = {
        "source_id": source["source_id"],
        "state": source["state"],
        "official_url": url,
        "access_mode": mode,
        "has_public_rest_api": False,
        "has_ogc_gis_endpoint": False,
        "has_official_download": False,
        "has_interactive_search": False,
        "ingestion_strategy": "",
        "legal_data_safety_status": "COMPLIANT"
    }

    if "dlrc.delhi.gov.in" in url:
        classification["has_interactive_search"] = True
        classification["ingestion_strategy"] = "Connector Abstraction + Lawful Gazette Records Ingestion (No CAPTCHA Bypassing)"
    elif "revenue.delhi.gov.in" in url or "land.delhi.gov.in" in url:
        classification["has_official_download"] = True
        classification["ingestion_strategy"] = "Official Statutory Gazette Document Ingestion (RFCTLARR Sec 11, 19, 23)"
    elif "jamabandi.nic.in" in url:
        classification["has_interactive_search"] = True
        classification["ingestion_strategy"] = "Connector Abstraction + Lawful Gazette Jamabandi Ingestion (No CAPTCHA Bypassing)"
    elif "maps.revenueharyana.gov.in" in url:
        classification["has_ogc_gis_endpoint"] = True
        classification["ingestion_strategy"] = "OGC GeoJSON / PostGIS-Compatible Cadastral Polygon Normalization"
    elif "ddoris.delhigovt.nic.in" in url or "haryanait.gov.in" in url:
        classification["has_interactive_search"] = True
        classification["ingestion_strategy"] = "Public Registration Metadata Adapter (Preserving SRO Provenance)"
    else:
        classification["ingestion_strategy"] = "Standard Official Record Processing"

    return classification

def discover_all_capabilities() -> List[Dict[str, Any]]:
    print("=================================================")
    print(" LANDSETU API & ACCESS CAPABILITY DISCOVERY")
    print("=================================================")
    capabilities = []
    for s in OFFICIAL_SOURCES:
        cap = inspect_endpoint_capabilities(s)
        print(f"[{cap['source_id']}] {s['state']} | Mode: {cap['access_mode']}")
        print(f"   -> Strategy: {cap['ingestion_strategy']}")
        capabilities.append(cap)
    return capabilities

if __name__ == "__main__":
    discover_all_capabilities()
