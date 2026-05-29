# Student Onboarding — AgentStore

Welcome to **AgentStore**! This guide helps you get set up and start contributing.

## 1. Clone the Repository

```bash
git clone https://github.com/TechX-Resources/AgentStore.git
cd AgentStore
```

## 2. Choose Your Track

| Track | You'll Work In | Example First Tickets |
|-------|----------------|----------------------|
| **LLM** | `agents/`, `tools/`, backend runner | Agent manifests, tool traces, prompt templates |
| **Data Science** | `data-science/`, `datasets/` | Trending algorithm, rating analysis, mock data |
| **Full Stack** | `frontend/`, `backend/` | Agent cards UI, API endpoints, detail pages |

## 3. Set Up Your Environment

### Backend

```bash
cd backend
python -m venv venv
# macOS/Linux:
source venv/bin/activate
# Windows:
venv\Scripts\activate

pip install -r requirements.txt
uvicorn app.main:app --reload
```

Visit http://127.0.0.1:8000/docs to see the API placeholder.

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Visit http://localhost:5173 to see the UI placeholder.

### Data Science

```bash
cd data-science
pip install -r requirements.txt
```

Open notebooks in `data-science/notebooks/` or run scripts in `data-science/analytics/`.

## 4. Explore the Codebase

Start with these files:

1. [PROJECT_OVERVIEW.md](PROJECT_OVERVIEW.md) — What we're building
2. [docs/architecture.md](docs/architecture.md) — How the system is organized
3. [docs/user-stories.md](docs/user-stories.md) — What users need
4. [agents/manifests/](agents/manifests/) — Sample agent definitions
5. [tools/manifests/](tools/manifests/) — Sample tool definitions
6. [kanban/](kanban/) — Available tickets

## 5. Pick a Ticket

1. Go to the Kanban board (link in `kanban/README.md`).
2. Pick a ticket labeled for your cohort.
3. Move it to "In Progress" and assign yourself.

## 6. Create a Branch

```bash
git checkout main
git pull origin main
git checkout -b feature/AS-XX-short-description
```

## 7. Implement and Submit

1. Make your changes within the ticket scope.
2. Test locally (backend, frontend, or scripts as relevant).
3. Commit with a clear message.
4. Push and open a pull request.
5. Reference the ticket ID in your PR.

## Rules of the Road

- **Skeleton first** — Many files have TODO comments; implement only what your ticket asks for.
- **No secrets** — Never commit API keys or `.env` files.
- **No scope creep** — One ticket, one PR.
- **Ask questions** — Use GitHub Discussions or ask your cohort lead.

## Key Concepts

### Agent Manifest
A JSON file describing an agent: name, tools, permissions, inputs/outputs.

### Tool Manifest
A JSON file describing a tool: name, schema, permissions, mock output notes.

### Tool-Call Trace
A step-by-step log of what happens when an agent runs (identify tools → call tool → process response → generate answer).

### Mock Storage
The backend starts with JSON file storage — no database required for MVP.

Good luck — build something awesome!
