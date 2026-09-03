import { Router, Request, Response } from "express";
import { db } from "../../db/database.js";
import { requireAuth, requireRole } from "../../middleware/auth.js";
import { AuditService } from "../audit/auditService.js";

const router = Router();

router.get("/", (req: Request, res: Response) => {
  const { state, category, stage, risk } = req.query;
  let sql = "SELECT * FROM acquisition_projects WHERE 1=1";
  const params: any[] = [];

  if (state) {
    sql += " AND state = ?";
    params.push(state);
  }
  if (category) {
    sql += " AND project_category LIKE ?";
    params.push(`%${category}%`);
  }
  if (stage) {
    sql += " AND lifecycle_stage = ?";
    params.push(stage);
  }
  if (risk) {
    sql += " AND risk_category = ?";
    params.push(risk);
  }

  sql += " ORDER BY risk_score DESC";
  const rows = db.prepare(sql).all(...params) as any[];
  const formatted = rows.map(r => ({
    ...r,
    coordinates: JSON.parse(r.coordinates_json || "{}"),
    delay_drivers: JSON.parse(r.delay_drivers_json || "[]")
  }));

  res.json({ projects: formatted, count: formatted.length });
});

router.get("/alerts", (_req: Request, res: Response) => {
  const allProjects = db.prepare("SELECT * FROM acquisition_projects").all() as any[];
  const alerts: any[] = [];

  for (const p of allProjects) {
    if (p.disbursement_pct < 75.0) {
      alerts.push({
        project_id: p.project_id,
        project_name: p.project_name,
        type: "COMPENSATION_BACKLOG",
        severity: p.disbursement_pct < 60.0 ? "CRITICAL" : "HIGH",
        message: `Disbursement rate at ${p.disbursement_pct.toFixed(1)}%. Pending backlog of ₹${(p.compensation_assessed_crores - p.compensation_disbursed_crores).toFixed(1)} Cr.`
      });
    }
    if (p.delay_months > 12.0) {
      alerts.push({
        project_id: p.project_id,
        project_name: p.project_name,
        type: "STATUTORY_LAPSE_WARNING",
        severity: "CRITICAL",
        message: `Project delayed by ${p.delay_months} months. Risk of Section 23 LARR Act statutory lapse.`
      });
    }
    if (p.litigation_cases_count > 15) {
      alerts.push({
        project_id: p.project_id,
        project_name: p.project_name,
        type: "HEAVY_LITIGATION",
        severity: "HIGH",
        message: `${p.litigation_cases_count} active court litigations impacting parcel possession.`
      });
    }
  }

  res.json({ alerts, count: alerts.length });
});

router.get("/:id", (req: Request, res: Response) => {
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

router.post("/:id/milestone", requireAuth, requireRole(["official", "admin"]), (req: Request, res: Response) => {
  const id = String(req.params.id);
  const { current_status, lifecycle_stage, possession_date } = req.body;
  const p = db.prepare("SELECT * FROM acquisition_projects WHERE project_id = ?").get(id) as any;
  if (!p) {
    return res.status(404).json({
      error: { code: "PROJECT_NOT_FOUND", message: `Project '${id}' not found.` }
    });
  }

  db.prepare(`
    UPDATE acquisition_projects
    SET current_status = COALESCE(?, current_status),
        lifecycle_stage = COALESCE(?, lifecycle_stage),
        possession_date = COALESCE(?, possession_date)
    WHERE project_id = ?
  `).run(current_status, lifecycle_stage, possession_date, id);

  AuditService.logEvent({
    actorId: req.user!.id,
    actorRole: req.user!.role,
    action: "UPDATE_ACQUISITION_MILESTONE",
    targetType: "ACQUISITION_PROJECT",
    targetId: id,
    payload: { current_status, lifecycle_stage, possession_date, updated_by: req.user!.username }
  });

  res.json({
    message: `Milestone updated for project '${id}'.`,
    project_id: id,
    current_status,
    lifecycle_stage
  });
});

export default router;
