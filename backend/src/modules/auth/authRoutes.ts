import { Router, Request, Response } from "express";
import crypto from "node:crypto";
import { db } from "../../db/database.js";
import { generateToken, requireAuth, AuthenticatedUser } from "../../middleware/auth.js";
import { AuditService } from "../audit/auditService.js";

const router = Router();

router.post("/login", (req: Request, res: Response) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({
      error: {
        code: "INVALID_CREDENTIALS",
        message: "Username and password are required.",
        requestId: req.headers["x-request-id"]
      }
    });
  }

  const passwordHash = crypto.createHash("sha256").update(password).digest("hex");
  const user = db.prepare("SELECT * FROM users WHERE username = ? AND password_hash = ?").get(username, passwordHash) as any;

  if (!user) {
    return res.status(401).json({
      error: {
        code: "AUTH_FAILED",
        message: "Invalid username or password.",
        requestId: req.headers["x-request-id"]
      }
    });
  }

  const payload: AuthenticatedUser = {
    id: user.id,
    username: user.username,
    role: user.role,
    fullName: user.full_name,
    department: user.department
  };

  const token = generateToken(payload);

  AuditService.logEvent({
    actorId: user.id,
    actorRole: user.role,
    action: "USER_LOGIN",
    targetType: "AUTH_SESSION",
    targetId: user.id,
    payload: { username: user.username, department: user.department }
  });

  res.json({
    token,
    user: payload
  });
});

router.get("/me", requireAuth, (req: Request, res: Response) => {
  res.json({ user: req.user });
});

export default router;
