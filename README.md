# AgentStore

**The App Store for Agents.**

AgentStore is a student-built marketplace where AI agents can be discovered, built, shared, installed, remixed, and improved by both humans and other agents.

## Cohorts

| Cohort | Focus Areas |
|--------|-------------|
| **LLM Cohort** | Agent design, prompt templates, MCP/tool-calling workflows, agent manifests, tool traces, tool ecosystems, agent execution flow |
| **Data Science Cohort** | Agent ranking, recommendation systems, ratings, review sentiment, usage analytics, quality scoring, trending algorithms, marketplace insights |

## Architecture

```
Frontend (React + TypeScript + Vite)
        ↓  /api proxy
Backend API (FastAPI)
        ↓
Agent Registry → Tool Registry → Catalog
        ↓
Agent Runner / MCP Simulation (mock tools)
        ↓
Tool-Call Traces → Ratings / Reviews → Analytics
```

See [docs/architecture.md](docs/architecture.md) for details.

## Prerequisites

- **Node.js 18+**
- **Python 3.11+** (3.13 works)
- **Git**

## Run locally (two terminals)

### 1. Backend API

```bash
cd backend
python -m venv venv

# Windows (PowerShell)
.\venv\Scripts\Activate.ps1

# macOS / Linux
# source venv/bin/activate

pip install -r requirements.txt
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

- API root: http://127.0.0.1:8000  
- Interactive docs: http://127.0.0.1:8000/docs  
- Health: http://127.0.0.1:8000/health  

### 2. Frontend (Vite)

In a **second** terminal:

```bash
cd frontend
npm install
npm run dev
```

Open: **http://127.0.0.1:5173**

The frontend calls the backend through the Vite proxy path `/api` (see `frontend/vite.config.ts`). Keep the backend running while using the UI.

### Optional: direct API URL

Create `frontend/.env.local` only if you need to bypass the proxy:

```env
VITE_API_BASE_URL=http://127.0.0.1:8000
```

### Data Science (optional)

```bash
cd data-science
pip install -r requirements.txt
python analytics/trending_agents.py
```

### Tests (optional)

```bash
cd backend
.\venv\Scripts\Activate.ps1   # or source venv/bin/activate
pip install -r ../tests/requirements.txt
cd ..
pytest tests/ -q
```

## What works in the MVP UI

| Feature | Route / Endpoint |
|---------|------------------|
| Browse agents | `/agents` → `GET /agents` |
| Agent detail | `/agents/:id` → `GET /agents/{id}` |
| Simulated run + trace | **Run Agent** → `POST /agents/{id}/run` |
| Rate / review | Agent detail form → `POST /agents/{id}/ratings` |
| Browse tools | `/tools` → `GET /tools` |
| Trending | `/trending` → `GET /agents/trending` |

Agent and tool data come from JSON manifests under `agents/manifests/` and `tools/manifests/`. Runs use **mock tools** only (no real Gmail/GitHub/MCP).

## Repository Structure

```
├── docs/           # Product docs, architecture, user stories
├── frontend/       # React + TypeScript + Vite UI
├── backend/        # FastAPI REST API
├── agents/         # Agent manifests, registry, runner, traces
├── tools/          # Tool manifests and registry
├── data-science/   # Analytics, ranking, recommendation scripts
├── datasets/       # Mock CSV/JSON datasets
├── shared/         # Shared schemas and types
├── tests/          # Pytest and frontend test placeholders
├── scripts/        # Utility scripts
├── kanban/         # Task board references
└── presentations/  # Demo and pitch materials
```

## Contributing

Students implement features through Kanban tickets using branches and pull requests.

### Branch Naming

```
feature/<ticket-id>-short-description
fix/<ticket-id>-short-description
docs/<ticket-id>-short-description
```

### Pull Request Expectations

1. One ticket per PR when possible  
2. Clear description + ticket ID  
3. No secrets / API keys  
4. Keep scope focused  

See [CONTRIBUTING.md](CONTRIBUTING.md) and [STUDENT_ONBOARDING.md](STUDENT_ONBOARDING.md).

## Documentation

- [PROJECT_OVERVIEW.md](PROJECT_OVERVIEW.md) — Product vision  
- [STUDENT_ONBOARDING.md](STUDENT_ONBOARDING.md) — Student setup  
- [ROADMAP.md](ROADMAP.md) — Planned milestones  
- [docs/product-requirements.md](docs/product-requirements.md) — MVP scope  
- [docs/user-stories.md](docs/user-stories.md) — User stories  
- [docs/architecture.md](docs/architecture.md) — System architecture  

## License

MIT — see [LICENSE](LICENSE).
