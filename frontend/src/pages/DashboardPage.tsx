import React, { useEffect, useState } from "react";
import { api } from "../api/client.js";
import { PageHeader } from "../components/PageHeader.js";
import { LoadingState } from "../components/LoadingState.js";
import { EmptyState } from "../components/EmptyState.js";
import { 
  Building2, 
  AlertCircle,
  Database,
  Layers,
  ArrowRight
} from "lucide-react";

export const DashboardPage: React.FC<{ onNavigate: (tab: any) => void }> = ({ onNavigate }) => {
  const [overview, setOverview] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    api.getOverview()
      .then(res => setOverview(res))
      .catch(err => console.error("Error loading dashboard overview:", err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <LoadingState message="Loading Land Governance Intelligence Overview..." />;
  }

  const kpis = overview?.kpis || {};
  const dilrmpSample = overview?.dilrmp_national_sample || [];
  const njdgSample = overview?.njdg_disputes_sample || [];

  return (
    <div className="dashboard-view">
      <PageHeader
        title="National Land Governance & Intelligence Overview"
        subtitle="Synthesized cross-domain metrics from DILRMP (DoLR), National Judicial Data Grid (NJDG), Bhuvan (NRSC/ISRO), and Major Infrastructure Project Monitors."
      />

      {/* KPI Counters */}
      <div className="grid-4" style={{ marginBottom: "24px" }}>
        <div className="kpi-card">
          <span className="kpi-label">Active Sources</span>
          <span className="kpi-val">{kpis.verified_sources_count ?? kpis.verified_sources ?? 0}</span>
          <span className="kpi-sub">Official Portals & Statutory Acts</span>
        </div>

        <div className="kpi-card">
          <span className="kpi-label">Monitored Acquisitions</span>
          <span className="kpi-val">{kpis.acquisition_projects_tracked ?? 0}</span>
          <span className="kpi-sub">NHAI, DFCCIL, GPCL, Polavaram</span>
        </div>

        <div className="kpi-card">
          <span className="kpi-label">High Delay Risk</span>
          <span className="kpi-val" style={{ color: "#b91c1c" }}>{kpis.high_delay_risk_projects ?? 0}</span>
          <span className="kpi-sub">Projects with Risk Score &gt; 70</span>
        </div>

        <div className="kpi-card">
          <span className="kpi-label">Audit Provenance</span>
          <span className="kpi-val" style={{ color: "#065f46" }}>{kpis.tamper_evident_audit_events ?? 0}</span>
          <span className="kpi-sub">Cryptographic SHA-256 Hash-Chain</span>
        </div>
      </div>

      {/* Main Grid: DILRMP Progress + NJDG Dispute Analysis */}
      <div className="grid-2">
        {/* DILRMP Progress */}
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">
                <Building2 size={18} color="var(--primary)" />
                <span>DILRMP: Land Record Digitization Progress</span>
              </div>
              <div className="card-subtitle">Source: Department of Land Resources (DoLR) National Status</div>
            </div>
          </div>

          {dilrmpSample.length === 0 ? (
            <EmptyState
              compact
              title="No DILRMP Records"
              description="No national digitization sample records are currently available in the database."
            />
          ) : (
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>State</th>
                    <th>Total Villages</th>
                    <th>RoR Computerized</th>
                    <th>Cadastral Maps</th>
                    <th>ULPIN Status</th>
                  </tr>
                </thead>
                <tbody>
                  {dilrmpSample.map((row: any, idx: number) => {
                    const stateName = row.state_ut || row.state_name || `State-${idx}`;
                    const totalVillages = row.total_villages != null ? Number(row.total_villages).toLocaleString() : "N/A";
                    const rorPct = row.ror_computerized_pct ?? 0;
                    const mapPct = row.cadastral_maps_pct ?? row.cadastral_maps_digitized_pct ?? 0;
                    return (
                      <tr key={row.state_code || stateName}>
                        <td style={{ fontWeight: 600 }}>{stateName}</td>
                        <td>{totalVillages}</td>
                        <td style={{ fontFamily: "var(--font-mono)", fontWeight: 600, color: "#065f46" }}>
                          {rorPct}%
                        </td>
                        <td style={{ fontFamily: "var(--font-mono)", fontWeight: 600, color: mapPct > 80 ? "#065f46" : "#b45309" }}>
                          {mapPct}%
                        </td>
                        <td>
                          {row.ulpin_implemented ? (
                            <span className="badge badge-green">Active</span>
                          ) : (
                            <span className="badge badge-amber">Pilot</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
          <div style={{ marginTop: "14px", textAlign: "right" }}>
            <button className="btn btn-secondary btn-sm" onClick={() => onNavigate("repository")}>
              <span>View Complete DILRMP Dataset</span>
              <ArrowRight size={13} />
            </button>
          </div>
        </div>

        {/* NJDG Litigation Pendency */}
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">
                <AlertCircle size={18} color="#b45309" />
                <span>NJDG: Civil Land Dispute Pendency</span>
              </div>
              <div className="card-subtitle">District & Subordinate Courts Land Litigation Volume</div>
            </div>
          </div>

          {njdgSample.length === 0 ? (
            <EmptyState
              compact
              title="No NJDG Dispute Records"
              description="No judicial dispute records are currently indexed."
            />
          ) : (
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>State</th>
                    <th>Land Civil Cases</th>
                    <th>Avg Pendency</th>
                    <th>&gt; 10 Years</th>
                    <th>Dominant Dispute</th>
                  </tr>
                </thead>
                <tbody>
                  {njdgSample.map((row: any, idx: number) => {
                    const stateName = row.state_ut || row.state || `State-${idx}`;
                    const disputesCount = (row.land_property_disputes_count ?? row.civil_land_disputes_pending ?? 0).toLocaleString();
                    const pendencyYears = row.median_disposal_time_years ?? row.average_pendency_years ?? "N/A";
                    const over10Years = (row.cases_pending_over_10_years ?? row.pendency_over_10_years ?? 0).toLocaleString();
                    const disputeType = Array.isArray(row.top_dispute_types)
                      ? row.top_dispute_types.slice(0, 2).join(", ")
                      : (row.dominant_dispute_category || "Title & Possession");

                    return (
                      <tr key={row.state || stateName}>
                        <td style={{ fontWeight: 600 }}>{stateName}</td>
                        <td>{disputesCount}</td>
                        <td>{pendencyYears} Years</td>
                        <td style={{ fontFamily: "var(--font-mono)", color: "#b91c1c", fontWeight: 600 }}>
                          {over10Years}
                        </td>
                        <td style={{ fontSize: "0.78rem" }}>{disputeType}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
          <div style={{ marginTop: "14px", textAlign: "right" }}>
            <button className="btn btn-secondary btn-sm" onClick={() => onNavigate("policy")}>
              <span>Simulate Litigation Reduction in Policy Lab</span>
              <ArrowRight size={13} />
            </button>
          </div>
        </div>
      </div>

      {/* Quick Launchpad to Decision Support */}
      <div className="card" style={{ background: "linear-gradient(to right, #f8fafc, #edf7ed)", borderColor: "#c8e6c9" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
          <div>
            <h3 style={{ fontSize: "1.05rem", fontWeight: 700, color: "var(--primary)" }}>
              Evidence-Based Decision Support Engines
            </h3>
            <p style={{ fontSize: "0.82rem", color: "var(--text-muted)", marginTop: "4px" }}>
              Evaluate policy interventions transparently or run predictive machine learning delay risk scoring on linear/infrastructure acquisitions.
            </p>
          </div>
          <div style={{ display: "flex", gap: "10px" }}>
            <button className="btn btn-outline-primary" onClick={() => onNavigate("policy")}>
              Policy Lab Sandbox
            </button>
            <button className="btn btn-primary" onClick={() => onNavigate("risk")}>
              Predictive Risk ML
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
