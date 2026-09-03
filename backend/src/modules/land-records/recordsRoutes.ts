import { Router, Request, Response } from "express";
import crypto from "node:crypto";
import { db } from "../../db/database.js";
import { optionalAuth, requireAuth, requireRole } from "../../middleware/auth.js";
import { aiClient } from "../../services/aiClient.js";
import { AuditService } from "../audit/auditService.js";

const router = Router();

router.get("/", (req: Request, res: Response) => {
  const { state, status } = req.query;
  let sql = "SELECT * FROM land_records WHERE 1=1";
  const params: any[] = [];

  if (state) {
    sql += " AND state = ?";
    params.push(state);
  }
  if (status) {
    sql += " AND verification_status = ?";
    params.push(status);
  }

  sql += " ORDER BY created_at DESC";
  const rows = db.prepare(sql).all(...params) as any[];
  const formatted = rows.map(r => ({
    ...r,
    fields: JSON.parse(r.fields_json || "{}")
  }));

  res.json({ records: formatted, count: formatted.length });
});

router.get("/:id", (req: Request, res: Response) => {
  const id = String(req.params.id);
  const rec = db.prepare("SELECT * FROM land_records WHERE record_id = ?").get(id) as any;
  if (!rec) {
    return res.status(404).json({
      error: { code: "RECORD_NOT_FOUND", message: `Land record '${id}' not found.` }
    });
  }

  res.json({
    record: {
      ...rec,
      fields: JSON.parse(rec.fields_json || "{}")
    }
  });
});

router.post("/upload", optionalAuth, async (req: Request, res: Response) => {
  const { document_name, raw_text } = req.body;
  if (!document_name || !raw_text) {
    return res.status(400).json({
      error: { code: "MISSING_FIELDS", message: "document_name and raw_text are required." }
    });
  }

  const recordId = `REC-OCR-${Date.now()}`;
  
  // Call AI OCR field extractor
  const extracted = await aiClient.extractOCR(document_name, raw_text, recordId);

  const state = extracted.fields?.state?.value || "Unknown";
  const district = extracted.fields?.district?.value || "Unknown";
  const tehsil = extracted.fields?.tehsil?.value || "Unknown";
  const village = extracted.fields?.village?.value || "Unknown";
  const language = extracted.language || "Hindi / Regional";
  const docType = extracted.document_type || "Record of Rights";
  const overallConf = extracted.overall_confidence || 0.85;
  const uncertainCount = extracted.uncertain_field_count || 0;
  const status = uncertainCount > 0 ? "pending_review" : "verified";
  const now = new Date().toISOString();

  const auditHash = crypto.createHash("sha256").update(recordId + document_name + overallConf).digest("hex");

  db.prepare(`
    INSERT INTO land_records (
      record_id, document_name, state, district, tehsil, village, language,
      document_type, raw_ocr_text, overall_confidence, fields_json,
      uncertain_field_count, verification_status, audit_hash, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    recordId, document_name, state, district, tehsil, village, language,
    docType, raw_text, overallConf, JSON.stringify(extracted.fields || {}),
    uncertainCount, status, auditHash, now
  );

  AuditService.logEvent({
    actorId: req.user ? req.user.id : "ANONYMOUS_UPLOADER",
    actorRole: req.user ? req.user.role : "public",
    action: "UPLOAD_LAND_RECORD",
    targetType: "LAND_RECORD",
    targetId: recordId,
    payload: { document_name, state, district, overallConf, uncertainCount, status }
  });

  res.status(201).json({
    record_id: recordId,
    document_name,
    overall_confidence: overallConf,
    uncertain_field_count: uncertainCount,
    verification_status: status,
    fields: extracted.fields,
    audit_hash: auditHash
  });
});

router.post("/:id/verify", requireAuth, requireRole(["official", "admin"]), (req: Request, res: Response) => {
  const id = String(req.params.id);
  const { updated_fields } = req.body;
  const rec = db.prepare("SELECT * FROM land_records WHERE record_id = ?").get(id) as any;
  if (!rec) {
    return res.status(404).json({
      error: { code: "RECORD_NOT_FOUND", message: `Land record '${id}' not found.` }
    });
  }

  const now = new Date().toISOString();
  let fieldsObj = JSON.parse(rec.fields_json || "{}");
  if (updated_fields) {
    fieldsObj = { ...fieldsObj, ...updated_fields };
  }

  db.prepare(`
    UPDATE land_records
    SET verification_status = 'verified', verified_by = ?, verified_at = ?, fields_json = ?, uncertain_field_count = 0
    WHERE record_id = ?
  `).run(req.user!.username, now, JSON.stringify(fieldsObj), id);

  AuditService.logEvent({
    actorId: req.user!.id,
    actorRole: req.user!.role,
    action: "HUMAN_VERIFY_RECORD",
    targetType: "LAND_RECORD",
    targetId: id,
    payload: { verified_by: req.user!.username, status: "verified" }
  });

  res.json({
    message: `Land record '${id}' verified by ${req.user!.username}.`,
    record_id: id,
    verification_status: "verified",
    verified_at: now
  });
});

router.post("/:id/reject", requireAuth, requireRole(["official", "admin"]), (req: Request, res: Response) => {
  const id = String(req.params.id);
  const { reason } = req.body;
  const rec = db.prepare("SELECT * FROM land_records WHERE record_id = ?").get(id) as any;
  if (!rec) {
    return res.status(404).json({
      error: { code: "RECORD_NOT_FOUND", message: `Land record '${id}' not found.` }
    });
  }

  const now = new Date().toISOString();
  db.prepare(`
    UPDATE land_records
    SET verification_status = 'rejected', verified_by = ?, verified_at = ?
    WHERE record_id = ?
  `).run(req.user!.username, now, id);

  AuditService.logEvent({
    actorId: req.user!.id,
    actorRole: req.user!.role,
    action: "REJECT_LAND_RECORD",
    targetType: "LAND_RECORD",
    targetId: id,
    payload: { rejected_by: req.user!.username, reason: reason || "Unacceptable OCR noise" }
  });

  res.json({
    message: `Land record '${id}' rejected by ${req.user!.username}.`,
    record_id: id,
    verification_status: "rejected",
    reason: reason || "Unacceptable OCR noise"
  });
});

export default router;
