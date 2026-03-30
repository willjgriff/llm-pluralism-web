import { useState } from 'react'
import { createSession, getResults, submitRating } from './api'
import LandingPage from './pages/LandingPage'
import QuestionnairePage from './pages/QuestionnairePage'
import TransitionPage from './pages/TransitionPage'
import RatingPage from './pages/RatingPage'
import ResultsPage from './pages/ResultsPage'
import type { AppState, PersonaAssignment, Positions, Rating } from './types'

const DEFAULT_PERSONAS: PersonaAssignment = {
  economic: 'Libertarian',
  identity: 'Nationalist',
  technology: 'Tech Optimist',
}

const DEFAULT_POSITIONS: Positions = {
  economic: 0.5,
  identity: 0.5,
  technology: 0.5,
}

function createInitialState(): AppState {
  return {
    page: 1,
    answers: [0, 0, 0, 0, 0, 0],
    personas: DEFAULT_PERSONAS,
    positions: DEFAULT_POSITIONS,
    sessionId: null,
    responses: [],
    currentResponseIndex: 0,
    ratings: [],
    results: null,
  }
}

/**
 * Root component managing the linear evaluation flow through five pages.
 * All state lives here; components receive only what they need via props.
 *
 * @returns Rendered page based on current state.
 */
export default function App() {
  const [state, setState] = useState<AppState>(createInitialState)

  /** Navigate to the questionnaire page. */
  const handleStart = () => setState((prev) => ({ ...prev, page: 2 }))

  /**
   * Persist questionnaire results in state and advance to the transition page.
   *
   * @param answers - Six Likert answers.
   * @param personas - Computed persona assignments.
   * @param positions - Normalised axis positions from 0 to 1.
   */
  const handleSubmitQuestionnaire = (
    answers: number[],
    personas: PersonaAssignment,
    positions: Positions,
  ) => {
    setState((prev) => ({ ...prev, page: 3, answers, personas, positions }))
  }

  /**
   * Call POST /session, store session data, and advance to the rating page.
   * Triggered when the user clicks Start Rating on the transition page.
   */
  const handleStartRating = async () => {
    const sessionResponse = await createSession(state.answers)
    setState((prev) => ({
      ...prev,
      page: 4,
      sessionId: sessionResponse.session_id,
      responses: sessionResponse.responses,
      currentResponseIndex: 0,
    }))
  }

  /**
   * Submit a completed rating, then advance to the next response or results page.
   *
   * @param rating - Rating payload to persist.
   */
  const handleSubmitRating = async (rating: Rating) => {
    await submitRating(rating)
    const updatedRatings = [...state.ratings, rating]
    const nextIndex = state.currentResponseIndex + 1

    if (nextIndex >= state.responses.length) {
      const results = await getResults(state.sessionId!)
      setState((prev) => ({ ...prev, ratings: updatedRatings, results, page: 5 }))
    } else {
      setState((prev) => ({
        ...prev,
        ratings: updatedRatings,
        currentResponseIndex: nextIndex,
      }))
    }
  }

  /** Reset all state and return to the landing page. */
  const handleReset = () => setState(createInitialState())

  if (state.page === 1) {
    return <LandingPage onStart={handleStart} />
  }

  if (state.page === 2) {
    return <QuestionnairePage onSubmit={handleSubmitQuestionnaire} />
  }

  if (state.page === 3) {
    return (
      <TransitionPage
        personas={state.personas}
        positions={state.positions}
        onStartRating={handleStartRating}
      />
    )
  }

  if (state.page === 4 && state.sessionId && state.responses.length > 0) {
    const currentResponse = state.responses[state.currentResponseIndex]
    return (
      <RatingPage
        sessionId={state.sessionId}
        response={currentResponse}
        currentIndex={state.currentResponseIndex}
        totalCount={state.responses.length}
        onSubmit={handleSubmitRating}
      />
    )
  }

  if (state.page === 5 && state.results) {
    return (
      <ResultsPage
        results={state.results}
        responses={state.responses}
        ratings={state.ratings}
        personas={state.personas}
        positions={state.positions}
        onReset={handleReset}
      />
    )
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#94a3b8',
      }}
    >
      Loading…
    </div>
  )
}
