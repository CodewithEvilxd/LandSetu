import React, { useEffect, useState, useCallback } from "react";
import { api } from "../api/client.js";
import { CadastralMap } from "../components/khasra-map/CadastralMap.js";
import { BhuNakshaSidebar } from "../components/khasra-map/BhuNakshaSidebar.js";
import { ParcelEvidencePanel } from "../components/khasra-map/ParcelEvidencePanel.js";
import { ResearchAnalyticsModal } from "../components/khasra-map/ResearchAnalyticsModal.js";
import { VillageKhatauniModal } from "../components/khasra-map/VillageKhatauniModal.js";
import { PlotReportModal } from "../components/khasra-map/PlotReportModal.js";
import { 
  ShieldCheck, 
  Layers, 
  BarChart3, 
  Download, 
  CheckCircle2, 
  AlertCircle,
  ExternalLink,
  FileText,
  Printer,
  Compass
} from "lucide-react";

export const KhasraMapPage: React.FC = () => {
  // Coverage & Geography State (Default to UP Greater Noida Kasna)
  const [coverage, setCoverage] = useState<any>(null);
  const [currentVillage, setCurrentVillage] = useState<{ state: string; village: string; district?: string; tehsil?: string }>({
    state: "Uttar Pradesh",
    district: "Gautam Buddha Nagar",
    tehsil: "Dadri",
    village: "Kasna"
  });

  // Cadastral GeoJSON State
  const [cadastreData, setCadastreData] = useState<any>(null);
  const [loadingCadastre, setLoadingCadastre] = useState(false);

  // Selected Parcel State
  const [selectedParcelUid, setSelectedParcelUid] = useState<string | null>(null);
  const [parcelDetails, setParcelDetails] = useState<any>(null);
  const [loadingParcel, setLoadingParcel] = useState(false);

  // Evidence Bundle State
  const [evidenceBundle, setEvidenceBundle] = useState<any>(null);
  const [showEvidence, setShowEvidence] = useState(false);
  const [loadingEvidence, setLoadingEvidence] = useState(false);

  // Ambiguity & Search State
  const [searchError, setSearchError] = useState<string | null>(null);

  // Modals
  const [showResearchModal, setShowResearchModal] = useState(false);
  const [showKhatauniModal, setShowKhatauniModal] = useState(false);
  const [showPlotReportModal, setShowPlotReportModal] = useState(false);

  // 1. Load Coverage on Mount
  useEffect(() => {
    api.getKhasraCoverage()
      .then(res => {
        setCoverage(res);
        // Check if URL specifies parcel or village
        const hash = window.location.hash;
        if (hash.includes("?")) {
          const params = new URLSearchParams(hash.split("?")[1]);
          const pState = params.get("state");
          const pVillage = params.get("village");
          if (pState && pVillage) {
            setCurrentVillage({ state: pState, village: pVillage });
          }
        }
      })
      .catch(err => console.error("Error loading coverage:", err));
  }, []);

  // 2. Load Cadastre when Village changes
  const loadCadastre = useCallback(async (state: string, village: string) => {
    setLoadingCadastre(true);
    setSearchError(null);
    try {
      const res = await api.getVillageCadastre(state, village);
      setCadastreData(res);
      // Auto select first parcel if none selected
      if (res.geojson?.features?.length > 0) {
        const firstUid = res.geojson.features[0].properties?.parcel_uid;
        if (firstUid) {
          loadParcelDetails(firstUid);
        }
      }
    } catch (err: any) {
      console.error("Error loading cadastre:", err);
      setSearchError(`ग्राम ${village} का शजरा मानचित्र उपलब्ध नहीं है।`);
    } finally {
      setLoadingCadastre(false);
    }
  }, []);

  useEffect(() => {
    loadCadastre(currentVillage.state, currentVillage.village);
  }, [currentVillage.state, currentVillage.village]);

  // 3. Load Parcel Details
  const loadParcelDetails = async (parcelUid: string) => {
    setSelectedParcelUid(parcelUid);
    setLoadingParcel(true);
    try {
      const res = await api.getParcelDetails(parcelUid);
      setParcelDetails(res);
    } catch (err) {
      console.error("Error fetching parcel details:", err);
    } finally {
      setLoadingParcel(false);
    }
  };

  // 4. Open Evidence Bundle
  const handleOpenEvidence = async () => {
    if (!selectedParcelUid) return;
    setShowEvidence(true);
    setLoadingEvidence(true);
    try {
      const bundle = await api.getParcelEvidence(selectedParcelUid);
      setEvidenceBundle(bundle);
    } catch (err) {
      console.error("Error fetching evidence bundle:", err);
    } finally {
      setLoadingEvidence(false);
    }
  };

  // 5. Handle URL Hash on Mount (e.g. #khasra?parcel=UP|... or #khasra?khasra=401)
  useEffect(() => {
    const handleHash = () => {
      const hash = window.location.hash;
      if (hash.startsWith("#khasra") && hash.includes("?")) {
        const queryStr = hash.split("?")[1];
        const params = new URLSearchParams(queryStr);
        const parcelParam = params.get("parcel");
        const stateParam = params.get("state");
        const villageParam = params.get("village");

        if (stateParam && villageParam) {
          setCurrentVillage({ state: stateParam, village: villageParam });
        }

        if (parcelParam) {
          loadParcelDetails(parcelParam);
        }
      }
    };

    handleHash();
  }, []);

  const handleAskAssistant = (queryText: string) => {
    window.location.hash = `ask?q=${encodeURIComponent(queryText)}`;
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "calc(100vh - 56px)", width: "100%", overflow: "hidden" }}>
      {/* Top Authentic BhuNaksha Command Bar */}
      <div
        style={{
          padding: "10px 20px",
          background: "#ffffff",
          borderBottom: "1px solid #cbd5e1",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          zIndex: 100,
          flexShrink: 0
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div
            style={{
              width: "36px",
              height: "36px",
              borderRadius: "6px",
              background: "#0b2545",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "18px",
              boxShadow: "0 2px 4px rgba(0,0,0,0.15)"
            }}
          >
            🏛️
          </div>

          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span
                style={{
                  fontFamily: "var(--font-display)",
                  fontWeight: 900,
                  fontSize: "1.08rem",
                  color: "#0b2545"
                }}
              >
                भू-नक्शा (BhuNaksha)
              </span>
              <span style={{ fontSize: "0.85rem", color: "#64748b", fontWeight: 600 }}>
                — राष्ट्रीय शजरा मानचित्र प्रणाली
              </span>
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "4px",
                  background: "#ecfdf5",
                  border: "1px solid #a7f3d0",
                  color: "#047857",
                  padding: "1px 8px",
                  borderRadius: "12px",
                  fontSize: "0.68rem",
                  fontWeight: 700
                }}
              >
                <CheckCircle2 size={11} />
                प्रमाणित राजस्व अभिलेख
              </span>
            </div>

            <div style={{ fontSize: "0.72rem", color: "#475569" }}>
              डिजिटल शजरा भूखंड, उद्धरण खतौनी (RoR), एवं भू-अधिकार वंशावली
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          {/* Breadcrumb Tag */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              background: "#f1f5f9",
              border: "1px solid #cbd5e1",
              padding: "5px 12px",
              borderRadius: "4px",
              fontSize: "0.75rem",
              color: "#334155"
            }}
          >
            <span>सक्रिय मौज़ा:</span>
            <strong style={{ color: "#0b2545" }}>{currentVillage.village}</strong>
            <span style={{ color: "#64748b" }}>({currentVillage.district || currentVillage.state})</span>
          </div>

          {/* 1. Official RoR / Khatauni Modal Trigger */}
          <button
            onClick={() => setShowKhatauniModal(true)}
            style={{
              padding: "6px 14px",
              fontSize: "0.76rem",
              display: "flex",
              alignItems: "center",
              gap: "6px",
              background: "#0b2545",
              color: "#ffffff",
              border: "1px solid #134074",
              borderRadius: "4px",
              fontWeight: 700,
              cursor: "pointer",
              boxShadow: "0 1px 3px rgba(0,0,0,0.15)"
            }}
            title="गाँव की पूर्ण कंप्यूटरीकृत खतौनी नकल देखें"
          >
            <FileText size={14} color="#f59e0b" />
            <span>📜 नकल खतौनी (RoR)</span>
          </button>

          {/* 2. Plot Report / Naksha Pass Trigger */}
          <button
            onClick={() => {
              if (selectedParcelUid) {
                setShowPlotReportModal(true);
              } else {
                alert("कृपया पहले किसी खसरा नंबर का चयन करें।");
              }
            }}
            style={{
              padding: "6px 12px",
              fontSize: "0.76rem",
              display: "flex",
              alignItems: "center",
              gap: "6px",
              background: "#ffffff",
              color: "#0f172a",
              border: "1px solid #cbd5e1",
              borderRadius: "4px",
              fontWeight: 700,
              cursor: "pointer"
            }}
            title="चयनित खसरे की प्रमाणित प्लॉट रिपोर्ट प्रिंट करें"
          >
            <Printer size={14} color="#0b2545" />
            <span>🖨️ नक्शा पास / रिपोर्ट</span>
          </button>

          {/* 3. Research Analytics */}
          <button
            onClick={() => setShowResearchModal(true)}
            style={{
              padding: "6px 12px",
              fontSize: "0.76rem",
              display: "flex",
              alignItems: "center",
              gap: "6px",
              background: "#ffffff",
              color: "#475569",
              border: "1px solid #cbd5e1",
              borderRadius: "4px",
              fontWeight: 600,
              cursor: "pointer"
            }}
          >
            <BarChart3 size={14} />
            <span>सांख्यिकी (Analytics)</span>
          </button>
        </div>
      </div>

      {/* Main Authentic BhuNaksha Layout: [ Left Sidebar (360px) ] [ Map Viewport (Flex 1) ] */}
      <div style={{ flex: 1, display: "flex", position: "relative", overflow: "hidden" }}>
        {/* Dedicated Authentic Government BhuNaksha Sidebar */}
        <BhuNakshaSidebar
          coverageSummary={coverage}
          currentVillage={currentVillage}
          onSelectVillage={(v) => {
            setCurrentVillage(v);
            setSelectedParcelUid(null);
            setParcelDetails(null);
          }}
          selectedParcelUid={selectedParcelUid}
          parcelDetails={parcelDetails}
          loadingParcel={loadingParcel}
          cadastreData={cadastreData}
          onSelectParcel={(uid) => loadParcelDetails(uid)}
          onOpenKhatauni={() => setShowKhatauniModal(true)}
          onOpenEvidence={handleOpenEvidence}
          onOpenPlotReport={() => setShowPlotReportModal(true)}
          onAskAssistant={handleAskAssistant}
        />

        {/* Map Viewport Area (100% of remaining width) */}
        <div style={{ flex: 1, height: "100%", position: "relative" }}>
          {/* Error / Not-Found Banner */}
          {searchError && (
            <div
              style={{
                position: "absolute",
                top: 16,
                left: 16,
                zIndex: 1000,
                background: "#ffffff",
                border: "1px solid #fca5a5",
                borderRadius: "6px",
                padding: "8px 12px",
                boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                fontSize: "0.75rem",
                color: "#b91c1c",
                maxWidth: "380px"
              }}
            >
              <AlertCircle size={15} style={{ flexShrink: 0 }} />
              <span>{searchError}</span>
            </div>
          )}

          {/* Leaflet Cadastral Shajra Map Canvas */}
          <CadastralMap
            geoJsonData={cadastreData?.geojson}
            selectedParcelUid={selectedParcelUid}
            onSelectParcel={(uid) => loadParcelDetails(uid)}
            villageName={currentVillage.village}
            stateName={currentVillage.state}
            surveyYear={cadastreData?.survey_year}
            sourceId={cadastreData?.source_id}
            checksum={cadastreData?.checksum_sha256}
          />
        </div>
      </div>

      {/* 1. Cryptographic Provenance Evidence Modal */}
      {showEvidence && (
        <ParcelEvidencePanel
          bundle={evidenceBundle}
          loading={loadingEvidence}
          onClose={() => setShowEvidence(false)}
        />
      )}

      {/* 2. Research & Export Analytics Modal */}
      {showResearchModal && (
        <ResearchAnalyticsModal
          state={currentVillage.state}
          village={currentVillage.village}
          onClose={() => setShowResearchModal(false)}
        />
      )}

      {/* 3. Village Khatauni Register Modal (6-Column UP Bhulekh RoR) */}
      {showKhatauniModal && (
        <VillageKhatauniModal
          state={currentVillage.state}
          village={currentVillage.village}
          onClose={() => setShowKhatauniModal(false)}
          onSelectGata={(uid) => {
            setShowKhatauniModal(false);
            loadParcelDetails(uid);
          }}
        />
      )}

      {/* 4. Authentic BhuNaksha Plot Report Print Modal */}
      {showPlotReportModal && parcelDetails && (
        <PlotReportModal
          parcelDetails={parcelDetails}
          currentVillage={currentVillage}
          onClose={() => setShowPlotReportModal(false)}
        />
      )}
    </div>
  );
};
export default KhasraMapPage;
