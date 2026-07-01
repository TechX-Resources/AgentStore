"""Trending agents score calculation.

This script reads mock usage and rating data, then calculates a simple
trending score for each agent.

Formula:
trending_score = recent_runs * 0.6 + total_runs * 0.2 + avg_rating * 20

Why:
- recent_runs has the highest weight because trending agents should be active now.
- total_runs rewards agents with proven usage.
- avg_rating rewards agents with better user ratings.

The script prints the top 5 trending agents.
"""

import pandas as pd
from pathlib import Path

DATASETS_DIR = Path(__file__).parent.parent.parent / "datasets"


def load_usage_data() -> pd.DataFrame:
    return pd.read_csv(DATASETS_DIR / "agent_usage.csv")


def load_ratings_data() -> pd.DataFrame:
    return pd.read_csv(DATASETS_DIR / "agent_ratings.csv")


def compute_trending_scores() -> pd.DataFrame:
    usage = load_usage_data()
    ratings = load_ratings_data()

    merged = usage.merge(ratings, on="agent_id", how="left")

    if "agent_name" not in merged.columns:
        merged["agent_name"] = merged["agent_id"]

    merged["trending_score"] = (
        merged["recent_runs"] * 0.6
        + merged["total_runs"] * 0.2
        + merged["avg_rating"] * 20
    ).round(1)

    return (
        merged[["agent_id", "agent_name", "trending_score"]]
        .sort_values("trending_score", ascending=False)
        .head(5)
    )


if __name__ == "__main__":
    results = compute_trending_scores()
    print("Top 5 Trending Agents:")
    print(results.to_string(index=False))
