"""JSON file storage layer for AgentStore."""

from pathlib import Path
import json
from typing import Any


DATA_DIR = Path(__file__).parent / "data"


def ensure_data_dir() -> Path:
    """Ensure the data directory exists."""
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    return DATA_DIR


def read_json(filename: str) -> Any:
    """Read a JSON file from the data directory.

    TODO: Add error handling and default empty structures
    """
    path = ensure_data_dir() / filename
    if not path.exists():
        return None
    with open(path, encoding="utf-8") as f:
        return json.load(f)


def write_json(filename: str, data: Any) -> None:
    """Write data to a JSON file in the data directory.

    TODO: Add atomic writes and validation
    """
    path = ensure_data_dir() / filename
    ensure_data_dir()
    with open(path, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2)
