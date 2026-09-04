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
    res.status(503).json({
      error: {
        code: "AI_SERVICE_UNAVAILABLE",
        message: err.message || "LandSetu Python AI microservice is unreachable on port 5001."
      },
      evidence_state: "insufficient",
      answer_text: "Grounded statutory synthesis could not be completed because the LandSetu Python AI microservice on port 5001 is offline or unreachable. No speculative or ungrounded answers are returned.",
      evidence_cards: [],
      citations: {
        is_valid: false,
        cited_document_ids: [],
        grounded_document_ids: [],
        hallucinated_document_ids: [],
        coverage_ratio: 0.0,
        warnings: ["AI_SERVICE_UNAVAILABLE"]
      }
    });
  }
});

export default router;
