import React, { useState } from "react";
import { api } from "../api/client.js";
import { 
  Bot, 
  Search, 
  CheckCircle2, 
  AlertTriangle, 
  ExternalLink, 
  Sparkles, 
  ShieldAlert 
} from "lucide-react";

export const AskAssistantPage: React.FC = () => {
  const [query, setQuery] = useState<string>("");
  const [response, setResponse] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const sampleQueries = [
    "What is the statutory period under Section 23 of the LARR Act 2013 for the Collector to make an award before proceedings lapse?",
    "Explain the Social Impact Assessment consultation requirements under Section 4 of LARR Act 2013.",
    "What is ULPIN or Bhu-Aadhaar and what standard is it based on?",
    "What percentage of civil cases in district courts represent land and property disputes according to NJDG data?",
    "What is the capital of France and its metro train ticketing rules?" // Out-of-domain refusal test
  ];

  const handleSearch = async (queryText?: string) => {
    const q = queryText || query;
    if (!q.trim()) return;
    setLoading(true);
    setError(null);

    try {
      const res = await api.ask(q);
      setResponse(res);
    } catch (err: any) {
      setError(err.message || "Failed to execute AI search query");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="ask-assistant-view">
      <div style={{ marginBottom: "20px" }}>
        <h2 style={{ fontSize: "1.4rem", fontWeight: 800, color: "var(--primary)" }}>
          AI-Powered Land Governance Research Assistant
        </h2>
        <p style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>
          Grounded Retrieval-Augmented Generation (RAG) over verified statutory acts, operational standards, judicial statistics, and policy briefs.
        </p>
      </div>

      {/* Query Bar */}
      <div className="card">
        <div style={{ display: "flex", gap: "10px" }}>
          <input
            type="text"
            className="form-input"
            placeholder="Ask any land governance, statutory, or policy research question..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleSearch()}
            style={{ fontSize: "0.95rem", padding: "10px 14px" }}
          />
          <button className="btn btn-primary" onClick={() => handleSearch()} disabled={loading}>
            <Search size={16} />
            <span>{loading ? "Searching..." : "Ask Platform"}</span>
          </button>
        </div>

        {/* Sample Query Chips */}
        <div style={{ marginTop: "14px", display: "flex", flexWrap: "wrap", gap: "8px", alignItems: "center" }}>
          <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--text-muted)", display: "flex", alignItems: "center", gap: "4px" }}>
            <Sparkles size={12} color="#b08968" />
            Try Recommended Queries:
          </span>
          {sampleQueries.map((sq, idx) => (
            <button
              key={idx}
              className="btn btn-secondary btn-sm"
              style={{ fontSize: "0.72rem", padding: "3px 8px", backgroundColor: "#f8fafc" }}
              onClick={() => {
                setQuery(sq);
                handleSearch(sq);
              }}
            >
              {sq.length > 55 ? sq.substring(0, 55) + "..." : sq}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="card" style={{ backgroundColor: "#fef2f2", borderColor: "#fecaca" }}>
          <div style={{ color: "#991b1b", display: "flex", alignItems: "center", gap: "8px" }}>
            <AlertTriangle size={18} />
            <span>{error}</span>
          </div>
        </div>
      )}

      {/* Response Display */}
      {response && (
        <div>
          {/* Grounding Status Card */}
          <div className="card" style={{ borderLeftWidth: "4px", borderLeftColor: response.evidence_state === "grounded" ? "#10b981" : (response.evidence_state === "insufficient" ? "#ef4444" : "#f59e0b") }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <Bot size={20} color="var(--primary)" />
                <span style={{ fontWeight: 700, fontSize: "1.05rem" }}>Synthesized Research Answer</span>
              </div>
              <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                <span className="badge badge-blue" style={{ fontSize: "0.72rem" }}>
                  Template-Grounded Synthesis
                </span>
                {response.evidence_state === "grounded" && (
                  <span className="badge badge-green">
                    <CheckCircle2 size={13} /> Grounded in Official Evidence
                  </span>
                )}
                {response.evidence_state === "insufficient" && (
                  <span className="badge badge-red">
                    <ShieldAlert size={13} /> Insufficient Evidence Refusal
                  </span>
                )}
                {response.evidence_state === "partial" && (
                  <span className="badge badge-amber">
                    <AlertTriangle size={13} /> Partial Grounding
                  </span>
                )}
              </div>
            </div>

            {/* Architecture Disclosure Tag */}
            <div style={{ fontSize: "0.74rem", color: "var(--text-muted)", marginBottom: "10px", padding: "6px 10px", backgroundColor: "#f1f5f9", borderRadius: "4px" }}>
              <strong>Pipeline Architecture:</strong> Hybrid Semantic Retrieval (Multilingual Hindi/English Domain Adapter) + Evidence-Grounded Extractive Assembly (Zero Autonomous Hallucination Mode).
            </div>

            {/* Answer Text */}
            <div style={{ fontSize: "0.95rem", lineHeight: "1.6", color: "#1e293b", backgroundColor: "#ffffff", padding: "16px", borderRadius: "6px", border: "1px solid #e2e8f0" }}>
              {response.answer_text}
            </div>

            {/* Citation Verification Summary */}
            {response.citations && (
              <div style={{ marginTop: "14px", padding: "10px 14px", backgroundColor: "#f8fafc", borderRadius: "6px", border: "1px solid #e2e8f0", display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "0.8rem" }}>
                <div>
                  <span style={{ fontWeight: 600 }}>Citations Verified: </span>
                  <span style={{ color: "#065f46", fontWeight: 700 }}>
                    {response.citations.is_valid ? "Strict 100% Grounded (Zero Hallucinations)" : "Unverified"}
                  </span>
                  <span style={{ marginLeft: "10px", color: "var(--text-muted)" }}>
                    [{response.citations.cited_document_ids?.join(", ") || "None"}]
                  </span>
                </div>
                <div>
                  <span className="badge badge-blue">Deterministic Verification</span>
                </div>
              </div>
            )}
          </div>

          {/* Evidence Cards */}
          {response.evidence_cards && response.evidence_cards.length > 0 && (
            <div className="card">
              <div className="card-header">
                <div className="card-title">
                  <span>Supporting Statutory & Empirical Evidence Cards ({response.evidence_cards.length})</span>
                </div>
                <span className="badge badge-green">Verified Sources</span>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {response.evidence_cards.map((ev: any, idx: number) => (
                  <div key={idx} className="evidence-box">
                    <div className="evidence-header">
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <span className="badge badge-blue">{ev.document_id}</span>
                        <span className="evidence-title">{ev.document_title}</span>
                      </div>
                      <span className="badge badge-green">Relevance: {(ev.score * 100).toFixed(0)}%</span>
                    </div>

                    <div style={{ fontSize: "0.78rem", color: "var(--text-muted)", marginBottom: "4px" }}>
                      <strong>Section/Provision:</strong> {ev.section} | <strong>Publisher:</strong> {ev.publisher}
                    </div>

                    <p className="evidence-text">{ev.excerpt}</p>

                    {ev.source_url && (
                      <div style={{ marginTop: "6px", textAlign: "right" }}>
                        <a
                          href={ev.source_url}
                          target="_blank"
                          rel="noreferrer"
                          style={{ fontSize: "0.75rem", color: "var(--primary)", display: "inline-flex", alignItems: "center", gap: "4px", textDecoration: "none", fontWeight: 600 }}
                        >
                          Official Source Link <ExternalLink size={12} />
                        </a>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Limitations and Refusal notes */}
          {response.limitations && response.limitations.length > 0 && (
            <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", padding: "8px 12px", border: "1px dashed var(--border-medium)", borderRadius: "6px" }}>
              <strong>Platform Notice: </strong>
              {response.limitations.join(" ")}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
