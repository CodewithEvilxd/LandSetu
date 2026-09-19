import pandas as pd
import os

print("Testing pandas to_csv on Python 3.14...")
df = pd.DataFrame({"col1": [1, 2, 3], "col2": ["a", "b", "c"]})

try:
    df.to_csv("scratch_test1.csv", index=False)
    print("df.to_csv(filename) succeeded!")
except Exception as e:
    print("df.to_csv(filename) failed:", type(e), e)

try:
    csv_str = df.to_csv(index=False)
    with open("scratch_test2.csv", "w", encoding="utf-8") as f:
        f.write(csv_str)
    print("f.write(df.to_csv()) succeeded!")
except Exception as e:
    print("f.write(df.to_csv()) failed:", type(e), e)

for p in ["scratch_test1.csv", "scratch_test2.csv"]:
    if os.path.exists(p):
        os.remove(p)
