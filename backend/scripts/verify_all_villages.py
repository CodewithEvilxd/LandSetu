import urllib.request
import urllib.parse
import json

base = 'http://localhost:5000/api/v1/khasra'

villages = [
    ('Delhi', 'Alipur'),
    ('Haryana', 'Wazirabad'),
    ('Bihar', 'Sabbalpur'),
    ('Uttar Pradesh', 'Sorkha Jahidabad'),
    ('Uttar Pradesh', 'Kasna'),
    ('Uttar Pradesh', 'Bisrakh Jalalpur'),
    ('Uttar Pradesh', 'Knowledge Park II'),
    ('Uttar Pradesh', 'Knowledge Park III')
]

print('=== TESTING ALL 8 VILLAGES CADASTRE API ===')
for state, vil in villages:
    url = f"{base}/villages/{urllib.parse.quote(state)}/{urllib.parse.quote(vil)}/cadastre"
    try:
        res = urllib.request.urlopen(url)
        cad = json.loads(res.read())
        feats = cad.get('geojson', {}).get('features', [])
        print(f"{state} | {vil} -> Features: {len(feats)} | Map ID: {cad.get('map_id')} | First: {feats[0]['properties']['khasra']} | Last: {feats[-1]['properties']['khasra']}")
    except Exception as e:
        print(f"{state} | {vil} -> Error: {e}")

print('\n=== TESTING NOIDA & GREATER NOIDA PARCELS ===')
up_uids = [
    'UP|GAUTAM_BUDDHA_NAGAR|SADAR_NOIDA|SORKHA_JAHIDABAD|101',
    'UP|GAUTAM_BUDDHA_NAGAR|DADRI|KASNA|401',
    'UP|GAUTAM_BUDDHA_NAGAR|DADRI|BISRAKH_JALALPUR|501',
    'UP|GAUTAM_BUDDHA_NAGAR|SADAR|KNOWLEDGE_PARK_II|319',
    'UP|GAUTAM_BUDDHA_NAGAR|SADAR|KNOWLEDGE_PARK_II|320',
    'UP|GAUTAM_BUDDHA_NAGAR|SADAR|KNOWLEDGE_PARK_II|321',
    'UP|GAUTAM_BUDDHA_NAGAR|SADAR|KNOWLEDGE_PARK_III|601'
]
for uid in up_uids:
    url = f"{base}/parcels/{urllib.parse.quote(uid)}"
    try:
        res = urllib.request.urlopen(url)
        p = json.loads(res.read())
        parcel = p['parcel']
        print(f"{parcel['village']} Gata {parcel['native_identifier']} -> Area: {parcel['area']} Ha ({parcel['area_raw']}) | Land Use: {parcel['land_use']} | Owners: {len(p.get('recorded_rights', []))}")
    except Exception as e:
        print(f"{uid} -> Error: {e}")
