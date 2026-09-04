import React, { useState } from "react";
import { Header } from "./components/Header.js";
import { Navbar, NavTabId } from "./components/Navbar.js";
import { LandingPage } from "./pages/LandingPage.js";
import { DashboardPage } from "./pages/DashboardPage.js";
import { AskAssistantPage } from "./pages/AskAssistantPage.js";
import { RepositoryPage } from "./pages/RepositoryPage.js";
import { GISMapPage } from "./pages/GISMapPage.js";
import { PolicyLabPage } from "./pages/PolicyLabPage.js";
import { DigitizerPage } from "./pages/DigitizerPage.js";
import { AcquisitionPage } from "./pages/AcquisitionPage.js";
import { PredictiveRiskPage } from "./pages/PredictiveRiskPage.js";
import { WorkspacesPage } from "./pages/WorkspacesPage.js";
import { InnovationPage } from "./pages/InnovationPage.js";
import { AuditPage } from "./pages/AuditPage.js";
import { KhasraMapPage } from "./pages/KhasraMapPage.js";

const VALID_TABS: NavTabId[] = [
  "landing",
  "dashboard",
  "ask",
  "khasra",
  "repository",
  "gis",
  "policy",
  "digitizer",
  "acquisition",
  "risk",
  "workspaces",
  "innovation",
  "audit"
];

export function App() {
  const getTabFromHash = (): NavTabId => {
    const raw = window.location.hash.replace("#", "").split("?")[0] as NavTabId;
    return VALID_TABS.includes(raw) ? raw : "landing";
  };

  const [activeTab, setActiveTab] = useState<NavTabId>(getTabFromHash);
  const [currentRole, setCurrentRole] = useState<string>("admin");

  React.useEffect(() => {
    const handleHash = () => {
      const tab = getTabFromHash();
      setActiveTab(tab);
    };
    window.addEventListener("hashchange", handleHash);
    return () => window.removeEventListener("hashchange", handleHash);
  }, []);

  const handleTabSelect = (tab: NavTabId) => {
    setActiveTab(tab);
    window.location.hash = tab;
    // Scroll viewport to top on tab switch
    const viewport = document.querySelector(".main-viewport");
    if (viewport) {
      viewport.scrollTop = 0;
    }
  };

  return (
    <div className="app-container">
      <Header currentRole={currentRole} onRoleChange={setCurrentRole} />
      
      <div className="app-body">
        <Navbar activeTab={activeTab} onTabSelect={handleTabSelect} />

        <main className="main-viewport">
          {activeTab === "landing" && <LandingPage onNavigate={handleTabSelect} />}
          {activeTab === "dashboard" && <DashboardPage onNavigate={handleTabSelect} />}
          {activeTab === "ask" && <AskAssistantPage />}
          {activeTab === "khasra" && <KhasraMapPage />}
          {activeTab === "repository" && <RepositoryPage />}
          {activeTab === "gis" && <GISMapPage />}
          {activeTab === "policy" && <PolicyLabPage />}
          {activeTab === "digitizer" && <DigitizerPage userRole={currentRole} />}
          {activeTab === "acquisition" && <AcquisitionPage userRole={currentRole} />}
          {activeTab === "risk" && <PredictiveRiskPage />}
          {activeTab === "workspaces" && <WorkspacesPage userRole={currentRole} />}
          {activeTab === "innovation" && <InnovationPage />}
          {activeTab === "audit" && <AuditPage />}
        </main>
      </div>
    </div>
  );
}
export default App;
