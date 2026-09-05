import React, { useEffect, useState } from "react";
import { api, setAuthToken } from "../api/client.js";
import { ShieldCheck, UserCheck, Landmark, Activity, Compass } from "lucide-react";

interface HeaderProps {
  currentRole: string;
  onRoleChange: (newRole: string) => void;
  onNavigateHome?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ currentRole, onRoleChange, onNavigateHome }) => {
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
      <div className="national-accent-strip" />
      <header className="masthead">
        <a href="#landing" className="masthead-brand">
          <div className="emblem-badge">
            <Landmark size={20} strokeWidth={1.8} />
          </div>
          <div>
            <div className="brand-title">
              LANDSETU (भू-सेतु)
              <span className="gov-pill gov-pill-navy" style={{ fontSize: "0.65rem", padding: "1px 6px" }}>
                SIH26019
              </span>
            </div>
            <div className="brand-mandate">
              Department of Land Resources • Ministry of Rural Development • Government of India
            </div>
          </div>
        </a>

        <div className="masthead-status">
          <div className="system-status-chip">
            <span className="status-pulse"></span>
            <span>SERVICES OPERATIONAL</span>
          </div>

          {chainValid && (
            <div className="gov-pill gov-pill-emerald" style={{ gap: "5px" }}>
              <ShieldCheck size={13} />
              <span>SHA-256 LEDGER ({totalEvents})</span>
            </div>
          )}

          {onNavigateHome && (
            <button 
              onClick={onNavigateHome}
              className="gov-btn gov-btn-outline" 
              style={{ fontSize: "0.78rem", padding: "5px 12px", display: "flex", alignItems: "center", gap: "5px", cursor: "pointer", background: "#ffffff", borderColor: "#cbd5e1" }}
              title="Return to Public Homepage"
            >
              <Compass size={13} color="var(--primary)" />
              <span>Public Homepage</span>
            </button>
          )}

          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <UserCheck size={15} style={{ color: "var(--text-muted)" }} />
            <select
              value={currentRole}
              onChange={handleRoleSelect}
              className="gov-select"
              style={{ padding: "5px 10px", fontSize: "0.78rem", width: "auto", minWidth: "140px" }}
            >
              <option value="public">Role: Citizen / Public</option>
              <option value="researcher">Role: Legal Researcher</option>
              <option value="official">Role: DoLR Official</option>
              <option value="admin">Role: System Admin</option>
            </select>
          </div>
        </div>
      </header>
    </>
  );
};
