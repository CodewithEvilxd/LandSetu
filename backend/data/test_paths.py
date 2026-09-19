import os
import tempfile

p_rel = "test_file_write.txt"
p_abs = os.path.abspath(p_rel)
p_sub = os.path.join("backend", "data", "test_sub.txt")
p_tmp = os.path.join(tempfile.gettempdir(), "test_tmp.txt")

for p in [p_rel, p_abs, p_sub, p_tmp]:
    try:
        with open(p, "w") as f:
            f.write("test")
        print("Success for:", p)
        if os.path.exists(p):
            os.remove(p)
    except Exception as e:
        print("Failed for:", p, "->", type(e), e)
