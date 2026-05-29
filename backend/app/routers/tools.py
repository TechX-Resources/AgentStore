"""Tool API routes."""

import json
from pathlib import Path

from fastapi import APIRouter, HTTPException

from app.models.schemas import ToolSummary, ToolDetail

router = APIRouter()

TOOLS_DIR = Path(__file__).parent.parent.parent.parent / "tools" / "manifests"


def load_all_tools() -> list[dict]:
    """Load all tool manifests."""
    tools = []
    if not TOOLS_DIR.exists():
        return tools
    for f in TOOLS_DIR.glob("*.json"):
        with open(f, encoding="utf-8") as fh:
            tools.append(json.load(fh))
    return tools


def get_tool_by_id(tool_id: str) -> dict | None:
    for tool in load_all_tools():
        if tool.get("id") == tool_id:
            return tool
    return None


@router.get("", response_model=list[ToolSummary])
def list_tools():
    """List all tools in the marketplace.

    TODO: Add category filtering
    """
    return [
        ToolSummary(
            id=t["id"],
            name=t["name"],
            description=t["description"],
            category=t["category"],
            permission_level=t.get("permission_level", "read"),
        )
        for t in load_all_tools()
    ]


@router.get("/{tool_id}", response_model=ToolDetail)
def get_tool(tool_id: str):
    """Get full details for a single tool."""
    tool = get_tool_by_id(tool_id)
    if not tool:
        raise HTTPException(status_code=404, detail=f"Tool '{tool_id}' not found")
    return ToolDetail(**tool)
