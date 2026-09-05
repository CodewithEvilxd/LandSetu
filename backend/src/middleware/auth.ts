import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export interface AuthenticatedUser {
  id: string;
  username: string;
  role: "public" | "researcher" | "official" | "admin";
  fullName: string;
  department?: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
    }
  }
}

import "dotenv/config";

const rawJwtSecret = process.env.JWT_SECRET || "landsetu_national_land_governance_jwt_secret_production_2026";
if (!process.env.JWT_SECRET) {
  console.warn("⚠️ Notice: JWT_SECRET environment variable not provided. Using default system secret.");
}
const JWT_SECRET: string = rawJwtSecret;

export function generateToken(user: AuthenticatedUser): string {
  return jwt.sign(user, JWT_SECRET, { expiresIn: "24h" });
}

export function optionalAuth(req: Request, _res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.substring(7);
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as unknown as AuthenticatedUser;
      req.user = decoded;
    } catch {
      // Ignore expired/invalid token in optional auth
    }
  }
  next();
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      error: {
        code: "UNAUTHORIZED",
        message: "Missing or malformed Authorization header with Bearer token.",
        requestId: req.headers["x-request-id"] || "req-" + Date.now()
      }
    });
  }

  const token = authHeader.substring(7);
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as unknown as AuthenticatedUser;
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({
      error: {
        code: "INVALID_TOKEN",
        message: "Session token is expired or invalid. Please re-authenticate.",
        requestId: req.headers["x-request-id"] || "req-" + Date.now()
      }
    });
  }
}

export function requireRole(allowedRoles: Array<"public" | "researcher" | "official" | "admin">) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        error: {
          code: "UNAUTHORIZED",
          message: "Authentication required to perform this action.",
          requestId: req.headers["x-request-id"] || "req-" + Date.now()
        }
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        error: {
          code: "FORBIDDEN",
          message: `Forbidden: role '${req.user.role}' is not authorized for this operation. Required one of: [${allowedRoles.join(", ")}].`,
          requestId: req.headers["x-request-id"] || "req-" + Date.now()
        }
      });
    }

    next();
  };
}
