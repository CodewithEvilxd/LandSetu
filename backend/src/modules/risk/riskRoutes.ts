import { Router, Request, Response } from "express";
import * as fs from "node:fs";
import * as path from "node:path";
import { db } from "../../db/database.js";
import { aiClient } from "../../services/aiClient.js";

const router = Router();

router.get("/projects", (_req: Request, res: Response) => {
  const rows = db.prepare("SELECT project_id, project_name, project_category, state, district, risk_category, risk_score, delay_months, delay_drivers_json, coordinates_json FROM acquisition_projects ORDER BY risk_score DESC").all() as any[];
  const formatted = rows.map(r => ({
    ...r,
    coordinates: JSON.parse(r.coordinates_json || "{}"),
    delay_drivers: JSON.parse(r.delay_drivers_json || "[]")
  }));
  res.json({ projects: formatted, count: formatted.length });
});

router.get("/projects/:id", (req: Request, res: Response) => {
  const id = String(req.params.id);
  const p = db.prepare("SELECT * FROM acquisition_projects WHERE project_id = ?").get(id) as any;
  if (!p) {
    return res.status(404).json({
      error: { code: "PROJECT_NOT_FOUND", message: `Project '${id}' not found.` }
    });
  }

  res.json({
    project: {
      ...p,
      coordinates: JSON.parse(p.coordinates_json || "{}"),
      delay_drivers: JSON.parse(p.delay_drivers_json || "[]")
    }
  });
});

router.post("/predict", async (req: Request, res: Response) => {
  const {
    land_area_hectares, affected_families, compensation_assessed_crores,
    compensation_disbursed_crores, litigation_cases_count, statutory_months,
    rr_settled_ratio, is_linear_project, state
  } = req.body;

  if (land_area_hectares === undefined || compensation_assessed_crores === undefined) {
    return res.status(400).json({
      error: { code: "MISSING_INPUTS", message: "land_area_hectares and compensation_assessed_crores are required." }
    });
  }

  try {
    const result = await aiClient.predictRisk({
      land_area_hectares: Number(land_area_hectares),
      affected_families: Number(affected_families || 100),
      compensation_assessed_crores: Number(compensation_assessed_crores),
      compensation_disbursed_crores: Number(compensation_disbursed_crores || 0),
      litigation_cases_count: Number(litigation_cases_count || 0),
      statutory_months: Number(statutory_months || 12),
      rr_settled_ratio: Number(rr_settled_ratio !== undefined ? rr_settled_ratio : 0.8),
      is_linear_project: is_linear_project !== false,
      state: state || ""
    });
    res.json(result);
  } catch (err: any) {
    res.status(503).json({
      error: {
        code: "AI_SERVICE_UNAVAILABLE",
        message: err.message || "Failed to reach AI Predictive Risk service."
      }
    });
  }
});

router.get("/model-metrics", (_req: Request, res: Response) => {
  const possiblePaths = [
    path.resolve(process.cwd(), "data/models/model_metrics.json"),
    path.resolve(process.cwd(), "../ai/evaluation/model_metrics.json"),
    path.resolve(process.cwd(), "ai/evaluation/model_metrics.json"),
    path.resolve(process.cwd(), "../backend/data/models/model_metrics.json")
  ];

  for (const p of possiblePaths) {
    if (fs.existsSync(p)) {
      const data = JSON.parse(fs.readFileSync(p, "utf-8"));
      return res.json(data);
    }
  }

  res.status(404).json({
    error: {
      code: "METRICS_NOT_FOUND",
      message: "Trained model metrics file not found. Please execute `python ai/train.py`."
    }
  });
});

export default router;
