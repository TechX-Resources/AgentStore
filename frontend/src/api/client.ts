/**
 * API client for AgentStore backend.
 * Uses Vite proxy (/api → http://127.0.0.1:8000) by default.
 */

const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api'

export interface AgentSummary {
  id: string
  name: string
  description: string
  category: string
  rating: number | null
  review_count: number
  downloads: number
  installs?: number
  tags: string[]
  tools_required: string[]
  example_use_case?: string
  permissions_required?: string[]
  creator?: string
  version?: string
}

export interface RunResult {
  agent_id: string
  status: string
  message?: string
  trace?: unknown
  output?: unknown
}

export interface Rating {
  agent_id: string
  score: number
  review: string
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, init)
  if (!res.ok) {
    const detail = await res.text().catch(() => '')
    throw new Error(detail || `Request failed: ${path} (${res.status})`)
  }
  return res.json() as Promise<T>
}

export async function fetchAgents(): Promise<AgentSummary[]> {
  return request<AgentSummary[]>('/agents')
}

export async function fetchAgent(id: string): Promise<AgentSummary> {
  return request<AgentSummary>(`/agents/${id}`)
}

export async function fetchTools(): Promise<unknown[]> {
  return request<unknown[]>('/tools')
}

export async function fetchTrending(n = 10): Promise<AgentSummary[]> {
  return request<AgentSummary[]>(`/agents/trending?n=${n}`)
}

export async function runAgent(
  id: string,
  input: Record<string, unknown> = {},
): Promise<RunResult> {
  return request<RunResult>(`/agents/${id}/run`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ input }),
  })
}

export async function fetchRatings(id: string): Promise<Rating[]> {
  return request<Rating[]>(`/agents/${id}/ratings`)
}

export async function submitRating(
  id: string,
  score: number,
  review = '',
): Promise<Rating> {
  return request<Rating>(`/agents/${id}/ratings`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ score, review }),
  })
}
