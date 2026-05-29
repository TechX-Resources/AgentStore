"""Mock agent runner — simulates agent execution without real API calls."""

from pathlib import Path
import json
from typing import Optional


TRACES_DIR = Path(__file__).parent.parent / "traces"


def run_agent(agent_id: str, user_input: dict) -> dict:
    """Simulate running an agent with the given input.

    TODO: Implement full simulation flow:
      1. Load agent manifest
      2. Identify required tools
      3. Call mock tools (return canned responses)
      4. Build trace steps
      5. Generate final output
      6. Save run history

    For MVP skeleton, return a placeholder response.
    """
    return {
        "agent_id": agent_id,
        "status": "simulated",
        "message": "TODO: Implement agent runner simulation",
        "input_received": user_input,
    }


def get_trace_for_agent(agent_id: str) -> Optional[dict]:
    """Load a pre-built mock trace for an agent if one exists.

    TODO: Support loading traces by run_id
    TODO: Support listing all traces for an agent
    """
    trace_map = {
        "email_summarizer": "email_summarizer_trace.json",
        "github_issue_triage": "github_issue_triage_trace.json",
        "meeting_notes": "meeting_notes_trace.json",
    }

    trace_file = trace_map.get(agent_id)
    if not trace_file:
        return None

    trace_path = TRACES_DIR / trace_file
    if not trace_path.exists():
        return None

    with open(trace_path, encoding="utf-8") as f:
        return json.load(f)
