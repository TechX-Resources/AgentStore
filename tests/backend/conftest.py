"""
Shared pytest fixtures for API tests.
"""

import sys
from pathlib import Path

import pytest
from fastapi.testclient import TestClient

BACKEND_DIR = Path(__file__).resolve().parents[2] / "backend"
sys.path.insert(0, str(BACKEND_DIR))

from app.main import app

@pytest.fixture
def client():
    """TestClient wired to the FastAPI app."""
    with TestClient(app) as c:
        yield c
 
 
@pytest.fixture
def existing_agent_id(client):
    """
    Dynamically fetches a real agent ID from the running app instead of hardcoding a guess.
    """
    response = client.get("/agents")
    agents = response.json()
    assert len(agents) > 0, "No agents returned — can't get a real ID"
    return agents[0]["id"]
 