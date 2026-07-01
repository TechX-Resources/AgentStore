# Study Buddy Runner Design

## Purpose

Define how the Study Buddy Agent runner should simulate execution before building more complex logic. This design intentionally avoids real external APIs and does not require a real LLM.

## Agent Chosen

- Agent: Study Buddy Agent
- Agent ID: `study_buddy`
- Manifest: `agents/manifests/study_buddy_agent.json`
- Required tools: `notes`, `web_search`

## What the Runner Should Do

The runner should take a user request such as:

- "Create a study plan for my calculus exam"
- "Make flashcards from my biology notes"

Then it should simulate a study-planning workflow by:

1. Reading the agent manifest.
2. Extracting required tools.
3. Building mock tool calls for `notes` and `web_search`.
4. Generating a structured study plan.
5. Producing flashcards and practice questions.
6. Returning a simulated trace plus final response.

## Input -> Tool -> Output Map

| Agent | Required Tools | Mock Tool Output | Final Response |
|------|----------------|------------------|----------------|
| Study Buddy Agent | `notes`, `web_search` | Notes tool returns note snippets, topic keywords, and any requested note IDs. Web search returns short learning references or beginner-friendly examples. | A timed study plan, flashcards, practice questions, and a short session summary. |

## Simulated Flow

### 1. Receive user request
- Read `topic`, `study_duration_minutes`, and optional `note_ids`.
- Normalize missing values.
- Default duration to 30 minutes if not provided.

### 2. Identify required tools
- Pull `tools_required` from the manifest.
- For Study Buddy, the expected tools are:
  - `notes`
  - `web_search`

### 3. Mock tool calls
- `notes`:
  - Simulate reading note content by note ID.
  - If note IDs are missing, simulate a generic note lookup for the topic.
- `web_search`:
  - Simulate a few search results for the study topic.
  - Return short snippets only, not live web content.

### 4. Process results
- Combine note snippets and search snippets.
- Select the most relevant concepts.
- Split the study session into review, recall, and practice segments.

### 5. Generate final output
- Build a study plan.
- Create flashcards.
- Create practice questions.
- Summarize the session outcome.

## Pseudocode

```text
function run_study_buddy(user_input):
    load study buddy manifest
    tools = manifest.tools_required
    topic = user_input.topic or "requested topic"
    duration = user_input.study_duration_minutes or 30
    note_ids = user_input.note_ids or []

    trace = []
    trace.add(step 1: receive request)
    trace.add(step 2: identify tools)

    notes_result = mock_notes_read(note_ids, topic)
    trace.add(step 3: mock notes tool call)

    search_result = mock_web_search(topic)
    trace.add(step 4: mock web search tool call)

    combined_points = merge(notes_result, search_result)
    study_plan = build_timed_plan(duration, combined_points)
    flashcards = build_flashcards(combined_points)
    practice_questions = build_practice_questions(combined_points)

    final_output = {
        study_plan,
        flashcards,
        practice_questions,
        session_summary
    }

    trace.add(step 5: process results)
    trace.add(step 6: generate final output)

    return {
        status: "simulated",
        trace,
        final_output
    }
```

## TODO Comments for Implementation

- TODO: Load the study buddy manifest from `agents/manifests/`.
- TODO: Read `tools_required` and build one mock step per tool.
- TODO: Simulate `notes` output using note IDs or topic keywords.
- TODO: Simulate `web_search` output with canned search snippets.
- TODO: Compose a deterministic study plan from the mock tool output.
- TODO: Return a trace object with steps, intermediate results, and final output.
- TODO: Keep the runner offline and deterministic.

## Example Mock Outputs

### Notes Tool

```text
Retrieved 2 class notes covering supervised learning, overfitting, and evaluation metrics.
```

### Web Search Tool

```text
Found 3 reference snippets for beginner-friendly examples and terminology.
```

### Final Response

```json
{
  "agent_id": "study_buddy",
  "status": "simulated",
  "message": "Generated fallback simulated execution",
  "trace": {
    "run_id": "run_study_001",
    "steps": []
  },
  "output": {
    "study_plan": [],
    "flashcards": [],
    "practice_questions": [],
    "session_summary": "Completed a simulated study session."
  }
}
```

## Acceptance Criteria

- No real external APIs are called.
- No real LLM is required.
- The runner works fully offline with deterministic mock data.
- The design clearly maps `study_buddy` to `notes` and `web_search`.
- The design includes a trace, intermediate results, and a final response.
- The design can be implemented without changing the agent manifest contract.
