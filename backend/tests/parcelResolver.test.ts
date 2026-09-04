import { ParcelResolver } from "../src/modules/khasra-map/parcelResolver.js";

async function runResolverTests() {
  console.log("=================================================");
  console.log(" PARCEL RESOLVER DETERMINISTIC & AMBIGUITY TESTS");
  console.log("=================================================");

  let passed = 0;
  let failed = 0;

  function assert(name: string, condition: boolean, extra?: any) {
    if (condition) {
      console.log(`[PASS] ${name}`);
      passed++;
    } else {
      console.error(`[FAIL] ${name}`, extra || "");
      failed++;
    }
  }

  // 1. Resolve Delhi Khasra 142
  const delhiRes = ParcelResolver.resolve({
    khasra: "142",
    state: "Delhi",
    village: "Alipur"
  });
  assert(
    "Resolves Delhi Khasra 142 with exact match and composite UID",
    Boolean(
      delhiRes.status === "resolved" &&
      delhiRes.resolved_parcel?.parcel_uid?.includes("142") &&
      delhiRes.resolved_parcel?.state?.toLowerCase() === "delhi"
    ),
    delhiRes
  );

  // 2. Resolve Haryana Khasra 215
  const haryanaRes = ParcelResolver.resolve({
    khasra: "215",
    state: "Haryana",
    village: "Wazirabad"
  });
  assert(
    "Resolves Haryana Khasra 215 with exact match and composite UID",
    Boolean(
      haryanaRes.status === "resolved" &&
      haryanaRes.resolved_parcel?.parcel_uid?.includes("215") &&
      haryanaRes.resolved_parcel?.state?.toLowerCase() === "haryana"
    ),
    haryanaRes
  );

  // 3. Resolve by Composite UID directly
  const compositeRes = ParcelResolver.resolve({
    query: "DELHI|NORTH_DELHI|ALIPUR|ALIPUR|142"
  });
  assert(
    "Resolves direct composite identifier accurately",
    Boolean(compositeRes.status === "resolved" && compositeRes.resolved_parcel?.native_identifier === "142"),
    compositeRes
  );

  // 4. Resolve by Real Ingested Owner Name (Satish Kumar)
  const ownerRes = ParcelResolver.resolve({
    owner_name: "Satish Kumar",
    state: "Delhi",
    village: "Alipur"
  });
  assert(
    "Resolves parcel or candidates by verified owner name Satish Kumar in Alipur",
    Boolean(
      (ownerRes.status === "resolved" && ownerRes.resolved_parcel?.native_identifier === "142") ||
      (ownerRes.status === "ambiguous" && ownerRes.candidates?.some((c: any) => c.native_identifier === "142"))
    ),
    ownerRes
  );

  // 5. Ambiguity Handling: Multiple matches across villages without specifying geography
  const ambigRes = ParcelResolver.resolve({
    query: "142",
    allow_fuzzy: true
  });
  assert(
    "Resolver safely identifies match or handles ambiguity without throwing runtime error",
    ambigRes.status === "resolved" || ambigRes.status === "ambiguous",
    ambigRes
  );

  // 6. Refusal of Non-existent Parcel (Zero Hallucination Guarantee)
  const nonExistent = ParcelResolver.resolve({
    khasra: "999999",
    state: "Delhi",
    village: "Alipur"
  });
  assert(
    "Strictly refuses non-existent Khasra 999999 without imputation",
    nonExistent.status === "not_found" && nonExistent.candidate_count === 0,
    nonExistent
  );

  // 7. Resolve Noida Gata 101 (Sorkha Jahidabad)
  const noidaRes = ParcelResolver.resolve({
    khasra: "101",
    state: "Uttar Pradesh",
    village: "Sorkha Jahidabad"
  });
  assert(
    "Resolves Noida Gata 101 with exact match in Sorkha Jahidabad",
    Boolean(noidaRes.status === "resolved" && noidaRes.resolved_parcel?.native_identifier === "101"),
    noidaRes
  );

  // 8. Resolve Greater Noida Gata 401 (Kasna)
  const kasnaRes = ParcelResolver.resolve({
    khasra: "401",
    state: "Uttar Pradesh",
    village: "Kasna"
  });
  assert(
    "Resolves Greater Noida Gata 401 with exact match in Kasna",
    Boolean(kasnaRes.status === "resolved" && kasnaRes.resolved_parcel?.native_identifier === "401"),
    kasnaRes
  );

  // 9. Resolve Greater Noida West Gata 501 (Bisrakh Jalalpur)
  const bisrakhRes = ParcelResolver.resolve({
    khasra: "501",
    state: "Uttar Pradesh",
    village: "Bisrakh Jalalpur"
  });
  assert(
    "Resolves Greater Noida West Gata 501 with exact match in Bisrakh Jalalpur",
    Boolean(bisrakhRes.status === "resolved" && bisrakhRes.resolved_parcel?.native_identifier === "501"),
    bisrakhRes
  );

  console.log("-------------------------------------------------");
  console.log(`TOTAL: ${passed + failed} | PASSED: ${passed} | FAILED: ${failed}`);
  console.log("-------------------------------------------------");

  if (failed > 0) {
    process.exit(1);
  }
}

runResolverTests().catch(err => {
  console.error("Test execution error:", err);
  process.exit(1);
});
