import React, { useEffect, useState } from "react";
import { api } from "../api/client.js";
import { PageHeader } from "../components/PageHeader.js";
import { LoadingState } from "../components/LoadingState.js";
import { EmptyState } from "../components/EmptyState.js";
import { 
  Database, 
  FileText, 
  ExternalLink, 
  ShieldCheck, 
  ArrowLeft,
  Search
} from "lucide-react";

export const RepositoryPage: React.FC = () => {
  const [subTab, setSubTab] = useState<"sources" | "documents" | "datasets">("sources");
  const [sources, setSources] = useState<any[]>([]);
  const [documents, setDocuments] = useState<any[]>([]);
  const [datasets, setDatasets] = useState<any[]>([]);
  const [selectedDoc, setSelectedDoc] = useState<any>(null);
  const [selectedDs, setSelectedDs] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    Promise.all([
      api.getSources(),
      api.getDocuments(),
      api.getDatasets()
    ]).then(([sRes, dRes, dsRes]) => {
      setSources(sRes.sources || []);
      setDocuments(dRes.documents || []);
      setDatasets(dsRes.datasets || []);
    }).catch(err => console.error("Error loading repository:", err))
      .finally(() => setLoading(false));
  }, []);

  const viewDoc = async (id: string) => {
    try {
      const doc = await api.getDocument(id);
      setSelectedDoc(doc);
    } catch (err) {
      console.error(err);
    }
  };

  const viewDs = async (id: string) => {
    try {
      const ds = await api.getDataset(id);
      setSelectedDs(ds);
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return <LoadingState message="Loading Verified Repository and Legal Provenance Registry..." />;
  }

  return (
    <div className="repository-view">
      <PageHeader
        title="Centralized Data, Statute & Source Repository"
        subtitle="Official registries, legislative acts, policy research briefs, and structured governance datasets with cryptographic checksums."
      />

      {/* Sub tabs */}
      <div style={{ display: "flex", gap: "10px", marginBottom: "20px", flexWrap: "wrap" }}>
        <button
          className={`btn ${subTab === "sources" ? "btn-primary" : "btn-secondary"}`}
          onClick={() => { setSubTab("sources"); setSelectedDoc(null); setSelectedDs(null); }}
        >
          <ShieldCheck size={16} /> Verified Sources Registry ({sources.length})
        </button>
        <button
          className={`btn ${subTab === "documents" ? "btn-primary" : "btn-secondary"}`}
          onClick={() => { setSubTab("documents"); setSelectedDoc(null); setSelectedDs(null); }}
        >
          <FileText size={16} /> Legal Statutes & Policies ({documents.length})
        </button>
        <button
          className={`btn ${subTab === "datasets" ? "btn-primary" : "btn-secondary"}`}
          onClick={() => { setSubTab("datasets"); setSelectedDoc(null); setSelectedDs(null); }}
        >
          <Database size={16} /> Structured Datasets ({datasets.length})
        </button>
      </div>

      {/* 1. SOURCES REGISTRY */}
      {subTab === "sources" && (
        <div className="card">
          <div className="card-header">
            <div className="card-title">
              <span>Verified Government & Legal Provenance Registry</span>
            </div>
          </div>

          {sources.length === 0 ? (
            <EmptyState
              title="No Sources Configured"
              description="No official government sources are currently registered."
            />
          ) : (
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Source ID</th>
                    <th>Source Name & Publisher</th>
                    <th>Domain</th>
                    <th>Format / Mode</th>
                    <th>SHA-256 Checksum</th>
                    <th>Official Portal</th>
                  </tr>
                </thead>
                <tbody>
                  {sources.map(s => (
                    <tr key={s.source_id}>
                      <td><code style={{ fontSize: "0.78rem", fontWeight: 600, color: "var(--primary)" }}>{s.source_id}</code></td>
                      <td>
                        <div style={{ fontWeight: 600 }}>{s.source_name}</div>
                        <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>{s.publisher}</div>
                      </td>
                      <td style={{ fontSize: "0.8rem", color: "var(--text-main)" }}>{s.domain}</td>
                      <td>
                        <div style={{ fontSize: "0.78rem" }}>{s.data_format}</div>
                        <div style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>{s.access_mode}</div>
                      </td>
                      <td>
                        <span className="badge-hash" title={s.checksum_sha256}>
                          {s.checksum_sha256 ? `${s.checksum_sha256.substring(0, 12)}...` : "None"}
                        </span>
                      </td>
                      <td>
                        <a
                          href={s.official_url}
                          target="_blank"
                          rel="noreferrer"
                          className="btn btn-secondary btn-sm"
                          style={{ textDecoration: "none" }}
                        >
                          Visit Portal <ExternalLink size={12} />
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* 2. STATUTES & LEGAL PROVISIONS */}
      {subTab === "documents" && !selectedDoc && (
        <div className="card">
          <div className="card-header">
            <div className="card-title">
              <span>Statutory Enactments, Guidelines & Legislative Briefs</span>
            </div>
          </div>

          {documents.length === 0 ? (
            <EmptyState
              title="No Documents Indexed"
              description="No legal enactments or statutory documents are currently available."
            />
          ) : (
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Document ID</th>
                    <th>Title & Act Number</th>
                    <th>Jurisdiction</th>
                    <th>Document Type</th>
                    <th>Publisher</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {documents.map(d => (
                    <tr key={d.document_id}>
                      <td><code style={{ fontSize: "0.78rem", fontWeight: 600, color: "var(--primary)" }}>{d.document_id}</code></td>
                      <td>
                        <div style={{ fontWeight: 600 }}>{d.title}</div>
                        {d.act_number && (
                          <div style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>Act No: {d.act_number}</div>
                        )}
                      </td>
                      <td>{d.jurisdiction}</td>
                      <td style={{ fontSize: "0.8rem", color: "var(--text-main)" }}>{d.document_type}</td>
                      <td style={{ fontSize: "0.78rem" }}>{d.publisher}</td>
                      <td>
                        <button className="btn btn-secondary btn-sm" onClick={() => viewDoc(d.document_id)}>
                          View Provisions
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Document Detail View */}
      {subTab === "documents" && selectedDoc && (
        <div className="card">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
            <button className="btn btn-secondary btn-sm" onClick={() => setSelectedDoc(null)}>
              <ArrowLeft size={14} /> Back to Documents List
            </button>
            <code style={{ fontSize: "0.82rem", fontWeight: 600, color: "var(--primary)" }}>{selectedDoc.document?.document_id}</code>
          </div>

          <h3 style={{ fontSize: "1.2rem", fontWeight: 700, color: "var(--primary)" }}>
            {selectedDoc.document?.title}
          </h3>
          <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginTop: "4px", marginBottom: "16px" }}>
            {selectedDoc.document?.summary}
          </p>

          <div className="card-title" style={{ marginTop: "16px", marginBottom: "10px" }}>
            Indexed Provisions & Chunks ({selectedDoc.chunks?.length || 0})
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {(selectedDoc.chunks || []).map((c: any) => (
              <div key={c.chunk_id} className="evidence-box">
                <div className="evidence-header">
                  <span className="evidence-title">{c.section} {c.topic ? `- ${c.topic}` : ""}</span>
                  <span className="badge-hash">{c.chunk_id}</span>
                </div>
                <p className="evidence-text">{c.content}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. STRUCTURED DATASETS */}
      {subTab === "datasets" && !selectedDs && (
        <div className="card">
          <div className="card-header">
            <div className="card-title">
              <span>National Structured Governance Datasets</span>
            </div>
          </div>

          {datasets.length === 0 ? (
            <EmptyState
              title="No Datasets Available"
              description="No structured datasets are currently loaded in the repository."
            />
          ) : (
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Dataset ID</th>
                    <th>Title</th>
                    <th>Coverage / Geography</th>
                    <th>Row Count</th>
                    <th>SHA-256 Fingerprint</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {datasets.map(ds => (
                    <tr key={ds.dataset_id}>
                      <td><code style={{ fontSize: "0.78rem", fontWeight: 600, color: "var(--primary)" }}>{ds.dataset_id}</code></td>
                      <td>
                        <div style={{ fontWeight: 600 }}>{ds.title}</div>
                        <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>{ds.description}</div>
                      </td>
                      <td>{ds.geography}</td>
                      <td><strong>{ds.row_count}</strong> records</td>
                      <td>
                        <span className="badge-hash">{ds.checksum_sha256 ? `${ds.checksum_sha256.substring(0, 12)}...` : "None"}</span>
                      </td>
                      <td>
                        <button className="btn btn-secondary btn-sm" onClick={() => viewDs(ds.dataset_id)}>
                          Inspect Data
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Dataset Detail View */}
      {subTab === "datasets" && selectedDs && (
        <div className="card">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
            <button className="btn btn-secondary btn-sm" onClick={() => setSelectedDs(null)}>
              <ArrowLeft size={14} /> Back to Datasets List
            </button>
            <span className="badge badge-green">{selectedDs.dataset?.dataset_id}</span>
          </div>

          <h3 style={{ fontSize: "1.2rem", fontWeight: 700, color: "var(--primary)" }}>
            {selectedDs.dataset?.title}
          </h3>
          <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginTop: "4px", marginBottom: "16px" }}>
            {selectedDs.dataset?.description}
          </p>

          <pre style={{ maxHeight: "400px", overflowY: "auto" }}>
            {JSON.stringify(selectedDs.dataset?.records, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
};
