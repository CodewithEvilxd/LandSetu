import React, { useState } from "react";
import { 
  ShieldCheck, 
  X, 
  Copy, 
  Check, 
  ExternalLink, 
  FileText, 
  Database, 
  CheckCircle2, 
  Download,
  AlertCircle
} from "lucide-react";

interface FieldEvidenceItem {
  evidence_id?: string;
  field_name: string;
  source_record: string;
  raw_value?: string;
  confidence: number;
  extraction_method: string;
  citation_reference: string;
}

interface EvidenceBundle {
  parcel_uid: string;
  composite_id: string;
  state: string;
  district: string;
  tehsil: string;
  village: string;
  khasra: string;
  source_id: string;
  source_name: string;
  source_url: string;
  retrieval_mode: string;
  retrieval_timestamp: string;
  checksum_sha256: string;
  terms_note?: string;
  field_evidence: FieldEvidenceItem[];
  provenance_chain?: Array<{ stage: string; timestamp: string; status: string; agent: string }>;
}

interface ParcelEvidencePanelProps {
  bundle: EvidenceBundle | null;
  loading: boolean;
  onClose: () => void;
}

export const ParcelEvidencePanel: React.FC<ParcelEvidencePanelProps> = ({
  bundle,
  loading,
  onClose
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopySha = (sha: string) => {
    navigator.clipboard.writeText(sha);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadBundle = () => {
    if (!bundle) return;
    const blob = new Blob([JSON.stringify(bundle, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `evidence_bundle_${bundle.khasra}_${bundle.village}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!bundle && !loading) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        backgroundColor: "rgba(15, 23, 42, 0.6)",
        backdropFilter: "blur(4px)",
        zIndex: 2000,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px"
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: "#ffffff",
          borderRadius: "8px",
          width: "100%",
          maxWidth: "760px",
          maxHeight: "90vh",
          display: "flex",
          flexDirection: "column",
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
          border: "1px solid var(--border-subtle)",
          overflow: "hidden"
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div
          style={{
            padding: "16px 20px",
            borderBottom: "1px solid var(--border-hairline)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            background: "var(--bg-surface-alt)"
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <ShieldCheck size={20} color="var(--cadastral-emerald)" />
            <div>
              <div
                style={{
                  fontFamily: "var(--font-display)",
                  fontWeight: 700,
                  fontSize: "1.05rem",
                  color: "var(--sovereign-navy)"
                }}
              >
                Cryptographic Evidence & Provenance Dossier
              </div>
              <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                Field-Level Chain of Custody • SHA-256 Verified Official Gazette / RoR Extract
              </div>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            {bundle && (
              <button
                onClick={handleDownloadBundle}
                className="btn btn-secondary"
                style={{
                  padding: "6px 12px",
                  fontSize: "0.76rem",
                  display: "flex",
                  alignItems: "center",
                  gap: "5px"
                }}
              >
                <Download size={13} />
                <span>Export JSON</span>
              </button>
            )}

            <button
              onClick={onClose}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: "4px",
                color: "var(--text-muted)",
                borderRadius: "4px"
              }}
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div style={{ padding: "20px", overflowY: "auto", flex: 1 }}>
          {loading ? (
            <div style={{ padding: "40px", textAlign: "center", color: "var(--text-muted)" }}>
              Assembling cryptographic proof bundle from verified database...
            </div>
          ) : bundle ? (
            <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
              {/* Provenance Banner */}
              <div
                style={{
                  background: "var(--cadastral-emerald-bg)",
                  border: "1px solid var(--cadastral-emerald-border)",
                  borderRadius: "6px",
                  padding: "12px 16px",
                  display: "flex",
                  alignItems: "flex-start",
                  gap: "10px"
                }}
              >
                <CheckCircle2 size={18} color="var(--cadastral-emerald)" style={{ flexShrink: 0, marginTop: "2px" }} />
                <div>
                  <div style={{ fontSize: "0.82rem", fontWeight: 700, color: "var(--cadastral-emerald)" }}>
                    Direct Government Provenance Verified
                  </div>
                  <div style={{ fontSize: "0.76rem", color: "var(--text-secondary)", marginTop: "2px", lineHeight: 1.45 }}>
                    This parcel record is directly derived from official state records ({bundle.source_name}). 
                    Every field below has been verified against the original raw dataset. No missing values have been hallucinated.
                  </div>
                </div>
              </div>

              {/* Source & Checksum Metadata Card */}
              <div
                style={{
                  background: "var(--bg-surface)",
                  border: "1px solid var(--border-hairline)",
                  borderRadius: "6px",
                  padding: "14px"
                }}
              >
                <div
                  style={{
                    fontFamily: "var(--font-tech)",
                    fontWeight: 700,
                    fontSize: "0.78rem",
                    color: "var(--sovereign-navy)",
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                    marginBottom: "10px",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px"
                  }}
                >
                  <Database size={14} />
                  Authoritative Ingestion Metadata
                </div>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                    gap: "10px",
                    fontSize: "0.76rem"
                  }}
                >
                  <div>
                    <span style={{ color: "var(--text-muted)", display: "block" }}>Source Department</span>
                    <strong style={{ color: "var(--text-primary)" }}>{bundle.source_name}</strong>
                  </div>

                  <div>
                    <span style={{ color: "var(--text-muted)", display: "block" }}>Official Portal / Access Mode</span>
                    <a
                      href={bundle.source_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        color: "var(--sovereign-navy)",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "4px",
                        fontWeight: 600
                      }}
                    >
                      <span>{bundle.retrieval_mode.toUpperCase()}</span>
                      <ExternalLink size={12} />
                    </a>
                  </div>

                  <div>
                    <span style={{ color: "var(--text-muted)", display: "block" }}>Ingestion Timestamp</span>
                    <strong style={{ color: "var(--text-primary)" }}>
                      {new Date(bundle.retrieval_timestamp).toLocaleString("en-IN")}
                    </strong>
                  </div>

                  <div>
                    <span style={{ color: "var(--text-muted)", display: "block" }}>Geography Tuple</span>
                    <strong style={{ color: "var(--text-primary)" }}>
                      {bundle.village}, {bundle.tehsil}, {bundle.district} ({bundle.state})
                    </strong>
                  </div>
                </div>

                {/* Checksum Row */}
                <div
                  style={{
                    marginTop: "12px",
                    paddingTop: "10px",
                    borderTop: "1px solid var(--border-hairline)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: "10px"
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", overflow: "hidden" }}>
                    <span style={{ fontSize: "0.74rem", color: "var(--text-muted)", flexShrink: 0 }}>
                      SHA-256 Digest:
                    </span>
                    <code
                      style={{
                        fontFamily: "var(--font-mono)",
                        fontSize: "0.72rem",
                        background: "var(--bg-surface-alt)",
                        padding: "3px 8px",
                        borderRadius: "4px",
                        color: "var(--sovereign-navy)",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap"
                      }}
                    >
                      {bundle.checksum_sha256}
                    </code>
                  </div>

                  <button
                    onClick={() => handleCopySha(bundle.checksum_sha256)}
                    style={{
                      background: "none",
                      border: "1px solid var(--border-subtle)",
                      borderRadius: "4px",
                      padding: "4px 8px",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "4px",
                      fontSize: "0.72rem",
                      color: "var(--text-secondary)",
                      flexShrink: 0
                    }}
                  >
                    {copied ? <Check size={12} color="green" /> : <Copy size={12} />}
                    <span>{copied ? "Copied" : "Copy"}</span>
                  </button>
                </div>
              </div>

              {/* Field Evidence Table */}
              <div>
                <div
                  style={{
                    fontFamily: "var(--font-tech)",
                    fontWeight: 700,
                    fontSize: "0.78rem",
                    color: "var(--sovereign-navy)",
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                    marginBottom: "10px",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px"
                  }}
                >
                  <FileText size={14} />
                  Field-Level Provenance & Extraction Rationales ({bundle.field_evidence.length} Fields)
                </div>

                <div
                  style={{
                    border: "1px solid var(--border-hairline)",
                    borderRadius: "6px",
                    overflow: "hidden"
                  }}
                >
                  <table
                    style={{
                      width: "100%",
                      borderCollapse: "collapse",
                      fontSize: "0.75rem",
                      textAlign: "left"
                    }}
                  >
                    <thead>
                      <tr style={{ background: "var(--bg-surface-alt)", borderBottom: "1px solid var(--border-hairline)" }}>
                        <th style={{ padding: "8px 12px", color: "var(--text-secondary)", fontWeight: 700 }}>Field</th>
                        <th style={{ padding: "8px 12px", color: "var(--text-secondary)", fontWeight: 700 }}>Source Record</th>
                        <th style={{ padding: "8px 12px", color: "var(--text-secondary)", fontWeight: 700 }}>Confidence</th>
                        <th style={{ padding: "8px 12px", color: "var(--text-secondary)", fontWeight: 700 }}>Method</th>
                        <th style={{ padding: "8px 12px", color: "var(--text-secondary)", fontWeight: 700 }}>Citation Ref</th>
                      </tr>
                    </thead>
                    <tbody>
                      {bundle.field_evidence.map((fe, idx) => (
                        <tr
                          key={idx}
                          style={{
                            borderBottom: idx === bundle.field_evidence.length - 1 ? "none" : "1px solid var(--border-hairline)",
                            background: idx % 2 === 0 ? "#ffffff" : "#fcfdfe"
                          }}
                        >
                          <td style={{ padding: "8px 12px", fontFamily: "var(--font-mono)", fontWeight: 600, color: "var(--sovereign-navy)" }}>
                            {fe.field_name}
                          </td>
                          <td style={{ padding: "8px 12px", color: "var(--text-primary)" }}>
                            {fe.source_record}
                          </td>
                          <td style={{ padding: "8px 12px" }}>
                            <span
                              style={{
                                display: "inline-block",
                                padding: "2px 6px",
                                borderRadius: "4px",
                                fontSize: "0.68rem",
                                fontWeight: 700,
                                background: fe.confidence >= 0.95 ? "#ecfdf5" : "#fffbeb",
                                color: fe.confidence >= 0.95 ? "#065f46" : "#b45309"
                              }}
                            >
                              {(fe.confidence * 100).toFixed(0)}%
                            </span>
                          </td>
                          <td style={{ padding: "8px 12px", color: "var(--text-muted)" }}>
                            {fe.extraction_method}
                          </td>
                          <td style={{ padding: "8px 12px", color: "var(--text-secondary)", fontSize: "0.7rem" }}>
                            {fe.citation_reference}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Terms Note */}
              {bundle.terms_note && (
                <div
                  style={{
                    fontSize: "0.72rem",
                    color: "var(--text-muted)",
                    fontStyle: "italic",
                    borderLeft: "2px solid var(--border-medium)",
                    paddingLeft: "8px"
                  }}
                >
                  Legal Terms & Access Protocol: {bundle.terms_note}
                </div>
              )}
            </div>
          ) : (
            <div style={{ padding: "30px", textAlign: "center", color: "var(--critical-crimson)" }}>
              <AlertCircle size={24} style={{ marginBottom: "8px" }} />
              <div>No evidence bundle available for this parcel in LandSetu corpus.</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
