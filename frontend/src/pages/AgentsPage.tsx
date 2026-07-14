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
    id: 'email_summarizer',
    name: 'Email Summarizer Agent',
    description:
      'Summarizes unread emails and highlights action items from your inbox.',
    category: 'Productivity',
    rating: 4.5,
    downloads: 1250,
    tags: ['email', 'productivity', 'summarization'],
    tools_required: ['gmail_reader'],
  },
  {
    id: 'github_issue_triage',
    name: 'GitHub Issue Triage Agent',
    description:
      'Analyzes open GitHub issues, suggests labels, priority, and assignees.',
    category: 'Developer Tools',
    rating: 4.7,
    downloads: 980,
    tags: ['github', 'developer', 'triage', 'issues'],
    tools_required: ['github_reader'],
  },
  {
    id: 'meeting_notes',
    name: 'Meeting Notes Agent',
    description:
      'Generates structured meeting notes with action items, decisions, and follow-ups.',
    category: 'Communication',
    rating: 4.8,
    downloads: 2300,
    tags: ['meetings', 'notes', 'communication', 'productivity'],
    tools_required: ['notes', 'calendar_reader'],
  },
  {
    id: 'resume_reviewer',
    name: 'Resume Reviewer Agent',
    description:
      'Reviews resume documents and provides actionable feedback for improvement.',
    category: 'Career',
    rating: 4.6,
    downloads: 2100,
    tags: ['career', 'resume', 'job-search'],
    tools_required: ['file_reader'],
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