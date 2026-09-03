import { Router, Request, Response } from "express";
import { aiClient } from "../../services/aiClient.js";

const router = Router();

router.post("/", async (req: Request, res: Response) => {
  const { query, jurisdiction, documentType } = req.body;
  if (!query || query.trim().length === 0) {
    return res.status(400).json({
      error: { code: "EMPTY_QUERY", message: "Query string cannot be empty." }
    });
  }

  const result = await aiClient.ask(query, { jurisdiction, documentType });
  res.json(result);
});

export default router;
