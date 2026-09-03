import { Request, Response, NextFunction } from "express";

export function errorHandler(err: any, req: Request, res: Response, _next: NextFunction) {
  const requestId = (req.headers["x-request-id"] as string) || `req-${Date.now()}`;
  const statusCode = err.statusCode || 500;
  const errorCode = err.code || "INTERNAL_SERVER_ERROR";
  const message = err.message || "An unexpected error occurred while processing the request.";

  console.error(`[${requestId}] Error:`, err);

  res.status(statusCode).json({
    error: {
      code: errorCode,
      message,
      requestId,
      details: process.env.NODE_ENV === "development" ? err.stack : undefined
    }
  });
}
