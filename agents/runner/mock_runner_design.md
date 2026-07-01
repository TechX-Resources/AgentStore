# Mock Agent Runner Design

## Agent
GitHub Issue Triage Agent

## Purpose
Simulate agent execution without calling real GitHub APIs or LLMs.

## Agent -> Tools

github_issue_triage
    -> github_reader

## Mock Tool Output

github_reader:
[
  {
    "issue_number": 12,
    "title": "Frontend card does not show required tools"
  },
  {
    "issue_number": 15,
    "title": "Health endpoint response is too minimal"
  }
]

## Execution Flow

1. Receive user request
2. Load manifest
3. Validate inputs
4. Load mock issue data
5. Generate suggested labels
6. Assign priority
7. Suggest assignee
8. Return final output
9. Save trace

## Pseudocode

function run_agent(request):
    manifest = load_manifest()

    issues = github_reader_mock()

    triaged = analyze_issues(issues)

    save_trace()

    return triaged

## TODO

- Add trace IDs
- Add confidence scores
- Add validation errors
- Support multiple repositories
- Save execution timing metrics