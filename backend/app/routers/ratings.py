"""Ratings and reviews API routes."""

from fastapi import APIRouter, HTTPException

from app.models.schemas import RatingCreate, RatingResponse
from app.storage.json_store import read_json, write_json

router = APIRouter()

RATINGS_FILE = "ratings.json"


@router.get("/{agent_id}/ratings", response_model=list[RatingResponse])
def get_ratings(agent_id: str):
    """Get all ratings for an agent.

    TODO: Compute average rating
    TODO: Add pagination
    """
    all_ratings = read_json(RATINGS_FILE) or []
    return [RatingResponse(**r) for r in all_ratings if r.get("agent_id") == agent_id]


@router.post("/{agent_id}/ratings", response_model=RatingResponse)
def submit_rating(agent_id: str, rating: RatingCreate):
    """Submit a rating and optional review for an agent.

    TODO: Validate agent exists
    TODO: Prevent duplicate ratings (when auth exists)
    TODO: Update agent average rating in manifest or cache
    """
    all_ratings = read_json(RATINGS_FILE) or []
    entry = {
        "agent_id": agent_id,
        "score": rating.score,
        "review": rating.review,
    }
    all_ratings.append(entry)
    write_json(RATINGS_FILE, all_ratings)
    return RatingResponse(**entry)
