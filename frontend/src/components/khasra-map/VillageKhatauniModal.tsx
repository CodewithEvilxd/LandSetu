import React, { useState, useEffect } from "react";
import { 
  X, 
  Search, 
  Printer, 
  Download, 
  ExternalLink, 
  ShieldCheck, 
  FileText, 
  Layers, 
  CheckCircle2, 
  Building2,
  Filter
} from "lucide-react";
import { api } from "../../api/client.js";

interface VillageKhatauniModalProps {
  state: string;
  village: string;
  onClose: () => void;
  onSelectGata?: (parcelUid: string) => void;
}

export const VillageKhatauniModal: React.FC<VillageKhatauniModalProps> = ({
  state,
  village,
  onClose,
  onSelectGata
}) => {
  const [loading, setLoading] = useState(true);
  const [khatauniData, setKhatauniData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");

  useEffect(() => {
    setLoading(true);
    setError(null);
    api.getVillageKhatauni(state, village)
      .then((res: any) => {
        setKhatauniData(res);
      })
      .catch((err: any) => {
        console.error("Error loading Khatauni:", err);
        setError(`उद्धरण खतौनी प्राप्त करने में त्रुटि: ${err.message || "Record not found"}`);
      })
      .finally(() => setLoading(false));
  }, [state, village]);

  const khatas = khatauniData?.khatas || [];

  const filteredKhatas = khatas.filter((k: any) => {
    const matchesSearch =
      k.khata_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      k.owners?.some((o: any) => o.rights_holder_name?.toLowerCase().includes(searchTerm.toLowerCase())) ||
      k.parcels?.some((p: any) => p.native_identifier?.toLowerCase().includes(searchTerm.toLowerCase())) ||
      k.tenure_category?.toLowerCase().includes(searchTerm.toLowerCase());

    if (!matchesSearch) return false;

    if (categoryFilter === "authority") {
      return k.tenure_category?.toLowerCase().includes("noida") || k.tenure_category?.toLowerCase().includes("gnida") || k.tenure_category?.toLowerCase().includes("authority") || k.tenure_category?.toLowerCase().includes("shreni 5");
    }
    if (categoryFilter === "bhumidhar") {
      return k.tenure_category?.toLowerCase().includes("bhumidhar") || k.tenure_category?.toLowerCase().includes("shreni 1");
    }
    if (categoryFilter === "gram_sabha") {
      return k.tenure_category?.toLowerCase().includes("gaon") || k.tenure_category?.toLowerCase().includes("gram") || k.tenure_category?.toLowerCase().includes("shreni 4");
    }

    return true;
  });

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadCsv = () => {
    let csv = "खाता संख्या,खातेदार का नाम,पिता/पति का नाम,अंश (Share),श्रेणी (Tenure),गाटा संख्या,क्षेत्रफल (हेक्टेयर),क्षेत्रफल (बीघा-बिस्वा),आदेश/नामांतरण\n";
    for (const k of filteredKhatas) {
      const ownerNames = k.owners?.map((o: any) => `"${o.rights_holder_name}"`).join("; ") || "";
      const fatherNames = k.owners?.map((o: any) => `"${o.parentage || ''}"`).join("; ") || "";
      const gatas = k.parcels?.map((p: any) => p.native_identifier).join("; ") || "";
      const localUnits = k.parcels?.map((p: any) => p.area_raw || '').join("; ") || "";
      const mutations = k.mutations?.map((m: any) => `[${m.mutation_number}: ${m.mutation_type}]`).join("; ") || "";
      csv += `"${k.khata_number}","${ownerNames}","${fatherNames}","1/1","${k.tenure_category}","${gatas}","${k.total_area_ha}","${localUnits}","${mutations}"\n`;
    }
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `khatauni_${state}_${village}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 2000,
        backgroundColor: "rgba(15, 23, 42, 0.75)",
        backdropFilter: "blur(4px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "16px"
      }}
    >
      <div
        style={{
          width: "1000px",
          maxWidth: "96vw",
          height: "90vh",
          background: "#ffffff",
          borderRadius: "8px",
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          border: "1px solid #cbd5e1"
        }}
      >
        {/* Government Khatauni Header Banner */}
        <div
          style={{
            background: "linear-gradient(135deg, #0b2545 0%, #134074 100%)",
            color: "#ffffff",
            padding: "16px 20px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderBottom: "3px solid #f59e0b"
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div
              style={{
                width: "40px",
                height: "40px",
                borderRadius: "50%",
                background: "rgba(255, 255, 255, 0.15)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                border: "1px solid rgba(255, 255, 255, 0.3)"
              }}
            >
              <ShieldCheck size={24} color="#f59e0b" />
            </div>
            <div>
              <div style={{ fontSize: "0.8rem", fontWeight: 600, letterSpacing: "0.05em", color: "#93c5fd", textTransform: "uppercase" }}>
                उत्तर प्रदेश राजस्व परिषद • UP BHULEKH RECORD OF RIGHTS
              </div>
              <h2 style={{ fontSize: "1.25rem", fontWeight: 700, margin: 0, letterSpacing: "-0.01em" }}>
                कम्प्यूटरीकृत खतौनी (अधिकार अभिलेख) — नकल उद्धरण
              </h2>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <button
              onClick={handlePrint}
              style={{
                background: "rgba(255, 255, 255, 0.15)",
                border: "1px solid rgba(255, 255, 255, 0.25)",
                borderRadius: "4px",
                color: "#ffffff",
                padding: "6px 12px",
                fontSize: "0.75rem",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "6px",
                fontWeight: 600
              }}
              title="Print Official RoR Sheet"
            >
              <Printer size={14} />
              <span>Print (प्रिंट)</span>
            </button>
            <button
              onClick={handleDownloadCsv}
              style={{
                background: "rgba(255, 255, 255, 0.15)",
                border: "1px solid rgba(255, 255, 255, 0.25)",
                borderRadius: "4px",
                color: "#ffffff",
                padding: "6px 12px",
                fontSize: "0.75rem",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "6px",
                fontWeight: 600
              }}
              title="Download CSV"
            >
              <Download size={14} />
              <span>Export CSV</span>
            </button>
            <button
              onClick={onClose}
              style={{
                background: "none",
                border: "none",
                color: "#cbd5e1",
                cursor: "pointer",
                padding: "6px",
                borderRadius: "4px"
              }}
              title="Close"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Official Revenue Metadata Strip */}
        <div
          style={{
            background: "#f8fafc",
            borderBottom: "1px solid #e2e8f0",
            padding: "10px 20px",
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
            gap: "12px",
            fontSize: "0.75rem"
          }}
        >
          <div>
            <span style={{ color: "#64748b", display: "block" }}>ग्राम (Village):</span>
            <strong style={{ color: "#0f172a", fontSize: "0.85rem" }}>{village}</strong>
          </div>
          <div>
            <span style={{ color: "#64748b", display: "block" }}>तहसील व परगना:</span>
            <strong style={{ color: "#0f172a" }}>{khatauniData?.tehsil || "दादरी / सदर नोएडा"}</strong>
          </div>
          <div>
            <span style={{ color: "#64748b", display: "block" }}>जनपद (District):</span>
            <strong style={{ color: "#0f172a" }}>{khatauniData?.district || "गौतम बुद्ध नगर"}</strong>
          </div>
          <div>
            <span style={{ color: "#64748b", display: "block" }}>फसली वर्ष (Fasli Year):</span>
            <strong style={{ color: "#047857" }}>{khatauniData?.fasli_year || "1430-1435 फसली"}</strong>
          </div>
          <div>
            <span style={{ color: "#64748b", display: "block" }}>कुल खाते (Total Khatas):</span>
            <strong style={{ color: "#0284c7" }}>{khatauniData?.total_khatas || khatas.length}</strong>
          </div>
          <div>
            <span style={{ color: "#64748b", display: "block" }}>कुल गाटा संख्या:</span>
            <strong style={{ color: "#0284c7" }}>{khatauniData?.total_parcels || 25} गाटा</strong>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div
          style={{
            padding: "10px 20px",
            borderBottom: "1px solid #e2e8f0",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "12px",
            background: "#ffffff"
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              background: "#f1f5f9",
              borderRadius: "6px",
              padding: "6px 12px",
              flex: 1,
              maxWidth: "450px"
            }}
          >
            <Search size={16} color="#64748b" />
            <input
              type="text"
              placeholder="खोजें: खाता सं०, गाटा सं०, खातेदार (NOIDA, GNIDA, Bhati)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                border: "none",
                background: "transparent",
                fontSize: "0.8rem",
                width: "100%",
                outline: "none",
                color: "#0f172a"
              }}
            />
            {searchTerm && (
              <X size={14} color="#64748b" style={{ cursor: "pointer" }} onClick={() => setSearchTerm("")} />
            )}
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <span style={{ fontSize: "0.72rem", color: "#64748b", fontWeight: 600, display: "flex", alignItems: "center", gap: "4px" }}>
              <Filter size={12} /> फ़िल्टर:
            </span>
            {[
              { id: "all", label: "सभी खाते (All)" },
              { id: "authority", label: "NOIDA / GNIDA अधिग्रहीत" },
              { id: "bhumidhar", label: "श्रेणी 1-क (संक्रमणीय)" },
              { id: "gram_sabha", label: "ग्राम सभा / सार्वजनिक" }
            ].map(f => (
              <button
                key={f.id}
                onClick={() => setCategoryFilter(f.id)}
                style={{
                  fontSize: "0.72rem",
                  padding: "4px 8px",
                  borderRadius: "4px",
                  border: categoryFilter === f.id ? "1px solid #0284c7" : "1px solid #e2e8f0",
                  background: categoryFilter === f.id ? "#e0f2fe" : "#ffffff",
                  color: categoryFilter === f.id ? "#0284c7" : "#475569",
                  fontWeight: categoryFilter === f.id ? 700 : 500,
                  cursor: "pointer"
                }}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Main Khatauni Table Content */}
        <div style={{ flex: 1, overflowY: "auto", padding: "16px 20px" }}>
          {loading ? (
            <div style={{ padding: "60px 20px", textAlign: "center", color: "#64748b" }}>
              <div style={{ fontSize: "1rem", fontWeight: 600 }}>उ० प्र० भूलेख आधिकारिक खतौनी लोड हो रही है...</div>
              <div style={{ fontSize: "0.78rem", marginTop: "4px" }}>Fetching computerized Record of Rights from LandSetu ledger...</div>
            </div>
          ) : error ? (
            <div style={{ padding: "40px", textAlign: "center", color: "#dc2626" }}>
              <div>{error}</div>
            </div>
          ) : (
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                fontSize: "0.76rem",
                textAlign: "left"
              }}
            >
              <thead>
                <tr style={{ background: "#f8fafc", borderBottom: "2px solid #cbd5e1" }}>
                  <th style={{ padding: "10px 12px", width: "90px", border: "1px solid #e2e8f0", color: "#1e293b", fontWeight: 700 }}>
                    कॉलम 1<br /><span style={{ fontSize: "0.7rem", color: "#64748b" }}>खाता संख्या</span>
                  </th>
                  <th style={{ padding: "10px 12px", width: "240px", border: "1px solid #e2e8f0", color: "#1e293b", fontWeight: 700 }}>
                    कॉलम 2<br /><span style={{ fontSize: "0.7rem", color: "#64748b" }}>खातेदार का नाम / पिता का नाम / निवास</span>
                  </th>
                  <th style={{ padding: "10px 12px", width: "190px", border: "1px solid #e2e8f0", color: "#1e293b", fontWeight: 700 }}>
                    कॉलम 3<br /><span style={{ fontSize: "0.7rem", color: "#64748b" }}>भौमिक अधिकार / श्रेणी</span>
                  </th>
                  <th style={{ padding: "10px 12px", width: "130px", border: "1px solid #e2e8f0", color: "#1e293b", fontWeight: 700 }}>
                    कॉलम 4<br /><span style={{ fontSize: "0.7rem", color: "#64748b" }}>खसरा / गाटा सं०</span>
                  </th>
                  <th style={{ padding: "10px 12px", width: "140px", border: "1px solid #e2e8f0", color: "#1e293b", fontWeight: 700 }}>
                    कॉलम 5<br /><span style={{ fontSize: "0.7rem", color: "#64748b" }}>क्षेत्रफल (हे० व बीघा)</span>
                  </th>
                  <th style={{ padding: "10px 12px", border: "1px solid #e2e8f0", color: "#1e293b", fontWeight: 700 }}>
                    कॉलम 6<br /><span style={{ fontSize: "0.7rem", color: "#64748b" }}>आदेश / नामांतरण / प्राधिकरण टिप्पणी</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredKhatas.map((k: any, idx: number) => {
                  const isAuthority = k.tenure_category?.toLowerCase().includes("noida") || k.tenure_category?.toLowerCase().includes("gnida");
                  const isWater = k.tenure_category?.toLowerCase().includes("water") || k.tenure_category?.toLowerCase().includes("talab") || k.tenure_category?.toLowerCase().includes("johad");
                  const isGaonSabha = k.tenure_category?.toLowerCase().includes("gaon") || k.tenure_category?.toLowerCase().includes("gram");

                  let rowBg = idx % 2 === 0 ? "#ffffff" : "#fbfcfe";
                  if (isAuthority) rowBg = "rgba(240, 249, 255, 0.6)";
                  if (isWater) rowBg = "rgba(239, 246, 255, 0.5)";

                  return (
                    <tr key={k.khata_number} style={{ background: rowBg, borderBottom: "1px solid #e2e8f0" }}>
                      {/* Column 1: Khata No */}
                      <td style={{ padding: "10px 12px", border: "1px solid #e2e8f0", verticalAlign: "top" }}>
                        <span
                          style={{
                            fontFamily: "var(--font-mono, monospace)",
                            fontWeight: 700,
                            color: "#0f172a",
                            background: "#e2e8f0",
                            padding: "2px 6px",
                            borderRadius: "4px",
                            display: "inline-block"
                          }}
                        >
                          {k.khata_number}
                        </span>
                      </td>

                      {/* Column 2: Owners / Khatadars */}
                      <td style={{ padding: "10px 12px", border: "1px solid #e2e8f0", verticalAlign: "top" }}>
                        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                          {k.owners?.map((o: any, oIdx: number) => (
                            <div key={oIdx} style={{ lineHeight: 1.35 }}>
                              <strong style={{ color: "#0f172a", display: "block" }}>{o.rights_holder_name}</strong>
                              <span style={{ color: "#475569", fontSize: "0.72rem" }}>
                                वा० {o.parentage || "ग्राम निवासी"} {o.share ? `(अंश: ${o.share})` : ""}
                              </span>
                            </div>
                          ))}
                        </div>
                      </td>

                      {/* Column 3: Tenure Category */}
                      <td style={{ padding: "10px 12px", border: "1px solid #e2e8f0", verticalAlign: "top" }}>
                        <div style={{ lineHeight: 1.35 }}>
                          {isAuthority ? (
                            <span style={{ color: "#0369a1", fontWeight: 700, display: "flex", alignItems: "center", gap: "4px" }}>
                              <Building2 size={13} />
                              श्रेणी 5 (प्राधिकरण अधिग्रहीत)
                            </span>
                          ) : isWater ? (
                            <span style={{ color: "#0284c7", fontWeight: 700 }}>
                              श्रेणी 4 (सार्वजनिक जलमग्न / जोहड़)
                            </span>
                          ) : isGaonSabha ? (
                            <span style={{ color: "#b91c1c", fontWeight: 700 }}>
                              श्रेणी 4 (ग्राम सभा / सार्वजनिक)
                            </span>
                          ) : (
                            <span style={{ color: "#15803d", fontWeight: 700 }}>
                              श्रेणी 1-क (संक्रमणीय भूमिधर)
                            </span>
                          )}
                          <div style={{ color: "#64748b", fontSize: "0.7rem", marginTop: "2px" }}>
                            {k.tenure_category}
                          </div>
                        </div>
                      </td>

                      {/* Column 4: Gatas */}
                      <td style={{ padding: "10px 12px", border: "1px solid #e2e8f0", verticalAlign: "top" }}>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: "4px" }}>
                          {k.parcels?.map((p: any) => (
                            <button
                              key={p.native_identifier}
                              onClick={() => {
                                if (onSelectGata && p.parcel_uid) {
                                  onSelectGata(p.parcel_uid);
                                  onClose();
                                }
                              }}
                              style={{
                                fontFamily: "var(--font-mono, monospace)",
                                fontWeight: 700,
                                fontSize: "0.74rem",
                                color: "#0b2545",
                                background: "#ffffff",
                                border: "1px solid #94a3b8",
                                borderRadius: "4px",
                                padding: "2px 6px",
                                cursor: "pointer",
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "2px"
                              }}
                              title={`Click to locate Gata ${p.native_identifier} on map`}
                            >
                              <span>{p.native_identifier}</span>
                              <ExternalLink size={10} color="#0284c7" />
                            </button>
                          ))}
                        </div>
                      </td>

                      {/* Column 5: Total Area */}
                      <td style={{ padding: "10px 12px", border: "1px solid #e2e8f0", verticalAlign: "top" }}>
                        <div style={{ fontFamily: "var(--font-mono, monospace)", fontWeight: 700, color: "#0f172a" }}>
                          {k.total_area_ha} Ha
                        </div>
                        <div style={{ color: "#64748b", fontSize: "0.7rem", marginTop: "2px" }}>
                          {k.parcels?.map((p: any) => p.area_raw).filter(Boolean).join(", ") || ""}
                        </div>
                      </td>

                      {/* Column 6: Orders / Mutations */}
                      <td style={{ padding: "10px 12px", border: "1px solid #e2e8f0", verticalAlign: "top" }}>
                        {k.mutations && k.mutations.length > 0 ? (
                          <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                            {k.mutations.map((m: any, mIdx: number) => (
                              <div
                                key={mIdx}
                                style={{
                                  background: "#f1f5f9",
                                  borderLeft: "2px solid #0284c7",
                                  padding: "4px 6px",
                                  borderRadius: "0 4px 4px 0",
                                  fontSize: "0.7rem",
                                  lineHeight: 1.3
                                }}
                              >
                                <span style={{ fontWeight: 600, color: "#0f172a" }}>आदेश: {m.mutation_type}</span>
                                <div style={{ color: "#475569" }}>
                                  सं०: {m.mutation_number} • दिनांक: {m.mutation_date} • {m.authority || "तहसीलदार न्यायालय"}
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <span style={{ color: "#94a3b8", fontStyle: "italic" }}>यथापूर्व दर्ज अभिलेख (Zero pending disputes)</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* Official Statutory Disclaimer Footer */}
        <div
          style={{
            background: "#f8fafc",
            borderTop: "1px solid #e2e8f0",
            padding: "8px 20px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            fontSize: "0.68rem",
            color: "#64748b"
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <CheckCircle2 size={13} color="#16a34a" />
            <span>
              यह उद्धरण उ० प्र० राजस्व परिषद एवं विकास प्राधिकरण (NOIDA/GNIDA) द्वारा संधारित डिजिटल डेटाबेस पर आधारित प्रमाणित प्रति है।
            </span>
          </div>
          <div style={{ fontFamily: "var(--font-mono, monospace)", color: "#94a3b8" }}>
            लैंडसेतु • LandSetu Unified Land Governance Framework
          </div>
        </div>
      </div>
    </div>
  );
};
export default VillageKhatauniModal;
