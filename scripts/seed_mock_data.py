#!/usr/bin/env python3
"""Seed mock ratings and reviews into backend storage.

TODO: Expand to seed run history and other runtime data.
"""

import json
import shutil
from pathlib import Path

REPO_ROOT = Path(__file__).parent.parent
REVIEWS_SRC = REPO_ROOT / "datasets" / "agent_reviews.json"
STORAGE_DIR = REPO_ROOT / "backend" / "app" / "storage" / "data"


def seed_data():
    STORAGE_DIR.mkdir(parents=True, exist_ok=True)

    if REVIEWS_SRC.exists():
        reviews = json.loads(REVIEWS_SRC.read_text(encoding="utf-8"))
        ratings = [
            {"agent_id": r["agent_id"], "score": r["rating"], "review": r["review"]}
            for r in reviews
        ]
        (STORAGE_DIR / "ratings.json").write_text(
            json.dumps(ratings, indent=2), encoding="utf-8"
        )
        shutil.copy(REVIEWS_SRC, STORAGE_DIR / "reviews.json")
        print(f"Seeded {len(ratings)} ratings and {len(reviews)} reviews")
    else:
        print("No review data found to seed")


if __name__ == "__main__":
    seed_data()
