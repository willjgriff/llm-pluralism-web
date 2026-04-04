"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { AIResponse, Rating } from "@/lib/types"

interface RateViewProps {
  responses: AIResponse[]
  ratingsCount: number
  onRatingSubmit: (rating: Rating) => Promise<void>
  onViewResults: () => void
  onGetMoreResponses: () => void
  isLoading?: boolean
  error?: string | null
  onClearError?: () => void
}

export function RateView({
  responses,
  ratingsCount,
  onRatingSubmit,
  onViewResults,
  onGetMoreResponses,
  isLoading,
  error,
  onClearError,
}: RateViewProps) {
  const [localRatings, setLocalRatings] = useState<Record<number, number>>({})
  const [feedback, setFeedback] = useState("")
  const [localIndex, setLocalIndex] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [ratingError, setRatingError] = useState<string | null>(null)
  /** After the user reaches response 7 (index 6), progress text drops "of 6" and stays that way even if they go back. */
  const [progressExpandedLabel, setProgressExpandedLabel] = useState(false)

  const currentResponse = responses[localIndex] ?? null
  const selectedRating = localRatings[localIndex] ?? null
  const canSeeResults = ratingsCount >= 6

  useEffect(() => {
    if (localIndex >= 6) setProgressExpandedLabel(true)
  }, [localIndex])

  const progressPercent = Math.min((ratingsCount / 6) * 100, 100)

  const handleSelectRating = (rating: number) => {
    if (!currentResponse) return
    setLocalRatings(prev => ({ ...prev, [localIndex]: rating }))
  }

  const handlePreviousResponse = () => {
    if (localIndex > 0) {
      setLocalIndex(prev => prev - 1)
      setFeedback("")
    }
  }

  const handleNextResponse = async () => {
    if (!currentResponse || isSubmitting) return
    if (localIndex < ratingsCount) {
      if (selectedRating !== null) {
        setIsSubmitting(true)
        setRatingError(null)
        try {
          await onRatingSubmit({
            question_id: currentResponse.question_id,
            model: currentResponse.model,
            score: selectedRating,
            reasoning: feedback.trim() || undefined,
          })
        } catch {
          setRatingError("Couldn't save your rating. Please try again.")
          return
        } finally {
          setIsSubmitting(false)
        }
      }
      if (document.activeElement instanceof HTMLElement) {
        document.activeElement.blur()
      }
      setLocalIndex(prev => prev + 1)
      setFeedback("")
      return
    }
    if (selectedRating === null) return
    setIsSubmitting(true)
    setRatingError(null)
    try {
      await onRatingSubmit({
        question_id: currentResponse.question_id,
        model: currentResponse.model,
        score: selectedRating,
        reasoning: feedback.trim() || undefined,
      })
      if (localIndex >= responses.length - 1) {
        await onGetMoreResponses()
      }
      if (document.activeElement instanceof HTMLElement) {
        document.activeElement.blur()
      }
      setLocalIndex(prev => prev + 1)
      setFeedback("")
    } catch {
      setRatingError("Couldn't save your rating. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSeeResults = () => {
    onViewResults()
  }

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null
      if (target && ["TEXTAREA", "INPUT", "SELECT"].includes(target.tagName)) return
      if (target?.isContentEditable) return
      if (selectedRating === null || isSubmitting) return
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault()
        void handleNextResponse()
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [selectedRating, isSubmitting, currentResponse, localIndex, responses.length, feedback])

  if (!currentResponse) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen overflow-y-auto">
      {/* Progress indicator at top */}
      <div className="fixed top-0 left-0 right-0 z-20" style={{ backgroundColor: "#080810" }}>
        <div className="flex items-center justify-center h-10">
          <span className="text-xs text-muted-foreground tracking-wide">
            {progressExpandedLabel
              ? `Response ${localIndex + 1}`
              : `Response ${localIndex + 1} of 6`}
          </span>
        </div>
        <div className="w-full h-0.5 bg-secondary">
          <div 
            className="h-full transition-all duration-300"
            style={{ 
              width: `${progressPercent}%`,
              backgroundColor: "rgb(94, 170, 168)"
            }}
          />
        </div>
      </div>
      
      {/* Content */}
      <div className="relative z-10 min-h-screen flex items-center justify-center px-6 py-24">
        <div className="w-full max-w-[640px]">
          
          {/* Back button */}
          {localIndex > 0 && (
            <div className="mb-4">
              <button
                onClick={handlePreviousResponse}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center"
              >
                ← Previous response
              </button>
            </div>
          )}
          
          {/* Badge */}
          <div className="flex justify-center mb-8">
            <span 
              className="px-3 py-1 text-xs font-medium tracking-wider rounded-full"
              style={{ 
                backgroundColor: "rgba(94, 170, 168, 0.15)",
                color: "rgb(94, 170, 168)"
              }}
            >
              RATE THIS RESPONSE
            </span>
          </div>
          
          {/* Question card */}
          <div 
            className="rounded-lg p-5 mb-4"
            style={{ backgroundColor: "rgba(255, 255, 255, 0.06)" }}
          >
            <span className="text-xs text-muted-foreground tracking-wide uppercase mb-2 block">
              The question:
            </span>
            <p className="text-foreground text-lg font-medium leading-relaxed">
              {currentResponse.prompt}
            </p>
          </div>
          
          {/* AI Response card */}
          <div 
            className="rounded-lg p-5 mb-8 relative"
            style={{ 
              backgroundColor: "rgba(255, 255, 255, 0.03)",
              borderLeft: "2px solid rgba(94, 170, 168, 0.4)"
            }}
          >
            <span 
              className="text-xs tracking-wide uppercase mb-3 block"
              style={{ color: "rgba(94, 170, 168, 0.7)" }}
            >
              AI Response
            </span>
            <p className="text-foreground/90 leading-relaxed">
              {currentResponse.response_text}
            </p>
          </div>
          
          {/* Rating section */}
          <div className="text-center mb-6">
            <p className="text-muted-foreground text-sm mb-6">
              How reasonable is this response from your perspective?
            </p>
            
            {/* 1-5 rating circles */}
            <div className="flex justify-center gap-4 mb-3">
              {[1, 2, 3, 4, 5].map((rating) => (
                <button
                  key={rating}
                  onClick={() => handleSelectRating(rating)}
                  className="w-12 h-12 rounded-full border-2 flex items-center justify-center text-lg font-medium transition-all duration-200"
                  style={{
                    borderColor: selectedRating === rating 
                      ? "rgb(94, 170, 168)" 
                      : "rgba(255, 255, 255, 0.2)",
                    backgroundColor: selectedRating === rating 
                      ? "rgb(94, 170, 168)" 
                      : "transparent",
                    color: selectedRating === rating 
                      ? "#080810" 
                      : "rgba(255, 255, 255, 0.7)",
                    boxShadow: selectedRating === rating 
                      ? "0 0 16px rgba(94, 170, 168, 0.4)" 
                      : "none"
                  }}
                >
                  {rating}
                </button>
              ))}
            </div>
            
            {/* Rating labels */}
            <div className="flex justify-between max-w-[280px] mx-auto">
              <span className="text-sm text-muted-foreground">Not at all reasonable</span>
              <span className="text-sm text-muted-foreground">Fully reasonable</span>
            </div>
          </div>
          
          {/* Optional feedback */}
          <div className="mb-8">
            <label className="text-sm text-muted-foreground mb-2 block">
              Why did you give this score? (optional)
            </label>
            <textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="Share your reasoning..."
              rows={3}
              className="w-full rounded-lg p-4 text-sm text-foreground placeholder:text-muted-foreground/50 resize-none focus:outline-none focus:ring-1 transition-all"
              style={{ 
                backgroundColor: "rgba(255, 255, 255, 0.03)",
                border: "1px solid rgba(255, 255, 255, 0.1)",
              }}
            />
          </div>
          
          {/* Buttons */}
          {ratingError && (
            <p className="text-sm text-center mb-4" style={{ color: "rgba(255, 100, 100, 0.9)" }}>
              {ratingError}
            </p>
          )}
          <div className="text-center">
            {canSeeResults ? (
              <div className="flex justify-center gap-4">
                <Button 
                  size="lg"
                  disabled={selectedRating === null}
                  onClick={handleNextResponse}
                  className="px-8 py-6 text-base font-medium bg-accent text-accent-foreground hover:bg-accent/90 transition-all duration-200 shadow-lg shadow-accent/25 disabled:opacity-40 disabled:shadow-none disabled:cursor-not-allowed"
                >
                  Next Response ↵
                </Button>
                <Button 
                  size="lg"
                  variant="outline"
                  onClick={handleSeeResults}
                  disabled={isLoading}
                  className="px-8 py-6 text-base font-medium transition-all duration-200"
                  style={{
                    borderColor: "rgb(94, 170, 168)",
                    color: "rgb(94, 170, 168)",
                    backgroundColor: "transparent"
                  }}
                >
                  {isLoading ? "Loading results..." : "See My Results"}
                </Button>
              </div>
            ) : (
              <Button 
                size="lg"
                disabled={selectedRating === null}
                onClick={handleNextResponse}
                className="px-10 py-6 text-base font-medium bg-accent text-accent-foreground hover:bg-accent/90 transition-all duration-200 shadow-lg shadow-accent/25 disabled:opacity-40 disabled:shadow-none disabled:cursor-not-allowed"
              >
                Next Response ↵
              </Button>
            )}
            
            {/* Encouragement text - only show after initial 6 responses */}
            {localIndex >= 6 && (
              <p className="text-xs text-muted-foreground italic mt-4">
                More responses = a more accurate AI match and better research data
              </p>
            )}
            {error && (
              <p className="text-sm text-center mt-4" style={{ color: "rgba(255, 100, 100, 0.9)" }}>
                {error}
                {onClearError && (
                  <button
                    onClick={onClearError}
                    className="ml-2 underline"
                    style={{ color: "rgba(255, 100, 100, 0.7)" }}
                  >
                    Dismiss
                  </button>
                )}
              </p>
            )}
          </div>
          
        </div>
      </div>
    </div>
  )
}
