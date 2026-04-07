"""
cosine.py — Feature-vector cosine similarity between user and advisor profiles.

Encodes both into a binary vector across three feature spaces:
  - Advisor specialties  (8 dims)
  - Client types         (6 dims)
  - Fee models           (7 dims)
Total: 21-dimensional sparse binary vector.

This gives a lightweight similarity signal complementary to the
rule-based scoring, without requiring external embedding models.
"""
from __future__ import annotations

import numpy as np

from src.scoring import USER_TO_ADVISOR_SPECIALTY_MAP

# ── Feature vocabulary ────────────────────────────────────────────────────
_SPECIALTIES = [
    "financial planning",
    "portfolio management",
    "institutional management",
    "retirement",
    "adviser selection",
    "security analysis",
    "market timing",
    "other",
]

_CLIENT_TYPES = [
    "individual",
    "high net worth",
    "institutional",
    "investment company",
    "pension",
    "other institutional",
]

_FEE_MODELS = [
    "aum",
    "flat",
    "hourly",
    "subscription",
    "commission",
    "performance",
    "other",
]

_ALL_FEATURES = _SPECIALTIES + _CLIENT_TYPES + _FEE_MODELS
_IDX: dict[str, int] = {f: i for i, f in enumerate(_ALL_FEATURES)}
_DIM = len(_ALL_FEATURES)  # 21


def _set_bit(vec: np.ndarray, feature: str) -> None:
    idx = _IDX.get(feature.strip().lower())
    if idx is not None:
        vec[idx] = 1.0


def _user_vector(user: dict) -> np.ndarray:
    vec = np.zeros(_DIM)

    # Specialties: map user goal preference → advisor specialty names
    pref = str(user.get("advisor_specialty_preference", "")).strip().lower()
    for spec in USER_TO_ADVISOR_SPECIALTY_MAP.get(pref, set()):
        _set_bit(vec, spec)

    # Client type inferred from savings
    savings = float(user.get("approx_savings", 0))
    _set_bit(vec, "high net worth" if savings >= 1_000_000 else "individual")

    return vec


def _advisor_vector(advisor: dict) -> np.ndarray:
    vec = np.zeros(_DIM)

    for spec in (advisor.get("specialties") or []):
        _set_bit(vec, str(spec))

    for ct in (advisor.get("client_types") or []):
        _set_bit(vec, str(ct))

    _set_bit(vec, str(advisor.get("fee_model", "")))

    return vec


def cosine_similarity(user: dict, advisor: dict) -> float:
    """Return cosine similarity in [0, 1] between user and advisor vectors."""
    u = _user_vector(user)
    a = _advisor_vector(advisor)

    norm_u = np.linalg.norm(u)
    norm_a = np.linalg.norm(a)

    if norm_u == 0.0 or norm_a == 0.0:
        return 0.0

    return float(np.clip(np.dot(u, a) / (norm_u * norm_a), 0.0, 1.0))
