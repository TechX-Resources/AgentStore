import { useNavigate } from 'react-router-dom'
import type { AgentSummary } from '../api/client'
import './AgentCard.css'

interface Props {
  agent: AgentSummary
}

export default function AgentCard({ agent }: Props) {
  const navigate = useNavigate()

  const handleViewDetails = (e: React.MouseEvent) => {
    e.preventDefault()
    navigate(`/agents/${agent.id}`)
  }

  const renderStars = (rating: number) => {
    const filled = Math.round(rating)
    return Array.from({ length: 5 }, (_, i) => (
      <span key={i} className={i < filled ? 'star star--filled' : 'star star--empty'}>
        ★
      </span>
    ))
  }

  return (
    <article className="agent-card">
      <div className="agent-card__header">
        <h3 className="agent-card__name">{agent.name}</h3>
        <span className="agent-card__category">{agent.category}</span>
      </div>

      <p className="agent-card__description">{agent.description}</p>

      {agent.tags && agent.tags.length > 0 && (
        <div className="agent-card__tags">
          {agent.tags.map((tag) => (
            <span key={tag} className="tag">#{tag}</span>
          ))}
        </div>
      )}

      {agent.tools_required && agent.tools_required.length > 0 && (
        <div className="agent-card__tools">
          <span className="tools-label">Tools:</span>
          {agent.tools_required.map((tool) => (
            <span key={tool} className="tool-chip">{tool}</span>
          ))}
        </div>
      )}

      <div className="agent-card__footer">
        <div className="agent-card__stats">
          {agent.rating != null ? (
            <span className="agent-card__rating" aria-label={`Rating: ${agent.rating.toFixed(1)} out of 5`}>
              {renderStars(agent.rating)}
              <span className="rating-value">{agent.rating.toFixed(1)}</span>
            </span>
          ) : (
            <span className="agent-card__rating agent-card__rating--empty">No ratings yet</span>
          )}
          <span className="agent-card__downloads">
            ↓ {(agent.downloads ?? 0).toLocaleString()}
          </span>
        </div>
        <button
          className="agent-card__cta"
          onClick={handleViewDetails}
          aria-label={`View details for ${agent.name}`}
        >
          View Details
        </button>
      </div>
    </article>
  )
}