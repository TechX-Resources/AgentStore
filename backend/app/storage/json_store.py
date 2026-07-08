"""JSON file storage layer for AgentStore."""
from pathlib import Path
import json
import logging
import os
from typing import Any
import jsonschema

# Setup basic logging for error handling
logger = logging.getLogger(__name__)

DATA_DIR = Path(__file__).parent / "data"
SCHEMA_PATH = Path(__file__).parent.parent.parent.parent / "shared" / "schemas" / "agent_manifest.schema.json"

def ensure_data_dir() -> Path:
    """Ensure the data directory exists."""
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    return DATA_DIR


def read_json(filename: str) -> Any:
    """Read a JSON file from the data directory.
    
    Returns an empty dictionary if the file doesn't exist or is corrupted.
    """
    path = ensure_data_dir() / filename
    if not path.exists():
        return {}

    try:
        with open(path, "r", encoding="utf-8") as f:
            return json.load(f)
    except (json.JSONDecodeError, IOError) as e:
        logger.error(f"Failed to read or parse {filename}: {e}")
        return {}


def write_json(filename: str, data: Any) -> None:
    """Write data to a JSON file in the data directory using atomic writes.
    
    Always validates the data against the agent manifest schema.
    """
    path = ensure_data_dir() / filename

    # 1. Mandatory Validation Layer
    if not SCHEMA_PATH.exists():
        raise FileNotFoundError(f"Required validation schema not found at: {SCHEMA_PATH}")

    try:
        with open(SCHEMA_PATH, "r", encoding="utf-8") as s:
            schema = json.load(s)
        jsonschema.validate(instance=data, schema=schema)
    except jsonschema.ValidationError as ve:
        logger.error(f"Schema validation failed for {filename}: {ve.message}")
        raise ve
    except (json.JSONDecodeError, IOError) as e:
        logger.error(f"Failed to load or parse the schema file: {e}")
        raise e

    # 2. Atomic Write Layer
    tmp_path = path.with_suffix(f"{path.suffix}.tmp")
    try:
        with open(tmp_path, "w", encoding="utf-8") as f:
            json.dump(data, f, indent=2, ensure_ascii=False)
        
        os.replace(tmp_path, path)
    except Exception as e:
        logger.error(f"Atomic write failed for {filename}: {e}")
        if tmp_path.exists():
            try:
                tmp_path.unlink()
            except OSError:
                pass
        raise e