import React, { useEffect, useRef, useState, useCallback } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { MapControls } from "./MapControls.js";
import { MapLegend } from "./MapLegend.js";
import { MapAttribution } from "./MapAttribution.js";

interface CadastralMapProps {
  geoJsonData: any;
  selectedParcelUid: string | null;
  onSelectParcel: (parcelUid: string) => void;
  villageName: string;
  stateName: string;
  surveyYear?: number | string;
  sourceId?: string;
  checksum?: string;
}

export const CadastralMap: React.FC<CadastralMapProps> = ({
  geoJsonData,
  selectedParcelUid,
  onSelectParcel,
  villageName,
  stateName,
  surveyYear,
  sourceId,
  checksum
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const geoJsonLayerRef = useRef<L.GeoJSON | null>(null);
  const labelsLayerRef = useRef<L.LayerGroup | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);

  const [showLabels, setShowLabels] = useState(true);
  const [basemapMode, setBasemapMode] = useState<"cadastral" | "satellite">("cadastral");

  // Fit bounds helper with container size validation
  const fitBoundsToData = useCallback((maxZoom = 17) => {
    const map = mapInstanceRef.current;
    const geoLayer = geoJsonLayerRef.current;
    if (!map || !geoLayer) return;

    map.invalidateSize();
    const bounds = geoLayer.getBounds();
    if (bounds.isValid()) {
      map.fitBounds(bounds, {
        padding: [45, 45],
        maxZoom: maxZoom,
        animate: true
      });
    }
  }, []);

  // 1. Initialize Map on Mount
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    let defaultCenter: [number, number] = [28.798, 77.134]; // Alipur, Delhi
    if (stateName.toLowerCase().includes("haryana")) {
      defaultCenter = [28.435, 77.085]; // Wazirabad, Gurugram
    } else if (stateName.toLowerCase().includes("bihar")) {
      defaultCenter = [25.595, 85.184]; // Sabbalpur, Patna
    } else if (stateName.toLowerCase().includes("uttar") || stateName.toLowerCase().includes("up") || villageName.toLowerCase().includes("noida") || villageName.toLowerCase().includes("kasna") || villageName.toLowerCase().includes("sorkha") || villageName.toLowerCase().includes("bisrakh")) {
      if (villageName.toLowerCase().includes("kasna")) {
        defaultCenter = [28.442, 77.532]; // Kasna, Greater Noida
      } else if (villageName.toLowerCase().includes("bisrakh")) {
        defaultCenter = [28.596, 77.442]; // Bisrakh, Greater Noida West
      } else {
        defaultCenter = [28.583, 77.408]; // Sorkha, Noida Sector 115
      }
    }

    const map = L.map(mapContainerRef.current, {
      center: defaultCenter,
      zoom: 16,
      zoomControl: false,
      attributionControl: false
    });

    // Clean OpenStreetMap base layer (100% Free, NO API KEY REQUIRED watermark)
    const osmTile = L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      subdomains: ["a", "b", "c"],
      attribution: "&copy; OpenStreetMap contributors"
    }).addTo(map);

    tileLayerRef.current = osmTile;
    labelsLayerRef.current = L.layerGroup().addTo(map);

    // Add metric scale control for cadastral measurement
    L.control.scale({
      imperial: false,
      metric: true,
      position: "bottomleft"
    }).addTo(map);

    mapInstanceRef.current = map;

    // ResizeObserver ensures map.invalidateSize() runs whenever flex layout or sidebar shifts
    const resizeObserver = new ResizeObserver(() => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.invalidateSize();
      }
    });
    if (mapContainerRef.current) {
      resizeObserver.observe(mapContainerRef.current);
    }

    return () => {
      resizeObserver.disconnect();
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // 2. Basemap Switcher (Clean OSM Standard vs High-Resolution Esri World Imagery)
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (tileLayerRef.current) {
      map.removeLayer(tileLayerRef.current);
    }

    if (basemapMode === "satellite") {
      // High-resolution satellite imagery with zero watermarks
      tileLayerRef.current = L.tileLayer(
        "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
        {
          maxZoom: 19,
          attribution: "Tiles &copy; Esri &mdash; World Imagery"
        }
      ).addTo(map);
    } else {
      // Clean OpenStreetMap tiles
      tileLayerRef.current = L.tileLayer(
        "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
        {
          maxZoom: 19,
          subdomains: ["a", "b", "c"],
          attribution: "&copy; OpenStreetMap contributors"
        }
      ).addTo(map);
    }

    // Bring GeoJSON and Labels to front above tiles
    if (geoJsonLayerRef.current) {
      geoJsonLayerRef.current.bringToFront();
    }
  }, [basemapMode]);

  // 3. Render Cadastral GeoJSON Parcels & Centered Badges
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !geoJsonData || !geoJsonData.features) return;

    // Clean up previous layers
    if (geoJsonLayerRef.current) {
      map.removeLayer(geoJsonLayerRef.current);
      geoJsonLayerRef.current = null;
    }
    if (labelsLayerRef.current) {
      labelsLayerRef.current.clearLayers();
    }

    // Add Official Cadastral GeoJSON Layer
    const geoLayer = L.geoJSON(geoJsonData, {
      style: (feature) => {
        const pUid = feature?.properties?.parcel_uid || "";
        const kId = feature?.properties?.khasra || feature?.properties?.khesra_no || feature?.properties?.native_identifier || "";
        const isSelected = pUid === selectedParcelUid || kId === selectedParcelUid;

        const landUse = (feature?.properties?.land_use || "").toLowerCase();
        const tenure = (feature?.properties?.recorded_tenure || "").toLowerCase();

        const isGaonSabha = landUse.includes("gaon") || landUse.includes("gram") || landUse.includes("public") || landUse.includes("road") || tenure.includes("gaon");
        const isWater = landUse.includes("water") || landUse.includes("johad") || landUse.includes("pond") || landUse.includes("drain") || landUse.includes("nullah");
        const isAbadi = landUse.includes("abadi") || landUse.includes("residential") || landUse.includes("lal dora");

        let strokeColor = "#334155";
        let fillColor = "rgba(248, 250, 252, 0.65)";
        let weight = 1.8;
        let fillOpacity = 0.65;

        if (basemapMode === "satellite") {
          strokeColor = "#f8fafc";
          fillColor = "rgba(255, 255, 255, 0.15)";
          weight = 2;
          fillOpacity = 0.25;
        }

        if (isSelected) {
          strokeColor = "#2563eb";
          fillColor = "rgba(59, 130, 246, 0.55)";
          weight = 3.5;
          fillOpacity = 0.75;
        } else if (isWater) {
          strokeColor = "#0284c7";
          fillColor = "rgba(186, 230, 253, 0.75)";
        } else if (isGaonSabha) {
          strokeColor = "#dc2626";
          fillColor = "rgba(254, 202, 202, 0.55)";
        } else if (isAbadi) {
          strokeColor = "#d97706";
          fillColor = "rgba(254, 243, 199, 0.65)";
        }

        return {
          color: strokeColor,
          weight: weight,
          fillColor: fillColor,
          fillOpacity: fillOpacity,
          dashArray: isGaonSabha && !isSelected ? "5, 4" : undefined
        };
      },
      onEachFeature: (feature, layer) => {
        const props = feature.properties || {};
        const khasra = props.khasra || props.khesra_no || props.khasra_no || props.native_identifier || "Parcel";
        const parcelUid = props.parcel_uid || khasra;
        const areaHectares = props.area_hectares || props.area || "—";
        const areaLocal = props.area_bigha_biswa || props.area_kanal_marla || props.area_bigha_kattha_dhur || props.area_raw || "";
        const landUse = props.land_use || "Agricultural";
        const khata = props.khata_no || props.khatauni_no || props.khewat_no || "";
        const owners = Array.isArray(props.recorded_owners) ? props.recorded_owners.join(", ") : (props.recorded_owners || "Recorded Bhumidhar");

        // Rich Government Cadastral Tooltip
        layer.bindTooltip(
          `<div style="font-family: 'Inter', system-ui, sans-serif; font-size: 11px; padding: 4px 6px; min-width: 170px; line-height: 1.4;">
            <div style="font-weight: 700; font-size: 13px; color: #0f172a; border-bottom: 1px solid #e2e8f0; padding-bottom: 3px; margin-bottom: 4px; display: flex; justify-content: space-between;">
              <span>Khasra No. <strong>${khasra}</strong></span>
              <span style="font-size: 10px; color: #64748b; font-weight: normal;">${props.village || villageName}</span>
            </div>
            <div style="color: #334155; font-size: 11px;"><strong>Area:</strong> ${areaHectares} Ha ${areaLocal ? `(${areaLocal})` : ""}</div>
            ${khata ? `<div style="color: #334155; font-size: 11px;"><strong>Account:</strong> Khata/Khewat ${khata}</div>` : ""}
            <div style="color: #334155; font-size: 11px;"><strong>Land Use:</strong> ${landUse}</div>
            <div style="color: #475569; font-size: 10px; margin-top: 2px;"><strong>Owner:</strong> ${owners}</div>
            <div style="font-size: 9px; color: #0284c7; margin-top: 4px; font-weight: 600;">Click to view complete legal title & mutations &rarr;</div>
          </div>`,
          { sticky: true, className: "cadastral-hover-tooltip" }
        );

        // Click & Hover Handlers
        layer.on({
          click: (e) => {
            L.DomEvent.stopPropagation(e);
            onSelectParcel(parcelUid);
            if ((layer as any).getBounds) {
              map.flyToBounds((layer as any).getBounds(), { padding: [60, 60], maxZoom: 18, duration: 0.6 });
            }
          },
          mouseover: (e) => {
            const target = e.target;
            const isSel = props.parcel_uid === selectedParcelUid;
            if (!isSel) {
              target.setStyle({
                weight: 2.8,
                color: basemapMode === "satellite" ? "#38bdf8" : "#0f172a",
                fillOpacity: 0.85
              });
            }
          },
          mouseout: (e) => {
            const target = e.target;
            const isSel = props.parcel_uid === selectedParcelUid;
            if (!isSel) {
              geoLayer.resetStyle(target);
            }
          }
        });

        // Add Centered Khasra Number Badge
        if (showLabels && (layer as any).getBounds) {
          const center = (layer as any).getBounds().getCenter();
          const isDarkMap = basemapMode === "satellite";
          
          const labelIcon = L.divIcon({
            className: "khasra-number-label",
            html: `<div style="
              font-family: 'JetBrains Mono', 'Roboto Mono', monospace;
              font-size: 11px;
              font-weight: 700;
              color: ${isDarkMap ? "#ffffff" : "#0f172a"};
              background: ${isDarkMap ? "rgba(15, 23, 42, 0.88)" : "rgba(255, 255, 255, 0.92)"};
              border: 1px solid ${isDarkMap ? "#38bdf8" : "#cbd5e1"};
              border-radius: 4px;
              padding: 1px 5px;
              white-space: nowrap;
              box-shadow: 0 1px 3px rgba(0,0,0,0.2);
              transform: translate(-50%, -50%);
              pointer-events: none;
              letter-spacing: -0.2px;
            ">${khasra}</div>`,
            iconSize: [0, 0]
          });

          const marker = L.marker(center, { icon: labelIcon, interactive: false });
          if (labelsLayerRef.current) {
            labelsLayerRef.current.addLayer(marker);
          }
        }
      }
    }).addTo(map);

    geoJsonLayerRef.current = geoLayer;

    // Dual-pass invalidation to guarantee accurate container bounds calculation
    fitBoundsToData(17);
    const t1 = setTimeout(() => fitBoundsToData(17), 100);
    const t2 = setTimeout(() => fitBoundsToData(17), 350);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [geoJsonData, showLabels, basemapMode, selectedParcelUid, fitBoundsToData, villageName]);

  // 4. Smooth Pan & Highlight on selectedParcelUid change
  useEffect(() => {
    const map = mapInstanceRef.current;
    const geoLayer = geoJsonLayerRef.current;
    if (!map || !geoLayer || !selectedParcelUid) return;

    geoLayer.eachLayer((layer: any) => {
      const p = layer.feature?.properties;
      const kId = p?.khasra || p?.khesra_no || p?.native_identifier;
      if (p?.parcel_uid === selectedParcelUid || kId === selectedParcelUid) {
        if (layer.getBounds) {
          map.flyToBounds(layer.getBounds(), { padding: [80, 80], maxZoom: 18, duration: 0.6 });
        }
      }
    });
  }, [selectedParcelUid]);

  const handleZoomIn = () => mapInstanceRef.current?.zoomIn();
  const handleZoomOut = () => mapInstanceRef.current?.zoomOut();
  const handleResetView = () => fitBoundsToData(17);

  return (
    <div style={{ width: "100%", height: "100%", position: "relative", backgroundColor: "#f8fafc", overflow: "hidden" }}>
      {/* Map Canvas Container */}
      <div ref={mapContainerRef} style={{ width: "100%", height: "100%", zIndex: 1 }} />

      {/* Floating Map Navigation & Layer Controls */}
      <MapControls
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        onResetView={handleResetView}
        showLabels={showLabels}
        onToggleLabels={() => setShowLabels(!showLabels)}
        basemapMode={basemapMode}
        onToggleBasemap={() => setBasemapMode(basemapMode === "cadastral" ? "satellite" : "cadastral")}
      />

      {/* Survey Symbology Legend */}
      <MapLegend />

      {/* Government Cadastral Source Attribution Bar */}
      <MapAttribution
        village={villageName}
        state={stateName}
        surveyYear={surveyYear}
        sourceId={sourceId}
        checksum={checksum}
      />
    </div>
  );
};
export default CadastralMap;
