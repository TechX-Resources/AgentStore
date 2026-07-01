"""Pydantic models for AgentStore API."""

from pydantic import BaseModel, Field
from typing import Optional


class AgentSummary(BaseModel):
    """Summary view of an agent for listing pages."""

    id: str
    name: str
    description: str
    category: str
    rating: float = 0.0
    installs: int = 0
    downloads: int = 0
    tags: list[str] = Field(default_factory=list)
    tools_required: list[str] = Field(default_factory=list)


class AgentDetail(AgentSummary):
    """Full agent detail view."""

    creator: str = "Unknown"
    version: str = "1.0.0"
    status: str = "draft"
    runs: int = 0
    installs: int = 0
    permissions_required: list[str] = Field(default_factory=list)
    inputs: dict = Field(default_factory=dict)
    outputs: dict = Field(default_factory=dict)
    example_use_case: str = ""
    example_prompts: list[str] = Field(default_factory=list)


class ToolSummary(BaseModel):
    """Summary view of a marketplace tool."""

    id: str
    name: str
    description: str
    category: str
    permission_level: str = "read"


class ToolDetail(ToolSummary):
    """Full tool detail view."""

    version: str = "1.0.0"
    permissions_required: list[str] = Field(default_factory=list)
    input_schema: dict = Field(default_factory=dict)
    output_schema: dict = Field(default_factory=dict)
    mock_implementation_notes: str = ""


class RunRequest(BaseModel):
    """Request body for simulating an agent run."""

    input: dict = Field(default_factory=dict)


class RunResponse(BaseModel):
    """Response from a simulated agent run."""

    agent_id: str
    status: str
    message: str = ""
    trace: Optional[dict] = None
    output: Optional[dict] = None


class RatingCreate(BaseModel):
    """Request body for submitting a rating."""

    score: float = Field(ge=1.0, le=5.0)
    review: str = ""


class RatingResponse(BaseModel):
    """A single rating/review entry."""

    agent_id: str
    score: float
    review: str = ""
    # TODO: Add user_id, created_at when auth is implemented
