import { useEffect, useState, useRef } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { fetchAgent, runAgent, fetchReviews, addReview, forkAgent, type Agent, type Review, type Trace } from '../api/client'
import StarRating from '../components/StarRating'
import { AgentDetailSkeleton } from '../components/SkeletonLoader'
import { getCategoryIcon, StarIcon, DownloadIcon, GitForkIcon, TerminalIcon, KeyIcon, ToolIcon } from '../components/Icons'

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
        
        // Initialize inputs default values
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

  useEffect(() => {
    if (running && terminalBottomRef.current) {
      terminalBottomRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [currentStepIndex, running])

  if (loading) return <AgentDetailSkeleton />
  if (error || !agent) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem 1rem' }}>
        <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.5rem' }}>Agent Not Found</h2>
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

  // Handle simulated install
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
      
      const updatedReviews = [newReview, ...reviews]
      setReviews(updatedReviews)
      
      const sum = updatedReviews.reduce((acc, r) => acc + r.rating, 0)
      const avg = sum / updatedReviews.length
      setAgent({
        ...agent,
        rating: avg
      })

      setReviewName('')
      setReviewRating(5)
      setReviewComment('')
    } catch (err) {
      alert('Could not submit review')
    } finally {
      setSubmittingReview(false)
    }
  }

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
      <Link to="/agents" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', marginBottom: '1.5rem', fontWeight: 600, color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
        ← Back to Marketplace
      </Link>

      {/* Hero Header */}
      <div style={{
        background: 'var(--glass-bg)',
        border: '1px solid var(--glass-border)',
        borderRadius: '0px',
        padding: '2rem',
        marginBottom: '2rem',
        display: 'flex',
        alignItems: 'center',
        gap: '2rem',
        flexWrap: 'wrap',
      }}>
        {/* Glowing avatar ring */}
        <div style={{
          width: '72px',
          height: '72px',
          borderRadius: '0px',
          background: 'transparent',
          border: '2px solid var(--color-primary)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--color-primary)',
          boxShadow: '0 0 16px rgba(199, 120, 221, 0.2)'
        }}>
          {getCategoryIcon(agent.category, 36, 'var(--color-primary)')}
        </div>
        
        <div style={{ flex: 1, minWidth: '280px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
            <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.75rem', fontWeight: 700 }}>{agent.name}</h1>
            <span className="category" style={{ borderRadius: '0px', borderColor: 'var(--color-primary)', color: 'var(--color-primary)', background: 'transparent' }}>
              {agent.category}
            </span>
          </div>
          <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem', fontSize: '0.9rem', lineHeight: 1.5 }}>
            {agent.description}
          </p>
          <div style={{ display: 'flex', gap: '1.5rem', marginTop: '1rem', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <StarRating rating={agent.rating} size={14} />
              <strong style={{ color: 'var(--color-warning)', fontSize: '0.9rem' }}>{agent.rating.toFixed(1)}</strong>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>({totalReviews} reviews)</span>
            </div>
            <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <DownloadIcon size={14} color="var(--text-muted)" />
              <strong>{agent.downloads.toLocaleString()}</strong> downloads
            </div>
            <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <TerminalIcon size={14} color="var(--text-muted)" />
              <strong>{agent.runs.toLocaleString()}</strong> mock runs
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
            borderRadius: '0px',
            padding: '1.5rem',
          }}>
            <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.1rem', marginBottom: '1rem', fontWeight: 600 }}>
              <span className="harsh-style">#</span>actions
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <button
                onClick={handleInstallToggle}
                disabled={installing}
                className="btn btn-primary"
                style={{
                  width: '100%',
                  background: installed ? 'rgba(152, 195, 121, 0.1)' : undefined,
                  color: installed ? 'var(--color-accent)' : undefined,
                  borderColor: installed ? 'var(--color-accent)' : undefined,
                }}
              >
                {installing ? '⏳ deploying...' : installed ? '✅ installed' : 'install-agent <~>'}
              </button>
              
              <button
                onClick={() => {
                  setRemixName(`${agent.name} (Remix)`)
                  setShowRemix(true)
                }}
                className="btn btn-secondary"
                style={{ width: '100%' }}
              >
                fork-remix &ge;
              </button>
            </div>
          </div>

          {/* Details Spec Info */}
          <div style={{
            background: 'var(--glass-bg)',
            border: '1px solid var(--glass-border)',
            borderRadius: '0px',
            padding: '1.5rem',
            fontSize: '0.85rem'
          }}>
            <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.1rem', marginBottom: '1rem', fontWeight: 600 }}>
              <span className="harsh-style">#</span>specs
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', lineHeight: 1.6 }}>
              <div>
                <span style={{ color: 'var(--text-muted)' }}>creator:</span>
                <div style={{ fontWeight: 600, color: 'white' }}>{agent.creator}</div>
              </div>
              <div style={{ borderTop: '1px dashed rgba(171, 178, 191, 0.15)', paddingTop: '0.5rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>version:</span>
                <div style={{ fontWeight: 600, color: 'white' }}>v{agent.version}</div>
              </div>
              <div style={{ borderTop: '1px dashed rgba(171, 178, 191, 0.15)', paddingTop: '0.5rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>permissions:</span>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem', marginTop: '0.25rem' }}>
                  {agent.permissions_required && agent.permissions_required.length > 0 ? (
                    agent.permissions_required.map((p) => (
                      <span key={p} style={{ fontSize: '0.7rem', background: 'rgba(224, 108, 117, 0.08)', color: 'var(--color-danger)', border: '1px solid rgba(224, 108, 117, 0.15)', padding: '0.1rem 0.4rem', borderRadius: '0px' }}>
                        🔑 {p}
                      </span>
                    ))
                  ) : (
                    <span style={{ fontStyle: 'italic', color: 'var(--text-muted)' }}>none</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Version History Changelog */}
          <div style={{
            background: 'var(--glass-bg)',
            border: '1px solid var(--glass-border)',
            borderRadius: '0px',
            padding: '1.5rem',
            fontSize: '0.85rem'
          }}>
            <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.1rem', marginBottom: '1rem', fontWeight: 600 }}>
              <span className="harsh-style">#</span>changelog
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 600 }}>
                  <span>v{agent.version} (latest)</span>
                  <span style={{ color: 'var(--color-accent)' }}>active</span>
                </div>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: '0.15rem', lineHeight: 1.4 }}>
                  Optimization changes for LLM prompts and mock-tool latency.
                </p>
              </div>
              <div style={{ borderTop: '1px dashed rgba(171, 178, 191, 0.15)', paddingTop: '0.65rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 500, color: 'var(--text-secondary)' }}>
                  <span>v1.0.0</span>
                  <span style={{ color: 'var(--text-muted)' }}>legacy</span>
                </div>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: '0.15rem', lineHeight: 1.4 }}>
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
            borderRadius: '0px',
            padding: '1.5rem',
          }}>
            <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.25rem', marginBottom: '1rem', fontWeight: 600 }}>
              <span className="harsh-style">#</span>required-tools
            </h3>
            {agent.tools_required && agent.tools_required.length > 0 ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1rem' }}>
                {agent.tools_required.map((toolId) => (
                  <Link
                    key={toolId}
                    to={`/tools#${toolId}`}
                    style={{
                      background: 'rgba(255, 255, 255, 0.02)',
                      border: '1px solid var(--glass-border)',
                      borderRadius: '0px',
                      padding: '1rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.75rem',
                      transition: 'all 0.2s ease',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = 'var(--color-primary)'
                      e.currentTarget.style.background = 'rgba(199, 120, 221, 0.03)'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = 'var(--glass-border)'
                      e.currentTarget.style.background = 'rgba(255, 255, 255, 0.02)'
                    }}
                  >
                    <ToolIcon size={20} color="var(--color-primary)" />
                    <div>
                      <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.85rem' }}>
                        {toolId.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
                        view-schema &ge;
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div style={{ fontStyle: 'italic', color: 'var(--text-muted)', fontSize: '0.85rem' }}>This agent doesn't require any registry tools.</div>
            )}
          </div>

          {/* Interactive JSON Schema Inspector */}
          <div style={{
            background: 'var(--glass-bg)',
            border: '1px solid var(--glass-border)',
            borderRadius: '0px',
            padding: '1.5rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem'
          }}>
            <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.25rem', fontWeight: 600 }}>
              <span className="harsh-style">#</span>data-schemas
            </h3>
            
            {/* Input Schema */}
            <div>
              <button
                onClick={() => setInputsOpen(!inputsOpen)}
                style={{
                  width: '100%',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  background: 'rgba(255, 255, 255, 0.02)',
                  border: '1px solid var(--glass-border)',
                  padding: '0.75rem 1rem',
                  borderRadius: '0px',
                  cursor: 'pointer',
                  fontWeight: 600,
                  fontSize: '0.85rem',
                  color: 'var(--text-primary)',
                  fontFamily: 'inherit'
                }}
              >
                <span>📥 input-schema</span>
                <span>{inputsOpen ? '[-]' : '[+]'}</span>
              </button>
              {inputsOpen && (
                <pre style={{
                  background: '#282C33',
                  border: '1px solid var(--glass-border)',
                  borderTop: 'none',
                  padding: '1rem',
                  borderRadius: '0px',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.75rem',
                  overflowX: 'auto',
                  color: 'var(--color-warning)'
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
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  background: 'rgba(255, 255, 255, 0.02)',
                  border: '1px solid var(--glass-border)',
                  padding: '0.75rem 1rem',
                  borderRadius: '0px',
                  cursor: 'pointer',
                  fontWeight: 600,
                  fontSize: '0.85rem',
                  color: 'var(--text-primary)',
                  fontFamily: 'inherit'
                }}
              >
                <span>📤 output-schema</span>
                <span>{outputsOpen ? '[-]' : '[+]'}</span>
              </button>
              {outputsOpen && (
                <pre style={{
                  background: '#282C33',
                  border: '1px solid var(--glass-border)',
                  borderTop: 'none',
                  padding: '1rem',
                  borderRadius: '0px',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.75rem',
                  overflowX: 'auto',
                  color: 'var(--color-warning)'
                }}>
                  {JSON.stringify(agent.outputs, null, 2)}
                </pre>
              )}
            </div>
          </div>

          {/* Running Terminal Simulator */}
          <div style={{
            background: '#21252b',
            border: '1px solid var(--glass-border)',
            borderRadius: '0px',
            overflow: 'hidden',
          }}>
            {/* Terminal Header */}
            <div style={{
              background: '#1e2227',
              borderBottom: '1px solid var(--glass-border)',
              padding: '0.75rem 1.25rem',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <span style={{ width: '8px', height: '8px', background: 'var(--color-danger)', display: 'inline-block' }} />
                <span style={{ width: '8px', height: '8px', background: 'var(--color-warning)', display: 'inline-block' }} />
                <span style={{ width: '8px', height: '8px', background: 'var(--color-accent)', display: 'inline-block' }} />
                <span style={{ marginLeft: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.75rem', fontFamily: 'var(--font-mono)' }}>simulator_terminal.sh</span>
              </div>
              <span style={{ color: 'var(--color-accent)', fontSize: '0.75rem', fontFamily: 'var(--font-mono)', fontWeight: 700 }}>active</span>
            </div>

            {/* Inputs Config Forms */}
            <form onSubmit={handleExecute} style={{ padding: '1.25rem', borderBottom: '1px solid var(--glass-border)', background: '#21252b' }}>
              <h4 style={{ fontFamily: 'var(--font-heading)', color: 'white', marginBottom: '0.75rem', fontSize: '0.9rem', fontWeight: 600 }}>Setup Custom Parameters</h4>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {agent.inputs && agent.inputs.properties && (
                  Object.entries(agent.inputs.properties).map(([key, prop]) => (
                    <div key={key} style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                      <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
                        {key.replace(/_/g, ' ')}
                        {prop.description && <span style={{ color: 'var(--text-muted)', fontSize: '0.7rem', marginLeft: '0.35rem' }}>({prop.description})</span>}
                      </label>
                      {prop.enum ? (
                        <select
                          value={inputsState[key] || ''}
                          onChange={(e) => setInputsState({ ...inputsState, [key]: e.target.value })}
                          className="form-input"
                          style={{ background: '#282C33', borderColor: 'var(--glass-border)' }}
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
                          style={{ background: '#282C33', borderColor: 'var(--glass-border)' }}
                        />
                      )}
                    </div>
                  ))
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', marginTop: '0.5rem', flexWrap: 'wrap' }}>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                    // Select parameters above to customize execution outcomes.
                  </div>
                  <button
                    type="submit"
                    disabled={running}
                    className="btn btn-primary"
                    style={{ padding: '0.5rem 1.25rem', whiteSpace: 'nowrap' }}
                  >
                    {running ? 'Executing...' : 'run-agent <~>'}
                  </button>
                </div>
              </div>
            </form>

            {/* Terminal Log Console */}
            <div style={{
              background: '#282C33',
              padding: '1.25rem',
              height: '300px',
              overflowY: 'auto',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.8rem',
              lineHeight: 1.6,
              color: 'var(--color-accent)',
            }}>
              <div style={{ color: 'var(--text-muted)' }}>// AgentStore simulated runtime debugger. Ready.</div>
              {agent.example_prompts && agent.example_prompts.length > 0 && (
                <div style={{ color: 'var(--text-muted)', margin: '0.25rem 0' }}>
                  Example Prompts: {agent.example_prompts.map(p => `"${p}"`).join(' | ')}
                </div>
              )}

              {/* Trace steps */}
              {runTrace && runTrace.steps && (
                <div style={{ marginTop: '0.75rem' }}>
                  <div style={{ color: 'var(--color-info)' }}>$ agentstore-cli --run {agent.id} --input '{JSON.stringify(inputsState)}'</div>
                  {runTrace.steps.map((step, idx) => {
                    const show = idx <= currentStepIndex
                    if (!show) return null
                    return (
                      <div key={idx} className="fade-in" style={{ margin: '0.35rem 0', color: step.tool ? 'var(--color-primary)' : 'var(--color-accent)' }}>
                        <span style={{ color: 'var(--text-muted)' }}>[{new Date(runTrace.started_at).toLocaleTimeString()}]</span>{' '}
                        <strong>[Step {step.step}] {step.action}</strong>
                        {step.details && <span style={{ color: 'var(--text-secondary)' }}> — {step.details}</span>}
                        {step.tool && <span style={{ color: 'var(--color-secondary)' }}> (Target Tool: {step.tool})</span>}
                        {step.output_summary && <div style={{ color: 'var(--color-secondary)', paddingLeft: '1.5rem', fontSize: '0.75rem' }}>↳ Tool Result: {step.output_summary}</div>}
                      </div>
                    )
                  })}
                </div>
              )}

              {/* Show running state loader */}
              {running && (
                <div style={{ margin: '0.5rem 0', color: 'var(--color-info)', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  <span>⏳ Processing remote node vectors</span>
                  <span className="trending-pulse" style={{ background: 'var(--color-info)', width: '6px', height: '6px' }} />
                </div>
              )}

              {/* Output block display */}
              {runTrace && currentStepIndex >= runTrace.steps.length - 1 && (
                <div className="fade-in" style={{ marginTop: '1.25rem', borderTop: '1px dashed rgba(171, 178, 191, 0.15)', paddingTop: '1rem' }}>
                  <div style={{ color: 'var(--color-accent)', fontWeight: 800, marginBottom: '0.5rem' }}>🟢 RUN COMPLETED [STATUS: 200 OK]</div>
                  <pre style={{
                    background: '#21252b',
                    border: '1px solid var(--glass-border)',
                    padding: '0.85rem',
                    borderRadius: '0px',
                    color: 'var(--color-warning)',
                    fontSize: '0.75rem',
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
            borderRadius: '0px',
            padding: '1.5rem',
          }}>
            <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.25rem', marginBottom: '1.5rem', fontWeight: 600 }}>
              <span className="harsh-style">#</span>ratings-and-reviews
            </h3>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2.5rem', marginBottom: '2.5rem', flexWrap: 'wrap' }}>
              
              {/* Ratings Distribution graph */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
                  <span style={{ fontSize: '2.5rem', fontWeight: 700, fontFamily: 'var(--font-heading)', color: 'white' }}>{agent.rating.toFixed(1)}</span>
                  <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>/ 5.0</span>
                </div>
                <div style={{ marginBottom: '0.25rem' }}>
                  <StarRating rating={agent.rating} size={18} />
                </div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Based on {totalReviews} reviews</span>
              </div>

              {/* Graphical bars */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem', justifyContent: 'center' }}>
                {distribution.map((count, idx) => {
                  const stars = 5 - idx
                  const pct = totalReviews > 0 ? (count / totalReviews) * 100 : 0
                  return (
                    <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.75rem' }}>
                      <span style={{ width: '40px', textAlign: 'right', color: 'var(--text-secondary)' }}>{stars} Star</span>
                      <div style={{ flex: 1, height: '6px', background: 'rgba(255, 255, 255, 0.05)', borderRadius: '0px', overflow: 'hidden' }}>
                        <div style={{ height: '100%', background: 'var(--color-primary)', width: `${pct}%` }} />
                      </div>
                      <span style={{ width: '25px', color: 'var(--text-muted)', textAlign: 'right' }}>{count}</span>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Write a review form */}
            <form onSubmit={handleReviewSubmit} style={{
              background: '#282C33',
              border: '1px solid var(--glass-border)',
              borderRadius: '0px',
              padding: '1.25rem',
              marginBottom: '2rem'
            }}>
              <h4 style={{ fontFamily: 'var(--font-heading)', fontWeight: 600, fontSize: '0.95rem', marginBottom: '1rem', color: 'white' }}>Write an Agent Review</h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                  <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Your Name</label>
                  <input
                    type="text"
                    placeholder="e.g. John Doe"
                    value={reviewName}
                    onChange={(e) => setReviewName(e.target.value)}
                    className="form-input"
                    style={{ background: 'var(--bg-secondary)' }}
                  />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                  <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Assign Rating</label>
                  <div style={{ height: '38px', display: 'flex', alignItems: 'center' }}>
                    <StarRating rating={reviewRating} interactive={true} size={18} onChange={setReviewRating} />
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', marginBottom: '1rem' }}>
                <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Review Comments</label>
                <textarea
                  required
                  rows={3}
                  placeholder="Share details of your experience using this agent's workflow..."
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  className="form-input"
                  style={{ resize: 'vertical', minHeight: '80px', background: 'var(--bg-secondary)' }}
                />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button
                  type="submit"
                  disabled={submittingReview}
                  className="btn btn-primary"
                  style={{ padding: '0.45rem 1.25rem', fontSize: '0.85rem' }}
                >
                  {submittingReview ? 'Submitting...' : 'submit-feedback'}
                </button>
              </div>
            </form>

            {/* List of reviews */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {reviews.length > 0 ? (
                reviews.map((rev, idx) => (
                  <div key={idx} className="fade-in" style={{
                    borderBottom: idx < reviews.length - 1 ? '1px dashed rgba(171, 178, 191, 0.15)' : 'none',
                    paddingBottom: idx < reviews.length - 1 ? '1.25rem' : '0'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontWeight: 600, fontSize: '0.9rem', color: 'white' }}>{rev.user}</span>
                      <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>{rev.date}</span>
                    </div>
                    <div style={{ margin: '0.25rem 0' }}>
                      <StarRating rating={rev.rating} size={12} />
                    </div>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', lineHeight: 1.5 }}>
                      {rev.review}
                    </p>
                  </div>
                ))
              ) : (
                <div style={{ textAlign: 'center', padding: '2rem 1rem', color: 'var(--text-muted)', fontStyle: 'italic', fontSize: '0.85rem' }}>
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
          background: 'rgba(0, 0, 0, 0.75)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div className="fade-in" style={{
            background: 'var(--bg-secondary)',
            border: '1px solid var(--color-primary)',
            borderRadius: '0px',
            padding: '2rem',
            width: '90%',
            maxWidth: '450px',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5)'
          }}>
            <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.5rem', color: 'white' }}>
              <span className="harsh-style">#</span>fork-customize-agent
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginBottom: '1.5rem', lineHeight: 1.5 }}>
              Create a derivative copy of <strong>{agent.name}</strong>. You'll be registered as the creator and can run customized instances.
            </p>
            <form onSubmit={handleRemixSubmit}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', marginBottom: '1.5rem' }}>
                <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>New Listing Name</label>
                <input
                  type="text"
                  required
                  placeholder="Enter custom name..."
                  value={remixName}
                  onChange={(e) => setRemixName(e.target.value)}
                  className="form-input"
                  style={{ background: 'var(--bg-primary)', width: '100%' }}
                />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                <button
                  type="button"
                  onClick={() => setShowRemix(false)}
                  disabled={remixing}
                  className="btn btn-secondary"
                  style={{ padding: '0.4rem 1rem', fontSize: '0.8rem' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={remixing}
                  className="btn btn-primary"
                  style={{ padding: '0.4rem 1.25rem', fontSize: '0.8rem' }}
                >
                  {remixing ? 'Forking...' : 'confirm-fork'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
