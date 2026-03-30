export interface Response {
  question_id: number
  prompt: string
  response_model: string
  response_text: string
}

export interface Rating {
  session_id: string
  question_id: number
  response_model: string
  score: number
  reasoning: string | null
}

export interface PersonaAssignment {
  economic: 'Libertarian' | 'Collectivist'
  identity: 'Nationalist' | 'Globalist'
  technology: 'Tech Optimist' | 'Tech Sceptic'
}

export interface Positions {
  economic: number
  identity: number
  technology: number
}

export interface SessionResponse {
  session_id: string
  economic_persona: string
  identity_persona: string
  technology_persona: string
  responses: Response[]
}

export interface Results {
  session: {
    id: string
    economic_persona: string
    identity_persona: string
    technology_persona: string
  }
  mean_score: number
  persona_profiles: {
    economic: string
    identity: string
    technology: string
  }
  aggregate_by_persona: Record<string, number>
}

export interface AppState {
  page: 1 | 2 | 3 | 4 | 5
  answers: number[]
  personas: PersonaAssignment
  positions: Positions
  sessionId: string | null
  responses: Response[]
  currentResponseIndex: number
  ratings: Rating[]
  results: Results | null
}
