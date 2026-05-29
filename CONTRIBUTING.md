# Contributing to AgentStore

Thank you for contributing to **AgentStore: The App Store for Agents**.

This is an educational project. Students work on isolated tasks through Kanban tickets, branches, and pull requests.

## Workflow

1. Pick a ticket from the Kanban board (see `kanban/`).
2. Create a branch from `main` using the naming convention below.
3. Implement your ticket scope only — do not expand scope without discussion.
4. Open a pull request with a clear description.
5. Address review feedback.
6. Merge after approval.

## Branch Naming

```
feature/<ticket-id>-short-description
fix/<ticket-id>-short-description
docs/<ticket-id>-short-description
```

## Pull Request Checklist

- [ ] Ticket ID referenced in PR title or description
- [ ] Changes are limited to the ticket scope
- [ ] No secrets, API keys, or `.env` files committed
- [ ] Relevant docs updated if needed
- [ ] Tests added or updated when implementing logic
- [ ] Code follows existing project conventions

## Code Guidelines

- **Do not** implement full business logic unless your ticket requires it
- **Do not** connect to real external APIs unless explicitly assigned
- **Do not** add production authentication in early tickets
- Use TODO comments to mark incomplete work for future tickets
- Prefer simple, readable code over clever abstractions

## Cohort Areas

| Area | Folder | Typical Tickets |
|------|--------|-----------------|
| LLM / Agents | `agents/`, `tools/`, `backend/app/routers/` | Manifests, traces, runner, prompts |
| Frontend | `frontend/` | Pages, components, API integration |
| Data Science | `data-science/`, `datasets/` | Ranking, analytics, trending |
| Backend | `backend/` | API endpoints, models, storage |

## Questions

Ask your cohort lead or open a discussion issue on GitHub.
