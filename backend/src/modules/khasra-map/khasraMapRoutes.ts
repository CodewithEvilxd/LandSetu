import { Router, Request, Response } from "express";
import * as fs from "node:fs";
import * as path from "node:path";
import { CoverageService } from "./coverageService.js";
import { ParcelQueries } from "./parcelQueries.js";
import { ParcelResolver } from "./parcelResolver.js";
import { ParcelEvidenceService } from "./parcelEvidenceService.js";
import { storageManager } from "../../storage/index.js";
import { db } from "../../db/database.js";

const router = Router();

/**
 * GET /coverage - National cadastral coverage summary
 */
router.get("/coverage", (_req: Request, res: Response) => {
  const summary = CoverageService.getCoverageSummary();
  res.json(summary);
});

/**
 * GET /demo-manifest - Dynamic verified demo parcels for Delhi, Haryana, and Bihar
 */
router.get("/demo-manifest", (_req: Request, res: Response) => {
  const manifestPath = path.resolve(process.cwd(), "data/processed/DEMO_PARCEL_MANIFEST.json");
  const altPath = path.resolve(process.cwd(), "backend/data/processed/DEMO_PARCEL_MANIFEST.json");

  const targetPath = fs.existsSync(manifestPath) ? manifestPath : altPath;
  if (!fs.existsSync(targetPath)) {
    return res.status(404).json({
      error: "DEMO_PARCEL_MANIFEST_NOT_FOUND",
      message: "No demo parcel manifest has been generated yet."
    });
  }

  const manifest = JSON.parse(fs.readFileSync(targetPath, "utf-8"));
  res.json(manifest);
});

/**
 * GET /internal/storage/health - Internal storage CAS and hidden archive health check
 */
router.get("/internal/storage/health", async (_req: Request, res: Response) => {
  try {
    const health = await storageManager.getHealth();
    // Count objects from DB
    const objCount = db.prepare("SELECT COUNT(*) as c, SUM(size_bytes) as s FROM storage_objects").get() as any;
    health.total_objects = objCount?.c || 0;
    health.total_bytes = objCount?.s || 0;

    res.json(health);
  } catch (err: any) {
    res.status(500).json({ status: "unhealthy", error: err.message });
  }
});

/**
 * GET /internal/ingestion/status - Recent ingestion jobs and ledger status
 */
