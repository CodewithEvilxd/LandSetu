import React from "react";
import { ShieldCheck, ExternalLink } from "lucide-react";

interface MapAttributionProps {
  sourceId?: string;
  surveyYear?: number | string;
  checksum?: string;
  village?: string;
  state?: string;
}

export const MapAttribution: React.FC<MapAttributionProps> = ({
  sourceId = "dl-dlr-bhulekh",
  surveyYear = "2023",
  checksum,
  village,
  state
}) => {
  const isDelhi = state?.toLowerCase() === "delhi";
  const isBihar = state?.toLowerCase() === "bihar";
  const isUP = state?.toLowerCase().includes("uttar") || state?.toLowerCase() === "up";
  const sourceName = isDelhi
    ? "Revenue Dept, GNCTD (Bhulekh Delhi / DLRC)"
    : isBihar
    ? "Directorate of Land Records & Survey, Bihar (Biharbhumi)"
    : isUP
    ? "Board of Revenue, UP (UP Bhulekh / BhuNaksha / NOIDA-GNIDA)"
    : "Dept of Revenue & Disaster Management, Haryana (Jamabandi / Web-HALRIS)";

  const sourceUrl = isDelhi
    ? "https://bhulekh.delhi.gov.in"
    : isBihar
    ? "https://biharbhumi.bihar.gov.in"
    : isUP
    ? "https://upbhulekh.gov.in"
    : "https://jamabandi.nic.in";

  return (
    <div
      style={{
        position: "absolute",
        bottom: 6,
        right: 16,
        zIndex: 900,
        background: "rgba(255, 255, 255, 0.92)",
        backdropFilter: "blur(4px)",
        border: "1px solid var(--border-hairline)",
        borderRadius: "4px",
        padding: "4px 10px",
        fontSize: "0.68rem",
        color: "var(--text-muted)",
        display: "flex",
        alignItems: "center",
        gap: "10px",
        boxShadow: "0 1px 2px rgba(0,0,0,0.05)"
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
        <ShieldCheck size={12} color="var(--cadastral-emerald)" />
        <span style={{ fontWeight: 600, color: "var(--text-secondary)" }}>
          {village ? `${village} Cadastre (${surveyYear})` : "Official Survey Layer"}
        </span>
      </div>

      <span style={{ color: "var(--border-subtle)" }}>|</span>

      <a
        href={sourceUrl}
        target="_blank"
        rel="noopener noreferrer"
        style={{
          color: "var(--sovereign-navy)",
          textDecoration: "none",
          display: "flex",
          alignItems: "center",
          gap: "3px",
          fontWeight: 500
        }}
      >
        <span>{sourceName}</span>
        <ExternalLink size={10} />
      </a>

      {checksum && (
        <>
          <span style={{ color: "var(--border-subtle)" }}>|</span>
          <span
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "0.62rem",
              background: "var(--bg-surface-alt)",
              padding: "1px 4px",
              borderRadius: "2px"
            }}
            title={`Cryptographic SHA-256 Digest: ${checksum}`}
          >
            SHA: {checksum.substring(0, 8)}...
          </span>
        </>
      )}
    </div>
  );
};
