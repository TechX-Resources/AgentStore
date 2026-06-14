"""Rating aggregator — placeholder.

TODO: Compute per-agent average rating, rating count, and distribution
TODO: Output JSON for backend trending endpoint consumption
"""

import pandas as pd
from pathlib import Path
import json


DATASETS_DIR = Path(__file__).parent.parent.parent / "datasets"


def aggregate_ratings() -> pd.DataFrame:
    """Aggregate ratings by agent.
    
    Definition:
    - num_ratings: number of ratings for a specific agent
    - average_rating: review ratings added up / num_ratings
    - Higher num_ratings = higher confidence score for a particular review
    - Agents ranked by average_rating descending
    
    """
    df = pd.read_csv(DATASETS_DIR / "agent_ratings.csv")
    # TODO: Add std dev, rating count, recent vs all-time
    return df.sort_values("avg_rating", ascending=False)


def calculate_average_ratings() -> list[dict]:
    
    """
    Calculate average rating of an agent given review ratings
    Read agent_reviews, get ratings and calculate num_ratings and average_rating
    """
    
    
    with open(DATASETS_DIR / "agent_reviews.json", encoding="utf-8") as f:
        reviews = json.load(f)
    
    totals = {}
    for review in reviews:
        agent_id = review["agent_id"]
        if agent_id not in totals:
            totals[agent_id] = {"sum": 0, "count": 0}
        totals[agent_id]["sum"] += review["rating"]
        totals[agent_id]["count"] += 1

    results = []
    for agent_id, data in totals.items():
        results.append({
            "agent_id": agent_id,
            "average_rating": round(data["sum"] / data["count"], 2),
            "num_ratings": data["count"],
        })

    return sorted(results, key=lambda x: x["average_rating"], reverse=True)


if __name__ == "__main__":
    print(aggregate_ratings().to_string(index=False))
    
    print("\nAverage Ratings from Reviews:")
    print("-" * 40)
    for agent in calculate_average_ratings():
        print(f"{agent['agent_id']}: {agent['average_rating']} ({agent['num_ratings']} reviews)")
