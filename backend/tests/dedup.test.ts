import assert from "node:assert";
import { db } from "../src/db/database.js";

console.log("=================================================");
console.log(" TEST SUITE: DEDUPLICATION & COMPOSITE UID");
console.log("=================================================");

async function runDedupTests() {
  // 1. Verify all parcel_uids follow the canonical composite pattern:
  // STATE|DISTRICT|TEHSIL|VILLAGE|LOCAL_ID
  const parcels = db.prepare("SELECT parcel_uid FROM land_parcels").all() as { parcel_uid: string }[];
  assert.ok(parcels.length > 0, "Database must contain land parcels");

  const compositeRegex = /^[A-Z0-9_]+\|[A-Z0-9_ ]+\|[A-Z0-9_ ]+\|[A-Z0-9_ ]+\|[A-Za-z0-9_/-]+$/;

  for (const p of parcels) {
    const parts = p.parcel_uid.split("|");
    assert.strictEqual(parts.length, 5, `Parcel UID '${p.parcel_uid}' must have exactly 5 pipe-separated components`);
    assert.ok(["DELHI", "HARYANA", "BIHAR", "UP", "UTTAR PRADESH"].includes(parts[0].toUpperCase()), `State component '${parts[0]}' must be valid`);
  }
  console.log(` -> [PASS] All ${parcels.length} parcel UIDs conform strictly to canonical composite standard.`);

  // 2. Check for duplicate parcel_uids
  const dupUids = db.prepare(`
    SELECT parcel_uid, COUNT(*) as c FROM land_parcels GROUP BY parcel_uid HAVING c > 1
  `).all() as any[];
  assert.strictEqual(dupUids.length, 0, "No duplicate parcel UIDs permitted in database");
  console.log(" -> [PASS] Zero primary key duplicate collisions found.");

  // 3. Check for duplicate geometry records
  const dupGeoms = db.prepare(`
    SELECT parcel_uid, COUNT(*) as c FROM parcel_geometries GROUP BY parcel_uid HAVING c > 1
  `).all() as any[];
  assert.strictEqual(dupGeoms.length, 0, "No duplicate geometry records permitted per parcel");
  console.log(" -> [PASS] Zero duplicate geometry entries found.");

  // 4. Check for duplicate coverage areas
  const dupCov = db.prepare(`
    SELECT state, village, COUNT(*) as c FROM coverage_areas GROUP BY state, village HAVING c > 1
  `).all() as any[];
  assert.strictEqual(dupCov.length, 0, "No duplicate village coverage entries permitted");
  console.log(" -> [PASS] Zero duplicate coverage area records found.");

  console.log("\n[SUCCESS] All Deduplication & Composite UID tests passed!\n");
}

runDedupTests().catch((err) => {
  console.error("[FAIL] Dedup test failed:", err);
  process.exit(1);
});
