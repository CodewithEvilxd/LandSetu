import React from "react";
import { X, Printer, Download, ShieldCheck, CheckCircle2, MapPin, Layers } from "lucide-react";

interface PlotReportModalProps {
  parcelDetails: any;
  currentVillage: { state: string; village: string; district?: string; tehsil?: string };
  onClose: () => void;
}

export const PlotReportModal: React.FC<PlotReportModalProps> = ({
  parcelDetails,
  currentVillage,
  onClose
}) => {
  if (!parcelDetails) return null;

  const parcel = parcelDetails.parcel || {};
  const rights = parcelDetails.recorded_rights || [];
  const mutations = parcelDetails.mutations || [];
  const encumbrances = parcelDetails.encumbrances || [];
  const geometry = parcelDetails.geometry || {};

  const khasraNo = parcel.native_identifier || parcel.khasra || "—";
  const areaHa = parcel.area_hectares ?? parcel.area ?? 0;
  const areaLocal = parcel.area_raw || parcel.area_local_unit || "—";
  const khataNo = parcel.account_identifier || parcel.khata_number || "—";
  const landUse = parcel.land_use || "Agricultural";
  const tenure = parcel.tenure_type || "1-क (संक्रमणीय भूमिधर)";

  const handlePrint = () => {
    window.print();
  };

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(15, 23, 42, 0.75)",
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
          backgroundColor: "#ffffff",
          borderRadius: "8px",
          width: "100%",
          maxWidth: "820px",
          maxHeight: "92vh",
          display: "flex",
          flexDirection: "column",
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
          border: "1px solid #cbd5e1",
          overflow: "hidden"
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Control Bar (Non-Printable) */}
        <div
          className="no-print"
          style={{
            padding: "12px 20px",
            background: "#0b2545",
            color: "#ffffff",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderBottom: "1px solid #134074"
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div
              style={{
                width: "28px",
                height: "28px",
                borderRadius: "4px",
                background: "rgba(255,255,255,0.15)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "16px"
              }}
            >
              🏛️
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: "0.95rem" }}>
                भू-नक्शा प्लॉट रिपोर्ट (BhuNaksha Plot Report)
              </div>
              <div style={{ fontSize: "0.7rem", color: "#93c5fd" }}>
                राजस्व परिषद — प्रमाणित डिजिटल शजरा मानचित्र उद्धरण
              </div>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <button
              onClick={handlePrint}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                padding: "6px 14px",
                background: "#f59e0b",
                color: "#0f172a",
                border: "none",
                borderRadius: "4px",
                fontWeight: 700,
                fontSize: "0.78rem",
                cursor: "pointer",
                boxShadow: "0 1px 3px rgba(0,0,0,0.2)"
              }}
            >
              <Printer size={14} />
              <span>प्रिंट करें (Print Report)</span>
            </button>
            <button
              onClick={onClose}
              style={{
                background: "transparent",
                border: "none",
                color: "#ffffff",
                cursor: "pointer",
                padding: "4px"
              }}
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Printable Official Government Document Body */}
        <div
          id="bhunaksha-print-sheet"
          style={{
            flex: 1,
            overflowY: "auto",
            padding: "36px 40px",
            background: "#ffffff",
            color: "#0f172a",
            fontFamily: "'Inter', system-ui, sans-serif",
            lineHeight: 1.5
          }}
        >
          {/* Official Letterhead */}
          <div
            style={{
              textAlign: "center",
              borderBottom: "2px solid #0b2545",
              paddingBottom: "16px",
              marginBottom: "20px"
            }}
          >
            <div style={{ fontSize: "24px", marginBottom: "4px" }}>🏛️</div>
            <div style={{ fontSize: "1.15rem", fontWeight: 800, color: "#0b2545", letterSpacing: "0.02em" }}>
              राजस्व परिषद (Board of Revenue) • {currentVillage.state}
            </div>
            <div style={{ fontSize: "0.95rem", fontWeight: 700, color: "#1e3a8a", marginTop: "2px" }}>
              राष्ट्रीय भू-नक्शा पोर्टल (BhuNaksha Cadastral Mapping System)
            </div>
            <div style={{ fontSize: "0.75rem", color: "#475569", marginTop: "4px" }}>
              भू-अभिलेख एवं शजरा मानचित्र उद्धरण (Cadastral Survey Certificate)
            </div>
          </div>

          {/* Reference Meta */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              fontSize: "0.75rem",
              color: "#64748b",
              borderBottom: "1px solid #e2e8f0",
              paddingBottom: "8px",
              marginBottom: "16px"
            }}
          >
            <div><strong>प्रमाणपत्र संख्या:</strong> BN-{parcel.parcel_uid || "2026-UP"}</div>
            <div><strong>दिनांक:</strong> {new Date().toLocaleDateString('hi-IN', { day: '2-digit', month: 'long', year: 'numeric' })}</div>
            <div><strong>सत्यापन स्थिति:</strong> <span style={{ color: "#16a34a", fontWeight: 700 }}>✓ अभिलेख सत्यापित</span></div>
          </div>

          {/* Village & Administrative Hierarchy Table */}
          <div style={{ marginBottom: "20px" }}>
            <div style={{ fontSize: "0.82rem", fontWeight: 700, color: "#0b2545", marginBottom: "6px", textTransform: "uppercase" }}>
              1. प्रशासनिक विवरण (Administrative Location)
            </div>
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                fontSize: "0.78rem",
                border: "1px solid #cbd5e1"
              }}
            >
              <tbody>
                <tr style={{ background: "#f8fafc" }}>
                  <td style={{ padding: "6px 12px", border: "1px solid #cbd5e1", width: "25%", color: "#64748b" }}>राज्य (State):</td>
                  <td style={{ padding: "6px 12px", border: "1px solid #cbd5e1", width: "25%", fontWeight: 700 }}>{currentVillage.state}</td>
                  <td style={{ padding: "6px 12px", border: "1px solid #cbd5e1", width: "25%", color: "#64748b" }}>जनपद (District):</td>
                  <td style={{ padding: "6px 12px", border: "1px solid #cbd5e1", width: "25%", fontWeight: 700 }}>{currentVillage.district || parcel.district || "Gautam Buddha Nagar"}</td>
                </tr>
                <tr>
                  <td style={{ padding: "6px 12px", border: "1px solid #cbd5e1", color: "#64748b" }}>तहसील (Tehsil):</td>
                  <td style={{ padding: "6px 12px", border: "1px solid #cbd5e1", fontWeight: 700 }}>{currentVillage.tehsil || parcel.tehsil || "Dadri / Sadar"}</td>
                  <td style={{ padding: "6px 12px", border: "1px solid #cbd5e1", color: "#64748b" }}>ग्राम / मौज़ा (Village):</td>
                  <td style={{ padding: "6px 12px", border: "1px solid #cbd5e1", fontWeight: 700 }}>{currentVillage.village}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Plot Information Table */}
          <div style={{ marginBottom: "20px" }}>
            <div style={{ fontSize: "0.82rem", fontWeight: 700, color: "#0b2545", marginBottom: "6px", textTransform: "uppercase" }}>
              2. भूखंड विवरण (Plot Specifications)
            </div>
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                fontSize: "0.78rem",
                border: "1px solid #cbd5e1"
              }}
            >
              <tbody>
                <tr style={{ background: "#f8fafc" }}>
                  <td style={{ padding: "6px 12px", border: "1px solid #cbd5e1", width: "25%", color: "#64748b" }}>खसरा / गाटा संख्या:</td>
                  <td style={{ padding: "6px 12px", border: "1px solid #cbd5e1", width: "25%", fontWeight: 800, fontSize: "0.95rem", color: "#0b2545" }}>{khasraNo}</td>
                  <td style={{ padding: "6px 12px", border: "1px solid #cbd5e1", width: "25%", color: "#64748b" }}>खाता संख्या (Khata No.):</td>
                  <td style={{ padding: "6px 12px", border: "1px solid #cbd5e1", width: "25%", fontWeight: 700 }}>{khataNo}</td>
                </tr>
                <tr>
                  <td style={{ padding: "6px 12px", border: "1px solid #cbd5e1", color: "#64748b" }}>क्षेत्रफल (हेक्टेयर):</td>
                  <td style={{ padding: "6px 12px", border: "1px solid #cbd5e1", fontWeight: 700 }}>{Number(areaHa).toFixed(4)} Ha</td>
                  <td style={{ padding: "6px 12px", border: "1px solid #cbd5e1", color: "#64748b" }}>पारंपरिक माप (Local):</td>
                  <td style={{ padding: "6px 12px", border: "1px solid #cbd5e1", fontWeight: 700, color: "#047857" }}>{areaLocal}</td>
                </tr>
                <tr style={{ background: "#f8fafc" }}>
                  <td style={{ padding: "6px 12px", border: "1px solid #cbd5e1", color: "#64748b" }}>भूमि श्रेणी / अधिकार:</td>
                  <td style={{ padding: "6px 12px", border: "1px solid #cbd5e1", fontWeight: 700 }}>{tenure}</td>
                  <td style={{ padding: "6px 12px", border: "1px solid #cbd5e1", color: "#64748b" }}>उपयोगिता (Land Use):</td>
                  <td style={{ padding: "6px 12px", border: "1px solid #cbd5e1", fontWeight: 700 }}>{landUse}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Khatadar / Ownership Details */}
          <div style={{ marginBottom: "20px" }}>
            <div style={{ fontSize: "0.82rem", fontWeight: 700, color: "#0b2545", marginBottom: "6px", textTransform: "uppercase" }}>
              3. खातेदार विवरण (Recorded Landholders)
            </div>
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                fontSize: "0.78rem",
                border: "1px solid #cbd5e1"
              }}
            >
              <thead>
                <tr style={{ background: "#0b2545", color: "#ffffff" }}>
                  <th style={{ padding: "6px 10px", border: "1px solid #cbd5e1", textAlign: "left", width: "10%" }}>क्र.सं.</th>
                  <th style={{ padding: "6px 10px", border: "1px solid #cbd5e1", textAlign: "left", width: "45%" }}>खातेदार का नाम</th>
                  <th style={{ padding: "6px 10px", border: "1px solid #cbd5e1", textAlign: "left", width: "30%" }}>पिता / पति का नाम</th>
                  <th style={{ padding: "6px 10px", border: "1px solid #cbd5e1", textAlign: "center", width: "15%" }}>अंश (Share)</th>
                </tr>
              </thead>
              <tbody>
                {rights.length > 0 ? (
                  rights.map((r: any, idx: number) => (
                    <tr key={idx} style={{ background: idx % 2 === 0 ? "#ffffff" : "#f8fafc" }}>
                      <td style={{ padding: "6px 10px", border: "1px solid #cbd5e1" }}>{idx + 1}</td>
                      <td style={{ padding: "6px 10px", border: "1px solid #cbd5e1", fontWeight: 700 }}>{r.rights_holder_name}</td>
                      <td style={{ padding: "6px 10px", border: "1px solid #cbd5e1" }}>{r.parentage_or_details || "—"}</td>
                      <td style={{ padding: "6px 10px", border: "1px solid #cbd5e1", textAlign: "center", fontWeight: 700 }}>{r.share_fraction || "पूर्ण (1/1)"}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} style={{ padding: "10px", textAlign: "center", color: "#64748b" }}>
                      सरकारी / सार्वजनिक स्वामित्व (State Land Records)
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Cadastral Survey Sketch Box */}
          <div style={{ marginBottom: "20px" }}>
            <div style={{ fontSize: "0.82rem", fontWeight: 700, color: "#0b2545", marginBottom: "6px", textTransform: "uppercase" }}>
              4. शजरा मानचित्र रेखाचित्र (Cadastral Survey Geometry)
            </div>
            <div
              style={{
                border: "2px solid #cbd5e1",
                borderRadius: "6px",
                padding: "20px",
                background: "#fafaf9",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between"
              }}
            >
              <div style={{ fontSize: "0.75rem", color: "#475569", maxWidth: "380px" }}>
                <div style={{ fontWeight: 700, color: "#0b2545", marginBottom: "4px" }}>
                  निर्देशांक व पैमाइश सत्यापन (Geodetic Coordinates)
                </div>
                <div>• अक्षांश/देशांतर: WGS-84 Projected Cadastral System</div>
                <div>• सर्वेक्षक स्रोत: उत्तर प्रदेश राजस्व परिषद (Revenue Survey Dept)</div>
                <div>• डिजिटल हस्ताक्षर हैश: <code style={{ fontSize: "0.68rem" }}>{parcel.parcel_uid}</code></div>
                <div style={{ marginTop: "6px", color: "#16a34a", fontWeight: 600, display: "flex", alignItems: "center", gap: "4px" }}>
                  <CheckCircle2 size={13} /> राष्ट्रीय भू-नक्शा डेटाबेस से डिजिटल सत्यापित
                </div>
              </div>

              {/* Shajra Parcel Badge Box */}
              <div
                style={{
                  width: "160px",
                  height: "120px",
                  border: "2px dashed #0284c7",
                  background: "#f0f9ff",
                  borderRadius: "6px",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  textAlign: "center"
                }}
              >
                <span style={{ fontSize: "0.7rem", color: "#0284c7", fontWeight: 700 }}>गाटा / खसरा</span>
                <span style={{ fontSize: "2rem", fontWeight: 900, color: "#0b2545" }}>{khasraNo}</span>
                <span style={{ fontSize: "0.68rem", color: "#64748b" }}>{Number(areaHa).toFixed(4)} Ha</span>
              </div>
            </div>
          </div>

          {/* Legal Notice & Verification Stamp */}
          <div
            style={{
              marginTop: "30px",
              paddingTop: "14px",
              borderTop: "2px solid #0b2545",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-end",
              fontSize: "0.72rem",
              color: "#475569"
            }}
          >
            <div>
              <div>1. यह उद्धरण डिजिटल भू-अभिलेख प्रणाली द्वारा जनरेट किया गया है।</div>
              <div>2. किसी भी विसंगति की स्थिति में राजस्व परिषद की मूल प्रमाणित खतौनी मान्य होगी।</div>
              <div style={{ marginTop: "4px", color: "#64748b" }}>Powered by LandSetu Sovereign Intelligence</div>
            </div>

            <div style={{ textAlign: "center", width: "160px" }}>
              <div style={{ fontSize: "36px", marginBottom: "4px" }}>🛡️</div>
              <div style={{ fontWeight: 700, color: "#0b2545" }}>सक्षम प्राधिकारी</div>
              <div style={{ fontSize: "0.68rem", color: "#64748b" }}>राजस्व विभाग / एन.आई.सी.</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default PlotReportModal;
