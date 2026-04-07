from __future__ import annotations

from typing import Any

from src.cosine import cosine_similarity
from src.explain import generate_explanation
from src.filters import is_eligible
from src.risk import detect_risks
from src.scoring import confidence_label, final_score


def rank_advisors(user: dict, advisors_df, top_k: int = 3) -> list[dict[str, Any]]:
    matches: list[dict[str, Any]] = []

    for _, row in advisors_df.iterrows():
        advisor = row.to_dict()

        if not is_eligible(user, advisor):
            continue

        cos_sim = cosine_similarity(user, advisor)
        score = final_score(user, advisor, cosine_sim=cos_sim)
        explanation = generate_explanation(user, advisor)
        risks = detect_risks(advisor)

        matches.append(
            {
                "advisor_id": advisor["advisor_id"],
                "firm_name": advisor["firm_name"],
                "state": advisor["state"],
                "zip_code": advisor["zip_code"],
                "fee_model": advisor["fee_model"],
                "fee_pct": advisor["fee_pct"],
                "years_experience": advisor["years_experience"],
                "fiduciary": bool(advisor["fiduciary"]),
                "score": score,
                "confidence": confidence_label(score),
                "why_match": explanation["why_match"],
                "concerns": explanation["concerns"],
                "risks": risks,
                "specialties": advisor["specialties"],
            }
        )

    matches.sort(key=lambda x: x["score"], reverse=True)
    return matches[:top_k]