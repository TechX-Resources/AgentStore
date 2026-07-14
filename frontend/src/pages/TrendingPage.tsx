import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { fetchTrending, type AgentSummary } from '../api/client'
import AgentCard from '../components/AgentCard'

/**
 * TrendingPage — agents ranked by installs then rating.
 */
export default function TrendingPage() {
  const [agents, setAgents] = useState<AgentSummary[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchTrending(10)
      .then(setAgents)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <p>Loading trending agents...</p>
  if (error) {
    return (
      <div>
        <h1 className="page-title">Trending Agents</h1>
        <div className="placeholder-notice">
          Could not load trending agents ({error}). Is the backend running?
        </div>
      </div>
    )
  }

  return (
    <div>
      <h1 className="page-title">Trending Agents</h1>
      <p style={{ marginBottom: '1rem', color: '#6b7280' }}>
        Ranked by installs and rating. <Link to="/agents">Browse all agents</Link>
      </p>
      <div className="agent-grid">
        {agents.map((agent) => (
          <AgentCard key={agent.id} agent={agent} />
        ))}
      </div>
    </div>
  )
}
