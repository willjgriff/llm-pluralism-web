export type EconomicPersona = 'Libertarian' | 'Collectivist'
export type IdentityPersona = 'Nationalist' | 'Globalist'
export type TechnologyPersona = 'Tech Optimist' | 'Tech Sceptic'
export type SocietyPersona = 'Religious' | 'Secularist'
export type Persona = EconomicPersona | IdentityPersona | TechnologyPersona | SocietyPersona | 'Centrist'

export interface PersonaProfile {
  economic: EconomicPersona | 'Neutral'
  identity: IdentityPersona | 'Neutral'
  technology: TechnologyPersona | 'Neutral'
  society: SocietyPersona | 'Neutral'
  primaryPersona: Persona
  primaryAxis: 'economic' | 'identity' | 'technology' | 'society' | 'centrist'
  positions: {
    economic: number
    identity: number
    technology: number
    society: number
  }
}

export interface AIResponse {
  question_id: number
  group_id: number
  group_name: string
  prompt_text: string
  model: string
  model_display_name: string
  response_text: string
}

export interface Rating {
  question_id: number
  model: string
  score: number
  reasoning?: string
}

/** Optional values captured from URL query params for traffic and Prolific attribution. */
export interface TrafficAttribution {
  src?: string
  trustedToken?: string
  prolificPid?: string
  prolificStudyId?: string
  prolificSessionId?: string
}

export interface SessionResponse {
  session_id: string
  responses: AIResponse[]
}

export interface ModelScore {
  model: string
  model_display_name: string
  mean_score: number
}

export interface AggregateData {
  persona: string
  mean_score: number
  participant_count: number
}

export interface Results {
  session_id: string
  model_scores: ModelScore[]
  best_match: ModelScore
  aggregate_by_persona: AggregateData[]
  total_participants: number
  ratings_count: number
  use_live_data: boolean
}

export interface AppState {
  sessionId: string | null
  answers: number[]
  personaProfile: PersonaProfile | null
  responses: AIResponse[]
  seenQuestionIds: number[]
  ratings: Rating[]
  results: Results | null
  isRepeatSession: boolean
}
