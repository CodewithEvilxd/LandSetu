import { Router, Request, Response } from "express";
import { db } from "../../db/database.js";

const router = Router();

router.get("/overview", (_req: Request, res: Response) => {
  const sourcesCount = (db.prepare("SELECT COUNT(*) as c FROM sources").get() as any).c;
  const docsCount = (db.prepare("SELECT COUNT(*) as c FROM documents").get() as any).c;
  const datasetsCount = (db.prepare("SELECT COUNT(*) as c FROM datasets").get() as any).c;
  const layersCount = (db.prepare("SELECT COUNT(*) as c FROM map_layers").get() as any).c;
  const recordsCount = (db.prepare("SELECT COUNT(*) as c FROM land_records").get() as any).c;
  const acqCount = (db.prepare("SELECT COUNT(*) as c FROM acquisition_projects").get() as any).c;
  const highRiskCount = (db.prepare("SELECT COUNT(*) as c FROM acquisition_projects WHERE risk_category = 'High'").get() as any).c;
  const auditCount = (db.prepare("SELECT COUNT(*) as c FROM audit_events").get() as any).c;

  // DILRMP dataset sample
  const dilrmpDs = db.prepare("SELECT data_json FROM datasets WHERE dataset_id = 'DATASET-DILRMP-01'").get() as any;
  const dilrmpRecords = dilrmpDs ? JSON.parse(dilrmpDs.data_json) : [];

  // NJDG dataset sample
  const njdgDs = db.prepare("SELECT data_json FROM datasets WHERE dataset_id = 'DATASET-NJDG-02'").get() as any;
  const njdgRecords = njdgDs ? JSON.parse(njdgDs.data_json) : [];

  res.json({
    kpis: {
      verified_sources_count: sourcesCount,
      indexed_documents_count: docsCount,
      datasets_count: datasetsCount,
      gis_layers_count: layersCount,
      legacy_records_digitized: recordsCount,
      acquisition_projects_tracked: acqCount,
      high_delay_risk_projects: highRiskCount,
      tamper_evident_audit_events: auditCount
    },
    dilrmp_national_sample: dilrmpRecords.slice(0, 5),
    njdg_disputes_sample: njdgRecords.slice(0, 5),
    data_freshness_note: "Derived from verified official datasets with stored SHA-256 fingerprints.",
    as_of: new Date().toISOString()
  });
});

export default router;
