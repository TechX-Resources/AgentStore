# Kanban — AgentStore Task Board

Students implement features through assigned Kanban tickets using branches and pull requests.

## Board

Use your team's Kanban tool (GitHub Projects, Trello, etc.) to track tickets.

Suggested columns:

```
Backlog → Ready → In Progress → In Review → Done
```

## Ticket Prefix

Use `AS-` prefix for all tickets (AgentStore).

Examples: `AS-01`, `AS-12`, `AS-34`

## Sample Tickets (Starter Backlog)

### Phase 1 — MVP Core

| ID | Title | Cohort | Folder |
|----|-------|--------|--------|
| AS-01 | Implement GET /agents with pagination | Full Stack | backend/ |
| AS-02 | Build AgentCard component styling | Full Stack | frontend/ |
| AS-03 | Agent detail page — tools section | Full Stack | frontend/ |
| AS-04 | Implement mock agent runner | LLM | agents/runner/ |
| AS-05 | Tool-call trace viewer component | Full Stack | frontend/ |
| AS-06 | Add prompt templates for 3 agents | LLM | agents/prompts/ |
| AS-07 | Trending agents algorithm | Data Science | data-science/ |
| AS-08 | Rating aggregation script | Data Science | data-science/ |
| AS-09 | Review sentiment placeholder | Data Science | data-science/ |
| AS-10 | POST /agents/{id}/ratings endpoint | Full Stack | backend/ |
| AS-11 | Category filter on browse page | Full Stack | frontend/ |
| AS-12 | Tool detail page | Full Stack | frontend/ |
| AS-13 | JSON Schema validation on manifest load | LLM | shared/, backend/ |
| AS-14 | Pytest for API endpoints | Full Stack | tests/ |
| AS-15 | Traces for remaining 7 agents | LLM | agents/traces/ |

## Branch Naming

```
feature/AS-XX-short-description
```

See [CONTRIBUTING.md](../CONTRIBUTING.md) for PR expectations.
