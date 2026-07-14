"""Ratings and reviews API routes."""

import sys
from pathlib import Path

from fastapi import APIRouter, HTTPException

REPO_ROOT = Path(__file__).parent.parent.parent.parent
sys.path.insert(0, str(REPO_ROOT))

from agents.registry.agent_registry import get_agent_by_id  # noqa: E402
from app.models.schemas import RatingCreate, RatingResponse  # noqa: E402
from app.storage.json_store import read_json, write_json  # noqa: E402

router = APIRouter()

RATINGS_FILE = "ratings.json"


def _load_ratings() -> list:
    data = read_json(RATINGS_FILE)
    return data if isinstance(data, list) else []


@router.get("/{agent_id}/ratings", response_model=list[RatingResponse])
def get_ratings(agent_id: str):
    """Get all ratings for an agent."""
    if not get_agent_by_id(agent_id):
        raise HTTPException(status_code=404, detail=f"Agent '{agent_id}' not found")

    all_ratings = _load_ratings()
    return [RatingResponse(**r) for r in all_ratings if r.get("agent_id") == agent_id]


@router.post("/{agent_id}/ratings", response_model=RatingResponse)
def submit_rating(agent_id: str, rating: RatingCreate):
    """Submit a rating and optional review for an agent."""
    if not get_agent_by_id(agent_id):
        raise HTTPException(status_code=404, detail=f"Agent '{agent_id}' not found")

    all_ratings = _load_ratings()
    entry = {
        "agent_id": agent_id,
        "score": rating.score,
        "review": rating.review,
    }
    all_ratings.append(entry)
    write_json(RATINGS_FILE, all_ratings)
    return RatingResponse(**entry)
