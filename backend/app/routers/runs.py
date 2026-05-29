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
    """Simulate running an agent.

    TODO: Implement full mock execution via agent_runner
    TODO: Record run in storage
    TODO: Return complete trace
    """
    agent = get_agent_by_id(agent_id)
    if not agent:
        raise HTTPException(status_code=404, detail=f"Agent '{agent_id}' not found")

    result = run_agent(agent_id, request.input)
    trace = get_trace_for_agent(agent_id)

    return RunResponse(
        agent_id=agent_id,
        status=result.get("status", "simulated"),
        message=result.get("message", ""),
        trace=trace,
        output=trace.get("final_output") if trace else None,
    )


@router.get("/{agent_id}/traces")
def get_traces(agent_id: str):
    """Get tool-call traces for an agent.

    TODO: Support listing multiple traces by run_id
    TODO: Load traces from storage for dynamically generated runs
    """
    agent = get_agent_by_id(agent_id)
    if not agent:
        raise HTTPException(status_code=404, detail=f"Agent '{agent_id}' not found")

    trace = get_trace_for_agent(agent_id)
    if not trace:
        return {"agent_id": agent_id, "traces": [], "message": "No traces available yet"}

    return {"agent_id": agent_id, "traces": [trace]}
