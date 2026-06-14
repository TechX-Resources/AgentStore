import './SkeletonLoader.css'

export function AgentCardSkeleton() {
  return (
    <div className="skeleton-card">
      <div className="skeleton-header">
        <div className="skeleton-box title" />
        <div className="skeleton-box category-badge" />
      </div>
      <div className="skeleton-box description-line-1" />
      <div className="skeleton-box description-line-2" />
      <div className="skeleton-footer">
        <div className="skeleton-box rating-pill" />
        <div className="skeleton-box downloads-pill" />
      </div>
      <div className="skeleton-tools">
        <div className="skeleton-box tool-tag-pill" />
        <div className="skeleton-box tool-tag-pill" />
      </div>
    </div>
  )
}

export function AgentGridSkeleton() {
  return (
    <div className="agent-grid">
      {Array.from({ length: 6 }).map((_, i) => (
        <AgentCardSkeleton key={i} />
      ))}
    </div>
  )
}

export function AgentDetailSkeleton() {
  return (
    <div className="skeleton-detail fade-in">
      <div className="skeleton-box back-link" />
      <div className="skeleton-cols">
        <div className="skeleton-left-col">
          <div className="skeleton-box hero-avatar" />
          <div className="skeleton-box hero-title" />
          <div className="skeleton-box hero-desc" />
          <div className="skeleton-button-row">
            <div className="skeleton-box action-btn" />
            <div className="skeleton-box action-btn" />
            <div className="skeleton-box action-btn" />
          </div>
          <div className="skeleton-section">
            <div className="skeleton-box section-title" />
            <div className="skeleton-box list-item" />
            <div className="skeleton-box list-item" />
            <div className="skeleton-box list-item" />
          </div>
        </div>
        <div className="skeleton-right-col">
          <div className="skeleton-box card-box" />
          <div className="skeleton-box card-box" style={{ height: '300px' }} />
        </div>
      </div>
    </div>
  )
}

export function ToolCardSkeleton() {
  return (
    <div className="skeleton-card">
      <div className="skeleton-header">
        <div className="skeleton-box title" style={{ width: '40%' }} />
        <div className="skeleton-box category-badge" style={{ width: '20%' }} />
      </div>
      <div className="skeleton-box description-line-1" style={{ width: '90%' }} />
      <div className="skeleton-box description-line-2" style={{ width: '70%' }} />
      <div className="skeleton-box permission" style={{ width: '30%', height: '18px', marginTop: '1rem' }} />
    </div>
  )
}

export function ToolGridSkeleton() {
  return (
    <div className="agent-grid">
      {Array.from({ length: 8 }).map((_, i) => (
        <ToolCardSkeleton key={i} />
      ))}
    </div>
  )
}
