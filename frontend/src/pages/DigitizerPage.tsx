import React, { useEffect, useState, useRef } from "react";
import { api } from "../api/client.js";
import { PageHeader } from "../components/PageHeader.js";
import { LoadingState } from "../components/LoadingState.js";
import { EmptyState } from "../components/EmptyState.js";
import { 
  FileText, 
  Upload, 
  CheckCircle2, 
  ShieldCheck, 
  XCircle, 
  Languages,
  AlertCircle,
  FileSearch,
  Check,
  Eye,
  Image as ImageIcon,
  FileUp,
  Trash2,
  Sparkles,
  RefreshCw,
  ExternalLink
} from "lucide-react";

export const DigitizerPage: React.FC<{ userRole: string }> = ({ userRole }) => {
  const [records, setRecords] = useState<any[]>([]);
  const [ingestionMode, setIngestionMode] = useState<"upload" | "sample">("upload");
  const [selectedSample, setSelectedSample] = useState<"up" | "mh">("up");
  
  // File upload state
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const [isDragActive, setIsDragActive] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [docName, setDocName] = useState<string>("UP_Khatauni_Sadar_104.pdf");
  const [rawText, setRawText] = useState<string>(
    "खाता खतौनी संख्या: 142. ग्राम: रामपुर, परगना व तहसील: सदर, जिला: लखनऊ. खातेदार का नाम: रामेश्वर सिंह पुत्र विजय सिंह. खसरा संख्या: 104/1. क्षेत्रफल: 0.850 हेक्टर. बैंक बंधक: पंजाब नेशनल बैंक 50,000 रु. ऋण बंधक।"
  );
  const [extractedResult, setExtractedResult] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [initialLoading, setInitialLoading] = useState<boolean>(true);
  const [reviewModalRecord, setReviewModalRecord] = useState<any>(null);

  const fetchRecords = () => {
    return api.getRecords()
      .then(res => setRecords(res.records || []))
      .catch(err => console.error("Error loading land records:", err));
  };

  useEffect(() => {
    fetchRecords().finally(() => setInitialLoading(false));
  }, []);

  // Cleanup object URL
  useEffect(() => {
    return () => {
      if (imagePreviewUrl) {
        URL.revokeObjectURL(imagePreviewUrl);
      }
    };
  }, [imagePreviewUrl]);

  const handleFileChange = (file: File | null) => {
    if (imagePreviewUrl) {
      URL.revokeObjectURL(imagePreviewUrl);
      setImagePreviewUrl(null);
    }

    if (!file) {
      setSelectedFile(null);
      return;
    }

    setSelectedFile(file);
    setDocName(file.name);
    setIngestionMode("upload");

    if (file.type.startsWith("image/")) {
      const url = URL.createObjectURL(file);
      setImagePreviewUrl(url);
      setRawText(""); // Cleared so OCR extracts fresh from the image
    } else if (file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf")) {
      setImagePreviewUrl(null);
      setRawText(""); // Server will extract text using pypdf
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      handleFileChange(file);
    }
  };

  const handleSampleSwitch = (type: "up" | "mh") => {
    setSelectedSample(type);
    setSelectedFile(null);
    if (imagePreviewUrl) {
      URL.revokeObjectURL(imagePreviewUrl);
      setImagePreviewUrl(null);
    }

    if (type === "up") {
      setDocName("UP_Khatauni_Sadar_104.pdf");
      setRawText("खाता खतौनी संख्या: 142. ग्राम: रामपुर, परगना व तहसील: सदर, जिला: लखनऊ. खातेदार का नाम: रामेश्वर सिंह पुत्र विजय सिंह. खसरा संख्या: 104/1. क्षेत्रफल: 0.850 हेक्टर. बैंक बंधक: पंजाब नेशनल बैंक 50,000 रु. ऋण बंधक।");
    } else {
      setDocName("MH_Satbara_Pune_Haveli.pdf");
      setRawText("गाव नमुना ७ (अधिकार अभिलेख पत्रक) - १२ (पिकांची नोंदवही). गाव: बावधन, तालुका: हवेली, जिल्हा: पुणे. खातेदार: दत्तात्रय शंकर जोशी. गट क्रमांक: 218/3. क्षेत्र: 1.25 हेक्टर. इतर अधिकार: बँक ऑफ महाराष्ट्र बोजा रु. 1,50,000/-.");
    }
  };

  const handleUploadAndExtract = async () => {
    setLoading(true);
    try {
      let res: any;
      if (selectedFile) {
        // Multipart file upload with actual PDF or picture!
        const formData = new FormData();
        formData.append("file", selectedFile);
        formData.append("document_name", docName);
        if (rawText) {
          formData.append("raw_text", rawText);
        }
        res = await api.uploadRecordFile(formData);
      } else {
        // Text-based sample ingestion
        res = await api.uploadRecord(docName, rawText);
      }

      setExtractedResult(res);
      if (res.raw_ocr_text) {
        setRawText(res.raw_ocr_text);
      }
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

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const isAuthorized = userRole === "official" || userRole === "admin";

  if (initialLoading) {
    return <LoadingState message="Loading Intelligent Land Record Digitization Queue..." minHeight={300} />;
  }

  return (
    <div className="digitizer-view">
      <PageHeader
        title="Intelligent Land Record Digitization & Verification"
        subtitle="Upload scanned revenue documents (PDF, JPG, PNG) for multilingual OCR parsing (Hindi Khatauni, Marathi 7/12), automated encumbrance detection, and official review."
      />

      <div className="grid-2" style={{ marginBottom: "24px" }}>
        {/* Document Ingestion & Source Gazette */}
        <div className="card">
          <div className="card-header">
            <div className="card-title">
              <Upload size={18} color="var(--sovereign-navy)" />
              <span>Ingest Land Record Document</span>
            </div>
            <span className="badge badge-blue">PDF & Image OCR</span>
          </div>

          {/* Mode Switcher: Upload File vs Preloaded Samples */}
          <div style={{ display: "flex", gap: "8px", marginBottom: "14px", borderBottom: "1px solid var(--border-hairline)", paddingBottom: "10px" }}>
            <button
              className={`btn btn-sm ${ingestionMode === "upload" ? "btn-primary" : "btn-secondary"}`}
              style={{ fontSize: "0.78rem" }}
              onClick={() => setIngestionMode("upload")}
            >
              <FileUp size={14} />
              <span>Upload PDF or Picture</span>
            </button>
            <button
              className={`btn btn-sm ${ingestionMode === "sample" ? "btn-primary" : "btn-secondary"}`}
              style={{ fontSize: "0.78rem" }}
              onClick={() => {
                setIngestionMode("sample");
                handleSampleSwitch(selectedSample);
              }}
            >
              <Languages size={14} />
              <span>Use Official RoR Sample</span>
            </button>
          </div>

          {/* Hidden File Input */}
          <input
            type="file"
            ref={fileInputRef}
            style={{ display: "none" }}
            accept=".pdf,image/png,image/jpeg,image/jpg,image/webp,image/tiff"
            onChange={e => {
              if (e.target.files && e.target.files.length > 0) {
                handleFileChange(e.target.files[0]);
              }
            }}
          />

          {/* A. Upload Mode: Drag-and-Drop Zone & File Details */}
          {ingestionMode === "upload" && (
            <div>
              {!selectedFile ? (
                <div
                  className={`file-upload-dropzone ${isDragActive ? "drag-active" : ""}`}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <div className="file-upload-icon-circle">
                    <FileUp size={22} />
                  </div>
                  <div className="file-upload-title">
                    Upload Scanned Record PDF or Picture
                  </div>
                  <div className="file-upload-hint">
                    Drag and drop your file here, or click to browse from device
                  </div>
                  <div style={{ display: "flex", gap: "6px", marginTop: "4px" }}>
                    <span className="badge badge-blue" style={{ fontSize: "0.68rem" }}>PDF</span>
                    <span className="badge badge-blue" style={{ fontSize: "0.68rem" }}>JPG / PNG</span>
                    <span className="badge badge-blue" style={{ fontSize: "0.68rem" }}>WebP</span>
                    <span style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>Up to 30 MB</span>
                  </div>
                </div>
              ) : (
                <div>
                  {/* File Attached Banner */}
                  <div className="file-attached-card">
                    <div className="file-attached-info">
                      <div className="file-attached-badge badge-green">
                        {selectedFile.type.startsWith("image/") ? (
                          <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                            <ImageIcon size={13} /> Picture
                          </span>
                        ) : (
                          <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                            <FileText size={13} /> PDF
                          </span>
                        )}
                      </div>
                      <div>
                        <div className="file-attached-name" title={selectedFile.name}>
                          {selectedFile.name}
                        </div>
                        <div className="file-attached-meta">
                          {formatBytes(selectedFile.size)} &bull; Ready for Extraction
                        </div>
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: "6px" }}>
                      <button
                        className="btn btn-secondary btn-sm"
                        style={{ fontSize: "0.72rem", padding: "4px 8px" }}
                        onClick={() => fileInputRef.current?.click()}
                      >
                        Change
                      </button>
                      <button
                        className="btn btn-secondary btn-sm"
                        style={{ fontSize: "0.72rem", padding: "4px 8px", color: "#b91c1c" }}
                        onClick={() => handleFileChange(null)}
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>

                  {/* Scanned Image Preview if picture uploaded */}
                  {imagePreviewUrl && (
                    <div className="image-preview-container">
                      <div style={{ fontSize: "0.7rem", color: "var(--text-muted)", marginBottom: "6px", textAlign: "left", fontWeight: 600 }}>
                        Scanned Picture Preview:
                      </div>
                      <img src={imagePreviewUrl} alt="Uploaded Land Record" />
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* B. Preloaded Sample Tabs */}
          {ingestionMode === "sample" && (
            <div className="doc-sample-tabs">
              <button
                className={`doc-sample-tab-btn ${selectedSample === "up" ? "active" : ""}`}
                onClick={() => handleSampleSwitch("up")}
              >
                <Languages size={13} />
                <span>UP Khatauni Sadar (Hindi RoR)</span>
              </button>
              <button
                className={`doc-sample-tab-btn ${selectedSample === "mh" ? "active" : ""}`}
                onClick={() => handleSampleSwitch("mh")}
              >
                <Languages size={13} />
                <span>MH 7/12 Satbara Pune (Marathi)</span>
              </button>
            </div>
          )}

          <div className="form-group" style={{ marginBottom: "12px" }}>
            <label className="form-label">Document Name / Registry Title:</label>
            <input
              type="text"
              className="form-input"
              value={docName}
              onChange={e => setDocName(e.target.value)}
            />
          </div>

          <div className="form-group" style={{ marginBottom: "16px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
              <label className="form-label" style={{ margin: 0 }}>
                {selectedFile ? "Extracted / Inspected Text (Editable):" : "Historical Script Extract / Scanned Text:"}
              </label>
              <span style={{ fontSize: "0.72rem", color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>
                {rawText.length} chars {selectedFile ? "(From File)" : "(Sample)"}
              </span>
            </div>
            <textarea
              className="form-textarea"
              placeholder={selectedFile ? "Text extracted from your uploaded file will appear here or can be manually supplemented..." : "Type or paste scanned text here..."}
              style={{
                minHeight: "110px",
                fontFamily: "var(--font-sans)",
                fontSize: "0.9rem",
                lineHeight: "1.55",
                padding: "10px 12px",
                borderRadius: "6px"
              }}
              value={rawText}
              onChange={e => setRawText(e.target.value)}
            />
          </div>

          <button
            className="btn btn-primary"
            style={{ width: "100%", padding: "10px" }}
            onClick={handleUploadAndExtract}
            disabled={loading}
          >
            {loading ? (
              <>
                <RefreshCw size={16} className="spin" />
                <span>Processing Document & Extracting Fields...</span>
              </>
            ) : (
              <>
                <Sparkles size={16} />
                <span>Run AI Multilingual Field Extraction</span>
              </>
            )}
          </button>
        </div>

        {/* Real-time Field Extraction Result */}
        <div className="card" style={{ display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
          <div>
            <div className="card-header">
              <div className="card-title">
                <CheckCircle2 size={18} color="var(--cadastral-emerald)" />
                <span>Extracted Fields & Confidence Scoring</span>
              </div>
              {extractedResult && (
                <span className="badge badge-green" style={{ fontFamily: "var(--font-mono)" }}>
                  {(extractedResult.overall_confidence * 100).toFixed(0)}% Overall Confidence
                </span>
              )}
            </div>

            {loading && (
              <LoadingState message="Uploading document and parsing revenue entities with zero-hallucination..." minHeight={240} />
            )}

            {!loading && extractedResult && (
              <div>
                <div style={{ marginBottom: "14px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "8px", padding: "10px 14px", backgroundColor: "#f8fafc", borderRadius: "6px", border: "1px solid #e2e8f0" }}>
                  <div>
                    <code style={{ fontSize: "0.82rem", fontWeight: 700, color: "var(--sovereign-navy)", fontFamily: "var(--font-mono)" }}>
                      {extractedResult.record_id}
                    </code>
                    <span style={{ marginLeft: "8px", fontWeight: 600, fontSize: "0.85rem" }}>
                      {extractedResult.document_name}
                    </span>
                  </div>
                  <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
                    {extractedResult.file?.url && (
                      <a
                        href={extractedResult.file.url}
                        target="_blank"
                        rel="noreferrer"
                        className="btn btn-secondary btn-sm"
                        style={{ fontSize: "0.72rem", padding: "2px 8px" }}
                      >
                        <span>View File</span>
                        <ExternalLink size={11} />
                      </a>
                    )}
                    <span className={`badge ${extractedResult.verification_status === "verified" ? "badge-green" : "badge-amber"}`}>
                      {extractedResult.verification_status}
                    </span>
                  </div>
                </div>

                {/* Fields Table */}
                <div className="table-container" style={{ maxHeight: "250px", overflowY: "auto", marginBottom: "12px" }}>
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Field Name</th>
                        <th>Extracted Entity</th>
                        <th>Confidence</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Object.entries(extractedResult.fields || {})
                        .filter(([k]) => !k.startsWith("_"))
                        .map(([key, f]: [string, any]) => (
                          <tr key={key}>
                            <td style={{ fontWeight: 600, fontFamily: "var(--font-tech)", fontSize: "0.76rem" }}>
                              {key.replace(/_/g, " ").toUpperCase()}
                            </td>
                            <td style={{ fontSize: "0.85rem" }}>{String(f.value || "-")}</td>
                            <td style={{ fontFamily: "var(--font-mono)", fontWeight: 700, color: f.confidence >= 0.85 ? "#065f46" : "#b45309" }}>
                              {(f.confidence * 100).toFixed(0)}%
                            </td>
                            <td>
                              {f.flagged ? (
                                <span className="badge badge-red" style={{ fontSize: "0.68rem" }}>Flagged</span>
                              ) : (
                                <span className="badge badge-green" style={{ fontSize: "0.68rem" }}>Passed</span>
                              )}
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>

                {/* Encumbrance Alert Banner */}
                {extractedResult.fields?.encumbrances?.value && (
                  <div style={{ padding: "10px 14px", backgroundColor: "#fffbeb", border: "1px solid #fde68a", borderRadius: "6px", fontSize: "0.8rem", color: "#92400e", display: "flex", alignItems: "flex-start", gap: "8px" }}>
                    <AlertCircle size={16} color="#b45309" style={{ flexShrink: 0, marginTop: "2px" }} />
                    <div>
                      <strong>Bank Encumbrance / Mortgage Detected:</strong>
                      <div style={{ marginTop: "2px", color: "#78350f" }}>{extractedResult.fields.encumbrances.value}</div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {!loading && !extractedResult && (
              /* High-Craft Blueprint Preview (Replaces Empty AI Box) */
              <div>
                <div style={{ padding: "14px", backgroundColor: "#f8fafc", borderRadius: "6px", border: "1px solid #e2e8f0", marginBottom: "14px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
                    <FileSearch size={16} color="var(--sovereign-navy)" />
                    <span style={{ fontFamily: "var(--font-tech)", fontSize: "0.8rem", fontWeight: 700, textTransform: "uppercase", color: "var(--sovereign-navy)" }}>
                      Multilingual Field Extraction Blueprint
                    </span>
                  </div>
                  <p style={{ fontSize: "0.82rem", color: "var(--text-secondary)", lineHeight: 1.45, marginBottom: "10px" }}>
                    The neural OCR parser identifies statutory entities from scanned Devanagari Record of Rights (RoR) extracts and standardizes them into the National Land Record Data Standard:
                  </p>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", fontSize: "0.78rem" }}>
                    <div style={{ background: "#ffffff", padding: "8px 10px", borderRadius: "4px", border: "1px solid #e2e8f0" }}>
                      <span style={{ color: "var(--text-muted)", display: "block", fontSize: "0.7rem", fontFamily: "var(--font-tech)" }}>ROR IDENTIFIER</span>
                      <strong>Khatauni / Gat No.</strong> (Automated script conversion)
                    </div>
                    <div style={{ background: "#ffffff", padding: "8px 10px", borderRadius: "4px", border: "1px solid #e2e8f0" }}>
                      <span style={{ color: "var(--text-muted)", display: "block", fontSize: "0.7rem", fontFamily: "var(--font-tech)" }}>TENURE HOLDER</span>
                      <strong>Primary Khatedar</strong> (Parentage parsing)
                    </div>
                    <div style={{ background: "#ffffff", padding: "8px 10px", borderRadius: "4px", border: "1px solid #e2e8f0" }}>
                      <span style={{ color: "var(--text-muted)", display: "block", fontSize: "0.7rem", fontFamily: "var(--font-tech)" }}>PARCEL AREA</span>
                      <strong>Metric Hectares</strong> (Normalized units)
                    </div>
                    <div style={{ background: "#ffffff", padding: "8px 10px", borderRadius: "4px", border: "1px solid #e2e8f0" }}>
                      <span style={{ color: "var(--text-muted)", display: "block", fontSize: "0.7rem", fontFamily: "var(--font-tech)" }}>LEGAL ENCUMBRANCE</span>
                      <strong>Bank Liens & Mortgages</strong> (Active debt detection)
                    </div>
                  </div>
                </div>

                <div style={{ padding: "10px 14px", backgroundColor: "#fffbeb", border: "1px solid #fef3c7", borderRadius: "6px", fontSize: "0.8rem", color: "#92400e" }}>
                  <strong>How to use:</strong> Select or drop your scanned PDF / picture on the left, or use the preloaded samples, then click <strong>Run AI Multilingual Field Extraction</strong>.
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Official Human Verification Queue */}
      <div className="card">
        <div className="card-header">
          <div>
            <div className="card-title">
              <ShieldCheck size={18} color="var(--sovereign-navy)" />
              <span>Official Human-in-the-Loop Review Queue</span>
            </div>
            <div className="card-subtitle">
              {isAuthorized 
                ? "You have official verification privileges. Review extracted fields and commit verified records to authoritative store."
                : "Read-only mode. Switch to 'Government Official' or 'Platform Administrator' role in top bar to perform verification."
              }
            </div>
          </div>
          <span className="badge badge-green">{records.length} Records In Queue</span>
        </div>

        {records.length === 0 ? (
          <EmptyState
            title="Review Queue Empty"
            description="No land records are currently pending review."
          />
        ) : (
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Record ID</th>
                  <th>Document Name</th>
                  <th>Jurisdiction (State / Tehsil)</th>
                  <th>Script & Language</th>
                  <th>OCR Confidence</th>
                  <th>Verification Status</th>
                  <th style={{ textAlign: "right" }}>Official Actions</th>
                </tr>
              </thead>
              <tbody>
                {records.map(r => (
                  <tr key={r.record_id}>
                    <td>
                      <code style={{ fontSize: "0.78rem", fontWeight: 700, color: "var(--sovereign-navy)", fontFamily: "var(--font-mono)" }}>
                        {r.record_id}
                      </code>
                    </td>
                    <td style={{ fontWeight: 600 }}>{r.document_name}</td>
                    <td>{r.district}, {r.state}</td>
                    <td>
                      <span className="badge badge-blue" style={{ fontSize: "0.72rem" }}>
                        {r.language}
                      </span>
                    </td>
                    <td style={{ fontFamily: "var(--font-mono)", fontWeight: 700, color: r.overall_confidence >= 0.85 ? "#065f46" : "#b45309" }}>
                      {(r.overall_confidence * 100).toFixed(0)}%
                    </td>
                    <td>
                      <span className={`badge ${r.verification_status === "verified" ? "badge-green" : (r.verification_status === "rejected" ? "badge-red" : "badge-amber")}`}>
                        {r.verification_status}
                      </span>
                    </td>
                    <td style={{ textAlign: "right" }}>
                      <div style={{ display: "inline-flex", gap: "6px" }}>
                        <button
                          className="btn btn-secondary btn-sm"
                          style={{ fontSize: "0.74rem", padding: "3px 9px" }}
                          onClick={() => setReviewModalRecord(r)}
                        >
                          <Eye size={12} />
                          <span>Inspect</span>
                        </button>
                        {isAuthorized && r.verification_status === "pending_review" && (
                          <>
                            <button
                              className="btn btn-primary btn-sm"
                              style={{ fontSize: "0.74rem", padding: "3px 9px" }}
                              onClick={() => handleVerify(r.record_id)}
                            >
                              <Check size={12} />
                              <span>Verify</span>
                            </button>
                            <button
                              className="btn btn-secondary btn-sm"
                              style={{ fontSize: "0.74rem", padding: "3px 9px", color: "#b91c1c", borderColor: "#fecaca" }}
                              onClick={() => handleReject(r.record_id)}
                            >
                              <span>Reject</span>
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
        )}
      </div>

      {/* Record Inspect Modal */}
      {reviewModalRecord && (
        <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(11, 37, 69, 0.5)", backdropFilter: "blur(2px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: "20px" }}>
          <div className="card" style={{ width: "680px", maxWidth: "100%", maxHeight: "90vh", overflowY: "auto", margin: 0, boxShadow: "var(--shadow-lg)" }}>
            <div className="card-header">
              <div className="card-title">
                <FileText size={18} color="var(--sovereign-navy)" />
                <span>Record Inspection: {reviewModalRecord.record_id}</span>
              </div>
              <button className="btn btn-secondary btn-sm" onClick={() => setReviewModalRecord(null)}>
                Close
              </button>
            </div>

            <div style={{ marginBottom: "14px", padding: "10px 14px", backgroundColor: "#f8fafc", borderRadius: "6px", border: "1px solid #e2e8f0" }}>
              <div style={{ fontWeight: 700, fontSize: "1rem", color: "var(--sovereign-navy)" }}>{reviewModalRecord.document_name}</div>
              <div style={{ fontSize: "0.78rem", color: "var(--text-muted)", marginTop: "2px" }}>
                Tehsil: {reviewModalRecord.tehsil} &bull; District: {reviewModalRecord.district}, {reviewModalRecord.state}
              </div>
            </div>

            <div style={{ marginBottom: "14px" }}>
              <label className="form-label" style={{ fontWeight: 700, fontFamily: "var(--font-tech)" }}>Raw OCR Text Extracted:</label>
              <div style={{ fontSize: "0.85rem", backgroundColor: "#fdfbf7", padding: "12px", borderRadius: "6px", border: "1px solid #e7e5e4", lineHeight: 1.5, color: "#292524" }}>
                {reviewModalRecord.raw_ocr_text}
              </div>
            </div>

            <div className="table-container" style={{ marginBottom: "16px" }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Entity Field</th>
                    <th>Normalized Value</th>
                    <th>Confidence</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(reviewModalRecord.fields || {})
                    .filter(([k]) => !k.startsWith("_"))
                    .map(([k, v]: [string, any]) => (
                      <tr key={k}>
                        <td style={{ fontWeight: 600, fontFamily: "var(--font-tech)", fontSize: "0.78rem" }}>
                          {k.replace(/_/g, " ").toUpperCase()}
                        </td>
                        <td style={{ fontSize: "0.85rem" }}>{String(v.value || "-")}</td>
                        <td style={{ fontFamily: "var(--font-mono)", fontWeight: 700, color: v.confidence >= 0.85 ? "#065f46" : "#b45309" }}>
                          {(v.confidence * 100).toFixed(0)}%
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>

            {isAuthorized && reviewModalRecord.verification_status === "pending_review" && (
              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", borderTop: "1px solid var(--border-hairline)", paddingTop: "14px" }}>
                <button className="btn btn-secondary" onClick={() => handleReject(reviewModalRecord.record_id)}>
                  <XCircle size={16} />
                  <span>Reject Record</span>
                </button>
                <button className="btn btn-primary" onClick={() => handleVerify(reviewModalRecord.record_id)}>
                  <CheckCircle2 size={16} />
                  <span>Approve & Commit to Registry</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
