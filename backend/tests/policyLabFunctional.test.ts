import { createApp } from "../src/app.js";
import { db } from "../src/db/database.js";

async function runPolicyLabFunctionalTests() {
  console.log("===============================================================");
  console.log(" LANDSETU POLICY LAB COMPREHENSIVE FUNCTIONAL & AUDIT TEST SUITE");
  console.log("===============================================================");

  const app = createApp();
  const server = app.listen(0);
  const port = (server.address() as any).port;
  const baseUrl = `http://127.0.0.1:${port}`;

  let passed = 0;
  let failed = 0;

  async function assertTest(name: string, fn: () => Promise<void>) {
    try {
      await fn();
      console.log(`[PASS] ${name}`);
      passed++;
    } catch (err: any) {
      console.error(`[FAIL] ${name}:`, err.message);
      failed++;
    }
  }

  try {
    // -------------------------------------------------------------
    // TEST 1: Baseline Scenario Execution (SCENARIO-TITLING-01)
    // -------------------------------------------------------------
    await assertTest("1. Baseline scenario computes deterministic estimate and verified deltas", async () => {
      const res = await fetch(`${baseUrl}/api/v1/policy/run`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          scenarioId: "SCENARIO-TITLING-01",
          geography: "National",
          baselineValue: 1250000,
          intervention: { digital_title_coverage_pct: 75 },
          assumptions: { dispute_tribunal_fast_track: true }
        })
      });

      if (res.status !== 200) throw new Error(`Expected status 200, got ${res.status}`);
      const data = await res.json();

      // Expected calculation:
      // coverage = 0.75 * 0.38 = 0.285
      // tribunal = 0.12
      // netFactor = 0.405
      // estimate = 1,250,000 * (1 - 0.405) = 743,750
      if (data.baseline_value !== 1250000) throw new Error(`Invalid baseline: ${data.baseline_value}`);
      if (data.scenario_estimate !== 743750) throw new Error(`Expected estimate 743750, got ${data.scenario_estimate}`);
      if (data.delta_absolute !== -506250) throw new Error(`Expected delta -506250, got ${data.delta_absolute}`);
      if (data.delta_percent !== -40.5) throw new Error(`Expected delta % -40.5, got ${data.delta_percent}`);
      if (!data.run_id.startsWith("RUN-")) throw new Error("Invalid run_id format");
    });

    // -------------------------------------------------------------
    // TEST 2: Single-Variable Intervention Change (Intervention #1 & #2)
    // -------------------------------------------------------------
    await assertTest("2. Changing only coveragePct changes output predictably while baseline remains unchanged", async () => {
      // Run with coverage 50% (down from 75%)
      const res = await fetch(`${baseUrl}/api/v1/policy/run`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          scenarioId: "SCENARIO-TITLING-01",
          baselineValue: 1250000,
          intervention: { digital_title_coverage_pct: 50 },
          assumptions: { dispute_tribunal_fast_track: true }
        })
      });
      const data = await res.json();
      // coverage = 0.50 * 0.38 = 0.19, tribunal = 0.12, factor = 0.31 -> estimate = 1,250,000 * 0.69 = 862,500
      if (data.scenario_estimate !== 862500) throw new Error(`Expected 862500, got ${data.scenario_estimate}`);
      if (data.delta_absolute !== -387500) throw new Error(`Expected -387500, got ${data.delta_absolute}`);
      if (data.delta_percent !== -31) throw new Error(`Expected -31%, got ${data.delta_percent}%`);
      if (data.baseline_value !== 1250000) throw new Error("Baseline altered unexpectedly");
    });

    await assertTest("3. Changing only dispute tribunal toggle changes output in correct direction", async () => {
      // Toggle tribunal to false at 50% coverage
      const res = await fetch(`${baseUrl}/api/v1/policy/run`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          scenarioId: "SCENARIO-TITLING-01",
          baselineValue: 1250000,
          intervention: { digital_title_coverage_pct: 50 },
          assumptions: { dispute_tribunal_fast_track: false }
        })
      });
      const data = await res.json();
      // coverage = 0.19, tribunal = 0.0, factor = 0.19 -> estimate = 1,250,000 * 0.81 = 1,012,500
      if (data.scenario_estimate !== 1012500) throw new Error(`Expected 1012500, got ${data.scenario_estimate}`);
      if (data.delta_absolute !== -237500) throw new Error(`Expected -237500, got ${data.delta_absolute}`);
      if (data.delta_percent !== -19) throw new Error(`Expected -19%, got ${data.delta_percent}%`);
    });

    // -------------------------------------------------------------
    // TEST 3: SVAMITVA Drone Resurvey Scenario (Intervention #3)
    // -------------------------------------------------------------
    await assertTest("4. SVAMITVA drone survey acceleration executes dedicated photogrammetric model", async () => {
      const res = await fetch(`${baseUrl}/api/v1/policy/run`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          scenarioId: "SCENARIO-SURVEY-03",
          geography: "National Rural",
          baselineValue: 2500000,
          intervention: { drone_survey_villages_pct: 65 },
          assumptions: { cors_network_integration: true }
        })
      });
      if (res.status !== 200) throw new Error(`Status ${res.status}`);
      const data = await res.json();
      // factor = (0.65 * 0.72) + 0.15 = 0.468 + 0.15 = 0.618
      // estimate = 2,500,000 * (1 - 0.618) = 2,500,000 * 0.382 = 955,000
      if (data.scenario_estimate !== 955000) throw new Error(`Expected 955000, got ${data.scenario_estimate}`);
      if (data.delta_percent !== -61.8) throw new Error(`Expected -61.8%, got ${data.delta_percent}%`);
      if (!data.sources.includes("SRC-SVAMITVA-MOPR-012")) throw new Error("Missing SVAMITVA source citation");
    });

    // -------------------------------------------------------------
    // TEST 4: Monotonicity & Sensitivity across 3 Levels (Low, Med, High)
    // -------------------------------------------------------------
    await assertTest("5. Monotonicity test: Pending disputes strictly decrease as reform intensity rises", async () => {
      const levels = [25, 50, 75, 100];
      const results: number[] = [];

      for (const lvl of levels) {
        const res = await fetch(`${baseUrl}/api/v1/policy/run`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            scenarioId: "SCENARIO-TITLING-01",
            baselineValue: 1000000,
            intervention: { digital_title_coverage_pct: lvl },
            assumptions: { dispute_tribunal_fast_track: false }
          })
        });
        const d = await res.json();
        results.push(d.scenario_estimate);
      }

      // Expected values:
      // 25%: 1,000,000 * (1 - 0.25*0.38) = 1,000,000 * 0.905 = 905,000
      // 50%: 1,000,000 * (1 - 0.50*0.38) = 1,000,000 * 0.810 = 810,000
      // 75%: 1,000,000 * (1 - 0.75*0.38) = 1,000,000 * 0.715 = 715,000
      // 100%: 1,000,000 * (1 - 1.00*0.38) = 1,000,000 * 0.620 = 620,000
      for (let i = 1; i < results.length; i++) {
        if (results[i] >= results[i - 1]) {
          throw new Error(`Monotonicity failed at level index ${i}: ${results[i - 1]} -> ${results[i]}`);
        }
      }
      if (results[0] !== 905000 || results[3] !== 620000) {
        throw new Error(`Unexpected boundary values: ${JSON.stringify(results)}`);
      }
    });

    // -------------------------------------------------------------
    // TEST 5: Deterministic Repeatability
    // -------------------------------------------------------------
    await assertTest("6. Deterministic reproducibility: Identical inputs yield byte-for-byte identical output values", async () => {
      const payload = {
        scenarioId: "SCENARIO-TITLING-01",
        baselineValue: 1250000,
        intervention: { digital_title_coverage_pct: 80 },
        assumptions: { dispute_tribunal_fast_track: true }
      };

      const res1 = await fetch(`${baseUrl}/api/v1/policy/run`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const d1 = await res1.json();

      const res2 = await fetch(`${baseUrl}/api/v1/policy/run`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const d2 = await res2.json();

      if (d1.scenario_estimate !== d2.scenario_estimate) throw new Error("Repeatability failed on estimate");
      if (d1.delta_absolute !== d2.delta_absolute) throw new Error("Repeatability failed on delta_absolute");
      if (d1.delta_percent !== d2.delta_percent) throw new Error("Repeatability failed on delta_percent");
      if (d1.formula_audit.expression !== d2.formula_audit.expression) throw new Error("Repeatability failed on expression");
    });

    // -------------------------------------------------------------
    // TEST 6: Edge Cases & Numerical Bounds Validation
    // -------------------------------------------------------------
    await assertTest("7. Input validation rejects invalid types, NaN, and negative baselines with HTTP 400", async () => {
      // Negative baseline
      const r1 = await fetch(`${baseUrl}/api/v1/policy/run`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scenarioId: "SCENARIO-TITLING-01", baselineValue: -500 })
      });
      if (r1.status !== 400) throw new Error(`Expected 400 for negative baseline, got ${r1.status}`);

      // String baseline (NaN)
      const r2 = await fetch(`${baseUrl}/api/v1/policy/run`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scenarioId: "SCENARIO-TITLING-01", baselineValue: "not-a-number" })
      });
      if (r2.status !== 400) throw new Error(`Expected 400 for NaN baseline, got ${r2.status}`);

      // Missing scenarioId
      const r3 = await fetch(`${baseUrl}/api/v1/policy/run`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ baselineValue: 5000 })
      });
      if (r3.status !== 400) throw new Error(`Expected 400 for missing scenarioId, got ${r3.status}`);

      // Out of bounds coverage (< 0)
      const r4 = await fetch(`${baseUrl}/api/v1/policy/run`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          scenarioId: "SCENARIO-TITLING-01",
          baselineValue: 1000,
          intervention: { digital_title_coverage_pct: -10 }
        })
      });
      if (r4.status !== 400) throw new Error(`Expected 400 for negative coverage, got ${r4.status}`);

      // Out of bounds coverage (> 100)
      const r5 = await fetch(`${baseUrl}/api/v1/policy/run`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          scenarioId: "SCENARIO-TITLING-01",
          baselineValue: 1000,
          intervention: { digital_title_coverage_pct: 125 }
        })
      });
      if (r5.status !== 400) throw new Error(`Expected 400 for coverage > 100, got ${r5.status}`);
    });

    await assertTest("8. Boundary values: Zero baseline produces clean zero without NaN or crash", async () => {
      const res = await fetch(`${baseUrl}/api/v1/policy/run`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          scenarioId: "SCENARIO-TITLING-01",
          baselineValue: 0,
          intervention: { digital_title_coverage_pct: 80 }
        })
      });
      if (res.status !== 200) throw new Error(`Status ${res.status}`);
      const data = await res.json();
      if (data.scenario_estimate !== 0) throw new Error(`Expected 0, got ${data.scenario_estimate}`);
      if (data.delta_absolute !== 0) throw new Error(`Expected 0 delta, got ${data.delta_absolute}`);
      if (data.delta_percent !== 0) throw new Error(`Expected 0 percent, got ${data.delta_percent}`);
    });

    // -------------------------------------------------------------
    // TEST 7: Auto-Mutation Scenario & Statutory Floor (SCENARIO-AUTO-MUTATION-02)
    // -------------------------------------------------------------
    await assertTest("9. Auto-mutation scenario enforces statutory notice floor and API speedup", async () => {
      // Baseline 45 days, 15 days notice, electronic deed pass-through
      const res1 = await fetch(`${baseUrl}/api/v1/policy/run`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          scenarioId: "SCENARIO-AUTO-MUTATION-02",
          baselineValue: 45,
          intervention: { statutory_notice_period_days: 15 },
          assumptions: { electronic_deed_pass_through: true }
        })
      });
      const d1 = await res1.json();
      // 45 * (1 - 0.65) = 15.75 days > 15 notice floor -> estimate = 15.75
      if (d1.scenario_estimate !== 15.75) throw new Error(`Expected 15.75, got ${d1.scenario_estimate}`);
      if (d1.delta_percent !== -65) throw new Error(`Expected -65%, got ${d1.delta_percent}%`);

      // Test statutory floor clamping: baseline 20 days, notice 15 days
      // 20 * (1 - 0.65) = 7.0 days, but statutory notice is 15 -> estimate must be clamped to 15!
      const res2 = await fetch(`${baseUrl}/api/v1/policy/run`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          scenarioId: "SCENARIO-AUTO-MUTATION-02",
          baselineValue: 20,
          intervention: { statutory_notice_period_days: 15 },
          assumptions: { electronic_deed_pass_through: true }
        })
      });
      const d2 = await res2.json();
      if (d2.scenario_estimate !== 15) throw new Error(`Expected floor of 15 days, got ${d2.scenario_estimate}`);
    });

    // -------------------------------------------------------------
    // TEST 8: Database Persistence & History Verification
    // -------------------------------------------------------------
    await assertTest("10. Simulation run is recorded in database and retrievable via GET /runs", async () => {
      const runRes = await fetch(`${baseUrl}/api/v1/policy/run`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          scenarioId: "SCENARIO-TITLING-01",
          geography: "Audit Test State",
          baselineValue: 500000,
          intervention: { digital_title_coverage_pct: 90 },
          assumptions: { dispute_tribunal_fast_track: true }
        })
      });
      const runData = await runRes.json();
      const testRunId = runData.run_id;

      // Check DB row directly
      const dbRow = db.prepare("SELECT * FROM policy_runs WHERE run_id = ?").get(testRunId) as any;
      if (!dbRow) throw new Error(`Run ${testRunId} not found in database`);
      if (dbRow.scenario_id !== "SCENARIO-TITLING-01") throw new Error("DB scenario_id mismatch");
      if (dbRow.baseline_value !== 500000) throw new Error("DB baseline_value mismatch");

      // Verify cryptographic audit log entry
      const auditRow = db.prepare("SELECT * FROM audit_events WHERE target_id = ? AND action = 'RUN_POLICY_SCENARIO'").get(testRunId) as any;
      if (!auditRow) throw new Error(`Cryptographic audit event missing for run ${testRunId}`);
      if (!auditRow.current_hash || !auditRow.previous_hash || !auditRow.payload_digest) {
        throw new Error("Audit event missing current_hash, previous_hash, or payload_digest");
      }

      // Check GET /runs API endpoint
      const listRes = await fetch(`${baseUrl}/api/v1/policy/runs`);
      const listData = await listRes.json();
      const foundInList = listData.runs.some((r: any) => r.run_id === testRunId);
      if (!foundInList) throw new Error(`Run ${testRunId} not in GET /runs response`);
    });

    // -------------------------------------------------------------
    // TEST 9: Official Evidence Linkage & Source Registry Integrity
    // -------------------------------------------------------------
    await assertTest("11. Sourced evidence citations link to verified records in source registry", async () => {
      const res = await fetch(`${baseUrl}/api/v1/policy/run`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          scenarioId: "SCENARIO-TITLING-01",
          baselineValue: 1250000
        })
      });
      const data = await res.json();
      if (!data.sources || data.sources.length === 0) throw new Error("No sources linked");

      for (const srcId of data.sources) {
        const srcRow = db.prepare("SELECT * FROM sources WHERE source_id = ?").get(srcId) as any;
        if (!srcRow) throw new Error(`Source ${srcId} referenced in policy run does not exist in sources registry`);
        if (!srcRow.official_url || !srcRow.checksum_sha256) throw new Error(`Source ${srcId} missing provenance metadata`);
      }
    });

    // -------------------------------------------------------------
    // TEST 10: Non-Causal Disclaimers & Transparent Parameter Metadata
    // -------------------------------------------------------------
    await assertTest("12. Formula breakdown exposes parameter classification (Empirical vs Literature vs Heuristic)", async () => {
      const res = await fetch(`${baseUrl}/api/v1/policy/run`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          scenarioId: "SCENARIO-TITLING-01",
          baselineValue: 1250000,
          intervention: { digital_title_coverage_pct: 75 },
          assumptions: { dispute_tribunal_fast_track: true }
        })
      });
      const data = await res.json();

      if (!data.formula_audit) throw new Error("Missing formula_audit metadata");
      if (!data.formula_audit.coefficients || data.formula_audit.coefficients.length < 2) {
        throw new Error("Missing coefficient breakdown");
      }

      // Check category tags
      const categories = data.formula_audit.coefficients.map((c: any) => c.category);
      if (!categories.includes("LITERATURE_DERIVED")) throw new Error("Missing LITERATURE_DERIVED classification");
      if (!categories.includes("HEURISTIC_ASSUMPTION")) throw new Error("Missing HEURISTIC_ASSUMPTION classification");

      // Verify non-causal limitations
      const hasCaveat = data.limitations.some((lim: string) => 
        lim.toLowerCase().includes("decision-support") && lim.toLowerCase().includes("not constitute a guaranteed causal")
      );
      if (!hasCaveat) throw new Error("Missing non-causal limitation disclaimer");
    });

  } finally {
    server.close();
  }

  console.log("\n===============================================================");
  console.log(` POLICY LAB TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log("===============================================================");

  if (failed > 0) {
    process.exit(1);
  }
}

runPolicyLabFunctionalTests();
