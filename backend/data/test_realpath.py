import os
import subprocess

print("Realpath:", os.path.realpath("."))
print("Exists:", os.path.exists("."))
print("IsDir:", os.path.isdir("."))
print("Stat:", os.stat("."))

try:
    import ctypes
    buf = ctypes.create_unicode_buffer(1024)
    ctypes.windll.kernel32.GetShortPathNameW(".", buf, 1024)
    print("Short path:", buf.value)
    
    # Try writing using short path
    sp = os.path.join(buf.value, "short_test.txt")
    with open(sp, "w") as f:
        f.write("ok")
    print("Writing via short path succeeded!")
    os.remove(sp)
except Exception as e:
    print("Short path test failed:", type(e), e)
