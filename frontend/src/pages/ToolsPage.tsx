import { useEffect, useState } from 'react'
import { fetchTools } from '../api/client'

interface Tool {
  id: string
  name: string
  description: string
  category: string
  permission_level: string
}

/**
 * ToolsPage — browse marketplace tools.
 *
 * TODO: Add tool detail page
 * TODO: Show input/output schemas
 * TODO: Link tools to agents that use them
 */
export default function ToolsPage() {
  const [tools, setTools] = useState<Tool[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchTools()
      .then((t) => setTools(t as Tool[]))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <p>Loading tools...</p>
  if (error) {
    return (
      <div>
        <h1 className="page-title">Browse Tools</h1>
        <div className="placeholder-notice">
          Could not load tools ({error}). Start the backend first.
        </div>
      </div>
    )
  }

  return (
    <div>
      <h1 className="page-title">Browse Tools</h1>
      <p style={{ marginBottom: '1rem', color: '#6b7280' }}>
        {tools.length} tools available for agents to use
      </p>
      <div className="agent-grid">
        {tools.map((tool) => (
          <div key={tool.id} className="agent-card" style={{ cursor: 'default' }}>
            <div className="agent-card-header">
              <h3>{tool.name}</h3>
              <span className="category">{tool.category}</span>
            </div>
            <p className="description">{tool.description}</p>
            <span className="tool-tag">{tool.permission_level} access</span>
          </div>
        ))}
      </div>
    </div>
  )
}
