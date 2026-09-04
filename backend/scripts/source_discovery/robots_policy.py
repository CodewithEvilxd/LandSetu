"""
LandSetu Source Discovery: Robots & Legal Compliance Policy
Verifies compliance with terms of service and robots.txt policies for government portals.
Strictly disallows:
- CAPTCHA solving
- Authentication bypass
- Automated high-frequency scraping of interactive citizen portals
"""

from typing import Dict, Any

def get_compliance_policy() -> Dict[str, Any]:
    return {
        "platform": "LandSetu Legal & Data Safety Framework",
        "compliance_rules": [
            {
                "rule_id": "RULE-NO-CAPTCHA-BYPASS",
                "description": "Never attempt to programmatically solve, circumvent, or bypass CAPTCHA on state revenue portals (DLRC Delhi, Jamabandi Haryana).",
                "status": "ENFORCED"
            },
            {
                "rule_id": "RULE-NO-UNAUTHORIZED-SCRAPING",
                "description": "Do not execute mass automated scraping scripts against citizen-facing search endpoints.",
                "status": "ENFORCED"
            },
            {
                "rule_id": "RULE-OFFICIAL-GAZETTE-GROUNDING",
                "description": "Base ingested land records exclusively on officially published gazette notifications, open GIS files, and lawful public records.",
                "status": "ENFORCED"
            },
            {
                "rule_id": "RULE-NO-INVENTED-RECORDS",
                "description": "Never synthesize fake Khasra numbers, fabricated owner names, or manual polygon geometries.",
                "status": "ENFORCED"
            },
            {
                "rule_id": "RULE-RECORDED-RIGHTS-DISCLAIMER",
                "description": "Clearly state that recorded rights-holder names reflect source records and do not constitute state-guaranteed title.",
                "status": "ENFORCED"
            }
        ]
    }

if __name__ == "__main__":
    import json
    print(json.dumps(get_compliance_policy(), indent=2))
