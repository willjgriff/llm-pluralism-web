"use client"

import { useState, useEffect } from "react"
import { NetworkCanvas } from "@/components/network-canvas"
import { LandingView } from "@/components/views/landing-view"
import { QuestionnaireView } from "@/components/views/questionnaire-view"
import { ProfileView } from "@/components/views/profile-view"
import { RateView } from "@/components/views/rate-view"
import { ResultsView } from "@/components/views/results-view"
import { assignPersonas } from "@/lib/personas"
import { createSession, submitRating, getResults, getMoreResponses } from "@/lib/api"
import { AppState, Rating, AIResponse, PersonaProfile, Results } from "@/lib/types"

type View = "landing" | "questionnaire" | "profile" | "rate" | "results"

const INITIAL_STATE: AppState = {
  sessionId: null,
  answers: [],
  personaProfile: null,
  responses: [],
  seenResponseKeys: [],
  ratings: [],
  results: null,
  isRepeatSession: false,
}

export default function Home() {
  const [currentView, setCurrentView] = useState<View>("landing")
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [displayedView, setDisplayedView] = useState<View>("landing")
  const [appState, setAppState] = useState<AppState>(INITIAL_STATE)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const isRepeat = !!localStorage.getItem("llm_pluralism_completed")
    if (isRepeat) {
      setAppState(prev => ({ ...prev, isRepeatSession: true }))
    }
  }, [])

  const handleNavigate = (view: string) => {
    if (view === currentView) return

    setIsTransitioning(true)

    setTimeout(() => {
      setCurrentView(view as View)
      setDisplayedView(view as View)
      window.scrollTo(0, 0)

      setTimeout(() => {
        setIsTransitioning(false)
      }, 50)
    }, 200)
  }

  const handleQuestionnaireComplete = async (answers: number[]) => {
    setIsLoading(true)
    setError(null)
    try {
      const isRepeat = !!localStorage.getItem("llm_pluralism_completed")
      const personaProfile = assignPersonas(answers)
      const sessionResponse = await createSession(answers, isRepeat)
      const seenKeys = sessionResponse.responses.map(
        (r: AIResponse) => `${r.question_id}:${r.model}`
      )
      setAppState(prev => ({
        ...prev,
        answers,
        personaProfile,
        sessionId: sessionResponse.session_id,
        responses: sessionResponse.responses,
        seenResponseKeys: seenKeys,
        isRepeatSession: isRepeat,
      }))
      handleNavigate("profile")
    } catch (err) {
      setError("Couldn't connect to the server. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleRatingSubmit = async (rating: Rating) => {
    if (!appState.sessionId) return
    try {
      await submitRating(appState.sessionId, rating)
      setAppState(prev => {
        const existingIndex = prev.ratings.findIndex(
          r => r.question_id === rating.question_id && r.model === rating.model
        )
        const isUpdate = existingIndex >= 0
        const updatedRatings = isUpdate
          ? prev.ratings.map((r, i) => (i === existingIndex ? rating : r))
          : [...prev.ratings, rating]
        return {
          ...prev,
          ratings: updatedRatings,
        }
      })
    } catch (err) {
      throw new Error("Failed to save rating")
    }
  }

  const handleViewResults = async () => {
    if (!appState.sessionId) return
    setIsLoading(true)
    setError(null)
    try {
      const results = await getResults(appState.sessionId)
      localStorage.setItem("llm_pluralism_completed", "true")
      setAppState(prev => ({ ...prev, results }))
      handleNavigate("results")
    } catch (err) {
      setError("Couldn't load your results. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleGetMoreResponses = async () => {
    if (!appState.sessionId) return
    try {
      const more = await getMoreResponses(appState.sessionId, appState.seenResponseKeys)
      const newKeys = more.map((r: AIResponse) => `${r.question_id}:${r.model}`)
      setAppState(prev => ({
        ...prev,
        responses: [...prev.responses, ...more],
        seenResponseKeys: [...prev.seenResponseKeys, ...newKeys],
      }))
    } catch (err) {
      // Fail silently — user can still see results
      console.error("Failed to load more responses:", err)
    }
  }

  const handleReset = () => {
    setAppState({
      ...INITIAL_STATE,
      isRepeatSession: true,
    })
    handleNavigate("landing")
  }

  return (
    <main className="relative min-h-screen bg-[#080810]">
      <NetworkCanvas />

      <div
        style={{
          opacity: isTransitioning ? 0 : 1,
          transition: "opacity 200ms ease-in-out",
        }}
      >
        {displayedView === "landing" && (
          <LandingView onStart={() => handleNavigate("questionnaire")} />
        )}
        {displayedView === "questionnaire" && (
          <QuestionnaireView
            onComplete={handleQuestionnaireComplete}
            isLoading={isLoading}
            error={error}
            onClearError={() => setError(null)}
          />
        )}
        {displayedView === "profile" && appState.personaProfile && (
          <ProfileView
            personaProfile={appState.personaProfile}
            onStartRating={() => handleNavigate("rate")}
          />
        )}
        {displayedView === "rate" && appState.personaProfile && (
          <RateView
            responses={appState.responses}
            ratingsCount={appState.ratings.length}
            onRatingSubmit={handleRatingSubmit}
            onViewResults={handleViewResults}
            onGetMoreResponses={handleGetMoreResponses}
            isLoading={isLoading}
            error={error}
            onClearError={() => setError(null)}
          />
        )}
        {displayedView === "results" && appState.results && appState.personaProfile && (
          <ResultsView
            results={appState.results}
            personaProfile={appState.personaProfile}
            onReset={handleReset}
          />
        )}
      </div>
    </main>
  )
}
