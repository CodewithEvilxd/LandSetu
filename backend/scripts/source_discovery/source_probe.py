"""
LandSetu Source Discovery: Source Probe
Probes official source URLs for reachability, TLS/SSL, status codes, and headers
WITHOUT bypassing access controls or submitting automated queries to interactive search.
"""

import urllib.request
import urllib.error
import ssl
import time
from typing import Dict, Any
from source_registry import OFFICIAL_SOURCES

def probe_source(source: Dict[str, Any]) -> Dict[str, Any]:
    url = source.get("official_url")
    result = {
        "source_id": source["source_id"],
        "source_name": source["source_name"],
        "official_url": url,
        "access_mode": source["access_mode"],
        "state": source["state"],
        "is_reachable": False,
        "status_code": None,
        "content_type": None,
        "response_time_ms": None,
        "error": None
    }
    
    if not url or not url.startswith("http"):
        result["error"] = "Invalid URL"
        return result

    req = urllib.request.Request(
        url,
        headers={"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) LandSetu-Provenance-Prober/1.0"}
    )
    
    # Standard non-verifying SSL context for testing official government portal certificates
    ctx = ssl.create_default_context()
    ctx.check_hostname = False
    ctx.verify_mode = ssl.CERT_NONE

    start_time = time.time()
    try:
        with urllib.request.urlopen(req, timeout=5, context=ctx) as resp:
            elapsed = int((time.time() - start_time) * 1000)
            result["is_reachable"] = True
            result["status_code"] = resp.status
            result["content_type"] = resp.headers.get("Content-Type", "")
            result["response_time_ms"] = elapsed
    except urllib.error.HTTPError as he:
        result["status_code"] = he.code
        result["error"] = f"HTTP {he.code}"
    except Exception as e:
        result["error"] = str(e)

    return result

def probe_all_sources():
    print("=================================================")
    print(" LANDSETU OFFICIAL SOURCE CONNECTIVITY PROBE")
    print("=================================================")
    results = []
    for s in OFFICIAL_SOURCES:
        res = probe_source(s)
        status_symbol = "[OK]" if res["is_reachable"] else "[OFFLINE/BLOCKED]"
        print(f"{status_symbol} {s['source_id']} ({s['state']}): {s['official_url']} -> {res.get('status_code') or res.get('error')}")
        results.append(res)
    return results

if __name__ == "__main__":
    probe_all_sources()
