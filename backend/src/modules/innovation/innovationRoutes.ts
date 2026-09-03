import { Router, Request, Response } from "express";
import { db } from "../../db/database.js";
import { requireAuth, requireRole } from "../../middleware/auth.js";
import { AuditService } from "../audit/auditService.js";

const router = Router();

router.get("/challenges", (req: Request, res: Response) => {
  const { theme, status } = req.query;
  let sql = "SELECT * FROM innovation_challenges WHERE 1=1";
  const params: any[] = [];
  if (theme) {
    sql += " AND theme LIKE ?";
    params.push(`%${theme}%`);
  }
  if (status) {
    sql += " AND status = ?";
    params.push(status);
  }

  sql += " ORDER BY created_at DESC";
  const list = db.prepare(sql).all(...params);
  res.json({ challenges: list, count: list.length });
});

router.post("/challenges", requireAuth, requireRole(["admin"]), (req: Request, res: Response) => {
  const { title, theme, description, eligibility, prize_pool, deadline } = req.body;
  if (!title || !theme || !description) {
    return res.status(400).json({ error: { code: "MISSING_FIELDS", message: "title, theme, and description are required." } });
  }

  const chId = `CHALLENGE-${Date.now()}`;
  const now = new Date().toISOString();

  db.prepare(`
    INSERT INTO innovation_challenges (challenge_id, title, theme, description, eligibility, prize_pool, deadline, status, created_by, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, 'active', ?, ?)
  `).run(chId, title, theme, description, eligibility || "Open to all", prize_pool || "Grant Award", deadline || "2026-12-31", req.user!.username, now);

  AuditService.logEvent({
    actorId: req.user!.id,
    actorRole: req.user!.role,
    action: "CREATE_INNOVATION_CHALLENGE",
    targetType: "INNOVATION_CHALLENGE",
    targetId: chId,
    payload: { title, theme, created_by: req.user!.username }
  });

  res.status(201).json({
    challenge_id: chId,
    title,
    theme,
    status: "active",
    created_at: now
  });
});

export default router;
