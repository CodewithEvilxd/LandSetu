import os
import re
import sys
from rapidocr_onnxruntime import RapidOCR

def run():
    img_path = r"d:\Sih Proto\backend\uploads\records\1788511850374-1.webp"
    ocr = RapidOCR()
    result, elapse = ocr(img_path)
    lines = [item[1] for item in result] if result else []
    full_text = "\n".join(lines)
    
    print("Detected", len(lines), "lines.")
    
    # 1. Khata number
    khata = None
    # match (1) : 00063 or खाता संख्या : 00063
    km = re.search(r"(?:\(1\)|खाता\s*संख्या)\s*[:：)]?\s*([0-9]{3,})", full_text)
    if km:
        khata = km.group(1)
    
    # 2. Area
    area = None
    am = re.search(r"([0-9]+\.[0-9]{2,4})", full_text)
    if am:
        area = float(am.group(1))
        
    # 3. Khasra
    khasra = None
    ksm = re.search(r"(\d{3,4}[फ]?|\d+\(\d+\))", full_text)
    if ksm:
        khasra = ksm.group(1)

    print("Parsed Khata:", khata)
    print("Parsed Area:", area)
    print("Parsed Khasra:", khasra)

if __name__ == "__main__":
    run()
