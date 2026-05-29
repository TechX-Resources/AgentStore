#!/usr/bin/env python3
"""Validate all agent and tool manifests against shared JSON schemas.

TODO: Implement full JSON Schema validation using jsonschema library.
"""

import json
from pathlib import Path

REPO_ROOT = Path(__file__).parent.parent


def validate_manifests():
    agent_dir = REPO_ROOT / "agents" / "manifests"
    tool_dir = REPO_ROOT / "tools" / "manifests"

    agent_count = len(list(agent_dir.glob("*.json")))
    tool_count = len(list(tool_dir.glob("*.json")))

    print(f"Found {agent_count} agent manifests")
    print(f"Found {tool_count} tool manifests")

    # Basic JSON parse check
    errors = []
    for directory, label in [(agent_dir, "agent"), (tool_dir, "tool")]:
        for f in directory.glob("*.json"):
            try:
                with open(f, encoding="utf-8") as fh:
                    json.load(fh)
            except json.JSONDecodeError as e:
                errors.append(f"{label} {f.name}: {e}")

    if errors:
        print("ERRORS:")
        for e in errors:
            print(f"  - {e}")
        return 1

    print("All manifests are valid JSON.")
    print("TODO: Add JSON Schema validation against shared/schemas/")
    return 0


if __name__ == "__main__":
    raise SystemExit(validate_manifests())
