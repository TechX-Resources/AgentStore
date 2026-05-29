import { Link } from 'react-router-dom'

export default function HomePage() {
  return (
    <div>
      <h1 className="page-title">Welcome to AgentStore</h1>
      <p style={{ marginBottom: '1.5rem', color: '#6b7280' }}>
        The App Store for Agents — discover, run, remix, and rate AI agents.
      </p>
      <div className="placeholder-notice">
        This is a skeleton UI. Students will implement full features via Kanban tickets.
      </div>
      <div style={{ display: 'flex', gap: '1rem' }}>
        <Link to="/agents" style={{ padding: '0.75rem 1.5rem', background: '#4f46e5', color: 'white', borderRadius: '8px' }}>
          Browse Agents
        </Link>
        <Link to="/tools" style={{ padding: '0.75rem 1.5rem', background: '#e5e7eb', color: '#1a1a2e', borderRadius: '8px' }}>
          Browse Tools
        </Link>
      </div>
    </div>
  )
}
