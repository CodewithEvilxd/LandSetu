import assert from "node:assert";
import { ArchiveStorageProvider } from "../src/storage/ArchiveStorageProvider.js";
import { StorageQueue } from "../src/storage/StorageQueue.js";
import { StorageRetry } from "../src/storage/StorageRetry.js";

console.log("=================================================");
console.log(" TEST SUITE: ARCHIVE STORAGE & RETRY ENGINE");
console.log("=================================================");

async function runArchiveTests() {
  const archive = new ArchiveStorageProvider();

  // 1. Archive default status (must be safe/disabled if not enabled)
  console.log(` -> Archive Provider Enabled: ${archive.isEnabled()}`);

  // 2. Health check must not leak credentials
  const health = await archive.healthCheck();
  assert.ok(["healthy", "degraded", "unhealthy", "disabled"].includes(health.status));
  assert.strictEqual(health.details?.bot_token, undefined, "Health check must NEVER expose bot token");
  assert.strictEqual(health.details?.chat_id, undefined, "Health check must NEVER expose chat ID");
  console.log(" -> [PASS] Health check executed cleanly without credential leakage.");

  // 3. Queue functionality
  const queue = new StorageQueue(archive);
  const fakeData = Buffer.from("Archival test blob", "utf-8");
  const task = queue.enqueue("abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890", fakeData, "test.bin");
  assert.ok(task.id.startsWith("task_"), "Enqueued task must have generated ID");
  assert.strictEqual(task.filename, "test.bin");
  console.log(" -> [PASS] Asynchronous storage queue enqueue verified.");

  // 4. Retry engine with exponential backoff
  let callCount = 0;
  const result = await StorageRetry.executeWithRetry(
    async () => {
      callCount++;
      if (callCount < 3) {
        throw new Error("Temporary network timeout");
      }
      return "SUCCESS_DATA";
    },
    { maxRetries: 3, initialDelayMs: 50, backoffFactor: 1.5 }
  );

  assert.strictEqual(result, "SUCCESS_DATA");
  assert.strictEqual(callCount, 3, "Operation must succeed on third retry attempt");
  console.log(" -> [PASS] Exponential backoff retry engine verified.");

  console.log("\n[SUCCESS] All Archive Storage & Retry tests passed!\n");
}

runArchiveTests().catch((err) => {
  console.error("[FAIL] Archive test failed:", err);
  process.exit(1);
});
