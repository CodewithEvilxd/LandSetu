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

  // 11. Seed Baseline Research Workspaces (Collaborative Research Workspaces - Requirement C)
  const countWorkspaces = db.prepare("SELECT COUNT(*) as c FROM workspaces").get() as { c: number };
  if (countWorkspaces.c === 0) {
    const insertWs = db.prepare(`
      INSERT INTO workspaces (workspace_id, title, description, created_by, created_at)
      VALUES (?, ?, ?, ?, ?)
    `);
    const insertWsItem = db.prepare(`
      INSERT INTO workspace_items (item_id, workspace_id, item_type, item_ref_id, title, notes, added_by, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const now = new Date().toISOString();

    insertWs.run(
      "WS-DILRMP-CADASTRE",
      "National Cadastral Map Digitization & Discrepancy Study",
      "Multi-state comparative analysis assessing cadastral boundary alignment between DILRMP geo-referenced vector layers and Jamabandi revenue records across Delhi, Haryana, and Bihar pilot tehsils.",
      "SYSTEM",
      now
    );

    insertWsItem.run(
      "WSI-001",
      "WS-DILRMP-CADASTRE",
      "dataset",
      "DATASET-DILRMP-01",
      "DILRMP Cadastral Computerization & Vector Map Progress",
      "Baseline national coverage metrics across 600+ districts with computerized record ratios.",
      "SYSTEM",
      now
    );
    insertWsItem.run(
      "WSI-002",
      "WS-DILRMP-CADASTRE",
      "document",
      "DOC-RFCTLARR-2013",
      "RFCTLARR Act 2013 Statutory Framework",
      "Mandatory social impact assessments and rehabilitation provisions governing land reclassification.",
      "SYSTEM",
      now
    );
    insertWsItem.run(
      "WSI-003",
      "WS-DILRMP-CADASTRE",
      "parcel",
      "DELHI-ALIPUR-142",
      "Delhi Tehsil Alipur Parcel #142 Boundary Evidence",
      "Ground-truth survey polygon exhibiting zero coordinate displacement against survey sheet 1982.",
      "SYSTEM",
      now
    );

    insertWs.run(
      "WS-INFRA-DELAY-ANALYSIS",
      "Infrastructure Acquisition Litigation & Delay Factor Analysis",
      "Empirical investigation into Section 23 award delay risks across national highway and freight corridors (NHAI & DFCCIL) using CAG audit records and scikit-learn predictive risk indicators.",
      "SYSTEM",
      now
    );

    insertWsItem.run(
      "WSI-004",
      "WS-INFRA-DELAY-ANALYSIS",
      "dataset",
      "DATASET-NJDG-02",
      "NJDG Subordinate Court Land Dispute Influx & Disposal Rates",
      "Case duration indicators showing median 5.4-year dispute resolution cycles in high-acquisition districts.",
      "SYSTEM",
      now
    );
    insertWsItem.run(
      "WSI-005",
      "WS-INFRA-DELAY-ANALYSIS",
      "project",
      "PRJ-NHAI-001",
      "Delhi-Amritsar-Katra Expressway (Package 4)",
      "High delay risk corridor undergoing Section 28 arbitration regarding agricultural land compensation awards.",
      "SYSTEM",
      now
    );
    console.log("-> Collaborative Research Workspaces seeded with baseline research projects.");
  }

  // 12. Seed Official Cadastral Maps & Parcels (Delhi, Haryana, Bihar, UP Noida, Kasna, Bisrakh)
  const countCadastral = db.prepare("SELECT COUNT(*) as c FROM cadastral_maps").get() as { c: number };
  if (countCadastral.c === 0) {
    const cadastralConfigs = [
      {
        state: "Delhi",
        district: "North Delhi",
        tehsil: "Alipur",
        village: "Alipur",
        map_id: "MAP-DELHI-ALIPUR-2023",
        source_id: "SRC-DELHI-GIS-004",
        survey_year: "2023",
        file: "raw/delhi/gis/alipur_cadastral_parcels.geojson"
      },
      {
        state: "Haryana",
        district: "Gurugram",
        tehsil: "Wazirabad",
        village: "Wazirabad",
        map_id: "MAP-HAR-WAZIRABAD-2022",
        source_id: "SRC-HARYANA-BHUNAKSHA-007",
        survey_year: "2022",
        file: "raw/haryana/gis/wazirabad_cadastral_parcels.geojson"
      },
      {
        state: "Bihar",
        district: "Patna",
        tehsil: "Patna Sadar",
        village: "Sabbalpur",
        map_id: "MAP-BIHAR-SABBALPUR-CADASTRAL",
        source_id: "SRC-BIHAR-BHUMI-001",
        survey_year: "2021-2023",
        file: "raw/bihar/gis/sabbalpur_cadastral_parcels.geojson"
      },
      {
        state: "Uttar Pradesh",
        district: "Gautam Buddha Nagar",
        tehsil: "Sadar Noida",
        village: "Sorkha Jahidabad",
        map_id: "MAP-UP-NOIDA-SORKHA-2023",
        source_id: "SRC-NOIDA-AUTH-010",
        survey_year: "1430-1435 Fasli (2023)",
        file: "raw/up/gis/noida_sorkha_cadastral_parcels.geojson"
      },
      {
        state: "Uttar Pradesh",
        district: "Gautam Buddha Nagar",
        tehsil: "Dadri",
        village: "Kasna",
        map_id: "MAP-UP-GNOIDA-KASNA-2023",
        source_id: "SRC-GNIDA-AUTH-011",
        survey_year: "1430-1435 Fasli (2023)",
        file: "raw/up/gis/greaternoida_kasna_cadastral_parcels.geojson"
      },
      {
        state: "Uttar Pradesh",
        district: "Gautam Buddha Nagar",
        tehsil: "Dadri",
        village: "Bisrakh Jalalpur",
        map_id: "MAP-UP-GNOIDA-BISRAKH-2023",
        source_id: "SRC-GNIDA-AUTH-012",
        survey_year: "1430-1435 Fasli (2023)",
        file: "raw/up/gis/greaternoida_bisrakh_cadastral_parcels.geojson"
      }
    ];

    const insertCadastralMap = db.prepare(`
      INSERT OR REPLACE INTO cadastral_maps (
        map_id, state, district, tehsil, village, survey_year,
        source_id, checksum_sha256, feature_count, cadastral_layer_json
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const insertCoverage = db.prepare(`
      INSERT OR REPLACE INTO coverage_areas (
        coverage_id, state, district, tehsil, village,
        has_cadastral_geometry, has_land_records, parcel_count, status, source_id
      ) VALUES (?, ?, ?, ?, ?, 1, 1, ?, 'verified_official_ingested', ?)
    `);

    const insertParcel = db.prepare(`
      INSERT OR REPLACE INTO land_parcels (
        parcel_uid, state, district, subdivision, tehsil, village, native_identifier,
        identifier_type, account_identifier, source_system, source_id,
        area, area_unit, area_raw, land_use, geometry_id, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const insertGeom = db.prepare(`
      INSERT OR REPLACE INTO parcel_geometries (
        geometry_id, parcel_uid, geometry_type, geojson, srid, bbox_json, area_sqm, perimeter_m, created_at
      ) VALUES (?, ?, ?, ?, 4326, ?, ?, ?, ?)
    `);

    const insertAcc = db.prepare(`
      INSERT OR REPLACE INTO parcel_accounts (
        account_id, parcel_uid, khata_number, khatauni_number, khewat_number, created_at
      ) VALUES (?, ?, ?, ?, ?, ?)
    `);

    const insertRight = db.prepare(`
      INSERT OR REPLACE INTO parcel_rights (
        right_id, parcel_uid, owner_name, relation_type, relative_name,
        share_fraction, right_type, encumbrance_status, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    let totalParcelsSeeded = 0;
    const now = new Date().toISOString();

    for (const cfg of cadastralConfigs) {
      const geojsonPath = path.join(dataDir, cfg.file);
      if (fs.existsSync(geojsonPath)) {
        const geojsonStr = fs.readFileSync(geojsonPath, "utf-8");
        const geojson = JSON.parse(geojsonStr);
        const checksum = crypto.createHash("sha256").update(geojsonStr).digest("hex");
        const features = geojson.features || [];

        insertCadastralMap.run(
          cfg.map_id, cfg.state, cfg.district, cfg.tehsil, cfg.village, cfg.survey_year,
          cfg.source_id, checksum, features.length, geojsonStr
        );

        insertCoverage.run(
          `COV-${cfg.state.toUpperCase().replace(/\s+/g, "_")}-${cfg.village.toUpperCase().replace(/\s+/g, "_")}`,
          cfg.state, cfg.district, cfg.tehsil, cfg.village,
          features.length, cfg.source_id
        );

        for (const f of features) {
          const props = f.properties || {};
          const pUid = props.parcel_uid || props.parcel_id || `${cfg.state.toUpperCase()}|${cfg.village.toUpperCase()}|${props.khasra || props.native_identifier}`;
          const nativeId = String(props.native_identifier || props.khasra || props.gata_no || "");
          const geomId = `GEOM-${pUid}`;
          const polyCoords = f.geometry?.coordinates?.[0] || [];
          const lngs = polyCoords.map((c: any) => c[0]);
          const lats = polyCoords.map((c: any) => c[1]);
          const bboxStr = lngs.length ? JSON.stringify([Math.min(...lngs), Math.min(...lats), Math.max(...lngs), Math.max(...lats)]) : "[]";
          const areaHa = Number(props.area_hectares || 0.5);
          const areaRaw = props.area_bigha_biswa || props.area_local_unit || `${areaHa} Ha`;
          const landUse = props.land_use || "Agricultural";
          const khataNo = props.khata_no || "0001";
          const khatauniNo = props.khatauni_no || khataNo;

          insertParcel.run(
            pUid, cfg.state, cfg.district, cfg.tehsil, cfg.tehsil, cfg.village, nativeId,
            "khasra", khataNo, "Government Cadastre", cfg.source_id,
            areaHa, "hectare", areaRaw, landUse, geomId, now, now
          );

          insertGeom.run(
            geomId, pUid, "Polygon", JSON.stringify(f.geometry || {}), bboxStr, Number(props.area_sqm || areaHa * 10000), 400, now
          );

          insertAcc.run(
            `ACC-${pUid}`, pUid, khataNo, khatauniNo, "", now
          );

          const owners = props.recorded_owners || [];
          if (Array.isArray(owners) && owners.length > 0) {
            for (let oi = 0; oi < owners.length; oi++) {
              const o = owners[oi];
              const oName = typeof o === "string" ? o : (o.name || "Owner");
              const oFather = typeof o === "object" ? (o.father || "") : "";
              const oShare = typeof o === "object" ? (o.share || "1/1") : "1/1";
              insertRight.run(
                `RGT-${pUid}-${oi + 1}`, pUid, oName, "s/o", oFather, oShare,
                "Bhumidhar with Transferable Rights", "unencumbered", now
              );
            }
          } else {
            insertRight.run(
              `RGT-${pUid}-1`, pUid, "Recorded Tenure Holder", "s/o", "", "1/1",
              "Bhumidhar with Transferable Rights", "unencumbered", now
            );
          }

          totalParcelsSeeded++;
        }
      }
    }
    console.log(`-> Cadastral Survey Maps & Parcels seeded (${cadastralConfigs.length} villages, ${totalParcelsSeeded} parcels).`);
  }

  console.log("Database successfully seeded!");
}

if (process.argv[1] && process.argv[1].endsWith("seed.ts")) {
  seedDatabase();
}
