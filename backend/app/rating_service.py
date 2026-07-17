"""Computes live rating averages from stored ratings."""

from app.storage.json_store import read_json

RATINGS_FILE = "ratings.json"


def _load_ratings() -> list[dict]:
    data = read_json(RATINGS_FILE)
    return data if isinstance(data, list) else []


def get_rating_stats(agent_id: str, fallback: float = 0.0) -> tuple[float | None, int]:
    """Return (average_rating, rating_count) for an agent.

    Returns (None, 0) when there are no submitted ratings yet, so callers
    can show "No ratings yet" instead of a misleading placeholder number.
    """
    scores = [
        r["score"]
        for r in _load_ratings()
        if r.get("agent_id") == agent_id and isinstance(r.get("score"), (int, float))
    ]
    if not scores:
        return None, 0
    return round(sum(scores) / len(scores), 2), len(scores)