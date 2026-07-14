# AgentStore — Presentation Diagrams

Ready-to-use architecture and flow diagrams for TechX sessions.

## Quick Render Options

| Tool | How |
|------|-----|
| **PlantUML Online** | Paste `.puml` contents into [plantuml.com/plantuml](https://www.plantuml.com/plantuml/uml/) → export PNG/SVG |
| **VS Code / Cursor** | Install "PlantUML" extension → open `.puml` → `Alt+D` preview → export |
| **GitHub** | Mermaid blocks below render natively in this file |
| **Slides (Mermaid)** | Paste Mermaid into [mermaid.live](https://mermaid.live) → export PNG/SVG |
| **CLI** | `java -jar plantuml.jar presentations/diagrams/*.puml` |

---

## 1. System Architecture (Mermaid)

```mermaid
flowchart TB
    subgraph Users
        U[User]
        D[Student Developer]
    end

    subgraph Frontend["Frontend — React + Vite"]
        FE1[Browse Agents]
        FE2[Agent Detail]
        FE3[Run & Trace UI]
        FE4[Ratings UI]
    end

    subgraph Backend["Backend — FastAPI"]
        API1[Agents API]
        API2[Tools API]
        API3[Run API]
        API4[Ratings API]
    end

    subgraph AgentLayer["Agent Layer — LLM Cohort"]
        AR[Agent Registry]
        TR[Tool Registry]
        RUN[Agent Runner / MCP Sim]
        TRACE[Tool-Call Traces]
    end

    subgraph Storage["Marketplace Catalog"]
        AM[(Agent Manifests JSON)]
        TM[(Tool Manifests JSON)]
        RT[(Runtime Storage JSON)]
    end

    subgraph DataScience["Data Science Cohort"]
        TREND[Trending Algorithm]
        RATE[Rating Aggregator]
        SENT[Review Sentiment]
        QUAL[Quality Score]
    end

    DS[(Mock Datasets CSV/JSON)]

    U --> FE1 & FE2 & FE3 & FE4
    D --> AM & TM & DataScience

    FE1 --> API1
    FE2 --> API1
    FE3 --> API3
    FE4 --> API4

    API1 --> AR
    API2 --> TR
    API3 --> RUN
    API4 --> RT

    AR --> AM
    TR --> TM
    RUN --> TR & TRACE

    TREND & RATE & SENT & QUAL --> DS
```

---

## 2. MVP User Journey (Mermaid)

```mermaid
flowchart LR
    A([Open AgentStore]) --> B[Browse Agents]
    B --> C[View Agent Detail]
    C --> D{Inspect tools\n& permissions}
    D --> E[Run Simulated Agent]
    E --> F[View Tool-Call Trace]
    F --> G[Rate & Review]
    G --> H([Discover Trending Agents])

    style A fill:#4f46e5,color:#fff
    style H fill:#4f46e5,color:#fff
    style E fill:#fef3c7
    style F fill:#fef3c7
```

---

## 3. Simulated Agent Run — Sequence (Mermaid)

```mermaid
sequenceDiagram
    actor User
    participant FE as Frontend
    participant API as Backend API
    participant Reg as Agent Registry
    participant Run as Agent Runner
    participant Tools as Tool Registry
    participant Mock as Mock Tools

    User->>FE: Click Run Agent
    FE->>API: POST /agents/{id}/run
    API->>Reg: Load manifest
    Reg-->>API: tools_required, permissions
    API->>Run: run_agent(id, input)

    Run->>Run: Step 1 — Receive request
    Run->>Run: Step 2 — Identify tools
    Run->>Tools: Resolve tool schemas
    Run->>Mock: Mock tool calls
    Mock-->>Run: Canned responses
    Run->>Run: Step 5 — Generate answer
    Run->>Run: Step 6 — Save trace

    Run-->>API: output + trace
    API-->>FE: RunResponse
    FE-->>User: Result + trace viewer
```

---

## 4. Marketplace Entities (Mermaid)

```mermaid
flowchart TB
    subgraph Marketplace["AgentStore Marketplace"]
        AG[Agents<br/>AI workers]
        TL[Tools<br/>Capabilities]
        AP[Agent Apps<br/>Bundles — future]
    end

    AG -->|uses| TL
    AP -->|bundles| AG
    AP -->|bundles| TL

    AG -.- ex1["Email Summarizer<br/>Meeting Notes<br/>GitHub Triage"]
    TL -.- ex2["Gmail Reader<br/>Web Search<br/>Calendar Reader"]
    AP -.- ex3["Agents + Tools<br/>+ Workflows + Prompts"]
```

---

## 5. Cohort Workstreams (Mermaid)

```mermaid
flowchart TB
    MVP[AgentStore MVP Demo]

    subgraph LLM["LLM Cohort"]
        L1[Manifests]
        L2[Runner & Traces]
        L3[Prompts & MCP Sim]
    end

    subgraph DS["Data Science Cohort"]
        D1[Trending & Ranking]
        D2[Sentiment & Analytics]
        D3[Quality Scoring]
    end

    subgraph FS["Full Stack — Both Cohorts"]
        F1[Frontend UI]
        F2[Backend API]
    end

    LLM --> FS
    DS --> FS
    FS --> MVP

    KB[Kanban AS-XX tickets → Branches → PRs]
    KB -.-> MVP
```

---

## PlantUML Source Files

| File | Use in session for |
|------|-------------------|
| [architecture.puml](./architecture.puml) | Overall system layers & cohort ownership |
| [user-journey-flow.puml](./user-journey-flow.puml) | End-to-end MVP demo walkthrough |
| [agent-run-flow.puml](./agent-run-flow.puml) | Deep dive on tool-call traces |
| [marketplace-concept.puml](./marketplace-concept.puml) | Product vision — Agents, Tools, Agent Apps |
| [cohort-workstreams.puml](./cohort-workstreams.puml) | How students split the work |

---

## Suggested Slide Order

1. **Marketplace concept** — what AgentStore is (Agents + Tools + Apps)
2. **Architecture** — layers and cohort responsibilities
3. **User journey** — live demo script flow
4. **Agent run sequence** — explain traces (agents are workflows, not magic)
5. **Cohort workstreams** — Kanban ticket model for students
