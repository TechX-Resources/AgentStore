# Architecture — AgentStore

## High-Level Flow

```
Frontend (React + Vite)
        ↓
Backend API (FastAPI)
        ↓
Agent Registry
        ↓
Tool Registry
        ↓
Agent Store Catalog
        ↓
Agent Runner / MCP Simulation
        ↓
Tool-Call Trace Logs
        ↓
Ratings, Reviews, Analytics
```

---

## Layer Descriptions

### Frontend
React + TypeScript + Vite application. Displays agent cards, detail pages, tool listings, run simulation UI, and trace viewer. Calls backend REST API.

**Folder:** `frontend/`

### Backend API
FastAPI server exposing REST endpoints for agents, tools, runs, ratings, and reviews. Uses Pydantic models and JSON file storage for MVP.

**Folder:** `backend/`

### Agent Registry
Loads and serves agent manifests from JSON files. Provides lookup by ID, category, and search.

**Folder:** `agents/registry/`

### Tool Registry
Loads and serves tool manifests. Maps tool IDs to schemas, permissions, and mock output notes.

**Folder:** `tools/` (manifests), integrated via backend

### Agent Store Catalog
The combined view of all marketplace listings — agents, tools, and future agent apps. Aggregates metadata for browse/search/trending.

**Folders:** `agents/manifests/`, `tools/manifests/`, `backend/app/storage/`

### Agent Runner / MCP Simulation
Simulates agent execution without real external calls. Steps through: receive request → identify tools → call mock tools → process responses → generate answer.

**Folder:** `agents/runner/`

Real MCP integration can replace mock calls in a future phase.

### Tool-Call Trace Logs
Records each step of a simulated run for display and debugging. Stored as JSON alongside run history.

**Folder:** `agents/traces/`

### Ratings, Reviews, Analytics
User ratings and text reviews stored via backend. Data Science cohort analyzes mock usage/review data for trending, quality scores, and recommendations.

**Folders:** `backend/app/storage/`, `data-science/`, `datasets/`

---

## Data Flow: Simulated Agent Run

```
User clicks "Run Agent"
        ↓
Frontend POST /agents/{id}/run
        ↓
Backend loads agent manifest
        ↓
Agent Runner identifies required tools
        ↓
Mock tool calls executed (no real APIs)
        ↓
Trace steps recorded
        ↓
Final response + trace returned to frontend
        ↓
Frontend displays result and trace viewer
```

---

## Storage Strategy (MVP)

| Data | Location | Format |
|------|----------|--------|
| Agent manifests | `agents/manifests/` | JSON |
| Tool manifests | `tools/manifests/` | JSON |
| Mock traces | `agents/traces/` | JSON |
| Runtime ratings/reviews | `backend/app/storage/data/` | JSON |
| Mock analytics datasets | `datasets/` | CSV/JSON |

Students can migrate to SQLite, Postgres, or other databases in later phases.

---

## Shared Schemas

Common Pydantic models and TypeScript types live in:

- `backend/app/models/` — Python models
- `shared/schemas/` — JSON schema definitions
- `shared/types/` — Shared type documentation

---

## Testing

- `tests/backend/` — Pytest for API endpoints
- `tests/agents/` — Pytest for registry and runner
- `tests/frontend/` — Frontend test placeholder

---

## Future Extensions

See [ROADMAP.md](../ROADMAP.md) for planned phases including real MCP integration, agent-to-agent calling, recommendation systems, and production deployment.
