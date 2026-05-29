"""Agent registry and runner tests — placeholder."""

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent.parent.parent))

from agents.registry.agent_registry import load_all_agents, get_agent_by_id


def test_load_all_agents_returns_ten():
    agents = load_all_agents()
    assert len(agents) == 10


def test_get_agent_by_id():
    agent = get_agent_by_id("email_summarizer")
    assert agent is not None
    assert agent["name"] == "Email Summarizer Agent"


def test_get_agent_by_id_not_found():
    assert get_agent_by_id("nonexistent") is None
