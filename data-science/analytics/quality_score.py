"""Composite quality score — placeholder.

TODO: Combine rating, reliability (error rate), usage, and review sentiment
TODO: Output quality score 0-100 per agent
"""

import pandas as pd
from pathlib import Path

DATASETS_DIR = Path(__file__).parent.parent.parent / "datasets"


def compute_quality_scores() -> pd.DataFrame:
    usage = pd.read_csv(DATASETS_DIR / "agent_usage.csv")
    ratings = pd.read_csv(DATASETS_DIR / "agent_ratings.csv")
    merged = usage.merge(ratings, on="agent_id", how="left")

    # TODO: Weighted composite formula
    merged["quality_score"] = (
        merged["avg_rating"] * 20
        + (merged["total_runs"] / merged["total_runs"].max()) * 40
        + (1 - merged["error_rate"]) * 40
    ).round(1)

    return merged[["agent_id", "agent_name", "quality_score"]].sort_values(
        "quality_score", ascending=False
    )


if __name__ == "__main__":
    print(compute_quality_scores().to_string(index=False))
