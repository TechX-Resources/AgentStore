"""Simple review sentiment labeler.

This script reads mock agent reviews and labels each review as
positive, neutral, or negative using a basic keyword-based approach.

Formula:
sentiment_score = positive_word_count - negative_word_count

Rules:
- score > 0  -> positive
- score < 0  -> negative
- score == 0 -> neutral
"""

import json
from pathlib import Path

DATASETS_DIR = Path(__file__).parent.parent.parent / "datasets"

POSITIVE_WORDS = {
    "great", "good", "excellent", "helpful", "useful", "fast",
    "accurate", "easy", "love", "best", "amazing", "reliable",
    "perfect", "recommend", "actionable", "spot-on", "wonderful",
    "fantastic", "smooth", "saves", "helped", "well",
}

NEGATIVE_WORDS = {
    "bad", "poor", "slow", "wrong", "confusing", "buggy",
    "error", "errors", "difficult", "unhelpful", "hate", "worst",
    "misses", "missing", "inaccurate", "broken", "crash", "annoying",
    "lacking", "limited", "improvement",
}

NEGATION_WORDS = {"not", "no", "never", "isn't", "wasn't", "weren't", "don't", "doesn't", "can't"}


def load_reviews() -> list[dict]:
    with open(DATASETS_DIR / "agent_reviews.json", encoding="utf-8") as f:
        return json.load(f)

def _negated(words: list[str], i: int) -> bool:
    """True if the word just before position i is a negation."""
    prev = words[i - 1].strip(".,!?") if i > 0 else ""
    return prev in NEGATION_WORDS


def get_sentiment_score(text: str) -> int:
    words = text.lower().split()

    positive_count = sum(
        1 for i, word in enumerate(words)
        if word.strip(".,!?") in POSITIVE_WORDS and not _negated(words, i)
    )
    negative_count = sum(
        1 for i, word in enumerate(words)
        if word.strip(".,!?") in NEGATIVE_WORDS and not _negated(words, i)
    )

    return positive_count - negative_count


def get_sentiment_label(score: int) -> str:
    if score > 0:
        return "positive"
    if score < 0:
        return "negative"
    return "neutral"


def analyze_sentiment(reviews: list[dict]) -> list[dict]:
    results = []

    for review in reviews:
        score = get_sentiment_score(review["review"])
        sentiment = get_sentiment_label(score)

        results.append({
            **review,
            "sentiment": sentiment,
            "sentiment_score": score,
        })

    return results


if __name__ == "__main__":
    reviews = load_reviews()
    analyzed = analyze_sentiment(reviews)

    print("Review Sentiment Results:")
    print("-" * 40)

    for r in analyzed:
        print(
            f"[{r['sentiment']}] "
            f"score={r['sentiment_score']} "
            f"{r['agent_id']}: {r['review'][:60]}..."
        )
