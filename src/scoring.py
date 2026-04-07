from __future__ import annotations

from typing import Iterable


USER_TO_ADVISOR_SPECIALTY_MAP = {
    "tax aware investing": {"financial planning", "portfolio management"},
    "socially conscious investing": {"portfolio management"},
    "retirement planning": {"retirement", "financial planning"},
    "estate planning": {"financial planning"},
    "management of new wealth": {"portfolio management", "financial planning"},
    "tax preparation": {"financial planning"},
    "life insurance": {"financial planning"},
    "divorce planning": {"financial planning"},
    "entrepreneurial wealth management": {"portfolio management", "institutional management"},
    "i don't know": set(),
}


def _normalize_str(value: object) -> str:
    return str(value).strip().lower()


def _normalize_set(values: object) -> set[str]:
    if values is None:
        return set()
    if isinstance(values, str):
        return {_normalize_str(values)} if values.strip() else set()
    if isinstance(values, Iterable):
        return {_normalize_str(v) for v in values if str(v).strip()}
    return set()


def specialty_match(user: dict, advisor: dict) -> float:
    user_pref = _normalize_str(user.get("advisor_specialty_preference", ""))
    mapped_specialties = USER_TO_ADVISOR_SPECIALTY_MAP.get(user_pref, set())

    if not mapped_specialties:
        return 0.5

    advisor_specialties = _normalize_set(advisor.get("specialties", []))
    overlap = len(mapped_specialties & advisor_specialties)

    if overlap == 0:
        return 0.0

    return overlap / len(mapped_specialties)


def retirement_goal_score(user: dict, advisor: dict) -> float:
    goal = _normalize_str(user.get("retirement_goal", ""))
    advisor_specialties = _normalize_set(advisor.get("specialties", []))

    if "retirement" not in advisor_specialties:
        return 0.3 if goal == "10+ yrs" else 0.0

    if goal == "<2 yrs":
        return 1.0
    if goal == "2-5 yrs":
        return 0.9
    if goal == "5-10 yrs":
        return 0.8
    if goal == "10+ yrs":
        return 0.7
    return 0.5


def location_score(user: dict, advisor: dict) -> float:
    user_state = str(user.get("state", "")).upper().strip()
    advisor_state = str(advisor.get("state", "")).upper().strip()

    if user_state and advisor_state and user_state == advisor_state:
        return 1.0
    if int(advisor.get("virtual_available", 0)) == 1:
        return 0.5
    return 0.0


def asset_fit(user: dict, advisor: dict) -> float:
    savings = float(user.get("approx_savings", 0))
    min_assets = float(advisor.get("min_assets", 0))
    max_assets = float(advisor.get("max_assets", 0))

    if min_assets <= savings <= max_assets:
        return 1.0
    if savings >= min_assets:
        return 0.7
    return 0.0


def client_type_fit(user: dict, advisor: dict) -> float:
    savings = float(user.get("approx_savings", 0))
    advisor_client_types = _normalize_set(advisor.get("client_types", []))

    if savings >= 1_000_000:
        target = "high net worth"
    else:
        target = "individual"

    return 1.0 if target in advisor_client_types else 0.3


def risk_fit(user: dict, advisor: dict) -> float:
    user_risk = int(user.get("risk_tolerance_score", 3))
    disclosures = float(advisor.get("num_disclosures", 0))
    disciplinary = int(advisor.get("disciplinary_flag", 0))

    advisor_risk_penalty = 0
    if disciplinary == 1:
        advisor_risk_penalty += 2
    if disclosures >= 10:
        advisor_risk_penalty += 2
    elif disclosures >= 3:
        advisor_risk_penalty += 1

    advisor_safe_score = max(1, 5 - advisor_risk_penalty)
    diff = abs(user_risk - advisor_safe_score)

    if diff == 0:
        return 1.0
    if diff == 1:
        return 0.75
    if diff == 2:
        return 0.4
    return 0.1


def trust_score(advisor: dict) -> float:
    score = 1.0

    if int(advisor.get("disciplinary_flag", 0)) == 1:
        score -= 0.6

    score -= min(float(advisor.get("num_disclosures", 0)) * 0.02, 0.3)

    if int(advisor.get("fiduciary", 0)) == 1:
        score += 0.1

    return max(0.0, min(score, 1.0))


def homeowner_relevance(user: dict, advisor: dict) -> float:
    owns_house = int(user.get("owns_house", 0))
    advisor_specialties = _normalize_set(advisor.get("specialties", []))

    if owns_house == 1 and "financial planning" in advisor_specialties:
        return 1.0
    if owns_house == 1:
        return 0.5
    return 0.5


def final_score(user: dict, advisor: dict, cosine_sim: float | None = None) -> float:
    base_score = (
        0.22 * specialty_match(user, advisor)
        + 0.14 * retirement_goal_score(user, advisor)
        + 0.14 * location_score(user, advisor)
        + 0.14 * asset_fit(user, advisor)
        + 0.12 * client_type_fit(user, advisor)
        + 0.12 * risk_fit(user, advisor)
        + 0.06 * homeowner_relevance(user, advisor)
        + 0.06 * trust_score(advisor)
    )

    if cosine_sim is not None:
        score = 0.75 * base_score + 0.25 * float(cosine_sim)
    else:
        score = base_score

    return round(max(0.0, min(score, 1.0)), 4)


def confidence_label(score: float) -> str:
    if score >= 0.85:
        return "High"
    if score >= 0.70:
        return "Medium"
    return "Low"