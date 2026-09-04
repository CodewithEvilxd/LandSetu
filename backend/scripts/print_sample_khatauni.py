import urllib.request
import urllib.parse
import json
import sys

sys.stdout.reconfigure(encoding='utf-8')

def print_khatauni(vil):
    url = f"http://localhost:5000/api/v1/khasra/villages/Uttar%20Pradesh/{urllib.parse.quote(vil)}/khatauni"
    res = urllib.request.urlopen(url)
    data = json.loads(res.read())
    print("=" * 80)
    print(f"   उ० प्र० राजस्व परिषद — कम्प्यूटरीकृत खतौनी (अधिकार अभिलेख नकल उद्धरण)")
    print("=" * 80)
    print(f"ग्राम: {data['village']} | तहसील: {data['tehsil']} | जनपद: {data['district']} | फसली वर्ष: {data['fasli_year']}")
    print(f"कुल खाते: {data['total_khatas']} | कुल गाटा संख्या: {data['total_parcels']}\n")
    print(f"{'खाता सं०':<10} | {'खातेदार का नाम व वल्दियत':<32} | {'भौमिक श्रेणी':<30} | {'गाटा':<8} | {'क्षेत्रफल':<12}")
    print("-" * 100)
    for k in data['khatas']:
        owners_str = ", ".join([f"{o['rights_holder_name']} (वा० {o['parentage']})" for o in k['owners']])
        if len(owners_str) > 30: owners_str = owners_str[:28] + ".."
        gatas_str = ", ".join([p['native_identifier'] for p in k['parcels']])
        tenure_str = k['tenure_category']
        if len(tenure_str) > 28: tenure_str = tenure_str[:26] + ".."
        area_str = f"{k['total_area_ha']} Ha"
        print(f"{k['khata_number']:<10} | {owners_str:<32} | {tenure_str:<30} | {gatas_str:<8} | {area_str:<12}")
    print("\n")

print_khatauni('Sorkha Jahidabad')
print_khatauni('Kasna')
