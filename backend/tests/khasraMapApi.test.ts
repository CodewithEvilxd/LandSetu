import { createApp } from "../src/app.js";

async function runKhasraMapApiTests() {
  console.log("=================================================");
  console.log(" KHASRA MAP API INTEGRATION SUITE (DELHI + HARYANA)");
  console.log("=================================================");

  const app = createApp();
  const server = app.listen(0);
  const port = (server.address() as any).port;
  const baseUrl = `http://127.0.0.1:${port}`;

  let passed = 0;
  let failed = 0;

  async function assert(name: string, fn: () => Promise<void>) {
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
    // TEST 1: Coverage Summary
    await assert("GET /api/v1/khasra-map/coverage returns coverage metrics and areas", async () => {
      const res = await fetch(`${baseUrl}/api/v1/khasra-map/coverage`);
      if (res.status !== 200) throw new Error(`Status ${res.status}`);
      const data = await res.json();
      if (!data.coverage_areas || data.coverage_areas.length < 2) {
        throw new Error("Missing coverage areas for Delhi and Haryana");
      }
      if (data.total_parcels_indexed < 10) {
        throw new Error(`Insufficient parcels indexed: ${data.total_parcels_indexed}`);
      }
    });

    // TEST 2: Delhi Cadastral GeoJSON
    await assert("GET /api/v1/khasra-map/villages/delhi/alipur/cadastre returns GeoJSON FeatureCollection", async () => {
      const res = await fetch(`${baseUrl}/api/v1/khasra-map/villages/delhi/alipur/cadastre`);
      if (res.status !== 200) throw new Error(`Status ${res.status}`);
      const data = await res.json();
      if (!data.geojson || data.geojson.type !== "FeatureCollection") {
        throw new Error("Invalid GeoJSON response");
      }
      if (!data.checksum_sha256) {
        throw new Error("Missing checksum_sha256");
      }
      if (data.geojson.features.length === 0) {
        throw new Error("Zero features returned in Alipur cadastre");
      }
    });

    // TEST 3: Haryana Cadastral GeoJSON
    await assert("GET /api/v1/khasra-map/villages/haryana/wazirabad/cadastre returns GeoJSON FeatureCollection", async () => {
      const res = await fetch(`${baseUrl}/api/v1/khasra-map/villages/haryana/wazirabad/cadastre`);
      if (res.status !== 200) throw new Error(`Status ${res.status}`);
      const data = await res.json();
      if (!data.geojson || data.geojson.type !== "FeatureCollection") {
        throw new Error("Invalid GeoJSON response");
      }
      if (data.geojson.features.length === 0) {
        throw new Error("Zero features returned in Wazirabad cadastre");
      }
    });

    // TEST 4: POST /resolve
    await assert("POST /api/v1/khasra-map/resolve resolves Khasra 142 in Alipur", async () => {
      const res = await fetch(`${baseUrl}/api/v1/khasra-map/resolve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ khasra: "142", state: "Delhi", village: "Alipur" })
      });
      if (res.status !== 200) throw new Error(`Status ${res.status}`);
      const data = await res.json();
      if (data.status !== "resolved" || !data.resolved_parcel?.parcel_uid?.includes("142")) {
        throw new Error(`Unexpected resolve result: ${JSON.stringify(data)}`);
      }
    });

    // TEST 5: GET Parcel Details
    const parcelUid = encodeURIComponent("DELHI|NORTH_DELHI|ALIPUR|ALIPUR|142");
    await assert("GET /api/v1/khasra-map/parcels/:uid returns parcel, rights, and geometry", async () => {
      const res = await fetch(`${baseUrl}/api/v1/khasra-map/parcels/${parcelUid}`);
      if (res.status !== 200) throw new Error(`Status ${res.status}`);
      const data = await res.json();
      if (!data.parcel || !data.geometry || !data.recorded_rights) {
        throw new Error("Missing parcel, geometry, or rights in response");
      }
      if (data.recorded_rights.length === 0) {
        throw new Error("No rights holders returned for Khasra 142");
      }
    });

    // TEST 6: GET Evidence Bundle
    await assert("GET /api/v1/khasra-map/parcels/:uid/evidence returns cryptographic bundle", async () => {
      const res = await fetch(`${baseUrl}/api/v1/khasra-map/parcels/${parcelUid}/evidence`);
      if (res.status !== 200) throw new Error(`Status ${res.status}`);
      const data = await res.json();
      if (!data.checksum_sha256 || !data.field_evidence || data.field_evidence.length === 0) {
        throw new Error("Evidence bundle missing checksum or field evidence");
      }
    });

    // TEST 7: Research Aggregates
    await assert("POST /api/v1/khasra-map/research/query returns aggregate metrics", async () => {
      const res = await fetch(`${baseUrl}/api/v1/khasra-map/research/query`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ state: "Delhi", village: "Alipur" })
      });
      if (res.status !== 200) throw new Error(`Status ${res.status}`);
      const data = await res.json();
      if (!data.aggregates || data.count === 0) {
        throw new Error("Zero research aggregates returned");
      }
    });

    // TEST 8: Export Endpoint
    await assert("GET /api/v1/khasra-map/export?format=csv returns CSV dataset", async () => {
      const res = await fetch(`${baseUrl}/api/v1/khasra-map/export?state=delhi&village=alipur&format=csv`);
      if (res.status !== 200) throw new Error(`Status ${res.status}`);
      const text = await res.text();
      if (!text.includes("parcel_uid") || !text.includes("142")) {
        throw new Error("CSV output missing headers or Khasra 142");
      }
    });

  } finally {
    server.close();
  }

  console.log("-------------------------------------------------");
  console.log(`TOTAL: ${passed + failed} | PASSED: ${passed} | FAILED: ${failed}`);
  console.log("-------------------------------------------------");

  if (failed > 0) {
    process.exit(1);
  }
}

runKhasraMapApiTests().catch(err => {
  console.error("Test suite error:", err);
  process.exit(1);
});
