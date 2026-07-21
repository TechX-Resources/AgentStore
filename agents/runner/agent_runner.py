"""
Mock agent runner — simulates agent execution without real API calls.

For agents with explicit tool chains (e.g. email_summarizer), tools are
executed with mock data. For other agents, a static or synthesized trace
is returned so the UI Run flow works across the full catalog.
"""

from __future__ import annotations

import asyncio
import os
import json
import time
import uuid
from pathlib import Path
from typing import Any, Optional

TRACES_DIR = Path(__file__).parent.parent / "traces"


def mock_gmail_reader(query: str = "is:unread", max_results: int = 5) -> dict:
    return {
        "messages": [
            {
                "id": "msg_001",
                "from": "alice@example.com",
                "subject": "Q3 Budget Review",
                "snippet": "Please review the attached budget...",
                "date": "2026-05-29T08:30:00Z",
            },
            {
                "id": "msg_002",
                "from": "bob@corp.com",
                "subject": "Team standup notes",
                "snippet": "Action items from today's standup...",
                "date": "2026-05-29T07:15:00Z",
            },
            {
                "id": "msg_003",
                "from": "carol@vendor.com",
                "subject": "Invoice #4821",
                "snippet": "Please find attached invoice...",
                "date": "2026-05-28T16:00:00Z",
            },
        ][:max_results],
        "query": query,
    }


def mock_summarize_messages(messages: list[dict]) -> dict:
    snippets = [m.get("snippet", "") for m in messages]
    text = " | ".join(snippets)
    summary = text[:160].strip() + ("..." if len(text) > 160 else "")
    return {
        "summary": summary,
        "action_items": [
            "Reply to Alice about budget review",
            "Follow up on standup action items",
            "Approve invoice #4821",
        ][: len(messages)],
        "email_count": len(messages),
    }


TOOL_DISPATCH = {
    "gmail_reader": mock_gmail_reader,
    "summarize_messages": mock_summarize_messages,
}


def email_chain(user_input: dict, prev: dict) -> list[tuple[str, dict]]:
    return [
        (
            "gmail_reader",
            {
                "query": user_input.get("query", "is:unread"),
                "max_results": user_input.get("max_results", 5),
            },
        ),
        (
            "summarize_messages",
            {"messages": prev.get("gmail_reader", {}).get("messages", [])},
        ),
    ]


AGENT_CHAINS = {
    "email_summarizer": email_chain,
}

import csv
import io


async def _mcp_read_text_file(root: str, filename: str) -> str:
    """Read a file's contents through a real MCP filesystem server (stdio)."""
    from mcp import ClientSession, StdioServerParameters
    from mcp.client.stdio import stdio_client

    server_params = StdioServerParameters(
        command="npx",
        args=["-y", "@modelcontextprotocol/server-filesystem", root],
    )
    target_path = str(Path(root) / filename)

    async with stdio_client(server_params) as (read, write):
        async with ClientSession(read, write) as session:
            await session.initialize()
            try:
                result = await session.call_tool("read_text_file", {"path": target_path})
            except Exception:
                result = await session.call_tool("read_file", {"path": target_path})
            return "".join(getattr(block, "text", "") for block in result.content)


def _parse_budget_csv(csv_text: str) -> dict:
    """Real (non-LLM) computation over the real CSV: totals + category breakdown."""
    reader = csv.DictReader(io.StringIO(csv_text))
    rows = list(reader)
    category_breakdown: dict[str, float] = {}
    total = 0.0
    for row in rows:
        amount = float(row.get("amount") or row.get("Amount") or 0)
        category = row.get("category") or row.get("Category") or "Uncategorized"
        category_breakdown[category] = round(category_breakdown.get(category, 0) + amount, 2)
        total += amount
    return {
        "rows_scanned": len(rows),
        "total_spending": round(total, 2),
        "category_breakdown": category_breakdown,
    }


REPO_ROOT = Path(__file__).parent.parent.parent
DEFAULT_MCP_FILESYSTEM_ROOT = REPO_ROOT / "datasets"


