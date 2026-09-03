import re
from typing import List, Dict, Any, Set

def validate_citations(response_text: str, retrieved_chunks: List[Dict[str, Any]]) -> Dict[str, Any]:
    allowed_doc_ids = {c.get("document_id") for c in retrieved_chunks if c.get("document_id")}
    
    # Matches patterns like [DOC-RFCTLARR-2013] or [DOC-DILRMP-GUIDELINES: Section 11]
    matches = re.findall(r"\[(DOC-[A-Z0-9\-_]+)(?::[^\]]+)?\]", response_text)
    cited_doc_ids = set(matches)
    
    grounded = []
    hallucinated = []
    warnings = []
    
    for doc_id in cited_doc_ids:
        if doc_id in allowed_doc_ids:
            grounded.append(doc_id)
        else:
            hallucinated.append(doc_id)
            warnings.append(f"Cited document '{doc_id}' was not found in the retrieved evidence context.")
            
    if not cited_doc_ids and retrieved_chunks:
        warnings.append("Answer does not explicitly include formatted [DOC-...] citation tags.")
        
    coverage = len(grounded) / len(cited_doc_ids) if cited_doc_ids else (0.5 if retrieved_chunks else 1.0)
    
    return {
        "is_valid": len(hallucinated) == 0,
        "cited_document_ids": list(cited_doc_ids),
        "grounded_document_ids": grounded,
        "hallucinated_document_ids": hallucinated,
        "coverage_ratio": round(coverage, 2),
        "warnings": warnings
    }
