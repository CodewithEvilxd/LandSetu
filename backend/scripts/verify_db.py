import sqlite3
import os

db_path = os.path.abspath("backend/data/landsetu.db")
print(f"Database Path: {db_path}")
print(f"Database Size: {os.path.getsize(db_path):,} bytes")

conn = sqlite3.connect(db_path)
cur = conn.cursor()

cur.execute("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' ORDER BY name")
tables = [row[0] for row in cur.fetchall()]

print("\n--- ALL TABLE ROW COUNTS ---")
for t in tables:
    cur.execute(f'SELECT COUNT(*) FROM "{t}"')
    cnt = cur.fetchone()[0]
    print(f"  {t:<26}: {cnt:>5} rows")

conn.close()
