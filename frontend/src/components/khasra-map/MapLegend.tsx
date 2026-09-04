import React, { useState } from "react";
import { ChevronDown, ChevronUp, Info } from "lucide-react";

export const MapLegend: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div
      style={{
        position: "absolute",
        bottom: 24,
        left: 16,
        zIndex: 1000,
        background: "rgba(255, 255, 255, 0.96)",
        backdropFilter: "blur(6px)",
        border: "1px solid var(--border-hairline)",
        borderRadius: "6px",
        boxShadow: "var(--shadow-md)",
        fontSize: "0.74rem",
        minWidth: "210px",
        maxWidth: "260px",
        overflow: "hidden"
      }}
    >
      <div
        onClick={() => setCollapsed(!collapsed)}
        style={{
          padding: "8px 12px",
          background: "var(--bg-surface-alt)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          cursor: "pointer",
          borderBottom: collapsed ? "none" : "1px solid var(--border-hairline)"
        }}
      >
        <span
          style={{
            fontFamily: "var(--font-tech)",
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: "0.05em",
            color: "var(--sovereign-navy)",
            display: "flex",
            alignItems: "center",
            gap: "5px"
          }}
        >
          <Info size={13} color="var(--sovereign-navy)" />
          Cadastral Symbology
        </span>
        {collapsed ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
      </div>

      {!collapsed && (
        <div style={{ padding: "10px 12px", display: "flex", flexDirection: "column", gap: "7px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span
              style={{
                width: "20px",
                height: "12px",
                border: "2px solid #0284c7",
                background: "rgba(56, 189, 248, 0.4)",
                borderRadius: "2px"
              }}
            />
            <span style={{ color: "var(--text-primary)", fontWeight: 600 }}>Active Selected Parcel</span>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span
              style={{
                width: "20px",
                height: "12px",
                border: "1.5px solid #475569",
                background: "rgba(241, 245, 249, 0.6)",
                borderRadius: "2px"
              }}
            />
            <span style={{ color: "var(--text-secondary)" }}>Agricultural (Bhumidhari/Private)</span>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span
              style={{
                width: "20px",
                height: "12px",
                border: "1.5px solid #991b1b",
                background: "rgba(254, 202, 202, 0.4)",
                borderRadius: "2px"
              }}
            />
            <span style={{ color: "var(--text-secondary)" }}>Gaon Sabha / Public Utility</span>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span
              style={{
                width: "20px",
                height: "12px",
                border: "1.5px solid #0284c7",
                background: "rgba(186, 230, 253, 0.5)",
                borderRadius: "2px"
              }}
            />
            <span style={{ color: "var(--text-secondary)" }}>Waterbody / Johad / Drainage</span>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "8px", borderTop: "1px solid var(--border-hairline)", paddingTop: "6px", marginTop: "2px" }}>
            <span
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "0.68rem",
                fontWeight: 700,
                color: "var(--sovereign-navy)",
                background: "#f1f5f9",
                padding: "1px 4px",
                borderRadius: "2px"
              }}
            >
              142
            </span>
            <span style={{ color: "var(--text-muted)", fontSize: "0.7rem" }}>Survey Centroid & Khasra No.</span>
          </div>
        </div>
      )}
    </div>
  );
};
