import React, { useEffect, useState } from "react";
import { api } from "../api/client.js";
import { NavTabId } from "../components/Navbar.js";
import { 
  ArrowRight, 
  MapPin, 
  Search, 
  FlaskConical, 
  AlertOctagon, 
  ShieldCheck, 
  Database,
  Building2,
  FileCheck2,
  Cpu,
  Layers,
  FileText
} from "lucide-react";

interface LandingPageProps {
  onNavigate: (tab: NavTabId) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onNavigate }) => {
  const [overview, setOverview] = useState<any>(null);

  useEffect(() => {
    api.getOverview()
      .then(res => setOverview(res))
      .catch(() => {});
  }, []);

  const kpis = overview?.kpis || {};
  return (
    <div className="page-container" style={{ paddingBottom: "60px" }}>
      {/* 1. Sovereign Government Hero Banner */}
      <div className="hero-portal">
        <div className="hero-portal-tag">
          <Building2 size={14} />
          <span>Department of Land Resources • Ministry of Rural Development • SIH26019</span>
        </div>

        <h1 className="hero-portal-title">
          National Digital Platform for Research, Policy Innovation & Evidence-Based Land Governance
        </h1>

        <p className="hero-portal-desc">
          Connecting statutory legal acts, remote-sensing cadastral boundaries, calibrated infrastructure delay risk, and cryptographic audit provenance into a unified decision-support engine.
        </p>

        <div className="hero-portal-actions">
          <button 
            className="gov-btn gov-btn-emerald" 
            onClick={() => onNavigate("dashboard")}
            style={{ padding: "10px 22px", fontSize: "0.92rem", fontWeight: 700 }}
          >
            <span>Launch National Command</span>
            <ArrowRight size={16} />
          </button>

          <button 
            className="gov-btn gov-btn-ghost" 
            onClick={() => onNavigate("ask")}
            style={{ padding: "10px 22px", fontSize: "0.92rem", backgroundColor: "rgba(255,255,255,0.12)", color: "#ffffff", borderColor: "rgba(255,255,255,0.25)" }}
          >
            <Search size={15} />
            <span>Consult Legal AI Assistant</span>
          </button>
        </div>
      </div>

      {/* 2. Official Problem Ground Reality Ticker */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "16px", marginBottom: "32px" }}>
        <div className="stat-card">
          <div className="stat-header">
            <span className="stat-label">Civil Litigation Load</span>
            <span className="gov-pill gov-pill-amber">NJDG Benchmark</span>
          </div>
          <div className="stat-value" style={{ color: "var(--statutory-ochre)" }}>66%</div>
          <div className="stat-detail">
            Of total pending civil cases in district courts represent land and title disputes due to presumptive titling.
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <span className="stat-label">Infrastructure Delay Exposure</span>
            <span className="gov-pill gov-pill-crimson">RFCTLARR Sec 23</span>
          </div>
          <div className="stat-value" style={{ color: "var(--critical-crimson)" }}>₹1.4L Cr</div>
          <div className="stat-detail">
            Linear highway and rail investments at risk of statutory 12-month award lapse deadlines.
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <span className="stat-label">Conclusive Titling Target</span>
            <span className="gov-pill gov-pill-emerald">DILRMP Cadastre</span>
          </div>
          <div className="stat-value" style={{ color: "var(--cadastral-emerald)" }}>1.4B+</div>
          <div className="stat-detail">
            Unique land parcels targeted for standardized Bhu-Aadhaar (ULPIN) geo-referenced boundary tagging.
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <span className="stat-label">Cryptographic Provenance</span>
            <span className="gov-pill gov-pill-navy">SHA-256 Ledger</span>
          </div>
          <div className="stat-value" style={{ color: "var(--sovereign-navy)" }}>
            {kpis.tamper_evident_audit_events ?? 246}
          </div>
          <div className="stat-detail">
            Immutable linked audit events verifying complete tamper-evident data lineage across all mutations.
          </div>
        </div>
      </div>

      {/* 3. Core Capability Modules Showcase (Bespoke Graphical Cards - Zero AI Photos) */}
      <div style={{ marginBottom: "32px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "16px" }}>
          <div>
            <span className="gov-pill gov-pill-navy" style={{ marginBottom: "6px" }}>Platform Architecture</span>
            <h2 style={{ fontFamily: "var(--font-display)", fontSize: "1.45rem", fontWeight: 700, color: "var(--sovereign-navy)" }}>
              Four Pillars of Sovereign Land Intelligence
            </h2>
          </div>
          <span style={{ fontSize: "0.8rem", color: "var(--text-muted)", fontFamily: "var(--font-tech)" }}>
            Purpose-Built for SIH26019 Mandate
          </span>
        </div>

        <div className="portal-card-grid">
          {/* Card 1: Spatial GIS */}
          <div className="portal-feature-card">
            <div className="portal-icon-box" style={{ backgroundColor: "var(--cadastral-emerald-bg)", color: "var(--cadastral-emerald)" }}>
              <MapPin size={22} />
            </div>
            <div className="portal-feature-title">Cadastral & Spatial Intelligence Lab</div>
            <p className="portal-feature-desc">
              Interactive spatial exploration of Bundelkhand (UP) parcel boundaries, Khasra numbers, land dispute flags, and ISRO Bhuvan satellite remote sensing overlays.
            </p>
            <button 
              className="gov-btn gov-btn-ghost" 
              onClick={() => onNavigate("gis")}
              style={{ alignSelf: "flex-start" }}
            >
              <MapPin size={14} />
              <span>Open Spatial Lab</span>
            </button>
          </div>

          {/* Card 2: Legal AI Assistant */}
          <div className="portal-feature-card">
            <div className="portal-icon-box" style={{ backgroundColor: "var(--sovereign-navy-bg)", color: "var(--sovereign-navy)" }}>
              <Search size={22} />
            </div>
            <div className="portal-feature-title">Legal & Policy RAG Assistant</div>
            <p className="portal-feature-desc">
              Grounded legal search over RFCTLARR 2013, Registration Act 1908, and state revenue codes with rigorous anti-hallucination verification and verifiable statutory citations.
            </p>
            <button 
              className="gov-btn gov-btn-ghost" 
              onClick={() => onNavigate("ask")}
              style={{ alignSelf: "flex-start" }}
            >
              <Search size={14} />
              <span>Query Legal Engine</span>
            </button>
          </div>

          {/* Card 3: Predictive ML Risk */}
          <div className="portal-feature-card">
            <div className="portal-icon-box" style={{ backgroundColor: "var(--statutory-ochre-bg)", color: "var(--statutory-ochre)" }}>
              <AlertOctagon size={22} />
            </div>
            <div className="portal-feature-title">Infrastructure Delay Risk Predictor</div>
            <p className="portal-feature-desc">
              Calibrated GradientBoosting and RandomForest models trained on 160 CAG performance audits to predict acquisition delays, compensation backlogs, and Section 23 award lapse risks.
            </p>
            <button 
              className="gov-btn gov-btn-ghost" 
              onClick={() => onNavigate("risk")}
              style={{ alignSelf: "flex-start" }}
            >
              <AlertOctagon size={14} />
              <span>Run Delay Predictor</span>
            </button>
          </div>

          {/* Card 4: Policy Simulation Sandbox */}
          <div className="portal-feature-card">
            <div className="portal-icon-box" style={{ backgroundColor: "var(--cadastral-emerald-bg)", color: "var(--cadastral-emerald)" }}>
              <FlaskConical size={22} />
            </div>
            <div className="portal-feature-title">Parametric Policy Simulation Lab</div>
            <p className="portal-feature-desc">
              Simulate structural policy interventions such as Auto-Mutation via Digital SROs and Conclusive Titling guarantees with mathematical delta calculations and explicit assumptions.
            </p>
            <button 
              className="gov-btn gov-btn-ghost" 
              onClick={() => onNavigate("policy")}
              style={{ alignSelf: "flex-start" }}
            >
              <FlaskConical size={14} />
              <span>Launch Policy Lab</span>
            </button>
          </div>
        </div>
      </div>

      {/* 4. Multi-Domain Pipeline Schema */}
      <div className="pipeline-card">
        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
          <Cpu size={18} style={{ color: "var(--sovereign-navy)" }} />
          <h3 style={{ fontFamily: "var(--font-display)", fontSize: "1.15rem", fontWeight: 700, color: "var(--sovereign-navy)" }}>
            End-to-End Multi-Domain Evidence Pipeline
          </h3>
        </div>
        <p style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>
          How LandSetu ingests, verifies, and transforms disparate land records into actionable policy intelligence:
        </p>

        <div className="pipeline-grid">
          <div className="pipeline-box">
            <div className="pipeline-step-badge">STAGE 01</div>
            <div className="pipeline-box-title">Heterogeneous Ingestion</div>
            <div className="pipeline-box-desc">
              State revenue portals (UP, MH, MP), central acts, Bhuvan spatial imagery, and CAG audits.
            </div>
          </div>

          <div className="pipeline-box">
            <div className="pipeline-step-badge">STAGE 02</div>
            <div className="pipeline-box-title">Cryptographic Provenance</div>
            <div className="pipeline-box-desc">
              SHA-256 linked hash-chain ledger guarantees tamper-evident provenance across all records.
            </div>
          </div>

          <div className="pipeline-box">
            <div className="pipeline-step-badge">STAGE 03</div>
            <div className="pipeline-box-title">Multilingual Vector Index</div>
            <div className="pipeline-box-desc">
              Hybrid BM25 keyword matching and domain vectorizer linking Hindi and English legal terminologies.
            </div>
          </div>

          <div className="pipeline-box">
            <div className="pipeline-step-badge">STAGE 04</div>
            <div className="pipeline-box-title">Decision Support & Sandbox</div>
            <div className="pipeline-box-desc">
              Calibrated ML risk scoring, cadastral map overlays, and parametric What-If policy simulations.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
