"""
DataAlign – FastAPI backend
Serves the matching API and the React production build.
"""
from __future__ import annotations

import os

import pandas as pd
import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel

from src.load_data import load_advisors
from src.match_engine import rank_advisors
from src.scoring import USER_TO_ADVISOR_SPECIALTY_MAP

app = FastAPI(title="FindMyAdvisor")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

_ALL_SPECIALTIES = {
    "financial planning", "portfolio management", "institutional management",
    "retirement", "adviser selection", "security analysis", "market timing", "other",
}

_advisors_df: pd.DataFrame | None = None


@app.on_event("startup")
async def _load_data() -> None:
    global _advisors_df
    df = load_advisors()
    df["advisor_id"] = df.index.astype(str)
    _advisors_df = df


# ─── Request / response models ────────────────────────────────────────────
class MatchRequest(BaseModel):
    state: str
    age_bucket: str
    retirement_goal: str
    specialty_key: str
    approx_savings: float
    profession: str = ""
    owns_house: bool = False
    risk_score: int = 3


# ─── API routes ───────────────────────────────────────────────────────────
@app.get("/api/health")
async def health() -> dict:
    return {"status": "ok", "advisors_loaded": _advisors_df is not None}


@app.post("/api/match")
async def match_advisors(req: MatchRequest) -> dict:
    mapped = USER_TO_ADVISOR_SPECIALTY_MAP.get(req.specialty_key, set())
    goals = list(mapped) if mapped else list(_ALL_SPECIALTIES)

    user: dict = {
        "liquid_assets": req.approx_savings,
        "goals": goals,
        "state": req.state,
        "approx_savings": req.approx_savings,
        "advisor_specialty_preference": req.specialty_key,
        "retirement_goal": req.retirement_goal,
        "risk_tolerance_score": req.risk_score,
        "owns_house": 1 if req.owns_house else 0,
        "age_bucket": req.age_bucket,
        "profession": req.profession,
    }

    results = rank_advisors(user, _advisors_df, top_k=3)

    return {
        "total_advisors": len(_advisors_df),
        "results": results,
    }


# ─── Serve React production build (when available) ────────────────────────
_DIST = "frontend/dist"
if os.path.exists(_DIST):
    app.mount("/assets", StaticFiles(directory=f"{_DIST}/assets"), name="assets")

    @app.get("/{full_path:path}")
    async def serve_spa(full_path: str) -> FileResponse:
        return FileResponse(f"{_DIST}/index.html")


if __name__ == "__main__":
    uvicorn.run("app:app", host="0.0.0.0", port=8000, reload=True)
