import React, { useEffect, useState } from "react";
import { api } from "../api/client.js";
import { 
  FileText, 
  Upload, 
  CheckCircle2, 
  AlertTriangle, 
  ShieldCheck, 
  XCircle, 
  Languages 
} from "lucide-react";

export const DigitizerPage: React.FC<{ userRole: string }> = ({ userRole }) => {
  const [records, setRecords] = useState<any[]>([]);
  const [docName, setDocName] = useState<string>("UP_Khatauni_Sadar_104.pdf");
  const [rawText, setRawText] = useState<string>(
    "खाता खतौनी संख्या: 142. ग्राम: रामपुर, परगना व तहसील: सदर, जिला: लखनऊ. खातेदार का नाम: रामेश्वर सिंह पुत्र विजय सिंह. खसरा संख्या: 104/1. क्षेत्रफल: 0.850 हेक्टर. बैंक बंधक: पंजाब नेशनल बैंक 50,000 रु. ऋण बंधक।"
  );
  const [extractedResult, setExtractedResult] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [reviewModalRecord, setReviewModalRecord] = useState<any>(null);

  const fetchRecords = () => {
    api.getRecords().then(res => setRecords(res.records || []));
  };

  useEffect(() => {
    fetchRecords();
  }, []);

  const handleUploadAndExtract = async () => {
    setLoading(true);
    try {
      const res = await api.uploadRecord(docName, rawText);
      setExtractedResult(res);
      fetchRecords();
    } catch (err: any) {
      alert("Extraction failed: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (recordId: string) => {
    try {
      await api.verifyRecord(recordId);
      alert(`Record ${recordId} has been successfully verified!`);
      setReviewModalRecord(null);
      fetchRecords();
    } catch (err: any) {
      alert("Verification failed: " + err.message);
    }
  };

  const handleReject = async (recordId: string) => {
    try {
      await api.rejectRecord(recordId, "Low OCR clarity / mismatched survey coordinates");
      alert(`Record ${recordId} rejected.`);
      setReviewModalRecord(null);
      fetchRecords();
    } catch (err: any) {
      alert("Rejection failed: " + err.message);
    }
  };

  const isAuthorized = userRole === "official" || userRole === "admin";

  return (
    <div className="digitizer-view">
      <div style={{ marginBottom: "20px" }}>
        <h2 style={{ fontSize: "1.4rem", fontWeight: 800, color: "var(--primary)" }}>
          Intelligent Land Record Digitization & Verification (SIH26018)
        </h2>
        <p style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>
          Multilingual OCR parsing (Hindi Khatauni, Marathi 7/12), automated encumbrance detection, per-field confidence scoring, and official review queue.
        </p>
      </div>

      <div className="grid-2" style={{ marginBottom: "24px" }}>
        {/* Document Ingestion Form */}
        <div className="card">
          <div className="card-header">
            <div className="card-title">
              <Upload size={18} color="var(--primary)" />
              <span>Ingest Scanned Land Record</span>
            </div>
            <span className="badge badge-blue">
              <Languages size={12} /> Multilingual (Hindi / Marathi / English)
            </span>
          </div>

          <div className="form-group">
            <label className="form-label">Document Title / Scanned Extract Name:</label>
            <input
              type="text"
              className="form-input"
              value={docName}
              onChange={e => setDocName(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Scanned OCR Text / Historical Script Extract:</label>
            <textarea
              className="form-textarea"
              style={{ minHeight: "120px" }}
              value={rawText}
              onChange={e => setRawText(e.target.value)}
            />
          </div>

          <div style={{ display: "flex", gap: "8px", marginBottom: "16px" }}>
            <button
              className="btn btn-secondary btn-sm"
              onClick={() => {
                setDocName("UP_Khatauni_Sadar_104.pdf");
                setRawText("खाता खतौनी संख्या: 142. ग्राम: रामपुर, परगना व तहसील: सदर, जिला: लखनऊ. खातेदार का नाम: रामेश्वर सिंह पुत्र विजय सिंह. खसरा संख्या: 104/1. क्षेत्रफल: 0.850 हेक्टर. बैंक बंधक: पंजाब नेशनल बैंक 50,000 रु. ऋण बंधक।");
              }}
            >
              Load UP Khatauni Sample
            </button>
            <button
              className="btn btn-secondary btn-sm"
              onClick={() => {
                setDocName("MH_Satbara_Pune_Haveli.pdf");
                setRawText("गाव नमुना ७ (अधिकार अभिलेख पत्रक) - १२ (पिकांची नोंदवही). गाव: बावधन, तालुका: हवेली, जिल्हा: पुणे. खातेदार: दत्तात्रय शंकर जोशी. गट क्रमांक: 218/3. क्षेत्र: 1.25 हेक्टर. इतर अधिकार: बँक ऑफ महाराष्ट्र बोजा रु. 1,50,000/-.");
              }}
            >
              Load Maharashtra 7/12 Sample
            </button>
          </div>

          <button
            className="btn btn-primary"
            style={{ width: "100%" }}
            onClick={handleUploadAndExtract}
            disabled={loading}
          >
            <FileText size={16} />
            <span>{loading ? "Extracting Fields..." : "Run AI OCR Field Extraction"}</span>
          </button>
        </div>

        {/* Real-time Field Extraction Result */}
        <div className="card">
          <div className="card-header">
            <div className="card-title">
              <CheckCircle2 size={18} color="var(--primary)" />
              <span>Extracted Fields & Confidence Scoring</span>
            </div>
            {extractedResult && (
              <span className={`badge ${extractedResult.overall_confidence > 0.85 ? "badge-green" : "badge-amber"}`}>
                Confidence: {(extractedResult.overall_confidence * 100).toFixed(0)}%
              </span>
            )}
          </div>

          {extractedResult ? (
            <div>
              <div style={{ marginBottom: "12px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <span className="badge badge-blue">{extractedResult.record_id}</span>
                  <span style={{ marginLeft: "8px", fontWeight: 600 }}>{extractedResult.document_name}</span>
                </div>
                <span className={`badge ${extractedResult.verification_status === "verified" ? "badge-green" : "badge-amber"}`}>
                  Status: {extractedResult.verification_status}
                </span>
              </div>

              {/* Fields Table */}
              <div className="table-container" style={{ maxHeight: "280px", overflowY: "auto" }}>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Field</th>
                      <th>Extracted Value</th>
                      <th>Confidence</th>
                      <th>Flag</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(extractedResult.fields || {}).map(([key, f]: [string, any]) => (
                      <tr key={key}>
                        <td style={{ fontWeight: 600 }}>{key.replace(/_/g, " ").toUpperCase()}</td>
                        <td>{String(f.value || "-")}</td>
                        <td>
                          <span className={`badge ${f.confidence >= 0.85 ? "badge-green" : "badge-amber"}`}>
                            {(f.confidence * 100).toFixed(0)}%
                          </span>
                        </td>
                        <td>
                          {f.flagged ? (
                            <span className="badge badge-red">Review</span>
                          ) : (
                            <span className="badge badge-green">Passed</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Encumbrance alert if detected */}
              {extractedResult.fields?.encumbrances?.value && (
                <div style={{ marginTop: "12px", padding: "8px 12px", backgroundColor: "#fffbeb", border: "1px solid #fde68a", borderRadius: "4px", fontSize: "0.78rem", color: "#92400e" }}>
                  <strong>Encumbrance / Bank Mortgage Detected:</strong> {extractedResult.fields.encumbrances.value}
                </div>
              )}
            </div>
          ) : (
            <div style={{ padding: "40px", textAlign: "center", color: "var(--text-muted)" }}>
              Upload or select a land record sample to inspect OCR extraction.
            </div>
          )}
        </div>
      </div>

      {/* Official Human Verification Queue */}
      <div className="card">
        <div className="card-header">
          <div>
            <div className="card-title">
              <ShieldCheck size={18} color="var(--primary)" />
              <span>Official Human-in-the-Loop Review Queue</span>
            </div>
            <div className="card-subtitle">
              {isAuthorized 
                ? "You have official verification privileges. Review extracted fields and commit verified records to authoritative store."
                : "Read-only mode. Switch to 'Government Official' or 'Platform Administrator' role in top bar to perform verification."
              }
            </div>
          </div>
          <span className="badge badge-amber">{records.filter(r => r.verification_status === "pending_review").length} Pending</span>
        </div>

        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Record ID</th>
                <th>Document</th>
                <th>State & District</th>
                <th>Language</th>
                <th>Confidence</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {records.map(r => (
                <tr key={r.record_id}>
                  <td><span className="badge badge-blue">{r.record_id}</span></td>
                  <td style={{ fontWeight: 600 }}>{r.document_name}</td>
                  <td>{r.district}, {r.state}</td>
                  <td>{r.language}</td>
                  <td>
                    <span className={`badge ${r.overall_confidence >= 0.85 ? "badge-green" : "badge-amber"}`}>
                      {(r.overall_confidence * 100).toFixed(0)}%
                    </span>
                  </td>
                  <td>
                    <span className={`badge ${r.verification_status === "verified" ? "badge-green" : (r.verification_status === "rejected" ? "badge-red" : "badge-amber")}`}>
                      {r.verification_status}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: "flex", gap: "6px" }}>
                      <button
                        className="btn btn-secondary btn-sm"
                        onClick={() => setReviewModalRecord(r)}
                      >
                        Inspect
                      </button>
                      {isAuthorized && r.verification_status === "pending_review" && (
                        <>
                          <button
                            className="btn btn-primary btn-sm"
                            onClick={() => handleVerify(r.record_id)}
                          >
                            Verify
                          </button>
                          <button
                            className="btn btn-secondary btn-sm"
                            style={{ color: "#b91c1c" }}
                            onClick={() => handleReject(r.record_id)}
                          >
                            Reject
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Record Inspect Modal */}
      {reviewModalRecord && (
        <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: "20px" }}>
          <div className="card" style={{ width: "650px", maxWidth: "100%", maxHeight: "90vh", overflowY: "auto", margin: 0 }}>
            <div className="card-header">
              <div className="card-title">
                <span>Record Inspection: {reviewModalRecord.record_id}</span>
              </div>
              <button className="btn btn-secondary btn-sm" onClick={() => setReviewModalRecord(null)}>
                Close
              </button>
            </div>

            <div style={{ marginBottom: "14px" }}>
              <div style={{ fontWeight: 700 }}>{reviewModalRecord.document_name}</div>
              <div style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>
                {reviewModalRecord.tehsil}, {reviewModalRecord.district}, {reviewModalRecord.state}
              </div>
            </div>

            <div style={{ marginBottom: "14px" }}>
              <label className="form-label">Raw OCR Text:</label>
              <div style={{ fontSize: "0.82rem", backgroundColor: "#f8fafc", padding: "10px", borderRadius: "4px", border: "1px solid #e2e8f0" }}>
                {reviewModalRecord.raw_ocr_text}
              </div>
            </div>

            <div className="table-container" style={{ marginBottom: "16px" }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Field</th>
                    <th>Value</th>
                    <th>Confidence</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(reviewModalRecord.fields || {}).map(([k, v]: [string, any]) => (
                    <tr key={k}>
                      <td style={{ fontWeight: 600 }}>{k}</td>
                      <td>{String(v.value || "-")}</td>
                      <td>{(v.confidence * 100).toFixed(0)}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {isAuthorized && reviewModalRecord.verification_status === "pending_review" && (
              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
                <button className="btn btn-secondary" onClick={() => handleReject(reviewModalRecord.record_id)}>
                  <XCircle size={16} /> Reject Record
                </button>
                <button className="btn btn-primary" onClick={() => handleVerify(reviewModalRecord.record_id)}>
                  <CheckCircle2 size={16} /> Approve & Commit to Registry
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
