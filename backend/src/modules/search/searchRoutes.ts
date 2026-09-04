import { Router, Request, Response } from "express";
import { db } from "../../db/database.js";
import { aiClient } from "../../services/aiClient.js";

const router = Router();

router.post("/", async (req: Request, res: Response) => {
  const { query, jurisdiction, documentType, limit = 10 } = req.body;
  if (!query || query.trim().length === 0) {
    return res.json({ results: [], count: 0, search_engine: "unified_ai_hybrid_search" });
  }

  // 1. Primary Unified Engine: Call Python AI HybridSearchEngine microservice
  try {
    const aiResults = await aiClient.search(query, { jurisdiction, documentType, limit });
    const normalized = aiResults.map((r: any) => {
      const c = r.chunk || r;
      return {
        chunk_id: c.chunk_id,
        document_id: c.document_id,
        document_title: c.document_title,
        section: c.section || "",
        topic: c.topic || "",
        content: c.content || "",
        jurisdiction: c.jurisdiction || "",
        publisher: c.publisher || "",
        source_url: c.source_url || "",
        document_type: c.document_type || "",
        relevance_score: r.combined_score ?? r.relevance_score ?? 1.0,
        lexical_score: r.lexical_score,
        semantic_score: r.semantic_score,
        match_reasons: r.match_reasons
      };
    });

    return res.json({
      query,
      results: normalized,
      count: normalized.length,
      search_engine: "unified_ai_hybrid_search",
      methodology: "Hybrid Lexical + Deterministic Multilingual Domain Vectorizer (Unified with RAG)"
    });
  } catch (err: any) {
    // 2. Transparent Offline Fallback: If AI microservice is offline, execute SQLite lexical matching
    console.warn(`[Search] AI service offline, using SQLite fallback: ${err.message}`);

    const terms = query.toLowerCase().replace(/[^a-z0-9\s]/g, " ").split(/\s+/).filter((t: string) => t.length > 2);
    let sql = "SELECT * FROM document_chunks WHERE 1=1";
    const params: any[] = [];

    if (jurisdiction) {
      sql += " AND jurisdiction LIKE ?";
      params.push(`%${jurisdiction}%`);
    }
    if (documentType) {
      sql += " AND document_type LIKE ?";
      params.push(`%${documentType}%`);
    }

    const allChunks = db.prepare(sql).all(...params) as any[];

    const scored = allChunks.map(c => {
      let score = 0;
      const content = c.content.toLowerCase();
      const title = c.document_title.toLowerCase();
      for (const t of terms) {
        if (content.includes(t)) score += 1.0;
        if (title.includes(t)) score += 1.5;
      }
      return {
        chunk_id: c.chunk_id,
        document_id: c.document_id,
        document_title: c.document_title,
        section: c.section,
        topic: c.topic,
        content: c.content,
        jurisdiction: c.jurisdiction,
        publisher: c.publisher,
        source_url: c.source_url,
        document_type: c.document_type,
        relevance_score: Math.round(score * 100) / 100
      };
    });

    scored.sort((a, b) => b.relevance_score - a.relevance_score);
    const results = scored.slice(0, limit);

    return res.json({
      query,
      results,
      count: results.length,
      search_engine: "sqlite_lexical_fallback",
      methodology: "Local Lexical Substring Scoring (Offline Resilience Only)"
    });
  }
});

router.get("/recommendations", (_req: Request, res: Response) => {
  res.json({
    sample_queries: [
      "What is the statutory period under Section 23 of the LARR Act 2013 for the Collector to make an award before proceedings lapse?",
      "Explain the Social Impact Assessment consultation requirements under Section 4 of LARR Act 2013.",
      "What is ULPIN or Bhu-Aadhaar and what standard is it based on?",
      "What percentage of civil cases in district courts represent land and property disputes according to NJDG data?",
      "Compare cadastral map digitization progress between Uttar Pradesh and Maharashtra."
    ]
  });
});

export default router;
