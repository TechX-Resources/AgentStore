"""
Covers :
  - GET /agents returns 10 agents
  - GET /agents/{id} returns 404 for unknown ID
  - GET /tools returns 8 tools
  - POST /agents/{id}/run returns simulated response
  - POST /agents/{id}/ratings stores rating
"""

import pytest

# GET /agents tests

def test_get_agents_returns_10_agents(client):
    response = client.get("/agents")
    assert response.status_code == 200
    agents = response.json()
    assert len(agents) == 10
  
def test_get_agents_returns_expected_shape(client):
    response = client.get("/agents")
    agents = response.json()
    first = agents[0]
    expected_fields = {
        "id",
        "name",
        "description",
        "category",
        "rating",
        "installs",
        "downloads",
        "tags",
        "tools_required",
    }
    assert expected_fields.issubset(first.keys())


# GET /agents/{id} tests

def test_get_agent_by_id_returns_404_for_unknown_id(client):
    response = client.get("/agents/not-real")
    assert response.status_code == 404

def test_get_agent_by_id_returns_200_for_known_id(client, existing_agent_id):
    response = client.get(f"/agents/{existing_agent_id}")
    assert response.status_code == 200
    assert response.json()["id"] == existing_agent_id


# GET /tools test

def test_get_tools_returns_8_tools(client):
    response = client.get("/tools")
    assert response.status_code == 200
    tools = response.json()
    assert len(tools) == 8


# POST /agents/{id}/run test

def test_run_agent_returns_simulated_response(client, existing_agent_id):
    payload = {"input": {"query": "Hello, agent!"}}
    response = client.post(f"/agents/{existing_agent_id}/run", json=payload)
    assert response.status_code == 200 # Response received

    # Validate format of response
    data = response.json()
    assert data["agent_id"] == existing_agent_id
    assert "status" in data
    assert "message" in data
    assert "output" in data
    assert "trace" in data


# POST /agents/{id}/ratings test

def test_post_rating_stores_rating(client, existing_agent_id):
    payload = {"score": 5, "review": "Good agent"}
    post_response = client.post(
        f"/agents/{existing_agent_id}/ratings", json=payload
    )
    assert post_response.status_code == 200
 
    posted = post_response.json()
    assert posted["agent_id"] == existing_agent_id
    assert posted["score"] == 5
    assert posted["review"] == "Good agent"
 
    # Confirm it was actually stored
    get_response = client.get(f"/agents/{existing_agent_id}/ratings")
    assert get_response.status_code == 200
    ratings = get_response.json()
    assert any(
        r["score"] == 5 and r["review"] == "Good agent" for r in ratings
    )