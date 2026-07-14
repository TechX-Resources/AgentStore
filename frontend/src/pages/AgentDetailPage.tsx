import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import {
  fetchAgent,
  fetchRatings,
  runAgent,
  submitRating,
  type Rating,
  type RunResult,
} from '../api/client'

/**
 * AgentDetailPage — agent overview, simulated run, ratings.
 */
export default function AgentDetailPage() {
  const { id } = useParams<{ id: string }>()
  const [agent, setAgent] = useState<Record<string, unknown> | null>(null)
  const [runResult, setRunResult] = useState<RunResult | null>(null)
  const [runError, setRunError] = useState<string | null>(null)
  const [ratings, setRatings] = useState<Rating[]>([])
  const [score, setScore] = useState(5)
  const [review, setReview] = useState('')
  const [ratingMsg, setRatingMsg] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id) return
    setLoading(true)
    Promise.all([fetchAgent(id), fetchRatings(id).catch(() => [] as Rating[])])
      .then(([a, r]) => {
        setAgent(a as unknown as Record<string, unknown>)
        setRatings(r)
      })
      .catch(() => setAgent(null))
      .finally(() => setLoading(false))
  }, [id])

  const handleRun = async () => {
    if (!id) return
    setRunError(null)
    setRunResult(null)
    try {
      const result = await runAgent(id, {})
      if (result.status !== 'success') {
        setRunError(result.message || `Run failed with status: ${result.status}`)
      }
      setRunResult(result)
    } catch (e) {
      setRunError(e instanceof Error ? e.message : 'Run failed — is the backend running?')
    }
  }

  const handleRating = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!id) return
    setRatingMsg(null)
    try {
      const saved = await submitRating(id, score, review)
      setRatings((prev) => [...prev, saved])
      setReview('')
      setRatingMsg('Thanks — rating submitted.')
    } catch (err) {
      setRatingMsg(err instanceof Error ? err.message : 'Could not submit rating')
    }
  }

  if (loading) return <p>Loading...</p>
  if (!agent) {
    return (
      <p>
        Agent not found. <Link to="/agents">Back to agents</Link>
      </p>
    )
  }

  return (
    <div>
      <Link to="/agents">← Back to agents</Link>
      <h1 className="page-title" style={{ marginTop: '1rem' }}>
        {String(agent.name)}
      </h1>
      <p style={{ color: '#6b7280', marginBottom: '1rem' }}>{String(agent.description)}</p>

      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        <button
          onClick={handleRun}
          style={{
            padding: '0.5rem 1rem',
            background: '#4f46e5',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
          }}
        >
          Run Agent (Simulated)
        </button>
        <button
          disabled
          style={{ padding: '0.5rem 1rem', background: '#e5e7eb', border: 'none', borderRadius: '6px' }}
        >
          Remix (TODO)
        </button>
        <button
          disabled
          style={{ padding: '0.5rem 1rem', background: '#e5e7eb', border: 'none', borderRadius: '6px' }}
        >
          Install (TODO)
        </button>
      </div>

      <section style={{ marginBottom: '1.5rem' }}>
        <h2>Details</h2>
        <ul style={{ marginTop: '0.5rem', lineHeight: 1.8 }}>
          <li>
            <strong>Category:</strong> {String(agent.category)}
          </li>
          <li>
            <strong>Rating:</strong> ★ {Number(agent.rating ?? 0).toFixed(1)}
          </li>
          <li>
            <strong>Tools:</strong>{' '}
            {(agent.tools_required as string[])?.join(', ') || 'None'}
          </li>
          <li>
            <strong>Example:</strong> {String(agent.example_use_case || 'N/A')}
          </li>
        </ul>
      </section>

      {runError && (
        <div className="placeholder-notice" style={{ marginBottom: '1rem' }}>
          {runError}
        </div>
      )}

      {runResult && (
        <section style={{ marginBottom: '1.5rem' }}>
          <h2>Run Result ({runResult.status})</h2>
          <pre
            style={{
              background: '#f3f4f6',
              padding: '1rem',
              borderRadius: '8px',
              overflow: 'auto',
              fontSize: '0.85rem',
            }}
          >
            {JSON.stringify(
              {
                message: runResult.message,
                output: runResult.output,
                trace: runResult.trace,
              },
              null,
              2,
            )}
          </pre>
        </section>
      )}

      <section>
        <h2>Ratings</h2>
        <form onSubmit={handleRating} style={{ margin: '0.75rem 0', display: 'grid', gap: '0.5rem', maxWidth: 420 }}>
          <label>
            Score{' '}
            <select value={score} onChange={(e) => setScore(Number(e.target.value))}>
              {[5, 4, 3, 2, 1].map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </label>
          <textarea
            placeholder="Optional review"
            value={review}
            onChange={(e) => setReview(e.target.value)}
            rows={3}
            style={{ padding: '0.5rem' }}
          />
          <button
            type="submit"
            style={{
              padding: '0.5rem 1rem',
              background: '#1a1a2e',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              width: 'fit-content',
            }}
          >
            Submit rating
          </button>
        </form>
        {ratingMsg && <p style={{ color: '#6b7280' }}>{ratingMsg}</p>}
        {ratings.length === 0 ? (
          <p style={{ color: '#6b7280' }}>No ratings yet.</p>
        ) : (
          <ul style={{ marginTop: '0.5rem', lineHeight: 1.6 }}>
            {ratings.map((r, idx) => (
              <li key={`${r.agent_id}-${idx}`}>
                ★ {r.score} — {r.review || '(no review text)'}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}
