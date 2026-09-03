import * as fs from "node:fs";
import * as path from "node:path";
import * as crypto from "node:crypto";
import { db, initDatabase } from "./database.js";

export function seedDatabase() {
  initDatabase();
  console.log("Seeding LandSetu Database from verified official datasets...");

  const dataDir = fs.existsSync(path.resolve(process.cwd(), "data"))
    ? path.resolve(process.cwd(), "data")
    : (fs.existsSync(path.resolve(process.cwd(), "backend/data"))
      ? path.resolve(process.cwd(), "backend/data")
      : path.resolve(__dirname, "../../data"));

  // 1. Seed Users (with hashed passwords)
  const countUsers = db.prepare("SELECT COUNT(*) as c FROM users").get() as { c: number };
  if (countUsers.c === 0) {
    const insertUser = db.prepare(`
      INSERT INTO users (id, username, password_hash, role, full_name, department, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    const hashPassword = (p: string) => crypto.createHash("sha256").update(p).digest("hex");

    insertUser.run("USR-ADMIN-01", "admin", hashPassword("Admin@LandSetu2026"), "admin", "Sanjay Verma", "DoLR Platform Administration", new Date().toISOString());
    insertUser.run("USR-OFFICIAL-01", "official", hashPassword("Official@LandSetu2026"), "official", "Rajeshwari Iyer", "Ministry of Rural Development, PME Division", new Date().toISOString());
    insertUser.run("USR-RESEARCH-01", "researcher", hashPassword("Research@LandSetu2026"), "researcher", "Dr. Arvind Swaminathan", "National Institute of Rural Development", new Date().toISOString());
    insertUser.run("USR-PUBLIC-01", "citizen", hashPassword("Public@LandSetu2026"), "public", "Anita Kumari", "Public Domain Access", new Date().toISOString());
    console.log("-> Users seeded (admin, official, researcher, citizen).");
  }

  // 2. Seed Sources
  const registryPath = path.join(dataDir, "source_registry.json");
  if (fs.existsSync(registryPath)) {
    const sources = JSON.parse(fs.readFileSync(registryPath, "utf-8"));
    const insertSource = db.prepare(`
      INSERT OR REPLACE INTO sources (
        source_id, source_name, publisher, domain, official_url, access_mode, data_format,
        jurisdiction, license_note, retrieved_at, published_at, updated_at, checksum_sha256,
        raw_artifact_path, coverage_summary, usage_status, availability_status, parser_version, notes
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    for (const s of sources) {
      insertSource.run(
        s.source_id, s.source_name, s.publisher, s.domain, s.official_url, s.access_mode, s.data_format,
        s.jurisdiction, s.license_note, s.retrieved_at, s.published_at, s.updated_at, s.checksum_sha256,
        s.raw_artifact_path, s.coverage_summary, s.usage_status, s.availability_status, s.parser_version, s.notes
      );
    }
    console.log(`-> Sources seeded (${sources.length} sources).`);
  }

  // 3. Seed Legal/Policy Documents & Chunks
  const docsPath = path.join(dataDir, "raw/official_legal_policy_documents.json");
  if (fs.existsSync(docsPath)) {
    const docs = JSON.parse(fs.readFileSync(docsPath, "utf-8"));
    const insertDoc = db.prepare(`
      INSERT OR REPLACE INTO documents (
        document_id, source_id, title, act_number, jurisdiction, publisher,
        source_url, date_enacted, document_type, summary, content_json, content_hash, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    for (const d of docs) {
      const contentJson = JSON.stringify(d.key_provisions);
      const hash = crypto.createHash("sha256").update(d.summary).digest("hex");
      insertDoc.run(
        d.document_id, "SRC-INDIACODE-005", d.title, d.act_number, d.jurisdiction, d.publisher,
        d.source_url, d.date_enacted, d.document_type, d.summary, contentJson, hash, new Date().toISOString()
      );
    }
    console.log(`-> Documents seeded (${docs.length} documents).`);
  }

  const chunksPath = path.join(dataDir, "processed/document_chunks.json");
  if (fs.existsSync(chunksPath)) {
    const chunks = JSON.parse(fs.readFileSync(chunksPath, "utf-8"));
    const insertChunk = db.prepare(`
      INSERT OR REPLACE INTO document_chunks (
        chunk_id, document_id, document_title, section, topic, content,
        jurisdiction, publisher, source_url, document_type, content_hash
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    for (const c of chunks) {
      insertChunk.run(
        c.chunk_id, c.document_id, c.document_title, c.section, c.topic || "", c.content,
        c.jurisdiction, c.publisher, c.source_url, c.document_type, c.content_hash
      );
    }
    console.log(`-> Document chunks seeded (${chunks.length} chunks).`);
  }

  // 4. Seed Datasets (DILRMP & NJDG)
  const dilrmpPath = path.join(dataDir, "raw/dilrmp_national_status.json");
  if (fs.existsSync(dilrmpPath)) {
    const dilrmp = JSON.parse(fs.readFileSync(dilrmpPath, "utf-8"));
    const hash = crypto.createHash("sha256").update(JSON.stringify(dilrmp)).digest("hex");
    db.prepare(`
      INSERT OR REPLACE INTO datasets (
        dataset_id, source_id, title, description, row_count, geography, data_json, checksum_sha256, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      "DATASET-DILRMP-01", "SRC-DILRMP-OGD-001", "State/UT-wise Computerization of Land Records & Cadastral Mapping",
      "Official progress metrics covering RoR computerization, digital cadastral maps, and ULPIN implementations.",
      dilrmp.length, "National (10 Major States)", JSON.stringify(dilrmp), hash, new Date().toISOString()
    );
  }

  const njdgPath = path.join(dataDir, "raw/njdg_land_disputes.json");
  if (fs.existsSync(njdgPath)) {
    const njdg = JSON.parse(fs.readFileSync(njdgPath, "utf-8"));
    const hash = crypto.createHash("sha256").update(JSON.stringify(njdg)).digest("hex");
    db.prepare(`
      INSERT OR REPLACE INTO datasets (
        dataset_id, source_id, title, description, row_count, geography, data_json, checksum_sha256, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      "DATASET-NJDG-02", "SRC-NJDG-002", "National Judicial Data Grid Civil Land Dispute Statistics",
      "District Court land & property civil disputes, pendency durations, and dispute types across states.",
      njdg.length, "National (8 High-Volume States)", JSON.stringify(njdg), hash, new Date().toISOString()
    );
  }

  // 5. Seed Geospatial Layers & Imagery
  const geoPath = path.join(dataDir, "raw/bhuvan_geospatial_layers.geojson");
  if (fs.existsSync(geoPath)) {
    const geo = JSON.parse(fs.readFileSync(geoPath, "utf-8"));
    db.prepare(`
      INSERT OR REPLACE INTO map_layers (
        layer_id, source_id, name, geometry_type, projection, extent_json, service_type,
        service_url, metric_description, feature_count, data_json, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      "LAYER-BHUVAN-LULC-01", "SRC-BHUVAN-ISRO-004", "NRSC Bhuvan Thematic Land Use & Watershed Boundary Layer",
      "Polygon / GeoJSON", "EPSG:4326 (WGS84)", JSON.stringify({ west: 75.25, south: 16.85, east: 81.50, north: 28.25 }),
      "WMS / GeoJSON", "https://bhuvan.nrsc.gov.in/wms/thematic",
      "LULC classification, NDVI vegetation index, soil moisture index, and water conservation structure density",
      geo.features.length, JSON.stringify(geo), new Date().toISOString()
    );
  }

  const geoImgPath = path.join(dataDir, "raw/geocoded_field_imagery.json");
  if (fs.existsSync(geoImgPath)) {
    const imgs = JSON.parse(fs.readFileSync(geoImgPath, "utf-8"));
    const insertImg = db.prepare(`
      INSERT OR REPLACE INTO geo_imagery (
        image_id, title, latitude, longitude, azimuth_degrees, altitude_meters,
        capture_timestamp, watershed_id, state, district, village, asset_type,
        field_observation, remote_sensing_crosscheck, provenance_ref
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    for (const im of imgs) {
      insertImg.run(
        im.image_id, im.title, im.latitude, im.longitude, im.azimuth_degrees, im.altitude_meters,
        im.capture_timestamp, im.watershed_id, im.state, im.district, im.village, im.asset_type,
        im.field_observation, im.remote_sensing_crosscheck, im.provenance_ref
      );
    }
  }

  // 6. Seed Land Records (SIH26018)
  const recPath = path.join(dataDir, "raw/legacy_land_records.json");
  if (fs.existsSync(recPath)) {
    const recs = JSON.parse(fs.readFileSync(recPath, "utf-8"));
    const insertRec = db.prepare(`
      INSERT OR REPLACE INTO land_records (
        record_id, document_name, state, district, tehsil, village, language,
        document_type, raw_ocr_text, overall_confidence, fields_json, uncertain_field_count,
        verification_status, verified_by, verified_at, audit_hash, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    for (const r of recs) {
      const auditHash = crypto.createHash("sha256").update(r.record_id + r.document_name + r.overall_confidence).digest("hex");
      insertRec.run(
        r.record_id, r.document_name, r.state, r.district, r.tehsil, r.village, r.language,
        r.document_type, r.raw_ocr_text, r.overall_confidence, JSON.stringify(r.extracted_fields),
        r.uncertain_field_count || 0, r.verification_status, r.verified_by, r.verified_at, auditHash, new Date().toISOString()
      );
    }
  }

  // 7. Seed Acquisition Projects (SIH26016)
  const acqPath = path.join(dataDir, "raw/national_land_acquisitions.json");
  if (fs.existsSync(acqPath)) {
    const acqs = JSON.parse(fs.readFileSync(acqPath, "utf-8"));
    const insertAcq = db.prepare(`
      INSERT OR REPLACE INTO acquisition_projects (
        project_id, project_name, project_category, implementing_agency, state, district,
        land_area_hectares, affected_families, compensation_assessed_crores, compensation_disbursed_crores,
        disbursement_pct, proposal_date, sia_completed_date, sec11_date, sec19_date, sec23_date,
        possession_date, current_status, lifecycle_stage, litigation_cases_count, rr_plan_status,
        delay_months, risk_category, risk_score, coordinates_json, delay_drivers_json, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    for (const a of acqs) {
      insertAcq.run(
        a.project_id, a.project_name, a.project_category, a.implementing_agency, a.state, a.district,
        a.land_area_hectares, a.affected_families, a.compensation_assessed_crores, a.compensation_disbursed_crores,
        a.disbursement_pct, a.proposal_date, a.sia_completed_date, a.sec11_preliminary_notification_date,
        a.sec19_declaration_date, a.sec23_award_date, a.possession_date, a.current_status, a.lifecycle_stage,
        a.litigation_cases_count, a.rr_plan_status, a.delay_months, a.risk_category, a.risk_score,
        JSON.stringify(a.coordinates), JSON.stringify(a.delay_drivers), new Date().toISOString()
      );
    }
  }

  // 8. Seed Policy Scenarios
  const countScenarios = db.prepare("SELECT COUNT(*) as c FROM policy_scenarios").get() as { c: number };
  if (countScenarios.c === 0) {
    const insertScenario = db.prepare(`
      INSERT INTO policy_scenarios (
        scenario_id, title, description, geography, baseline_metric, default_assumptions_json, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    insertScenario.run(
      "SCENARIO-TITLING-01",
      "Conclusive Land Titling & Title Guarantee Implementation",
      "Simulate the reduction in property litigation pendency and capital release by migrating from presumptive registration to state-guaranteed conclusive titles.",
      "National / High Dispute States",
      "District Court Land Dispute Pendency (NJDG)",
      JSON.stringify({
        digital_title_coverage_pct: 75.0,
        dispute_tribunal_fast_track: true,
        auto_mutation_integration_pct: 95.0,
        estimated_litigation_drop_factor: 0.42
      }),
      new Date().toISOString()
    );

    insertScenario.run(
      "SCENARIO-AUTO-MUTATION-02",
      "Universal SRO-Tehsil Auto-Triggered Mutation",
      "Simulate the impact of eliminating manual mutation delays on land transfer velocity and fraudulent double-registrations.",
      "Uttar Pradesh & Bihar",
      "Average Days to Update Land Record Post-Deed Registration",
      JSON.stringify({
        electronic_deed_pass_through: true,
        statutory_notice_period_days: 15,
        rejection_appeals_threshold_pct: 3.5
      }),
      new Date().toISOString()
    );
  }

  // 9. Seed Innovation Hub Challenges
  const countChallenges = db.prepare("SELECT COUNT(*) as c FROM innovation_challenges").get() as { c: number };
  if (countChallenges.c === 0) {
    const insertChallenge = db.prepare(`
      INSERT INTO innovation_challenges (
        challenge_id, title, theme, description, eligibility, prize_pool, deadline, status, created_by, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    insertChallenge.run(
      "CHALLENGE-AI-OCR-2026",
      "Multilingual Cadastral Map & Modi Script OCR Grand Challenge",
      "Computer Vision & NLP",
      "Develop open-source lightweight computer vision models to accurately extract historical land record registers in Modi, Kaithi, and Old Bengali scripts.",
      "Research Institutions, Universities, Startups",
      "₹ 25 Lakhs + Pilot Deployment with DoLR",
      "2026-06-30",
      "active",
      "USR-ADMIN-01",
      new Date().toISOString()
    );

    insertChallenge.run(
      "CHALLENGE-DRONE-ULPIN-2026",
      "High-Precision Drone Cadastral Mapping & ULPIN Auto-Generation",
      "Geospatial Technologies & Drone Analytics",
      "Create automated spatial pipelines connecting drone ortho-rectified imagery with 14-digit Bhu-Aadhaar coordinates under NAKSHA standards.",
      "GIS Firms, Academic Think Tanks",
      "₹ 40 Lakhs Grant",
      "2026-08-15",
      "active",
      "USR-ADMIN-01",
      new Date().toISOString()
    );
  }

  // 10. Seed Initial Genesis Audit Event (Tamper-evident Hash Chain)
  const countAudit = db.prepare("SELECT COUNT(*) as c FROM audit_events").get() as { c: number };
  if (countAudit.c === 0) {
    const genesisTime = "2026-01-01T00:00:00.000Z";
    const payload = JSON.stringify({ event: "GENESIS_INITIALIZATION", platform: "LandSetu" });
    const payloadDigest = crypto.createHash("sha256").update(payload).digest("hex");
    const previousHash = "0000000000000000000000000000000000000000000000000000000000000000";
    const canonical = `EVT-GENESIS|SYSTEM|admin|INITIALIZE_PLATFORM|PLATFORM|LANDSETU|${genesisTime}|${payloadDigest}|${previousHash}`;
    const currentHash = crypto.createHash("sha256").update(canonical).digest("hex");

    db.prepare(`
      INSERT INTO audit_events (
        event_id, actor_id, actor_role, action, target_type, target_id, timestamp,
        payload_digest, previous_hash, current_hash
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      "EVT-GENESIS", "SYSTEM", "admin", "INITIALIZE_PLATFORM", "PLATFORM", "LANDSETU",
      genesisTime, payloadDigest, previousHash, currentHash
    );
    console.log("-> Genesis Audit Event initialized with root hash.");
  }

  console.log("Database successfully seeded!");
}

if (process.argv[1] && process.argv[1].endsWith("seed.ts")) {
  seedDatabase();
}
