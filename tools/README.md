# Tools — AgentStore Marketplace

This folder contains **marketplace tools** that agents can use.

Tools are capabilities — not agents themselves. Agents call tools to read email, search the web, access files, etc.

## What Students Will Implement

- Tool manifests (JSON definitions)
- Tool schemas (input/output)
- Tool permissions and categories
- Mock tool outputs for simulation
- Tool registry loader
- Tool detail API endpoints
- Tool browse UI

## Tool Manifest Fields

Each tool manifest should include:

| Field | Description |
|-------|-------------|
| `id` | Unique tool identifier |
| `name` | Display name |
| `description` | What the tool does |
| `category` | Email, Calendar, GitHub, etc. |
| `input_schema` | Expected inputs (JSON Schema style) |
| `output_schema` | Expected outputs |
| `permission_level` | read, write, admin |
| `mock_implementation_notes` | How to simulate this tool |

## Do Not Implement

- Real Gmail, Calendar, or GitHub integrations
- Real MCP server connections (future phase)
- Production OAuth flows

## Tool Categories

```
Email | Calendar | GitHub | Files | Search | Browser | Notes | Spreadsheet | Messaging | Database
```

## Manifests

See `manifests/` for starter tool definitions:

- `gmail_reader_tool.json`
- `calendar_reader_tool.json`
- `github_reader_tool.json`
- `file_reader_tool.json`
- `web_search_tool.json`
- `notes_tool.json`
- `spreadsheet_tool.json`
- `browser_tool.json`

## Related Folders

- `agents/` — Agents that reference these tools
- `backend/app/routers/tools.py` — Tool API endpoints (TODO)
- `frontend/src/pages/ToolsPage.tsx` — Tool browse UI (TODO)
