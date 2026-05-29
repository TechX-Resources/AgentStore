# AgentStore Backend

FastAPI backend for the AgentStore marketplace.

## Setup

```bash
python -m venv venv
source venv/bin/activate   # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

Copy `.env.example` from repo root to `.env` if needed.

## Run

```bash
uvicorn app.main:app --reload
```

API docs: http://127.0.0.1:8000/docs

## Structure

```
app/
  main.py           # FastAPI app entry point
  models/           # Pydantic models
  routers/          # API route handlers
  storage/          # JSON file storage
```

## Endpoints (Placeholder)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/` | API info |
| GET | `/health` | Health check |
| GET | `/agents` | List all agents |
| GET | `/agents/{id}` | Get agent by ID |
| GET | `/tools` | List all tools |
| GET | `/tools/{id}` | Get tool by ID |
| POST | `/agents/{id}/run` | Simulate agent run |
| GET | `/agents/{id}/traces` | Get tool-call traces |
| GET | `/agents/{id}/ratings` | Get ratings |
| POST | `/agents/{id}/ratings` | Submit rating |

Students implement full logic via Kanban tickets.
