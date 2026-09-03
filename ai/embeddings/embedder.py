import re
import numpy as np
from typing import List

EMBEDDING_DIM = 128

DOMAIN_KEYWORDS = {
    "acquisition": 1.5,
    "compensation": 1.5,
    "solatium": 2.0,
    "rehabilitation": 1.6,
    "resettlement": 1.6,
    "khasra": 1.8,
    "khata": 1.8,
    "khatauni": 2.0,
    "cadastral": 1.7,
    "dilrmp": 2.0,
    "ulpin": 2.0,
    "bhu-aadhaar": 2.0,
    "mutation": 1.6,
    "dispute": 1.4,
    "litigation": 1.5,
    "pendency": 1.5,
    "njdg": 1.8,
    "bhuvan": 1.8,
    "watershed": 1.6,
    "satellite": 1.4,
    "ndvi": 1.6,
    "srishti": 1.8,
    "drishti": 1.8,
    "presumptive": 1.7,
    "conclusive": 1.8,
    "titling": 1.6,
    "section": 1.3,
    "delay": 1.4,
    "possession": 1.5,
    "award": 1.5,
    "collector": 1.3
}

def _hash_string(s: str, seed: int) -> int:
    h = seed
    for char in s:
        h = (h * 31 + ord(char)) & 0xFFFFFFFF
    return h

def generate_embedding(text: str) -> List[float]:
    vec = np.zeros(EMBEDDING_DIM, dtype=np.float64)
    if not text or not text.strip():
        return vec.tolist()

    normalized = re.sub(r"[^a-z0-9\s]", " ", text.lower())
    tokens = [t for t in normalized.split() if len(t) > 1]

    for token in tokens:
        weight = DOMAIN_KEYWORDS.get(token, 1.0)
        idx1 = _hash_string(token, 17) % EMBEDDING_DIM
        idx2 = _hash_string(token, 31) % EMBEDDING_DIM
        sign1 = 1.0 if (_hash_string(token, 43) % 2 == 0) else -1.0
        sign2 = 1.0 if (_hash_string(token, 59) % 2 == 0) else -1.0

        vec[idx1] += weight * sign1
        vec[idx2] += (weight * 0.5) * sign2

        if len(token) >= 3:
            for i in range(len(token) - 2):
                trigram = token[i:i+3]
                sub_idx = _hash_string(trigram, 71) % EMBEDDING_DIM
                vec[sub_idx] += 0.3

    norm = np.linalg.norm(vec)
    if norm > 0:
        vec /= norm

    return [float(x) for x in vec]

def cosine_similarity(vec_a: List[float], vec_b: List[float]) -> float:
    a = np.array(vec_a, dtype=np.float64)
    b = np.array(vec_b, dtype=np.float64)
    dot = np.dot(a, b)
    return float(np.clip(dot, 0.0, 1.0))
