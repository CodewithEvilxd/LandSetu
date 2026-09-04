import React from "react";
import { 
  Compass,
  LayoutDashboard, 
  Search, 
  MapPin, 
  FlaskConical, 
  FileText, 
  GitCommit, 
  AlertOctagon, 
  FolderGit2, 
  Lightbulb, 
  ShieldCheck,
  BookOpen
} from "lucide-react";

export type NavTabId = 
  | "landing"
  | "dashboard"
  | "ask"
  | "repository"
  | "gis"
  | "policy"
  | "digitizer"
  | "acquisition"
  | "risk"
  | "workspaces"
  | "innovation"
  | "audit";

interface NavbarProps {
  activeTab: NavTabId;
  onTabSelect: (tab: NavTabId) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, onTabSelect }) => {
  const sections: Array<{
    title: string;
    tabs: Array<{ id: NavTabId; label: string; icon: React.ReactNode }>;
  }> = [
    {
      title: "Overview",
      tabs: [
        { id: "landing", label: "Gateway & Mandate", icon: <Compass className="nav-icon" /> },
        { id: "dashboard", label: "National Command", icon: <LayoutDashboard className="nav-icon" /> },
      ]
    },
    {
      title: "Intelligence",
      tabs: [
        { id: "ask", label: "Legal RAG Assistant", icon: <Search className="nav-icon" /> },
        { id: "gis", label: "Spatial GIS Lab", icon: <MapPin className="nav-icon" /> },
        { id: "policy", label: "Policy Sandbox", icon: <FlaskConical className="nav-icon" /> },
      ]
    },
    {
      title: "Operations",
      tabs: [
        { id: "risk", label: "Predictive Delay ML", icon: <AlertOctagon className="nav-icon" /> },
        { id: "digitizer", label: "Record Digitizer (OCR)", icon: <FileText className="nav-icon" /> },
        { id: "acquisition", label: "Infrastructure Projects", icon: <GitCommit className="nav-icon" /> },
      ]
    },
    {
      title: "Governance",
      tabs: [
        { id: "repository", label: "Central Repository", icon: <BookOpen className="nav-icon" /> },
        { id: "audit", label: "Cryptographic Ledger", icon: <ShieldCheck className="nav-icon" /> },
        { id: "workspaces", label: "Research Workspaces", icon: <FolderGit2 className="nav-icon" /> },
        { id: "innovation", label: "Innovation Hub", icon: <Lightbulb className="nav-icon" /> },
      ]
    }
  ];

  return (
    <aside className="app-sidebar">
      {sections.map(sec => (
        <div key={sec.title} style={{ marginBottom: "12px" }}>
          <div className="nav-section-title">{sec.title}</div>
          {sec.tabs.map(t => (
            <button
              key={t.id}
              className={`nav-link ${activeTab === t.id ? "active" : ""}`}
              onClick={() => onTabSelect(t.id)}
              style={{ width: "100%", background: "none", border: "none", textAlign: "left", cursor: "pointer" }}
            >
              {t.icon}
              <span>{t.label}</span>
            </button>
          ))}
        </div>
      ))}

      <div style={{ marginTop: "auto", padding: "14px 12px 0", borderTop: "1px solid var(--border-hairline)" }}>
        <div style={{ fontSize: "0.72rem", color: "var(--text-muted)", fontFamily: "var(--font-tech)" }}>
          LANDSETU v1.0 • DoLR SIH26019
        </div>
      </div>
    </aside>
  );
};
