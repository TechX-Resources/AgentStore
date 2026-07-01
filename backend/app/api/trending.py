# New router: returns trending agents based on installs (tie-break by rating)
from fastapi import APIRouter, Query
from typing import List
from pathlib import Path
import json

from app.models.schemas import AgentSummary

router = APIRouter()


@router.get("/agents/trending", response_model=List[AgentSummary])
def get_trending(n: int = Query(10, ge=1, le=50)):
    #Returns top-N trending agents sorted by installs (rating is the tie breaker)

    #Reads agent manifests from the local agents/manifests directory
    manifests_dir = Path(__file__).resolve().parents[3] / "agents" / "manifests"
    agents = []

    if not manifests_dir.exists():
        return []

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

    # sort by installs desc, then rating desc
    agents_sorted = sorted(agents, key=lambda a: (-a.get("installs", 0), -a.get("rating", 0.0)))

    top = agents_sorted[:n]
    return [AgentSummary(**a) for a in top]
