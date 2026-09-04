import assert from "node:assert";
import * as fs from "node:fs";
import * as path from "node:path";
import { db } from "../src/db/database.js";

console.log("=================================================");
console.log(" TEST SUITE: FULL STATE INGESTION VERIFICATION");
console.log("=================================================");

async function runIngestionTests() {
  // 1. Verify land parcels for Delhi, Haryana, and Bihar
  const states = ["Delhi", "Haryana", "Bihar"];
  for (const st of states) {
    const row = db.prepare("SELECT COUNT(*) as c FROM land_parcels WHERE state = ? COLLATE NOCASE").get(st) as any;
    assert.ok(row && row.c > 0, `State '${st}' must have ingested land parcels in database (got ${row?.c || 0})`);
    console.log(` -> [PASS] State '${st}' has ${row.c} verified parcels.`);
  }

  // 2. Verify Cadastral Maps for all 3 states
  for (const st of states) {
    const mapRow = db.prepare("SELECT COUNT(*) as c FROM cadastral_maps WHERE state = ? COLLATE NOCASE").get(st) as any;
    assert.ok(mapRow && mapRow.c > 0, `State '${st}' must have ingested cadastral map layers`);
    console.log(` -> [PASS] State '${st}' has cadastral map layer.`);
  }

  // 3. Verify Field-Level Provenance Evidence
  const evTotal = db.prepare("SELECT COUNT(*) as c FROM parcel_evidence").get() as any;
  assert.ok(evTotal && evTotal.c >= 30, `Must have comprehensive field-level evidence records (got ${evTotal?.c})`);
  console.log(` -> [PASS] Total verified field-level provenance records: ${evTotal.c}`);

  // 4. Verify Ingestion Job Records
  const jobs = db.prepare("SELECT COUNT(*) as c FROM ingestion_jobs WHERE status = 'completed'").get() as any;
  assert.ok(jobs && jobs.c > 0, "Must have recorded completed ingestion jobs in ledger");
  console.log(` -> [PASS] Completed ingestion jobs recorded in ledger: ${jobs.c}`);

  // 5. Verify DEMO_PARCEL_MANIFEST.json
  const manifestPath = path.resolve(process.cwd(), "data/processed/DEMO_PARCEL_MANIFEST.json");
  const altPath = path.resolve(process.cwd(), "backend/data/processed/DEMO_PARCEL_MANIFEST.json");
  const targetPath = fs.existsSync(manifestPath) ? manifestPath : altPath;

  assert.ok(fs.existsSync(targetPath), "DEMO_PARCEL_MANIFEST.json must exist");
  const manifest = JSON.parse(fs.readFileSync(targetPath, "utf-8"));
  assert.ok(manifest.delhi_demo_parcel, "Manifest must contain delhi_demo_parcel");
  assert.ok(manifest.haryana_demo_parcel, "Manifest must contain haryana_demo_parcel");
  assert.ok(manifest.bihar_demo_parcel, "Manifest must contain bihar_demo_parcel");
  console.log(" -> [PASS] DEMO_PARCEL_MANIFEST.json verified for Delhi, Haryana, and Bihar.");

  console.log("\n[SUCCESS] All Full State Ingestion tests passed!\n");
}

runIngestionTests().catch((err) => {
  console.error("[FAIL] Ingestion test failed:", err);
  process.exit(1);
});
