import type { Rating, Results, Response, SessionResponse } from './types'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

/**
 * Send a JSON request and parse the JSON response.
 *
 * @param path - Backend path including leading slash.
 * @param options - Fetch options.
 * @returns Parsed JSON response.
 */
async function sendRequest<T>(path: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers ?? {}),
    },
    ...options,
  })
  return response.json() as Promise<T>
}

/**
 * Create a participant session from six questionnaire answers.
 *
 * @param answers - Six Likert answers from 1 to 5.
 * @returns Session payload including selected responses.
 */
export function createSession(answers: number[]): Promise<SessionResponse> {
  return sendRequest<SessionResponse>('/session', {
    method: 'POST',
    body: JSON.stringify({ answers }),
  })
}

/**
 * Submit a single rating for the current session.
 *
 * @param rating - Rating fields to persist.
 */
export async function submitRating(rating: Rating): Promise<void> {
  await sendRequest('/rating', {
    method: 'POST',
    body: JSON.stringify(rating),
  })
}

/**
 * Fetch computed results for a given session identifier.
 *
 * @param sessionId - Existing session identifier.
 * @returns Results response payload.
 */
export function getResults(sessionId: string): Promise<Results> {
  return sendRequest<Results>(`/results/${sessionId}`)
}
