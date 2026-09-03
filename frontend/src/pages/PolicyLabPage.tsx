import React, { useEffect, useState } from "react";
import { api } from "../api/client.js";
import { 
  FlaskConical, 
  TrendingDown, 
  Play, 
  History, 
  AlertCircle, 
  CheckCircle2, 
  Sliders 
} from "lucide-react";

export const PolicyLabPage: React.FC = () => {
  const [scenarios, setScenarios] = useState<any[]>([]);
  const [selectedScenarioId, setSelectedScenarioId] = useState<string>("SCENARIO-TITLING-01");
  const [geography, setGeography] = useState<string>("Uttar Pradesh & Bihar");
  const [baselineValue, setBaselineValue] = useState<number>(1250000);
  const [coveragePct, setCoveragePct] = useState<number>(75);
  const [fastTrackTribunal, setFastTrackTribunal] = useState<boolean>(true);
  const [currentResult, setCurrentResult] = useState<any>(null);
  const [pastRuns, setPastRuns] = useState<any[]>([]);
  const [running, setRunning] = useState<boolean>(false);

  useEffect(() => {
    api.getScenarios().then(res => setScenarios(res.scenarios || []));
    api.getPolicyRuns().then(res => setPastRuns(res.runs || []));
  }, []);

  const handleRunSimulation = async () => {
    setRunning(true);
    try {
      const res = await api.runPolicy({
        scenarioId: selectedScenarioId,
        geography,
        baselineValue: Number(baselineValue),
        intervention: {
          digital_title_coverage_pct: coveragePct,
          statutory_notice_period_days: 15
        },
        assumptions: {
          dispute_tribunal_fast_track: fastTrackTribunal,
          electronic_deed_pass_through: true
        }
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

  const activeScenario = scenarios.find(s => s.scenario_id === selectedScenarioId) || scenarios[0];

  return (
    <div className="policy-lab-view">
      <div style={{ marginBottom: "20px" }}>
        <h2 style={{ fontSize: "1.4rem", fontWeight: 800, color: "var(--primary)" }}>
          Policy Lab: Parametric Scenario Simulation Sandbox
        </h2>
        <p style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>
          Evaluate the impact of legal and administrative reforms (conclusive titling, auto-mutation) with full assumption transparency, verifiable delta, and hash-chain audit.
        </p>
      </div>

      <div className="grid-2">
        {/* Intervention Parameters Form */}
        <div className="card">
          <div className="card-header">
            <div className="card-title">
              <Sliders size={18} color="var(--primary)" />
              <span>Scenario Formulation & Interventions</span>
            </div>
            <span className="badge badge-amber">Sandbox Mode</span>
          </div>

          <div className="form-group">
            <label className="form-label">Select Policy Scenario:</label>
            <select
              className="form-select"
              value={selectedScenarioId}
              onChange={e => {
                setSelectedScenarioId(e.target.value);
                if (e.target.value === "SCENARIO-AUTO-MUTATION-02") {
                  setBaselineValue(45); // average days to mutate
                } else {
                  setBaselineValue(1250000); // litigation pendency
                }
              }}
            >
              {scenarios.map(s => (
                <option key={s.scenario_id} value={s.scenario_id}>{s.title}</option>
              ))}
            </select>
          </div>

          <div style={{ fontSize: "0.82rem", color: "var(--text-muted)", marginBottom: "16px", padding: "8px 12px", backgroundColor: "#f8fafc", borderRadius: "4px" }}>
            {activeScenario?.description}
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
              <label className="form-label">Baseline Metric Value:</label>
              <input
                type="number"
                className="form-input"
                value={baselineValue}
                onChange={e => setBaselineValue(Number(e.target.value))}
              />
              <span style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>
                {activeScenario?.baseline_metric}
              </span>
            </div>
          </div>

          {/* Sliders */}
          <div className="form-group">
            <label className="form-label" style={{ display: "flex", justifyContent: "space-between" }}>
              <span>Target Digital Title / SRO Coverage:</span>
              <span style={{ fontFamily: "var(--font-mono)", fontWeight: 700 }}>{coveragePct}%</span>
            </label>
            <input
              type="range"
              min="20"
              max="100"
              step="5"
              value={coveragePct}
              onChange={e => setCoveragePct(Number(e.target.value))}
              style={{ width: "100%", accentColor: "var(--primary)" }}
            />
          </div>

          <div className="form-group" style={{ display: "flex", alignItems: "center", gap: "10px", marginTop: "10px" }}>
            <input
              type="checkbox"
              id="tribunal-check"
              checked={fastTrackTribunal}
              onChange={e => setFastTrackTribunal(e.target.checked)}
              style={{ width: "16px", height: "16px", accentColor: "var(--primary)" }}
            />
            <label htmlFor="tribunal-check" style={{ fontSize: "0.85rem", cursor: "pointer" }}>
              Enable Fast-Track Land Dispute Resolution Tribunal (Model Land Titling Bill)
            </label>
          </div>

          <div style={{ marginTop: "20px" }}>
            <button
              className="btn btn-primary"
              style={{ width: "100%" }}
              onClick={handleRunSimulation}
              disabled={running}
            >
              <Play size={16} />
              <span>{running ? "Computing Scenario..." : "Run Scenario Simulation"}</span>
            </button>
          </div>
        </div>

        {/* Simulation Output Card */}
        <div className="card">
          <div className="card-header">
            <div className="card-title">
              <FlaskConical size={18} color="var(--primary)" />
              <span>Deterministic Scenario Estimate</span>
            </div>
            {currentResult && <span className="badge badge-green">Computed & Audited</span>}
          </div>

          {currentResult ? (
            <div>
              <div className="grid-2" style={{ marginBottom: "16px" }}>
                <div style={{ padding: "12px", backgroundColor: "#f8fafc", borderRadius: "6px", border: "1px solid #e2e8f0" }}>
                  <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>BASELINE VALUE</div>
                  <div style={{ fontSize: "1.4rem", fontWeight: 800, fontFamily: "var(--font-mono)" }}>
                    {currentResult.baseline_value?.toLocaleString() ?? 0}
                  </div>
                </div>

                <div style={{ padding: "12px", backgroundColor: "#ecfdf5", borderRadius: "6px", border: "1px solid #a7f3d0" }}>
                  <div style={{ fontSize: "0.75rem", color: "#065f46" }}>SCENARIO ESTIMATE</div>
                  <div style={{ fontSize: "1.4rem", fontWeight: 800, fontFamily: "var(--font-mono)", color: "#065f46" }}>
                    {currentResult.scenario_estimate?.toLocaleString() ?? 0}
                  </div>
                </div>
              </div>

              {/* Delta Box */}
              <div style={{ padding: "12px 16px", backgroundColor: "#f0fdf4", borderRadius: "6px", border: "1px solid #bbf7d0", display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <TrendingDown size={20} color="#16a34a" />
                  <span style={{ fontWeight: 700, fontSize: "0.95rem" }}>Projected Reduction (Delta):</span>
                </div>
                <div style={{ fontFamily: "var(--font-mono)", fontWeight: 800, fontSize: "1.1rem", color: "#16a34a" }}>
                  {currentResult.delta_absolute?.toLocaleString() ?? 0} ({currentResult.delta_percent}%)
                </div>
              </div>

              {/* Methodology & Source Provenance */}
              <div style={{ fontSize: "0.8rem", marginBottom: "12px" }}>
                <div><strong>Model Version:</strong> <span className="badge badge-blue">{currentResult.method_version}</span></div>
                <div style={{ marginTop: "6px" }}>
                  <strong>Calibrated from Sources:</strong>{" "}
                  {currentResult.sources?.map((s: string) => (
                    <span key={s} className="badge badge-green" style={{ marginRight: "6px" }}>{s}</span>
                  ))}
                </div>
              </div>

              {/* Disclaimers & Limitations */}
              <div style={{ padding: "10px", backgroundColor: "#fffbeb", border: "1px solid #fde68a", borderRadius: "6px", fontSize: "0.75rem", color: "#92400e" }}>
                <strong>Transparency Notice: </strong>
                {currentResult.limitations?.[0] || "Scenario estimate is deterministic under stated assumptions; not an empirical guarantee."}
              </div>
            </div>
          ) : (
            <div style={{ padding: "40px", textAlign: "center", color: "var(--text-muted)" }}>
              Adjust parameters and click &ldquo;Run Scenario Simulation&rdquo; to compute the deterministic estimate.
            </div>
          )}
        </div>
      </div>

      {/* Historical Audit Trail of Policy Runs */}
      <div className="card">
        <div className="card-header">
          <div className="card-title">
            <History size={16} color="var(--primary)" />
            <span>Recent Audited Policy Lab Runs</span>
          </div>
        </div>

        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Run ID</th>
                <th>Scenario / Title</th>
                <th>Geography</th>
                <th>Baseline</th>
                <th>Estimate</th>
                <th>Delta</th>
                <th>Run By</th>
                <th>Timestamp</th>
              </tr>
            </thead>
            <tbody>
              {pastRuns.slice(0, 5).map(r => (
                <tr key={r.run_id}>
                  <td><span className="badge badge-blue">{r.run_id}</span></td>
                  <td style={{ fontWeight: 600 }}>{r.title}</td>
                  <td>{r.geography}</td>
                  <td style={{ fontFamily: "var(--font-mono)" }}>{r.baseline_value?.toLocaleString()}</td>
                  <td style={{ fontFamily: "var(--font-mono)", color: "#065f46", fontWeight: 700 }}>
                    {r.scenario_estimate?.toLocaleString()}
                  </td>
                  <td>
                    <span className="badge badge-green">{r.delta_percent}%</span>
                  </td>
                  <td>{r.run_by}</td>
                  <td style={{ fontSize: "0.75rem" }}>{new Date(r.created_at).toLocaleTimeString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
