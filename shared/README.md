# Shared Schemas and Types

Cross-cutting schema definitions used by backend, frontend, and agents.

## JSON Schemas

| File | Description |
|------|-------------|
| `schemas/agent_manifest.schema.json` | Agent marketplace listing schema |
| `schemas/tool_manifest.schema.json` | Tool marketplace listing schema |
| `schemas/tool_call_trace.schema.json` | Agent execution trace schema |

## Usage

- **Backend:** Validate manifests on load (TODO)
- **Frontend:** Generate TypeScript types from schemas (TODO)
- **Agents:** Ensure manifests conform before publishing

## Agent Categories

```
Productivity | Developer Tools | Education | Career | Travel | Finance |
Content Creation | Data Analysis | Communication | Personal Assistant
```

## Tool Categories

```
Email | Calendar | GitHub | Files | Search | Browser | Notes |
Spreadsheet | Messaging | Database
```
