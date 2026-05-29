"""Agent registry — loads and serves agent manifests."""

from pathlib import Path
import json
from typing import Optional


MANIFESTS_DIR = Path(__file__).parent.parent / "manifests"


def load_all_agents() -> list[dict]:
    """Load all agent manifests from the manifests directory.

    TODO: Implement — read all JSON files from agents/manifests/
    TODO: Validate against shared schema
    TODO: Cache loaded manifests for performance
    """
    agents = []
    if not MANIFESTS_DIR.exists():
        return agents

    for manifest_file in MANIFESTS_DIR.glob("*.json"):
        with open(manifest_file, encoding="utf-8") as f:
            agents.append(json.load(f))

    return agents


def get_agent_by_id(agent_id: str) -> Optional[dict]:
    """Return a single agent manifest by ID.

    TODO: Implement efficient lookup (dict index instead of linear scan)
    """
    for agent in load_all_agents():
        if agent.get("id") == agent_id:
            return agent
    return None


def get_agents_by_category(category: str) -> list[dict]:
    """Return agents filtered by category.

    TODO: Implement — filter load_all_agents() by category field
    """
    return [a for a in load_all_agents() if a.get("category") == category]
