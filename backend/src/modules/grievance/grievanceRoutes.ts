import express from "express";
import { db } from "../../db/database";
import { StateSyncService } from "../../services/stateSyncService";

export const grievanceRouter = express.Router();

// Get all grievances
grievanceRouter.get("/", (req, res) => {
  try {
    const grievances = db.prepare("SELECT * FROM grievances ORDER BY created_at DESC").all();
    res.json(grievances);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch grievances" });
  }
});

// Submit a new grievance
grievanceRouter.post("/", (req, res) => {
  const { submitter_name, contact_info, state, district, village, complaint_type, description } = req.body;
  
  if (!submitter_name || !complaint_type || !description) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  // Very basic mock of AI delay prediction for the new record
  const predicted_delay_months = (Math.random() * 12 + 2).toFixed(1);
  const risk_score = (Math.random() * 40 + 20).toFixed(1);

  const grievanceId = `GRV-${Date.now()}`;
  const timestamp = new Date().toISOString();

  try {
    db.prepare(`
      INSERT INTO grievances (
        grievance_id, submitter_name, contact_info, state, district, village, 
        complaint_type, description, predicted_delay_months, risk_score, status, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'PENDING', ?)
    `).run(
      grievanceId, submitter_name, contact_info || "", state || "Unknown", district || "Unknown", 
      village || "Unknown", complaint_type, description, predicted_delay_months, risk_score, timestamp
    );

    res.status(201).json({ 
      status: "success", 
      grievance_id: grievanceId,
      message: "Grievance submitted successfully",
      predicted_delay: predicted_delay_months
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to submit grievance" });
  }
});

// Real-Time Sync trigger route
grievanceRouter.post("/sync", async (req, res) => {
  const { state, district, limit } = req.body;
  try {
    const result = await StateSyncService.syncRecords(state || "Uttar Pradesh", district || "Gautam Buddha Nagar", limit || 20);
    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "State Sync Failed" });
  }
});

grievanceRouter.get("/sync/cache", (req, res) => {
  try {
    const records = db.prepare("SELECT * FROM state_records_cache ORDER BY synced_at DESC LIMIT 50").all();
    res.json(records);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch cached records" });
  }
});
