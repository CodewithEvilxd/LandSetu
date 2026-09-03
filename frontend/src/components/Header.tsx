import React, { useEffect, useState } from "react";
import { api, setAuthToken } from "../api/client.js";
import { ShieldCheck, UserCheck, Activity, Database } from "lucide-react";

interface HeaderProps {
  currentRole: string;
  onRoleChange: (newRole: string) => void;
}

export const Header: React.FC<HeaderProps> = ({ currentRole, onRoleChange }) => {
  const [chainValid, setChainValid] = useState<boolean | null>(null);
  const [totalEvents, setTotalEvents] = useState<number>(0);

  useEffect(() => {
    api.verifyAuditChain()
      .then(res => {
        setChainValid(res.is_valid);
        setTotalEvents(res.total_events);
      })
      .catch(() => setChainValid(false));
  }, []);

  const handleRoleSelect = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const role = e.target.value;
    onRoleChange(role);

    // Auto-login to obtain matching JWT
    try {
      let username = "citizen";
      let password = "Public@LandSetu2026";
      if (role === "admin") {
        username = "admin";
        password = "Admin@LandSetu2026";
      } else if (role === "official") {
        username = "official";
        password = "Official@LandSetu2026";
      } else if (role === "researcher") {
        username = "researcher";
        password = "Research@LandSetu2026";
      }
      const res = await api.login(username, password);
      setAuthToken(res.token);
    } catch (err) {
      console.error("Auto login error:", err);
    }
  };

  return (
    <>
      <div className="gov-strip">
        <div className="gov-strip-left">
          <span style={{ fontWeight: 700, color: "#f8fafc" }}>GOVERNMENT OF INDIA</span>
          <span>|</span>
          <span>Department of Land Resources (DoLR), Ministry of Rural Development</span>
        </div>
        <div className="gov-strip-right">
          <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <Activity size={12} color="#10b981" />
            <span>AI RETRIEVAL & ML INFERENCE ACTIVE</span>
          </span>
          <span>|</span>
          <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <Database size={12} color="#38bdf8" />
            <span>PROVENANCE: SHA-256 HASH-CHAIN</span>
          </span>
        </div>
      </div>

      <header className="main-header">
        <div className="header-brand">
          <div className="brand-logo-icon">LS</div>
          <div className="brand-text">
            <h1>
              LandSetu <span style={{ fontSize: "0.65rem", padding: "2px 6px", background: "#e8f5e9", color: "#1b4332", borderRadius: "4px", border: "1px solid #a3b18a" }}>SIH26019 PROTOTYPE</span>
            </h1>
            <p>National Digital Platform for Research, Policy Innovation & Evidence-Based Land Governance</p>
          </div>
        </div>

        <div className="header-actions">
          {chainValid !== null && (
            <div className={`badge ${chainValid ? "badge-green" : "badge-red"}`} title="Verified tamper-evident hash-chain audit log">
              <ShieldCheck size={13} />
              <span>Audit Chain: {chainValid ? `VERIFIED (${totalEvents} events)` : "COMPROMISED"}</span>
            </div>
          )}

          <div className="role-badge-selector">
            <UserCheck size={14} color="#1b4332" />
            <label htmlFor="role-select" style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Role:</label>
            <select
              id="role-select"
              className="role-select"
              value={currentRole}
              onChange={handleRoleSelect}
            >
              <option value="public">Citizen / Public Domain</option>
              <option value="researcher">Researcher / Academic</option>
              <option value="official">Government Official</option>
              <option value="admin">Platform Administrator</option>
            </select>
          </div>
        </div>
      </header>
    </>
  );
};
