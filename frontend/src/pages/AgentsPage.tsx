import { useEffect, useState } from 'react'
import AgentCard from '../components/AgentCard'
import { fetchAgents, type AgentSummary } from '../api/client'

/*
 * Mock data — used when the backend is not running.
 * Satisfies acceptance criteria: "Agent card displays real data from backend OR mock data."
 *
 * All fields match the AgentSummary interface in api/client.ts:
 *   id, name, description, category, rating, downloads, tags, tools_required
 *
 * TODO: Remove when backend /agents endpoint is stable.
 */
const MOCK_AGENTS: AgentSummary[] = [
  {
    id: 'email-summarizer',
    name: 'Email Summarizer',
    description:
      'Reads your inbox and generates concise bullet-point summaries for each thread, so you never miss an action item.',
    category: 'Productivity',
    rating: 4.7,
    downloads: 12843,
    tags: ['email', 'summarization', 'inbox'],
    tools_required: ['fetch_emails', 'summarize_text'],
  },
  {
    id: 'github-issue-triage',
    name: 'GitHub Issue Triage',
    description:
      'Scans open GitHub issues, classifies them by priority and type, and recommends which to fix first based on impact.',
    category: 'Developer Tools',
    rating: 4.5,
    downloads: 8201,
    tags: ['github', 'triage', 'issues'],
    tools_required: ['fetch_github_issues', 'triage_issues'],
  },
  {
    id: 'meeting-notes',
    name: 'Meeting Notes',
    description:
      'Transcribes recorded meetings and extracts a structured list of action items, owners, and due dates automatically.',
    category: 'Productivity',
    rating: 4.3,
    downloads: 5670,
    tags: ['meetings', 'transcription', 'action-items'],
    tools_required: ['transcribe_audio', 'extract_action_items'],
  },
  {
    id: 'weather-agent',
    name: 'Weather Agent',
    description:
      'Answers natural-language weather questions for any city. Returns current conditions, humidity, and wind speed.',
    category: 'Information',
    rating: 4.1,
    downloads: 3120,
    tags: ['weather', 'geocoding', 'real-time'],
    tools_required: ['geocode_tool', 'weather_lookup_tool', 'response_format_tool'],
  },
]

/**
 * AgentsPage — browse all marketplace agents.
 *
 * Falls back to MOCK_AGENTS when the backend is unavailable,
 * so the card UI can be reviewed without a running server.
 *
 * TODO: Add category filter, search, and trending sort
 * TODO: Connect to trending endpoint when data-science implements it
 */
export default function AgentsPage() {
  const [agents, setAgents] = useState<AgentSummary[]>([])
  const [loading, setLoading] = useState(true)
  const [usingMock, setUsingMock] = useState(false)

  useEffect(() => {
    fetchAgents()
      .then((data) => {
        setAgents(data)
        setUsingMock(false)
      })
      .catch(() => {
        // Backend not running — fall back to mock data so the card is always visible
        setAgents(MOCK_AGENTS)
        setUsingMock(true)
      })
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <p style={{ padding: '2rem', color: '#6b7280' }}>Loading agents…</p>

  return (
    <div>
      <h1 className="page-title">Browse Agents</h1>

      <p style={{ marginBottom: '0.5rem', color: '#6b7280' }}>
        {agents.length} agents available
      </p>

      {/* Mock data notice — visible only when backend is offline */}
      {usingMock && (
        <div className="placeholder-notice" style={{ marginBottom: '1.25rem' }}>
          Backend not detected — showing mock data. Start the backend with{' '}
          <code>uvicorn app.main:app --reload</code> from the <code>backend/</code> folder
          to load live agents.
        </div>
      )}

      <div className="agent-grid">
        {agents.map((agent) => (
          <AgentCard key={agent.id} agent={agent} />
        ))}
      </div>
    </div>
  )
}