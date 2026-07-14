# Presentation Diagrams

Architecture and flow diagrams for AgentStore session presentations.

## Files

| File | Format | Purpose |
|------|--------|---------|
| `architecture.puml` | PlantUML | Full system architecture with cohort labels |
| `user-journey-flow.puml` | PlantUML | MVP user journey (activity diagram) |
| `agent-run-flow.puml` | PlantUML | Simulated run sequence with trace steps |
| `marketplace-concept.puml` | PlantUML | Agents, Tools, Agent Apps relationship |
| `cohort-workstreams.puml` | PlantUML | LLM vs Data Science work split |
| `diagrams.md` | Mermaid | Same concepts in GitHub-renderable format |

## Export for Slides

### Option A — PlantUML (recommended for clean exports)

1. Open [plantuml.com/plantuml](https://www.plantuml.com/plantuml/uml/)
2. Paste contents of any `.puml` file
3. Download PNG or SVG
4. Insert into PowerPoint, Google Slides, or Canva

### Option B — VS Code / Cursor extension

1. Install **PlantUML** extension (jebbs.plantuml)
2. Open a `.puml` file
3. Preview with `Alt+D` (Windows) or `Option+D` (Mac)
4. Right-click → Export Current Diagram

### Option C — Mermaid (fastest, no install)

1. Open [diagrams.md](./diagrams.md) or [mermaid.live](https://mermaid.live)
2. Copy a Mermaid code block
3. Export PNG/SVG

### Option D — CLI

```bash
# Requires Java + plantuml.jar
java -jar plantuml.jar -tsvg presentations/diagrams/*.puml
```

## Recommended Session Flow

See [diagrams.md](./diagrams.md#suggested-slide-order) for suggested slide order.
