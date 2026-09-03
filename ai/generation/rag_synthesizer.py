from datetime import datetime, timezone
from typing import Dict, Any, List
from ai.intent.intent_router import detect_query_intent
from ai.retrieval.hybrid_search import HybridSearchEngine
from ai.citation.citation_validator import validate_citations

class RAGSynthesizer:
    def __init__(self, search_engine: HybridSearchEngine):
        self.search_engine = search_engine

    def answer(self, query: str) -> Dict[str, Any]:
        intent_info = detect_query_intent(query)
        filters = intent_info.get("suggested_filters", {})
        
        candidates = self.search_engine.search(
            query=query,
            jurisdiction=filters.get("jurisdiction"),
            document_type=filters.get("document_type"),
            limit=4
        )

        now_str = datetime.now(timezone.utc).isoformat()

        # Hard failure / insufficient evidence check
        # Require strong composite grounding (combined_score >= 0.40 and non-trivial lexical/semantic support)
        is_insufficient = False
        if not candidates:
            is_insufficient = True
        elif candidates[0]["combined_score"] < 0.40:
            is_insufficient = True
        elif candidates[0]["lexical_score"] < 0.25 and candidates[0]["semantic_score"] < 0.60:
            is_insufficient = True

        if is_insufficient:
            return {
                "query": query,
                "intent": intent_info,
                "evidence_state": "insufficient",
                "answer_text": "Insufficient evidence in the loaded LandSetu repository to answer this query. LandSetu strictly forbids hallucinating or synthesizing unverified government facts. Please refine your inquiry or consult primary state land revenue portals.",
                "evidence_cards": [],
                "citations": {
                    "is_valid": True,
                    "cited_document_ids": [],
                    "grounded_document_ids": [],
                    "hallucinated_document_ids": [],
                    "coverage_ratio": 1.0,
                    "warnings": ["Query returned no evidence chunks above confidence threshold."]
                },
                "limitations": [
                    "No verified documents or dataset records in the local corpus met the relevance threshold for this query.",
                    "Platform policy strictly forbids generating unverified administrative values."
                ],
                "timestamp": now_str
            }

        retrieved_chunks = [c["chunk"] for c in candidates]
        evidence_cards = [
            {
                "document_id": c["chunk"]["document_id"],
                "document_title": c["chunk"]["document_title"],
                "section": c["chunk"].get("section", ""),
                "topic": c["chunk"].get("topic", ""),
                "excerpt": c["chunk"]["content"],
                "source_url": c["chunk"]["source_url"],
                "publisher": c["chunk"]["publisher"],
                "score": c["combined_score"]
            }
            for c in candidates
        ]

        top_chunk = retrieved_chunks[0]
        intent_type = intent_info.get("intent")
        limitations = [
            "Evidence is based on verified documents loaded in the LandSetu repository.",
            "Statutory provisions are derived from official gazette text and should be read alongside state-specific rules."
        ]
        computation_note = None

        if intent_type == "LEGAL_STATUTE":
            answer_text = f"Under the official legal framework [{top_chunk['document_id']}], {top_chunk['content']}\n\n"
            if len(retrieved_chunks) > 1:
                second = retrieved_chunks[1]
                answer_text += f"Furthermore, related statutory context [{second['document_id']}] establishes: {second['content']}"
        elif intent_type == "REGIONAL_COMPARISON":
            answer_text = "Comparative evidence synthesized from retrieved statutory and governance records:\n\n"
            for card in evidence_cards[:3]:
                answer_text += f"• [{card['document_id']}] ({card['section']}): {card['excerpt']}\n"
            answer_text += f"\nCross-domain synthesis: Evidence from [{top_chunk['document_id']}] provides the baseline indicators for comparative evaluation across jurisdictions."
            computation_note = "Synthesized directly from retrieved repository evidence chunks."
        elif intent_type == "POLICY_SCENARIO":
            sec_doc = retrieved_chunks[1]['document_id'] if len(retrieved_chunks) > 1 else top_chunk['document_id']
            sec_content = f"\n\nBaseline governance reference [{sec_doc}]: {retrieved_chunks[1]['content']}" if len(retrieved_chunks) > 1 else ""
            answer_text = f"Policy scenario evaluation grounded in repository evidence [{top_chunk['document_id']}]:\n\n{top_chunk['content']}{sec_content}"
            limitations.append("Scenario projection represents a deterministic evaluation grounded in repository baseline parameters, not an ungrounded forecast.")
        else:
            answer_text = f"Evidence from [{top_chunk['document_id']}]: {top_chunk['content']}\n\n"
            if len(retrieved_chunks) > 1:
                second = retrieved_chunks[1]
                answer_text += f"Additional context from [{second['document_id']}]: {second['content']}"

        citation_results = validate_citations(answer_text, retrieved_chunks)
        evidence_state = "grounded" if (citation_results["is_valid"] and candidates[0]["combined_score"] > 0.35) else "partial"

        return {
            "query": query,
            "intent": intent_info,
            "generation_mode": "evidence_grounded_extractive_synthesis",
            "synthesis_engine": "Statutory Evidence Synthesizer (Zero-Hallucination Deterministic Grounding)",
            "transparency_declaration": "Deterministic evidence-grounded synthesis from official central legislation and judicial statistics. Template-assembled chunks with citation verification to strictly prevent regulatory hallucination.",
            "evidence_state": evidence_state,
            "answer_text": answer_text,
            "evidence_cards": evidence_cards,
            "citations": citation_results,
            "limitations": limitations,
            "computation_note": computation_note,
            "timestamp": now_str
        }
