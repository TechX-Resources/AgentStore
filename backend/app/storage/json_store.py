"""JSON file storage layer for AgentStore."""

from pathlib import Path
import json
import logging
import os
from typing import Any, Optional

import jsonschema

logger = logging.getLogger(__name__)

DATA_DIR = Path(__file__).parent / "data"
SCHEMA_PATH = (
    Path(__file__).parent.parent.parent.parent
    / "shared"
    / "schemas"
    / "agent_manifest.schema.json"
)

# Files that are agent-manifest shaped and should be schema-validated on write
MANIFEST_LIKE_FILES = {"agent_manifest.json"}


def ensure_data_dir() -> Path:
    """Ensure the data directory exists."""
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    return DATA_DIR


def read_json(filename: str) -> Optional[Any]:
    """Read a JSON file from the data directory.

    Returns None if the file doesn't exist or cannot be parsed.
    Callers should apply their own defaults (e.g. [] for ratings).
    """
    path = ensure_data_dir() / filename
    if not path.exists():
        return None

    try:
        with open(path, "r", encoding="utf-8") as f:
            return json.load(f)
    except (json.JSONDecodeError, OSError) as e:
        logger.error("Failed to read or parse %s: %s", filename, e)
        return None


def write_json(filename: str, data: Any, *, validate_manifest: bool = False) -> None:
    """Write data to a JSON file using an atomic replace.

    Schema validation against agent_manifest is opt-in (validate_manifest=True)
    so ratings/reviews lists are not incorrectly checked as agent manifests.
    """
    path = ensure_data_dir() / filename

    if validate_manifest or filename in MANIFEST_LIKE_FILES:
        if not SCHEMA_PATH.exists():
            raise FileNotFoundError(f"Required validation schema not found at: {SCHEMA_PATH}")
        try:
            with open(SCHEMA_PATH, "r", encoding="utf-8") as s:
                schema = json.load(s)
            jsonschema.validate(instance=data, schema=schema)
        except jsonschema.ValidationError as ve:
            logger.error("Schema validation failed for %s: %s", filename, ve.message)
            raise
        except (json.JSONDecodeError, OSError) as e:
            logger.error("Failed to load or parse the schema file: %s", e)
            raise

    tmp_path = path.with_suffix(f"{path.suffix}.tmp")
    try:
        with open(tmp_path, "w", encoding="utf-8") as f:
            json.dump(data, f, indent=2, ensure_ascii=False)
        os.replace(tmp_path, path)
    except Exception as e:
        logger.error("Atomic write failed for %s: %s", filename, e)
        if tmp_path.exists():
            try:
                tmp_path.unlink()
            except OSError:
                pass
        raise
