import { Link } from 'react-router-dom'
import type { AgentSummary } from '../api/client'
import StarRating from './StarRating'
import { getCategoryIcon } from './Icons'
import './AgentCard.css'

interface Props {
  agent: AgentSummary
}

export default function AgentCard({ agent }: Props) {
  const isTrending = agent.rating >= 4.5 && agent.downloads >= 1000

  return (
    <div className="works-project-card fade-in">
      {/* Top bar listing tags (like technologies list in portfolio cards) */}
      <div className="card-project-lang-used">
        {agent.tags.join(', ')}
      </div>
      
      <div className="project-desc">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem', marginBottom: '0.5rem' }}>
          <h2 className="project-title">{agent.name}</h2>
          <div style={{ display: 'flex', gap: '0.25rem', alignItems: 'center' }}>
            {getCategoryIcon(agent.category, 14, 'var(--color-primary)')}
            <span style={{ fontSize: '0.75rem', color: 'var(--color-primary)', fontWeight: 600 }}>{agent.category}</span>
          </div>
        </div>
        
        <p className="desc-of-proj">{agent.description}</p>
        
        {/* Rating and downloads stats in unified dashboard */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '1rem 0 0.75rem', fontSize: '0.8rem', borderTop: '1px dashed rgba(171, 178, 191, 0.15)', paddingTop: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <StarRating rating={agent.rating} size={12} />
            <span style={{ fontWeight: 700, color: 'var(--color-warning)' }}>{agent.rating.toFixed(1)}</span>
          </div>
          <span style={{ color: 'var(--text-muted)' }}>📥 {agent.downloads.toLocaleString()} downloads</span>
        </div>

        <div className="card-btns">
          <Link to={`/agents/${agent.id}`} className="live-btn">
            view &lt;~&gt;
          </Link>
          {isTrending && (
            <span className="code-btn" style={{ borderColor: 'var(--color-secondary)', color: 'var(--color-secondary)', cursor: 'default' }}>
              trending!
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
