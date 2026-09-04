import { DatabaseSync } from "node:sqlite";
import * as path from "node:path";
import * as fs from "node:fs";

const dbDir = fs.existsSync(path.resolve(process.cwd(), "data"))
  ? path.resolve(process.cwd(), "data")
  : (fs.existsSync(path.resolve(process.cwd(), "backend/data"))
    ? path.resolve(process.cwd(), "backend/data")
    : path.resolve(__dirname, "../../data"));

if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const dbPath = path.join(dbDir, "landsetu.db");
export const db = new DatabaseSync(dbPath);

export function initDatabase() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      username TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL,
      full_name TEXT NOT NULL,
      department TEXT,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS sources (
      source_id TEXT PRIMARY KEY,
      source_name TEXT NOT NULL,
      publisher TEXT NOT NULL,
      domain TEXT NOT NULL,
      official_url TEXT NOT NULL,
      access_mode TEXT NOT NULL,
      data_format TEXT NOT NULL,
      jurisdiction TEXT NOT NULL,
      license_note TEXT,
      retrieved_at TEXT NOT NULL,
      published_at TEXT,
      updated_at TEXT,
      checksum_sha256 TEXT NOT NULL,
      raw_artifact_path TEXT,
      coverage_summary TEXT,
      usage_status TEXT NOT NULL,
      availability_status TEXT NOT NULL,
      parser_version TEXT,
      notes TEXT
    );

    CREATE TABLE IF NOT EXISTS documents (
      document_id TEXT PRIMARY KEY,
      source_id TEXT NOT NULL,
      title TEXT NOT NULL,
      act_number TEXT,
      jurisdiction TEXT NOT NULL,
      publisher TEXT NOT NULL,
      source_url TEXT NOT NULL,
      date_enacted TEXT,
      document_type TEXT NOT NULL,
      summary TEXT NOT NULL,
      content_json TEXT NOT NULL,
      content_hash TEXT NOT NULL,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS document_chunks (
      chunk_id TEXT PRIMARY KEY,
      document_id TEXT NOT NULL,
      document_title TEXT NOT NULL,
      section TEXT,
      topic TEXT,
      content TEXT NOT NULL,
      jurisdiction TEXT NOT NULL,
      publisher TEXT NOT NULL,
      source_url TEXT NOT NULL,
      document_type TEXT NOT NULL,
      content_hash TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS datasets (
      dataset_id TEXT PRIMARY KEY,
      source_id TEXT NOT NULL,
      title TEXT NOT NULL,
      description TEXT,
      row_count INTEGER NOT NULL,
      geography TEXT NOT NULL,
      data_json TEXT NOT NULL,
      checksum_sha256 TEXT NOT NULL,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS map_layers (
      layer_id TEXT PRIMARY KEY,
      source_id TEXT NOT NULL,
      name TEXT NOT NULL,
      geometry_type TEXT NOT NULL,
      projection TEXT NOT NULL,
      extent_json TEXT,
      service_type TEXT NOT NULL,
      service_url TEXT,
      metric_description TEXT,
      feature_count INTEGER NOT NULL,
      data_json TEXT NOT NULL,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS geo_imagery (
      image_id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      latitude REAL NOT NULL,
      longitude REAL NOT NULL,
      azimuth_degrees REAL,
      altitude_meters REAL,
      capture_timestamp TEXT NOT NULL,
      watershed_id TEXT,
      state TEXT NOT NULL,
      district TEXT NOT NULL,
      village TEXT NOT NULL,
      asset_type TEXT NOT NULL,
      field_observation TEXT,
      remote_sensing_crosscheck TEXT,
      provenance_ref TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS land_records (
      record_id TEXT PRIMARY KEY,
      document_name TEXT NOT NULL,
      state TEXT NOT NULL,
      district TEXT NOT NULL,
      tehsil TEXT NOT NULL,
      village TEXT NOT NULL,
      language TEXT NOT NULL,
      document_type TEXT NOT NULL,
      raw_ocr_text TEXT NOT NULL,
      overall_confidence REAL NOT NULL,
      fields_json TEXT NOT NULL,
      uncertain_field_count INTEGER NOT NULL,
      verification_status TEXT NOT NULL,
      verified_by TEXT,
      verified_at TEXT,
      audit_hash TEXT,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS acquisition_projects (
      project_id TEXT PRIMARY KEY,
      project_name TEXT NOT NULL,
      project_category TEXT NOT NULL,
      implementing_agency TEXT NOT NULL,
      state TEXT NOT NULL,
      district TEXT NOT NULL,
      land_area_hectares REAL NOT NULL,
      affected_families INTEGER NOT NULL,
      compensation_assessed_crores REAL NOT NULL,
      compensation_disbursed_crores REAL NOT NULL,
      disbursement_pct REAL NOT NULL,
      proposal_date TEXT,
      sia_completed_date TEXT,
      sec11_date TEXT,
      sec19_date TEXT,
      sec23_date TEXT,
      possession_date TEXT,
      current_status TEXT NOT NULL,
      lifecycle_stage TEXT NOT NULL,
      litigation_cases_count INTEGER NOT NULL,
      rr_plan_status TEXT NOT NULL,
      delay_months REAL NOT NULL,
      risk_category TEXT NOT NULL,
      risk_score REAL NOT NULL,
      coordinates_json TEXT NOT NULL,
      delay_drivers_json TEXT NOT NULL,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS policy_scenarios (
      scenario_id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      geography TEXT NOT NULL,
      baseline_metric TEXT NOT NULL,
      default_assumptions_json TEXT NOT NULL,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS policy_runs (
      run_id TEXT PRIMARY KEY,
      scenario_id TEXT NOT NULL,
      title TEXT NOT NULL,
      geography TEXT NOT NULL,
      baseline_value REAL NOT NULL,
      intervention_json TEXT NOT NULL,
      assumptions_json TEXT NOT NULL,
      scenario_estimate REAL NOT NULL,
      delta_absolute REAL NOT NULL,
      delta_percent REAL NOT NULL,
      method_version TEXT NOT NULL,
      sources_json TEXT NOT NULL,
      limitations_json TEXT NOT NULL,
      run_by TEXT NOT NULL,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS workspaces (
      workspace_id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      created_by TEXT NOT NULL,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS workspace_items (
      item_id TEXT PRIMARY KEY,
      workspace_id TEXT NOT NULL,
      item_type TEXT NOT NULL,
      item_ref_id TEXT NOT NULL,
      title TEXT NOT NULL,
      notes TEXT,
      added_by TEXT NOT NULL,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS innovation_challenges (
      challenge_id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      theme TEXT NOT NULL,
      description TEXT NOT NULL,
      eligibility TEXT NOT NULL,
      prize_pool TEXT NOT NULL,
      deadline TEXT NOT NULL,
      status TEXT NOT NULL,
      created_by TEXT NOT NULL,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS audit_events (
      event_id TEXT PRIMARY KEY,
      actor_id TEXT NOT NULL,
      actor_role TEXT NOT NULL,
      action TEXT NOT NULL,
      target_type TEXT NOT NULL,
      target_id TEXT NOT NULL,
      timestamp TEXT NOT NULL,
      payload_digest TEXT NOT NULL,
      previous_hash TEXT NOT NULL,
      current_hash TEXT NOT NULL
    );

    -- 1. Normalized Land Parcels
    CREATE TABLE IF NOT EXISTS land_parcels (
      parcel_uid TEXT PRIMARY KEY,
      state TEXT NOT NULL,
      district TEXT NOT NULL,
      subdivision TEXT,
      tehsil TEXT NOT NULL,
      village TEXT NOT NULL,
      native_identifier TEXT NOT NULL,
      identifier_type TEXT NOT NULL,
      account_identifier TEXT,
      source_system TEXT NOT NULL,
      source_id TEXT NOT NULL,
      source_record_id TEXT,
      source_document_id TEXT,
      area REAL,
      area_unit TEXT,
      area_raw TEXT,
      land_use TEXT,
      geometry_id TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    -- 2. Multi-Identifier Lookup
    CREATE TABLE IF NOT EXISTS parcel_identifiers (
      id TEXT PRIMARY KEY,
      parcel_uid TEXT NOT NULL,
      identifier_type TEXT NOT NULL,
      identifier_value TEXT NOT NULL,
      normalized_value TEXT NOT NULL,
      source_system TEXT NOT NULL,
      FOREIGN KEY (parcel_uid) REFERENCES land_parcels(parcel_uid)
    );

    -- 3. Recorded Rights & Tenure Holders
    CREATE TABLE IF NOT EXISTS parcel_rights (
      id TEXT PRIMARY KEY,
      parcel_uid TEXT NOT NULL,
      rights_holder_name TEXT NOT NULL,
      rights_type TEXT NOT NULL,
      share_fraction TEXT,
      parentage_or_details TEXT,
      source_record_date TEXT,
      source_id TEXT NOT NULL,
      source_url TEXT,
      verification_status TEXT NOT NULL,
      legal_disclaimer TEXT NOT NULL,
      FOREIGN KEY (parcel_uid) REFERENCES land_parcels(parcel_uid)
    );

    -- 4. Accounts Relation (Khata / Khatauni / Khewat)
    CREATE TABLE IF NOT EXISTS parcel_accounts (
      account_uid TEXT PRIMARY KEY,
      parcel_uid TEXT NOT NULL,
      khata_number TEXT,
      khatauni_number TEXT,
      khewat_number TEXT,
      state TEXT NOT NULL,
      village TEXT NOT NULL,
      source_id TEXT NOT NULL,
      FOREIGN KEY (parcel_uid) REFERENCES land_parcels(parcel_uid)
    );

    -- 5. Temporal Parcel State Machine (Chronological Lifecycle)
    CREATE TABLE IF NOT EXISTS parcel_events (
      event_id TEXT PRIMARY KEY,
      parcel_uid TEXT NOT NULL,
      event_type TEXT NOT NULL,
      event_date TEXT NOT NULL,
      valid_from TEXT,
      valid_to TEXT,
      order_reference TEXT,
      description TEXT NOT NULL,
      source_id TEXT NOT NULL,
      created_at TEXT NOT NULL,
      FOREIGN KEY (parcel_uid) REFERENCES land_parcels(parcel_uid)
    );

    -- 6. Sanctioned Mutations
    CREATE TABLE IF NOT EXISTS parcel_mutations (
      mutation_id TEXT PRIMARY KEY,
      parcel_uid TEXT NOT NULL,
      mutation_number TEXT NOT NULL,
      mutation_date TEXT,
      mutation_type TEXT NOT NULL,
      status TEXT NOT NULL,
      order_reference TEXT,
      source_id TEXT NOT NULL,
      FOREIGN KEY (parcel_uid) REFERENCES land_parcels(parcel_uid)
    );

    -- 7. Encumbrances & Remarks
    CREATE TABLE IF NOT EXISTS parcel_encumbrances (
      encumbrance_id TEXT PRIMARY KEY,
      parcel_uid TEXT NOT NULL,
      encumbrance_type TEXT NOT NULL,
      amount REAL,
      institution TEXT,
      details TEXT,
      source_id TEXT NOT NULL,
      FOREIGN KEY (parcel_uid) REFERENCES land_parcels(parcel_uid)
    );

    -- 8. PostGIS-Ready Parcel Geometries
    CREATE TABLE IF NOT EXISTS parcel_geometries (
      geometry_id TEXT PRIMARY KEY,
      parcel_uid TEXT NOT NULL UNIQUE,
      geometry_type TEXT NOT NULL,
      geojson TEXT NOT NULL,
      centroid_lat REAL NOT NULL,
      centroid_lng REAL NOT NULL,
      bbox_json TEXT NOT NULL,
      source_crs TEXT NOT NULL,
      quality_flag TEXT NOT NULL,
      source_id TEXT NOT NULL,
      FOREIGN KEY (parcel_uid) REFERENCES land_parcels(parcel_uid)
    );

    -- 9. Village Cadastral Map Layers
    CREATE TABLE IF NOT EXISTS cadastral_maps (
      map_id TEXT PRIMARY KEY,
      state TEXT NOT NULL,
      district TEXT NOT NULL,
      tehsil TEXT NOT NULL,
      village TEXT NOT NULL,
      cadastral_layer_json TEXT NOT NULL,
      feature_count INTEGER NOT NULL,
      survey_year TEXT,
      source_id TEXT NOT NULL,
      checksum_sha256 TEXT NOT NULL
    );

    -- 10. National Coverage Ledger
    CREATE TABLE IF NOT EXISTS coverage_areas (
      coverage_id TEXT PRIMARY KEY,
      state TEXT NOT NULL,
      district TEXT NOT NULL,
      tehsil TEXT NOT NULL,
      village TEXT NOT NULL,
      has_cadastral_geometry INTEGER NOT NULL,
      has_land_records INTEGER NOT NULL,
      parcel_count INTEGER NOT NULL,
      status TEXT NOT NULL,
      source_id TEXT NOT NULL
    );

    -- 11. Cross-Domain Acquisition Links
    CREATE TABLE IF NOT EXISTS parcel_acquisition_links (
      link_id TEXT PRIMARY KEY,
      parcel_uid TEXT NOT NULL,
      project_id TEXT NOT NULL,
      notification_number TEXT,
      section TEXT,
      stage TEXT NOT NULL,
      compensation_award_status TEXT,
      source_id TEXT NOT NULL,
      FOREIGN KEY (parcel_uid) REFERENCES land_parcels(parcel_uid)
    );

    -- 12. Cross-Domain Dispute Links
    CREATE TABLE IF NOT EXISTS parcel_dispute_links (
      link_id TEXT PRIMARY KEY,
      parcel_uid TEXT NOT NULL,
      case_number TEXT NOT NULL,
      court TEXT NOT NULL,
      dispute_type TEXT NOT NULL,
      status TEXT NOT NULL,
      source_id TEXT NOT NULL,
      FOREIGN KEY (parcel_uid) REFERENCES land_parcels(parcel_uid)
    );

    -- 13. Field-Level Provenance Ledger
    CREATE TABLE IF NOT EXISTS parcel_evidence (
      evidence_id TEXT PRIMARY KEY,
      parcel_uid TEXT NOT NULL,
      field_name TEXT NOT NULL,
      field_value TEXT NOT NULL,
      source_id TEXT NOT NULL,
      source_url TEXT NOT NULL,
      retrieved_at TEXT NOT NULL,
      verification_status TEXT NOT NULL,
      checksum_sha256 TEXT NOT NULL,
      FOREIGN KEY (parcel_uid) REFERENCES land_parcels(parcel_uid)
    );

    -- 14. Administrative Boundary Hierarchy
    CREATE TABLE IF NOT EXISTS states (
      code TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      language TEXT NOT NULL,
      local_units TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS districts (
      id TEXT PRIMARY KEY,
      state_code TEXT NOT NULL,
      name TEXT NOT NULL,
      census_code TEXT,
      FOREIGN KEY (state_code) REFERENCES states(code)
    );

    CREATE TABLE IF NOT EXISTS subdivisions (
      id TEXT PRIMARY KEY,
      district_id TEXT NOT NULL,
      name TEXT NOT NULL,
      FOREIGN KEY (district_id) REFERENCES districts(id)
    );

    CREATE TABLE IF NOT EXISTS tehsils (
      id TEXT PRIMARY KEY,
      subdivision_id TEXT NOT NULL,
      name TEXT NOT NULL,
      FOREIGN KEY (subdivision_id) REFERENCES subdivisions(id)
    );

    CREATE TABLE IF NOT EXISTS villages (
      id TEXT PRIMARY KEY,
      tehsil_id TEXT NOT NULL,
      name TEXT NOT NULL,
      census_code TEXT,
      has_records INTEGER DEFAULT 0,
      has_maps INTEGER DEFAULT 0,
      FOREIGN KEY (tehsil_id) REFERENCES tehsils(id)
    );

    -- 15. Ingestion Orchestration Ledger
    CREATE TABLE IF NOT EXISTS ingestion_jobs (
      job_id TEXT PRIMARY KEY,
      state TEXT NOT NULL,
      job_type TEXT NOT NULL,
      status TEXT NOT NULL,
      started_at TEXT NOT NULL,
      completed_at TEXT,
      total_records INTEGER DEFAULT 0,
      success_count INTEGER DEFAULT 0,
      error_count INTEGER DEFAULT 0,
      error_log TEXT
    );

    CREATE TABLE IF NOT EXISTS ingestion_job_files (
      id TEXT PRIMARY KEY,
      job_id TEXT NOT NULL,
      file_path TEXT NOT NULL,
      sha256 TEXT NOT NULL,
      size_bytes INTEGER NOT NULL,
      processed_records INTEGER DEFAULT 0,
      status TEXT NOT NULL,
      error_message TEXT,
      FOREIGN KEY (job_id) REFERENCES ingestion_jobs(job_id)
    );

    CREATE TABLE IF NOT EXISTS ingestion_checkpoints (
      id TEXT PRIMARY KEY,
      job_id TEXT NOT NULL,
      file_path TEXT NOT NULL,
      chunk_index INTEGER DEFAULT 0,
      record_offset INTEGER DEFAULT 0,
      last_processed_id TEXT,
      updated_at TEXT NOT NULL,
      FOREIGN KEY (job_id) REFERENCES ingestion_jobs(job_id)
    );

    -- 16. Storage Content-Addressable Ledger
    CREATE TABLE IF NOT EXISTS storage_objects (
      sha256 TEXT PRIMARY KEY,
      original_path TEXT,
      size_bytes INTEGER NOT NULL,
      mime_type TEXT NOT NULL,
      tier TEXT DEFAULT 'hot',
      archive_status TEXT DEFAULT 'pending',
      archive_ref TEXT,
      created_at TEXT NOT NULL,
      verified_at TEXT
    );

    -- 17. Materialized Summaries (Precomputes for Dashboard & Quality Reports)
    CREATE TABLE IF NOT EXISTS village_parcel_summary (
      state TEXT NOT NULL,
      district TEXT NOT NULL,
      tehsil TEXT NOT NULL,
      village TEXT NOT NULL,
      total_parcels INTEGER DEFAULT 0,
      total_area_hectares REAL DEFAULT 0,
      parcels_with_geometry INTEGER DEFAULT 0,
      parcels_with_owners INTEGER DEFAULT 0,
      parcels_with_mutations INTEGER DEFAULT 0,
      updated_at TEXT NOT NULL,
      PRIMARY KEY (state, district, tehsil, village)
    );

    CREATE TABLE IF NOT EXISTS district_land_summary (
      state TEXT NOT NULL,
      district TEXT NOT NULL,
      total_villages INTEGER DEFAULT 0,
      total_parcels INTEGER DEFAULT 0,
      total_area_hectares REAL DEFAULT 0,
      parcels_with_geometry INTEGER DEFAULT 0,
      updated_at TEXT NOT NULL,
      PRIMARY KEY (state, district)
    );

    CREATE TABLE IF NOT EXISTS mutation_summary (
      state TEXT NOT NULL,
      district TEXT NOT NULL,
      pending_count INTEGER DEFAULT 0,
      approved_count INTEGER DEFAULT 0,
      rejected_count INTEGER DEFAULT 0,
      updated_at TEXT NOT NULL,
      PRIMARY KEY (state, district)
    );

    -- 18. Compound Performance Indices
    CREATE INDEX IF NOT EXISTS idx_land_parcels_geo ON land_parcels(state, district, tehsil, village);
    CREATE INDEX IF NOT EXISTS idx_land_parcels_native_id ON land_parcels(native_identifier);
    CREATE INDEX IF NOT EXISTS idx_land_parcels_source ON land_parcels(source_id);
    CREATE INDEX IF NOT EXISTS idx_parcel_identifiers_norm ON parcel_identifiers(normalized_value, identifier_type);
    CREATE INDEX IF NOT EXISTS idx_parcel_rights_holder ON parcel_rights(rights_holder_name);
    CREATE INDEX IF NOT EXISTS idx_parcel_geometries_centroid ON parcel_geometries(centroid_lat, centroid_lng);
    CREATE INDEX IF NOT EXISTS idx_cadastral_maps_village ON cadastral_maps(state, district, village);
    CREATE INDEX IF NOT EXISTS idx_coverage_areas_state ON coverage_areas(state, district, village);
    CREATE INDEX IF NOT EXISTS idx_parcel_evidence_uid ON parcel_evidence(parcel_uid, field_name);
    CREATE INDEX IF NOT EXISTS idx_storage_objects_archive ON storage_objects(archive_status);
  `);
}


