/**
 * API client for AgentStore backend.
 *
 * TODO: Students should implement full API integration.
 * TODO: Add error handling, loading states, and retry logic.
 */

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000'

export interface AgentSummary {
  id: string
  name: string
  description: string
  category: string
  rating: number
  downloads: number
  tags: string[]
  tools_required: string[]
}

export async function fetchAgents(): Promise<AgentSummary[]> {
  const res = await fetch(`${API_BASE}/agents`)
  if (!res.ok) throw new Error('Failed to fetch agents')
  return res.json()
}

export async function fetchAgent(id: string): Promise<AgentSummary> {
  const res = await fetch(`${API_BASE}/agents/${id}`)
  if (!res.ok) throw new Error(`Failed to fetch agent: ${id}`)
  return res.json()
}

export async function fetchTools(): Promise<unknown[]> {
  const res = await fetch(`${API_BASE}/tools`)
  if (!res.ok) throw new Error('Failed to fetch tools')
  return res.json()
}

export async function runAgent(id: string, input: Record<string, unknown> = {}): Promise<unknown> {
  const res = await fetch(`${API_BASE}/agents/${id}/run`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ input }),
  })
  if (!res.ok) throw new Error(`Failed to run agent: ${id}`)
  return res.json()
}
