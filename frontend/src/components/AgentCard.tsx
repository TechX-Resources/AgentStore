import { Link } from 'react-router-dom'
import type { AgentSummary } from '../api/client'
import StarRating from './StarRating'
import './AgentCard.css'

interface Props {
  agent: AgentSummary
}

export default function AgentCard({ agent }: Props) {
  // Determine if agent is trending based on rating + downloads
  const isTrending = agent.rating >= 4.5 && agent.downloads >= 1000

  return (
    <Link to={`/agents/${agent.id}`} className="agent-card fade-in">
      {isTrending && (
        <div className="trending-badge">
          <span className="trending-pulse" />
          Trending
        </div>
      )}
      <div className="agent-card-header">
        <h3>{agent.name}</h3>
        <span className="category">{agent.category}</span>
      </div>
      <p className="description">{agent.description}</p>
      
      <div className="agent-card-footer">
        <div className="rating-container">
          <StarRating rating={agent.rating} size={14} />
          <span className="rating-num">{agent.rating.toFixed(1)}</span>
        </div>
        <span className="downloads">{agent.downloads.toLocaleString()} downloads</span>
      </div>

      {agent.tools_required && agent.tools_required.length > 0 && (
        <div className="tools">
          {agent.tools_required.map((tool) => (
            <span key={tool} className="tool-tag">
              🔧 {tool.replace('_', ' ')}
            </span>
          ))}
        </div>
      )}
    </Link>
  )
}