def _run_budget_analyzer_live(user_input: dict) -> dict:
    """Real run: MCP filesystem read + real CSV computation. LLM step pending."""
    root = os.environ.get("MCP_FILESYSTEM_ROOT") or str(DEFAULT_MCP_FILESYSTEM_ROOT)
    filename = os.environ.get("BUDGET_CSV_FILENAME", "mock_spreadsheet.csv")
    query = user_input.get("query") or "Analyze my budget spreadsheet and suggest savings."

    run_id = str(uuid.uuid4())[:8]
    start = time.time()

    csv_text = asyncio.run(_mcp_read_text_file(root, filename))
    t_read = time.time()
    computed = _parse_budget_csv(csv_text)

    final_output = {
        "total_spending": computed["total_spending"],
        "category_breakdown": computed["category_breakdown"],
        "savings_opportunities": [],
        "trend_summary": "PENDING_LLM_INTEGRATION",
    }

    steps = [
        {
            "step": 1,
            "action": "tool_call",
            "tool_id": "mcp_filesystem",
            "details": {"root": root, "filename": filename},
            "output_summary": {
                "status": "success",
                "rows_scanned": computed["rows_scanned"],
                "chars_read": len(csv_text),
            },
            "status": "success",
            "latency_ms": int((t_read - start) * 1000),
        },
        {
            "step": 2,
            "action": "reasoning",
            "tool_id": None,
            "details": "LLM reasoning step not yet implemented.",
            "output_summary": "Pending LLM integration, savings_opportunities and "
            "trend_summary are placeholders until this is wired up.",
            "status": "pending",
        },
    ]

    result = {
        "run_id": run_id,
        "agent_id": "budget_analyzer",
        "user_input": user_input,
        "final_output": final_output,
        "status": "success",
        "message": "Live run via real MCP filesystem server. LLM reasoning step is pending.",
        "trace": {
            "agent_id": "budget_analyzer",
            "run_id": run_id,
            "status": "completed",
            "user_request": query,
            "steps": steps,
            "final_output": final_output,
        },
        "duration_ms": int((time.time() - start) * 1000),
    }
    _save_trace(result)
    return result


def build_final_output(agent_id: str, outputs: dict) -> dict | str:
    if agent_id == "email_summarizer":
        summarized = outputs.get("summarize_messages", {})
        return {
            "summary": summarized.get("summary", ""),
            "action_items": summarized.get("action_items", []),
            "email_count": summarized.get("email_count", 0),
        }
    return f"Agent '{agent_id}' executed successfully."


def _load_static_trace(agent_id: str) -> Optional[dict]:
    """Load the canonical static trace file for an agent if present."""
    path = TRACES_DIR / f"{agent_id}_trace.json"
    if not path.exists():
        return None
    with open(path, encoding="utf-8") as f:
        return json.load(f)


def _load_latest_dynamic_trace(agent_id: str) -> Optional[dict]:
    """Load the newest dynamic run file matching {agent_id}_*.json (excluding *_trace.json)."""
    if not TRACES_DIR.exists():
        return None
    candidates = [
        p
        for p in TRACES_DIR.glob(f"{agent_id}_*.json")
        if not p.name.endswith("_trace.json")
    ]
    if not candidates:
        return None
    latest = max(candidates, key=lambda p: p.stat().st_mtime)
    with open(latest, encoding="utf-8") as f:
        return json.load(f)


def get_trace_for_agent(agent_id: str) -> Optional[dict]:
    """Prefer dynamic run trace, then static {agent_id}_trace.json."""
    dynamic = _load_latest_dynamic_trace(agent_id)
    if dynamic:
        return dynamic
    return _load_static_trace(agent_id)


def _simulate_from_static_trace(agent_id: str, user_input: dict) -> Optional[dict]:
    """Build a successful run response from a static tool-call trace."""
    static = _load_static_trace(agent_id)
    if not static:
        return None

    run_id = str(uuid.uuid4())[:8]
    steps = static.get("steps", [])
    # Normalize steps to a consistent shape for the UI
    normalized_steps = []
    for i, step in enumerate(steps):
        normalized_steps.append(
            {
                "step": step.get("step") or step.get("step_number") or (i + 1),
                "action": step.get("action", "step"),
                "tool_id": step.get("tool") or step.get("tool_name"),
                "details": step.get("details") or step.get("input_summary"),
                "output_summary": step.get("output_summary"),
                "status": "success",
            }
        )

    result = {
        "run_id": run_id,
        "agent_id": agent_id,
        "user_input": user_input,
        "final_output": static.get("final_output")
        or static.get("result")
        or {"message": f"Simulated run for {agent_id} using static trace."},
        "status": "success",
        "message": f"Simulated run for '{agent_id}' using mock tool-call trace.",
        "trace": {
            "agent_id": agent_id,
            "run_id": run_id,
            "status": "completed",
            "user_request": static.get("user_request") or static.get("user_query") or "",
            "steps": normalized_steps,
            "final_output": static.get("final_output") or static.get("result"),
        },
        "duration_ms": int((static.get("runtime_seconds") or 1) * 1000),
    }
    _save_trace(result)
    return result


