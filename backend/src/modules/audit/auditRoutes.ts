import { Router, Request, Response } from "express";
import { AuditService } from "./auditService.js";
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

export default router;
