import React, { useEffect, useState } from "react";
import { api } from "../api/client.js";
import { PageHeader } from "../components/PageHeader.js";
import { LoadingState } from "../components/LoadingState.js";
import { EmptyState } from "../components/EmptyState.js";
import { Lightbulb, Award, Calendar, Users, ExternalLink, X, CheckCircle, FileCode } from "lucide-react";

export const InnovationPage: React.FC = () => {
  const [challenges, setChallenges] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedChallenge, setSelectedChallenge] = useState<any | null>(null);
  const [submittedProposal, setSubmittedProposal] = useState<boolean>(false);
  const [teamName, setTeamName] = useState<string>("");
  const [proposalNotes, setProposalNotes] = useState<string>("");

  useEffect(() => {
    api.getChallenges()
      .then(res => setChallenges(res.challenges || []))
      .catch(err => console.error("Error loading innovation challenges:", err))
      .finally(() => setLoading(false));
  }, []);

  const handleApply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!teamName.trim()) return;
    setSubmittedProposal(true);
    setTimeout(() => {
      setSubmittedProposal(false);
      setSelectedChallenge(null);
      setTeamName("");
      setProposalNotes("");
    }, 2500);
  };

  if (loading) {
    return <LoadingState message="Loading Land Governance Innovation Hub & Grand Challenges..." />;
  }

  return (
    <div className="innovation-view">
      <PageHeader
        title="Land Governance Innovation Hub & Grand Challenges"
        subtitle="Catalyzing research, startups, and academic institutions to build open-source AI, GIS, and computer vision technologies for national land administration."
      />

      {challenges.length === 0 ? (
        <EmptyState
          icon={<Lightbulb size={32} color="var(--primary)" />}
          title="No Active Challenges"
          description="There are currently no active grand challenges open for submissions."
        />
      ) : (
        <div className="grid-2">
          {challenges.map(ch => (
            <div key={ch.challenge_id} className="card" style={{ display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
              <div>
                <div className="card-header">
                  <div className="card-title">
                    <Lightbulb size={18} color="#d97706" />
                    <span>{ch.title}</span>
                  </div>
                  <span className="badge badge-green">{ch.status}</span>
                </div>

                <div style={{ marginBottom: "12px", fontSize: "0.78rem", fontWeight: 600, color: "var(--primary)" }}>
                  {ch.theme}
                </div>

                <p style={{ fontSize: "0.85rem", color: "#334155", lineHeight: "1.5", marginBottom: "16px" }}>
                  {ch.description}
                </p>

                <div style={{ display: "flex", flexDirection: "column", gap: "6px", fontSize: "0.8rem", color: "var(--text-muted)" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <Award size={14} color="#065f46" />
                    <span><strong>Grant / Prize:</strong> {ch.prize_pool}</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <Users size={14} color="#1e40af" />
                    <span><strong>Eligibility:</strong> {ch.eligibility}</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <Calendar size={14} color="#b45309" />
                    <span><strong>Deadline:</strong> {ch.deadline}</span>
                  </div>
                </div>
              </div>

              <div style={{ marginTop: "20px", borderTop: "1px solid var(--border-subtle)", paddingTop: "12px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <code style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>{ch.challenge_id}</code>
                <button 
                  className="btn btn-secondary btn-sm" 
                  onClick={() => setSelectedChallenge(ch)}
                >
                  <span>View Problem Statement</span>
                  <ExternalLink size={12} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Problem Statement Detail & Application Modal */}
      {selectedChallenge && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "rgba(15, 23, 42, 0.6)",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          zIndex: 1000,
          padding: "20px"
        }}>
          <div style={{
            backgroundColor: "#ffffff",
            borderRadius: "8px",
            maxWidth: "680px",
            width: "100%",
            maxHeight: "90vh",
            overflowY: "auto",
            boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
            border: "1px solid #cbd5e1"
          }}>
            <div style={{
              padding: "16px 20px",
              borderBottom: "1px solid #e2e8f0",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              backgroundColor: "#f8fafc"
            }}>
              <div>
                <span className="badge badge-blue" style={{ marginBottom: "4px" }}>{selectedChallenge.challenge_id}</span>
                <h3 style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--primary)", margin: 0 }}>
                  {selectedChallenge.title}
                </h3>
              </div>
              <button 
                onClick={() => setSelectedChallenge(null)}
                style={{ background: "none", border: "none", cursor: "pointer", color: "#64748b" }}
              >
                <X size={20} />
              </button>
            </div>

            <div style={{ padding: "20px" }}>
              <div style={{ marginBottom: "16px" }}>
                <h4 style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", marginBottom: "6px" }}>
                  Official Problem Description
                </h4>
                <p style={{ fontSize: "0.9rem", lineHeight: "1.6", color: "#1e293b" }}>
                  {selectedChallenge.description}
                </p>
              </div>

              <div className="grid-2" style={{ marginBottom: "16px" }}>
                <div style={{ padding: "10px 12px", backgroundColor: "#f8fafc", borderRadius: "6px", border: "1px solid #e2e8f0" }}>
                  <div style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>GRANT / PRIZE POOL</div>
                  <div style={{ fontWeight: 700, color: "#065f46", fontSize: "0.95rem" }}>{selectedChallenge.prize_pool}</div>
                </div>
                <div style={{ padding: "10px 12px", backgroundColor: "#f8fafc", borderRadius: "6px", border: "1px solid #e2e8f0" }}>
                  <div style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>SUBMISSION DEADLINE</div>
                  <div style={{ fontWeight: 700, color: "#b45309", fontSize: "0.95rem" }}>{selectedChallenge.deadline}</div>
                </div>
              </div>

              <div style={{ marginBottom: "16px" }}>
                <h4 style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", marginBottom: "6px" }}>
                  Technical Requirements & Evaluation Criteria
                </h4>
                <ul style={{ fontSize: "0.82rem", color: "#334155", lineHeight: "1.6", paddingLeft: "20px" }}>
                  <li>Open-source license compliance (Apache 2.0 or MIT).</li>
                  <li>Dockerized deployment artifact with reproducible synthetic and benchmark test suites.</li>
                  <li>Direct API integration compatibility with LandSetu unified knowledge schema.</li>
                  <li>Full provenance tracing and SHA-256 verification of inputs and outputs.</li>
                </ul>
              </div>

              {/* Application Form */}
              <div style={{ borderTop: "1px solid #e2e8f0", paddingTop: "16px" }}>
                <h4 style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--primary)", textTransform: "uppercase", marginBottom: "10px" }}>
                  Submit Pilot Proposal / Register Solution
                </h4>

                {submittedProposal ? (
                  <div style={{ padding: "16px", backgroundColor: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: "6px", color: "#166534", display: "flex", alignItems: "center", gap: "10px" }}>
                    <CheckCircle size={20} />
                    <span>Proposal successfully submitted! Reference token registered in LandSetu Innovation Ledger.</span>
                  </div>
                ) : (
                  <form onSubmit={handleApply}>
                    <div className="form-group" style={{ marginBottom: "10px" }}>
                      <label className="form-label" style={{ fontSize: "0.8rem" }}>Team / Organization Name:</label>
                      <input
                        type="text"
                        className="form-input"
                        placeholder="e.g. IIT Delhi Geoinformatics Lab / LandTech AI"
                        value={teamName}
                        onChange={e => setTeamName(e.target.value)}
                        required
                      />
                    </div>
                    <div className="form-group" style={{ marginBottom: "12px" }}>
                      <label className="form-label" style={{ fontSize: "0.8rem" }}>Approach & Architecture Summary:</label>
                      <textarea
                        className="form-textarea"
                        placeholder="Outline proposed methodology, datasets to be used, and expected deliverables..."
                        value={proposalNotes}
                        onChange={e => setProposalNotes(e.target.value)}
                        rows={3}
                      />
                    </div>
                    <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
                      <button 
                        type="button" 
                        className="btn btn-secondary btn-sm" 
                        onClick={() => setSelectedChallenge(null)}
                      >
                        Cancel
                      </button>
                      <button 
                        type="submit" 
                        className="btn btn-primary btn-sm"
                      >
                        <FileCode size={14} />
                        <span>Submit Registration</span>
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
