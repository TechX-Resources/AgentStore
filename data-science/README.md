# Data Science — AgentStore

Analytics, ranking, recommendation, and trending algorithms for the AgentStore marketplace.

## Focus Areas (Data Science Cohort)

- Agent ranking by quality and reliability
- Trending agents algorithm
- Review sentiment analysis
- Usage analytics from mock run logs
- Recommendation system (future)

## Structure

```
data-science/
  analytics/       # Python scripts for analysis
  notebooks/       # Jupyter notebooks for exploration
  requirements.txt
```

## Setup

```bash
pip install -r requirements.txt
```

## Mock Data

Scripts read from `../datasets/`:

- `agent_usage.csv` — mock run/download/install counts
- `agent_ratings.csv` — mock ratings per agent
- `agent_reviews.json` — mock text reviews

## Scripts

| Script | Purpose | Status |
|--------|---------|--------|
| `analytics/trending_agents.py` | Compute trending score | TODO |
| `analytics/rating_aggregator.py` | Aggregate ratings | TODO |
| `analytics/review_sentiment.py` | Sentiment placeholder | TODO |
| `analytics/quality_score.py` | Composite quality score | TODO |

## Notebooks

- `notebooks/explore_usage_data.ipynb` — Explore mock usage patterns (TODO)
- `notebooks/trending_analysis.ipynb` — Trending algorithm experiments (TODO)
