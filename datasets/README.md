# Datasets — AgentStore

Mock CSV and JSON datasets for development and data science analysis.

## Files

| File | Description |
|------|-------------|
| `agent_usage.csv` | Mock download, install, run counts and error rates |
| `agent_ratings.csv` | Mock rating aggregates per agent |
| `agent_reviews.json` | Mock text reviews for sentiment analysis |
| `mock_spreadsheet.csv` | Sample budget data for Budget Analyzer / Data Cleaner agents |
| `mock_emails.json` | Sample emails for Email Summarizer mock tool |
| `mock_github_issues.json` | Sample GitHub issues for Triage agent mock tool |

## Usage

- Backend mock tools can read from these files
- Data science scripts in `data-science/analytics/` consume these datasets
- Students can extend with additional mock data as needed

Do not commit real user data or PII.
