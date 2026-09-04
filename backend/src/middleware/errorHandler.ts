import { Request, Response, NextFunction } from "express";

export function errorHandler(err: any, req: Request, res: Response, _next: NextFunction) {
  const requestId = (req.headers["x-request-id"] as string) || `req-${Date.now()}`;
  let statusCode = err.statusCode || 500;
  let errorCode = err.code || "INTERNAL_SERVER_ERROR";
  let message = err.message || "An unexpected error occurred while processing the request.";

  if (message.includes("AI_SERVICE_UNAVAILABLE") || message.includes("ECONNREFUSED") || message.includes("unreachable on")) {
    statusCode = 503;
    errorCode = "AI_SERVICE_UNAVAILABLE";
    message = "LandSetu AI Microservice (port 5001) is currently offline or unreachable. Please start it with start_all.bat or 'python -m uvicorn ai.server:app --port 5001'.";
  }

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
