import { useEffect, useState } from 'react'
import AgentCard from '../components/AgentCard'
import { fetchAgents, type AgentSummary } from '../api/client'

/**
 * AgentsPage — browse all marketplace agents.
 *
 * TODO: Add category filter, search, and trending sort
 * TODO: Connect to trending endpoint when data-science implements it
 */
export default function AgentsPage() {
  const [agents, setAgents] = useState<AgentSummary[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchAgents()
      .then(setAgents)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <p>Loading agents...</p>
  if (error) {
    return (
      <div>
        <h1 className="page-title">Browse Agents</h1>
        <div className="placeholder-notice">
          Could not load agents from API ({error}). Start the backend with{' '}
          <code>uvicorn app.main:app --reload</code> from the backend folder.
        </div>
        <p>Showing placeholder message — implement offline fallback in a future ticket.</p>
      </div>
    )
  }

  return (
    <div>
      <h1 className="page-title">Browse Agents</h1>
      <p style={{ marginBottom: '1rem', color: '#6b7280' }}>
        {agents.length} agents available
      </p>
      <div className="agent-grid">
        {agents.map((agent) => (
          <AgentCard key={agent.id} agent={agent} />
        ))}
      </div>
    </div>
  )
}
