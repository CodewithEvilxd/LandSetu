import React from "react";
import { 
  LayoutDashboard, 
  Bot, 
  BookOpen, 
  Map, 
  FlaskConical, 
  FileText, 
  Layers, 
  AlertTriangle, 
  FolderGit2, 
  Lightbulb, 
  ShieldCheck 
} from "lucide-react";

export type NavTabId = 
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
  const tabs: Array<{ id: NavTabId; label: string; icon: React.ReactNode }> = [
    { id: "dashboard", label: "Executive Dashboard", icon: <LayoutDashboard size={16} /> },
    { id: "ask", label: "Ask Assistant (RAG)", icon: <Bot size={16} /> },
    { id: "repository", label: "Data & Statutes", icon: <BookOpen size={16} /> },
    { id: "gis", label: "GIS & Spatial Lab", icon: <Map size={16} /> },
    { id: "policy", label: "Policy Lab", icon: <FlaskConical size={16} /> },
    { id: "digitizer", label: "Record Digitizer (OCR)", icon: <FileText size={16} /> },
    { id: "acquisition", label: "Acquisition Lifecycle", icon: <Layers size={16} /> },
    { id: "risk", label: "Predictive Risk ML", icon: <AlertTriangle size={16} /> },
    { id: "workspaces", label: "Workspaces", icon: <FolderGit2 size={16} /> },
    { id: "innovation", label: "Innovation Hub", icon: <Lightbulb size={16} /> },
    { id: "audit", label: "Provenance & Audit", icon: <ShieldCheck size={16} /> }
  ];

  return (
    <nav className="nav-bar">
      {tabs.map(t => (
        <button
          key={t.id}
          className={`nav-tab ${activeTab === t.id ? "active" : ""}`}
          onClick={() => onTabSelect(t.id)}
        >
          {t.icon}
          <span>{t.label}</span>
        </button>
      ))}
    </nav>
  );
};
