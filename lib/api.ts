import { Rating, Results, SessionResponse, AIResponse } from './types'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

export async function createSession(answers: number[], isRepeat: boolean): Promise<SessionResponse> {
  const res = await fetch(`${API_URL}/session`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ answers, is_repeat: isRepeat }),
  })
  if (!res.ok) throw new Error('Failed to create session')
  return res.json()
}

export async function submitRating(sessionId: string, rating: Rating): Promise<void> {
  const res = await fetch(`${API_URL}/rating`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ session_id: sessionId, ...rating }),
  })
  if (!res.ok) throw new Error('Failed to submit rating')
}

export async function getResults(sessionId: string): Promise<Results> {
  const res = await fetch(`${API_URL}/results/${sessionId}`)
  if (!res.ok) throw new Error('Failed to get results')
  return res.json()
}

export async function getMoreResponses(sessionId: string, seenKeys: string[]): Promise<AIResponse[]> {
  const res = await fetch(`${API_URL}/responses/more`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ session_id: sessionId, seen_response_keys: seenKeys }),
  })
  if (!res.ok) throw new Error('Failed to get more responses')
  return res.json()
}
