import React, { useEffect, useState } from "react";
import { api } from "../api/client.js";
import { 
  Layers, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  IndianRupee, 
  MapPin, 
  TrendingUp 
} from "lucide-react";

export const AcquisitionPage: React.FC<{ userRole: string }> = ({ userRole }) => {
  const [projects, setProjects] = useState<any[]>([]);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [selectedProject, setSelectedProject] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    Promise.all([
      api.getAcquisitions(),
      api.getAcquisitionAlerts()
    ]).then(([pRes, aRes]) => {
      setProjects(pRes.projects || []);
      setAlerts(aRes.alerts || []);
      if (pRes.projects && pRes.projects.length > 0) {
        setSelectedProject(pRes.projects[0]);
      }
    }).catch(err => console.error("Error loading acquisitions:", err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div style={{ padding: "40px", textAlign: "center" }}>Loading Land Acquisition Lifecycle Intelligence...</div>;
  }

  const stages = [
    "Preliminary Proposal",
    "Section 4: Social Impact Assessment (SIA)",
    "Section 11: Preliminary Notification",
    "Section 19: Declaration of Acquisition",
    "Section 23: Collector Land Award",
    "Physical Possession Handover"
  ];

  return (
    <div className="acquisition-view">
      <div style={{ marginBottom: "20px" }}>
        <h2 style={{ fontSize: "1.4rem", fontWeight: 800, color: "var(--primary)" }}>
          Real-Time Land Acquisition & Management Intelligence (SIH26016)
        </h2>
        <p style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>
          Tracking linear & capital infrastructure project lifecycles, compensation disbursements, R&R compliance, and Section 23 statutory lapse alerts.
        </p>
      </div>

      {/* Statutory Alerts Banner */}
      {alerts.length > 0 && (
        <div className="card" style={{ backgroundColor: "#fef2f2", borderColor: "#fca5a5", marginBottom: "20px" }}>
          <div className="card-header" style={{ borderColor: "#fecaca" }}>
            <div className="card-title" style={{ color: "#991b1b" }}>
              <AlertTriangle size={18} />
              <span>Critical Statutory & Financial Bottlenecks ({alerts.length})</span>
            </div>
            <span className="badge badge-red">Active Risk</span>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {alerts.map((alt, idx) => (
              <div key={idx} style={{ fontSize: "0.82rem", color: "#7f1d1d", display: "flex", alignItems: "center", gap: "8px" }}>
                <span className="badge badge-red">{alt.type}</span>
                <strong>{alt.project_name}:</strong>
                <span>{alt.message}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Projects Grid & Detail */}
      <div className="grid-3" style={{ gridTemplateColumns: "1.2fr 1.8fr", marginBottom: "20px" }}>
        {/* Projects List */}
        <div className="card">
          <div className="card-header">
            <div className="card-title">
              <Layers size={18} color="var(--primary)" />
              <span>National Infrastructure Projects ({projects.length})</span>
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {projects.map(p => (
              <div
                key={p.project_id}
                style={{
                  padding: "12px",
                  borderRadius: "6px",
                  border: selectedProject?.project_id === p.project_id ? "2px solid var(--primary)" : "1px solid var(--border-subtle)",
                  backgroundColor: selectedProject?.project_id === p.project_id ? "#f0fdf4" : "#ffffff",
                  cursor: "pointer"
                }}
                onClick={() => setSelectedProject(p)}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div style={{ fontWeight: 700, fontSize: "0.9rem" }}>{p.project_name}</div>
                  <span className={`badge ${p.risk_category === "High" ? "badge-red" : (p.risk_category === "Medium" ? "badge-amber" : "badge-green")}`}>
                    Risk: {p.risk_score}
                  </span>
                </div>
                <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "4px" }}>
                  {p.implementing_agency} | {p.district}, {p.state}
                </div>
                <div style={{ fontSize: "0.75rem", marginTop: "6px", display: "flex", justifyContent: "space-between" }}>
                  <span>Area: <strong>{p.land_area_hectares} Ha</strong></span>
                  <span>Disbursed: <strong>{p.disbursement_pct}%</strong></span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Selected Project Milestone & Compensation View */}
        {selectedProject && (
          <div className="card">
            <div className="card-header">
              <div>
                <div className="card-title">
                  <span>{selectedProject.project_name}</span>
                </div>
                <div className="card-subtitle">
                  {selectedProject.project_category} &bull; {selectedProject.implementing_agency}
                </div>
              </div>
              <span className="badge badge-blue">{selectedProject.current_status}</span>
            </div>

            {/* Financials Row */}
            <div className="grid-3" style={{ marginBottom: "20px" }}>
              <div style={{ padding: "10px", backgroundColor: "#f8fafc", borderRadius: "6px", border: "1px solid #e2e8f0" }}>
                <div style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>COMPENSATION ASSESSED</div>
                <div style={{ fontSize: "1.2rem", fontWeight: 800, fontFamily: "var(--font-mono)" }}>
                  ₹ {selectedProject.compensation_assessed_crores} Cr
                </div>
              </div>

              <div style={{ padding: "10px", backgroundColor: "#ecfdf5", borderRadius: "6px", border: "1px solid #a7f3d0" }}>
                <div style={{ fontSize: "0.72rem", color: "#065f46" }}>COMPENSATION DISBURSED</div>
                <div style={{ fontSize: "1.2rem", fontWeight: 800, fontFamily: "var(--font-mono)", color: "#065f46" }}>
                  ₹ {selectedProject.compensation_disbursed_crores} Cr
                </div>
              </div>

              <div style={{ padding: "10px", backgroundColor: "#f8fafc", borderRadius: "6px", border: "1px solid #e2e8f0" }}>
                <div style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>DISBURSEMENT RATE</div>
                <div style={{ fontSize: "1.2rem", fontWeight: 800, fontFamily: "var(--font-mono)" }}>
                  {selectedProject.disbursement_pct}%
                </div>
              </div>
            </div>

            {/* Statutory Lifecycle Milestones Timeline */}
            <div style={{ marginBottom: "20px" }}>
              <div className="card-title" style={{ fontSize: "0.9rem", marginBottom: "12px" }}>
                <Clock size={16} color="var(--primary)" />
                <span>Statutory Land Acquisition Lifecycle Milestones (RFCTLARR 2013)</span>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {stages.map((stg, sIdx) => {
                  const isCompleted = sIdx < 4; // demo logic based on current stage
                  const isCurrent = sIdx === 4;
                  return (
                    <div
                      key={sIdx}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "12px",
                        padding: "8px 12px",
                        borderRadius: "6px",
                        backgroundColor: isCurrent ? "#fffbeb" : (isCompleted ? "#f0fdf4" : "#f8fafc"),
                        border: isCurrent ? "1px solid #fde68a" : (isCompleted ? "1px solid #bbf7d0" : "1px solid #e2e8f0")
                      }}
                    >
                      {isCompleted && <CheckCircle2 size={16} color="#16a34a" />}
                      {isCurrent && <Clock size={16} color="#d97706" />}
                      {!isCompleted && !isCurrent && <div style={{ width: 16, height: 16, borderRadius: "50%", border: "2px solid #cbd5e1" }} />}
                      
                      <div style={{ flex: 1, fontSize: "0.82rem", fontWeight: isCurrent ? 700 : 500 }}>
                        {stg}
                      </div>

                      {isCurrent && (
                        <span className="badge badge-amber">
                          In Progress ({selectedProject.delay_months} Mos Delay)
                        </span>
                      )}
                      {isCompleted && (
                        <span className="badge badge-green">Completed</span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* R&R and Litigation Metrics */}
            <div className="grid-2">
              <div style={{ padding: "12px", backgroundColor: "#f8fafc", borderRadius: "6px", border: "1px solid #e2e8f0" }}>
                <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>REHABILITATION & RESETTLEMENT (R&R)</div>
                <div style={{ fontWeight: 700, marginTop: "4px" }}>{selectedProject.rr_plan_status}</div>
                <div style={{ fontSize: "0.72rem", color: "var(--text-muted)", marginTop: "2px" }}>
                  Affected Families: {selectedProject.affected_families?.toLocaleString()}
                </div>
              </div>

              <div style={{ padding: "12px", backgroundColor: "#f8fafc", borderRadius: "6px", border: "1px solid #e2e8f0" }}>
                <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>ACTIVE LITIGATION CASES</div>
                <div style={{ fontWeight: 700, marginTop: "4px", color: selectedProject.litigation_cases_count > 10 ? "#b91c1c" : "inherit" }}>
                  {selectedProject.litigation_cases_count} Pending Court Matters
                </div>
                <div style={{ fontSize: "0.72rem", color: "var(--text-muted)", marginTop: "2px" }}>
                  Impacts Physical Possession
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
