import React, { useState } from "react";
import { api } from "../api/client.js";
import { PageHeader } from "../components/PageHeader.js";
import { LoadingState } from "../components/LoadingState.js";
import { 
  Search, 
  AlertTriangle, 
  ExternalLink, 
  Info,
  BookOpen,
  Scale,
  FileCheck,
  Building2,
  ArrowRight,
  ShieldCheck
} from "lucide-react";

export const AskAssistantPage: React.FC = () => {
  const [query, setQuery] = useState<string>("");
  const [response, setResponse] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const curatedQueries = [
    {
      category: "RFCTLARR 2013",
      text: "What is the statutory deadline for making an award under Section 23?",
      display: "Section 23 statutory award lapse deadline & compensation computation"
    },
    {
      category: "DILRMP 2.0",
      text: "What is ULPIN or Bhu-Aadhaar and what standard is it based on?",
      display: "ULPIN (Bhu-Aadhaar) 14-digit geo-referenced parcel identification standard"
    },
    {
      category: "NJDG Analytics",
      text: "What percentage of civil cases in district courts represent land disputes according to NJDG?",
      display: "Civil land dispute pendency ratio in subordinate district court complexes"
    },
    {
      category: "SIA Mandate",
      text: "Explain the Social Impact Assessment consultation requirements under Section 4 of LARR Act 2013.",
      display: "Section 4 mandatory Social Impact Assessment & Gram Sabha consultations"
    }
  ];

  const featuredDossiers = [
    {
      statute: "Central Act 30 of 2013",
      title: "Right to Fair Compensation & Transparency (RFCTLARR)",
      excerpt: "Comprehensive legal procedures governing Section 4 Social Impact Assessment, Section 11 preliminary notifications, Section 19 declarations, and strict 12-month award lapse timelines under Section 23.",
      query: "What is the statutory deadline for making an award under Section 23 of RFCTLARR Act 2013?"
    },
    {
      statute: "Ministry of Rural Development • DoLR",
      title: "Digital India Land Records Modernization Program (DILRMP)",
      excerpt: "Standard operating procedures for computerization of Record of Rights (RoR), digitizing cadastral maps (BhuNaksha), integration with Sub-Registrar Offices (SRO), and migration toward conclusive titling.",
      query: "What is ULPIN or Bhu-Aadhaar and what standard is it based on?"
    },
    {
      statute: "Judicial Intelligence & E-Courts",
      title: "National Judicial Data Grid (NJDG) Land Pendency",
      excerpt: "Empirical litigation analytics tracking land disputes, title disputes, injunctions, and demarcation appeals across 3,000+ subordinate court complexes and state high courts in India.",
      query: "What percentage of civil cases in district courts represent land disputes according to NJDG?"
    }
  ];

  const handleSearch = async (queryText?: string) => {
    const q = (queryText !== undefined ? queryText : query).trim();
    if (!q) return;
    setLoading(true);
    setError(null);

    try {
      const res = await api.ask(q);
      setResponse(res);
    } catch (err: any) {
      setError(err.message || "Failed to execute research query");
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const initialQuery = params.get("q");
    if (initialQuery) {
      setQuery(initialQuery);
      handleSearch(initialQuery);
    }
  }, []);

  return (
    <div className="ask-assistant-view">
      <PageHeader
        title="Legal & Statutory Research Assistant"
        subtitle="Search verified central enactments, state land revenue codes, cadastral survey norms, and judicial pendency benchmarks."
      />

      {/* Institutional Search Console */}
      <div className="search-console-card">
        <div className="search-input-shell">
          <Search size={20} color="var(--sovereign-navy)" style={{ flexShrink: 0 }} />
          <input
            type="text"
            className="search-input-field"
            placeholder="Ask any statutory question (e.g. Section 23 award deadline, ULPIN specification, NJDG pendency)..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleSearch()}
          />
          <span className="search-kbd-hint">↵ Enter</span>
          <button 
            className="btn btn-primary" 
            onClick={() => handleSearch()} 
            disabled={loading}
            style={{ padding: "8px 22px", borderRadius: "6px" }}
          >
            <span>{loading ? "Searching..." : "Search Repository"}</span>
          </button>
        </div>

        {/* Categorized Topic Pills */}
        <div className="query-chip-row">
          <span style={{ fontSize: "0.74rem", color: "var(--text-muted)", display: "flex", alignItems: "center", gap: "5px", fontWeight: 600 }}>
            <Scale size={14} color="var(--statutory-ochre)" />
            Recommended Legal Queries:
          </span>
          {curatedQueries.map((cq, idx) => (
            <button
              key={idx}
              className="query-tag-pill"
              onClick={() => {
                setQuery(cq.text);
                handleSearch(cq.text);
              }}
            >
              <span className="query-tag-category">{cq.category}</span>
              <span>{cq.display}</span>
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="card" style={{ backgroundColor: "#fef2f2", borderColor: "#fecaca", marginBottom: "20px" }}>
          <div style={{ color: "#991b1b", display: "flex", alignItems: "center", gap: "8px", fontSize: "0.88rem" }}>
            <AlertTriangle size={18} />
            <span>{error}</span>
          </div>
        </div>
      )}

      {loading && (
        <div className="card" style={{ marginBottom: "24px" }}>
          <LoadingState message="Retrieving provisions from repository and assembling verified answer..." minHeight={200} />
        </div>
      )}

      {/* Structured Statutory Dossiers When Awaiting Query (No Empty AI Void) */}
      {!loading && !response && (
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px", borderBottom: "1px solid var(--border-hairline)", paddingBottom: "8px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <BookOpen size={16} color="var(--sovereign-navy)" />
              <span style={{ fontFamily: "var(--font-tech)", fontSize: "0.82rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--sovereign-navy)" }}>
                Authoritative Legal Repositories & Precedents
              </span>
            </div>
            <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
              Select any statutory dossier to run grounded legal analysis
            </span>
          </div>

          <div className="dossier-preview-grid">
            {featuredDossiers.map((fd, fIdx) => (
              <div
                key={fIdx}
                className="dossier-preview-card"
                onClick={() => {
                  setQuery(fd.query);
                  handleSearch(fd.query);
                }}
              >
                <div>
                  <div className="dossier-statute-badge">{fd.statute}</div>
                  <div className="dossier-title">{fd.title}</div>
                  <div className="dossier-excerpt">{fd.excerpt}</div>
                </div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderTop: "1px solid #f1f5f9", paddingTop: "10px", marginTop: "8px" }}>
                  <span style={{ fontSize: "0.74rem", fontWeight: 600, color: "var(--sovereign-navy)" }}>Inspect Provision</span>
                  <ArrowRight size={14} color="var(--sovereign-navy)" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Answer & Grounding Presentation */}
      {!loading && response && (
        <div>
          {/* Main Answer Card */}
          <div className="clean-answer-card" style={{ background: "#ffffff", border: "1px solid var(--border-hairline)", borderRadius: "var(--radius-md)", padding: "24px", marginBottom: "20px", boxShadow: "var(--shadow-sm)" }}>
            <div className="clean-answer-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid var(--border-hairline)", paddingBottom: "12px", marginBottom: "16px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <ShieldCheck size={18} color="var(--cadastral-emerald)" />
                <span style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "1.08rem", color: "var(--sovereign-navy)" }}>
                  Statutory Research Finding
                </span>
              </div>
              
              {response.evidence_state === "grounded" && (
                <div className="badge badge-green" style={{ padding: "4px 10px" }}>
                  <span className="status-indicator-dot success" style={{ display: "inline-block", width: "6px", height: "6px", borderRadius: "50%", background: "#10b981", marginRight: "6px" }}></span>
                  <span>Verified in Official Legislation</span>
                </div>
              )}
              {response.evidence_state === "insufficient" && (
                <div className="badge badge-red" style={{ padding: "4px 10px" }}>
                  <span className="status-indicator-dot danger" style={{ display: "inline-block", width: "6px", height: "6px", borderRadius: "50%", background: "#ef4444", marginRight: "6px" }}></span>
                  <span>No Direct Evidence in Repository</span>
                </div>
              )}
              {response.evidence_state === "partial" && (
                <div className="badge badge-amber" style={{ padding: "4px 10px" }}>
                  <span className="status-indicator-dot warning" style={{ display: "inline-block", width: "6px", height: "6px", borderRadius: "50%", background: "#f59e0b", marginRight: "6px" }}></span>
                  <span>Partial Statutory Evidence</span>
                </div>
              )}
            </div>

            {/* Answer Content */}
            <div style={{ fontSize: "0.95rem", lineHeight: 1.65, color: "var(--text-primary)", marginBottom: "18px" }}>
              {response.answer_text}
            </div>

            {/* Technical Grounding Accordion */}
            <details className="methodology-accordion" style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "6px", padding: "10px 14px", fontSize: "0.8rem" }}>
              <summary style={{ cursor: "pointer", fontWeight: 600, color: "var(--text-secondary)", display: "flex", alignItems: "center", gap: "6px" }}>
                <Info size={14} />
                <span>Verification & Extractive Grounding Metadata</span>
              </summary>
              <div style={{ marginTop: "10px", display: "flex", flexDirection: "column", gap: "6px", color: "var(--text-secondary)", fontSize: "0.78rem" }}>
                <div><strong>Grounding Mode:</strong> Zero-hallucination extractive assembly from verified repository legislation.</div>
                <div>
                  <strong>Cited Documents:</strong> {response.citations?.cited_document_ids?.join(", ") || "None"}
                </div>
                {response.limitations && response.limitations.length > 0 && (
                  <div style={{ color: "#64748b" }}>
                    <strong>Statutory Caveat:</strong> {response.limitations[0]}
                  </div>
                )}
              </div>
            </details>
          </div>

          {/* Evidence Cards */}
          {response.evidence_cards && response.evidence_cards.length > 0 && (
            <div className="card">
              <div className="card-header">
                <div className="card-title">
                  <BookOpen size={16} color="var(--primary)" />
                  <span>Cited Legislative Provisions & Gazetted Sections ({response.evidence_cards.length})</span>
                </div>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {response.evidence_cards.map((ev: any, idx: number) => (
                  <div key={idx} style={{ padding: "14px 16px", backgroundColor: "#fdfbf7", border: "1px solid #e7e5e4", borderRadius: "6px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px", flexWrap: "wrap", gap: "6px" }}>
                      <span style={{ fontFamily: "var(--font-tech)", fontWeight: 700, fontSize: "0.78rem", color: "var(--statutory-ochre)", textTransform: "uppercase" }}>
                        {ev.section} &bull; {ev.topic || "Statutory Provision"}
                      </span>
                      <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontWeight: 500 }}>
                        {ev.document_title}
                      </span>
                    </div>

                    <p style={{ fontFamily: "var(--font-editorial)", fontSize: "0.95rem", lineHeight: 1.5, color: "#1c1917", fontStyle: "italic", marginBottom: "8px" }}>
                      "{ev.excerpt}"
                    </p>

                    {ev.source_url && (
                      <a
                        href={ev.source_url}
                        target="_blank"
                        rel="noreferrer"
                        style={{ display: "inline-flex", alignItems: "center", gap: "5px", fontSize: "0.75rem", color: "var(--sovereign-navy)", textDecoration: "none", fontWeight: 600 }}
                      >
                        <span>Official Gazette Reference</span>
                        <ExternalLink size={12} />
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
