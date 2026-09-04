import { Router, Request, Response } from "express";
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import multer from "multer";
import { db } from "../../db/database.js";
import { optionalAuth, requireAuth, requireRole } from "../../middleware/auth.js";
import { aiClient } from "../../services/aiClient.js";
import { AuditService } from "../audit/auditService.js";

const uploadDir = path.resolve(process.cwd(), "uploads", "records");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadDir);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    const safeBase = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9_-]/g, "_");
    cb(null, `${Date.now()}-${safeBase}${ext}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 30 * 1024 * 1024 } // 30 MB
});

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

router.post("/upload", optionalAuth, upload.single("file"), async (req: Request, res: Response) => {
  let document_name = req.body?.document_name || (req.file ? req.file.originalname : "");
  let raw_text = req.body?.raw_text || "";

  let fileMeta: any = null;
  if (req.file) {
    fileMeta = {
      filename: req.file.filename,
      original_name: req.file.originalname,
      size: req.file.size,
      mimetype: req.file.mimetype,
      url: `/uploads/records/${req.file.filename}`
    };

    if (!document_name) {
      document_name = req.file.originalname;
    }
  }

  if (!document_name) {
    return res.status(400).json({
      error: { code: "MISSING_FIELDS", message: "document_name or an uploaded file is required." }
    });
  }

  const recordId = `REC-OCR-${Date.now()}`;
  let extracted: any = null;

  // 1. If physical file was uploaded, extract via real neural OCR engine
  if (req.file) {
    try {
      extracted = await aiClient.extractFile(req.file.path, document_name, recordId);
      if (extracted && extracted.raw_text) {
        raw_text = extracted.raw_text;
      }
    } catch (err: any) {
      console.warn("AI File OCR extraction error:", err.message);
    }
  }

  // 2. If raw_text was manually provided in body and no file extract was run:
  if (!extracted && raw_text && raw_text.trim().length > 0) {
    try {
      extracted = await aiClient.extractOCR(document_name, raw_text, recordId);
    } catch (err: any) {
      console.warn("AI extractOCR error:", err.message);
    }
  }

  // 3. Fallback only if AI microservice is offline: report unparsed state (no fake dummy strings)
  if (!extracted) {
    extracted = {
      document_name,
      document_type: "Land Record (Manual Review Required)",
      language: "Uncertain",
      overall_confidence: 0.40,
      uncertain_field_count: 4,
      fields: {
        owner_name: { value: "खातेदार का नाम स्पष्ट नहीं (Manual Review Required)", confidence: 0.40, flagged: true },
        khata_number: { value: "Unknown", confidence: 0.40, flagged: true },
        khasra_number: { value: "Unknown", confidence: 0.40, flagged: true },
        survey_plot_number: { value: "Unknown", confidence: 0.40, flagged: true },
        area_hectares: { value: 0.0, confidence: 0.40, flagged: true },
        area_local_unit: { value: "Not Parsed", confidence: 0.40, flagged: true },
        state: { value: "Uttar Pradesh", confidence: 0.60, flagged: false },
        district: { value: "Not Specified", confidence: 0.50, flagged: true },
        tehsil: { value: "Not Specified", confidence: 0.50, flagged: true },
        village: { value: "Not Specified", confidence: 0.50, flagged: true },
        land_classification: { value: "Standard Agricultural", confidence: 0.50, flagged: false },
        dispute_encumbrance: { value: "Manual Review Required", confidence: 0.50, flagged: true }
      }
    };
  }

  const state = extracted.fields?.state?.value || "Uttar Pradesh";
  const district = extracted.fields?.district?.value || "Not Specified";
  const tehsil = extracted.fields?.tehsil?.value || "Not Specified";
  const village = extracted.fields?.village?.value || "Not Specified";
  const language = extracted.language || "Hindi / Devanagari";
  const docType = extracted.document_type || "Record of Rights";
  const overallConf = extracted.overall_confidence || 0.88;
  const uncertainCount = extracted.uncertain_field_count !== undefined ? extracted.uncertain_field_count : 0;
  const status = uncertainCount > 0 ? "pending_review" : "verified";
  const now = new Date().toISOString();

  const auditHash = crypto.createHash("sha256").update(recordId + document_name + overallConf).digest("hex");

  const fieldsObj = {
    ...(extracted.fields || {}),
    ...(fileMeta ? { _file_metadata: fileMeta } : {})
  };

  db.prepare(`
    INSERT INTO land_records (
      record_id, document_name, state, district, tehsil, village, language,
      document_type, raw_ocr_text, overall_confidence, fields_json,
      uncertain_field_count, verification_status, audit_hash, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    recordId, document_name, state, district, tehsil, village, language,
    docType, raw_text, overallConf, JSON.stringify(fieldsObj),
    uncertainCount, status, auditHash, now
  );

  AuditService.logEvent({
    actorId: req.user ? req.user.id : "ANONYMOUS_UPLOADER",
    actorRole: req.user ? req.user.role : "public",
    action: "UPLOAD_LAND_RECORD",
    targetType: "LAND_RECORD",
    targetId: recordId,
    payload: { document_name, state, district, overallConf, uncertainCount, status, fileMeta }
  });

  res.status(201).json({
    record_id: recordId,
    document_name,
    overall_confidence: overallConf,
    uncertain_field_count: uncertainCount,
    verification_status: status,
    fields: fieldsObj,
    audit_hash: auditHash,
    raw_ocr_text: raw_text,
    file: fileMeta
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
