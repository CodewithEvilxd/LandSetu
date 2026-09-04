import json
import os
import re
from typing import List, Dict, Any, Optional
from ai.embeddings.embedder import generate_embedding, cosine_similarity

STOPWORDS = {
    "a", "an", "the", "and", "or", "but", "if", "because", "as", "what",
    "which", "who", "whom", "this", "that", "these", "those", "am", "is",
    "are", "was", "were", "be", "been", "being", "have", "has", "had",
    "having", "do", "does", "did", "doing", "would", "should", "could",
    "ought", "i", "you", "he", "she", "it", "we", "they", "its", "their",
    "of", "at", "by", "for", "with", "about", "against", "between", "into",
    "through", "during", "before", "after", "above", "below", "to", "from",
    "up", "down", "in", "out", "on", "off", "over", "under", "again", "further",
    "then", "once", "here", "there", "when", "where", "why", "how", "all",
    "any", "both", "each", "few", "more", "most", "other", "some", "such",
    "no", "nor", "not", "only", "own", "same", "so", "than", "too", "very"
}

class HybridSearchEngine:
    def __init__(self, chunks_path: str = "backend/data/processed/document_chunks.json"):
        if not os.path.exists(chunks_path) and os.path.exists("data/processed/document_chunks.json"):
            chunks_path = "data/processed/document_chunks.json"

        self.chunks: List[Dict[str, Any]] = []
        if os.path.exists(chunks_path):
            with open(chunks_path, "r", encoding="utf-8") as f:
                raw_chunks = json.load(f)
                for c in raw_chunks:
                    c["embedding"] = generate_embedding(c["content"])
                    self.chunks.append(c)

        # Also load unified ai_corpus.json if available
        corpus_candidates = [
            "backend/data/processed/ai_corpus.json",
            "data/processed/ai_corpus.json"
        ]
        for c_path in corpus_candidates:
            if os.path.exists(c_path):
                with open(c_path, "r", encoding="utf-8") as f:
                    corpus_items = json.load(f)
                    for item in corpus_items:
                        # Avoid duplicate chunks already loaded
                        if any(existing.get("chunk_id") == item["id"] for existing in self.chunks):
                            continue
                        self.chunks.append({
                            "chunk_id": item["id"],
                            "document_title": item.get("title", ""),
                            "section": item.get("metadata", {}).get("native_identifier", ""),
                            "content": item["text"],
                            "jurisdiction": item.get("metadata", {}).get("jurisdiction", item.get("metadata", {}).get("state", "All India")),
                            "publisher": item.get("metadata", {}).get("publisher", "Government Records"),
                            "source_url": item.get("metadata", {}).get("source_url", "http://official-records.gov.in"),
                            "document_type": item.get("type", "General"),
                            "embedding": generate_embedding(item["text"])
                        })
                break


    def search(
        self,
        query: str,
        jurisdiction: Optional[str] = None,
        document_type: Optional[str] = None,
        limit: int = 5
    ) -> List[Dict[str, Any]]:
        if not query or not query.strip():
            return []

        query_embedding = generate_embedding(query)
        normalized_query = re.sub(r"[^a-z0-9\s]", " ", query.lower())
        raw_tokens = [t for t in normalized_query.split() if (len(t) > 2 or t.isdigit())]
        query_tokens = [t for t in raw_tokens if t not in STOPWORDS]

        candidates = []

        for chunk in self.chunks:
            chunk_jurisdiction = chunk.get("jurisdiction", "").lower()
            if jurisdiction:
                j_lower = jurisdiction.lower()
                if (j_lower not in chunk_jurisdiction and 
                    "all india" not in chunk_jurisdiction and 
                    "national" not in chunk_jurisdiction):
                    continue

            if document_type and document_type.lower() not in chunk.get("document_type", "").lower():
                continue

            content_lower = chunk["content"].lower()
            title_lower = chunk.get("document_title", "").lower()

            lexical_hits = 0
            match_reasons = []
            for token in query_tokens:
                if token in content_lower:
                    lexical_hits += 1
                    match_reasons.append(f"matched '{token}'")
                if token in title_lower:
                    lexical_hits += 1.5

            lexical_score = min(1.0, lexical_hits / len(query_tokens)) if query_tokens else 0.0
            semantic_score = cosine_similarity(query_embedding, chunk.get("embedding", []))

            # If there were search query tokens but zero non-stopword hits, penalize semantic score
            if query_tokens and lexical_hits == 0:
                semantic_score *= 0.35

            # Hybrid score: 0.55 semantic + 0.45 lexical
            combined_score = (semantic_score * 0.55) + (lexical_score * 0.45)

            if combined_score > 0.18 or lexical_hits > 0:
                candidates.append({
                    "chunk": {
                        "chunk_id": chunk.get("chunk_id", ""),
                        "document_id": chunk.get("document_id", chunk.get("chunk_id", "")),
                        "document_title": chunk.get("document_title", ""),
                        "section": chunk.get("section", ""),
                        "topic": chunk.get("topic", ""),
                        "content": chunk["content"],
                        "jurisdiction": chunk.get("jurisdiction", ""),
                        "publisher": chunk.get("publisher", ""),
                        "source_url": chunk.get("source_url", ""),
                        "document_type": chunk.get("document_type", ""),
                        "content_hash": chunk.get("content_hash", "")
                    },
                    "lexical_score": round(lexical_score, 4),
                    "semantic_score": round(semantic_score, 4),
                    "combined_score": round(combined_score, 4),
                    "match_reasons": match_reasons[:3]
                })

        candidates.sort(key=lambda x: x["combined_score"], reverse=True)
        return candidates[:limit]
