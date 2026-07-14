"""Agent run and trace API routes."""

import sys
from pathlib import Path

from fastapi import APIRouter, HTTPException

REPO_ROOT = Path(__file__).parent.parent.parent.parent
sys.path.insert(0, str(REPO_ROOT))

from agents.registry.agent_registry import get_agent_by_id  # noqa: E402
from agents.runner.agent_runner import run_agent, get_trace_for_agent  # noqa: E402
from app.models.schemas import RunRequest, RunResponse  # noqa: E402

router = APIRouter()


@router.post("/{agent_id}/run", response_model=RunResponse)
def simulate_run(agent_id: str, request: RunRequest):
    """Simulate running an agent and return the live result + trace."""
    agent = get_agent_by_id(agent_id)
    if not agent:
        raise HTTPException(status_code=404, detail=f"Agent '{agent_id}' not found")

    result = run_agent(agent_id, request.input or {})
    live_trace = result.get("trace") or get_trace_for_agent(agent_id)

    return RunResponse(
        agent_id=agent_id,
        status=result.get("status", "error"),
        message=result.get("message")
        or (
            result.get("final_output")
            if isinstance(result.get("final_output"), str)
            else "Run completed"
        ),
        trace=live_trace,
        output=result.get("final_output"),
    )


@router.get("/{agent_id}/traces")
def get_traces(agent_id: str):
    """Get tool-call traces for an agent (dynamic run or static example)."""
    agent = get_agent_by_id(agent_id)
    if not agent:
        raise HTTPException(status_code=404, detail=f"Agent '{agent_id}' not found")

    trace = get_trace_for_agent(agent_id)
    if not trace:
        return {"agent_id": agent_id, "traces": [], "message": "No traces available yet"}

    return {"agent_id": agent_id, "traces": [trace]}
