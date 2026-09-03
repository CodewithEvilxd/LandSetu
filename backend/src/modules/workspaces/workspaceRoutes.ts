import { Router, Request, Response } from "express";
import crypto from "node:crypto";
import { db } from "../../db/database.js";
import { requireAuth, requireRole } from "../../middleware/auth.js";
import { AuditService } from "../audit/auditService.js";

const router = Router();

router.get("/", requireAuth, requireRole(["researcher", "official", "admin"]), (req: Request, res: Response) => {
  const list = db.prepare("SELECT * FROM workspaces WHERE created_by = ? OR created_by = 'SYSTEM'").all(req.user!.username) as any[];
  res.json({ workspaces: list, count: list.length });
});

router.post("/", requireAuth, requireRole(["researcher", "official", "admin"]), (req: Request, res: Response) => {
  const { title, description } = req.body;
  if (!title) {
    return res.status(400).json({ error: { code: "MISSING_TITLE", message: "Workspace title is required." } });
  }

  const wsId = `WS-${Date.now()}`;
  const now = new Date().toISOString();

  db.prepare(`
    INSERT INTO workspaces (workspace_id, title, description, created_by, created_at)
    VALUES (?, ?, ?, ?, ?)
  `).run(wsId, title, description || "", req.user!.username, now);

  AuditService.logEvent({
    actorId: req.user!.id,
    actorRole: req.user!.role,
    action: "CREATE_WORKSPACE",
    targetType: "WORKSPACE",
    targetId: wsId,
    payload: { title, created_by: req.user!.username }
  });

  res.status(201).json({
    workspace_id: wsId,
    title,
    description: description || "",
    created_by: req.user!.username,
    created_at: now
  });
});

router.get("/:id", requireAuth, requireRole(["researcher", "official", "admin"]), (req: Request, res: Response) => {
  const id = String(req.params.id);
  const ws = db.prepare("SELECT * FROM workspaces WHERE workspace_id = ?").get(id) as any;
  if (!ws) {
    return res.status(404).json({ error: { code: "WORKSPACE_NOT_FOUND", message: "Workspace not found." } });
  }

  const items = db.prepare("SELECT * FROM workspace_items WHERE workspace_id = ? ORDER BY created_at DESC").all(id);
  res.json({ workspace: ws, items });
});

router.post("/:id/items", requireAuth, requireRole(["researcher", "official", "admin"]), (req: Request, res: Response) => {
  const id = String(req.params.id);
  const { item_type, item_ref_id, title, notes } = req.body;
  if (!item_type || !item_ref_id || !title) {
    return res.status(400).json({ error: { code: "INVALID_ITEM", message: "item_type, item_ref_id, and title are required." } });
  }

  const itemId = `WSI-${Date.now()}`;
  const now = new Date().toISOString();

  db.prepare(`
    INSERT INTO workspace_items (item_id, workspace_id, item_type, item_ref_id, title, notes, added_by, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(itemId, id, item_type, item_ref_id, title, notes || "", req.user!.username, now);

  res.status(201).json({
    item_id: itemId,
    workspace_id: id,
    item_type,
    item_ref_id,
    title,
    notes,
    created_at: now
  });
});

router.delete("/:id/items/:itemId", requireAuth, requireRole(["researcher", "official", "admin"]), (req: Request, res: Response) => {
  const id = String(req.params.id);
  const itemId = String(req.params.itemId);
  db.prepare("DELETE FROM workspace_items WHERE item_id = ? AND workspace_id = ?").run(itemId, id);
  res.json({ message: "Item removed from workspace." });
});

export default router;
