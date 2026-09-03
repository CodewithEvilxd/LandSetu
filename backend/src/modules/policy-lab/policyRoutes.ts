import { Router, Request, Response } from "express";
import crypto from "node:crypto";
import { db } from "../../db/database.js";
import { optionalAuth } from "../../middleware/auth.js";
import { AuditService } from "../audit/auditService.js";

const router = Router();

router.get("/scenarios", (_req: Request, res: Response) => {
  const scenarios = db.prepare("SELECT * FROM policy_scenarios").all() as any[];
  const formatted = scenarios.map(s => ({
    ...s,
    default_assumptions: JSON.parse(s.default_assumptions_json || "{}")
  }));
  res.json({ scenarios: formatted, count: formatted.length });
});

router.get("/runs", (_req: Request, res: Response) => {
  const runs = db.prepare("SELECT * FROM policy_runs ORDER BY created_at DESC LIMIT 20").all() as any[];
  const formatted = runs.map(r => ({
    ...r,
    intervention: JSON.parse(r.intervention_json || "{}"),
    assumptions: JSON.parse(r.assumptions_json || "{}"),
    sources: JSON.parse(r.sources_json || "[]"),
    limitations: JSON.parse(r.limitations_json || "[]")
  }));
  res.json({ runs: formatted, count: formatted.length });
});

router.post("/run", optionalAuth, (req: Request, res: Response) => {
  const { scenarioId, geography, baselineValue, intervention, assumptions } = req.body;

  if (!scenarioId || baselineValue === undefined || baselineValue === null) {
    return res.status(400).json({
      error: {
        code: "INVALID_POLICY_INPUT",
        message: "scenarioId and baselineValue are required parameters."
      }
    });
  }

  const baseline = Number(baselineValue);
  const title = req.body.title || "Policy Simulation Run";

  // Deterministic calculation logic based on scenario
  let estimate = baseline;
  let factor = 0.0;

  if (scenarioId === "SCENARIO-TITLING-01") {
    // Conclusive titling simulation
    const coverage = Number(intervention?.digital_title_coverage_pct || 75.0) / 100;
    const tribunalBoost = assumptions?.dispute_tribunal_fast_track ? 0.12 : 0.0;
    factor = (coverage * 0.38) + tribunalBoost;
    estimate = Math.max(0, baseline * (1.0 - factor));
  } else if (scenarioId === "SCENARIO-AUTO-MUTATION-02") {
    // Auto mutation simulation (days reduced)
    const noticeDays = Number(intervention?.statutory_notice_period_days || 15);
    const electronicPass = assumptions?.electronic_deed_pass_through ? 0.65 : 0.30;
    estimate = Math.max(noticeDays, baseline * (1.0 - electronicPass));
    factor = (baseline - estimate) / baseline;
  } else {
    // Generic parametric intervention
    const pctChange = Number(intervention?.target_percentage_improvement || 20.0) / 100;
    factor = pctChange;
    estimate = Math.max(0, baseline * (1.0 - factor));
  }

  const deltaAbsolute = Math.round((estimate - baseline) * 100) / 100;
  const deltaPercent = baseline !== 0 ? Math.round((deltaAbsolute / baseline) * 10000) / 100 : 0;
  const estimateRounded = Math.round(estimate * 100) / 100;

  const runId = `RUN-${Date.now()}-${crypto.randomBytes(3).toString("hex")}`;
  const now = new Date().toISOString();
  const runBy = req.user ? req.user.username : "anonymous";

  const sources = ["SRC-NJDG-002", "SRC-DILRMP-OGD-001", "SRC-PRS-RESEARCH-006"];
  const limitations = [
    "Scenario output represents a deterministic estimate under stated assumptions.",
    "This simulation is a decision-support sandbox; it does not constitute a guaranteed causal impact.",
    "Ground factors such as judicial staffing and local land records backlog apply."
  ];

  db.prepare(`
    INSERT INTO policy_runs (
      run_id, scenario_id, title, geography, baseline_value, intervention_json,
      assumptions_json, scenario_estimate, delta_absolute, delta_percent,
      method_version, sources_json, limitations_json, run_by, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    runId, scenarioId, title, geography || "Selected Region", baseline,
    JSON.stringify(intervention || {}), JSON.stringify(assumptions || {}),
    estimateRounded, deltaAbsolute, deltaPercent, "LandSetu-Policy-Lab-v1.0",
    JSON.stringify(sources), JSON.stringify(limitations), runBy, now
  );

  AuditService.logEvent({
    actorId: req.user ? req.user.id : "ANONYMOUS",
    actorRole: req.user ? req.user.role : "public",
    action: "RUN_POLICY_SCENARIO",
    targetType: "POLICY_RUN",
    targetId: runId,
    payload: { scenarioId, baseline, estimateRounded, deltaAbsolute, deltaPercent }
  });

  res.json({
    run_id: runId,
    scenario_id: scenarioId,
    title,
    geography: geography || "Selected Region",
    baseline_value: baseline,
    scenario_estimate: estimateRounded,
    delta_absolute: deltaAbsolute,
    delta_percent: deltaPercent,
    method_version: "LandSetu-Policy-Lab-v1.0",
    intervention: intervention || {},
    assumptions: assumptions || {},
    sources,
    limitations,
    run_by: runBy,
    created_at: now
  });
});

export default router;
