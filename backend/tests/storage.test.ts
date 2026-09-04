import assert from "node:assert";
import * as fs from "node:fs";
import * as path from "node:path";
import * as crypto from "node:crypto";
import { LocalStorageProvider } from "../src/storage/LocalStorageProvider.js";
import { StorageManifest } from "../src/storage/StorageManifest.js";
import { StorageHealth } from "../src/storage/StorageHealth.js";
import { StorageQueue } from "../src/storage/StorageQueue.js";
import { ArchiveStorageProvider } from "../src/storage/ArchiveStorageProvider.js";

console.log("=================================================");
console.log(" TEST SUITE: STORAGE CAS & MANIFEST ENGINE");
console.log("=================================================");

async function runStorageTests() {
  const tempDir = path.resolve(process.cwd(), "data/test_objects");
  if (fs.existsSync(tempDir)) {
    fs.rmSync(tempDir, { recursive: true, force: true });
  }

  const cas = new LocalStorageProvider(tempDir);

  // 1. Store object in CAS
  const testData = Buffer.from("LandSetu Official Survey Record Content 2026", "utf-8");
  const expectedSha = crypto.createHash("sha256").update(testData).digest("hex");

  const meta = await cas.store("test_record.txt", testData, { mime_type: "text/plain" });
  assert.strictEqual(meta.sha256, expectedSha, "CAS stored SHA256 must match computed digest");
  assert.strictEqual(meta.size_bytes, testData.length, "CAS stored size must match data length");
  console.log(" -> [PASS] CAS store with SHA-256 addressing verified.");

  // 2. Verify CAS physical path structure (ab/cd/hash)
  const dir1 = expectedSha.substring(0, 2);
  const dir2 = expectedSha.substring(2, 4);
  const expectedPath = path.join(tempDir, dir1, dir2, expectedSha);
  assert.ok(fs.existsSync(expectedPath), "Object must be physically stored at ab/cd/{sha256}");
  console.log(" -> [PASS] CAS 2-tier sharded directory structure verified.");

  // 3. Retrieve object from CAS
  const retrieved = await cas.retrieve(expectedSha);
  assert.strictEqual(retrieved.toString("utf-8"), testData.toString("utf-8"), "Retrieved payload must match original");
  console.log(" -> [PASS] CAS retrieve verified.");

  // 4. Integrity check (tamper detection)
  let failedIntegrity = false;
  try {
    await cas.store("tampered.txt", testData, { sha256: "0000000000000000000000000000000000000000000000000000000000000000" });
  } catch (err) {
    failedIntegrity = true;
  }
  assert.ok(failedIntegrity, "CAS must reject payload if expected SHA256 does not match");
  console.log(" -> [PASS] Cryptographic tamper rejection verified.");

  // 5. StorageManifest generation & validation
  const testFolder = path.resolve(process.cwd(), "data/raw/bihar");
  if (fs.existsSync(testFolder)) {
    const manifest = StorageManifest.generateDirectoryManifest(testFolder, "Bihar", "cadastre");
    assert.ok(manifest.total_files > 0, "Manifest must discover raw files in Bihar folder");
    assert.ok(manifest.root_sha256.length === 64, "Root SHA256 must be 64-char hex string");

    const verification = StorageManifest.verifyDirectoryManifest(testFolder, manifest);
    assert.strictEqual(verification.valid, true, "Manifest verification must pass on untampered folder");
    assert.strictEqual(verification.errors.length, 0, "Manifest verification must produce zero errors");
    console.log(" -> [PASS] StorageManifest generation & verification passed.");
  }

  // 6. Health Check
  const health = await cas.healthCheck();
  assert.strictEqual(health.status, "healthy", "Local CAS health check must return healthy");
  console.log(" -> [PASS] StorageHealth check passed.");

  // Cleanup test folder
  if (fs.existsSync(tempDir)) {
    fs.rmSync(tempDir, { recursive: true, force: true });
  }

  console.log("\n[SUCCESS] All Storage CAS & Manifest tests passed!\n");
}

runStorageTests().catch((err) => {
  console.error("[FAIL] Storage test failed:", err);
  process.exit(1);
});
