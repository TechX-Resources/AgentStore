import { Link } from 'react-router-dom'

export default function HomePage() {
  const categories = [
    { name: 'Productivity', icon: '⚡', desc: 'Email managers, calendar assistants, and agenda creators.' },
    { name: 'Developer Tools', icon: '💻', desc: 'Code reviewers, issue triagers, and commit summarizers.' },
    { name: 'Career', icon: '🎯', desc: 'Resume auditors, job matchers, and portfolio planners.' },
    { name: 'Data Analysis', icon: '📊', desc: 'Spreadsheet formatters, outlier finders, and chart builders.' },
    { name: 'Education', icon: '🎓', desc: 'Flashcard generators, study guide builders, and tutorial summaries.' },
    { name: 'Travel', icon: '✈️', desc: 'Flight deal finders, hotel scrapers, and itinerary planners.' },
    { name: 'Communication', icon: '💬', desc: 'Meeting summary writers, notes formatters, and draft generators.' },
    { name: 'Finance', icon: '💰', desc: 'Expense auditors, burn rate calculations, and budgets.' }
  ]

  const stats = [
    { number: '10+', label: 'AI Agents' },
    { number: '8', label: 'Power Tools' },
    { number: '34,200+', label: 'Market Runs' },
    { number: '100%', label: 'Simulation Ready' }
  ]

  return (
    <div className="fade-in">
      <section className="hero-section">
        <h1 className="hero-title-large">The App Store for AI Agents</h1>
        <p className="hero-subtitle">
          Discover, simulate, fork, and review specialized AI agents that execute complex multi-step workflows using integrated marketplace tools.
        </p>
        <div className="hero-buttons">
          <Link to="/agents" className="btn btn-primary" style={{ padding: '0.85rem 2rem', fontSize: '1rem' }}>
            Browse AI Agents
          </Link>
          <Link to="/tools" className="btn btn-secondary" style={{ padding: '0.85rem 2rem', fontSize: '1rem' }}>
            Explore Tools
          </Link>
        </div>
      </section>

      <div className="stats-grid">
        {stats.map((stat, i) => (
          <div key={i} className="stat-card">
            <div className="stat-card-content">
              <div className="stat-number">{stat.number}</div>
              <div className="stat-label">{stat.label}</div>
            </div>
          </div>
        ))}
      </div>

      <section style={{ marginBottom: '4rem' }}>
        <div className="section-header">
          <h2>Browse by Category</h2>
          <Link to="/agents">View All Agents →</Link>
        </div>
        <div className="categories-grid">
          {categories.map((cat, i) => (
            <Link
              key={i}
              to={`/agents?category=${encodeURIComponent(cat.name)}`}
              className="category-card"
            >
              <span className="category-icon">{cat.icon}</span>
              <h3>{cat.name}</h3>
              <p>{cat.desc}</p>
            </Link>
          ))}
        </div>
      </section>

      <div className="placeholder-notice" style={{ marginTop: '2rem' }}>
        <span style={{ fontSize: '1.25rem' }}>💡</span>
        <div>
          <strong>Developer Sandbox Mode Active:</strong> This application runs using a localized client database fallback. You can search, filter, test terminal execution traces, and write reviews in-memory without starting the backend!
        </div>
      </div>
    </div>
  )
}
