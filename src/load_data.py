from __future__ import annotations

from datetime import datetime

import pandas as pd

# Maps SEC ADV 5G Y/N columns → specialty label
# Section 5G: Types of advisory services provided
_SPECIALTY_COLS = {
    "5G(1)": "financial planning",
    "5G(2)": "portfolio management",
    "5G(3)": "portfolio management",
    "5G(4)": "institutional management",
    "5G(5)": "retirement",
    "5G(6)": "adviser selection",
    "5G(7)": "retirement",
    "5G(8)": "security analysis",
    "5G(9)": "market timing",
    "5G(10)": "other",
    "5G(11)": "other",
    "5G(12)": "other",
}

# Maps SEC ADV 5B numeric count columns → client type label
# A non-zero client count means the firm serves that client type
_CLIENT_TYPE_5B_COLS = {
    "5B(1)": "individual",
    "5B(2)": "high net worth",
    "5B(3)": "institutional",
    "5B(4)": "investment company",
    "5B(5)": "pension",
    "5B(6)": "other institutional",
}

# Fee model priority order: pick the first Y match
_FEE_MODEL_PRIORITY = [
    ("5E(1)", "aum"),
    ("5E(4)", "flat"),
    ("5E(2)", "hourly"),
    ("5E(3)", "subscription"),
    ("5E(5)", "commission"),
    ("5E(6)", "performance"),
    ("5E(7)", "other"),
]

_DISCLOSURE_COUNT_COLS = [
    "Count of 11A(1) disclosures", "Count of 11A(2) disclosures",
    "Count of 11B(1) disclosures", "Count of 11B(2) disclosures",
    "Count of 11C(1) disclosures", "Count of 11C(2) disclosures",
    "Count of 11C(3) disclosures", "Count of 11C(4) disclosures",
    "Count of 11C(5) disclosures", "Count of 11D(1) disclosures",
    "Count of 11D(2) disclosures", "Count of 11D(3) disclosures",
    "Count of 11D(4) disclosures", "Count of 11D(5) disclosures",
    "Count of 11E(1) disclosures", "Count of 11E(2) disclosures",
    "Count of 11E(3) disclosures", "Count of 11E(4) disclosures",
    "Count of 11F disclosures", "Count of 11G disclosures",
    "Count of 11H(1)(a) disclosures", "Count of 11H(1)(b) disclosures",
    "Count of 11H(1)(c) disclosures", "Count of 11H(2) disclosures",
]


def _is_yes(val) -> bool:
    return str(val).strip().upper() == "Y"


def _build_pipe_col_yn(df: pd.DataFrame, col_map: dict) -> pd.Series:
    """Build a pipe-delimited string column from multiple Y/N checkbox columns."""
    masks: dict = {}
    for col, label in col_map.items():
        if col in df.columns:
            masks.setdefault(label, pd.Series(False, index=df.index))
            masks[label] |= df[col].map(_is_yes)

    if not masks:
        return pd.Series("", index=df.index)

    result = pd.Series("", index=df.index, dtype=str)
    for label, mask in masks.items():
        result = result.where(~mask, result + "|" + label)

    return result.str.strip("|")


def _build_pipe_col_counts(df: pd.DataFrame, col_map: dict) -> pd.Series:
    """Build a pipe-delimited string column from numeric count columns (>0 means active)."""
    masks: dict = {}
    for col, label in col_map.items():
        if col in df.columns:
            masks.setdefault(label, pd.Series(False, index=df.index))
            masks[label] |= pd.to_numeric(df[col], errors="coerce").fillna(0) > 0

    if not masks:
        return pd.Series("", index=df.index)

    result = pd.Series("", index=df.index, dtype=str)
    for label, mask in masks.items():
        result = result.where(~mask, result + "|" + label)

    return result.str.strip("|")


