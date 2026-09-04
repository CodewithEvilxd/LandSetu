import React, { useEffect, useState, useRef } from "react";
import { api } from "../api/client.js";
import { PageHeader } from "../components/PageHeader.js";
import { LoadingState } from "../components/LoadingState.js";
import { EmptyState } from "../components/EmptyState.js";
import { 
  Layers, 
  Camera, 
  MapPin, 
  Compass, 
  Map as MapIcon,
  Maximize2,
  CheckCircle2,
  SlidersHorizontal,
  Info
} from "lucide-react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

export const GISMapPage: React.FC = () => {
  const [layers, setLayers] = useState<any[]>([]);
  const [selectedLayer, setSelectedLayer] = useState<any>(null);
  const [imagery, setImagery] = useState<any[]>([]);
  const [activeFeature, setActiveFeature] = useState<any>(null);
  const [ndviFilter, setNdviFilter] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const geoJsonLayerRef = useRef<L.GeoJSON | null>(null);

  useEffect(() => {
    Promise.all([
      api.getLayers(),
      api.getImagery()
    ]).then(([lRes, imgRes]) => {
      setLayers(lRes.layers || []);
      setImagery(imgRes.imagery || []);
      if (lRes.layers && lRes.layers.length > 0) {
        api.getLayer(lRes.layers[0].layer_id).then(res => {
          setSelectedLayer(res.layer);
          if (res.layer?.geo_json?.features?.length > 0) {
            setActiveFeature(res.layer.geo_json.features[0]);
          }
        });
      }
    }).catch(err => console.error("Error loading GIS data:", err))
      .finally(() => setLoading(false));
  }, []);

  // Initialize and update Leaflet map
  useEffect(() => {
    if (!mapContainerRef.current || loading) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [25.5, 78.6],
        zoom: 7,
        zoomControl: true
      });

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 18,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(map);

      mapInstanceRef.current = map;
    }

    const map = mapInstanceRef.current;

    // Remove previous geojson layer if present
    if (geoJsonLayerRef.current) {
      map.removeLayer(geoJsonLayerRef.current);
      geoJsonLayerRef.current = null;
    }

    if (selectedLayer?.geo_json) {
      const filteredFeatures = (selectedLayer.geo_json.features || []).filter(
        (f: any) => (f.properties?.vegetation_index_ndvi || 0) >= ndviFilter
      );

      const filteredGeoJson = {
        type: "FeatureCollection",
        features: filteredFeatures
      };

      const geoLayer = L.geoJSON(filteredGeoJson as any, {
        style: (feature) => {
          const isSelected = activeFeature?.properties?.name === feature?.properties?.name ||
                            activeFeature?.properties?.parcel_id === feature?.properties?.parcel_id;
          return {
            color: isSelected ? "#065f46" : "#0b2545",
            weight: isSelected ? 3.5 : 1.8,
            fillColor: isSelected ? "#10b981" : "#1e40af",
            fillOpacity: isSelected ? 0.65 : 0.4
          };
        },
        onEachFeature: (feature, layer) => {
          layer.on({
            click: () => {
              setActiveFeature(feature);
            },
            mouseover: () => {
              (layer as any).setStyle({ fillOpacity: 0.75, weight: 2.5 });
            },
            mouseout: () => {
              const isSelected = activeFeature?.properties?.name === feature?.properties?.name;
              (layer as any).setStyle({
                fillOpacity: isSelected ? 0.65 : 0.4,
                weight: isSelected ? 3.5 : 1.8
              });
            }
          });

          if (feature.properties?.name) {
            layer.bindTooltip(`<strong>${feature.properties.name}</strong><br/>NDVI: ${feature.properties.vegetation_index_ndvi || 'N/A'}`, { sticky: true });
          }
        }
      }).addTo(map);

      geoJsonLayerRef.current = geoLayer;

      // Fit map to layer bounds if features exist
      if (filteredFeatures.length > 0 && geoLayer.getBounds().isValid()) {
        map.fitBounds(geoLayer.getBounds(), { padding: [30, 30], maxZoom: 10 });
      }
    }
  }, [loading, selectedLayer, ndviFilter, activeFeature]);

  // Handle map resizing when tab becomes active
  useEffect(() => {
    if (mapInstanceRef.current) {
      setTimeout(() => {
        mapInstanceRef.current?.invalidateSize();
      }, 250);
    }
  }, []);

  if (loading) {
    return <LoadingState message="Loading Thematic GIS Layers, WMS Feeds & OpenStreetMap Services..." minHeight={350} />;
  }

  const features = (selectedLayer?.geo_json?.features || []).filter(
    (f: any) => (f.properties?.vegetation_index_ndvi || 0) >= ndviFilter
  );

  return (
    <div className="gis-view">
      <PageHeader
        title="Geospatial Intelligence & Field Imagery Explorer"
        subtitle="Thematic cadastral boundaries, Land Use / Land Cover (LULC) classification, and geo-coded ground observations under SRISHTI-DRISHTI standards."
      />

      {/* 70/30 Modern GIS Console Grid */}
      <div className="gis-console-grid">
        {/* Main Map Viewport Console (70%) */}
        <div className="card" style={{ padding: "16px", display: "flex", flexDirection: "column" }}>
          {/* Floating Control Toolbar */}
          <div className="gis-floating-control-bar">
            {/* Layer Selection Pill */}
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <Layers size={16} color="var(--sovereign-navy)" />
              <div style={{ display: "flex", gap: "6px" }}>
                {layers.map(l => (
                  <button
                    key={l.layer_id}
                    onClick={() => {
                      api.getLayer(l.layer_id).then(res => {
                        setSelectedLayer(res.layer);
                        if (res.layer?.geo_json?.features?.length > 0) {
                          setActiveFeature(res.layer.geo_json.features[0]);
                        }
                      });
                    }}
                    style={{
                      padding: "5px 12px",
                      borderRadius: "6px",
                      fontSize: "0.78rem",
                      fontWeight: 600,
                      cursor: "pointer",
                      border: selectedLayer?.layer_id === l.layer_id ? "1.5px solid var(--sovereign-navy)" : "1px solid var(--border-subtle)",
                      backgroundColor: selectedLayer?.layer_id === l.layer_id ? "var(--sovereign-navy-bg)" : "#ffffff",
                      color: selectedLayer?.layer_id === l.layer_id ? "var(--sovereign-navy)" : "var(--text-secondary)",
                      transition: "var(--transition-smooth)"
                    }}
                  >
                    {l.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Inline NDVI Range Filter */}
            <div style={{ display: "flex", alignItems: "center", gap: "10px", backgroundColor: "#ffffff", padding: "4px 10px", borderRadius: "6px", border: "1px solid var(--border-hairline)" }}>
              <span style={{ fontFamily: "var(--font-tech)", fontSize: "0.72rem", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>
                Min NDVI:
              </span>
              <input
                type="range"
                min="0"
                max="0.8"
                step="0.05"
                value={ndviFilter}
                onChange={e => setNdviFilter(parseFloat(e.target.value))}
                style={{ width: "90px", accentColor: "var(--cadastral-emerald)" }}
              />
              <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.78rem", fontWeight: 700, color: "var(--cadastral-emerald)", minWidth: "32px" }}>
                {ndviFilter.toFixed(2)}
              </span>
            </div>

            {/* Reset & Summary Actions */}
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span className="badge badge-blue" style={{ fontSize: "0.72rem" }}>
                {features.length} Zones Visible
              </span>
              <button 
                className="btn btn-secondary btn-sm"
                style={{ fontSize: "0.72rem", padding: "3px 9px" }}
                onClick={() => {
                  if (mapInstanceRef.current && geoJsonLayerRef.current) {
                    mapInstanceRef.current.fitBounds(geoJsonLayerRef.current.getBounds());
                  }
                }}
              >
                <Maximize2 size={12} />
                <span>Fit Bounds</span>
              </button>
            </div>
          </div>

          {/* Leaflet Map Canvas */}
          <div
            ref={mapContainerRef}
            style={{
              width: "100%",
              height: "480px",
              borderRadius: "6px",
              border: "1px solid var(--border-hairline)",
              zIndex: 1
            }}
          />
          
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "10px", fontSize: "0.74rem", color: "var(--text-muted)" }}>
            <span style={{ display: "flex", alignItems: "center", gap: "5px" }}>
              <Info size={13} />
              Click on any highlighted cadastral polygon to inspect watershed, soil moisture, and LULC telemetry.
            </span>
            <span style={{ fontFamily: "var(--font-tech)" }}>EPSG:4326 (WGS84) &bull; NRSC Bhuvan</span>
          </div>
        </div>

        {/* Cadastral Parcel & Watershed Dossier Inspector (30%) */}
        <div className="card" style={{ display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
          <div>
            <div className="card-header">
              <div className="card-title">
                <MapPin size={17} color="var(--cadastral-emerald)" />
                <span>Zone Attributes</span>
              </div>
              {activeFeature && (
                <span className="badge badge-green">Inspected</span>
              )}
            </div>

            {activeFeature ? (
              <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                <div>
                  <span style={{ color: "var(--text-muted)", fontSize: "0.7rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", fontFamily: "var(--font-tech)" }}>
                    Watershed / Polygon Area
                  </span>
                  <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "1.05rem", color: "var(--sovereign-navy)", marginTop: "2px" }}>
                    {activeFeature.properties?.name || activeFeature.properties?.parcel_id}
                  </div>
                  <div style={{ fontSize: "0.78rem", color: "var(--text-secondary)", marginTop: "2px" }}>
                    {activeFeature.properties?.district}, {activeFeature.properties?.state}
                  </div>
                </div>

                <div style={{ padding: "10px 12px", backgroundColor: "#f8fafc", borderRadius: "6px", border: "1px solid #e2e8f0" }}>
                  <span style={{ color: "var(--text-muted)", fontSize: "0.7rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.04em", fontFamily: "var(--font-tech)", display: "block", marginBottom: "3px" }}>
                    Land Use Category (LULC)
                  </span>
                  <div style={{ fontWeight: 600, color: "var(--sovereign-navy)", fontSize: "0.85rem" }}>
                    {activeFeature.properties?.land_use_category || "Unclassified Land Cover"}
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
                  <div style={{ padding: "10px 12px", backgroundColor: "#f0fdf4", borderRadius: "6px", border: "1px solid #bbf7d0" }}>
                    <span style={{ color: "#166534", fontSize: "0.68rem", fontWeight: 700, textTransform: "uppercase", display: "block" }}>
                      VEGETATION (NDVI)
                    </span>
                    <span style={{ fontFamily: "var(--font-mono)", fontWeight: 800, color: "#166534", fontSize: "1.2rem" }}>
                      {activeFeature.properties?.vegetation_index_ndvi ?? "-"}
                    </span>
                  </div>

                  <div style={{ padding: "10px 12px", backgroundColor: "#f8fafc", borderRadius: "6px", border: "1px solid #e2e8f0" }}>
                    <span style={{ color: "var(--text-muted)", fontSize: "0.68rem", fontWeight: 700, textTransform: "uppercase", display: "block" }}>
                      SOIL MOISTURE
                    </span>
                    <span style={{ fontFamily: "var(--font-mono)", fontWeight: 800, color: "var(--sovereign-navy)", fontSize: "1.2rem" }}>
                      {activeFeature.properties?.soil_moisture_index ?? "-"}
                    </span>
                  </div>
                </div>

                {activeFeature.properties?.water_harvesting_structures_count !== undefined && (
                  <div style={{ padding: "10px 12px", backgroundColor: "#ebf3fc", borderRadius: "6px", border: "1px solid #bfdbfe" }}>
                    <span style={{ color: "var(--sovereign-navy)", fontSize: "0.7rem", fontWeight: 700, textTransform: "uppercase", display: "block", letterSpacing: "0.04em" }}>
                      Water Harvesting Structures
                    </span>
                    <span style={{ fontWeight: 700, color: "var(--sovereign-navy)", fontSize: "0.9rem" }}>
                      {activeFeature.properties.water_harvesting_structures_count} units registered (IWMP)
                    </span>
                  </div>
                )}

                {activeFeature.properties?.srishti_monitoring_status && (
                  <div>
                    <span style={{ color: "var(--text-muted)", fontSize: "0.7rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.04em", fontFamily: "var(--font-tech)" }}>
                      SRISHTI Monitoring Telemetry
                    </span>
                    <div style={{ fontSize: "0.8rem", color: "var(--text-secondary)", marginTop: "3px", lineHeight: 1.4 }}>
                      {activeFeature.properties.srishti_monitoring_status}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <EmptyState
                compact
                title="No Zone Selected"
                description="Click on any polygon on the map to inspect its attributes."
              />
            )}
          </div>
        </div>
      </div>

      {/* Field Ground Observations (SRISHTI-DRISHTI) */}
      <div className="card">
        <div className="card-header">
          <div>
            <div className="card-title">
              <Camera size={18} color="var(--sovereign-navy)" />
              <span>SRISHTI-DRISHTI Geo-Coded Ground Observations ({imagery.length})</span>
            </div>
            <div className="card-subtitle">
              Ground photography tagged with coordinates, compass azimuth, and satellite cross-check validation
            </div>
          </div>
        </div>

        {imagery.length === 0 ? (
          <EmptyState
            title="No Field Observations"
            description="No geo-coded ground photos currently indexed for this region."
          />
        ) : (
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Observation ID</th>
                  <th>Asset / Watershed</th>
                  <th>Location</th>
                  <th>Coordinates (Lat / Lon)</th>
                  <th>Azimuth & Altitude</th>
                  <th>Ground Truth Observation</th>
                  <th>Satellite Cross-Check</th>
                </tr>
              </thead>
              <tbody>
                {imagery.map(im => (
                  <tr key={im.image_id}>
                    <td>
                      <code style={{ fontFamily: "var(--font-mono)", fontSize: "0.78rem", fontWeight: 600, color: "var(--sovereign-navy)" }}>
                        {im.image_id}
                      </code>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600, color: "var(--text-primary)" }}>{im.asset_type}</div>
                      <div style={{ fontSize: "0.72rem", color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>{im.watershed_id}</div>
                    </td>
                    <td>{im.village}, {im.district}, {im.state}</td>
                    <td>
                      <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.78rem", background: "#f1f5f9", padding: "2px 6px", borderRadius: "4px", border: "1px solid #e2e8f0" }}>
                        {im.latitude.toFixed(4)}°N, {im.longitude.toFixed(4)}°E
                      </span>
                    </td>
                    <td>
                      <div style={{ fontSize: "0.76rem", display: "flex", alignItems: "center", gap: "4px", color: "var(--text-secondary)" }}>
                        <Compass size={13} />
                        <span>{im.azimuth_degrees}° az &bull; {im.altitude_meters}m alt</span>
                      </div>
                    </td>
                    <td style={{ fontSize: "0.82rem", color: "var(--text-primary)" }}>{im.field_observation}</td>
                    <td>
                      <span className="badge badge-green" style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}>
                        <CheckCircle2 size={11} />
                        <span>{im.remote_sensing_crosscheck}</span>
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
