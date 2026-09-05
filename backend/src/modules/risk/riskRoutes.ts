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
    return res.json(result);
  } catch (err: any) {
    console.warn("[RiskRoutes] AI microservice unavailable or timed out, executing deterministic RFCTLARR model fallback:", err.message);
    const statMonths = Number(statutory_months || 12);
    const compAssessed = Number(compensation_assessed_crores || 1);
    const compDisbursed = Number(compensation_disbursed_crores || 0);
    const compRatio = compDisbursed / Math.max(compAssessed, 0.01);
    const litCount = Number(litigation_cases_count || 0);
    const rrRatio = Number(rr_settled_ratio !== undefined ? rr_settled_ratio : 0.8);

    let score = Math.min(100, Math.max(5,
      (statMonths > 12 ? (statMonths - 12) * 3.5 : 0) +
      (compRatio < 0.7 ? (0.7 - compRatio) * 60 : 0) +
      (litCount * 2.5) +
      (rrRatio < 0.8 ? (0.8 - rrRatio) * 40 : 0) +
      25
    ));
    score = Math.round(score * 10) / 10;
    const category = score >= 70 ? "High" : (score >= 40 ? "Medium" : "Low");
    const prob = Math.round(Math.min(0.99, Math.max(0.05, score / 100)) * 100) / 100;

    return res.json({
      risk_score: score,
      risk_category: category,
      probability_of_delay: prob,
      model_version: "RFCTLARR-2013-Statutory-Baseline-Engine-v1.2",
      delay_drivers: [
        {
          driver: "Statutory Duration vs Section 25 Timeline",
          impact_pct: Math.round(Math.min(65, statMonths > 12 ? (statMonths / 24) * 55 : 20)),
          severity: statMonths > 24 ? "CRITICAL" : (statMonths > 14 ? "HIGH" : "MEDIUM"),
          details: `${statMonths} months elapsed against statutory award benchmark.`
        },
        {
          driver: "Compensation Disbursement Ratio",
          impact_pct: Math.round((1 - Math.min(1, compRatio)) * 30),
          severity: compRatio < 0.5 ? "HIGH" : "LOW",
          details: `Disbursement ratio at ${(compRatio * 100).toFixed(1)}%.`
        },
        {
          driver: "Judicial Litigation Exposure",
          impact_pct: Math.round(Math.min(30, litCount * 3)),
          severity: litCount > 10 ? "HIGH" : "LOW",
          details: `${litCount} active court or tribunal challenges pending.`
        }
      ],
      actionable_recommendations: [
        "Fast-track Section 23 Award declaration before statutory 12-month limit expires.",
        "Accelerate electronic escrow disbursement to land losers under Section 77.",
        "Refer boundary and title disputes to the Land Acquisition, Rehabilitation and Resettlement Authority (LARR Authority) under Section 64."
      ]
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
