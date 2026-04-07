from __future__ import annotations


def detect_risks(advisor: dict) -> list[str]:
    """
    Return a list of risk flag strings for the given advisor.
    Ordered from most to least severe.
    """
    risks: list[str] = []

    disc        = int(advisor.get("num_disclosures", 0))
    disciplinary = int(advisor.get("disciplinary_flag", 0))
    yrs         = int(advisor.get("years_experience", 0))
    fee_model   = str(advisor.get("fee_model", "")).lower().strip()
    fee_pct     = float(advisor.get("fee_pct", 0.0))
    specialties = set(advisor.get("specialties") or [])

    # ── Disciplinary history ─────────────────────────────────────────────
    if disciplinary == 1:
        risks.append("SEC disciplinary action on record")

    # ── Disclosure volume (severity-tiered with exact count) ─────────────
    if disc >= 10:
        risks.append(f"Very high disclosure volume ({disc} items) — thorough review advised")
    elif disc >= 5:
        risks.append(f"Elevated disclosures ({disc} items) — review recommended")
    elif disc >= 2:
        risks.append(f"{disc} regulatory disclosures on file")
    elif disc == 1:
        risks.append("1 regulatory disclosure on file")

    # ── Fee model conflicts ───────────────────────────────────────────────
    if fee_pct > 1.5:
        risks.append(f"Fee rate ({fee_pct:.1f}%) exceeds the typical 1% benchmark")
    elif fee_model == "commission":
        risks.append("Commission-based compensation — potential conflict of interest")

    # ── Experience ────────────────────────────────────────────────────────
    if yrs == 0:
        risks.append("Registration date unavailable — experience unverifiable")
    elif yrs < 3:
        risks.append(f"Newly registered firm ({yrs} yr{'s' if yrs != 1 else ''}) — limited track record")
    elif yrs < 6:
        risks.append(f"Relatively new firm ({yrs} years registered)")

    # ── High-risk strategy flag ───────────────────────────────────────────
    if "market timing" in specialties:
        risks.append("Offers market timing — a strategy with inconsistent academic support")

    return risks