def _pick_fee_model(df: pd.DataFrame) -> pd.Series:
    result = pd.Series("other", index=df.index, dtype=str)
    for col, label in reversed(_FEE_MODEL_PRIORITY):
        if col in df.columns:
            result = result.where(~df[col].map(_is_yes), label)
    return result


def _normalize_sec_csv(df: pd.DataFrame) -> pd.DataFrame:
    out = pd.DataFrame(index=df.index)

    out["firm_name"] = df["Primary Business Name"]
    out["state"] = df["Main Office State"]
    out["zip_code"] = df["Main Office Postal Code"]

    out["specialties"] = _build_pipe_col_yn(df, _SPECIALTY_COLS)
    out["client_types"] = _build_pipe_col_counts(df, _CLIENT_TYPE_5B_COLS)
    out["fee_model"] = _pick_fee_model(df)

    out["disciplinary_flag"] = df["11"].map(_is_yes).astype(int)

    disc_cols = [c for c in _DISCLOSURE_COUNT_COLS if c in df.columns]
    out["num_disclosures"] = (
        df[disc_cols].apply(pd.to_numeric, errors="coerce").fillna(0).sum(axis=1)
    )

    # All SEC-registered investment advisers are fiduciaries by law
    out["fiduciary"] = 1

    # Estimate experience from registration date
    effective_dates = pd.to_datetime(df["SEC Status Effective Date"], errors="coerce")
    current_year = datetime.now().year
    out["years_experience"] = (current_year - effective_dates.dt.year).clip(lower=0).fillna(0).astype(int)

    # Minimum account size not available in this export
    out["min_assets"] = 0
    out["max_assets"] = 100_000_000_000

    # Fee percentage not available in this export
    out["fee_pct"] = 0.0

    # Virtual availability not captured in this export
    out["virtual_available"] = 0

    return out


def _split_pipe_values(value: str) -> list[str]:
    if pd.isna(value) or not str(value).strip():
        return []
    return [item.strip().lower() for item in str(value).split("|") if item.strip()]


def load_advisors(csv_path: str = "data/IA_SEC_-_FIRM_ROSTER_FOIA_DOWNLOAD_-_34553767.CSV") -> pd.DataFrame:
    raw = pd.read_csv(csv_path, encoding="latin-1", low_memory=False)
    df = _normalize_sec_csv(raw)

    for col in ["specialties", "client_types"]:
        df[col] = df[col].apply(_split_pipe_values)

    numeric_cols = [
        "min_assets", "max_assets", "years_experience",
        "disciplinary_flag", "num_disclosures", "fee_pct",
        "virtual_available", "fiduciary",
    ]
    for col in numeric_cols:
        df[col] = pd.to_numeric(df[col], errors="coerce").fillna(0)

    df["state"] = df["state"].astype(str).str.upper().str.strip()
    df["fee_model"] = df["fee_model"].astype(str).str.lower().str.strip()
    df["zip_code"] = df["zip_code"].astype(str).str.strip()

    return df

import pandas as pd

def load_users(csv_path: str = "data/simulated_users.csv") -> pd.DataFrame:
    df = pd.read_csv(csv_path)

    # -------- type normalization --------
    numeric_cols = ["age", "income", "assets"]
    for col in numeric_cols:
        df[col] = pd.to_numeric(df[col], errors="coerce").fillna(0)

    # -------- categorical cleanup --------
    df["goal"] = df["goal"].astype(str).str.lower().str.strip()
    df["risk"] = df["risk"].astype(str).str.lower().str.strip()
    df["state"] = df["state"].astype(str).str.upper().str.strip()

    return df

if __name__ == "__main__":
    advisors = load_advisors()
    print(advisors.head())
    print(len(advisors))
    print(advisors.columns)
    for col in advisors.columns:
        if advisors[col].dtype == object and isinstance(advisors[col].iloc[0], list):
            # list columns — show flattened unique values
            flat = {v for lst in advisors[col] for v in lst}
            print(f"{col}: {sorted(flat)}")
        else:
            print(f"{col}: {advisors[col].unique()}")