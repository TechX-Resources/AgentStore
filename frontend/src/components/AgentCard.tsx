import { Link } from 'react-router-dom'
import type { AgentSummary } from '../api/client'
import './AgentCard.css'

interface Props {
  agent: AgentSummary
}

/**
 * AgentCard — displays a single agent in the browse grid.
 *
 * TODO: Add install count, trending badge, category chip styling
 * TODO: Add star rating display component
 */
export default function AgentCard({ agent }: Props) {
  return (
    <Link to={`/agents/${agent.id}`} className="agent-card">
      <div className="agent-card-header">
        <h3>{agent.name}</h3>
        <span className="category">{agent.category}</span>
      </div>
      <p className="description">{agent.description}</p>
      <div className="agent-card-footer">
        <span className="rating">★ {agent.rating.toFixed(1)}</span>
        <span className="downloads">{agent.downloads.toLocaleString()} downloads</span>
      </div>
      {agent.tools_required.length > 0 && (
        <div className="tools">
          {agent.tools_required.map((tool) => (
            <span key={tool} className="tool-tag">{tool}</span>
          ))}
        </div>
      )}
    </Link>
  )
}
