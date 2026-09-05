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

  try {
    const result = await aiClient.ask(query, { jurisdiction, documentType });
    res.json(result);
  } catch (err: any) {
    console.warn("[AskRoutes] Uncaught exception in ask endpoint, activating local statutory fallback:", err.message);
    const fallback = aiClient.localStatutoryAsk(query, { jurisdiction, documentType });
    res.json(fallback);
  }
});

export default router;
