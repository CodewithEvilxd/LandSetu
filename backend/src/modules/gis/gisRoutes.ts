import { Router, Request, Response } from "express";
import { db } from "../../db/database.js";

const router = Router();

router.get("/layers", (_req: Request, res: Response) => {
  const layers = db.prepare("SELECT layer_id, source_id, name, geometry_type, projection, extent_json, service_type, service_url, metric_description, feature_count, created_at FROM map_layers").all();
  res.json({ layers, count: layers.length });
});

router.get("/layers/:id", (req: Request, res: Response) => {
  const id = String(req.params.id);
  const layer = db.prepare("SELECT * FROM map_layers WHERE layer_id = ?").get(id) as any;
  if (!layer) {
    return res.status(404).json({
      error: { code: "LAYER_NOT_FOUND", message: `Layer '${id}' not found.` }
    });
  }

  res.json({
    layer: {
      ...layer,
      extent: JSON.parse(layer.extent_json || "{}"),
      geo_json: JSON.parse(layer.data_json || "{}")
    }
  });
});

router.get("/imagery", (req: Request, res: Response) => {
  const { state, district } = req.query;
  let sql = "SELECT * FROM geo_imagery WHERE 1=1";
  const params: any[] = [];
  if (state) {
    sql += " AND state = ?";
    params.push(state);
  }
  if (district) {
    sql += " AND district = ?";
    params.push(district);
  }

  const imagery = db.prepare(sql).all(...params);
  res.json({ imagery, count: imagery.length });
});

router.post("/query", (req: Request, res: Response) => {
  const { state, minNdvi, maxNdvi, landUseCategory } = req.body;
  const layer = db.prepare("SELECT data_json FROM map_layers LIMIT 1").get() as any;
  if (!layer) return res.json({ features: [] });

  const geo = JSON.parse(layer.data_json);
  let matched = geo.features || [];

  if (state) {
    matched = matched.filter((f: any) => f.properties?.state?.toLowerCase() === state.toLowerCase());
  }
  if (minNdvi !== undefined) {
    matched = matched.filter((f: any) => (f.properties?.vegetation_index_ndvi || 0) >= minNdvi);
  }
  if (maxNdvi !== undefined) {
    matched = matched.filter((f: any) => (f.properties?.vegetation_index_ndvi || 0) <= maxNdvi);
  }
  if (landUseCategory) {
    matched = matched.filter((f: any) => f.properties?.land_use_category?.toLowerCase().includes(landUseCategory.toLowerCase()));
  }

  res.json({
    features: matched,
    count: matched.length
  });
});

export default router;
