# AgentStore Roadmap

High-level milestones for the AgentStore project. Students implement features through Kanban tickets.

---

## Phase 0: Repository Skeleton ✅

- [x] Directory structure and placeholder files
- [x] 10 agent manifests
- [x] 8 tool manifests
- [x] Mock datasets
- [x] Documentation (README, architecture, user stories)
- [x] Backend and frontend placeholders

---

## Phase 1: MVP Core

### Backend
- [ ] Agent listing API (`GET /agents`)
- [ ] Agent detail API (`GET /agents/{id}`)
- [ ] Tool listing API (`GET /tools`)
- [ ] Simulated agent run endpoint (`POST /agents/{id}/run`)
- [ ] Tool-call trace endpoint (`GET /agents/{id}/traces`)
- [ ] Rating/review endpoints
- [ ] JSON file storage layer

### Frontend
- [ ] Agent browse page with cards
- [ ] Agent detail page
- [ ] Tool browse page
- [ ] Run agent simulation UI
- [ ] Tool-call trace viewer
- [ ] Rating/review UI

### Agents & Tools
- [ ] Agent registry loader
- [ ] Tool registry loader
- [ ] Mock agent runner
- [ ] 3+ complete tool-call traces

### Data Science
- [ ] Trending agents algorithm (mock data)
- [ ] Rating aggregation script
- [ ] Review sentiment placeholder
- [ ] Usage analytics dashboard (notebook)

---

## Phase 2: Marketplace Features

- [ ] Remix/fork agent flow
- [ ] Publish new agent listing
- [ ] Version history display
- [ ] Agent search and filtering
- [ ] Category browsing
- [ ] Tool detail pages

---

## Phase 3: Advanced Features

- [ ] Agent-to-agent calling
- [ ] Agent App bundles
- [ ] Recommendation system
- [ ] Agent reliability dashboard
- [ ] Agent security scanner (permission audit)
- [ ] Agent leaderboards

---

## Phase 4: Production Readiness (Future)

- [ ] Real MCP server integration
- [ ] Database migration (SQLite/Postgres)
- [ ] User authentication
- [ ] Deployment pipeline
- [ ] Real external tool integrations

---

## Out of Scope (MVP)

- Real payments
- Production authentication
- Real Gmail/Calendar/GitHub permissions
- Enterprise admin dashboard
- Live deployment

See [docs/product-requirements.md](docs/product-requirements.md) for MVP boundaries.
