import { Link } from 'react-router-dom'
import { getCategoryIcon } from '../components/Icons'

export default function HomePage() {
  const categories = [
    { name: 'Productivity', desc: 'Email managers, calendar assistants, and agenda creators.' },
    { name: 'Developer Tools', desc: 'Code reviewers, issue triagers, and commit summarizers.' },
    { name: 'Career', desc: 'Resume auditors, job matchers, and portfolio planners.' },
    { name: 'Data Analysis', desc: 'Spreadsheet formatters, outlier finders, and chart builders.' },
    { name: 'Education', desc: 'Flashcard generators, study guide builders, and tutorial summaries.' },
    { name: 'Travel', desc: 'Flight deal finders, hotel scrapers, and itinerary planners.' },
    { name: 'Communication', desc: 'Meeting summary writers, notes formatters, and draft generators.' },
    { name: 'Finance', desc: 'Expense audits, burn rate calculations, and budgets.' }
  ]

  const stats = [
    { number: '10+', label: 'AI Agents' },
    { number: '8', label: 'Power Tools' },
    { number: '34,200+', label: 'Market Runs' },
    { number: '100%', label: 'Simulation Ready' }
  ]

  return (
    <div className="fade-in">
      <section className="hero-section" style={{ border: '1px solid var(--glass-border)', padding: '3rem 2rem', background: 'var(--bg-secondary)', marginBottom: '3rem' }}>
        <h1 className="hero-title-large"><span className="harsh-style">#</span>agent-store</h1>
        <p className="hero-subtitle" style={{ fontSize: '1.05rem', color: 'var(--text-secondary)', marginBottom: '2rem' }}>
          Discover, simulate, fork, and review specialized AI agents that execute complex multi-step workflows using integrated marketplace tools.
        </p>
        <div className="hero-buttons" style={{ marginBottom: 0 }}>
          <Link to="/agents" className="btn btn-primary" style={{ padding: '0.85rem 2rem', fontSize: '0.9rem' }}>
            view-agents &lt;~&gt;
          </Link>
          <Link to="/tools" className="btn btn-secondary" style={{ padding: '0.85rem 2rem', fontSize: '0.9rem' }}>
            explore-tools &ge;
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
          <h2><span className="harsh-style">#</span>categories</h2>
          <Link to="/agents" style={{ fontSize: '0.85rem' }}>View All Agents ~~&gt;</Link>
        </div>
        <div className="categories-grid">
          {categories.map((cat, i) => (
            <Link
              key={i}
              to={`/agents?category=${encodeURIComponent(cat.name)}`}
              className="category-card"
            >
              <div style={{ color: 'var(--color-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                {getCategoryIcon(cat.name, 24)}
              </div>
              <h3 style={{ fontFamily: 'var(--font-heading)' }}>{cat.name}</h3>
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
