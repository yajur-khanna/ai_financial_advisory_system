from __future__ import annotations

from src.scoring import (
    USER_TO_ADVISOR_SPECIALTY_MAP,
    asset_fit,
    client_type_fit,
    location_score,
    retirement_goal_score,
    risk_fit,
    specialty_match,
    trust_score,
)

_FEE_LABELS: dict[str, str] = {
    "aum": "AUM-based",
    "flat": "flat-fee",
    "hourly": "hourly",
    "subscription": "subscription",
    "commission": "commission-based",
    "performance": "performance-based",
}

_SPECIALTY_SHORT: dict[str, str] = {
    "retirement planning":               "retirement planning",
    "tax aware investing":               "tax-aware investing",
    "estate planning":                   "estate planning",
    "management of new wealth":          "wealth management",
    "entrepreneurial wealth management": "entrepreneurial wealth",
    "socially conscious investing":      "ESG / socially conscious investing",
    "tax preparation":                   "tax preparation",
    "life insurance":                    "life insurance planning",
    "divorce planning":                  "divorce financial planning",
}


def generate_explanation(user: dict, advisor: dict) -> dict:
    reasons: list[str] = []
    concerns: list[str] = []

    # ── Specialty alignment ──────────────────────────────────────────────
    sm = specialty_match(user, advisor)
    pref_key = str(user.get("advisor_specialty_preference", "")).strip().lower()
    pref_label = _SPECIALTY_SHORT.get(pref_key, "")
    advisor_specs = set(advisor.get("specialties") or [])

    if sm >= 0.8:
        label = f" in {pref_label}" if pref_label else ""
        reasons.append(f"Direct specialty match{label}")
    elif sm >= 0.5:
        matched = [s for s in (USER_TO_ADVISOR_SPECIALTY_MAP.get(pref_key) or set()) if s in advisor_specs]
        covered = matched[0].title() if matched else "your goal area"
        reasons.append(f"Covers {covered} — partial goal match")
    # sm < 0.5: no specialty reason (eligible because of broad overlap)

    # ── Location ────────────────────────────────────────────────────────
    loc = location_score(user, advisor)
    state = str(advisor.get("state", "")).upper()
    if loc == 1.0:
        reasons.append(f"In-state advisor ({state}) — no relocation needed")
    elif loc == 0.5:
        reasons.append("Remote-friendly — available outside your state")

    # ── Retirement goal fit ──────────────────────────────────────────────
    rg = retirement_goal_score(user, advisor)
    timeline = str(user.get("retirement_goal", "")).strip()
    if rg >= 0.85:
        reasons.append(f"Strong fit for your {timeline} retirement horizon")
    elif rg >= 0.6:
        reasons.append(f"Reasonable fit for a {timeline} retirement timeline")
    elif rg < 0.3 and timeline:
        concerns.append(f"Weak retirement specialization for a {timeline} timeline")

    # ── Client type fit ──────────────────────────────────────────────────
    ctf = client_type_fit(user, advisor)
    savings = float(user.get("approx_savings", 0))
    if ctf >= 1.0:
        if savings >= 1_000_000:
            reasons.append("Specifically serves high-net-worth clients")
        else:
            reasons.append("Tailored for individual retail investors")
    else:
        if savings >= 1_000_000:
            concerns.append("Primarily serves non-HNW clients — may not be best fit")
        else:
            concerns.append("Focuses on institutional or HNW clients")

    # ── Trust & regulatory record ────────────────────────────────────────
    ts = trust_score(advisor)
    disc = int(advisor.get("num_disclosures", 0))
    disciplinary = int(advisor.get("disciplinary_flag", 0))
    yrs = int(advisor.get("years_experience", 0))

    if ts >= 1.0 and disc == 0 and disciplinary == 0:
        yrs_note = f" · {yrs}-year track record" if yrs >= 10 else ""
        reasons.append(f"Clean regulatory record — no disclosures{yrs_note}")
    elif ts >= 0.8 and disciplinary == 0:
        reasons.append("No disciplinary history on record")

    if disciplinary == 1:
        concerns.append("Disciplinary history present — review before proceeding")
    if disc >= 5:
        concerns.append(f"High disclosure count ({disc}) — warrants careful review")
    elif disc > 0 and disciplinary == 0:
        concerns.append(f"{disc} regulatory disclosure{'s' if disc > 1 else ''} on record")

    # ── Experience ───────────────────────────────────────────────────────
    if yrs >= 20:
        reasons.append(f"Highly experienced — {yrs} years SEC-registered")
    elif yrs >= 10:
        reasons.append(f"Established firm with {yrs} years of registration")
    elif yrs < 4:
        concerns.append(f"Newer firm ({yrs} yr{'s' if yrs != 1 else ''} registered) — limited track record")

    # ── Risk alignment ────────────────────────────────────────────────────
    rf = risk_fit(user, advisor)
    if rf >= 0.75 and disciplinary == 0:
        reasons.append("Good alignment with your risk tolerance")
    elif rf <= 0.4:
        concerns.append("Risk profile may not align well with your tolerance")

    # ── Fee model (informational) ─────────────────────────────────────────
    fee_model = str(advisor.get("fee_model", "")).lower()
    fee_pct = float(advisor.get("fee_pct", 0))
    if fee_pct > 1.5:
        concerns.append(f"Fee rate ({fee_pct:.1f}%) is above the typical 1% benchmark")
    elif fee_model in _FEE_LABELS:
        reasons.append(f"Transparent {_FEE_LABELS[fee_model]} pricing model")

    return {
        "why_match": reasons[:3],
        "concerns":  concerns[:2],
    }
