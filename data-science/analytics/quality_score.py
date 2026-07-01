"""Composite quality score calculation.

This script reads mock agent usage and rating data, then calculates
a simple quality score for each agent.

Formula:
quality_score = avg_rating * 20
              + normalized_total_runs * 40
              + reliability_score * 40

Where:
- avg_rating rewards agents with higher user ratings.
- normalized_total_runs rewards agents that are used more often.
- reliability_score = 1 - error_rate rewards stable agents with fewer errors.

The script prints the top 5 agents by quality score.
"""

import pandas as pd
from pathlib import Path

DATASETS_DIR = Path(__file__).parent.parent.parent / "datasets"


def compute_quality_scores() -> pd.DataFrame:
    usage = pd.read_csv(DATASETS_DIR / "agent_usage.csv")
    ratings = pd.read_csv(DATASETS_DIR / "agent_ratings.csv")
    merged = usage.merge(ratings, on="agent_id", how="left")
   
    if "agent_name" not in merged.columns:
   	 merged["agent_name"] = merged["agent_id"]	
    
    merged["quality_score"] = (
        merged["avg_rating"] * 20
        + (merged["total_runs"] / merged["total_runs"].max()) * 40
        + (1 - merged["error_rate"]) * 40
    ).round(1)

    return (
	 merged[["agent_id", "agent_name", "quality_score"]]
	.sort_values("quality_score", ascending=False)
	.head(5)
    )


if __name__ == "__main__":
    print("Top 5 Agents by Quality Score:")
    print(compute_quality_scores().to_string(index=False))
