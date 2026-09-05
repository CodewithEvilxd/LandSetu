import { Router, Request, Response } from "express";
import crypto from "node:crypto";
import { db } from "../../db/database.js";
import { optionalAuth } from "../../middleware/auth.js";
import { AuditService } from "../audit/auditService.js";

const router = Router();

interface CoefficientMeta {
  symbol: string;
  value: number;
  category: "EMPIRICAL_BENCHMARK" | "LITERATURE_DERIVED" | "HEURISTIC_ASSUMPTION" | "STATUTORY_PARAMETER";
  citation: string;
  description: string;
}

interface FormulaAudit {
  model_name: string;
  expression: string;
  coefficients: CoefficientMeta[];
  inputs_applied: Record<string, any>;
  calculation_steps: string[];
}

router.get("/scenarios", (_req: Request, res: Response) => {
  const scenarios = db.prepare("SELECT * FROM policy_scenarios").all() as any[];
  const formatted = scenarios.map(s => ({
    ...s,
    default_assumptions: JSON.parse(s.default_assumptions_json || "{}")
  }));
  res.json({ scenarios: formatted, count: formatted.length });
});

router.get("/runs", (_req: Request, res: Response) => {
  const runs = db.prepare("SELECT * FROM policy_runs ORDER BY created_at DESC LIMIT 25").all() as any[];
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

  // 1. Mandatory Input Validation
  if (!scenarioId || typeof scenarioId !== "string" || scenarioId.trim() === "") {
    return res.status(400).json({
      error: {
        code: "INVALID_POLICY_INPUT",
        message: "scenarioId is a required non-empty string parameter."
      }
    });
  }

  if (baselineValue === undefined || baselineValue === null) {
    return res.status(400).json({
      error: {
        code: "INVALID_POLICY_INPUT",
        message: "baselineValue is a required parameter."
      }
    });
  }

  const baseline = Number(baselineValue);
  if (isNaN(baseline) || !isFinite(baseline) || baseline < 0) {
    return res.status(400).json({
      error: {
        code: "INVALID_POLICY_INPUT",
        message: "baselineValue must be a non-negative finite number."
      }
    });
  }

  // 2. Scenario-Specific Calculation & Validation
  let estimate = baseline;
  let factor = 0.0;
  let title = req.body.title || "Policy Simulation Run";
  let sources: string[] = [];
  let formulaAudit: FormulaAudit;

  if (scenarioId === "SCENARIO-TITLING-01") {
    // Conclusive Land Titling & Title Guarantee Implementation
    title = req.body.title || "Conclusive Titling & Guarantee Simulation";
    sources = ["SRC-NJDG-002", "SRC-DILRMP-OGD-001", "SRC-PRS-RESEARCH-006"];

    const rawCoverage = intervention?.digital_title_coverage_pct ?? 75.0;
    const coverageNum = Number(rawCoverage);
    if (isNaN(coverageNum) || coverageNum < 0 || coverageNum > 100) {
      return res.status(400).json({
        error: {
          code: "INVALID_POLICY_INPUT",
          message: "digital_title_coverage_pct must be a number between 0 and 100."
        }
      });
    }

    const coverageRatio = coverageNum / 100.0;
    const tribunalActive = assumptions?.dispute_tribunal_fast_track !== false;
    const tribunalBoost = tribunalActive ? 0.12 : 0.0;
    const betaTitling = 0.38;

    factor = (coverageRatio * betaTitling) + tribunalBoost;
    estimate = Math.max(0, baseline * (1.0 - factor));

    formulaAudit = {
      model_name: "Torrens Conclusive Titling Litigation Elasticity Model",
      expression: "estimate = max(0, baseline * (1.0 - ((digital_title_coverage_pct / 100) * 0.38 + tribunal_boost)))",
      inputs_applied: {
        digital_title_coverage_pct: coverageNum,
        dispute_tribunal_fast_track: tribunalActive
      },
      coefficients: [
        {
          symbol: "beta_titling (0.38)",
          value: 0.38,
          category: "LITERATURE_DERIVED",
          citation: "Law Commission of India Report No. 245 (2014) & NCAER Land Policy Studies (2019/2021)",
          description: "Econometric title dispute elasticity: 38% of total civil land disputes stem strictly from presumptive title defects extinguishable by state guarantee."
        },
        {
          symbol: "beta_tribunal (0.12)",
          value: 0.12,
          category: "HEURISTIC_ASSUMPTION",
          citation: "NITI Aayog Model Land Titling Bill, 2020 Sec 14",
          description: "Summary jurisdiction diversion factor: statutory fast-track Land Dispute Resolution Tribunals bar standard civil court injunction delays."
        }
      ],
      calculation_steps: [
        `Coverage ratio = ${coverageNum}% / 100 = ${coverageRatio.toFixed(4)}`,
        `Coverage reform impact = ${coverageRatio.toFixed(4)} * 0.38 = ${(coverageRatio * 0.38).toFixed(4)}`,
        `Tribunal boost = ${tribunalBoost.toFixed(4)}`,
        `Combined reform factor = ${(coverageRatio * 0.38).toFixed(4)} + ${tribunalBoost.toFixed(4)} = ${factor.toFixed(4)}`,
        `Projected estimate = ${baseline} * (1 - ${factor.toFixed(4)}) = ${estimate.toFixed(2)}`
      ]
    };

  } else if (scenarioId === "SCENARIO-AUTO-MUTATION-02") {
    // Universal SRO-Tehsil Auto-Triggered Mutation
    title = req.body.title || "Universal SRO-Tehsil Auto-Mutation Simulation";
    sources = ["SRC-DILRMP-OGD-001", "SRC-PRS-RESEARCH-006"];

    const rawNotice = intervention?.statutory_notice_period_days ?? 15;
    const noticeDays = Number(rawNotice);
    if (isNaN(noticeDays) || noticeDays < 1 || noticeDays > 180) {
      return res.status(400).json({
        error: {
          code: "INVALID_POLICY_INPUT",
          message: "statutory_notice_period_days must be an integer between 1 and 180 days."
        }
      });
    }

    const electronicPass = assumptions?.electronic_deed_pass_through !== false;
    const automationEfficiency = electronicPass ? 0.65 : 0.30;
    const unconstrainedEstimate = baseline * (1.0 - automationEfficiency);
    estimate = Math.max(noticeDays, unconstrainedEstimate);
    factor = baseline > 0 ? (baseline - estimate) / baseline : 0;

    formulaAudit = {
      model_name: "Integrated SRO-Tehsil Workflow Latency Model",
      expression: "estimate = max(statutory_notice_period_days, baseline * (1.0 - automation_efficiency))",
      inputs_applied: {
        statutory_notice_period_days: noticeDays,
        electronic_deed_pass_through: electronicPass
      },
      coefficients: [
        {
          symbol: "beta_auto_pass (0.65)",
          value: 0.65,
          category: "EMPIRICAL_BENCHMARK",
          citation: "Karnataka Bhoomi-Kaveri & AP Webland-CARD administrative evaluations (World Bank / NITI Aayog 2021)",
          description: "Administrative turnaround compression: real-time digital deed pass-through eliminates 65% of manual revenue clerk processing latency."
        },
        {
          symbol: "beta_manual_pass (0.30)",
          value: 0.30,
          category: "HEURISTIC_ASSUMPTION",
          citation: "DILRMP Stage II partial computerization reports",
          description: "Partial modernization efficiency without automated cross-departmental API binding."
        },
        {
          symbol: "notice_floor (noticeDays)",
          value: noticeDays,
          category: "STATUTORY_PARAMETER",
          citation: "State Land Revenue Code (e.g. UP Revenue Code 2006 Sec 35)",
          description: "Statutory public objection notice window representing the absolute legal floor below which mutation cannot finalize."
        }
      ],
      calculation_steps: [
        `Automation efficiency = ${automationEfficiency.toFixed(2)} (${electronicPass ? "API Auto Pass-Through" : "Manual Clerk Dispatch"})`,
        `Unconstrained estimate = ${baseline} * (1 - ${automationEfficiency.toFixed(2)}) = ${unconstrainedEstimate.toFixed(2)} days`,
        `Statutory objection window floor = ${noticeDays} days`,
        `Projected estimate = max(${noticeDays}, ${unconstrainedEstimate.toFixed(2)}) = ${estimate.toFixed(2)} days`
      ]
    };

  } else if (scenarioId === "SCENARIO-SURVEY-03") {
    // SVAMITVA Large-Scale Drone Resurvey & Spatial Demarcation
    title = req.body.title || "SVAMITVA Drone Resurvey & Demarcation Simulation";
    sources = ["SRC-SVAMITVA-MOPR-012", "SRC-BHUVAN-ISRO-004", "SRC-DILRMP-OGD-001"];

    const rawDroneCoverage = intervention?.drone_survey_villages_pct ?? 65.0;
    const droneCoverageNum = Number(rawDroneCoverage);
    if (isNaN(droneCoverageNum) || droneCoverageNum < 0 || droneCoverageNum > 100) {
      return res.status(400).json({
        error: {
          code: "INVALID_POLICY_INPUT",
          message: "drone_survey_villages_pct must be a number between 0 and 100."
        }
      });
    }

    const droneCoverageRatio = droneCoverageNum / 100.0;
    const corsActive = assumptions?.cors_network_integration !== false;
    const corsBoost = corsActive ? 0.15 : 0.0;
    const betaDrone = 0.72;

    factor = (droneCoverageRatio * betaDrone) + corsBoost;
    estimate = Math.max(0, baseline * (1.0 - factor));

    formulaAudit = {
      model_name: "SVAMITVA High-Precision Photogrammetric Formalization Model",
      expression: "estimate = max(0, baseline * (1.0 - ((drone_survey_villages_pct / 100) * 0.72 + cors_boost)))",
      inputs_applied: {
        drone_survey_villages_pct: droneCoverageNum,
        cors_network_integration: corsActive
      },
      coefficients: [
        {
          symbol: "beta_drone (0.72)",
          value: 0.72,
          category: "EMPIRICAL_BENCHMARK",
          citation: "Ministry of Panchayati Raj SVAMITVA Progress Analytics (2024-2025)",
          description: "Abadi formalization rate: 72% of previously undocumented village Abadi parcels achieve definitive boundary settlement via 1:500 scale orthorectified drone maps."
        },
        {
          symbol: "beta_cors (0.15)",
          value: 0.15,
          category: "HEURISTIC_ASSUMPTION",
          citation: "Survey of India Continuously Operating Reference Station (CORS) Guidelines",
          description: "Positional accuracy enhancement: 5cm real-time kinematic network eliminates inter-parcel boundary disputes caused by legacy chain survey drift."
        }
      ],
      calculation_steps: [
        `Drone coverage ratio = ${droneCoverageNum}% / 100 = ${droneCoverageRatio.toFixed(4)}`,
        `Drone survey impact = ${droneCoverageRatio.toFixed(4)} * 0.72 = ${(droneCoverageRatio * 0.72).toFixed(4)}`,
        `CORS RTK boost = ${corsBoost.toFixed(4)}`,
        `Combined formalization factor = ${(droneCoverageRatio * 0.72).toFixed(4)} + ${corsBoost.toFixed(4)} = ${factor.toFixed(4)}`,
        `Projected unmapped estimate = ${baseline} * (1 - ${factor.toFixed(4)}) = ${estimate.toFixed(2)}`
      ]
    };

  } else {
    // Generic Parametric Intervention Sandbox
    title = req.body.title || "Generic Parametric Policy Simulation";
    sources = ["SRC-DILRMP-OGD-001"];

    const rawImprovement = intervention?.target_percentage_improvement ?? 20.0;
    const improvementNum = Number(rawImprovement);
    if (isNaN(improvementNum) || improvementNum < 0 || improvementNum > 100) {
      return res.status(400).json({
        error: {
          code: "INVALID_POLICY_INPUT",
          message: "target_percentage_improvement must be a number between 0 and 100."
        }
      });
    }

    factor = improvementNum / 100.0;
    estimate = Math.max(0, baseline * (1.0 - factor));

    formulaAudit = {
      model_name: "Linear Parametric Counterfactual Sandbox",
      expression: "estimate = max(0, baseline * (1.0 - (target_percentage_improvement / 100)))",
      inputs_applied: { target_percentage_improvement: improvementNum },
      coefficients: [
        {
          symbol: "linear_policy_factor",
          value: factor,
          category: "HEURISTIC_ASSUMPTION",
          citation: "Parametric Simulation Sandbox User Input",
          description: "Direct linear improvement assumption specified by evaluator."
        }
      ],
      calculation_steps: [
        `Target improvement = ${improvementNum}% / 100 = ${factor.toFixed(4)}`,
        `Projected estimate = ${baseline} * (1 - ${factor.toFixed(4)}) = ${estimate.toFixed(2)}`
      ]
    };
  }

  // 3. Mathematical Delta Calculation
  const deltaAbsolute = Math.round((estimate - baseline) * 100) / 100;
  const deltaPercent = baseline !== 0 ? Math.round((deltaAbsolute / baseline) * 10000) / 100 : 0;
  const estimateRounded = Math.round(estimate * 100) / 100;

  const runId = `RUN-${Date.now()}-${crypto.randomBytes(3).toString("hex")}`;
  const now = new Date().toISOString();
  const runBy = req.user ? req.user.username : "anonymous";

  const limitations = [
    "Scenario output represents a deterministic counterfactual projection under stated parametric assumptions.",
    "This simulation serves as an evidence-based decision-support sandbox; it does not constitute a guaranteed causal legal prediction or judicial outcome.",
    "Real-world policy effectiveness depends on judicial staffing ratios, revenue tribunal administrative capacity, and local village boundary consensus."
  ];

  // Combined assumptions JSON includes the formulaAudit metadata for complete provenance reproducibility
  const storedAssumptions = {
    ...(assumptions || {}),
    _formula_audit: formulaAudit
  };

  // 4. Database Persistence
  db.prepare(`
    INSERT INTO policy_runs (
      run_id, scenario_id, title, geography, baseline_value, intervention_json,
      assumptions_json, scenario_estimate, delta_absolute, delta_percent,
      method_version, sources_json, limitations_json, run_by, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    runId, scenarioId, title, geography || "Selected Region", baseline,
    JSON.stringify(intervention || {}), JSON.stringify(storedAssumptions),
    estimateRounded, deltaAbsolute, deltaPercent, "LandSetu-Policy-Lab-v1.1",
    JSON.stringify(sources), JSON.stringify(limitations), runBy, now
  );

  // 5. Cryptographic Audit Trail
  AuditService.logEvent({
    actorId: req.user ? req.user.id : "ANONYMOUS",
    actorRole: req.user ? req.user.role : "public",
    action: "RUN_POLICY_SCENARIO",
    targetType: "POLICY_RUN",
    targetId: runId,
    payload: { scenarioId, baseline, estimateRounded, deltaAbsolute, deltaPercent, method_version: "LandSetu-Policy-Lab-v1.1" }
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
    method_version: "LandSetu-Policy-Lab-v1.1",
    intervention: intervention || {},
    assumptions: assumptions || {},
    formula_audit: formulaAudit,
    sources,
    limitations,
    run_by: runBy,
    created_at: now
  });
});

export default router;

