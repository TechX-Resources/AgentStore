"""Health check API router."""

import sys
import time
from pathlib import Path
from fastapi import APIRouter

REPO_ROOT = Path(__file__).parent.parent.parent.parent
sys.path.insert(0, str(REPO_ROOT))

from agents.registry.agent_registry import load_all_agents    
from app.storage.json_store import read_json, ensure_data_dir  

router = APIRouter()

# Track server start time so uptime can be reported
_SERVER_START = time.time()

def _check_agents() -> dict:
    """Verify agent manifests are readable and count how many are loaded."""
    try:
        agents = load_all_agents()
        return {
            "status": "ok",
            "agent_count": len(agents),
            "manifests_dir": str(REPO_ROOT / "agents" / "manifests"),
        }
    except Exception as exc:
        return {"status": "error", "detail": str(exc), "agent_count": 0}


def _check_storage() -> dict:
    """Verify the JSON storage layer is readable and writable."""
    try:
        data_dir = ensure_data_dir()
        ratings = read_json("ratings.json")
        return {
            "status": "ok",
            "data_dir": str(data_dir),
            "ratings_count": len(ratings) if isinstance(ratings, list) else 0,
        }
    except Exception as exc:
        return {"status": "error", "detail": str(exc)}


def _check_traces() -> dict:
    """Verify the traces directory exists and count available trace files."""
    try:
        traces_dir = REPO_ROOT / "agents" / "traces"
        if not traces_dir.exists():
            return {"status": "missing", "trace_count": 0}
        trace_files = list(traces_dir.glob("*.json"))
        return {"status": "ok", "trace_count": len(trace_files)}
    except Exception as exc:
        return {"status": "error", "detail": str(exc)}

@router.get("")
def health():
    """Return overall system health.
    Returns status of every subsystem: agents registry, JSON storage, and
    traces directory. Use this endpoint to confirm the backend is fully
    operational before running agent simulations."""
    agents_check  = _check_agents()
    storage_check = _check_storage()
    traces_check  = _check_traces()

    all_ok = all(
        c.get("status") == "ok"
        for c in [agents_check, storage_check, traces_check]
    )

    return {
        "status":         "ok" if all_ok else "degraded",
        "uptime_seconds": round(time.time() - _SERVER_START, 1),
        "version":        "0.1.0",
        "services": {
            "agents":  agents_check,
            "storage": storage_check,
            "traces":  traces_check,
        },
    }


@router.get("/live")
def liveness():
    """Liveness probe. 
    Returns 200 immediately with no dependency checks.
    Used by Docker / Kubernetes to decide whether to restart the container.
    If this endpoint responds, the process is alive.
    """
    return {"status": "ok"}


@router.get("/ready")
def readiness():
    """Readiness probe — Checks agents registry and storage. Returns 200 only when both pass.
    Used by load balancers to decide whether to route traffic to this instance."""
    agents_check  = _check_agents()
    storage_check = _check_storage()

    ready = (
        agents_check.get("status") == "ok"
        and storage_check.get("status") == "ok"
    )

    return {
        "status": "ready" if ready else "not_ready",
        "checks": {
            "agents":  agents_check,
            "storage": storage_check,
        },
    }