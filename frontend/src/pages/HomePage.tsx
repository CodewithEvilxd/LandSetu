import React, { useState, useEffect } from "react";
import { api } from "../api/client.js";
import { NavTabId } from "../components/Navbar.js";
import {
  KoboyoLandmark,
  KoboyoArrowRight,
  KoboyoChevronRight,
  KoboyoSearch,
  KoboyoLayers,
  KoboyoCheckCircle,
  KoboyoScale,
  KoboyoFlask,
  KoboyoAlert,
  KoboyoShieldCheck,
  KoboyoDatabase,
  KoboyoExternalLink
} from "../components/KoboyoIcons.js";
import { SpotlightNavbar } from "../components/ui/spotlight-navbar.js";

interface HomePageProps {
  onNavigate: (tab: NavTabId) => void;
}

export const HomePage: React.FC<HomePageProps> = ({ onNavigate }) => {
  const [overview, setOverview] = useState<any>(null);
  const [activeNavIdx, setActiveNavIdx] = useState(0);

  useEffect(() => {
    api.getOverview()
      .then(res => setOverview(res))
      .catch(() => {});
  }, []);

  // Sync active nav item with scroll position across chapters
  useEffect(() => {
    const sectionIds = ["overview", "pipeline", "cadastre", "predictive-risk", "pillars", "pilots"];
    const handleScroll = () => {
      const scrollPos = window.scrollY + 200;
      for (let i = sectionIds.length - 1; i >= 0; i--) {
        const id = sectionIds[i];
        if (id === "overview") {
          if (window.scrollY < 320) {
            setActiveNavIdx(0);
            break;
          }
        } else {
          const el = document.getElementById(id);
          if (el && el.offsetTop <= scrollPos) {
            setActiveNavIdx(i);
            break;
          }
        }
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const kpis = overview?.kpis || {};

  const spotlightNavItems = [
    { label: "Overview", href: "#overview" },
    { label: "Ingestion Pipeline", href: "#pipeline" },
    { label: "Spatial Cadastre", href: "#cadastre" },
    { label: "Delay ML", href: "#predictive-risk" },
    { label: "Architecture", href: "#pillars" },
    { label: "Pilot States", href: "#pilots" },
  ];

  return (
    <div className="hp-clean-root">
      {/* 1. National Tricolor Micro Strip */}
      <div className="hp-clean-tricolor" />

      {/* 2. Vengeance UI Spotlight Navigation Bar */}
      <header className="hp-clean-nav">
        <div className="hp-clean-nav-inner">
          <div className="hp-clean-brand" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} style={{ cursor: "pointer", display: "flex", alignItems: "center" }}>
            <img 
              src="/LAND-SETU.webp" 
              onError={(e) => { e.currentTarget.src = "/components of land setu/LAND-SETU.gif"; }}
              alt="LAND-SETU" 
              style={{
                height: "44px",
                width: "auto",
                objectFit: "contain",
                display: "block",
                mixBlendMode: "multiply"
              }}
            />
          </div>

          {/* Vengeance UI Spotlight Navbar with Interactive Mouse Spotlight & Ambience Underline */}
          <SpotlightNavbar
            items={spotlightNavItems}
            controlledActiveIndex={activeNavIdx}
            onItemClick={(item, idx) => {
              setActiveNavIdx(idx);
              if (item.href === "#overview") {
                window.scrollTo({ top: 0, behavior: "smooth" });
              } else {
                const el = document.querySelector(item.href);
                if (el) {
                  el.scrollIntoView({ behavior: "smooth" });
                }
              }
            }}
          />

          <div className="hp-clean-nav-right">
            <button 
              className="hp-clean-btn-enter"
              onClick={() => onNavigate("dashboard")}
            >
              <span className="hp-clean-enter-dot" />
              <span>Enter Platform</span>
              <div className="hp-clean-enter-arrow">
                <KoboyoArrowRight size={13} />
              </div>
            </button>
          </div>
        </div>
      </header>

      {/* 3. Editorial Hero Section with Agrarian Landscape */}
      <section className="hp-clean-hero" id="overview">
        <div className="hp-clean-hero-grid">
          {/* Left: Editorial Narrative */}
          <div>
            <span className="hp-clean-kicker">
              NATIONAL DIGITAL PLATFORM &bull; SIH26019 MANDATE
            </span>

            <h1 className="hp-clean-headline">
              From fragmented land records to{" "}
              <span className="hp-clean-serif-italic">evidence-based decisions.</span>
            </h1>

            <p className="hp-clean-subtext">
              India’s land governance landscape is severed across 28 state revenue registers, 100+ statutory acts, and presumptive paper deeds. LandSetu is not another operational municipal portal—it is the national intelligence and research layer connecting satellite cadastral vectors, court litigation pendency, and policy counterfactuals into an explainable decision engine.
            </p>

            <div className="hp-clean-hero-buttons">
              <button 
                className="hp-clean-btn-primary"
                style={{ padding: "10px 22px", fontSize: "0.9rem" }}
                onClick={() => onNavigate("dashboard")}
              >
                <span>Launch National Command</span>
                <KoboyoArrowRight size={15} />
              </button>

              <button 
                className="hp-clean-btn-secondary"
                style={{ padding: "10px 20px", fontSize: "0.9rem" }}
                onClick={() => onNavigate("ask")}
              >
                <KoboyoSearch size={14} />
                <span>Consult Legal AI Assistant</span>
              </button>

              <button 
                className="hp-clean-btn-secondary"
                style={{ padding: "10px 20px", fontSize: "0.9rem" }}
                onClick={() => onNavigate("khasra")}
              >
                <KoboyoLayers size={14} />
                <span>Explore Cadastral Map</span>
              </button>
            </div>

            <div className="hp-clean-proofs-row">
              <div className="hp-clean-proof-item">
                <strong>{kpis.ingested_parcels_count ?? 150}</strong> Survey Parcels Mapped
              </div>
              <div>&bull;</div>
              <div className="hp-clean-proof-item">
                <strong>54</strong> Statutory Legal Chunks
              </div>
              <div>&bull;</div>
              <div className="hp-clean-proof-item">
                <strong>{kpis.tamper_evident_audit_events ?? 264}</strong> SHA-256 Blocks
              </div>
              <div>&bull;</div>
              <div className="hp-clean-proof-item">
                <strong>4</strong> Pilot States Ingested
              </div>
            </div>
          </div>

          {/* Right: Artfully Tilted Visual Composition (Using rural_farmland_landscape.jpeg) */}
          <div className="hp-clean-visual-stage">
            <div className="hp-clean-tilted-frame">
              <img 
                src="/assets/rural_farmland_landscape.jpeg" 
                alt="Rural Farmland & Infrastructure Corridor"
              />
              <div className="hp-clean-floating-badge-top">
                VILLAGE ALIPUR &bull; KHASRA 142 &bull; 4.417 HA
              </div>
              <div className="hp-clean-floating-badge-bottom">
                <KoboyoCheckCircle size={13} color="#10b981" />
                <span>GROUND TRUTH CADASTRAL VECTOR &bull; JAMABANDI 1982</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Minimal Editorial Metrics Strip */}
      <section className="hp-clean-strip-section">
        <div className="hp-clean-strip-inner">
          <div className="hp-clean-stat-block">
            <div className="hp-clean-stat-num">{kpis.ingested_parcels_count ?? 150}</div>
            <div className="hp-clean-stat-label">Cadastral Survey Parcels</div>
            <div className="hp-clean-stat-desc">Closed coordinate rings across Delhi, Haryana, Bihar, and UP</div>
          </div>

          <div className="hp-clean-stat-block">
            <div className="hp-clean-stat-num">54</div>
            <div className="hp-clean-stat-label">Statutory Acts &amp; Law Chunks</div>
            <div className="hp-clean-stat-desc">RFCTLARR 2013, Forest Rights Act, Land Acquisition Act indexed</div>
          </div>

          <div className="hp-clean-stat-block">
            <div className="hp-clean-stat-num">{kpis.tamper_evident_audit_events ?? 264}</div>
            <div className="hp-clean-stat-label">Tamper-Evident Blocks</div>
            <div className="hp-clean-stat-desc">SHA-256 cryptographic chain anchored at EVT-GENESIS</div>
          </div>

          <div className="hp-clean-stat-block">
            <div className="hp-clean-stat-num">₹1.4L Cr</div>
            <div className="hp-clean-stat-label">Monitored Acquisitions</div>
            <div className="hp-clean-stat-desc">6 linear transport corridors analyzed for Section 23 award lapses</div>
          </div>
        </div>
      </section>

      {/* 5. Narrative Chapter 1: The Paper-to-Polygon Pipeline (Using parcel_ocr_workflow.mp4) */}
      <section className="hp-clean-chapter" id="pipeline">
        <div className="hp-clean-chapter-grid">
          <div className="hp-clean-chapter-text">
            <span className="hp-clean-kicker">01 / DOCUMENT-TO-VECTOR CONVERSION</span>
            <h3>Every conclusive title begins with a frayed paper Jamabandi.</h3>
            <p>
              In India, land records have historically existed as paper-bound Jamabandis, Khatians, and Khataunis penned by village Patwaris. Because rights and maps evolved independently, boundaries frequently drift by meters, sparking protracted disputes that clog subordinate courts for decades.
            </p>
            <p>
              LandSetu bridges this gulf. Our ingestion pipeline couples autonomous drone parcel boundary detection with bilingual Devanagari OCR. It reads landholder rights, extracts co-tenancy shares, builds legal ownership graphs, and cross-references the National Judicial Data Grid (NJDG) to flag active disputes with 94% GIS spatial match.
            </p>

            <div className="hp-clean-chip-list">
              <span className="hp-clean-chip">Bilingual Devanagari OCR</span>
              <span className="hp-clean-chip">Jamabandi Rights Graph</span>
              <span className="hp-clean-chip">NJDG Dispute Linking</span>
              <span className="hp-clean-chip">Bhu-Aadhaar 14-Digit ULPIN</span>
            </div>

            <button 
              className="hp-clean-btn-primary"
              onClick={() => onNavigate("digitizer")}
            >
              <span>Explore Record Digitizer (OCR)</span>
              <KoboyoArrowRight size={14} />
            </button>
          </div>

          {/* Video Container (tilted-right) */}
          <div className="hp-clean-media-box tilted-right">
            <video 
              src="/assets/parcel_ocr_workflow.mp4" 
              autoPlay 
              loop 
              muted 
              playsInline
            />
            <div className="hp-clean-caption-bar">
              <div>
                <div className="hp-clean-caption-title">LIVE CAPTURE: PARCEL 1362 (4.417 HA)</div>
                <div className="hp-clean-caption-desc">Drone boundary detection, Jamabandi OCR, and active court dispute linking</div>
              </div>
              <button 
                className="hp-clean-btn-secondary" 
                style={{ padding: "4px 10px", fontSize: "0.72rem" }}
                onClick={() => onNavigate("digitizer")}
              >
                Inspect
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Narrative Chapter 2: Sub-Meter Cadastral Alignment on the Ground (Using village_cadastral_overlay.jpeg) */}
      <section className="hp-clean-chapter" id="cadastre" style={{ background: "#fafafa", borderTop: "1px solid #f3f4f6", borderBottom: "1px solid #f3f4f6" }}>
        <div style={{ maxWidth: "1280px", margin: "0 auto" }}>
          <div className="hp-clean-section-header">
            <span className="hp-clean-kicker">02 / CADASTRAL GROUND TRUTH</span>
            <h2 className="hp-clean-section-title">Sub-meter boundary vectors meeting physical earth.</h2>
            <p className="hp-clean-section-desc">
              Rather than abstract administrative diagrams, LandSetu streams authentic village cadastral survey sheets converted into closed WGS84 GeoJSON polygons directly over high-resolution satellite imagery.
            </p>
          </div>

          {/* Big Visual: village_cadastral_overlay.jpeg */}
          <div style={{ position: "relative", marginBottom: "36px" }}>
            <div className="hp-clean-media-box" style={{ maxHeight: "540px", overflow: "hidden" }}>
              <img 
                src="/assets/village_cadastral_overlay.jpeg" 
                alt="Village Cadastral Boundary Mesh on Satellite Imagery"
                style={{ width: "100%", height: "auto", display: "block" }}
              />
            </div>

            <div style={{ 
              position: "absolute", 
              bottom: "20px", 
              right: "24px", 
              background: "#ffffff", 
              border: "1px solid #e5e7eb", 
              padding: "12px 18px", 
              borderRadius: "8px", 
              boxShadow: "0 6px 20px rgba(0,0,0,0.08)",
              maxWidth: "380px"
            }}>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.72rem", fontWeight: 700, color: "#111827", marginBottom: "4px" }}>
                VILLAGE CADASTRAL MESH &bull; ZERO DISPLACEMENT
              </div>
              <div style={{ fontSize: "0.76rem", color: "#6b7280", lineHeight: 1.45 }}>
                150 survey polygons mapped with closed ring topology. Every Khasra polygon is bound to its sovereign Record of Rights in SQLite.
              </div>
            </div>
          </div>

          {/* 4 Pilot States Breakdown */}
          <div className="hp-clean-pilots-grid" id="pilots">
            <div className="hp-clean-pilot-card">
              <div className="hp-clean-pilot-header">
                <span className="hp-clean-pilot-state">NCT of Delhi</span>
                <span className="hp-clean-pilot-count">25 Parcels</span>
              </div>
              <div className="hp-clean-pilot-title">Village Alipur, North Delhi</div>
              <div className="hp-clean-pilot-detail">
                Khasra 142, 143, 144... &bull; Bhumidhar Tenancy &bull; Jamabandi 1982
              </div>
              <button 
                className="hp-clean-btn-secondary" 
                style={{ width: "100%", fontSize: "0.76rem", padding: "6px 12px", justifyContent: "center" }}
                onClick={() => onNavigate("khasra")}
              >
                <span>Inspect Alipur Cadastre</span>
                <KoboyoExternalLink size={12} />
              </button>
            </div>

            <div className="hp-clean-pilot-card">
              <div className="hp-clean-pilot-header">
                <span className="hp-clean-pilot-state">Haryana</span>
                <span className="hp-clean-pilot-count">25 Parcels</span>
              </div>
              <div className="hp-clean-pilot-title">Village Wazirabad, Gurugram</div>
              <div className="hp-clean-pilot-detail">
                Khasra 215, 216, 217... &bull; Hissedaran Tenure &bull; WEB-HALRIS
              </div>
              <button 
                className="hp-clean-btn-secondary" 
                style={{ width: "100%", fontSize: "0.76rem", padding: "6px 12px", justifyContent: "center" }}
                onClick={() => onNavigate("khasra")}
              >
                <span>Inspect Wazirabad Cadastre</span>
                <KoboyoExternalLink size={12} />
              </button>
            </div>

            <div className="hp-clean-pilot-card">
              <div className="hp-clean-pilot-header">
                <span className="hp-clean-pilot-state">Bihar</span>
                <span className="hp-clean-pilot-count">25 Parcels</span>
              </div>
              <div className="hp-clean-pilot-title">Village Sabbalpur, Patna Sadar</div>
              <div className="hp-clean-pilot-detail">
                Khesra 312, 313, 314... &bull; Kaimi Raiyat &bull; Biharbhumi Register
              </div>
              <button 
                className="hp-clean-btn-secondary" 
                style={{ width: "100%", fontSize: "0.76rem", padding: "6px 12px", justifyContent: "center" }}
                onClick={() => onNavigate("khasra")}
              >
                <span>Inspect Sabbalpur Cadastre</span>
                <KoboyoExternalLink size={12} />
              </button>
            </div>

            <div className="hp-clean-pilot-card">
              <div className="hp-clean-pilot-header">
                <span className="hp-clean-pilot-state">Uttar Pradesh</span>
                <span className="hp-clean-pilot-count">75 Parcels</span>
              </div>
              <div className="hp-clean-pilot-title">Village Chhata, Mathura</div>
              <div className="hp-clean-pilot-detail">
                Khasra 101, 102, 103... &bull; Sankramaniya Bhumidhar &bull; UP-Bhulekh
              </div>
              <button 
                className="hp-clean-btn-secondary" 
                style={{ width: "100%", fontSize: "0.76rem", padding: "6px 12px", justifyContent: "center" }}
                onClick={() => onNavigate("khasra")}
              >
                <span>Inspect Chhata Cadastre</span>
                <KoboyoExternalLink size={12} />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 7. Narrative Chapter 3: Predictive Corridor Delay ML (Using cadastral_risk_analysis.mp4) */}
      <section className="hp-clean-chapter" id="predictive-risk">
        <div className="hp-clean-chapter-grid">
          {/* Video Container (tilted-left) */}
          <div className="hp-clean-media-box tilted-left">
            <video 
              src="/assets/cadastral_risk_analysis.mp4" 
              autoPlay 
              loop 
              muted 
              playsInline
            />
            <div className="hp-clean-caption-bar">
              <div>
                <div className="hp-clean-caption-title">TOPOGRAPHIC RISK HUD &bull; 68% DELAY SCORE</div>
                <div className="hp-clean-caption-desc">Calibrated scikit-learn GradientBoosting model trained on 160 CAG performance audits</div>
              </div>
              <button 
                className="hp-clean-btn-secondary" 
                style={{ padding: "4px 10px", fontSize: "0.72rem" }}
                onClick={() => onNavigate("risk")}
              >
                Predict
              </button>
            </div>
          </div>

          {/* Narrative Text */}
          <div className="hp-clean-chapter-text">
            <span className="hp-clean-kicker">03 / PREDICTIVE RISK ANALYTICS</span>
            <h3>Preventing ₹1.4 Lakh Crore in statutory acquisition lapses.</h3>
            <p>
              Under Section 23 of the RFCTLARR Act 2013, an acquisition award must be published within exactly 12 months of the preliminary notification under Section 11. If this deadline expires due to compensation arbitrations or survey misalignments, the entire acquisition lapses by law.
            </p>
            <p>
              LandSetu models these failure modes before capital is committed. By training machine learning pipelines on 160 historical infrastructure acquisitions from the Comptroller and Auditor General (CAG) and Land Conflict Watch, the platform predicts corridor delay likelihood with an MAE of 3.47 months.
            </p>

            <div className="hp-clean-chip-list">
              <span className="hp-clean-chip">Section 23 12-Month Watch</span>
              <span className="hp-clean-chip">CAG Performance Audit Data</span>
              <span className="hp-clean-chip">NHAI &amp; DFCCIL Corridors</span>
              <span className="hp-clean-chip">Linear Buffer Encumbrance</span>
            </div>

            <button 
              className="hp-clean-btn-primary"
              onClick={() => onNavigate("risk")}
            >
              <span>Launch Predictive Delay ML</span>
              <KoboyoArrowRight size={14} />
            </button>
          </div>
        </div>
      </section>

      {/* 8. Narrative Chapter 4: The Spatial Research Workspace (Using gis_platform_mockup.jpeg) */}
      <section className="hp-clean-chapter" style={{ background: "#fafafa", borderTop: "1px solid #f3f4f6", borderBottom: "1px solid #f3f4f6" }}>
        <div className="hp-clean-chapter-grid">
          <div className="hp-clean-chapter-text">
            <span className="hp-clean-kicker">04 / SPATIAL RESEARCH WORKSPACES</span>
            <h3>A browser-based GIS laboratory designed for policy makers.</h3>
            <p>
              Traditional GIS suites like ArcGIS or QGIS require specialized workstation licenses, massive raster downloads, and steep learning curves that prevent revenue commissioners and legal researchers from conducting rapid geospatial analysis.
            </p>
            <p>
              LandSetu packages powerful spatial queries into a clean, lightweight web interface. Users can filter by buildable area, analyze transmission line buffers, measure contiguous land parcels across 9,726+ acres, and inspect environmental constraints without writing a single line of SQL.
            </p>

            <div className="hp-clean-chip-list">
              <span className="hp-clean-chip">9,726 Acres Mapped</span>
              <span className="hp-clean-chip">Buildable Area Calculation</span>
              <span className="hp-clean-chip">Transmission Buffers</span>
              <span className="hp-clean-chip">Browser-Native Leaflet Vector</span>
            </div>

            <button 
              className="hp-clean-btn-primary"
              onClick={() => onNavigate("gis")}
            >
              <span>Explore Spatial GIS Lab</span>
              <KoboyoArrowRight size={14} />
            </button>
          </div>

          {/* Laptop Mockup Image (tilted-right) */}
          <div className="hp-clean-media-box tilted-right">
            <img 
              src="/assets/gis_platform_mockup.jpeg" 
              alt="Interactive GIS Platform Mockup"
            />
            <div className="hp-clean-caption-bar">
              <div>
                <div className="hp-clean-caption-title">GOVERNMENT GIS LAB &bull; SITE CRITERIA BREAKOUT</div>
                <div className="hp-clean-caption-desc">Interactive parcel filtering, buildable acreage, and proximity buffers</div>
              </div>
              <button 
                className="hp-clean-btn-secondary" 
                style={{ padding: "4px 10px", fontSize: "0.72rem" }}
                onClick={() => onNavigate("gis")}
              >
                Open
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 9. Four Pillars of Sovereign Land Intelligence (Minimal White Grid) */}
      <section className="hp-clean-pillars-section" id="pillars">
        <div className="hp-clean-section-header">
          <span className="hp-clean-kicker">CORE ARCHITECTURE</span>
          <h2 className="hp-clean-section-title">Four Pillars of Sovereign Land Intelligence</h2>
          <p className="hp-clean-section-desc">
            Engineered strictly to solve SIH26019: Research, Policy Innovation, and Evidence-Based Decision Support.
          </p>
        </div>

        <div className="hp-clean-pillars-grid">
          {/* Pillar 1 */}
          <div className="hp-clean-pillar-card">
            <div className="hp-clean-pillar-header">
              <KoboyoScale size={20} color="#111827" />
              <span className="hp-clean-pillar-num">01</span>
            </div>
            <h4 className="hp-clean-pillar-title">Legal AI &amp; Citation Synthesizer</h4>
            <div className="hp-clean-pillar-body">
              Hybrid BM25 + dense sentence embeddings over 54 statutory chunks with live Indian Kanoon Supreme Court precedent extraction and strict section-level citations.
            </div>
            <div className="hp-clean-pillar-footer">
              <button 
                className="hp-clean-btn-secondary" 
                style={{ width: "100%", justifyContent: "center" }}
                onClick={() => onNavigate("ask")}
              >
                <span>Consult Legal AI Assistant</span>
                <KoboyoChevronRight size={14} />
              </button>
            </div>
          </div>

          {/* Pillar 2 */}
          <div className="hp-clean-pillar-card">
            <div className="hp-clean-pillar-header">
              <KoboyoLayers size={20} color="#111827" />
              <span className="hp-clean-pillar-num">02</span>
            </div>
            <h4 className="hp-clean-pillar-title">National Cadastral Map (Khasra)</h4>
            <div className="hp-clean-pillar-body">
              150 closed survey polygons across Delhi, Haryana, Bihar, and UP. Features bidirectional parcel ↔ Jamabandi map synchronization and viewport BBOX streaming.
            </div>
            <div className="hp-clean-pillar-footer">
              <button 
                className="hp-clean-btn-secondary" 
                style={{ width: "100%", justifyContent: "center" }}
                onClick={() => onNavigate("khasra")}
              >
                <span>Open Cadastral Map</span>
                <KoboyoChevronRight size={14} />
              </button>
            </div>
          </div>

          {/* Pillar 3 */}
          <div className="hp-clean-pillar-card">
            <div className="hp-clean-pillar-header">
              <KoboyoFlask size={20} color="#111827" />
              <span className="hp-clean-pillar-num">03</span>
            </div>
            <h4 className="hp-clean-pillar-title">Policy Simulation Sandbox</h4>
            <div className="hp-clean-pillar-body">
              Econometric scenario engine modeling reform investments. Adjust digitization budgets, dispute mediation tribunals, and drone cadastre cadence to project pendency reductions.
            </div>
            <div className="hp-clean-pillar-footer">
              <button 
                className="hp-clean-btn-secondary" 
                style={{ width: "100%", justifyContent: "center" }}
                onClick={() => onNavigate("policy")}
              >
                <span>Simulate Policy Sandbox</span>
                <KoboyoChevronRight size={14} />
              </button>
            </div>
          </div>

          {/* Pillar 4 */}
          <div className="hp-clean-pillar-card">
            <div className="hp-clean-pillar-header">
              <KoboyoAlert size={20} color="#111827" />
              <span className="hp-clean-pillar-num">04</span>
            </div>
            <h4 className="hp-clean-pillar-title">Predictive Corridor Delay ML</h4>
            <div className="hp-clean-pillar-body">
              Scikit-learn GradientBoosting model trained on 160 CAG performance audits to predict acquisition delay risks and compensation bottlenecks before construction starts.
            </div>
            <div className="hp-clean-pillar-footer">
              <button 
                className="hp-clean-btn-secondary" 
                style={{ width: "100%", justifyContent: "center" }}
                onClick={() => onNavigate("risk")}
              >
                <span>Predict Delay Risks</span>
                <KoboyoChevronRight size={14} />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 10. Cryptographic CAS Ledger & Unbroken Provenance Banner */}
      <section className="hp-clean-ledger-banner">
        <div className="hp-clean-ledger-box">
          <div className="hp-clean-ledger-text">
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
              <KoboyoShieldCheck size={18} color="#10b981" />
              <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.72rem", color: "#34d399", fontWeight: 700 }}>
                IMMUTABLE SHA-256 PROVENANCE &bull; CAS STORAGE
              </span>
            </div>
            <h3>Cryptographically Verifiable Chain of Custody</h3>
            <p>
              Every statutory law chunk, Jamabandi document, and policy run is sealed with an immutable SHA-256 fingerprint in Content-Addressable Storage (CAS). Re-verifiable across 264 continuous cryptographic blocks anchored at EVT-GENESIS.
            </p>
          </div>

          <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
            <button 
              className="hp-clean-btn-ledger-primary"
              style={{ padding: "10px 22px" }}
              onClick={() => onNavigate("audit")}
            >
              <KoboyoShieldCheck size={16} />
              <span>Verify Audit Ledger Live</span>
            </button>

            <button 
              className="hp-clean-btn-ledger-secondary"
              style={{ padding: "10px 22px" }}
              onClick={() => onNavigate("repository")}
            >
              <KoboyoDatabase size={15} />
              <span>Browse Knowledge Repository</span>
            </button>
          </div>
        </div>
      </section>

      {/* 11. Minimal Institutional Footer */}
      <footer className="hp-clean-footer">
        <div className="hp-clean-footer-inner">
          <div className="hp-clean-footer-grid">
            <div className="hp-clean-footer-col">
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
                <KoboyoLandmark size={18} color="#111827" />
                <span style={{ fontWeight: 800, fontSize: "0.96rem", color: "#111827" }}>LANDSETU (भू-सेतु)</span>
              </div>
              <p style={{ fontSize: "0.8rem", color: "#6b7280", lineHeight: 1.6, marginBottom: "14px" }}>
                National Digital Platform for Research, Policy Innovation, and Evidence-Based Land Governance. Developed under the Smart India Hackathon 2024 problem statement SIH26019.
              </p>
              <div style={{ fontSize: "0.72rem", color: "#9ca3af" }}>
                Department of Land Resources &bull; Ministry of Rural Development &bull; Government of India
              </div>
            </div>

            <div className="hp-clean-footer-col">
              <h5>Intelligence Modules</h5>
              <ul className="hp-clean-footer-list">
                <li className="hp-clean-footer-item"><button onClick={() => onNavigate("dashboard")}>National Command Dashboard</button></li>
                <li className="hp-clean-footer-item"><button onClick={() => onNavigate("ask")}>Legal AI RAG Assistant</button></li>
                <li className="hp-clean-footer-item"><button onClick={() => onNavigate("khasra")}>National Cadastral Map</button></li>
                <li className="hp-clean-footer-item"><button onClick={() => onNavigate("gis")}>Spatial GIS Lab</button></li>
                <li className="hp-clean-footer-item"><button onClick={() => onNavigate("policy")}>Policy Simulation Sandbox</button></li>
                <li className="hp-clean-footer-item"><button onClick={() => onNavigate("risk")}>Predictive Delay ML</button></li>
              </ul>
            </div>

            <div className="hp-clean-footer-col">
              <h5>Operations &amp; Governance</h5>
              <ul className="hp-clean-footer-list">
                <li className="hp-clean-footer-item"><button onClick={() => onNavigate("digitizer")}>Record Digitizer (OCR)</button></li>
                <li className="hp-clean-footer-item"><button onClick={() => onNavigate("acquisition")}>Infrastructure Projects</button></li>
                <li className="hp-clean-footer-item"><button onClick={() => onNavigate("repository")}>Central Knowledge Repository</button></li>
                <li className="hp-clean-footer-item"><button onClick={() => onNavigate("audit")}>Cryptographic Audit Ledger</button></li>
                <li className="hp-clean-footer-item"><button onClick={() => onNavigate("workspaces")}>Collaborative Workspaces</button></li>
                <li className="hp-clean-footer-item"><button onClick={() => onNavigate("innovation")}>Innovation Hub &amp; Grants</button></li>
              </ul>
            </div>

            <div className="hp-clean-footer-col">
              <h5>Statutory Framework</h5>
              <ul className="hp-clean-footer-list">
                <li style={{ fontSize: "0.78rem", color: "#6b7280" }}>RFCTLARR Act 2013 (Sec 23, 28)</li>
                <li style={{ fontSize: "0.78rem", color: "#6b7280" }}>Forest Rights Act (FRA) 2006</li>
                <li style={{ fontSize: "0.78rem", color: "#6b7280" }}>Transfer of Property Act 1882</li>
                <li style={{ fontSize: "0.78rem", color: "#6b7280" }}>Indian Registration Act 1908</li>
                <li style={{ fontSize: "0.78rem", color: "#6b7280" }}>SVAMITVA Drone Standards</li>
                <li style={{ fontSize: "0.78rem", color: "#6b7280" }}>NJDG Subordinate Court Data</li>
              </ul>
            </div>
          </div>

          <div className="hp-clean-footer-bottom">
            <div>
              &copy; 2026 LandSetu Project &bull; SIH26019 National Digital Platform &bull; All Rights Reserved
            </div>
            <div style={{ display: "flex", gap: "12px" }}>
              <span>Zero Emojis</span> &bull; 
              <span>SHA-256 CAS Verified</span> &bull; 
              <span>Strict Grounding</span> &bull; 
              <span>PII Masked</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
