# Product Requirements — AgentStore MVP

## MVP Features (In Scope)

1. **Browse agents** — List all available agents with name, category, rating, and short description.
2. **View agent details** — Full agent page with tools, permissions, inputs/outputs, and example use case.
3. **View tools required by agent** — Show which marketplace tools an agent depends on.
4. **Browse available tools** — List all tools in the tool registry.
5. **Run simulated agent** — Trigger a mock agent execution (no real API calls).
6. **See tool-call trace** — Display step-by-step trace of a simulated run.
7. **Rate/review agent** — Submit and view ratings and text reviews.
8. **See trending agents** — Display agents ranked by a trending algorithm (mock or computed from mock data).
9. **Remix/fork agent** — Create a derivative agent from an existing listing (placeholder flow).
10. **Publish a new agent listing** — Submit a new agent manifest to the catalog (placeholder flow).

---

## Out of Scope (First Version)

- Real payments or billing
- Real user authentication (OAuth, JWT production setup)
- Production MCP server integration
- Real Gmail, Calendar, or GitHub permissions
- Production deployment and hosting
- Enterprise admin dashboard
- Real-time agent execution with live LLM APIs (use mock/simulation only)

---

## Success Criteria

The MVP is complete when:

1. The repo is organized cleanly.
2. There are at least 10 agent listings with manifests.
3. Each agent lists required tools.
4. There is a tool registry with at least 8 tools.
5. At least 3 agents have mock tool-call traces.
6. Frontend can display agent cards and a detail page.
7. Backend has placeholder endpoints for agents, tools, runs, and ratings.
8. Data Science folder can analyze mock usage/review data.
9. A demo can show: browse → select → install/run → trace → rate.

---

## Non-Functional Requirements

- Simple enough for students to understand and extend
- No secrets in the repository
- Local JSON storage for MVP (no database setup required)
- Clear TODO comments marking student implementation areas
