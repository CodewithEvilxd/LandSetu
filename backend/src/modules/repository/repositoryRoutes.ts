import { Router, Request, Response } from "express";
import { db } from "../../db/database.js";

const router = Router();

// Documents
router.get("/documents", (req: Request, res: Response) => {
  const { jurisdiction, documentType } = req.query;
  let sql = "SELECT document_id, source_id, title, act_number, jurisdiction, publisher, source_url, date_enacted, document_type, summary, content_hash FROM documents WHERE 1=1";
  const params: any[] = [];

  if (jurisdiction) {
    sql += " AND jurisdiction LIKE ?";
    params.push(`%${jurisdiction}%`);
  }
  if (documentType) {
    sql += " AND document_type LIKE ?";
    params.push(`%${documentType}%`);
  }

  const docs = db.prepare(sql).all(...params);
  res.json({ documents: docs, count: docs.length });
});

router.get("/documents/:id", (req: Request, res: Response) => {
  const id = String(req.params.id);
  const doc = db.prepare("SELECT * FROM documents WHERE document_id = ?").get(id) as any;
  if (!doc) {
    return res.status(404).json({
      error: { code: "DOCUMENT_NOT_FOUND", message: `Document '${id}' not found.` }
    });
  }

  const chunks = db.prepare("SELECT chunk_id, section, topic, content, content_hash FROM document_chunks WHERE document_id = ?").all(id);

  res.json({
    document: {
      ...doc,
      key_provisions: JSON.parse(doc.content_json || "[]")
    },
    chunks
  });
});

// Datasets
router.get("/datasets", (_req: Request, res: Response) => {
  const datasets = db.prepare("SELECT dataset_id, source_id, title, description, row_count, geography, checksum_sha256, created_at FROM datasets").all();
  res.json({ datasets, count: datasets.length });
});

router.get("/datasets/:id", (req: Request, res: Response) => {
  const id = String(req.params.id);
  const ds = db.prepare("SELECT * FROM datasets WHERE dataset_id = ?").get(id) as any;
  if (!ds) {
    return res.status(404).json({
      error: { code: "DATASET_NOT_FOUND", message: `Dataset '${id}' not found.` }
    });
  }

  res.json({
    dataset: {
      ...ds,
      records: JSON.parse(ds.data_json || "[]")
    }
  });
});

export default router;