router.get("/internal/ingestion/status", (_req: Request, res: Response) => {
  try {
    const jobs = db.prepare("SELECT * FROM ingestion_jobs ORDER BY started_at DESC LIMIT 10").all();
    const checkpoints = db.prepare("SELECT * FROM ingestion_checkpoints ORDER BY updated_at DESC LIMIT 10").all();
    const coverage = db.prepare("SELECT * FROM coverage_areas").all();

    res.json({
      active_jobs: jobs,
      latest_checkpoints: checkpoints,
      coverage_ledger: coverage
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});


/**
 * GET /villages/:state/:village/cadastre - Cadastral FeatureCollection for a village
 */
router.get("/villages/:state/:village/cadastre", (req: Request, res: Response) => {
  const state = String(req.params.state || "");
  const village = String(req.params.village || "");
  const mapData = ParcelQueries.getCadastralMapByVillage(state, village);

  if (!mapData) {
    return res.status(404).json({
      error: {
        code: "CADASTRE_NOT_FOUND",
        message: `Cadastral survey map for village '${village}' in state '${state}' is not available in the current LandSetu corpus.`
      },
      coverage_status: "unsupported_in_corpus"
    });
  }

  res.json({
    map_id: mapData.map_id,
    state: mapData.state,
    district: mapData.district,
    tehsil: mapData.tehsil,
    village: mapData.village,
    survey_year: mapData.survey_year,
    source_id: mapData.source_id,
    checksum_sha256: mapData.checksum_sha256,
    feature_count: mapData.feature_count,
    geojson: mapData.cadastral_layer_json
  });
});

/**
 * GET /villages/:state/:village/khatauni - Complete official Village Khatauni (Record of Rights Register)
 */
router.get("/villages/:state/:village/khatauni", (req: Request, res: Response) => {
  const state = String(req.params.state || "");
  const village = String(req.params.village || "");
  const khatauniData = ParcelQueries.getVillageKhatauni(state, village);

  if (!khatauniData) {
    return res.status(404).json({
      error: {
        code: "KHATAUNI_NOT_FOUND",
        message: `Official Khatauni (RoR) for village '${village}' in state '${state}' is not found.`
      }
    });
  }

  res.json(khatauniData);
});

/**
 * POST /resolve - Central multi-identifier parcel resolver
 */
router.post("/resolve", (req: Request, res: Response) => {
  const { query, khasra, khata, khatauni, khewat, owner_name, state, district, tehsil, village, allow_fuzzy } = req.body;
  const result = ParcelResolver.resolve({
    query,
    khasra,
    khata,
    khatauni,
    khewat,
    owner_name,
    state,
    district,
    tehsil,
    village,
    allow_fuzzy: Boolean(allow_fuzzy)
  });

  res.json(result);
});

/**
 * GET /parcels/:parcelUid - Get normalized parcel details
 */
router.get("/parcels/:parcelUid", (req: Request, res: Response) => {
  const parcelUid = decodeURIComponent(String(req.params.parcelUid || ""));
  const parcel = ParcelQueries.getParcelByUid(parcelUid);

  if (!parcel) {
    return res.status(404).json({
      error: {
        code: "PARCEL_NOT_FOUND",
        message: `Parcel '${parcelUid}' was not found in the ingested land records.`
      }
    });
  }

  const rights = ParcelQueries.getRightsByParcelUid(parcelUid);
  const geometry = ParcelQueries.getGeometryByParcelUid(parcelUid);
  const mutations = ParcelQueries.getMutationsByParcelUid(parcelUid);

  res.json({
    parcel,
    recorded_rights: rights,
    geometry: geometry ? {
      geometry_id: geometry.geometry_id,
      centroid: [geometry.centroid_lng, geometry.centroid_lat],
      geojson: geometry.geojson,
      bbox: geometry.bbox_json
    } : null,
    mutations
  });
});

/**
 * GET /parcels/:parcelUid/evidence - Get full evidence bundle
 */
router.get("/parcels/:parcelUid/evidence", (req: Request, res: Response) => {
  const parcelUid = decodeURIComponent(String(req.params.parcelUid || ""));
  const bundle = ParcelEvidenceService.buildBundle(parcelUid);

  if (!bundle) {
    return res.status(404).json({
      error: {
        code: "EVIDENCE_NOT_FOUND",
        message: `No evidence bundle found for parcel '${parcelUid}'.`
      }
    });
  }

  res.json(bundle);
});

/**
 * POST /research/query - Aggregate research queries across parcels
 */
router.post("/research/query", (req: Request, res: Response) => {
  const { state, district, village } = req.body;
  const results = ParcelQueries.runResearchQuery({ state, district, village });

  res.json({
    query_params: { state, district, village },
    aggregates: results,
    count: results.length,
    citation: "Derived from verified LandSetu normalized land parcels and mutation records."
  });
});

/**
 * GET /export - Export research data in GeoJSON or CSV format
 */
router.get("/export", (req: Request, res: Response) => {
  const { state, village, format = "json" } = req.query;
  const parcels = ParcelQueries.getParcelsByVillage(String(state || ""), String(village || ""));

  if (format === "csv") {
    const headers = "parcel_uid,state,district,tehsil,village,native_identifier,area_hectares,land_use,source_id\n";
    const rows = parcels.map(p =>
      `"${p.parcel_uid}","${p.state}","${p.district}","${p.tehsil}","${p.village}","${p.native_identifier}",${p.area},"${p.land_use}","${p.source_id}"`
    ).join("\n");

    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", `attachment; filename="landsetu_export_${state}_${village}.csv"`);
    return res.send(headers + rows);
  }

  res.json({
    export_metadata: {
      state,
      village,
      record_count: parcels.length,
      exported_at: new Date().toISOString(),
      provenance_policy: "Cryptographically hashed official slices only"
    },
    parcels
  });
});

export default router;
