"""Rating aggregator — placeholder.

TODO: Compute per-agent average rating, rating count, and distribution
TODO: Output JSON for backend trending endpoint consumption
"""

import pandas as pd
from pathlib import Path

DATASETS_DIR = Path(__file__).parent.parent.parent / "datasets"


def aggregate_ratings() -> pd.DataFrame:
    """Aggregate ratings by agent."""
    df = pd.read_csv(DATASETS_DIR / "agent_ratings.csv")
    # TODO: Add std dev, rating count, recent vs all-time
    return df.sort_values("avg_rating", ascending=False)


if __name__ == "__main__":
    print(aggregate_ratings().to_string(index=False))
