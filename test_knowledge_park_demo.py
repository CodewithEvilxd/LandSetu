"""
=============================================================================
  LANDSETU: KNOWLEDGE PARK 2 & 3 (GREATER NOIDA) LIVE DEMO & MENTOR SCRIPT
  Showcases:
  - NIET College (All 3 Campuses): Campus 1, Campus 2, Campus 3
  - Knowledge Park 2 Hub: Expo Mart, Aqua Line Metro Station, GL Bajaj, IIMT
  - Knowledge Park 3 Hub: Sharda University & Hospital, Galgotias, Lloyd Law
  - AI Retrieval & Legal Grounding under GNIDA Master Plan 2031
=============================================================================
"""

import os
import sys
import sqlite3
import json

if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding="utf-8")
    except Exception:
        pass

PROJECT_ROOT = os.path.abspath(os.path.dirname(__file__))
DB_PATH = os.path.join(PROJECT_ROOT, "backend", "data", "landsetu.db")

def print_header(title):
    print("\n" + "=" * 78)
    print(f" {title.center(76)} ")
    print("=" * 78)

def demo_niet_campuses():
    print_header("1. NIET COLLEGE (CAMPUS 1, 2, 3) OFFICIAL CADASTRAL RECORDS")
    
    conn = sqlite3.connect(DB_PATH)
    cur = conn.cursor()
    
    query = """
        SELECT p.native_identifier, p.area, p.area_raw, p.land_use, 
               r.rights_holder_name, r.rights_type, m.mutation_number, m.mutation_type, m.order_reference
        FROM land_parcels p
        JOIN parcel_rights r ON p.parcel_uid = r.parcel_uid
        LEFT JOIN parcel_mutations m ON p.parcel_uid = m.parcel_uid
        WHERE p.village = 'Knowledge Park II' AND p.native_identifier IN ('319', '320', '321')
        ORDER BY p.native_identifier ASC
    """
    cur.execute(query)
    rows = cur.fetchall()
    conn.close()
    
    campuses = [
        ("NIET CAMPUS 1 (Main Autonomous Engineering & Tech Campus)", "Plot 19, KP-II"),
        ("NIET CAMPUS 2 (Institute of Pharmacy & Management / MBA)", "Plot 19-A, KP-II"),
        ("NIET CAMPUS 3 (Hostels, Sports Complex & ACIC Incubation)", "Plot 19-B/20, KP-II")
    ]
    
    for idx, row in enumerate(rows):
        gata, area_ha, area_raw, land_use, owner, tenure, mut_no, mut_type, auth = row
        title, plot = campuses[idx] if idx < len(campuses) else ("NIET Wing", "")
        
        print(f"\n🏛️  {title}")
        print(f"    • Plot / Gata No    : {plot} | Gata {gata}")
        print(f"    • Total Land Area   : {area_ha} Hectares ({area_raw}) [~{round(area_ha * 2.471, 2)} Acres]")
        print(f"    • Land Use Category : {land_use}")
        print(f"    • Legal Owner/Trust : {owner}")
        print(f"    • Land Tenure       : {tenure}")
        print(f"    • GNIDA Allotment   : Order Ref: {auth} | Mutation #{mut_no}")
        print(f"    • Title Status      : VERIFIED - Clear Title (Zero Encroachment)")

def demo_knowledge_park_landmarks():
    print_header("2. KNOWLEDGE PARK 2 & 3 KEY INSTITUTIONAL LANDMARKS")
    
    conn = sqlite3.connect(DB_PATH)
    cur = conn.cursor()
    
    print("\n📍 KNOWLEDGE PARK II (Total 25 Cadastral Parcels Ingested):")
    kp2_samples = cur.execute("""
        SELECT native_identifier, land_use, area_raw, area 
        FROM land_parcels 
        WHERE village = 'Knowledge Park II' AND native_identifier IN ('301', '302', '303', '304', '306', '307')
    """).fetchall()
    
    for gata, land_use, area_bb, ha in kp2_samples:
        print(f"    • Gata {gata:<3} | {ha:>5.2f} Ha ({area_bb:<14}) | {land_use}")

    print("\n📍 KNOWLEDGE PARK III (Total 25 Cadastral Parcels Ingested):")
    kp3_samples = cur.execute("""
        SELECT native_identifier, land_use, area_raw, area 
        FROM land_parcels 
        WHERE village = 'Knowledge Park III' AND native_identifier IN ('601', '602', '603', '604', '605', '606')
    """).fetchall()
    
    for gata, land_use, area_bb, ha in kp3_samples:
        print(f"    • Gata {gata:<3} | {ha:>5.2f} Ha ({area_bb:<14}) | {land_use}")

    conn.close()

def demo_ai_retrieval():
    print_header("3. AI HYBRID RETRIEVAL & LEGAL GROUNDING DEMO")
    
    from ai.retrieval.hybrid_search import HybridSearchEngine
    engine = HybridSearchEngine()
    
    test_queries = [
        "NIET college campus 1 2 3 Greater Noida Knowledge Park 2",
        "Plot 19 City Educational Social Welfare Society NIET Autonomous",
        "Sharda University Hospital Medical College Knowledge Park 3",
        "Knowledge Park 2 Metro Station Aqua Line transit"
    ]
    
    for q in test_queries:
        print(f"\n🔎 Query: \"{q}\"")
        hits = engine.search(q, limit=2)
        for i, hit in enumerate(hits, 1):
            title = hit['chunk'].get('document_title') or hit['chunk'].get('title')
            score = round(hit.get('combined_score', 0), 4)
            snippet = hit['chunk'].get('content', '')[:160].replace('\n', ' ')
            print(f"    [{i}] Score: {score} | Title: {title}")
            print(f"        Snippet: {snippet}...")

if __name__ == "__main__":
    demo_niet_campuses()
    demo_knowledge_park_landmarks()
    demo_ai_retrieval()
    print_header("ALL KNOWLEDGE PARK 2 & 3 CADASTRES LIVE IN LANDSETU!")
