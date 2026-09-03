import { Request, Response, NextFunction } from "express";
import crypto from "node:crypto";

export function requestLogger(req: Request, res: Response, next: NextFunction) {
  const start = Date.now();
  const requestId = (req.headers["x-request-id"] as string) || `req-${crypto.randomBytes(6).toString("hex")}`;
  req.headers["x-request-id"] = requestId;
  res.setHeader("X-Request-ID", requestId);

  res.on("finish", () => {
    const duration = Date.now() - start;
    const actor = req.user ? `${req.user.username}(${req.user.role})` : "anonymous";
    console.log(`[${requestId}] ${req.method} ${req.originalUrl} -> ${res.statusCode} (${duration}ms) [${actor}]`);
  });

  next();
}
