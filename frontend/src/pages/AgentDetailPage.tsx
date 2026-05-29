import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { fetchAgent, runAgent } from '../api/client'

/**
 * AgentDetailPage — full agent detail view.
 *
 * TODO: Show tools required with links to tool pages
 * TODO: Show permissions, example prompts, reviews
 * TODO: Implement Run Agent button with trace viewer
 * TODO: Implement Remix/Fork button
 * TODO: Show version history
 */
export default function AgentDetailPage() {
  const { id } = useParams<{ id: string }>()
  const [agent, setAgent] = useState<Record<string, unknown> | null>(null)
  const [runResult, setRunResult] = useState<unknown>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id) return
    fetchAgent(id)
      .then((a) => setAgent(a as unknown as Record<string, unknown>))
      .catch(() => setAgent(null))
      .finally(() => setLoading(false))
  }, [id])

  const handleRun = async () => {
    if (!id) return
    try {
      const result = await runAgent(id, {})
      setRunResult(result)
    } catch {
      setRunResult({ error: 'Run failed — is the backend running?' })
    }
  }

  if (loading) return <p>Loading...</p>
  if (!agent) return <p>Agent not found. <Link to="/agents">Back to agents</Link></p>

  return (
    <div>
      <Link to="/agents">← Back to agents</Link>
      <h1 className="page-title" style={{ marginTop: '1rem' }}>{String(agent.name)}</h1>
      <p style={{ color: '#6b7280', marginBottom: '1rem' }}>{String(agent.description)}</p>

      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem' }}>
        <button onClick={handleRun} style={{ padding: '0.5rem 1rem', background: '#4f46e5', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>
          Run Agent (Simulated)
        </button>
        <button disabled style={{ padding: '0.5rem 1rem', background: '#e5e7eb', border: 'none', borderRadius: '6px' }}>
          Remix (TODO)
        </button>
        <button disabled style={{ padding: '0.5rem 1rem', background: '#e5e7eb', border: 'none', borderRadius: '6px' }}>
          Install (TODO)
        </button>
      </div>

      <section style={{ marginBottom: '1.5rem' }}>
        <h2>Details</h2>
        <ul style={{ marginTop: '0.5rem', lineHeight: 1.8 }}>
          <li><strong>Category:</strong> {String(agent.category)}</li>
          <li><strong>Rating:</strong> ★ {Number(agent.rating).toFixed(1)}</li>
          <li><strong>Tools:</strong> {(agent.tools_required as string[])?.join(', ') || 'None'}</li>
          <li><strong>Example:</strong> {String(agent.example_use_case || 'N/A')}</li>
        </ul>
      </section>

      {runResult && (
        <section>
          <h2>Run Result</h2>
          <pre style={{ background: '#f3f4f6', padding: '1rem', borderRadius: '8px', overflow: 'auto', fontSize: '0.85rem' }}>
            {JSON.stringify(runResult, null, 2)}
          </pre>
        </section>
      )}
    </div>
  )
}
