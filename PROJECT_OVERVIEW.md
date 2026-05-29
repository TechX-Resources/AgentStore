# AgentStore — Project Overview

## What Is AgentStore?

AgentStore is like an App Store, but instead of apps, users discover **AI agents**.

Each agent is an intelligent worker that can perform tasks, use tools, call other agents, and participate in a growing agent ecosystem.

**Tagline:** The App Store for Agents.

---

## What Agents Can Do

- Be **installed** into a user's workspace
- Be **remixed** (forked and customized)
- Be **upgraded** through new versions
- **Use tools** (Gmail, Calendar, GitHub, web search, etc.)
- **Call other agents** for specialized tasks
- **Publish workflows** and share prompts
- **Contribute improvements** back to the marketplace

---

## What Users Can Do

- Browse and search agents
- View agent capabilities, tools, and permissions
- Run simulated agent workflows
- Inspect tool-call traces
- Rate and review agents
- Fork/remix agents
- Publish new agent listings
- Discover trending agents

---

## Agent Listing Fields

Every agent in the marketplace includes:

| Field | Description |
|-------|-------------|
| Name | Display name |
| Description | What the agent does |
| Category | Productivity, Developer Tools, etc. |
| Tools Required | Which marketplace tools the agent uses |
| Permissions | What access the agent needs |
| Inputs | Expected user inputs |
| Outputs | What the agent produces |
| Example Use Case | Real-world scenario |
| Rating | Average user rating |
| Reviews | User feedback |
| Tool-Call Trace | Step-by-step execution log |
| Remix/Fork | Option to create a derivative |
| Version History | Past releases and changelogs |

---

## Example Agents

| Agent | Category | Key Tools |
|-------|----------|-----------|
| Email Summarizer Agent | Productivity | Gmail Reader |
| GitHub Issue Triage Agent | Developer Tools | GitHub Reader |
| Calendar Planner Agent | Productivity | Calendar Reader |
| Resume Reviewer Agent | Career | File Reader |
| Study Buddy Agent | Education | Notes, Web Search |
| Travel Deal Finder Agent | Travel | Web Search, Browser |
| Data Cleaner Agent | Data Analysis | Spreadsheet, File Reader |
| Meeting Notes Agent | Communication | Notes, Calendar Reader |
| Content Generator Agent | Content Creation | File Reader, Web Search |
| Budget Analyzer Agent | Finance | Spreadsheet |

---

## Marketplace Entities

AgentStore supports three marketplace entity types:

### 1. Agents
AI workers that perform tasks (e.g., Resume Reviewer, Meeting Notes Agent).

### 2. Tools
Capabilities agents can use (e.g., Gmail Reader, Web Search, Browser Automation).

### 3. Agent Apps
Bundles of agents, tools, workflows, prompts, and configurations — installable marketplace packages.

---

## Cohorts

### LLM Cohort
Focus: agent design, prompts, MCP/tool-calling, manifests, traces, execution flow.

### Data Science Cohort
Focus: ranking, recommendations, ratings, sentiment, analytics, trending algorithms.

---

## MVP Goal

A working demo where a user can:

1. Browse agents
2. Select an agent
3. View its details and required tools
4. Run a simulated execution
5. See a tool-call trace
6. Rate the agent

See [docs/product-requirements.md](docs/product-requirements.md) for full MVP scope.
