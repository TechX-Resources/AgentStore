# AgentStore

**The App Store for Agents.**

AgentStore is a student-built marketplace where AI agents can be discovered, built, shared, purchased, installed, remixed, and improved by both humans and other agents.

## Cohorts

This project is designed for two TechX cohorts:

| Cohort | Focus Areas |
|--------|-------------|
| **LLM Cohort** | Agent design, prompt templates, MCP/tool-calling workflows, agent manifests, tool traces, tool ecosystems, agent execution flow |
| **Data Science Cohort** | Agent ranking, recommendation systems, ratings, review sentiment, usage analytics, quality scoring, trending algorithms, marketplace insights |

## Architecture

```
Frontend (React + Vite)
        ↓
Backend API (FastAPI)
        ↓
Agent Registry → Tool Registry → Agent Store Catalog
        ↓
Agent Runner / MCP Simulation
        ↓
Tool-Call Trace Logs → Ratings, Reviews, Analytics
```

See [docs/architecture.md](docs/architecture.md) for details.

## Getting Started

### Prerequisites

- Node.js 18+
- Python 3.11+
- Git

### Backend (placeholder)

```bash
cd backend
python -m venv venv
source venv/bin/activate   # Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

API docs: http://127.0.0.1:8000/docs

### Frontend (placeholder)

```bash
cd frontend
npm install
npm run dev
```

App: http://localhost:5173

### Data Science

```bash
cd data-science
pip install -r requirements.txt
# TODO: Run analytics scripts or open notebooks
```

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

Students implement features through assigned Kanban tickets using branches and pull requests.

### Branch Naming

```
feature/<ticket-id>-short-description
fix/<ticket-id>-short-description
docs/<ticket-id>-short-description
```

Examples:
- `feature/AS-12-agent-detail-page`
- `fix/AS-34-rating-endpoint`
- `docs/AS-01-update-architecture`

### Pull Request Expectations

1. One ticket per PR when possible
2. Include a clear description of what changed and why
3. Reference the Kanban ticket ID
4. Keep changes focused — no unrelated refactors
5. Update relevant README or docs if behavior changes
6. Add or update tests when implementing logic

See [CONTRIBUTING.md](CONTRIBUTING.md) and [STUDENT_ONBOARDING.md](STUDENT_ONBOARDING.md) for more.

## Documentation

- [PROJECT_OVERVIEW.md](PROJECT_OVERVIEW.md) — Product vision and concepts
- [STUDENT_ONBOARDING.md](STUDENT_ONBOARDING.md) — Getting started as a student developer
- [ROADMAP.md](ROADMAP.md) — Planned milestones
- [docs/product-requirements.md](docs/product-requirements.md) — MVP scope
- [docs/user-stories.md](docs/user-stories.md) — User stories
- [docs/architecture.md](docs/architecture.md) — System architecture

## License

MIT — see [LICENSE](LICENSE).
