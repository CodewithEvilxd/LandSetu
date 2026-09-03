import React, { useEffect, useState } from "react";
import { api } from "../api/client.js";
import { 
  Map, 
  Layers, 
  Camera, 
  MapPin, 
  Filter, 
  Compass, 
  Satellite 
} from "lucide-react";

export const GISMapPage: React.FC = () => {
  const [layers, setLayers] = useState<any[]>([]);
  const [selectedLayer, setSelectedLayer] = useState<any>(null);
  const [imagery, setImagery] = useState<any[]>([]);
  const [activeFeature, setActiveFeature] = useState<any>(null);
  const [ndviFilter, setNdviFilter] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);

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
          if (res.layer.geo_json?.features?.length > 0) {
            setActiveFeature(res.layer.geo_json.features[0]);
          }
        });
      }
    }).catch(err => console.error("Error loading GIS data:", err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div style={{ padding: "40px", textAlign: "center" }}>Loading GIS & Thematic Spatial Services...</div>;
  }

  const features = (selectedLayer?.geo_json?.features || []).filter(
    (f: any) => (f.properties?.vegetation_index_ndvi || 0) >= ndviFilter
  );

  return (
    <div className="gis-view">
      <div style={{ marginBottom: "20px" }}>
        <h2 style={{ fontSize: "1.4rem", fontWeight: 800, color: "var(--primary)" }}>
          Geospatial Intelligence & Field Imagery Explorer
        </h2>
        <p style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>
          Thematic spatial boundaries, Land Use / Land Cover (LULC), and geo-coded ground field imagery under SRISHTI-DRISHTI watershed standards (SIH26015).
        </p>
      </div>

      <div className="grid-3" style={{ gridTemplateColumns: "1fr 2fr 1fr", marginBottom: "20px" }}>
        {/* Layer Selector & Spatial Filter */}
        <div className="card">
          <div className="card-header">
            <div className="card-title">
              <Layers size={16} color="var(--primary)" />
              <span>Spatial Layers</span>
            </div>
            <span className="badge badge-green">WGS84</span>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {layers.map(l => (
              <div
                key={l.layer_id}
                style={{
                  padding: "10px",
                  borderRadius: "6px",
                  border: selectedLayer?.layer_id === l.layer_id ? "2px solid var(--primary)" : "1px solid var(--border-subtle)",
                  backgroundColor: selectedLayer?.layer_id === l.layer_id ? "#f0fdf4" : "#ffffff",
                  cursor: "pointer"
                }}
                onClick={() => {
                  api.getLayer(l.layer_id).then(res => {
                    setSelectedLayer(res.layer);
                    if (res.layer.geo_json?.features?.length > 0) {
                      setActiveFeature(res.layer.geo_json.features[0]);
                    }
                  });
                }}
              >
                <div style={{ fontWeight: 600, fontSize: "0.85rem" }}>{l.name}</div>
                <div style={{ fontSize: "0.72rem", color: "var(--text-muted)", marginTop: "2px" }}>
                  {l.geometry_type} | {l.service_type}
                </div>
              </div>
            ))}
          </div>

          {/* Dynamic NDVI Filter */}
          <div style={{ marginTop: "20px", borderTop: "1px solid var(--border-subtle)", paddingTop: "14px" }}>
            <label className="form-label" style={{ display: "flex", justifyContent: "space-between" }}>
              <span>Filter by Min NDVI:</span>
              <span style={{ fontFamily: "var(--font-mono)", color: "var(--primary)" }}>{ndviFilter.toFixed(2)}</span>
            </label>
            <input
              type="range"
              min="0"
              max="0.8"
              step="0.05"
              value={ndviFilter}
              onChange={e => setNdviFilter(parseFloat(e.target.value))}
              style={{ width: "100%", accentColor: "var(--primary)" }}
            />
            <div style={{ fontSize: "0.72rem", color: "var(--text-muted)", marginTop: "4px" }}>
              Matching {features.length} / {selectedLayer?.geo_json?.features?.length || 0} spatial parcels.
            </div>
          </div>
        </div>

        {/* Spatial Map Canvas Simulation */}
        <div className="card" style={{ padding: "16px", display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <Satellite size={16} color="var(--primary)" />
              <span style={{ fontWeight: 700, fontSize: "0.9rem" }}>Interactive Thematic Cadastral & Watershed Map</span>
            </div>
            <span className="badge badge-blue">EPSG:4326</span>
          </div>

          <div
            style={{
              flex: 1,
              minHeight: "340px",
              backgroundColor: "#e2e8f0",
              borderRadius: "6px",
              position: "relative",
              overflow: "hidden",
              border: "1px solid #cbd5e1",
              backgroundImage: "radial-gradient(#cbd5e1 1px, transparent 1px)",
              backgroundSize: "20px 20px"
            }}
          >
            {/* SVG Visualizer for features */}
            <svg style={{ width: "100%", height: "100%" }} viewBox="74 15 10 15">
              {features.map((f: any) => {
                const coords = f.geometry?.coordinates?.[0] || [];
                const points = coords.map((c: number[]) => `${c[0]},${30 - (c[1] - 15)}`).join(" ");
                const isSelected = activeFeature?.properties?.parcel_id === f.properties?.parcel_id;
                return (
                  <polygon
                    key={f.properties?.parcel_id}
                    points={points}
                    fill={isSelected ? "#10b981" : "#2d6a4f"}
                    fillOpacity={isSelected ? "0.85" : "0.5"}
                    stroke={isSelected ? "#064e3b" : "#1b4332"}
                    strokeWidth="0.08"
                    style={{ cursor: "pointer", transition: "all 0.2s" }}
                    onClick={() => setActiveFeature(f)}
                  />
                );
              })}
            </svg>

            {/* Map Overlay Badge */}
            <div style={{ position: "absolute", bottom: "10px", left: "10px", backgroundColor: "rgba(255,255,255,0.9)", padding: "4px 8px", borderRadius: "4px", fontSize: "0.72rem", border: "1px solid #cbd5e1" }}>
              Click on parcel boundary to inspect cadastral attributes
            </div>
          </div>
        </div>

        {/* Feature Inspector */}
        <div className="card">
          <div className="card-header">
            <div className="card-title">
              <MapPin size={16} color="var(--primary)" />
              <span>Parcel Attributes</span>
            </div>
            {activeFeature && <span className="badge badge-green">Selected</span>}
          </div>

          {activeFeature ? (
            <div style={{ fontSize: "0.82rem", display: "flex", flexDirection: "column", gap: "10px" }}>
              <div>
                <span style={{ color: "var(--text-muted)", fontSize: "0.72rem" }}>PARCEL / SURVEY ID</span>
                <div style={{ fontWeight: 700 }}>{activeFeature.properties?.parcel_id}</div>
              </div>

              <div>
                <span style={{ color: "var(--text-muted)", fontSize: "0.72rem" }}>LOCATION</span>
                <div>{activeFeature.properties?.district}, {activeFeature.properties?.state}</div>
              </div>

              <div>
                <span style={{ color: "var(--text-muted)", fontSize: "0.72rem" }}>LAND USE CATEGORY</span>
                <div><span className="badge badge-amber">{activeFeature.properties?.land_use_category}</span></div>
              </div>

              <div>
                <span style={{ color: "var(--text-muted)", fontSize: "0.72rem" }}>VEGETATION INDEX (NDVI)</span>
                <div style={{ fontFamily: "var(--font-mono)", fontWeight: 700, color: "var(--primary)" }}>
                  {activeFeature.properties?.vegetation_index_ndvi}
                </div>
              </div>

              <div>
                <span style={{ color: "var(--text-muted)", fontSize: "0.72rem" }}>SOIL MOISTURE INDEX</span>
                <div style={{ fontFamily: "var(--font-mono)" }}>
                  {activeFeature.properties?.soil_moisture_index}
                </div>
              </div>

              <div>
                <span style={{ color: "var(--text-muted)", fontSize: "0.72rem" }}>WATERSHED HARVESTING DENSITY</span>
                <div>{activeFeature.properties?.water_conservation_structure_density}</div>
              </div>
            </div>
          ) : (
            <div style={{ color: "var(--text-muted)", fontSize: "0.8rem" }}>No feature selected.</div>
          )}
        </div>
      </div>

      {/* SRISHTI-DRISHTI Geo-Coded Field Imagery (SIH26015) */}
      <div className="card">
        <div className="card-header">
          <div>
            <div className="card-title">
              <Camera size={18} color="var(--primary)" />
              <span>SRISHTI-DRISHTI Geo-Coded Field Observations (SIH26015)</span>
            </div>
            <div className="card-subtitle">
              Ground photos tagged with coordinates, azimuth angle, altitude, and remote sensing cross-check
            </div>
          </div>
          <span className="badge badge-blue">ISRO / NRSC Geoportal Interop</span>
        </div>

        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Image ID</th>
                <th>Asset / Watershed</th>
                <th>Location</th>
                <th>Coordinates (Lat/Lon)</th>
                <th>Azimuth & Alt</th>
                <th>Ground Observation</th>
                <th>Remote Sensing Crosscheck</th>
              </tr>
            </thead>
            <tbody>
              {imagery.map(im => (
                <tr key={im.image_id}>
                  <td><span className="badge badge-blue">{im.image_id}</span></td>
                  <td>
                    <div style={{ fontWeight: 600 }}>{im.asset_type}</div>
                    <div style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>{im.watershed_id}</div>
                  </td>
                  <td>{im.village}, {im.district}, {im.state}</td>
                  <td>
                    <span className="badge-hash">{im.latitude.toFixed(4)}, {im.longitude.toFixed(4)}</span>
                  </td>
                  <td>
                    <div style={{ fontSize: "0.75rem", display: "flex", alignItems: "center", gap: "4px" }}>
                      <Compass size={12} /> {im.azimuth_degrees}&deg; | {im.altitude_meters}m
                    </div>
                  </td>
                  <td style={{ fontSize: "0.78rem" }}>{im.field_observation}</td>
                  <td>
                    <span className="badge badge-green">{im.remote_sensing_crosscheck}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
