import { useEffect, useState, useRef } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { fetchAgent, runAgent, fetchReviews, addReview, forkAgent, type Agent, type Review, type Trace } from '../api/client'
import StarRating from '../components/StarRating'
import { AgentDetailSkeleton } from '../components/SkeletonLoader'

export default function AgentDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const [agent, setAgent] = useState<Agent | null>(null)
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Simulation run state
  const [inputsState, setInputsState] = useState<Record<string, string>>({})
  const [running, setRunning] = useState(false)
  const [runTrace, setRunTrace] = useState<Trace | null>(null)
  const [currentStepIndex, setCurrentStepIndex] = useState(-1)
  const terminalBottomRef = useRef<HTMLDivElement>(null)

  // Remix Modal state
  const [showRemix, setShowRemix] = useState(false)
  const [remixName, setRemixName] = useState('')
  const [remixing, setRemixing] = useState(false)

  // Install State
  const [installed, setInstalled] = useState(false)
  const [installing, setInstalling] = useState(false)

  // Review Form state
  const [reviewName, setReviewName] = useState('')
  const [reviewRating, setReviewRating] = useState(5)
  const [reviewComment, setReviewComment] = useState('')
  const [submittingReview, setSubmittingReview] = useState(false)

  // JSON schema collapse states
  const [inputsOpen, setInputsOpen] = useState(true)
  const [outputsOpen, setOutputsOpen] = useState(true)

  useEffect(() => {
    if (!id) return
    setLoading(true)
    Promise.all([fetchAgent(id), fetchReviews(id)])
      .then(([agentData, reviewsData]) => {
        setAgent(agentData)
        setReviews(reviewsData)
        
        // Initialize inputs inputs default values
        const defaults: Record<string, string> = {}
        if (agentData.inputs && agentData.inputs.properties) {
          Object.entries(agentData.inputs.properties).forEach(([key, prop]) => {
            defaults[key] = prop.enum ? prop.enum[0] : ''
          })
        }
        setInputsState(defaults)
        setError(null)
      })
      .catch((err) => {
        setError(err.message)
        setAgent(null)
      })
      .finally(() => {
        setTimeout(() => setLoading(false), 500)
      })
  }, [id])

  // Scroll terminal automatically during simulation steps
  useEffect(() => {
    if (running && terminalBottomRef.current) {
      terminalBottomRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [currentStepIndex, running])

  if (loading) return <AgentDetailSkeleton />
  if (error || !agent) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem 1rem' }}>
        <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.75rem' }}>Agent Not Found</h2>
        <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
          Could not locate listing ID: {id}
        </p>
        <Link to="/agents" className="btn btn-primary" style={{ marginTop: '1.5rem' }}>
          ← Back to Marketplace
        </Link>
      </div>
    )
  }

  // Handle run simulation
  const handleExecute = async (e: React.FormEvent) => {
    e.preventDefault()
    if (running) return

    setRunning(true)
    setRunTrace(null)
    setCurrentStepIndex(-1)

    try {
      const trace = await runAgent(agent.id, inputsState)
      setRunTrace(trace)
      
      // Animate execution logs stepping
      let stepIdx = 0
      const interval = setInterval(() => {
        setCurrentStepIndex(stepIdx)
        stepIdx++
        if (stepIdx >= trace.steps.length) {
          clearInterval(interval)
          setRunning(false)
        }
      }, 700)
    } catch {
      setRunning(false)
    }
  }

  // Handle remix listing
  const handleRemixSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!remixName.trim()) return
    setRemixing(true)
    try {
      const result = await forkAgent(agent.id, remixName.trim())
      setTimeout(() => {
        setRemixing(false)
        setShowRemix(false)
        setRemixName('')
        navigate(`/agents/${result.id}`)
      }, 1000)
    } catch (err) {
      setRemixing(false)
      alert('Remix failed')
    }
  }

  // Handle simulated install count
  const handleInstallToggle = () => {
    if (installed) {
      setInstalled(false)
    } else {
      setInstalling(true)
      setTimeout(() => {
        setInstalling(false)
        setInstalled(true)
      }, 1200)
    }
  }

  // Handle review submit
  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!reviewComment.trim()) return
    setSubmittingReview(true)
    try {
      const newReview = await addReview(agent.id, {
        rating: reviewRating,
        review: reviewComment.trim(),
        user: reviewName.trim() || 'Anonymous Developer'
      })
      
      // Update reviews list and recalculate average
      const updatedReviews = [newReview, ...reviews]
      setReviews(updatedReviews)
      
      const sum = updatedReviews.reduce((acc, r) => acc + r.rating, 0)
      const avg = sum / updatedReviews.length
      setAgent({
        ...agent,
        rating: avg
      })

      // Reset form
      setReviewName('')
      setReviewRating(5)
      setReviewComment('')
    } catch (err) {
      alert('Could not submit review')
    } finally {
      setSubmittingReview(false)
    }
  }

  // Reviews distribution analytics calculations
  const totalReviews = reviews.length
  const distribution = [0, 0, 0, 0, 0] // 5, 4, 3, 2, 1
  reviews.forEach((r) => {
    const starIdx = 5 - Math.round(r.rating)
    if (starIdx >= 0 && starIdx < 5) {
      distribution[starIdx]++
    }
  })

  return (
    <div className="fade-in" style={{ position: 'relative' }}>
      <Link to="/agents" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', marginBottom: '1.5rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
        ← Back to Marketplace
      </Link>

      {/* Hero Header */}
      <div style={{
        background: 'var(--glass-bg)',
        border: '1px solid var(--glass-border)',
        borderRadius: '20px',
        padding: '2rem',
        marginBottom: '2rem',
        display: 'flex',
        alignItems: 'center',
        gap: '2rem',
        flexWrap: 'wrap',
        boxShadow: var(--glass-shadow)
      }}>
        {/* Glowing avatar ring */}
        <div style={{
          width: '72px',
          height: '72px',
          borderRadius: '20px',
          background: 'var(--gradient-primary)',
          display: 'flex',
          alignItems: 'center',
          justify-content: 'center',
          fontSize: '2rem',
          boxShadow: '0 0 20px rgba(99, 102, 241, 0.4)'
        }}>
          {agent.category === 'Productivity' ? '⚡' :
           agent.category === 'Developer Tools' ? '💻' :
           agent.category === 'Career' ? '🎯' :
           agent.category === 'Data Analysis' ? '📊' :
           agent.category === 'Education' ? '🎓' :
           agent.category === 'Travel' ? '✈️' :
           agent.category === 'Communication' ? '💬' : '💰'}
        </div>
        
        <div style={{ flex: 1, minWidth: '280px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
            <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '2rem', fontWeight: 800 }}>{agent.name}</h1>
            <span className="category">{agent.category}</span>
          </div>
          <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem', fontSize: '1rem', lineHeight: 1.5 }}>
            {agent.description}
          </p>
          <div style={{ display: 'flex', gap: '1.5rem', marginTop: '1rem', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <StarRating rating={agent.rating} size={16} />
              <strong style={{ color: 'var(--color-warning)', fontSize: '0.95rem' }}>{agent.rating.toFixed(1)}</strong>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>({totalReviews} reviews)</span>
            </div>
            <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
              📥 <strong>{agent.downloads.toLocaleString()}</strong> downloads
            </div>
            <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
              ⚡ <strong>{agent.runs.toLocaleString()}</strong> mock runs
            </div>
          </div>
        </div>
      </div>

      {/* Main Two-Column Layout */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 2fr',
        gap: '2rem',
        alignItems: 'start'
      }}>
        {/* Left Side: Actions and Details Metadata */}
        <aside style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* Action Hub Card */}
          <div style={{
            background: 'var(--glass-bg)',
            border: '1px solid var(--glass-border)',
            borderRadius: '16px',
            padding: '1.5rem',
          }}>
            <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.2rem', marginBottom: '1rem', fontWeight: 700 }}>Workspace Actions</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <button
                onClick={handleInstallToggle}
                disabled={installing}
                className="btn btn-primary"
                style={{
                  width: '100%',
                  background: installed ? 'rgba(16, 185, 129, 0.15)' : undefined,
                  color: installed ? 'var(--color-accent)' : undefined,
                  borderColor: installed ? 'rgba(16, 185, 129, 0.3)' : undefined,
                  boxShadow: installed ? 'none' : undefined
                }}
              >
                {installing ? '⏳ Deploying...' : installed ? '✅ Installed in Workspace' : '📥 Install Agent'}
              </button>
              
              <button
                onClick={() => {
                  setRemixName(`${agent.name} (Remix)`)
                  setShowRemix(true)
                }}
                className="btn btn-secondary"
                style={{ width: '100%' }}
              >
                🍴 Fork & Remix
              </button>
            </div>
          </div>

          {/* Details Spec Info */}
          <div style={{
            background: 'var(--glass-bg)',
            border: '1px solid var(--glass-border)',
            borderRadius: '16px',
            padding: '1.5rem',
            fontSize: '0.9rem'
          }}>
            <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.2rem', marginBottom: '1rem', fontWeight: 700 }}>Specifications</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', lineHeight: 1.6 }}>
              <div>
                <span style={{ color: 'var(--text-muted)' }}>Created By:</span>
                <div style={{ fontWeight: 600 }}>{agent.creator}</div>
              </div>
              <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.05)', paddingTop: '0.5rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Current Version:</span>
                <div style={{ fontWeight: 600 }}>v{agent.version}</div>
              </div>
              <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.05)', paddingTop: '0.5rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Required Permissions:</span>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem', marginTop: '0.25rem' }}>
                  {agent.permissions_required && agent.permissions_required.length > 0 ? (
                    agent.permissions_required.map((p) => (
                      <span key={p} style={{ fontSize: '0.75rem', background: 'rgba(239, 68, 68, 0.1)', color: '#f87171', border: '1px solid rgba(239, 68, 68, 0.2)', padding: '0.1rem 0.4rem', borderRadius: '4px' }}>
                        🔑 {p}
                      </span>
                    ))
                  ) : (
                    <span style={{ fontStyle: 'italic', color: 'var(--text-muted)' }}>None required</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Version History Changelog */}
          <div style={{
            background: 'var(--glass-bg)',
            border: '1px solid var(--glass-border)',
            borderRadius: '16px',
            padding: '1.5rem',
            fontSize: '0.9rem'
          }}>
            <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.2rem', marginBottom: '1rem', fontWeight: 700 }}>Version History</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 600 }}>
                  <span>v{agent.version} (Latest)</span>
                  <span style={{ color: 'var(--color-accent)' }}>Active</span>
                </div>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: '0.15rem' }}>
                  Optimization changes for LLM prompts and mock-tool latency.
                </p>
              </div>
              <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.05)', paddingTop: '0.65rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 500, color: 'var(--text-secondary)' }}>
                  <span>v1.0.0</span>
                  <span style={{ color: 'var(--text-muted)' }}>Legacy</span>
                </div>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: '0.15rem' }}>
                  Initial marketplace deployment.
                </p>
              </div>
            </div>
          </div>
        </aside>

        {/* Right Side: Core Content Details */}
        <section style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          
          {/* Required Tools Hub */}
          <div style={{
            background: 'var(--glass-bg)',
            border: '1px solid var(--glass-border)',
            borderRadius: '16px',
            padding: '1.5rem',
          }}>
            <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.3rem', marginBottom: '1rem', fontWeight: 700 }}>Required Tools</h3>
            {agent.tools_required && agent.tools_required.length > 0 ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1rem' }}>
                {agent.tools_required.map((toolId) => (
                  <Link
                    key={toolId}
                    to={`/tools#${toolId}`}
                    style={{
                      background: 'rgba(255, 255, 255, 0.02)',
                      border: '1px solid var(--glass-border)',
                      borderRadius: '12px',
                      padding: '1rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.75rem',
                      transition: 'all 0.2s ease',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = 'var(--color-primary)'
                      e.currentTarget.style.background = 'rgba(99, 102, 241, 0.04)'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = 'var(--glass-border)'
                      e.currentTarget.style.background = 'rgba(255, 255, 255, 0.02)'
                    }}
                  >
                    <span style={{ fontSize: '1.5rem' }}>⚙️</span>
                    <div>
                      <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                        {toolId.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
                        View schema details →
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div style={{ fontStyle: 'italic', color: 'var(--text-muted)' }}>This agent doesn't require any external registry tools.</div>
            )}
          </div>

          {/* Interactive JSON Schema Inspector */}
          <div style={{
            background: 'var(--glass-bg)',
            border: '1px solid var(--glass-border)',
            borderRadius: '16px',
            padding: '1.5rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem'
          }}>
            <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.3rem', fontWeight: 700 }}>Data Schemas</h3>
            
            {/* Input Schema */}
            <div>
              <button
                onClick={() => setInputsOpen(!inputsOpen)}
                style={{
                  width: '100%',
                  display: 'flex',
                  justify-content: 'space-between',
                  alignItems: 'center',
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid var(--glass-border)',
                  padding: '0.75rem 1rem',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: 600,
                  fontSize: '0.9rem',
                  color: 'var(--text-primary)'
                }}
              >
                <span>📥 Input Schema Declaration</span>
                <span>{inputsOpen ? '▼' : '▶'}</span>
              </button>
              {inputsOpen && (
                <pre style={{
                  background: 'rgba(7, 9, 19, 0.4)',
                  border: '1px solid var(--glass-border)',
                  borderTop: 'none',
                  padding: '1rem',
                  borderRadius: '0 0 8px 8px',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.8rem',
                  overflowX: 'auto',
                  color: '#c7d2fe'
                }}>
                  {JSON.stringify(agent.inputs, null, 2)}
                </pre>
              )}
            </div>

            {/* Output Schema */}
            <div>
              <button
                onClick={() => setOutputsOpen(!outputsOpen)}
                style={{
                  width: '100%',
                  display: 'flex',
                  justify-content: 'space-between',
                  alignItems: 'center',
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid var(--glass-border)',
                  padding: '0.75rem 1rem',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: 600,
                  fontSize: '0.9rem',
                  color: 'var(--text-primary)'
                }}
              >
                <span>📤 Output Schema Declaration</span>
                <span>{outputsOpen ? '▼' : '▶'}</span>
              </button>
              {outputsOpen && (
                <pre style={{
                  background: 'rgba(7, 9, 19, 0.4)',
                  border: '1px solid var(--glass-border)',
                  borderTop: 'none',
                  padding: '1rem',
                  borderRadius: '0 0 8px 8px',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.8rem',
                  overflowX: 'auto',
                  color: '#c7d2fe'
                }}>
                  {JSON.stringify(agent.outputs, null, 2)}
                </pre>
              )}
            </div>
          </div>

          {/* Running Terminal Simulator */}
          <div style={{
            background: '#070913',
            border: '1px solid #1e293b',
            borderRadius: '16px',
            overflow: 'hidden',
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.5)'
          }}>
            {/* Terminal Header */}
            <div style={{
              background: '#0f172a',
              borderBottom: '1px solid #1e293b',
              padding: '0.75rem 1.25rem',
              display: 'flex',
              justify-content: 'space-between',
              alignItems: 'center'
            }}>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <span style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#ef4444', display: 'inline-block' }} />
                <span style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#eab308', display: 'inline-block' }} />
                <span style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#22c55e', display: 'inline-block' }} />
                <span style={{ marginLeft: '0.5rem', color: '#64748b', fontSize: '0.75rem', fontFamily: 'var(--font-mono)', fontWeight: 600 }}>SIMULATOR_TERMINAL.SH</span>
              </div>
              <span style={{ color: '#22c55e', fontSize: '0.75rem', fontFamily: 'var(--font-mono)', fontWeight: 800 }}>RUNNING ONLINE</span>
            </div>

            {/* Inputs Config Forms */}
            <form onSubmit={handleExecute} style={{ padding: '1.25rem', borderBottom: '1px solid #1e293b', background: '#0a0d1e' }}>
              <h4 style={{ fontFamily: 'var(--font-heading)', color: 'white', marginBottom: '0.75rem', fontSize: '1rem', fontWeight: 600 }}>Setup Custom Parameters</h4>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {agent.inputs && agent.inputs.properties && (
                  Object.entries(agent.inputs.properties).map(([key, prop]) => (
                    <div key={key} style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                      <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'capitalize' }}>
                        {key.replace(/_/g, ' ')}
                        {prop.description && <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginLeft: '0.35rem', textTransform: 'none' }}>({prop.description})</span>}
                      </label>
                      {prop.enum ? (
                        <select
                          value={inputsState[key] || ''}
                          onChange={(e) => setInputsState({ ...inputsState, [key]: e.target.value })}
                          className="form-input"
                          style={{ background: '#0f172a', borderColor: '#1e293b' }}
                        >
                          {prop.enum.map((opt) => (
                            <option key={opt} value={opt}>{opt}</option>
                          ))}
                        </select>
                      ) : (
                        <input
                          type="text"
                          required
                          value={inputsState[key] || ''}
                          placeholder={`Enter ${key.replace(/_/g, ' ')} value...`}
                          onChange={(e) => setInputsState({ ...inputsState, [key]: e.target.value })}
                          className="form-input"
                          style={{ background: '#0f172a', borderColor: '#1e293b' }}
                        />
                      )}
                    </div>
                  ))
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', marginTop: '0.5rem' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    💡 Select or type parameters above to customize execution outcomes.
                  </div>
                  <button
                    type="submit"
                    disabled={running}
                    className="btn btn-primary"
                    style={{ background: running ? '#64748b' : undefined, color: 'white', border: 'none', padding: '0.6rem 1.25rem', whiteSpace: 'nowrap' }}
                  >
                    {running ? '⏳ Executing...' : '▶ Run Agent Workspace'}
                  </button>
                </div>
              </div>
            </form>

            {/* Terminal Log Console */}
            <div style={{
              background: '#030712',
              padding: '1.25rem',
              height: '320px',
              overflowY: 'auto',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.82rem',
              lineHeight: 1.6,
              color: '#34d399',
            }}>
              {/* Startup text */}
              <div style={{ color: '#64748b' }}>// AgentStore simulated runtime debugger. Ready.</div>
              {agent.example_prompts && agent.example_prompts.length > 0 && (
                <div style={{ color: '#4b5563', margin: '0.25rem 0' }}>
                  Example Prompts: {agent.example_prompts.map(p => `"${p}"`).join(' | ')}
                </div>
              )}

              {/* Trace steps */}
              {runTrace && runTrace.steps && (
                <div style={{ marginTop: '0.75rem' }}>
                  <div style={{ color: '#3b82f6', fontWeight: 600 }}>$ agentstore-cli --run {agent.id} --input '{JSON.stringify(inputsState)}'</div>
                  {runTrace.steps.map((step, idx) => {
                    const show = idx <= currentStepIndex
                    if (!show) return null
                    return (
                      <div key={idx} className="fade-in" style={{ margin: '0.35rem 0', color: step.tool ? '#a855f7' : '#34d399' }}>
                        <span style={{ color: '#64748b' }}>[{new Date(runTrace.started_at).toLocaleTimeString()}]</span>{' '}
                        <strong>[Step {step.step}] {step.action}</strong>
                        {step.details && <span style={{ color: '#9ca3af' }}> — {step.details}</span>}
                        {step.tool && <span style={{ color: '#c084fc' }}> (Target Tool: {step.tool})</span>}
                        {step.output_summary && <div style={{ color: '#c084fc', paddingLeft: '1.5rem', fontSize: '0.78rem' }}>↳ Tool Result: {step.output_summary}</div>}
                      </div>
                    )
                  })}
                </div>
              )}

              {/* Show running state dots loader */}
              {running && (
                <div style={{ margin: '0.5rem 0', color: '#60a5fa', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  <span>⏳ Processing remote node vectors</span>
                  <span className="trending-pulse" style={{ background: '#3b82f6', width: '8px', height: '8px' }} />
                </div>
              )}

              {/* Output block display */}
              {runTrace && currentStepIndex >= runTrace.steps.length - 1 && (
                <div className="fade-in" style={{ marginTop: '1.25rem', borderTop: '1px dashed #1e293b', paddingTop: '1rem' }}>
                  <div style={{ color: '#10b981', fontWeight: 800, marginBottom: '0.5rem' }}>🟢 RUN COMPLETED [STATUS: 200 OK]</div>
                  <pre style={{
                    background: '#090d16',
                    border: '1px solid #1e293b',
                    padding: '0.85rem',
                    borderRadius: '8px',
                    color: '#a7f3d0',
                    fontSize: '0.78rem',
                    overflowX: 'auto',
                  }}>
                    {JSON.stringify(runTrace.final_output, null, 2)}
                  </pre>
                </div>
              )}
              <div ref={terminalBottomRef} />
            </div>
          </div>

          {/* Interactive Reviews Hub */}
          <div style={{
            background: 'var(--glass-bg)',
            border: '1px solid var(--glass-border)',
            borderRadius: '16px',
            padding: '1.5rem',
          }}>
            <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.3rem', marginBottom: '1.5rem', fontWeight: 700 }}>Ratings & Reviews</h3>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2.5rem', marginBottom: '2.5rem', flexWrap: 'wrap' }}>
              
              {/* Ratings Distribution graph */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
                  <span style={{ fontSize: '3rem', fontWeight: 800, fontFamily: 'var(--font-heading)', color: 'white' }}>{agent.rating.toFixed(1)}</span>
                  <span style={{ color: 'var(--text-secondary)', fontSize: '1rem', fontWeight: 600 }}>/ 5.0</span>
                </div>
                <div style={{ marginBottom: '0.5rem' }}>
                  <StarRating rating={agent.rating} size={20} />
                </div>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>Based on {totalReviews} reviews</span>
              </div>

              {/* Graphical bars */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem', justifyContent: 'center' }}>
                {distribution.map((count, idx) => {
                  const stars = 5 - idx
                  const pct = totalReviews > 0 ? (count / totalReviews) * 100 : 0
                  return (
                    <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.8rem' }}>
                      <span style={{ width: '40px', textAlign: 'right', color: 'var(--text-secondary)', fontWeight: 600 }}>{stars} Star</span>
                      <div style={{ flex: 1, height: '8px', background: 'rgba(255, 255, 255, 0.05)', borderRadius: '4px', overflow: 'hidden' }}>
                        <div style={{ height: '100%', background: 'var(--gradient-primary)', width: `${pct}%`, borderRadius: '4px' }} />
                      </div>
                      <span style={{ width: '30px', color: 'var(--text-muted)' }}>{count}</span>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Write a review form */}
            <form onSubmit={handleReviewSubmit} style={{
              background: 'rgba(255, 255, 255, 0.02)',
              border: '1px solid var(--glass-border)',
              borderRadius: '12px',
              padding: '1.25rem',
              marginBottom: '2rem'
            }}>
              <h4 style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: '1.05rem', marginBottom: '1rem' }}>Write an Agent Review</h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Your Name</label>
                  <input
                    type="text"
                    placeholder="e.g. John Doe"
                    value={reviewName}
                    onChange={(e) => setReviewName(e.target.value)}
                    className="form-input"
                  />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Assign Rating</label>
                  <div style={{ height: '38px', display: 'flex', alignItems: 'center' }}>
                    <StarRating rating={reviewRating} interactive={true} size={20} onChange={setReviewRating} />
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', marginBottom: '1rem' }}>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Review Comments</label>
                <textarea
                  required
                  rows={3}
                  placeholder="Share details of your experience using this agent's workflow..."
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  className="form-input"
                  style={{ resize: 'vertical', minHeight: '80px' }}
                />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button
                  type="submit"
                  disabled={submittingReview}
                  className="btn btn-primary"
                  style={{ padding: '0.5rem 1.25rem', fontSize: '0.85rem' }}
                >
                  {submittingReview ? '⏳ Submitting...' : 'Submit Feedback'}
                </button>
              </div>
            </form>

            {/* List of reviews */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {reviews.length > 0 ? (
                reviews.map((rev, idx) => (
                  <div key={idx} className="fade-in" style={{
                    borderBottom: idx < reviews.length - 1 ? '1px solid rgba(255, 255, 255, 0.05)' : 'none',
                    paddingBottom: idx < reviews.length - 1 ? '1.25rem' : '0'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>{rev.user}</span>
                      <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>{rev.date}</span>
                    </div>
                    <div style={{ margin: '0.25rem 0' }}>
                      <StarRating rating={rev.rating} size={14} />
                    </div>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.5 }}>
                      {rev.review}
                    </p>
                  </div>
                ))
              ) : (
                <div style={{ textAlign: 'center', padding: '2rem 1rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                  No reviews submitted yet for this agent listing. Be the first to write one!
                </div>
              )}
            </div>
          </div>
        </section>
      </div>

      {/* Remix Overlay Modal */}
      {showRemix && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: 'rgba(0, 0, 0, 0.7)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justify-content: 'center',
          zIndex: 1000
        }}>
          <div className="fade-in" style={{
            background: 'var(--bg-secondary)',
            border: '1px solid var(--glass-hover-border)',
            borderRadius: '16px',
            padding: '2rem',
            width: '90%',
            maxWidth: '450px',
            boxShadow: '0 20px 50px rgba(0, 0, 0, 0.6)'
          }}>
            <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.5rem' }}>fork & Customize Agent</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
              Create a derivative copy of <strong>{agent.name}</strong>. You'll be registered as the creator and can run customized instances.
            </p>
            <form onSubmit={handleRemixSubmit}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', marginBottom: '1.5rem' }}>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600 }}>New Listing Name</label>
                <input
                  type="text"
                  required
                  placeholder="Enter custom name..."
                  value={remixName}
                  onChange={(e) => setRemixName(e.target.value)}
                  className="form-input"
                  style={{ background: 'var(--bg-primary)' }}
                />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                <button
                  type="button"
                  onClick={() => setShowRemix(false)}
                  disabled={remixing}
                  className="btn btn-secondary"
                  style={{ padding: '0.5rem 1rem' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={remixing}
                  className="btn btn-primary"
                  style={{ padding: '0.5rem 1.25rem' }}
                >
                  {remixing ? '⏳ Remixing...' : 'Confirm Fork'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
