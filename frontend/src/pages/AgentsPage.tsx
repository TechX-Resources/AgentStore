import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import AgentCard from '../components/AgentCard'
import { fetchAgents, type AgentSummary } from '../api/client'
import { AgentGridSkeleton } from '../components/SkeletonLoader'

export default function AgentsPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const categoryParam = searchParams.get('category') || 'All'

  const [agents, setAgents] = useState<AgentSummary[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState('trending')

  const categories = [
    'All',
    'Productivity',
    'Developer Tools',
    'Career',
    'Data Analysis',
    'Education',
    'Travel',
    'Communication',
    'Finance',
    'Content Creation'
  ]

  useEffect(() => {
    setLoading(true)
    fetchAgents()
      .then((data) => {
        setAgents(data)
        setError(null)
      })
      .catch((e) => setError(e.message))
      .finally(() => {
        // Subtle simulated delay to showcase the beautiful skeleton loader shimmer
        setTimeout(() => setLoading(false), 600)
      })
  }, [])

  const handleCategorySelect = (category: string) => {
    if (category === 'All') {
      searchParams.delete('category')
    } else {
      searchParams.set('category', category)
    }
    setSearchParams(searchParams)
  }

  // Filter and sort agents logic
  const filteredAgents = agents
    .filter((agent) => {
      const matchesCategory = categoryParam === 'All' || agent.category.toLowerCase() === categoryParam.toLowerCase()
      const query = searchQuery.toLowerCase()
      const matchesSearch =
        agent.name.toLowerCase().includes(query) ||
        agent.description.toLowerCase().includes(query) ||
        agent.tags.some((t) => t.toLowerCase().includes(query))
      return matchesCategory && matchesSearch
    })
    .sort((a, b) => {
      if (sortBy === 'rating') return b.rating - a.rating
      if (sortBy === 'downloads') return b.downloads - a.downloads
      if (sortBy === 'name') return a.name.localeCompare(b.name)
      // Default: trending score (rating * downloads)
      const scoreA = a.rating * a.downloads
      const scoreB = b.rating * b.downloads
      return scoreB - scoreA
    })

  return (
    <div className="fade-in">
      <div style={{ marginBottom: '2rem' }}>
        <h1 className="page-title">Discover AI Agents</h1>
        <p style={{ color: 'var(--text-secondary)' }}>
          Browse specialized AI workers for code analysis, travel planner feeds, data cleaning, and email summaries.
        </p>
      </div>

      {/* Filter and Search Panel */}
      <div style={{
        background: 'var(--glass-bg)',
        border: '1px solid var(--glass-border)',
        borderRadius: '16px',
        padding: '1.25rem',
        marginBottom: '2rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem'
      }}>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          {/* Search bar */}
          <div style={{ flex: 1, position: 'relative', minWidth: '260px' }}>
            <input
              type="text"
              placeholder="🔍 Search agents, tags, categories..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="form-input"
              style={{ width: '100%', paddingLeft: '2.5rem' }}
            />
          </div>

          {/* Sort dropdown */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Sort By</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="form-input"
              style={{ background: 'var(--bg-secondary)', cursor: 'pointer' }}
            >
              <option value="trending">🔥 Trending</option>
              <option value="rating">⭐ Top Rated</option>
              <option value="downloads">📥 Downloads</option>
              <option value="name">🔤 Alphabetical</option>
            </select>
          </div>
        </div>

        {/* Category Pills */}
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', overflowX: 'auto', paddingBottom: '2px' }}>
          {categories.map((cat) => {
            const isActive = categoryParam.toLowerCase() === cat.toLowerCase()
            return (
              <button
                key={cat}
                onClick={() => handleCategorySelect(cat)}
                className="btn"
                style={{
                  padding: '0.4rem 0.9rem',
                  fontSize: '0.8rem',
                  borderRadius: '20px',
                  background: isActive ? 'var(--gradient-primary)' : 'rgba(255, 255, 255, 0.04)',
                  color: isActive ? 'white' : 'var(--text-secondary)',
                  border: isActive ? 'none' : '1px solid var(--glass-border)',
                }}
              >
                {cat}
              </button>
            )
          })}
        </div>
      </div>

      {loading ? (
        <AgentGridSkeleton />
      ) : error ? (
        <div className="placeholder-notice" style={{ borderColor: 'rgba(239, 68, 68, 0.2)', background: 'rgba(239, 68, 68, 0.08)', color: '#f87171' }}>
          ⚠️ <strong>API Error:</strong> Could not retrieve agent manifests from the server ({error}). Running in offline sandbox simulation mode.
        </div>
      ) : filteredAgents.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '4rem 1rem', background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', borderRadius: '16px' }}>
          <span style={{ fontSize: '3rem' }}>🔍</span>
          <h3 style={{ marginTop: '1rem', fontFamily: 'var(--font-heading)', fontSize: '1.25rem' }}>No Agents Found</h3>
          <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem', fontSize: '0.9rem' }}>
            Try adjusting your search filters or select a different category.
          </p>
          <button
            onClick={() => { setSearchQuery(''); handleCategorySelect('All') }}
            className="btn btn-secondary"
            style={{ marginTop: '1.25rem' }}
          >
            Clear Filters
          </button>
        </div>
      ) : (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1rem', fontWeight: 600 }}>
            <span>Showing {filteredAgents.length} agents</span>
            {categoryParam !== 'All' && <span>Filtered by Category: {categoryParam}</span>}
          </div>
          <div className="agent-grid">
            {filteredAgents.map((agent) => (
              <AgentCard key={agent.id} agent={agent} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
