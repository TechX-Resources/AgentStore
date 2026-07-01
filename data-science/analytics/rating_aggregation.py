"""
AS-08: Rating Aggregation Script
AgentStore — Data Science Cohort

Reads agent_ratings.csv and agent_reviews.json from the datasets/ folder
and produces a summary CSV with quality signals per agent.

Output: data-science/analytics/rating_summary.csv
"""

import pandas as pd
import json
from pathlib import Path

# --- Paths ---
DATASETS_DIR = Path(__file__).resolve().parents[2] / "datasets"
OUTPUT_DIR = Path(__file__).resolve().parent
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

RATINGS_PATH = DATASETS_DIR / "agent_ratings.csv"
REVIEWS_PATH = DATASETS_DIR / "agent_reviews.json"
OUTPUT_PATH = OUTPUT_DIR / "rating_summary.csv"


def load_data():
    ratings = pd.read_csv(RATINGS_PATH)
    with open(REVIEWS_PATH) as f:
        reviews = pd.DataFrame(json.load(f))
    return ratings, reviews


def compute_confidence_adjusted_score(avg_rating, rating_count, min_count=50):
    global_mean = 4.4
    return (avg_rating * rating_count + global_mean * min_count) / (rating_count + min_count)


def compute_rating_distribution(row):
    total = row["rating_count"]
    five_star_pct = round(row["five_star"] / total * 100, 1) if total > 0 else 0
    one_star_pct = round(row["one_star"] / total * 100, 1) if total > 0 else 0
    return five_star_pct, one_star_pct


def aggregate_review_ratings(reviews):
    return (
        reviews.groupby("agent_id")["rating"]
        .agg(review_avg_rating="mean", review_count="count")
        .round(2)
        .reset_index()
    )


def main():
    print("Loading datasets...")
    ratings, reviews = load_data()

    print("Computing rating aggregations...")

    ratings["confidence_score"] = ratings.apply(
        lambda row: round(compute_confidence_adjusted_score(row["avg_rating"], row["rating_count"]), 3),
        axis=1,
    )

    ratings[["five_star_pct", "one_star_pct"]] = ratings.apply(
        lambda row: compute_rating_distribution(row), axis=1, result_type="expand"
    )

    review_summary = aggregate_review_ratings(reviews)
    summary = ratings.merge(review_summary, on="agent_id", how="left")

    summary = summary[[
        "agent_id", "agent_name", "avg_rating", "rating_count",
        "confidence_score", "five_star", "five_star_pct",
        "four_star", "three_star", "two_star", "one_star",
        "one_star_pct", "review_avg_rating", "review_count",
    ]]

    summary = summary.sort_values("confidence_score", ascending=False).reset_index(drop=True)
    summary.to_csv(OUTPUT_PATH, index=False)

    print(f"\nDone! Output saved to: {OUTPUT_PATH}")
    print("\n--- Rating Summary ---")
    print(summary[["agent_name", "avg_rating", "rating_count", "confidence_score"]].to_string(index=False))


if __name__ == "__main__":
    main()
    