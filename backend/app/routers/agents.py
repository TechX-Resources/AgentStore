"""Agent API routes."""

import sys
from pathlib import Path

from fastapi import APIRouter, HTTPException, Query
from typing import List
import json

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

@router.get("/trending", response_model=List[AgentSummary])
def trending(n: int = Query(10, ge=1, le=50)):
    """Return top-N trending agents by reading manifests from agents/manifests (installs desc, rating desc)."""
    manifests_dir = Path(__file__).resolve().parents[3] / "agents" / "manifests"
    agents = []

    if manifests_dir.exists():
        for p in sorted(manifests_dir.glob("*.json")):
            try:
                data = json.loads(p.read_text())
            except Exception:
                continue

            agent = {
                "id": data.get("id") or (data.get("name", "").lower().replace(" ", "_")),
                "name": data.get("name", "Unnamed Agent"),
                "description": data.get("description", ""),
                "category": data.get("category", "uncategorized"),
                "rating": float(data.get("rating") or 0.0),
                "installs": int(data.get("installs") or data.get("downloads") or 0),
                "downloads": int(data.get("downloads") or 0),
                "tags": data.get("tags") or [],
                "tools_required": data.get("tools_required") or [],
            }
            agents.append(agent)

    agents_sorted = sorted(agents, key=lambda a: (-a.get("installs", 0), -a.get("rating", 0.0)))
    return [AgentSummary(**a) for a in agents_sorted[:n]]


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

