"""Review sentiment analysis — placeholder.

TODO: Implement basic sentiment scoring on mock reviews
TODO: Use scikit-learn or simple lexicon-based approach
TODO: Output sentiment labels: positive, neutral, negative
"""

import json
from pathlib import Path

DATASETS_DIR = Path(__file__).parent.parent.parent / "datasets"


def load_reviews() -> list[dict]:
    with open(DATASETS_DIR / "agent_reviews.json", encoding="utf-8") as f:
        return json.load(f)


def analyze_sentiment(reviews: list[dict]) -> list[dict]:
    """Placeholder sentiment analysis.

    TODO: Replace with real sentiment model or lexicon
    """
    results = []
    for review in reviews:
        results.append({
            **review,
            "sentiment": "neutral",  # TODO: compute real sentiment
            "sentiment_score": 0.0,
        })
    return results


if __name__ == "__main__":
    reviews = load_reviews()
    analyzed = analyze_sentiment(reviews)

    # Group reviews by agent_id
    from collections import defaultdict
    grouped = defaultdict(list)
    for r in analyzed:
        grouped[r["agent_id"]].append(r)

    print("Reviews by Agent:")
    print("=" * 50)
    for agent_id, agent_reviews in grouped.items():
        print(f"\nAgent: {agent_id}")
        print(f"Number of reviews: {len(agent_reviews)}")
        print("-" * 40)
        for r in agent_reviews:
            print(f"  Rating: {r['rating']}/5")
            print(f"  Review: {r['review']}")
            print(f"  Sentiment: {r['sentiment']}")
            print(f"  Date: {r['date']}")
            print()