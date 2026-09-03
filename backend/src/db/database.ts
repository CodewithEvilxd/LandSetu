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
  `);
}
