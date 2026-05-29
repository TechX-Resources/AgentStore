# AgentStore Frontend

React + TypeScript + Vite UI for the AgentStore marketplace.

## Setup

```bash
npm install
```

## Run

```bash
npm run dev
```

Visit http://localhost:5173

Ensure the backend is running at http://127.0.0.1:8000 for API calls.

## Structure

```
src/
  api/           # API client
  components/    # Reusable UI components (AgentCard, etc.)
  pages/         # Route pages
  App.tsx        # Router and layout
```

## Pages

| Route | Component | Status |
|-------|-----------|--------|
| `/` | HomePage | Placeholder |
| `/agents` | AgentsPage | Fetches from API |
| `/agents/:id` | AgentDetailPage | Partial — run button works |
| `/tools` | ToolsPage | Fetches from API |

## Student Tasks

- Implement trace viewer component
- Add rating/review UI
- Add category filters and search
- Add trending agents section
- Style with Tailwind (optional ticket)
- Add Vitest tests
