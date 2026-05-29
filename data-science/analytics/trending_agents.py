"""Trending agents algorithm — placeholder.

TODO: Implement trending score based on:
  - Recent run count (weighted)
  - Download velocity
  - Rating trend (recent vs historical)
  - Review volume

Input: datasets/agent_usage.csv, datasets/agent_ratings.csv
Output: Ranked list of agent IDs with trending scores
"""

import pandas as pd
from pathlib import Path

DATASETS_DIR = Path(__file__).parent.parent.parent / "datasets"


def load_usage_data() -> pd.DataFrame:
    """Load mock usage data."""
    return pd.read_csv(DATASETS_DIR / "agent_usage.csv")


def load_ratings_data() -> pd.DataFrame:
    """Load mock ratings data."""
    return pd.read_csv(DATASETS_DIR / "agent_ratings.csv")


def compute_trending_scores() -> pd.DataFrame:
    """Compute trending scores for all agents.

    TODO: Implement weighted scoring formula
    TODO: Normalize scores to 0-100 range
    """
    usage = load_usage_data()
    ratings = load_ratings_data()

    # Placeholder: simple sort by recent_runs
    merged = usage.merge(ratings, on="agent_id", how="left")
    merged["trending_score"] = merged["recent_runs"] * merged["avg_rating"]
    merged = merged.sort_values("trending_score", ascending=False)

    return merged[["agent_id", "agent_name", "trending_score"]]


if __name__ == "__main__":
    results = compute_trending_scores()
    print("Trending Agents (placeholder algorithm):")
    print(results.to_string(index=False))
