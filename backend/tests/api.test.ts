import { createApp } from "../src/app.js";
import { AuditService } from "../src/modules/audit/auditService.js";
import { db } from "../src/db/database.js";

async function runTests() {
  console.log("=================================================");
  console.log(" LANDSETU COMPREHENSIVE BACKEND INTEGRATION TESTS");
  console.log("=================================================");

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

  let adminToken = "";
  let researcherToken = "";
  let publicToken = "";

  try {
    // TEST 1: Health
    await assertTest("Health check endpoint returns healthy status", async () => {
      const res = await fetch(`${baseUrl}/health`);
      if (res.status !== 200) throw new Error(`Status ${res.status}`);
      const data = await res.json();
      if (data.status !== "healthy") throw new Error("Status not healthy");
    });

    // TEST 2: RBAC - Authentication
    await assertTest("Authentication succeeds for valid users & returns JWT", async () => {
      const resAdmin = await fetch(`${baseUrl}/api/v1/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: "admin", password: "Admin@LandSetu2026" })
      });
      if (resAdmin.status !== 200) throw new Error("Admin login failed");
      const adminData = await resAdmin.json();
      adminToken = adminData.token;
      if (!adminToken || adminData.user.role !== "admin") throw new Error("Invalid admin payload");

      const resRes = await fetch(`${baseUrl}/api/v1/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: "researcher", password: "Research@LandSetu2026" })
      });
      const resData = await resRes.json();
      researcherToken = resData.token;

      const resPub = await fetch(`${baseUrl}/api/v1/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: "citizen", password: "Public@LandSetu2026" })
      });
      const pubData = await resPub.json();
      publicToken = pubData.token;
    });

    // TEST 3: RBAC - Block Unauthorized Role
    await assertTest("RBAC blocks citizen from creating innovation challenges (HTTP 403)", async () => {
      const res = await fetch(`${baseUrl}/api/v1/innovation/challenges`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${publicToken}`
        },
        body: JSON.stringify({ title: "Hackathon", theme: "AI", description: "Desc" })
      });
      if (res.status !== 403) throw new Error(`Expected status 403 FORBIDDEN, received ${res.status}`);
    });

    // TEST 4: Sources Registry
    await assertTest("Sources registry lists verified sources with SHA-256 hashes", async () => {
      const res = await fetch(`${baseUrl}/api/v1/sources`);
      if (res.status !== 200) throw new Error(`Status ${res.status}`);
      const data = await res.json();
      if (!data.sources || data.sources.length < 5) throw new Error("Less than 5 sources returned");
      const sample = data.sources[0];
      if (!sample.checksum_sha256 || !sample.official_url) throw new Error("Missing checksum or official URL");
    });

    // TEST 5: Repository Documents & Datasets
    await assertTest("Repository returns statutory documents and national datasets", async () => {
      const resDocs = await fetch(`${baseUrl}/api/v1/repository/documents`);
      const docs = await resDocs.json();
      if (docs.count < 3) throw new Error("Insufficient documents");

      const resDs = await fetch(`${baseUrl}/api/v1/repository/datasets`);
      const ds = await resDs.json();
      if (ds.count < 2) throw new Error("Insufficient datasets");
    });

    // TEST 6: Grounded Search
    await assertTest("Search retrieves relevant statutory chunks for Section 23 award", async () => {
      const res = await fetch(`${baseUrl}/api/v1/search`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: "Section 23 statutory award lapse period" })
      });
      const data = await res.json();
      if (data.results.length === 0) throw new Error("Zero search results");
      const hasSec23 = data.results.some((r: any) => r.section.includes("23") || r.content.includes("twelve months"));
      if (!hasSec23) throw new Error("Top results did not contain Section 23 content");
    });

    // TEST 7: Grounded Ask Assistant
    await assertTest("Ask Assistant generates grounded response with citations", async () => {
      const res = await fetch(`${baseUrl}/api/v1/ask`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: "What is the statutory deadline for making an award under Section 23?" })
      });
      const data = await res.json();
      if (!data.answer_text) throw new Error("Missing answer text");
      if (!data.citations || !data.citations.is_valid) throw new Error("Citations invalid or missing");
    });

    // TEST 8: GIS Layers & Geocoded Imagery
    await assertTest("GIS routes deliver thematic layers and field imagery", async () => {
      const resLayers = await fetch(`${baseUrl}/api/v1/geo/layers`);
      const layersData = await resLayers.json();
      if (layersData.count === 0) throw new Error("No map layers");

      const resImg = await fetch(`${baseUrl}/api/v1/geo/imagery`);
      const imgData = await resImg.json();
      if (imgData.count === 0) throw new Error("No field imagery");
    });

    // TEST 9: Policy Lab Deterministic Scenario Run
    await assertTest("Policy Lab computes deterministic estimate with transparent delta", async () => {
      const res = await fetch(`${baseUrl}/api/v1/policy/run`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${researcherToken}`
        },
        body: JSON.stringify({
          scenarioId: "SCENARIO-TITLING-01",
          geography: "Uttar Pradesh",
          baselineValue: 1250000,
          intervention: { digital_title_coverage_pct: 80.0 },
          assumptions: { dispute_tribunal_fast_track: true }
        })
      });
      if (res.status !== 200) throw new Error(`Status ${res.status}`);
      const data = await res.json();
      if (data.delta_absolute >= 0) throw new Error("Expected negative delta (dispute reduction)");
      if (!data.sources || data.sources.length === 0) throw new Error("Missing source citations in policy run");
    });

    // TEST 10: Land Record Digitizer & Verification Queue
    await assertTest("Land Record Digitizer parses OCR and allows official verification", async () => {
      const uploadRes = await fetch(`${baseUrl}/api/v1/records/upload`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          document_name: "UP_Khatauni_Test_142.pdf",
          raw_text: "खाता खतौनी 142. ग्राम: रामपुर. तहसील: सदर. काश्तकार: रामेश्वर सिंह. खसरा 104/1. क्षेत्रफल: 0.850 हेक्ट. बैंक बंधक: पंजाब नेशनल बैंक 50,000 रु."
        })
      });
      if (uploadRes.status !== 201) throw new Error(`Upload status ${uploadRes.status}`);
      const uploadData = await uploadRes.json();
      const recId = uploadData.record_id;

      // Verify record by official
      const verifyRes = await fetch(`${baseUrl}/api/v1/records/${recId}/verify`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${adminToken}`
        },
        body: JSON.stringify({ updated_fields: { verification_notes: "Checked against Tehsil register." } })
      });
      if (verifyRes.status !== 200) throw new Error(`Verify status ${verifyRes.status}`);
      const verifyData = await verifyRes.json();
      if (verifyData.verification_status !== "verified") throw new Error("Status not updated to verified");
      db.prepare("DELETE FROM land_records WHERE record_id = ?").run(recId);
    });

    // TEST 11: Land Acquisition Intelligence & Alerts
    await assertTest("Acquisition intelligence flags statutory lapse and compensation bottlenecks", async () => {
      const res = await fetch(`${baseUrl}/api/v1/acquisitions/alerts`);
      const data = await res.json();
      if (data.alerts.length === 0) throw new Error("No alerts generated");
      const hasLapseOrBacklog = data.alerts.some((a: any) => a.type === "STATUTORY_LAPSE_WARNING" || a.type === "COMPENSATION_BACKLOG");
      if (!hasLapseOrBacklog) throw new Error("Missing critical acquisition alerts");
    });

    // TEST 12: Predictive Risk ML
    await assertTest("Predictive risk endpoint outputs delay score and explainable drivers", async () => {
      const res = await fetch(`${baseUrl}/api/v1/risk/predict`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          land_area_hectares: 850.5,
          affected_families: 1200,
          compensation_assessed_crores: 450.0,
          compensation_disbursed_crores: 120.0,
          litigation_cases_count: 35,
          statutory_months: 24,
          rr_settled_ratio: 0.40,
          is_linear_project: true,
          state: "Maharashtra"
        })
      });
      if (res.status !== 200) throw new Error(`Status ${res.status}`);
      const data = await res.json();
      if (data.risk_score < 50) throw new Error(`Expected high risk score for severe backlog, got ${data.risk_score}`);
      if (data.delay_drivers.length === 0) throw new Error("Missing delay drivers");
    });

    // TEST 13: Cryptographic Hash-Chain Verification
    await assertTest("Audit hash chain integrity check passes with zero broken pointers", async () => {
      const res = await fetch(`${baseUrl}/api/v1/audit/verify`);
      const data = await res.json();
      if (!data.is_valid) throw new Error(`Audit chain broken at event ${data.broken_event_id}: ${data.broken_reason}`);
      if (data.total_events < 2) throw new Error("Audit chain has less than 2 events");
    });

  } finally {
    server.close();
  }

  console.log("\n=================================================");
  console.log(` RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log("=================================================");

  if (failed > 0) {
    process.exit(1);
  }
}

runTests();
