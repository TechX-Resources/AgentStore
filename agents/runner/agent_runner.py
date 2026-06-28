"""
Mock agent runner — simulates agent execution without real API calls.
"""

import json
import time
import uuid
from pathlib import Path
from typing import Optional, Any

TRACES_DIR = Path(__file__).parent.parent / "traces"

# Mock Tools (no real APIs)
def mock_fetch_emails(limit: int = 5) -> dict:
    return {
        "emails": [
            {"from": "alice@example.com", "subject": "Q3 Budget Review", "snippet": "Please review the attached budget..."},
            {"from": "bob@corp.com", "subject": "Team standup notes", "snippet": "Action items from today's standup..."},
            {"from": "carol@vendor.com", "subject": "Invoice #4821", "snippet": "Please find attached invoice..."},
        ][:limit]
    }

def mock_summarize_text(text: str) -> dict:
    summary = text[:120].strip() + ("..." if len(text) > 120 else "")
    return {"summary": summary, "word_count": len(text.split())}

# Tool dispatch table
TOOL_DISPATCH = {
    "fetch_emails": mock_fetch_emails,
    "summarize_text": mock_summarize_text,
}

# email_summarizer

def email_chain(user_input: dict, prev: dict) -> list[tuple[str, dict]]:
    return [
        ("fetch_emails", {"limit": user_input.get("limit", 5)}),
        ("summarize_text", {
            "text": " | ".join(
                e["snippet"] for e in prev.get("fetch_emails", {}).get("emails", [])
            )
        }),
    ]

AGENT_CHAINS = {
    "email_summarizer": email_chain,
}

# Final Output Builder
def build_final_output(agent_id: str, outputs: dict) -> str:
    if agent_id == "email_summarizer":
        emails = outputs["fetch_emails"]["emails"]
        summary = outputs["summarize_text"]["summary"]
        return f"Summarized {len(emails)} emails: {summary}"
    return f"Agent '{agent_id}' executed successfully."

# Runner
def run_agent(agent_id: str, user_input: dict) -> dict:
    run_id = str(uuid.uuid4())[:8]
    start = time.time()
    trace = []
    outputs = {}

    if agent_id not in AGENT_CHAINS:
        return {
            "agent_id": agent_id,
            "status": "error",
            "message": f"Agent '{agent_id}' not found.",
            "input_received": user_input,
        }

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
        trace.append({
            "step": i + 1,
            "tool_id": tool_id,
            "input": kwargs,
            "output": output,
            "status": "success",
            "latency_ms": latency,
        })

    final_output = build_final_output(agent_id, outputs)
    duration = int((time.time() - start) * 1000)

    result = {
        "run_id": run_id,
        "agent_id": agent_id,
        "user_input": user_input,
        "final_output": final_output,
        "status": "success",
        "trace": trace,
        "duration_ms": duration,
    }

    _save_trace(result)
    return result

# Trace Loader
def get_trace_for_agent(agent_id: str) -> Optional[dict]:
    trace_map = {
        "email_summarizer": "email_summarizer_trace.json",
    }

    trace_file = trace_map.get(agent_id)
    if not trace_file:
        return None

    path = TRACES_DIR / trace_file
    if not path.exists():
        return None

    with open(path, encoding="utf-8") as f:
        return json.load(f)

# Save Trace
def _save_trace(result: dict) -> None:
    TRACES_DIR.mkdir(parents=True, exist_ok=True)
    path = TRACES_DIR / f"{result['agent_id']}_{result['run_id']}.json"
    path.write_text(json.dumps(result, indent=2), encoding="utf-8")

