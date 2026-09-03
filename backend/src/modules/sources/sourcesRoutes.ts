import { Router, Request, Response } from "express";
import { db } from "../../db/database.js";

const router = Router();

router.get("/", (_req: Request, res: Response) => {
  const sources = db.prepare("SELECT * FROM sources ORDER BY source_id ASC").all();
  res.json({ sources, count: sources.length });
});

router.get("/:id", (req: Request, res: Response) => {
  const id = String(req.params.id);
  const source = db.prepare("SELECT * FROM sources WHERE source_id = ?").get(id);
  if (!source) {
    return res.status(404).json({
      error: { code: "SOURCE_NOT_FOUND", message: `Source '${id}' does not exist.` }
    });
  }

  // Related documents and datasets
  const documents = db.prepare("SELECT document_id, title, document_type, date_enacted FROM documents WHERE source_id = ?").all(id);
  const datasets = db.prepare("SELECT dataset_id, title, row_count, geography FROM datasets WHERE source_id = ?").all(id);
  const mapLayers = db.prepare("SELECT layer_id, name, geometry_type FROM map_layers WHERE source_id = ?").all(id);

  res.json({
    source,
    linked_artifacts: {
      documents,
      datasets,
      map_layers: mapLayers
    }
  });
});

export default router;
