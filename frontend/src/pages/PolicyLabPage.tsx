import React, { useEffect, useState } from "react";
import { api } from "../api/client.js";
import { PageHeader } from "../components/PageHeader.js";
import { LoadingState } from "../components/LoadingState.js";
import { EmptyState } from "../components/EmptyState.js";
import { 
  FlaskConical, 
  TrendingDown, 
  Play, 
  History, 
  Sliders,
  Scale,
  Zap,
  CheckCircle2,
  FileText,
  ShieldCheck
} from "lucide-react";

export const PolicyLabPage: React.FC = () => {
  const [scenarios, setScenarios] = useState<any[]>([]);
  const [selectedScenarioId, setSelectedScenarioId] = useState<string>("SCENARIO-TITLING-01");
  const [geography, setGeography] = useState<string>("Uttar Pradesh & Bihar");
  const [baselineValue, setBaselineValue] = useState<number>(1250000);
  
  // Scenario 1: Titling Levers
  const [coveragePct, setCoveragePct] = useState<number>(75);
  const [fastTrackTribunal, setFastTrackTribunal] = useState<boolean>(true);

  // Scenario 2: Auto-Mutation Levers
  const [noticePeriodDays, setNoticePeriodDays] = useState<number>(15);
  const [electronicPassThrough, setElectronicPassThrough] = useState<boolean>(true);

  // Scenario 3: SVAMITVA Drone Survey Levers
  const [droneCoveragePct, setDroneCoveragePct] = useState<number>(65);
  const [corsNetwork, setCorsNetwork] = useState<boolean>(true);

  const [currentResult, setCurrentResult] = useState<any>(null);
  const [pastRuns, setPastRuns] = useState<any[]>([]);
  const [running, setRunning] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    Promise.all([
      api.getScenarios(),
      api.getPolicyRuns()
    ]).then(([sRes, rRes]) => {
      const scList = sRes.scenarios || [];
      setScenarios(scList);
      setPastRuns(rRes.runs || []);
      if (scList.length > 0 && !selectedScenarioId) {
        setSelectedScenarioId(scList[0].scenario_id);
      }
    }).catch(err => console.error("Error loading policy lab:", err))
      .finally(() => setLoading(false));
  }, []);

  const handleSelectScenario = (scId: string) => {
    setSelectedScenarioId(scId);
    setCurrentResult(null);
    if (scId === "SCENARIO-TITLING-01") {
      setBaselineValue(1250000);
      setGeography("Uttar Pradesh & Bihar");
    } else if (scId === "SCENARIO-AUTO-MUTATION-02") {
      setBaselineValue(45);
      setGeography("Uttar Pradesh & Bihar");
    } else if (scId === "SCENARIO-SURVEY-03") {
      setBaselineValue(2500000);
      setGeography("National (Rural Gram Panchayats)");
    }
  };

  const handleRunSimulation = async () => {
    setRunning(true);
    try {
      let interventionPayload: Record<string, any> = {};
      let assumptionsPayload: Record<string, any> = {};

      if (selectedScenarioId === "SCENARIO-TITLING-01") {
        interventionPayload = { digital_title_coverage_pct: coveragePct };
        assumptionsPayload = { dispute_tribunal_fast_track: fastTrackTribunal };
      } else if (selectedScenarioId === "SCENARIO-AUTO-MUTATION-02") {
        interventionPayload = { statutory_notice_period_days: noticePeriodDays };
        assumptionsPayload = { electronic_deed_pass_through: electronicPassThrough };
      } else if (selectedScenarioId === "SCENARIO-SURVEY-03") {
        interventionPayload = { drone_survey_villages_pct: droneCoveragePct };
        assumptionsPayload = { cors_network_integration: corsNetwork };
      } else {
        interventionPayload = { target_percentage_improvement: 25 };
      }

      const res = await api.runPolicy({
        scenarioId: selectedScenarioId,
        geography,
        baselineValue: Number(baselineValue),
        intervention: interventionPayload,
        assumptions: assumptionsPayload
      });
      setCurrentResult(res);
      // Refresh past runs
      api.getPolicyRuns().then(r => setPastRuns(r.runs || []));
    } catch (err: any) {
      alert("Policy run failed: " + err.message);
    } finally {
      setRunning(false);
    }
  };

  if (loading) {
    return <LoadingState message="Loading Policy Simulation Sandbox & Calibrated Scenarios..." minHeight={300} />;
  }

  const activeScenario = scenarios.find(s => s.scenario_id === selectedScenarioId) || scenarios[0];

  const getMetricUnit = () => {
    if (selectedScenarioId === "SCENARIO-AUTO-MUTATION-02") return "Days";
    if (selectedScenarioId === "SCENARIO-SURVEY-03") return "Unmapped Parcels";
    return "Pending Cases";
  };

  return (
    <div className="policy-lab-view">
      <PageHeader
        title="Policy Lab: Parametric Scenario Simulation Sandbox"
        subtitle="Evaluate the impact of legal and administrative reforms (conclusive titling, auto-mutation, SVAMITVA drone surveys) with full assumption transparency, verifiable delta, and hash-chain audit."
      />

      <div className="grid-2" style={{ marginBottom: "24px" }}>
        {/* Intervention Parameters Form */}
        <div className="card">
          <div className="card-header">
            <div className="card-title">
              <Sliders size={18} color="var(--sovereign-navy)" />
              <span>Scenario Formulation & Interventions</span>
            </div>
            <span className="badge badge-blue">Deterministic Sandbox</span>
          </div>

          {/* Interactive Visual Scenario Selector Cards */}
          <div style={{ marginBottom: "14px" }}>
            <label className="form-label" style={{ fontWeight: 700, fontSize: "0.78rem", textTransform: "uppercase", fontFamily: "var(--font-tech)", color: "var(--text-muted)" }}>
              Select Reform Policy Intervention:
            </label>
            <div className="scenario-selector-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "8px" }}>
              <div
                className={`scenario-choice-card ${selectedScenarioId === "SCENARIO-TITLING-01" ? "active" : ""}`}
                onClick={() => handleSelectScenario("SCENARIO-TITLING-01")}
                style={{ cursor: "pointer", padding: "10px", borderRadius: "6px", border: selectedScenarioId === "SCENARIO-TITLING-01" ? "2px solid var(--sovereign-navy)" : "1px solid #e2e8f0", background: selectedScenarioId === "SCENARIO-TITLING-01" ? "#f0fdf4" : "#ffffff" }}
              >
                <div className="scenario-choice-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <Scale size={16} color="var(--sovereign-navy)" />
                    <span className="scenario-choice-title" style={{ fontWeight: 700, fontSize: "0.82rem" }}>Conclusive Titling</span>
                  </div>
                  {selectedScenarioId === "SCENARIO-TITLING-01" && (
                    <CheckCircle2 size={14} color="var(--sovereign-navy)" />
                  )}
                </div>
                <div className="scenario-choice-desc" style={{ fontSize: "0.7rem", color: "var(--text-muted)", marginTop: "4px" }}>
                  Model Bill • State guarantee against litigation pendency
                </div>
              </div>

              <div
                className={`scenario-choice-card ${selectedScenarioId === "SCENARIO-AUTO-MUTATION-02" ? "active" : ""}`}
                onClick={() => handleSelectScenario("SCENARIO-AUTO-MUTATION-02")}
                style={{ cursor: "pointer", padding: "10px", borderRadius: "6px", border: selectedScenarioId === "SCENARIO-AUTO-MUTATION-02" ? "2px solid var(--sovereign-navy)" : "1px solid #e2e8f0", background: selectedScenarioId === "SCENARIO-AUTO-MUTATION-02" ? "#f0fdf4" : "#ffffff" }}
              >
                <div className="scenario-choice-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <Zap size={16} color="var(--sovereign-navy)" />
                    <span className="scenario-choice-title" style={{ fontWeight: 700, fontSize: "0.82rem" }}>Auto-Mutation</span>
                  </div>
                  {selectedScenarioId === "SCENARIO-AUTO-MUTATION-02" && (
                    <CheckCircle2 size={14} color="var(--sovereign-navy)" />
                  )}
                </div>
                <div className="scenario-choice-desc" style={{ fontSize: "0.7rem", color: "var(--text-muted)", marginTop: "4px" }}>
                  DILRMP 2.0 • SRO-Tehsil real-time API deed pass-through
                </div>
              </div>

              <div
                className={`scenario-choice-card ${selectedScenarioId === "SCENARIO-SURVEY-03" ? "active" : ""}`}
                onClick={() => handleSelectScenario("SCENARIO-SURVEY-03")}
                style={{ cursor: "pointer", padding: "10px", borderRadius: "6px", border: selectedScenarioId === "SCENARIO-SURVEY-03" ? "2px solid var(--sovereign-navy)" : "1px solid #e2e8f0", background: selectedScenarioId === "SCENARIO-SURVEY-03" ? "#f0fdf4" : "#ffffff" }}
              >
                <div className="scenario-choice-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <ShieldCheck size={16} color="var(--sovereign-navy)" />
                    <span className="scenario-choice-title" style={{ fontWeight: 700, fontSize: "0.82rem" }}>Drone Survey</span>
                  </div>
                  {selectedScenarioId === "SCENARIO-SURVEY-03" && (
                    <CheckCircle2 size={14} color="var(--sovereign-navy)" />
                  )}
                </div>
                <div className="scenario-choice-desc" style={{ fontSize: "0.7rem", color: "var(--text-muted)", marginTop: "4px" }}>
                  SVAMITVA • Drone mapping & CORS RTK formalization
                </div>
              </div>
            </div>
          </div>

          <div style={{ fontSize: "0.82rem", color: "var(--text-secondary)", marginBottom: "16px", padding: "10px 14px", backgroundColor: "#f8fafc", borderRadius: "6px", border: "1px solid #e2e8f0", lineHeight: 1.45 }}>
            <strong>Policy Scope:</strong> {activeScenario?.description}
          </div>

          <div className="grid-2" style={{ marginBottom: "14px" }}>
            <div className="form-group">
              <label className="form-label">Geography / Jurisdiction:</label>
              <input
                type="text"
                className="form-input"
                value={geography}
                onChange={e => setGeography(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                Baseline Metric Value:
              </label>
              <div className="input-addon-group">
                <input
                  type="number"
                  value={baselineValue}
                  min="0"
                  onChange={e => setBaselineValue(Math.max(0, Number(e.target.value)))}
                />
                <span className="input-addon-suffix">
                  {getMetricUnit()}
                </span>
              </div>
              <span style={{ fontSize: "0.7rem", color: "var(--text-muted)", display: "block", marginTop: "4px" }}>
                {activeScenario?.baseline_metric || "Baseline metric calibration"}
              </span>
            </div>
          </div>

          {/* DYNAMIC SCENARIO 1 FORM: Conclusive Titling */}
          {selectedScenarioId === "SCENARIO-TITLING-01" && (
            <>
              <div className="form-group" style={{ marginBottom: "16px" }}>
                <label className="form-label" style={{ display: "flex", justifyContent: "space-between" }}>
                  <span>Target Digital Title Coverage (ULPIN Integrated):</span>
                  <span style={{ fontFamily: "var(--font-mono)", fontWeight: 700, color: "var(--sovereign-navy)" }}>{coveragePct}%</span>
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="5"
                  value={coveragePct}
                  onChange={e => setCoveragePct(Number(e.target.value))}
                  style={{ width: "100%", accentColor: "var(--sovereign-navy)" }}
                />
              </div>

              <div style={{ padding: "10px 12px", backgroundColor: "#f8fafc", borderRadius: "6px", border: "1px solid #e2e8f0", marginBottom: "18px" }}>
                <label style={{ display: "flex", alignItems: "flex-start", gap: "10px", cursor: "pointer" }}>
                  <input
                    type="checkbox"
                    id="tribunal-check"
                    checked={fastTrackTribunal}
                    onChange={e => setFastTrackTribunal(e.target.checked)}
                    style={{ width: "16px", height: "16px", accentColor: "var(--sovereign-navy)", marginTop: "2px" }}
                  />
                  <div>
                    <span style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--text-primary)" }}>
                      Enable Fast-Track Land Dispute Resolution Tribunal (LDRT)
                    </span>
                    <span style={{ fontSize: "0.74rem", color: "var(--text-muted)", display: "block", marginTop: "2px" }}>
                      Empowered under Model Land Titling Bill Sec 14 (bars ordinary civil court jurisdiction; 180-day summary disposal)
                    </span>
                  </div>
                </label>
              </div>
            </>
          )}

          {/* DYNAMIC SCENARIO 2 FORM: Auto-Mutation */}
          {selectedScenarioId === "SCENARIO-AUTO-MUTATION-02" && (
            <>
              <div className="form-group" style={{ marginBottom: "16px" }}>
                <label className="form-label" style={{ display: "flex", justifyContent: "space-between" }}>
                  <span>Statutory Objection Notice Window (Public Hearing):</span>
                  <span style={{ fontFamily: "var(--font-mono)", fontWeight: 700, color: "var(--sovereign-navy)" }}>{noticePeriodDays} Days</span>
                </label>
                <input
                  type="range"
                  min="7"
                  max="60"
                  step="1"
                  value={noticePeriodDays}
                  onChange={e => setNoticePeriodDays(Number(e.target.value))}
                  style={{ width: "100%", accentColor: "var(--sovereign-navy)" }}
                />
                <span style={{ fontSize: "0.7rem", color: "var(--text-muted)", display: "block", marginTop: "2px" }}>
                  Prescribed under State Land Revenue Code (e.g. UP Revenue Code 2006 Sec 35 prescribes 15-30 days)
                </span>
              </div>

              <div style={{ padding: "10px 12px", backgroundColor: "#f8fafc", borderRadius: "6px", border: "1px solid #e2e8f0", marginBottom: "18px" }}>
                <label style={{ display: "flex", alignItems: "flex-start", gap: "10px", cursor: "pointer" }}>
                  <input
                    type="checkbox"
                    id="mutation-check"
                    checked={electronicPassThrough}
                    onChange={e => setElectronicPassThrough(e.target.checked)}
                    style={{ width: "16px", height: "16px", accentColor: "var(--sovereign-navy)", marginTop: "2px" }}
                  />
                  <div>
                    <span style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--text-primary)" }}>
                      Enable Automated SRO-Tehsil API Deed Pass-Through
                    </span>
                    <span style={{ fontSize: "0.74rem", color: "var(--text-muted)", display: "block", marginTop: "2px" }}>
                      Real-time cross-departmental API eliminates manual revenue clerk physical dispatch (Bhoomi/Webland benchmark: 65% latency drop)
                    </span>
                  </div>
                </label>
              </div>
            </>
          )}

          {/* DYNAMIC SCENARIO 3 FORM: SVAMITVA Drone Survey */}
          {selectedScenarioId === "SCENARIO-SURVEY-03" && (
            <>
              <div className="form-group" style={{ marginBottom: "16px" }}>
                <label className="form-label" style={{ display: "flex", justifyContent: "space-between" }}>
                  <span>Target Drone Photogrammetry Village Coverage:</span>
                  <span style={{ fontFamily: "var(--font-mono)", fontWeight: 700, color: "var(--sovereign-navy)" }}>{droneCoveragePct}%</span>
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="5"
                  value={droneCoveragePct}
                  onChange={e => setDroneCoveragePct(Number(e.target.value))}
                  style={{ width: "100%", accentColor: "var(--sovereign-navy)" }}
                />
              </div>

              <div style={{ padding: "10px 12px", backgroundColor: "#f8fafc", borderRadius: "6px", border: "1px solid #e2e8f0", marginBottom: "18px" }}>
                <label style={{ display: "flex", alignItems: "flex-start", gap: "10px", cursor: "pointer" }}>
                  <input
                    type="checkbox"
                    id="cors-check"
                    checked={corsNetwork}
                    onChange={e => setCorsNetwork(e.target.checked)}
                    style={{ width: "16px", height: "16px", accentColor: "var(--sovereign-navy)", marginTop: "2px" }}
                  />
                  <div>
                    <span style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--text-primary)" }}>
                      Integrate Survey of India CORS Real-Time Kinematic Network
                    </span>
                    <span style={{ fontSize: "0.74rem", color: "var(--text-muted)", display: "block", marginTop: "2px" }}>
                      5cm positional accuracy reference stations eliminate boundary drift and legacy chain survey discrepancies
                    </span>
                  </div>
                </label>
              </div>
            </>
          )}

          <button
            className="btn btn-primary"
            style={{ width: "100%", padding: "10px" }}
            onClick={handleRunSimulation}
            disabled={running}
          >
            <Play size={16} />
            <span>{running ? "Computing Scenario Engine..." : "Run Scenario Simulation"}</span>
          </button>
        </div>

        {/* Simulation Output Card */}
        <div className="card" style={{ display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
          <div>
            <div className="card-header">
              <div className="card-title">
                <FlaskConical size={18} color="var(--sovereign-navy)" />
                <span>Deterministic Scenario Estimate</span>
              </div>
              {currentResult ? (
                <div className="badge badge-green">
                  <CheckCircle2 size={12} />
                  <span>Simulation Computed</span>
                </div>
              ) : (
                <span className="badge badge-blue">Model Ready</span>
              )}
            </div>

            {currentResult ? (
              <div>
                {/* Scorecard */}
                <div className="grid-2" style={{ marginBottom: "16px" }}>
                  <div style={{ padding: "14px", backgroundColor: "#f8fafc", borderRadius: "6px", border: "1px solid #e2e8f0" }}>
                    <div style={{ fontSize: "0.72rem", color: "var(--text-muted)", fontWeight: 700, textTransform: "uppercase", fontFamily: "var(--font-tech)" }}>
                      BASELINE VALUE
                    </div>
                    <div style={{ fontSize: "1.6rem", fontWeight: 800, fontFamily: "var(--font-mono)", color: "var(--text-primary)", marginTop: "4px" }}>
                      {currentResult.baseline_value?.toLocaleString() ?? 0}
                    </div>
                    <span style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>
                      {getMetricUnit()}
                    </span>
                  </div>

                  <div style={{ padding: "14px", backgroundColor: "#ecfdf5", borderRadius: "6px", border: "1px solid #a7f3d0" }}>
                    <div style={{ fontSize: "0.72rem", color: "#065f46", fontWeight: 700, textTransform: "uppercase", fontFamily: "var(--font-tech)" }}>
                      PROJECTED ESTIMATE
                    </div>
                    <div style={{ fontSize: "1.6rem", fontWeight: 800, fontFamily: "var(--font-mono)", color: "#065f46", marginTop: "4px" }}>
                      {currentResult.scenario_estimate?.toLocaleString() ?? 0}
                    </div>
                    <span style={{ fontSize: "0.72rem", color: "#065f46", fontWeight: 600 }}>
                      {getMetricUnit()} ({currentResult.delta_percent}% Change)
                    </span>
                  </div>
                </div>

                {/* Projected Delta Box */}
                <div style={{ padding: "14px 18px", backgroundColor: "#f0fdf4", borderRadius: "6px", border: "1px solid #bbf7d0", display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <TrendingDown size={22} color="#16a34a" />
                    <div>
                      <span style={{ fontWeight: 700, fontSize: "0.95rem", color: "#14532d", display: "block" }}>
                        Projected Policy Delta (Efficiency Gain)
                      </span>
                      <span style={{ fontSize: "0.74rem", color: "#166534" }}>
                        Counterfactual change achieved through statutory policy reform
                      </span>
                    </div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontFamily: "var(--font-mono)", fontWeight: 800, fontSize: "1.3rem", color: "#16a34a" }}>
                      {currentResult.delta_absolute > 0 ? "+" : ""}{currentResult.delta_absolute?.toLocaleString() ?? 0}
                    </div>
                    <span className="badge badge-green" style={{ fontSize: "0.72rem" }}>
                      {currentResult.delta_percent}% Net Impact
                    </span>
                  </div>
                </div>

                {/* Statutory Grounding & Mathematical Model Breakdown Accordion */}
                <details className="methodology-accordion" open style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "6px", padding: "12px 14px", fontSize: "0.8rem" }}>
                  <summary style={{ cursor: "pointer", fontWeight: 700, color: "var(--sovereign-navy)" }}>
                    Formula Transparency, Assumptions & Empirical Grounding
                  </summary>
                  <div style={{ marginTop: "12px", display: "flex", flexDirection: "column", gap: "10px", color: "var(--text-secondary)", fontSize: "0.78rem" }}>
                    {currentResult.formula_audit && (
                      <>
                        <div style={{ padding: "8px 10px", background: "#ffffff", borderRadius: "4px", border: "1px solid #e2e8f0" }}>
                          <strong style={{ color: "var(--text-primary)", display: "block", marginBottom: "2px" }}>Mathematical Formulation:</strong>
                          <code style={{ fontFamily: "var(--font-mono)", color: "var(--sovereign-navy)", fontSize: "0.76rem" }}>
                            {currentResult.formula_audit.expression}
                          </code>
                        </div>

                        <div>
                          <strong style={{ color: "var(--text-primary)", display: "block", marginBottom: "4px" }}>Parameter Classification & Empirical Evidence:</strong>
                          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                            {currentResult.formula_audit.coefficients?.map((c: any, idx: number) => (
                              <div key={idx} style={{ padding: "6px 8px", background: "#ffffff", borderRadius: "4px", border: "1px solid #f1f5f9" }}>
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                  <span style={{ fontWeight: 600, color: "var(--text-primary)" }}>{c.symbol}</span>
                                  <span className={`badge ${
                                    c.category === "EMPIRICAL_BENCHMARK" ? "badge-green" :
                                    c.category === "LITERATURE_DERIVED" ? "badge-blue" :
                                    c.category === "STATUTORY_PARAMETER" ? "badge-purple" : "badge-amber"
                                  }`} style={{ fontSize: "0.68rem" }}>
                                    {c.category}
                                  </span>
                                </div>
                                <div style={{ fontSize: "0.72rem", color: "var(--text-muted)", marginTop: "2px" }}>
                                  <strong>Source:</strong> {c.citation}
                                </div>
                                <div style={{ fontSize: "0.72rem", color: "var(--text-secondary)", marginTop: "2px" }}>
                                  {c.description}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div>
                          <strong style={{ color: "var(--text-primary)", display: "block", marginBottom: "4px" }}>Step-by-Step Calculation:</strong>
                          <ol style={{ paddingLeft: "18px", margin: 0, color: "#334155" }}>
                            {currentResult.formula_audit.calculation_steps?.map((step: string, idx: number) => (
                              <li key={idx} style={{ fontFamily: "var(--font-mono)", fontSize: "0.74rem", marginBottom: "2px" }}>
                                {step}
                              </li>
                            ))}
                          </ol>
                        </div>
                      </>
                    )}

                    <div>
                      <strong style={{ color: "var(--text-primary)" }}>Official Calibrated Sources:</strong>{" "}
                      <span>{currentResult.sources?.join(", ") || "National Judicial Data Grid & DILRMP 2.0 Reports"}</span>
                    </div>

                    <div style={{ color: "#b45309", backgroundColor: "#fffbeb", padding: "8px 10px", borderRadius: "4px", border: "1px solid #fef3c7" }}>
                      <strong>Non-Causal Decision Support Notice:</strong>{" "}
                      {currentResult.limitations?.[1] || "Scenario estimate is deterministic under stated assumptions; not a guaranteed legal prediction."}
                    </div>
                  </div>
                </details>
              </div>
            ) : (
              /* High-Craft Calibrated Model Preview */
              <div>
                <div style={{ padding: "14px", backgroundColor: "#f8fafc", borderRadius: "6px", border: "1px solid #e2e8f0", marginBottom: "14px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
                    <ShieldCheck size={16} color="var(--sovereign-navy)" />
                    <span style={{ fontFamily: "var(--font-tech)", fontSize: "0.8rem", fontWeight: 700, textTransform: "uppercase", color: "var(--sovereign-navy)" }}>
                      Calibrated Baseline & Precedent Model
                    </span>
                  </div>
                  <p style={{ fontSize: "0.82rem", color: "var(--text-secondary)", lineHeight: 1.45, marginBottom: "8px" }}>
                    This sandbox applies mathematical elasticity formulas calibrated from Indian land administration reforms (Karnataka Bhoomi, Andhra Pradesh Webland, SVAMITVA, and Model Land Titling Bill 2020).
                  </p>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", fontSize: "0.78rem" }}>
                    <div style={{ background: "#ffffff", padding: "8px 10px", borderRadius: "4px", border: "1px solid #e2e8f0" }}>
                      <span style={{ color: "var(--text-muted)", display: "block", fontSize: "0.7rem" }}>ACTIVE BASELINE</span>
                      <strong style={{ fontFamily: "var(--font-mono)", fontSize: "0.95rem" }}>{baselineValue.toLocaleString()}</strong> {getMetricUnit()}
                    </div>
                    <div style={{ background: "#ffffff", padding: "8px 10px", borderRadius: "4px", border: "1px solid #e2e8f0" }}>
                      <span style={{ color: "var(--text-muted)", display: "block", fontSize: "0.7rem" }}>ACTIVE SCENARIO</span>
                      <strong style={{ fontFamily: "var(--font-tech)", fontSize: "0.85rem", color: "var(--sovereign-navy)" }}>{selectedScenarioId}</strong>
                    </div>
                  </div>
                </div>

                <div style={{ padding: "12px 14px", backgroundColor: "#fffbeb", border: "1px solid #fef3c7", borderRadius: "6px", fontSize: "0.8rem", color: "#92400e" }}>
                  <strong>How to use:</strong> Adjust the reform sliders and statutory assumptions on the left, then click <strong>Run Scenario Simulation</strong> to calculate the projected policy delta with full assumption audit.
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Historical Audit Trail of Policy Runs */}
      <div className="card">
        <div className="card-header">
          <div className="card-title">
            <History size={16} color="var(--sovereign-navy)" />
            <span>Recent Audited Policy Lab Runs (SHA-256 Ledger Backed)</span>
          </div>
          <span className="badge badge-green">Cryptographically Signed</span>
        </div>

        {pastRuns.length === 0 ? (
          <EmptyState
            compact
            title="No Past Simulation Runs"
            description="Run your first policy simulation above to generate an audited historical record."
          />
        ) : (
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Run ID</th>
                  <th>Scenario / Intervention</th>
                  <th>Jurisdiction</th>
                  <th>Baseline</th>
                  <th>Estimate</th>
                  <th>Net Delta</th>
                  <th>Evaluator</th>
                  <th>Timestamp</th>
                </tr>
              </thead>
              <tbody>
                {pastRuns.slice(0, 5).map(r => (
                  <tr key={r.run_id}>
                    <td>
                      <code style={{ fontSize: "0.78rem", fontWeight: 600, color: "var(--sovereign-navy)", fontFamily: "var(--font-mono)" }}>
                        {r.run_id}
                      </code>
                    </td>
                    <td style={{ fontWeight: 600 }}>{r.title}</td>
                    <td>{r.geography}</td>
                    <td style={{ fontFamily: "var(--font-mono)" }}>{r.baseline_value?.toLocaleString()}</td>
                    <td style={{ fontFamily: "var(--font-mono)", color: "#065f46", fontWeight: 700 }}>
                      {r.scenario_estimate?.toLocaleString()}
                    </td>
                    <td>
                      <span className="badge badge-green" style={{ fontFamily: "var(--font-mono)" }}>
                        {r.delta_percent}%
                      </span>
                    </td>
                    <td style={{ fontSize: "0.8rem" }}>{r.run_by}</td>
                    <td style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>
                      {new Date(r.created_at).toLocaleTimeString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
