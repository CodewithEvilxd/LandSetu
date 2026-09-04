import { createApp } from "../src/app.js";
import { ParcelResolver } from "../src/modules/khasra-map/parcelResolver.js";
import { ParcelQueries } from "../src/modules/khasra-map/parcelQueries.js";

async function runAdversarialTests() {
  console.log("=================================================");
  console.log(" ADVERSARIAL, PRIVACY & INTEGRITY VERIFICATION SUITE");
  console.log("=================================================");

  const app = createApp();
  const server = app.listen(0);
  const port = (server.address() as any).port;
  const baseUrl = `http://127.0.0.1:${port}`;

  let passed = 0;
  let failed = 0;

  async function assert(name: string, fn: () => Promise<void> | void) {
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
    // 1. Zero Hallucination: Non-existent Khasra 888888
    await assert("Strict refusal on non-existent Khasra 888888 in Alipur", () => {
      const res = ParcelResolver.resolve({
        khasra: "888888",
        state: "Delhi",
        village: "Alipur"
      });
      if (res.status !== "not_found" || res.candidate_count !== 0) {
        throw new Error(`Expected not_found with 0 candidates, got: ${res.status}`);
      }
    });

    // 2. Unsupported Geography in Corpus
    await assert("Refusal on non-existent village 'AtlantisCity'", async () => {
      const res = await fetch(`${baseUrl}/api/v1/khasra-map/villages/delhi/AtlantisCity/cadastre`);
      if (res.status !== 404) {
        throw new Error(`Expected 404 for non-existent village, got ${res.status}`);
      }
      const json = await res.json();
      if (json.coverage_status !== "unsupported_in_corpus") {
        throw new Error("Missing unsupported_in_corpus flag in 404 response");
      }
    });

    // 3. Privacy Protection: No Aadhaar / Mobile / Private Bank details exposed
    await assert("Parcel and Rights endpoints contain zero private phone or Aadhaar numbers", () => {
      const parcels = ParcelQueries.getParcelsByVillage("Delhi", "Alipur");
      for (const p of parcels) {
        const str = JSON.stringify(p).toLowerCase();
        if (str.includes("aadhaar") || str.includes("phone") || str.includes("mobile") || str.includes("bank_account")) {
          throw new Error(`Potential private PII leaked in parcel ${p.parcel_uid}`);
        }
        const rights = ParcelQueries.getRightsByParcelUid(p.parcel_uid);
        for (const r of rights) {
          const rStr = JSON.stringify(r).toLowerCase();
          if (rStr.includes("aadhaar") || rStr.includes("mobile") || rStr.includes("phone")) {
            throw new Error(`Potential private PII leaked in rights record ${r.id}`);
          }
        }
      }
    });

    // 4. Geometry Topology: Bounding Box & Polygon Coordinate Validity (WGS84 EPSG:4326)
    await assert("All parcel geometries have valid coordinates within India bounding box and closed rings", () => {
      const delCad = ParcelQueries.getCadastralMapByVillage("Delhi", "Alipur");
      if (!delCad) throw new Error("Missing Alipur cadastre");
      const features = delCad.cadastral_layer_json.features;

      for (const f of features) {
        const coords = f.geometry.coordinates;
        if (!coords || coords.length === 0) throw new Error(`Empty coordinates in feature ${f.properties.khasra}`);

        const ring = f.geometry.type === "Polygon" ? coords[0] : coords[0][0];
        if (ring.length < 4) throw new Error(`Invalid polygon ring with < 4 vertices in ${f.properties.khasra}`);

        // Check closed ring
        const first = ring[0];
        const last = ring[ring.length - 1];
        if (Math.abs(first[0] - last[0]) > 0.0001 || Math.abs(first[1] - last[1]) > 0.0001) {
          throw new Error(`Polygon ring not closed in ${f.properties.khasra}: first=${first}, last=${last}`);
        }

        // Check India geographic bounds: Lng between 68 and 97, Lat between 8 and 37
        for (const pt of ring) {
          const [lng, lat] = pt;
          if (lng < 68 || lng > 97 || lat < 8 || lat > 37) {
            throw new Error(`Out-of-bounds coordinates in ${f.properties.khasra}: [${lng}, ${lat}]`);
          }
        }
      }
    });

    // 5. Ingestion Checksum Integrity
    await assert("Ingested cadastral maps retain immutable 64-character hex SHA-256 digests", () => {
      const delCad = ParcelQueries.getCadastralMapByVillage("Delhi", "Alipur");
      const harCad = ParcelQueries.getCadastralMapByVillage("Haryana", "Wazirabad");

      const hexRegex = /^[a-f0-9]{64}$/i;
      if (!hexRegex.test(delCad?.checksum_sha256 || "")) {
        throw new Error(`Invalid SHA-256 checksum for Delhi: ${delCad?.checksum_sha256}`);
      }
      if (!hexRegex.test(harCad?.checksum_sha256 || "")) {
        throw new Error(`Invalid SHA-256 checksum for Haryana: ${harCad?.checksum_sha256}`);
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

runAdversarialTests().catch(err => {
  console.error("Adversarial test suite error:", err);
  process.exit(1);
});