def _synthesize_minimal_run(agent_id: str, user_input: dict) -> dict:
    """Fallback when no chain and no static trace exist."""
    run_id = str(uuid.uuid4())[:8]
    steps = [
        {"step": 1, "action": "Receive user request", "details": str(user_input)},
        {"step": 2, "action": "Identify required tools", "details": "Loaded from agent manifest"},
        {"step": 3, "action": "Call mock tool", "details": "Mock execution (no live APIs)"},
        {"step": 4, "action": "Generate final answer", "details": f"Placeholder result for {agent_id}"},
        {"step": 5, "action": "Save run history", "details": f"run_id={run_id}"},
    ]
    final_output = {
        "message": f"Simulated run for '{agent_id}'. Add a static trace or tool chain for richer output.",
        "input": user_input,
    }
    result = {
        "run_id": run_id,
        "agent_id": agent_id,
        "user_input": user_input,
        "final_output": final_output,
        "status": "success",
        "message": f"Simulated run for '{agent_id}'.",
        "trace": {
            "agent_id": agent_id,
            "run_id": run_id,
            "status": "completed",
            "user_request": str(user_input),
            "steps": steps,
            "final_output": final_output,
        },
        "duration_ms": 25,
    }
    _save_trace(result)
    return result


def run_agent(agent_id: str, user_input: dict) -> dict:
    """Simulate running an agent with mock tools or a static trace fallback."""
    if agent_id == "budget_analyzer":
        if True:  # live path now has a repo-relative default, no config required
            try:
                return _run_budget_analyzer_live(user_input or {})
            except Exception as exc:
                fallback = _simulate_from_static_trace(
                    agent_id, user_input or {}
                ) or _synthesize_minimal_run(agent_id, user_input or {})
                fallback["status"] = "error"
                fallback["message"] = f"Live run failed ({exc}); showing mock trace instead."
                return fallback

    if agent_id in AGENT_CHAINS:
        return _run_tool_chain(agent_id, user_input or {})

    static_run = _simulate_from_static_trace(agent_id, user_input or {})
    if static_run:
        return static_run

    return _synthesize_minimal_run(agent_id, user_input or {})


def _run_tool_chain(agent_id: str, user_input: dict) -> dict:
    run_id = str(uuid.uuid4())[:8]
    start = time.time()
    steps: list[dict[str, Any]] = []
    outputs: dict[str, Any] = {}

    chain_builder = AGENT_CHAINS[agent_id]
    tool_steps = chain_builder(user_input, {})

    for i, (tool_id, _) in enumerate(tool_steps):
        refreshed_steps = chain_builder(user_input, outputs)
        _, kwargs = refreshed_steps[i]

        tool_fn = TOOL_DISPATCH[tool_id]
        t0 = time.time()
        output = tool_fn(**kwargs)
        latency = int((time.time() - t0) * 1000) + 15

        outputs[tool_id] = output
        steps.append(
            {
                "step": i + 1,
                "action": "Call mock tool",
                "tool_id": tool_id,
                "input": kwargs,
                "output": output,
                "status": "success",
                "latency_ms": latency,
            }
        )

    final_output = build_final_output(agent_id, outputs)
    duration = int((time.time() - start) * 1000)

    result = {
        "run_id": run_id,
        "agent_id": agent_id,
        "user_input": user_input,
        "final_output": final_output,
        "status": "success",
        "message": f"Simulated run for '{agent_id}' completed.",
        "trace": {
            "agent_id": agent_id,
            "run_id": run_id,
            "status": "completed",
            "user_request": str(user_input),
            "steps": steps,
            "final_output": final_output,
        },
        "duration_ms": duration,
    }
    _save_trace(result)
    return result


def _save_trace(result: dict) -> None:
    TRACES_DIR.mkdir(parents=True, exist_ok=True)
    # Persist a UI-friendly copy; keep full result for debugging
    path = TRACES_DIR / f"{result['agent_id']}_{result['run_id']}.json"
    path.write_text(json.dumps(result, indent=2), encoding="utf-8")
