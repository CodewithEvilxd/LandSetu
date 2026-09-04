import assert from "node:assert";
import { db } from "../src/db/database.js";

console.log("=================================================");
console.log(" TEST SUITE: GEOMETRY & SPATIAL VALIDATION");
console.log("=================================================");

async function runGeometryTests() {
  const geometries = db.prepare(`
    SELECT g.*, p.state, p.village, p.native_identifier
    FROM parcel_geometries g
    JOIN land_parcels p ON g.parcel_uid = p.parcel_uid
  `).all() as any[];

  assert.ok(geometries.length > 0, "Must have geometries in database");

  for (const g of geometries) {
    const geojson = JSON.parse(g.geojson);
    assert.ok(geojson.coordinates && geojson.coordinates.length > 0, `Geometry ${g.geometry_id} must have coordinates`);

    const lat = g.centroid_lat;
    const lng = g.centroid_lng;

    // Check India bounding box
    assert.ok(lat >= 8.0 && lat <= 37.0, `Latitude ${lat} must be within India bounds`);
    assert.ok(lng >= 68.0 && lng <= 97.0, `Longitude ${lng} must be within India bounds`);

    // State specific checks
    if (g.state.toLowerCase() === "delhi") {
      assert.ok(lat >= 28.4 && lat <= 28.9, `Delhi latitude ${lat} must be around 28.7°N`);
      assert.ok(lng >= 76.8 && lng <= 77.4, `Delhi longitude ${lng} must be around 77.1°E`);
    } else if (g.state.toLowerCase() === "haryana") {
      assert.ok(lat >= 28.2 && lat <= 28.7, `Gurugram latitude ${lat} must be around 28.4°N`);
      assert.ok(lng >= 76.8 && lng <= 77.3, `Gurugram longitude ${lng} must be around 77.1°E`);
    } else if (g.state.toLowerCase() === "bihar") {
      assert.ok(lat >= 25.4 && lat <= 25.8, `Patna latitude ${lat} must be around 25.6°N`);
      assert.ok(lng >= 85.0 && lng <= 85.4, `Patna longitude ${lng} must be around 85.2°E`);
    }

    const bbox = JSON.parse(g.bbox_json);
    assert.strictEqual(bbox.length, 4, `BBox ${g.bbox_json} must have 4 coordinates [minLng, minLat, maxLng, maxLat]`);
    assert.ok(bbox[0] <= bbox[2], "minLng <= maxLng");
    assert.ok(bbox[1] <= bbox[3], "minLat <= maxLat");
  }

  console.log(` -> [PASS] All ${geometries.length} parcel geometries verified with valid centroids, bboxes, and state projections.`);
  console.log("\n[SUCCESS] All Geometry & Spatial validation tests passed!\n");
}

runGeometryTests().catch((err) => {
  console.error("[FAIL] Geometry test failed:", err);
  process.exit(1);
});
