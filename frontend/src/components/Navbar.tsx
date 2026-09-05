import React, { useState, useEffect } from "react";
import { 
  Compass,
  LayoutDashboard, 
  Search, 
  MapPin, 
  Map,
  FlaskConical, 
  FileText, 
  GitCommit, 
  AlertOctagon, 
  FolderGit2, 
  Lightbulb, 
  ShieldCheck,
  BookOpen,
  ChevronDown
} from "lucide-react";

export type NavTabId = 
  | "home"
  | "landing"
  | "dashboard"
  | "ask"
  | "khasra"
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

interface NavSection {
  id: string;
  title: string;
  icon: React.ReactNode;
  tabs: Array<{ id: NavTabId; label: string; icon: React.ReactNode }>;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, onTabSelect }) => {
  const sections: NavSection[] = [
    {
      id: "overview",
      title: "Overview",
      icon: <Compass className="nav-icon" />,
      tabs: [
        { id: "home", label: "Public Homepage", icon: <Compass className="nav-icon" /> },
        { id: "dashboard", label: "National Command", icon: <LayoutDashboard className="nav-icon" /> },
        { id: "landing", label: "Gateway & Mandate", icon: <BookOpen className="nav-icon" /> },
      ]
    },
    {
      id: "intelligence",
      title: "Intelligence",
      icon: <FlaskConical className="nav-icon" />,
      tabs: [
        { id: "ask", label: "Legal RAG Assistant", icon: <Search className="nav-icon" /> },
        { id: "khasra", label: "National Cadastral Map", icon: <Map className="nav-icon" /> },
        { id: "gis", label: "Spatial GIS Lab", icon: <MapPin className="nav-icon" /> },
        { id: "policy", label: "Policy Sandbox", icon: <FlaskConical className="nav-icon" /> },
      ]
    },
    {
      id: "operations",
      title: "Operations",
      icon: <GitCommit className="nav-icon" />,
      tabs: [
        { id: "risk", label: "Predictive Delay ML", icon: <AlertOctagon className="nav-icon" /> },
        { id: "digitizer", label: "Record Digitizer (OCR)", icon: <FileText className="nav-icon" /> },
        { id: "acquisition", label: "Infrastructure Projects", icon: <GitCommit className="nav-icon" /> },
      ]
    },
    {
      id: "governance",
      title: "Governance",
      icon: <ShieldCheck className="nav-icon" />,
      tabs: [
        { id: "repository", label: "Central Repository", icon: <BookOpen className="nav-icon" /> },
        { id: "audit", label: "Cryptographic Ledger", icon: <ShieldCheck className="nav-icon" /> },
        { id: "workspaces", label: "Research Workspaces", icon: <FolderGit2 className="nav-icon" /> },
        { id: "innovation", label: "Innovation Hub", icon: <Lightbulb className="nav-icon" /> },
      ]
    }
  ];

  const getSectionForTab = (tab: NavTabId): string => {
    for (const sec of sections) {
      if (sec.tabs.some(t => t.id === tab)) {
        return sec.id;
      }
    }
    return "overview";
  };

  // Radio Accordion State: only ONE section open at a time ("ek khule to dusra band ho jaye")
  const [openSectionId, setOpenSectionId] = useState<string>(() => getSectionForTab(activeTab));

  // Sync open section when activeTab changes
  useEffect(() => {
    const parentSection = getSectionForTab(activeTab);
    setOpenSectionId(parentSection);
  }, [activeTab]);

  const handleSectionToggle = (secId: string) => {
    // If clicking an unopened section, it opens that section and closes all others (radio behavior)
    // If clicking the already opened section, toggle it closed/open
    setOpenSectionId(prev => (prev === secId ? "" : secId));
  };

  return (
    <aside className="app-sidebar">
      {sections.map(sec => {
        const isOpen = openSectionId === sec.id;
        const hasActiveChild = sec.tabs.some(t => t.id === activeTab);

        return (
          <div key={sec.id} className="nav-accordion-section">
            {/* Section Header with Dropdown Trigger */}
            <button
              type="button"
              className={`nav-accordion-header ${isOpen ? "is-open" : ""} ${hasActiveChild ? "has-active-child" : ""}`}
              onClick={() => handleSectionToggle(sec.id)}
              title={`Click to ${isOpen ? "collapse" : "expand"} ${sec.title}`}
            >
              <div className="nav-accordion-title-group">
                {sec.icon}
                <span>{sec.title}</span>
              </div>

              <div className="nav-accordion-meta">
                {hasActiveChild && <span className="nav-active-pill" title="Contains active page" />}
                <span className="nav-section-badge">{sec.tabs.length}</span>
                <ChevronDown className={`nav-chevron-icon ${isOpen ? "rotated" : ""}`} />
              </div>
            </button>

            {/* Collapsible Dropdown Body */}
            {isOpen && (
              <div className="nav-accordion-content">
                {sec.tabs.map(t => {
                  const isActive = activeTab === t.id;
                  return (
                    <button
                      key={t.id}
                      type="button"
                      className={`nav-link ${isActive ? "active" : ""}`}
                      onClick={() => onTabSelect(t.id)}
                      style={{
                        width: "100%",
                        background: "none",
                        border: "none",
                        textAlign: "left",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: "8px"
                      }}
                    >
                      {/* Radio button indicator */}
                      <div className="nav-radio-indicator">
                        <div className="nav-radio-inner-dot" />
                      </div>

                      {t.icon}
                      <span style={{ flex: 1 }}>{t.label}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}

      <div style={{ marginTop: "auto", padding: "14px 12px 0", borderTop: "1px solid var(--border-hairline)" }}>
        <div style={{ fontSize: "0.72rem", color: "var(--text-muted)", fontFamily: "var(--font-tech)" }}>
          LANDSETU v1.0 • DoLR SIH26019
        </div>
      </div>
    </aside>
  );
};

export default Navbar;
