"""Agent API routes."""

import sys
from pathlib import Path

from fastapi import APIRouter, HTTPException, Query
from typing import List
import json

from app.models.schemas import AgentSummary, AgentDetail
from app.rating_service import get_rating_stats

# Add agents package to path for registry access
REPO_ROOT = Path(__file__).parent.parent.parent.parent
sys.path.insert(0, str(REPO_ROOT))

from agents.registry.agent_registry import load_all_agents, get_agent_by_id  # noqa: E402

router = APIRouter()


@router.get("", response_model=list[AgentSummary])
def list_agents():
    agents = load_all_agents()
    result = []
    for a in agents:
        live_rating, _count = get_rating_stats(a["id"])
        result.append(
            AgentSummary(
                id=a["id"],
                name=a["name"],
                description=a["description"],
                category=a["category"],
                rating=live_rating,
                installs=a.get("installs", 0),
                downloads=a.get("downloads", 0),
                tags=a.get("tags", []),
                tools_required=a.get("tools_required", []),
            )
        )
    return result

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

            agent_id = data.get("id") or (data.get("name", "").lower().replace(" ", "_"))
            live_rating, _count = get_rating_stats(agent_id)
            agent = {
                "id": agent_id,
                "name": data.get("name", "Unnamed Agent"),
                "description": data.get("description", ""),
                "category": data.get("category", "uncategorized"),
                "rating": live_rating,
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
    agent = get_agent_by_id(agent_id)
    if not agent:
        raise HTTPException(status_code=404, detail=f"Agent '{agent_id}' not found")
    live_rating, _count = get_rating_stats(agent_id)
    return AgentDetail(**{**agent, "rating": live_rating})

