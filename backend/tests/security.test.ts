import assert from "node:assert";
import * as fs from "node:fs";
import * as path from "node:path";
import { storageManager } from "../src/storage/index.js";

console.log("=================================================");
console.log(" TEST SUITE: SECURITY & CREDENTIAL SANITIZATION");
console.log("=================================================");

async function runSecurityTests() {
  // 1. Verify that .env.example contains sanitized placeholders
  const envExamplePath = path.resolve(process.cwd(), ".env.example");
  assert.ok(fs.existsSync(envExamplePath), ".env.example must exist");
  const envContent = fs.readFileSync(envExamplePath, "utf-8");

  assert.ok(envContent.includes("LANDSETU_ARCHIVE_BOT_TOKEN=<SECRET>"), ".env.example must have <SECRET> for bot token");
  assert.ok(envContent.includes("LANDSETU_ARCHIVE_CHAT_ID=<SECRET>"), ".env.example must have <SECRET> for chat ID");
  console.log(" -> [PASS] .env.example verified with sanitized placeholders.");

  // 2. Storage health check must NEVER expose secrets
  const health = await storageManager.getHealth();
  const serializedHealth = JSON.stringify(health);

  assert.ok(!serializedHealth.includes("5375625668"), "Health check output must not leak raw bot token ID");
  assert.ok(!serializedHealth.includes("AAG1qk4evW7xkkNSN8KrsFmEZqIwj2A8XNs"), "Health check output must not leak bot token secret");
  assert.ok(!serializedHealth.includes("4255903074"), "Health check output must not leak archive chat ID");
  console.log(" -> [PASS] Storage health report verified free of credentials.");

  // 3. Verify .gitignore excludes .env files
  const gitignorePath = path.resolve(process.cwd(), "../.gitignore");
  if (fs.existsSync(gitignorePath)) {
    const gitignore = fs.readFileSync(gitignorePath, "utf-8");
    assert.ok(gitignore.includes(".env"), ".gitignore must ignore .env files");
    assert.ok(gitignore.includes("!.env.example"), ".gitignore must allow .env.example");
    console.log(" -> [PASS] .gitignore correctly configured for environment secrets.");
  }

  console.log("\n[SUCCESS] All Security & Credential Sanitization tests passed!\n");
}

runSecurityTests().catch((err) => {
  console.error("[FAIL] Security test failed:", err);
  process.exit(1);
});
