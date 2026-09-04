import React from "react";
import { Plus, Minus, Maximize2, Tag, Layers, Compass } from "lucide-react";

interface MapControlsProps {
  onZoomIn: () => void;
  onZoomOut: () => void;
  onResetView: () => void;
  showLabels: boolean;
  onToggleLabels: () => void;
  basemapMode: "cadastral" | "satellite";
  onToggleBasemap: () => void;
}

export const MapControls: React.FC<MapControlsProps> = ({
  onZoomIn,
  onZoomOut,
  onResetView,
  showLabels,
  onToggleLabels,
  basemapMode,
  onToggleBasemap
}) => {
  return (
    <div
      style={{
        position: "absolute",
        top: 16,
        right: 16,
        zIndex: 1000,
        display: "flex",
        flexDirection: "column",
        gap: "8px"
      }}
    >
      {/* North Arrow Widget */}
      <div
        style={{
          background: "#ffffff",
          borderRadius: "6px",
          border: "1px solid var(--border-hairline)",
          boxShadow: "var(--shadow-sm)",
          padding: "6px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          width: "36px",
          height: "36px"
        }}
        title="True Grid North (Survey Orientation)"
      >
        <Compass size={18} color="var(--sovereign-navy)" />
        <span
          style={{
            fontSize: "0.6rem",
            fontWeight: 800,
            color: "var(--sovereign-navy)",
            lineHeight: 1,
            marginTop: "1px"
          }}
        >
          N
        </span>
      </div>

      {/* Navigation Buttons */}
      <div
        style={{
          background: "#ffffff",
          borderRadius: "6px",
          border: "1px solid var(--border-hairline)",
          boxShadow: "var(--shadow-sm)",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden"
        }}
      >
        <button
          onClick={onZoomIn}
          title="Zoom In"
          style={{
            padding: "8px",
            background: "none",
            border: "none",
            borderBottom: "1px solid var(--border-hairline)",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "var(--text-secondary)"
          }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "var(--bg-surface-alt)")}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
        >
          <Plus size={16} />
        </button>

        <button
          onClick={onZoomOut}
          title="Zoom Out"
          style={{
            padding: "8px",
            background: "none",
            border: "none",
            borderBottom: "1px solid var(--border-hairline)",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "var(--text-secondary)"
          }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "var(--bg-surface-alt)")}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
        >
          <Minus size={16} />
        </button>

        <button
          onClick={onResetView}
          title="Fit Survey Boundary"
          style={{
            padding: "8px",
            background: "none",
            border: "none",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "var(--text-secondary)"
          }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "var(--bg-surface-alt)")}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
        >
          <Maximize2 size={15} />
        </button>
      </div>

      {/* Layer Toggles */}
      <div
        style={{
          background: "#ffffff",
          borderRadius: "6px",
          border: "1px solid var(--border-hairline)",
          boxShadow: "var(--shadow-sm)",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden"
        }}
      >
        <button
          onClick={onToggleLabels}
          title={showLabels ? "Hide Khasra Numbers" : "Show Khasra Numbers"}
          style={{
            padding: "8px",
            background: showLabels ? "var(--sovereign-navy-bg)" : "none",
            border: "none",
            borderBottom: "1px solid var(--border-hairline)",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: showLabels ? "var(--sovereign-navy)" : "var(--text-muted)"
          }}
          onMouseEnter={(e) => {
            if (!showLabels) e.currentTarget.style.backgroundColor = "var(--bg-surface-alt)";
          }}
          onMouseLeave={(e) => {
            if (!showLabels) e.currentTarget.style.backgroundColor = "transparent";
          }}
        >
          <Tag size={15} />
        </button>

        <button
          onClick={onToggleBasemap}
          title={`Switch Basemap (Current: ${basemapMode})`}
          style={{
            padding: "8px",
            background: basemapMode === "satellite" ? "var(--sovereign-navy-bg)" : "none",
            border: "none",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: basemapMode === "satellite" ? "var(--sovereign-navy)" : "var(--text-muted)"
          }}
          onMouseEnter={(e) => {
            if (basemapMode !== "satellite") e.currentTarget.style.backgroundColor = "var(--bg-surface-alt)";
          }}
          onMouseLeave={(e) => {
            if (basemapMode !== "satellite") e.currentTarget.style.backgroundColor = "transparent";
          }}
        >
          <Layers size={15} />
        </button>
      </div>
    </div>
  );
};
