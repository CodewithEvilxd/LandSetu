import { Router, Request, Response } from "express";
import { AuditService } from "./auditService.js";
import { db } from "../../db/database.js";
import { requireAuth, requireRole } from "../../middleware/auth.js";

const router = Router();

router.get("/events", (req: Request, res: Response) => {
  const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 50;
  const events = AuditService.getEvents(limit);
  res.json({ events, count: events.length });
});

router.get("/verify", (_req: Request, res: Response) => {
  const result = AuditService.verifyChain();
  res.json(result);
});

router.get("/archived-storage", (_req: Request, res: Response) => {
  try {
    const objects = db.prepare("SELECT * FROM storage_objects ORDER BY created_at DESC").all();
    const stats = db.prepare("SELECT COUNT(*) as count, SUM(size_bytes) as total_bytes FROM storage_objects WHERE archive_status = 'archived'").get() as any;
    res.json({
      objects,
      count: objects.length,
      total_archived_bytes: stats?.total_bytes || 0,
      archive_target: "Telegram Private Sovereign Vault"
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
