import { useNavigate } from 'react-router-dom'
import type { AgentSummary } from '../api/client'
import './AgentCard.css'

interface Props {
  agent: AgentSummary
}

/*
 * Switched from <Link> wrapping to <article> + useNavigate() on the button — this is more accessible.

 * Shows: name, description, category, rating, downloads, tags, tools required.
 * Includes a "View Details" button (does not rely on the whole card being clickable).
 */

export default function AgentCard({ agent }: Props) {
  const navigate = useNavigate()

  const handleViewDetails = (e: React.MouseEvent) => {
    e.preventDefault()
    navigate(`/agents/${agent.id}`)
  }

  // Render star rating visually (filled + empty stars out of 5)
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

      {/* ── Header: name + category badge ── */}
      <div className="agent-card__header">
        <h3 className="agent-card__name">{agent.name}</h3>
        <span className="agent-card__category">{agent.category}</span>
      </div>

      {/* ── Description ── */}
      <p className="agent-card__description">{agent.description}</p>

      {/* ── Tags ── */}
      {agent.tags && agent.tags.length > 0 && (
        <div className="agent-card__tags">
          {agent.tags.map((tag) => (
            <span key={tag} className="tag">
              #{tag}
            </span>
          ))}
        </div>
      )}

      {/* ── Tools required ── */}
      {agent.tools_required && agent.tools_required.length > 0 && (
        <div className="agent-card__tools">
          <span className="tools-label">Tools:</span>
          {agent.tools_required.map((tool) => (
            <span key={tool} className="tool-chip">
              {tool}
            </span>
          ))}
        </div>
      )}

      {/* ── Footer: rating + downloads + CTA ── */}
      <div className="agent-card__footer">
        <div className="agent-card__stats">
          <span className="agent-card__rating" aria-label={`Rating: ${agent.rating.toFixed(1)} out of 5`}>
            {renderStars(agent.rating)}
            <span className="rating-value">{agent.rating.toFixed(1)}</span>
          </span>
          <span className="agent-card__downloads">
            ↓ {agent.downloads.toLocaleString()}
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