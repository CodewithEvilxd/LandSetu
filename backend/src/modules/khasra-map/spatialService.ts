/**
 * LandSetu PostGIS-Ready Spatial Service Abstraction
 * Encapsulates spatial geometry operations, bounding box queries, and GeoJSON serialization.
 * Designed to mirror PostgreSQL PostGIS conventions (EPSG:4326, ST_GeomFromGeoJSON, ST_Centroid, ST_BBox)
 * enabling transparent drop-in migration to PostGIS.
 */

export interface BoundingBox {
  minLng: number;
  minLat: number;
  maxLng: number;
  maxLat: number;
}

export class SpatialService {
  /**
   * Emulates PostGIS ST_Centroid on a polygon coordinate ring.
   */
  public static calculateCentroid(coordinates: number[][]): [number, number] {
    if (!coordinates || coordinates.length === 0) return [0, 0];
    let sumLng = 0;
    let sumLat = 0;
    const n = coordinates.length;
    for (const pt of coordinates) {
      sumLng += pt[0];
      sumLat += pt[1];
    }
    return [Math.round((sumLng / n) * 1000000) / 1000000, Math.round((sumLat / n) * 1000000) / 1000000];
  }

  /**
   * Emulates PostGIS ST_Envelope / Bounding Box computation.
   */
  public static calculateBBox(coordinates: number[][]): [number, number, number, number] {
    if (!coordinates || coordinates.length === 0) return [0, 0, 0, 0];
    let minLng = Infinity, minLat = Infinity, maxLng = -Infinity, maxLat = -Infinity;
    for (const pt of coordinates) {
      if (pt[0] < minLng) minLng = pt[0];
      if (pt[0] > maxLng) maxLng = pt[0];
      if (pt[1] < minLat) minLat = pt[1];
      if (pt[1] > maxLat) maxLat = pt[1];
    }
    return [minLng, minLat, maxLng, maxLat];
  }

  /**
   * Emulates PostGIS bounding box intersection (ST_Intersects / && operator).
   */
  public static bboxIntersects(bboxA: number[], bboxB: number[]): boolean {
    return !(
      bboxA[2] < bboxB[0] || // A is to the left of B
      bboxA[0] > bboxB[2] || // A is to the right of B
      bboxA[3] < bboxB[1] || // A is below B
      bboxA[1] > bboxB[3]    // A is above B
    );
  }

  /**
   * Validates topological polygon closure (first vertex equals last vertex).
   */
  public static isPolygonClosed(coordinates: number[][]): boolean {
    if (!coordinates || coordinates.length < 4) return false;
    const first = coordinates[0];
    const last = coordinates[coordinates.length - 1];
    return Math.abs(first[0] - last[0]) < 1e-7 && Math.abs(first[1] - last[1]) < 1e-7;
  }

  /**
   * Formats a raw database row into an OGC GeoJSON Feature.
   */
  public static toGeoJsonFeature(row: {
    parcel_uid: string;
    native_identifier: string;
    state: string;
    district: string;
    tehsil: string;
    village: string;
    area?: number;
    land_use?: string;
    geojson: string | object;
    centroid_lat: number;
    centroid_lng: number;
    source_id: string;
  }): any {
    const geom = typeof row.geojson === "string" ? JSON.parse(row.geojson) : row.geojson;
    return {
      type: "Feature",
      id: row.parcel_uid,
      properties: {
        parcel_uid: row.parcel_uid,
        khasra_no: row.native_identifier,
        state: row.state,
        district: row.district,
        tehsil: row.tehsil,
        village: row.village,
        area_hectares: row.area,
        land_use: row.land_use,
        centroid: [row.centroid_lng, row.centroid_lat],
        source_id: row.source_id
      },
      geometry: geom
    };
  }
}
