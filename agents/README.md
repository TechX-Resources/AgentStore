# Agents — AgentStore

This folder contains agent definitions, registry, runner, prompts, and tool-call traces.

## Structure

```
agents/
  manifests/     # 10 starter agent JSON manifests
  registry/      # Agent registry loader (TODO)
  runner/        # Mock agent execution runner (TODO)
  prompts/       # Prompt templates (TODO)
  traces/        # Mock tool-call trace examples
```

## Agent Manifest Fields

Each agent manifest includes:

- Name, description, category
- Creator, version, status
- Tools required
- Permissions required
- Inputs and outputs
- Example use case
- Tags, rating (mock), downloads (mock)

## Starter Agents

1. Email Summarizer Agent
2. GitHub Issue Triage Agent
3. Calendar Planner Agent
4. Resume Reviewer Agent
5. Study Buddy Agent
6. Travel Deal Finder Agent
7. Data Cleaner Agent
8. Meeting Notes Agent
9. Content Generator Agent
10. Budget Analyzer Agent

## Tool-Call Traces

At least 3 agents have mock traces in `traces/`:

- `email_summarizer_trace.json`
- `github_issue_triage_trace.json`
- `meeting_notes_trace.json`

## Student Tasks

- Implement `registry/agent_registry.py` to load manifests
- Implement `runner/agent_runner.py` for simulated execution
- Add prompt templates in `prompts/`
- Create additional traces for remaining agents
