"""Agent API routes."""

import sys
from pathlib import Path

from fastapi import APIRouter, HTTPException

# Add agents package to path for registry access
REPO_ROOT = Path(__file__).parent.parent.parent.parent
sys.path.insert(0, str(REPO_ROOT))

from agents.registry.agent_registry import load_all_agents, get_agent_by_id  # noqa: E402
from app.models.schemas import AgentSummary, AgentDetail  # noqa: E402

router = APIRouter()


@router.get("", response_model=list[AgentSummary])
def list_agents():
    """List all agents in the marketplace.

    TODO: Add pagination, filtering, and sorting
    TODO: Add trending sort option
    """
    agents = load_all_agents()
    return [
        AgentSummary(
            id=a["id"],
            name=a["name"],
            description=a["description"],
            category=a["category"],
            rating=a.get("rating", 0.0),
            downloads=a.get("downloads", 0),
            tags=a.get("tags", []),
            tools_required=a.get("tools_required", []),
        )
        for a in agents
    ]


@router.get("/{agent_id}", response_model=AgentDetail)
def get_agent(agent_id: str):
    """Get full details for a single agent.

    TODO: Include related tools metadata
    TODO: Include recent reviews summary
    """
    agent = get_agent_by_id(agent_id)
    if not agent:
        raise HTTPException(status_code=404, detail=f"Agent '{agent_id}' not found")
    return AgentDetail(**agent)
