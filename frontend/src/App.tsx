import React, { useState } from "react";
import { Header } from "./components/Header.js";
import { Navbar, NavTabId } from "./components/Navbar.js";
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

export function App() {
  const [activeTab, setActiveTab] = useState<NavTabId>("dashboard");
  const [currentRole, setCurrentRole] = useState<string>("admin");

  return (
    <div className="app-container">
      <Header currentRole={currentRole} onRoleChange={setCurrentRole} />
      <Navbar activeTab={activeTab} onTabSelect={setActiveTab} />

      <main className="content-wrapper">
        {activeTab === "dashboard" && <DashboardPage onNavigate={setActiveTab} />}
        {activeTab === "ask" && <AskAssistantPage />}
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

      <footer className="main-footer">
        <div>
          <strong>LandSetu</strong> &mdash; SIH26019 Prototype. National Digital Platform for Land Governance Intelligence.
        </div>
        <div>
          Provenance: SHA-256 Hash Chain | AI: Grounded RAG + scikit-learn GBM | Interop: Bhuvan / NJDG / DILRMP
        </div>
      </footer>
    </div>
  );
}

export default App;
