import os
import ctypes

p = r"C:\Users\Nishant Gaurav\Documents\LandSetu"
parts = ["C:\\", r"C:\Users", r"C:\Users\Nishant Gaurav", r"C:\Users\Nishant Gaurav\Documents", r"C:\Users\Nishant Gaurav\Documents\LandSetu"]

for pt in parts:
    print(pt)
    print("  exists:", os.path.exists(pt))
    print("  islink:", os.path.islink(pt))
    print("  realpath:", os.path.realpath(pt))
    attrs = ctypes.windll.kernel32.GetFileAttributesW(pt)
    print("  attributes:", hex(attrs) if attrs != -1 else "ERROR")
