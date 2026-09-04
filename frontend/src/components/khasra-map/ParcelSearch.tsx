import React, { useState } from "react";
import { Search, MapPin, X, AlertCircle, Check, ChevronDown } from "lucide-react";

interface ParcelSearchProps {
  coverageSummary: any;
  currentVillage: { state: string; village: string };
  onSelectVillage: (village: { state: string; village: string }) => void;
  onSearch: (query: string, filterOptions?: any) => void;
  searching: boolean;
  ambiguousMatches?: any[];
  onSelectAmbiguousMatch?: (match: any) => void;
  onClearAmbiguity?: () => void;
}

export const ParcelSearch: React.FC<ParcelSearchProps> = ({
  coverageSummary,
  currentVillage,
  onSelectVillage,
  onSearch,
  searching,
  ambiguousMatches = [],
  onSelectAmbiguousMatch,
  onClearAmbiguity
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [showVillageDropdown, setShowVillageDropdown] = useState(false);

  // Dynamic coverage villages from backend
  const villages = coverageSummary?.coverage_areas || [
    { state: "Delhi", district: "North Delhi", tehsil: "Alipur", village: "Alipur", parcel_count: 25 },
    { state: "Haryana", district: "Gurugram", tehsil: "Wazirabad", village: "Wazirabad", parcel_count: 25 },
    { state: "Bihar", district: "Patna", tehsil: "Patna Sadar", village: "Sabbalpur", parcel_count: 25 },
    { state: "Uttar Pradesh", district: "Gautam Buddha Nagar", tehsil: "Sadar Noida", village: "Sorkha Jahidabad", parcel_count: 25 },
    { state: "Uttar Pradesh", district: "Gautam Buddha Nagar", tehsil: "Dadri", village: "Kasna", parcel_count: 25 },
    { state: "Uttar Pradesh", district: "Gautam Buddha Nagar", tehsil: "Dadri", village: "Bisrakh Jalalpur", parcel_count: 25 }
  ];

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      onSearch(searchTerm);
    }
  };

  return (
    <div
      style={{
        position: "absolute",
        top: 16,
        left: 16,
        zIndex: 1000,
        display: "flex",
        flexDirection: "column",
        gap: "6px",
        width: "380px",
        maxWidth: "calc(100vw - 32px)"
      }}
    >
      {/* Top Bar: Village Switcher + Search Bar */}
      <div
        style={{
          background: "#ffffff",
          borderRadius: "6px",
          border: "1px solid var(--border-hairline)",
          boxShadow: "var(--shadow-md)",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden"
        }}
      >
        {/* Village Selection Strip */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "6px 10px",
            background: "var(--bg-surface-alt)",
            borderBottom: "1px solid var(--border-hairline)",
            fontSize: "0.72rem"
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "5px", color: "var(--text-secondary)" }}>
            <MapPin size={12} color="var(--sovereign-navy)" />
            <span>Cadastral Survey:</span>
            <strong style={{ color: "var(--sovereign-navy)" }}>
              {currentVillage.village} ({currentVillage.state})
            </strong>
          </div>

          <div style={{ position: "relative" }}>
            <button
              onClick={() => setShowVillageDropdown(!showVillageDropdown)}
              style={{
                background: "none",
                border: "none",
                color: "var(--sovereign-navy)",
                fontWeight: 600,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "2px",
                fontSize: "0.72rem"
              }}
            >
              <span>Change Village</span>
              <ChevronDown size={12} />
            </button>

            {showVillageDropdown && (
              <div
                style={{
                  position: "absolute",
                  top: "100%",
                  right: 0,
                  marginTop: "4px",
                  background: "#ffffff",
                  border: "1px solid var(--border-hairline)",
                  borderRadius: "6px",
                  boxShadow: "var(--shadow-lg)",
                  minWidth: "220px",
                  zIndex: 1010,
                  overflow: "hidden"
                }}
              >
                <div
                  style={{
                    padding: "6px 10px",
                    background: "var(--bg-surface-alt)",
                    fontSize: "0.68rem",
                    fontWeight: 700,
                    color: "var(--text-muted)",
                    textTransform: "uppercase"
                  }}
                >
                  Ingested Village Cadastres
                </div>
                {villages.map((v: any, idx: number) => {
                  const isSelected =
                    v.village?.toLowerCase() === currentVillage.village.toLowerCase() &&
                    v.state?.toLowerCase() === currentVillage.state.toLowerCase();

                  return (
                    <button
                      key={idx}
                      onClick={() => {
                        onSelectVillage({ state: v.state, village: v.village });
                        setShowVillageDropdown(false);
                      }}
                      style={{
                        width: "100%",
                        padding: "8px 10px",
                        textAlign: "left",
                        background: isSelected ? "var(--sovereign-navy-bg)" : "none",
                        border: "none",
                        borderBottom: "1px solid var(--border-hairline)",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        fontSize: "0.74rem"
                      }}
                    >
                      <div>
                        <div style={{ fontWeight: isSelected ? 700 : 500, color: "var(--text-primary)" }}>
                          {v.village} ({v.state})
                        </div>
                        <div style={{ fontSize: "0.66rem", color: "var(--text-muted)" }}>
                          {v.district} • {v.parcel_count || 5} parcels
                        </div>
                      </div>
                      {isSelected && <Check size={12} color="var(--sovereign-navy)" />}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Search Input Box */}
        <div style={{ display: "flex", alignItems: "center", padding: "6px 10px" }}>
          <Search size={15} color="var(--sovereign-navy)" style={{ flexShrink: 0, marginRight: "8px" }} />
          <input
            type="text"
            placeholder="Search Khasra/Khesra (e.g. 142, 215, 312), Khata, or Raiyat..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={handleKeyDown}
            style={{
              flex: 1,
              border: "none",
              outline: "none",
              fontSize: "0.82rem",
              fontFamily: "var(--font-sans)",
              color: "var(--text-primary)",
              background: "transparent"
            }}
          />

          {searchTerm && (
            <button
              onClick={() => {
                setSearchTerm("");
                if (onClearAmbiguity) onClearAmbiguity();
              }}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: "2px",
                color: "var(--text-muted)",
                marginRight: "4px"
              }}
            >
              <X size={14} />
            </button>
          )}

          <button
            onClick={() => onSearch(searchTerm)}
            disabled={searching}
            className="btn btn-primary"
            style={{
              padding: "4px 10px",
              fontSize: "0.74rem",
              borderRadius: "4px"
            }}
          >
            <span>{searching ? "Searching..." : "Resolve"}</span>
          </button>
        </div>
      </div>

      {/* Ambiguity Resolution Drawer (Prevents silent arbitrary parcel selection) */}
      {ambiguousMatches.length > 0 && (
        <div
          style={{
            background: "#ffffff",
            borderRadius: "6px",
            border: "1px solid var(--statutory-ochre-border)",
            boxShadow: "var(--shadow-md)",
            padding: "10px 12px",
            fontSize: "0.74rem"
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "var(--statutory-ochre)", fontWeight: 700, marginBottom: "6px" }}>
            <AlertCircle size={14} />
            <span>Multiple Matching Parcels ({ambiguousMatches.length})</span>
          </div>
          <div style={{ fontSize: "0.7rem", color: "var(--text-muted)", marginBottom: "8px" }}>
            Your query matched multiple records. Select the exact intended parcel:
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "4px", maxHeight: "160px", overflowY: "auto" }}>
            {ambiguousMatches.map((m: any, idx: number) => (
              <button
                key={idx}
                onClick={() => onSelectAmbiguousMatch && onSelectAmbiguousMatch(m)}
                style={{
                  padding: "6px 8px",
                  background: "var(--bg-surface-alt)",
                  border: "1px solid var(--border-hairline)",
                  borderRadius: "4px",
                  textAlign: "left",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between"
                }}
              >
                <div>
                  <strong style={{ color: "var(--sovereign-navy)" }}>Khasra {m.native_identifier || m.khasra}</strong>
                  <div style={{ fontSize: "0.66rem", color: "var(--text-muted)" }}>
                    {m.village}, {m.district} • {m.area_hectares || m.area} Ha
                  </div>
                </div>
                <span style={{ fontSize: "0.68rem", color: "var(--sovereign-navy)", fontWeight: 600 }}>Select →</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
