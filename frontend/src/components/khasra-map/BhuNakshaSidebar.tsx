import React, { useState, useMemo, useEffect } from "react";
import { 
  MapPin, 
  Search, 
  Layers, 
  FileText, 
  ShieldCheck, 
  HelpCircle, 
  ChevronLeft, 
  ChevronRight, 
  Info, 
  CheckCircle2, 
  Building2,
  Compass,
  Filter,
  Printer,
  ChevronDown
} from "lucide-react";

interface BhuNakshaSidebarProps {
  coverageSummary: any;
  currentVillage: { state: string; village: string; district?: string; tehsil?: string };
  onSelectVillage: (village: { state: string; village: string; district?: string; tehsil?: string }) => void;
  selectedParcelUid: string | null;
  parcelDetails: any;
  loadingParcel: boolean;
  cadastreData: any;
  onSelectParcel: (parcelUid: string) => void;
  onOpenKhatauni: () => void;
  onOpenEvidence: () => void;
  onOpenPlotReport: () => void;
  onAskAssistant: (query: string) => void;
}

const OFFICIAL_VILLAGE_REGISTRY = [
  {
    state: "Uttar Pradesh",
    district: "Gautam Buddha Nagar",
    tehsil: "Sadar Noida",
    village: "Sorkha Jahidabad",
    hindiName: "सोरखा जाहिदाबाद (Noida Sec-115/FNG)",
    parcelCount: 25,
    pargana: "Noida Urban"
  },
  {
    state: "Uttar Pradesh",
    district: "Gautam Buddha Nagar",
    tehsil: "Dadri",
    village: "Kasna",
    hindiName: "कासना (Greater Noida Pari Chowk)",
    parcelCount: 25,
    pargana: "Dadri Rural"
  },
  {
    state: "Uttar Pradesh",
    district: "Gautam Buddha Nagar",
    tehsil: "Dadri",
    village: "Bisrakh Jalalpur",
    hindiName: "बिसरख जलालपुर (Noida Extension)",
    parcelCount: 25,
    pargana: "Dadri West"
  },
  {
    state: "Delhi",
    district: "North Delhi",
    tehsil: "Alipur",
    village: "Alipur",
    hindiName: "अलीपुर (North Delhi)",
    parcelCount: 25,
    pargana: "Alipur Sub-Division"
  },
  {
    state: "Haryana",
    district: "Gurugram",
    tehsil: "Wazirabad",
    village: "Wazirabad",
    hindiName: "वजीराबाद (Gurugram Sec-52)",
    parcelCount: 25,
    pargana: "Wazirabad Sub-Tehsil"
  },
  {
    state: "Bihar",
    district: "Patna",
    tehsil: "Patna Sadar",
    village: "Sabbalpur",
    hindiName: "सब्बलपुर (Patna Ganga Diara)",
    parcelCount: 25,
    pargana: "Phulwari / Patna"
  }
];

