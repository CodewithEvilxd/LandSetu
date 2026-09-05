import express from "express";
import cors from "cors";
import path from "node:path";
import { requestLogger } from "./middleware/logger.js";
import { errorHandler } from "./middleware/errorHandler.js";
import { optionalAuth } from "./middleware/auth.js";
import { initDatabase } from "./db/database.js";
import { aiClient } from "./services/aiClient.js";

// Import modular domain routers
import authRoutes from "./modules/auth/authRoutes.js";
import sourcesRoutes from "./modules/sources/sourcesRoutes.js";
import repositoryRoutes from "./modules/repository/repositoryRoutes.js";
import searchRoutes from "./modules/search/searchRoutes.js";
import askRoutes from "./modules/ask/askRoutes.js";
import gisRoutes from "./modules/gis/gisRoutes.js";
import policyRoutes from "./modules/policy-lab/policyRoutes.js";
import recordsRoutes from "./modules/land-records/recordsRoutes.js";
import acquisitionRoutes from "./modules/acquisition/acquisitionRoutes.js";
import riskRoutes from "./modules/risk/riskRoutes.js";
import workspaceRoutes from "./modules/workspaces/workspaceRoutes.js";
import innovationRoutes from "./modules/innovation/innovationRoutes.js";
import auditRoutes from "./modules/audit/auditRoutes.js";
import reportingRoutes from "./modules/reporting/reportingRoutes.js";
import khasraMapRoutes from "./modules/khasra-map/khasraMapRoutes.js";

export function createApp() {
  initDatabase();

  const app = express();

  app.use(cors());
  app.use(express.json({ limit: "10mb" }));
  app.use(express.urlencoded({ extended: true }));
  app.use("/uploads", express.static(path.resolve(process.cwd(), "uploads")));
  app.use(requestLogger);
  app.use(optionalAuth);

  // Favicon handler
  app.get("/favicon.ico", (_req, res) => {
    res.status(204).end();
  });

  // Root API Landing endpoint
  app.get("/", (_req, res) => {
    res.json({
      name: "LandSetu (भू-सेतु) Backend API",
      status: "online",
      frontend_ui: "http://localhost:3000",
      health_check: "http://localhost:5000/health",
      api_base: "/api/v1",
      endpoints: {
        dashboard: "/api/v1/dashboard/overview",
        khasra_map: "/api/v1/khasra-map/parcels",
        ask_assistant: "/api/v1/ask/query",
        policy_lab: "/api/v1/policy/scenarios",
        predictive_risk: "/api/v1/risk/predict",
        audit_ledger: "/api/v1/audit/events"
      },
      message: "To view the user interface, open http://localhost:3000 in your browser."
    });
  });

  // Chrome devtools probe handler
  app.get("/.well-known/appspecific/com.chrome.devtools.json", (_req, res) => {
    res.json({});
  });

  // Health check endpoint
  app.get("/health", async (_req, res) => {
    const aiHealth = await aiClient.getHealth();
    res.json({
      status: "healthy",
      service: "LandSetu Unified Backend API",
      version: "1.0.0",
      architecture: "Node.js (v24) + TypeScript + SQLite + Python AI Agent",
      ai_service: aiHealth,
      timestamp: new Date().toISOString()
    });
  });

  // API v1 Domain Modules
  app.use("/api/v1/auth", authRoutes);
  app.use("/api/v1/sources", sourcesRoutes);
  app.use("/api/v1/repository", repositoryRoutes);
  app.use("/api/v1/search", searchRoutes);
  app.use("/api/v1/ask", askRoutes);
  app.use("/api/v1/geo", gisRoutes);
  app.use("/api/v1/khasra-map", khasraMapRoutes);
  app.use("/api/v1/khasra", khasraMapRoutes);
  app.use("/api/v1/policy", policyRoutes);
  app.use("/api/v1/records", recordsRoutes);
  app.use("/api/v1/acquisitions", acquisitionRoutes);
  app.use("/api/v1/risk", riskRoutes);
  app.use("/api/v1/workspaces", workspaceRoutes);
  app.use("/api/v1/innovation", innovationRoutes);
  app.use("/api/v1/audit", auditRoutes);
  app.use("/api/v1/dashboard", reportingRoutes);
  app.use("/api/v1/reporting", reportingRoutes);


  // Error handling middleware
  app.use(errorHandler);

  return app;
}
