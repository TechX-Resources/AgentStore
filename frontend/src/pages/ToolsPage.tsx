import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { fetchTools, fetchAgents, type Tool, type AgentSummary } from '../api/client'
import { ToolGridSkeleton } from '../components/SkeletonLoader'
import { SearchIcon, ShieldAlertIcon, KeyIcon, ToolIcon } from '../components/Icons'

export default function ToolsPage() {
  const [tools, setTools] = useState<Tool[]>([])
  const [agents, setAgents] = useState<AgentSummary[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All')
  
  const [openSchemas, setOpenSchemas] = useState<Record<string, 'input' | 'output' | null>>({})

  useEffect(() => {
    setLoading(true)
    Promise.all([fetchTools(), fetchAgents()])
      .then(([toolsData, agentsData]) => {
        setTools(toolsData)
        setAgents(agentsData)
        setError(null)
      })
      .catch((e) => setError(e.message))
      .finally(() => {
        setTimeout(() => setLoading(false), 500)
      })
  }, [])

  useEffect(() => {
    if (!loading && window.location.hash) {
      const id = window.location.hash.replace('#', '')
      const element = document.getElementById(id)
      if (element) {
        setTimeout(() => {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' })
          element.style.borderColor = 'var(--color-primary)'
          element.style.boxShadow = '0 0 20px rgba(199, 120, 221, 0.2)'
        }, 100)
      }
    }
  }, [loading])

  const toggleSchema = (toolId: string, type: 'input' | 'output') => {
    const current = openSchemas[toolId]
    setOpenSchemas({
      ...openSchemas,
      [toolId]: current === type ? null : type
    })
  }

  const categories = ['All', 'Productivity', 'Email', 'Developer', 'Data', 'Search', 'System']

  const filteredTools = tools.filter((tool) => {
    const matchesCategory = selectedCategory === 'All' || tool.category.toLowerCase() === selectedCategory.toLowerCase()
    const matchesSearch =
      tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tool.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tool.permissions_required.some((p) => p.toLowerCase().includes(searchQuery.toLowerCase()))
    return matchesCategory && matchesSearch
  })

  return (
    <div className="fade-in">
      <div style={{ marginBottom: '2rem' }}>
        <h1 className="page-title"><span className="harsh-style">#</span>tools</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
          Explore external services and APIs that AI agents use to perform active read and write workflows.
        </p>
      </div>

      {/* Filter and Search Panel */}
      <div style={{
        background: 'var(--glass-bg)',
        border: '1px solid var(--glass-border)',
        borderRadius: '0px',
        padding: '1.25rem',
        marginBottom: '2rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem'
      }}>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          {/* Search bar */}
          <div style={{ flex: 1, position: 'relative', minWidth: '260px', display: 'flex', alignItems: 'center' }}>
            <span style={{ position: 'absolute', left: '1rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center' }}>
              <SearchIcon size={16} />
            </span>
            <input
              type="text"
              placeholder="Search registry tools, permissions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="form-input"
              style={{ width: '100%', paddingLeft: '2.5rem' }}
            />
          </div>
        </div>

        {/* Category Pills */}
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          {categories.map((cat) => {
            const isActive = selectedCategory.toLowerCase() === cat.toLowerCase()
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className="btn"
                style={{
                  padding: '0.4rem 0.9rem',
                  fontSize: '0.75rem',
                  borderRadius: '0px',
                  background: isActive ? 'var(--color-primary)' : 'rgba(255, 255, 255, 0.03)',
                  color: isActive ? '#21252b' : 'var(--text-secondary)',
                  borderColor: isActive ? 'var(--color-primary)' : 'var(--glass-border)',
                }}
              >
                {cat}
              </button>
            )
          })}
        </div>
      </div>

      {loading ? (
        <ToolGridSkeleton />
      ) : error ? (
        <div className="placeholder-notice" style={{ borderColor: 'var(--color-danger)', background: 'rgba(224, 108, 117, 0.08)', color: 'var(--color-danger)' }}>
          <ShieldAlertIcon size={18} style={{ marginRight: '0.5rem' }} />
          <strong>API Error:</strong> Could not load registry tools ({error}). Running offline.
        </div>
      ) : filteredTools.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '4rem 1rem', background: 'var(--glass-bg)', border: '1px solid var(--glass-border)' }}>
          <span style={{ fontSize: '2.5rem', color: 'var(--color-primary)' }}>🛠️</span>
          <h3 style={{ marginTop: '1rem', fontFamily: 'var(--font-heading)', fontSize: '1.25rem' }}>No Tools Found</h3>
          <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem', fontSize: '0.9rem' }}>
            Try adjusting your query filters.
          </p>
        </div>
      ) : (
        <div className="agent-grid">
          {filteredTools.map((tool) => {
            const dependentAgents = agents.filter((agent) =>
              agent.tools_required.some((tId) => tId === tool.id)
            )
            const openSchemaType = openSchemas[tool.id]

            return (
              <div
                key={tool.id}
                id={tool.id}
                style={{
                  background: 'var(--glass-bg)',
                  border: '1px solid var(--glass-border)',
                  borderRadius: '0px',
                  padding: '1.5rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.75rem',
                  transition: 'all 0.2s ease-in-out',
                  position: 'relative'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'var(--color-primary)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'var(--glass-border)'
                }}
              >
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem' }}>
                  <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.25rem', fontWeight: 600 }}>{tool.name}</h3>
                  <span className="category" style={{ background: 'rgba(152, 195, 121, 0.15)', color: 'var(--color-accent)', borderColor: 'rgba(152, 195, 121, 0.2)' }}>
                    {tool.category}
                  </span>
                </div>

                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                  {tool.description}
                </p>

                {/* Permissions & Version */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8rem', color: 'var(--text-secondary)', borderTop: '1px dashed rgba(171, 178, 191, 0.15)', paddingTop: '0.75rem', marginTop: '0.25rem' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <KeyIcon size={14} color="var(--color-info)" />
                    Access:{' '}
                    <span style={{
                      fontWeight: 700,
                      color: tool.permission_level === 'read' ? 'var(--color-info)' :
                             tool.permission_level === 'write' ? 'var(--color-danger)' : 'var(--color-primary)'
                    }}>
                      {tool.permission_level.replace('_', ' ').toUpperCase()}
                    </span>
                  </span>
                  <span>v{tool.version}</span>
                </div>

                {/* Collapsible Schemas Accordion */}
                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                  <button
                    onClick={() => toggleSchema(tool.id, 'input')}
                    className="btn btn-secondary"
                    style={{ flex: 1, padding: '0.35rem', fontSize: '0.75rem' }}
                  >
                    {openSchemaType === 'input' ? '▲ hide-input' : '▼ show-input'}
                  </button>
                  <button
                    onClick={() => toggleSchema(tool.id, 'output')}
                    className="btn btn-secondary"
                    style={{ flex: 1, padding: '0.35rem', fontSize: '0.75rem' }}
                  >
                    {openSchemaType === 'output' ? '▲ hide-output' : '▼ show-output'}
                  </button>
                </div>

                {/* Schema display */}
                {openSchemaType && (
                  <pre style={{
                    background: '#282C33',
                    border: '1px solid var(--glass-border)',
                    padding: '0.85rem',
                    borderRadius: '0px',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.75rem',
                    overflowX: 'auto',
                    color: 'var(--color-warning)',
                    marginTop: '0.5rem'
                  }}>
                    {JSON.stringify(
                      openSchemaType === 'input' ? tool.input_schema : tool.output_schema,
                      null,
                      2
                    )}
                  </pre>
                )}

                {/* Linked Agents list */}
                <div style={{ borderTop: '1px dashed rgba(171, 178, 191, 0.15)', paddingTop: '0.75rem', marginTop: '0.5rem' }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '0.45rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <ToolIcon size={12} />
                    USED BY AGENTS:
                  </div>
                  {dependentAgents.length > 0 ? (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                      {dependentAgents.map((agent) => (
                        <Link
                          key={agent.id}
                          to={`/agents/${agent.id}`}
                          style={{
                            fontSize: '0.7rem',
                            background: 'rgba(199, 120, 221, 0.08)',
                            border: '1px solid rgba(199, 120, 221, 0.15)',
                            color: 'var(--color-primary)',
                            padding: '0.2rem 0.5rem',
                            borderRadius: '0px',
                            transition: 'all 0.2s ease'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = 'rgba(199, 120, 221, 0.2)'
                            e.currentTarget.style.color = '#ffffff'
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'rgba(199, 120, 221, 0.08)'
                            e.currentTarget.style.color = 'var(--color-primary)'
                          }}
                        >
                          {agent.name.replace(' Agent', '')}
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <span style={{ fontStyle: 'italic', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      No agents currently require this tool.
                    </span>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