export const BhuNakshaSidebar: React.FC<BhuNakshaSidebarProps> = ({
  coverageSummary,
  currentVillage,
  onSelectVillage,
  selectedParcelUid,
  parcelDetails,
  loadingParcel,
  cadastreData,
  onSelectParcel,
  onOpenKhatauni,
  onOpenEvidence,
  onOpenPlotReport,
  onAskAssistant
}) => {
  const [collapsed, setCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState<"plot_info" | "khasra_list" | "layers">("plot_info");
  const [khasraSearch, setKhasraSearch] = useState("");
  const [showCascadingSelect, setShowCascadingSelect] = useState(false);

  // States list
  const availableStates = useMemo(() => {
    return Array.from(new Set(OFFICIAL_VILLAGE_REGISTRY.map(v => v.state)));
  }, []);

  // Selected State's districts
  const availableDistricts = useMemo(() => {
    return Array.from(new Set(
      OFFICIAL_VILLAGE_REGISTRY
        .filter(v => v.state.toLowerCase() === currentVillage.state.toLowerCase())
        .map(v => v.district)
    ));
  }, [currentVillage.state]);

  // Selected District's tehsils
  const availableTehsils = useMemo(() => {
    return Array.from(new Set(
      OFFICIAL_VILLAGE_REGISTRY
        .filter(v => 
          v.state.toLowerCase() === currentVillage.state.toLowerCase() &&
          (currentVillage.district ? v.district.toLowerCase() === currentVillage.district.toLowerCase() : true)
        )
        .map(v => v.tehsil)
    ));
  }, [currentVillage.state, currentVillage.district]);

  // Selected Tehsil's villages
  const availableVillages = useMemo(() => {
    return OFFICIAL_VILLAGE_REGISTRY.filter(v => 
      v.state.toLowerCase() === currentVillage.state.toLowerCase() &&
      (currentVillage.tehsil ? v.tehsil.toLowerCase() === currentVillage.tehsil.toLowerCase() : true)
    );
  }, [currentVillage.state, currentVillage.tehsil]);

  // Extract all Khasras in active cadastre
  const allFeatures = useMemo(() => {
    return cadastreData?.geojson?.features || [];
  }, [cadastreData]);

  // Filtered Khasra numbers for quick grid
  const filteredFeatures = useMemo(() => {
    if (!khasraSearch.trim()) return allFeatures;
    const q = khasraSearch.trim().toLowerCase();
    return allFeatures.filter((f: any) => {
      const k = String(f.properties?.khasra || f.properties?.khesra_no || f.properties?.native_identifier || "");
      const owner = Array.isArray(f.properties?.recorded_owners) ? f.properties.recorded_owners.join(" ") : String(f.properties?.recorded_owners || "");
      return k.toLowerCase().includes(q) || owner.toLowerCase().includes(q);
    });
  }, [allFeatures, khasraSearch]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!khasraSearch.trim()) return;
    const q = khasraSearch.trim().toLowerCase();
    const match = allFeatures.find((f: any) => {
      const k = String(f.properties?.khasra || f.properties?.khesra_no || f.properties?.native_identifier || "").toLowerCase();
      return k === q || k.includes(q);
    });
    if (match) {
      const pUid = match.properties?.parcel_uid || match.properties?.khasra;
      onSelectParcel(pUid);
      setActiveTab("plot_info");
    }
  };

  const parcel = parcelDetails?.parcel;
  const rights = parcelDetails?.recorded_rights || [];
  const mutations = parcelDetails?.mutations || [];

  const khasraNo = parcel?.native_identifier || parcel?.khasra || "—";
  const areaHa = parcel?.area_hectares ?? parcel?.area ?? 0;
  const areaLocal = parcel?.area_raw || parcel?.area_local_unit || "";
  const landUse = parcel?.land_use || "Agricultural";
  const khata = parcel?.account_identifier || parcel?.khata_number || "—";
  const tenure = parcel?.tenure_type || "1-क (संक्रमणीय भूमिधर)";

  const isUP = currentVillage.state.toLowerCase().includes("uttar") || currentVillage.state.toLowerCase().includes("up");

  return (
    <div
      style={{
        width: collapsed ? "48px" : "360px",
        height: "100%",
        background: "#ffffff",
        borderRight: "1px solid #cbd5e1",
        boxShadow: "2px 0 10px rgba(0, 0, 0, 0.06)",
        display: "flex",
        flexDirection: "column",
        transition: "width 0.22s cubic-bezier(0.4, 0, 0.2, 1)",
        zIndex: 900,
        position: "relative",
        flexShrink: 0
      }}
    >
      {/* Collapse/Expand Toggle Button */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        style={{
          position: "absolute",
          top: "14px",
          right: "-14px",
          width: "28px",
          height: "28px",
          borderRadius: "50%",
          background: "#0b2545",
          border: "2px solid #ffffff",
          color: "#ffffff",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          zIndex: 1000,
          boxShadow: "0 2px 6px rgba(0,0,0,0.2)"
        }}
        title={collapsed ? "BhuNaksha पैनल खोलें" : "BhuNaksha पैनल समेटें"}
      >
        {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
      </button>

      {collapsed ? (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", paddingTop: "20px", gap: "18px" }}>
          <div style={{ writingMode: "vertical-rl", transform: "rotate(180deg)", fontWeight: 800, fontSize: "0.85rem", color: "#0b2545", letterSpacing: "0.1em" }}>
            भू-नक्शा • BHUNAKSHA
          </div>
          <MapPin size={18} color="#0284c7" />
          <FileText size={18} color="#0b2545" />
        </div>
      ) : (
        <>
          {/* Section 1: Official BhuNaksha Location Panel */}
          <div
            style={{
              padding: "12px 14px",
              background: "linear-gradient(180deg, #f8fafc 0%, #ffffff 100%)",
              borderBottom: "1px solid #e2e8f0"
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "8px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <span style={{ fontSize: "14px" }}>🏛️</span>
                <span style={{ fontSize: "0.76rem", fontWeight: 800, color: "#0b2545", textTransform: "uppercase", letterSpacing: "0.03em" }}>
                  स्थान चयन (Location Drilldown)
                </span>
              </div>
              <button
                onClick={() => setShowCascadingSelect(!showCascadingSelect)}
                style={{
                  background: "transparent",
                  border: "none",
                  color: "#0284c7",
                  fontSize: "0.68rem",
                  fontWeight: 600,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "2px"
                }}
              >
                <span>{showCascadingSelect ? "सरल सूची" : "पदानुक्रम (4-Level)"}</span>
                <ChevronDown size={12} />
              </button>
            </div>

            {showCascadingSelect ? (
              /* 4-Row Authentic Government Cascading Selectors */
              <div style={{ display: "flex", flexDirection: "column", gap: "6px", fontSize: "0.72rem" }}>
                {/* 1. State */}
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <span style={{ width: "65px", color: "#64748b" }}>राज्य:</span>
                  <select
                    value={currentVillage.state}
                    onChange={(e) => {
                      const st = e.target.value;
                      const matched = OFFICIAL_VILLAGE_REGISTRY.find(v => v.state === st);
                      if (matched) onSelectVillage(matched);
                    }}
                    style={{
                      flex: 1,
                      padding: "4px 8px",
                      borderRadius: "4px",
                      border: "1px solid #cbd5e1",
                      fontSize: "0.75rem",
                      fontWeight: 600,
                      background: "#ffffff"
                    }}
                  >
                    {availableStates.map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>

                {/* 2. District */}
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <span style={{ width: "65px", color: "#64748b" }}>जनपद:</span>
                  <select
                    value={currentVillage.district || availableDistricts[0]}
                    onChange={(e) => {
                      const dist = e.target.value;
                      const matched = OFFICIAL_VILLAGE_REGISTRY.find(v => v.state === currentVillage.state && v.district === dist);
                      if (matched) onSelectVillage(matched);
                    }}
                    style={{
                      flex: 1,
                      padding: "4px 8px",
                      borderRadius: "4px",
                      border: "1px solid #cbd5e1",
                      fontSize: "0.75rem",
                      fontWeight: 600,
                      background: "#ffffff"
                    }}
                  >
                    {availableDistricts.map(d => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>

                {/* 3. Tehsil */}
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <span style={{ width: "65px", color: "#64748b" }}>तहसील:</span>
                  <select
                    value={currentVillage.tehsil || availableTehsils[0]}
                    onChange={(e) => {
                      const teh = e.target.value;
                      const matched = OFFICIAL_VILLAGE_REGISTRY.find(v => v.state === currentVillage.state && v.tehsil === teh);
                      if (matched) onSelectVillage(matched);
                    }}
                    style={{
                      flex: 1,
                      padding: "4px 8px",
                      borderRadius: "4px",
                      border: "1px solid #cbd5e1",
                      fontSize: "0.75rem",
                      fontWeight: 600,
                      background: "#ffffff"
                    }}
                  >
                    {availableTehsils.map(t => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>

                {/* 4. Village */}
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <span style={{ width: "65px", color: "#64748b" }}>ग्राम / मौज़ा:</span>
                  <select
                    value={currentVillage.village}
                    onChange={(e) => {
                      const vil = e.target.value;
                      const matched = OFFICIAL_VILLAGE_REGISTRY.find(v => v.state === currentVillage.state && v.village === vil);
                      if (matched) onSelectVillage(matched);
                    }}
                    style={{
                      flex: 1,
                      padding: "4px 8px",
                      borderRadius: "4px",
                      border: "1px solid #cbd5e1",
                      fontSize: "0.75rem",
                      fontWeight: 700,
                      background: "#f0f9ff",
                      color: "#0369a1"
                    }}
                  >
                    {availableVillages.map(v => (
                      <option key={v.village} value={v.village}>{v.hindiName}</option>
                    ))}
                  </select>
                </div>
              </div>
            ) : (
              /* Quick Village Group Dropdown */
              <div>
                <select
                  value={`${currentVillage.state}__${currentVillage.village}`}
                  onChange={(e) => {
                    const [st, vil] = e.target.value.split("__");
                    const matched = OFFICIAL_VILLAGE_REGISTRY.find(v => v.state === st && v.village === vil);
                    if (matched) onSelectVillage(matched);
                  }}
                  style={{
                    width: "100%",
                    padding: "8px 10px",
                    borderRadius: "6px",
                    border: "1px solid #cbd5e1",
                    background: "#ffffff",
                    fontSize: "0.8rem",
                    fontWeight: 700,
                    color: "#0f172a",
                    outline: "none",
                    cursor: "pointer",
                    boxShadow: "0 1px 2px rgba(0,0,0,0.05)"
                  }}
                >
                  <optgroup label="उत्तर प्रदेश (Noida & Greater Noida)">
                    <option value="Uttar Pradesh__Sorkha Jahidabad">सोरखा जाहिदाबाद (Noida Sec-115) • 25 गाटा</option>
                    <option value="Uttar Pradesh__Kasna">कासना (Greater Noida Pari Chowk) • 25 गाटा</option>
                    <option value="Uttar Pradesh__Bisrakh Jalalpur">बिसरख जलालपुर (Noida Extension) • 25 गाटा</option>
                  </optgroup>
                  <optgroup label="दिल्ली (Delhi Cadastre)">
                    <option value="Delhi__Alipur">अलीपुर (Alipur, North Delhi) • 25 खसरा</option>
                  </optgroup>
                  <optgroup label="हरियाणा (Haryana Jamabandi)">
                    <option value="Haryana__Wazirabad">वजीराबाद (Wazirabad, Gurugram) • 25 खसरा</option>
                  </optgroup>
                  <optgroup label="बिहार (Bihar DLRS Sarve)">
                    <option value="Bihar__Sabbalpur">सब्बलपुर (Sabbalpur, Patna) • 25 खेसरा</option>
                  </optgroup>
                </select>
              </div>
            )}

            {/* Breadcrumb strip */}
            <div style={{ marginTop: "6px", fontSize: "0.68rem", color: "#64748b", display: "flex", alignItems: "center", gap: "4px" }}>
              <MapPin size={11} color="#0284c7" />
              <span>{currentVillage.state} &gt; {currentVillage.district || "G.B. Nagar"} &gt; {currentVillage.village}</span>
            </div>
          </div>

          {/* Section 2: Tabs (प्लॉट विवरण | खसरा सूची | संकेतिका) */}
          <div
            style={{
              display: "flex",
              borderBottom: "1px solid #e2e8f0",
              background: "#f8fafc"
            }}
          >
            {[
              { id: "plot_info", label: "प्लॉट विवरण (Info)" },
              { id: "khasra_list", label: `खसरा सूची (${allFeatures.length})` },
              { id: "layers", label: "संकेतिका (Legend)" }
            ].map(t => (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id as any)}
                style={{
                  flex: 1,
                  padding: "9px 4px",
                  background: "none",
                  border: "none",
                  borderBottom: activeTab === t.id ? "2px solid #0b2545" : "2px solid transparent",
                  color: activeTab === t.id ? "#0b2545" : "#64748b",
                  fontWeight: activeTab === t.id ? 800 : 500,
                  fontSize: "0.72rem",
                  cursor: "pointer"
                }}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Tab 1: PLOT INFO (The Iconic BhuNaksha Sidebar) */}
          {activeTab === "plot_info" && (
            <div style={{ flex: 1, overflowY: "auto", padding: "14px", display: "flex", flexDirection: "column", gap: "12px" }}>
              {/* Plot Search Bar */}
              <form onSubmit={handleSearchSubmit} style={{ display: "flex", gap: "6px" }}>
                <div
                  style={{
                    flex: 1,
                    display: "flex",
                    alignItems: "center",
                    background: "#f1f5f9",
                    borderRadius: "6px",
                    padding: "6px 10px",
                    border: "1px solid #cbd5e1"
                  }}
                >
                  <Search size={14} color="#64748b" style={{ marginRight: "6px", flexShrink: 0 }} />
                  <input
                    type="text"
                    placeholder="खसरा / गाटा संख्या खोजें (e.g. 101, 401)..."
                    value={khasraSearch}
                    onChange={(e) => setKhasraSearch(e.target.value)}
                    style={{
                      border: "none",
                      background: "transparent",
                      fontSize: "0.78rem",
                      width: "100%",
                      outline: "none",
                      color: "#0f172a"
                    }}
                  />
                </div>
                <button
                  type="submit"
                  style={{
                    padding: "6px 12px",
                    background: "#0b2545",
                    color: "#ffffff",
                    border: "none",
                    borderRadius: "6px",
                    fontWeight: 700,
                    fontSize: "0.74rem",
                    cursor: "pointer"
                  }}
                >
                  खोजें
                </button>
              </form>

              {loadingParcel ? (
                <div style={{ padding: "40px 10px", textAlign: "center", color: "#64748b", fontSize: "0.78rem" }}>
                  प्लॉट रिकॉर्ड लोड हो रहा है...
                </div>
              ) : selectedParcelUid && parcel ? (
                <>
                  {/* Selected Plot Hero Card */}
                  <div
                    style={{
                      background: "linear-gradient(135deg, #0b2545 0%, #1e3a8a 100%)",
                      color: "#ffffff",
                      borderRadius: "8px",
                      padding: "12px 14px",
                      boxShadow: "0 2px 6px rgba(11, 37, 69, 0.25)"
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <span style={{ fontSize: "0.72rem", color: "#93c5fd", fontWeight: 600, textTransform: "uppercase" }}>
                        खसरा / गाटा संख्या (Khasra No.)
                      </span>
                      <span style={{ background: "rgba(255,255,255,0.2)", padding: "1px 6px", borderRadius: "4px", fontSize: "0.68rem" }}>
                        चयनित प्लॉट
                      </span>
                    </div>
                    <div style={{ fontSize: "1.75rem", fontWeight: 900, fontFamily: "var(--font-mono, monospace)", marginTop: "2px" }}>
                      {khasraNo}
                    </div>
                    <div style={{ fontSize: "0.72rem", color: "#cbd5e1", marginTop: "2px" }}>
                      {currentVillage.village} • {currentVillage.district || "G.B. Nagar"} • {currentVillage.state}
                    </div>
                  </div>

                  {/* 2-Column BhuNaksha Property Table */}
                  <div
                    style={{
                      border: "1px solid #cbd5e1",
                      borderRadius: "6px",
                      overflow: "hidden",
                      fontSize: "0.75rem"
                    }}
                  >
                    <div style={{ display: "flex", padding: "8px 10px", background: "#f8fafc", borderBottom: "1px solid #e2e8f0" }}>
                      <span style={{ width: "125px", color: "#64748b" }}>खाता संख्या:</span>
                      <strong style={{ color: "#0f172a", fontFamily: "var(--font-mono)" }}>{khata}</strong>
                    </div>

                    <div style={{ display: "flex", padding: "8px 10px", borderBottom: "1px solid #e2e8f0" }}>
                      <span style={{ width: "125px", color: "#64748b" }}>क्षेत्रफल (हेक्टेयर):</span>
                      <strong style={{ color: "#0f172a", fontFamily: "var(--font-mono)" }}>{Number(areaHa).toFixed(4)} Ha</strong>
                    </div>

                    <div style={{ display: "flex", padding: "8px 10px", background: "#f8fafc", borderBottom: "1px solid #e2e8f0" }}>
                      <span style={{ width: "125px", color: "#64748b" }}>स्थानीय माप:</span>
                      <strong style={{ color: "#047857" }}>{areaLocal || "—"}</strong>
                    </div>

                    <div style={{ display: "flex", padding: "8px 10px", borderBottom: "1px solid #e2e8f0" }}>
                      <span style={{ width: "125px", color: "#64748b" }}>भूमि श्रेणी / प्रकार:</span>
                      <span style={{ color: "#0f172a", fontWeight: 600 }}>{landUse}</span>
                    </div>

                    <div style={{ display: "flex", padding: "8px 10px", background: "#f8fafc", borderBottom: "1px solid #e2e8f0" }}>
                      <span style={{ width: "125px", color: "#64748b" }}>काश्तकारी श्रेणी:</span>
                      <span style={{ color: "#0369a1", fontWeight: 600 }}>{tenure}</span>
                    </div>

                    <div style={{ padding: "8px 10px" }}>
                      <span style={{ color: "#64748b", display: "block", marginBottom: "4px" }}>खातेदार / स्वामी:</span>
                      {rights.length > 0 ? (
                        <div style={{ display: "flex", flexDirection: "column", gap: "3px" }}>
                          {rights.map((r: any, idx: number) => (
                            <div key={idx} style={{ color: "#0f172a", fontWeight: 600 }}>
                              • {r.rights_holder_name} {r.parentage_or_details ? `(वा० ${r.parentage_or_details})` : ""} {r.share_fraction ? `[${r.share_fraction}]` : ""}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <span style={{ color: "#94a3b8" }}>अभिलेख दर्ज</span>
                      )}
                    </div>
                  </div>

                  {/* Mutations summary if any */}
                  {mutations.length > 0 && (
                    <div
                      style={{
                        background: "#f0f9ff",
                        border: "1px solid #bae6fd",
                        borderRadius: "6px",
                        padding: "8px 10px",
                        fontSize: "0.72rem"
                      }}
                    >
                      <div style={{ fontWeight: 700, color: "#0369a1", marginBottom: "3px" }}>
                        आदेश व नामांतरण (Sanctioned Mutation)
                      </div>
                      <div style={{ color: "#334155" }}>
                        {mutations[0].mutation_type} (सं०: {mutations[0].mutation_number})
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div style={{ display: "flex", flexDirection: "column", gap: "6px", marginTop: "4px" }}>
                    {/* 1. Nakal Khatauni */}
                    <button
                      onClick={onOpenKhatauni}
                      style={{
                        background: "#0b2545",
                        color: "#ffffff",
                        border: "none",
                        borderRadius: "6px",
                        padding: "9px 12px",
                        fontSize: "0.78rem",
                        fontWeight: 700,
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "6px",
                        boxShadow: "0 1px 3px rgba(0,0,0,0.15)"
                      }}
                    >
                      <FileText size={15} color="#f59e0b" />
                      <span>📜 नकल खतौनी देखें (Official RoR)</span>
                    </button>

                    {/* 2. Plot Report / Naksha Pass Print */}
                    <button
                      onClick={onOpenPlotReport}
                      style={{
                        background: "#f8fafc",
                        color: "#0f172a",
                        border: "1px solid #cbd5e1",
                        borderRadius: "6px",
                        padding: "8px 12px",
                        fontSize: "0.74rem",
                        fontWeight: 700,
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "6px"
                      }}
                    >
                      <Printer size={14} color="#0b2545" />
                      <span>🖨️ नक्शा पास / प्लॉट रिपोर्ट (Plot Report)</span>
                    </button>

                    {/* 3. Cryptographic Provenance */}
                    <button
                      onClick={onOpenEvidence}
                      style={{
                        background: "#ffffff",
                        color: "#334155",
                        border: "1px solid #cbd5e1",
                        borderRadius: "6px",
                        padding: "7px 12px",
                        fontSize: "0.74rem",
                        fontWeight: 600,
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "6px"
                      }}
                    >
                      <ShieldCheck size={14} color="#16a34a" />
                      <span>डिजिटल साक्ष्य एवं वंशावली (Evidence)</span>
                    </button>

                    {/* 4. Ask AI */}
                    <button
                      onClick={() => onAskAssistant(`Khasra ${khasraNo} in ${currentVillage.village} ownership, acquisition status, and mutation history verify karein.`)}
                      style={{
                        background: "#ffffff",
                        color: "#0284c7",
                        border: "1px solid #bae6fd",
                        borderRadius: "6px",
                        padding: "7px 12px",
                        fontSize: "0.74rem",
                        fontWeight: 600,
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "6px"
                      }}
                    >
                      <HelpCircle size={14} />
                      <span>Ask AI: प्लॉट की स्थिति जांचें</span>
                    </button>
                  </div>
                </>
              ) : (
                <div
                  style={{
                    padding: "30px 14px",
                    textAlign: "center",
                    color: "#64748b",
                    background: "#f8fafc",
                    borderRadius: "6px",
                    border: "1px dashed #cbd5e1"
                  }}
                >
                  <Info size={24} color="#94a3b8" style={{ marginBottom: "8px" }} />
                  <div style={{ fontWeight: 700, color: "#334155", fontSize: "0.85rem" }}>
                    प्लॉट का चयन करें
                  </div>
                  <div style={{ fontSize: "0.72rem", marginTop: "4px" }}>
                    नक्शे पर किसी भी खसरा नंबर पर क्लिक करें या "खसरा सूची" में से चुनें।
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Tab 2: KHASRA LIST (Quick Grid of All 25 Parcels) */}
          {activeTab === "khasra_list" && (
            <div style={{ flex: 1, overflowY: "auto", padding: "14px", display: "flex", flexDirection: "column", gap: "10px" }}>
              <div style={{ fontSize: "0.74rem", color: "#64748b" }}>
                गाँव <strong>{currentVillage.village}</strong> के सभी खसरा / गाटा नंबर ({filteredFeatures.length}):
              </div>

              {/* Quick Search */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  background: "#f1f5f9",
                  borderRadius: "6px",
                  padding: "5px 8px",
                  border: "1px solid #cbd5e1"
                }}
              >
                <Search size={13} color="#64748b" style={{ marginRight: "6px" }} />
                <input
                  type="text"
                  placeholder="संख्या या नाम से छांटें..."
                  value={khasraSearch}
                  onChange={(e) => setKhasraSearch(e.target.value)}
                  style={{
                    border: "none",
                    background: "transparent",
                    fontSize: "0.74rem",
                    width: "100%",
                    outline: "none"
                  }}
                />
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(4, 1fr)",
                  gap: "6px"
                }}
              >
                {filteredFeatures.map((f: any) => {
                  const kNo = f.properties?.khasra || f.properties?.khesra_no || f.properties?.native_identifier;
                  const pUid = f.properties?.parcel_uid || kNo;
                  const isSelected = pUid === selectedParcelUid || kNo === selectedParcelUid;

                  return (
                    <button
                      key={pUid}
                      onClick={() => {
                        onSelectParcel(pUid);
                        setActiveTab("plot_info");
                      }}
                      style={{
                        padding: "8px 4px",
                        borderRadius: "6px",
                        border: isSelected ? "2px solid #0284c7" : "1px solid #cbd5e1",
                        background: isSelected ? "#0b2545" : "#ffffff",
                        color: isSelected ? "#ffffff" : "#0f172a",
                        fontWeight: 800,
                        fontFamily: "var(--font-mono, monospace)",
                        fontSize: "0.82rem",
                        cursor: "pointer",
                        boxShadow: "0 1px 2px rgba(0,0,0,0.05)"
                      }}
                      title={`Khasra ${kNo} (${f.properties?.area_hectares || '—'} Ha)`}
                    >
                      {kNo}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Tab 3: LEGEND & SYMBOLOGY */}
          {activeTab === "layers" && (
            <div style={{ flex: 1, overflowY: "auto", padding: "14px", display: "flex", flexDirection: "column", gap: "12px", fontSize: "0.75rem" }}>
              <div style={{ fontWeight: 800, color: "#0f172a" }}>
                भू-नक्शा संकेतिका (Cadastral Symbology):
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <span style={{ width: "24px", height: "14px", border: "2px solid #2563eb", background: "rgba(59, 130, 246, 0.55)", borderRadius: "3px" }} />
                <span style={{ color: "#0f172a", fontWeight: 700 }}>चयनित खसरा (Active Selected)</span>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <span style={{ width: "24px", height: "14px", border: "1.5px solid #334155", background: "rgba(248, 250, 252, 0.65)", borderRadius: "3px" }} />
                <span style={{ color: "#334155" }}>कृषि भूमि / संक्रमणीय भूमिधर</span>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <span style={{ width: "24px", height: "14px", border: "1.5px solid #dc2626", background: "rgba(254, 202, 202, 0.55)", borderRadius: "3px" }} />
                <span style={{ color: "#b91c1c" }}>ग्राम सभा / सार्वजनिक उपयोग</span>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <span style={{ width: "24px", height: "14px", border: "1.5px solid #0284c7", background: "rgba(186, 230, 253, 0.75)", borderRadius: "3px" }} />
                <span style={{ color: "#0369a1" }}>जोहड़ / तालाब / जलमग्न भूमि</span>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <span style={{ width: "24px", height: "14px", border: "1.5px solid #d97706", background: "rgba(254, 243, 199, 0.65)", borderRadius: "3px" }} />
                <span style={{ color: "#b45309" }}>आबादी देह / लाल डोरा क्लस्टर</span>
              </div>

              {isUP && (
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <span style={{ width: "24px", height: "14px", border: "1.5px solid #0284c7", background: "rgba(240, 249, 255, 0.75)", borderRadius: "3px" }} />
                  <span style={{ color: "#0369a1", fontWeight: 700 }}>NOIDA / GNIDA अधिग्रहीत</span>
                </div>
              )}

              <div style={{ marginTop: "12px", borderTop: "1px solid #e2e8f0", paddingTop: "10px", color: "#64748b", fontSize: "0.7rem", lineHeight: 1.4 }}>
                * भू-नक्शा मानचित्र सीधे राज्य राजस्व परिषद के प्रमाणित सर्वेक्षण अभिलेखों पर आधारित है।
              </div>
            </div>
          )}

          {/* Footer Official Badge */}
          <div
            style={{
              padding: "8px 14px",
              background: "#f8fafc",
              borderTop: "1px solid #e2e8f0",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              fontSize: "0.68rem",
              color: "#64748b"
            }}
          >
            <span>BhuNaksha Core v2.4</span>
            <span style={{ color: "#16a34a", fontWeight: 700, display: "flex", alignItems: "center", gap: "3px" }}>
              <CheckCircle2 size={11} /> NIC Verified
            </span>
          </div>
        </>
      )}
    </div>
  );
};
export default BhuNakshaSidebar;
