import React, { useEffect, useState } from "react";
import { api } from "../api/client.js";
import { Lightbulb, Award, Calendar, Users, ExternalLink } from "lucide-react";

export const InnovationPage: React.FC = () => {
  const [challenges, setChallenges] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    api.getChallenges()
      .then(res => setChallenges(res.challenges || []))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div style={{ padding: "40px", textAlign: "center" }}>Loading Innovation Hub...</div>;
  }

  return (
    <div className="innovation-view">
      <div style={{ marginBottom: "20px" }}>
        <h2 style={{ fontSize: "1.4rem", fontWeight: 800, color: "var(--primary)" }}>
          Land Governance Innovation Hub & Grand Challenges
        </h2>
        <p style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>
          Catalyzing research, startups, and academic institutions to build open-source AI, GIS, and computer vision technologies for land administration.
        </p>
      </div>

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

              <div style={{ marginBottom: "12px" }}>
                <span className="badge badge-amber">{ch.theme}</span>
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
              <span className="badge-hash">{ch.challenge_id}</span>
              <button className="btn btn-secondary btn-sm" onClick={() => alert(`Details for challenge ${ch.challenge_id} will open application portal.`)}>
                View Problem Statement <ExternalLink size={12} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
