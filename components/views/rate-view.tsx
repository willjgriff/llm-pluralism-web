"use client"

import { useState, useEffect, useRef } from "react"
import { ChevronDown, ChevronUp, CornerDownLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { AIResponse, Rating } from "@/lib/types"

/**
 * Smoothly scrolls the document and/or an inner overflow container toward the top
 * over `durationMs` milliseconds using a short ease-out curve (fixed duration, not distance-based).
 *
 * Parameters:
 *   scrollRoot: Optional wrapper element (for example `overflow-y-auto`) whose `scrollTop` is animated.
 *   durationMs: How long the scroll animation should run in milliseconds.
 *
 * Returns:
 *   Nothing.
 */
function scrollViewportTowardTopSmoothly(
  scrollRoot: HTMLElement | null,
  durationMs: number,
): void {
  const docEl = document.scrollingElement ?? document.documentElement
  const startDoc = docEl.scrollTop
  const startRoot = scrollRoot?.scrollTop ?? 0
  if (startDoc === 0 && startRoot === 0) return

  const startTime = performance.now()

  const tick = (now: number) => {
    const elapsed = now - startTime
    const t = Math.min(1, elapsed / durationMs)
    const eased = 1 - (1 - t) ** 3
    if (startDoc > 0) {
      docEl.scrollTop = startDoc * (1 - eased)
    }
    if (startRoot > 0 && scrollRoot) {
      scrollRoot.scrollTop = startRoot * (1 - eased)
    }
    if (t < 1) {
      requestAnimationFrame(tick)
    }
  }

  requestAnimationFrame(tick)
}

/**
 * Runs `scrollViewportTowardTopSmoothly` after the next frame so React can commit DOM updates first.
 *
 * Parameters:
 *   getScrollRoot: Returns the scrollable rate-view root element, read when the animation starts.
 *   durationMs: Passed through to `scrollViewportTowardTopSmoothly`.
 *
 * Returns:
 *   Nothing.
 */
function scheduleViewportScrollTowardTop(
  getScrollRoot: () => HTMLElement | null,
  durationMs: number,
): void {
  queueMicrotask(() => {
    requestAnimationFrame(() => {
      scrollViewportTowardTopSmoothly(getScrollRoot(), durationMs)
    })
  })
}

interface RateViewProps {
  responses: AIResponse[]
  ratingsCount: number
  onRatingSubmit: (rating: Rating) => Promise<void>
  onViewResults: () => void
  onGetMoreResponses: () => Promise<boolean>
  error?: string | null
  onClearError?: () => void
}

export function RateView({
  responses,
  ratingsCount,
  onRatingSubmit,
  onViewResults,
  onGetMoreResponses,
  error,
  onClearError,
}: RateViewProps) {
  const [localRatings, setLocalRatings] = useState<Record<number, number>>({})
  const [feedback, setFeedback] = useState("")
  const [localIndex, setLocalIndex] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isPrefetching, setIsPrefetching] = useState(false)
  const [ratingError, setRatingError] = useState<string | null>(null)
  const [hasNoMoreResponses, setHasNoMoreResponses] = useState(false)
  const [prefetchedResponseCount, setPrefetchedResponseCount] = useState(0)
  const isPrefetchRequestInFlight = useRef(false)
  const scrollRootRef = useRef<HTMLDivElement>(null)
  const submittedRatingsByResponse = useRef<Record<string, { score: number; reasoning?: string }>>({})
  const [isRatingGuidanceExpanded, setIsRatingGuidanceExpanded] = useState(true)
  const [hasAutoCollapsedGuidance, setHasAutoCollapsedGuidance] = useState(false)
  /** After the user reaches response 7 (index 6), progress text drops "of 6" and stays that way even if they go back. */
  const [progressExpandedLabel, setProgressExpandedLabel] = useState(false)

  const currentResponse = responses[localIndex] ?? null
  const selectedRating = localRatings[localIndex] ?? null
  const canSeeResults = ratingsCount >= 6
  const isOnFinalResponse = localIndex >= responses.length - 1
  const isNextResponseDisabled = (hasNoMoreResponses && isOnFinalResponse) || (isPrefetching && isOnFinalResponse)

  useEffect(() => {
    if (localIndex >= 6) setProgressExpandedLabel(true)
  }, [localIndex])

  useEffect(() => {
    const shouldPrefetchMoreResponses =
      responses.length > 0 &&
      localIndex >= responses.length - 2 &&
      !hasNoMoreResponses &&
      prefetchedResponseCount !== responses.length

    if (!shouldPrefetchMoreResponses || isPrefetchRequestInFlight.current) return

    isPrefetchRequestInFlight.current = true
    setIsPrefetching(true)
    void (async () => {
      try {
        const hasMoreResponses = await onGetMoreResponses()
        if (!hasMoreResponses) setHasNoMoreResponses(true)
        setPrefetchedResponseCount(responses.length)
      } finally {
        isPrefetchRequestInFlight.current = false
        setIsPrefetching(false)
      }
    })()
  }, [localIndex, responses.length, hasNoMoreResponses, prefetchedResponseCount, onGetMoreResponses])

  /** Tracks the current response slot (0-based), so the bar moves when navigating back/forward, not only when ratings are saved. */
  const progressPercent = Math.min((localIndex / 6) * 100, 100)

  const getResponseKey = (response: AIResponse): string => `${response.question_id}:${response.model}`

  const getNormalizedReasoning = (value: string): string | undefined => {
    const normalized = value.trim()
    return normalized.length > 0 ? normalized : undefined
  }

  const submitIfChanged = async (): Promise<void> => {
    if (!currentResponse || selectedRating === null) return
    const responseKey = getResponseKey(currentResponse)
    const reasoning = getNormalizedReasoning(feedback)
    const previousSubmission = submittedRatingsByResponse.current[responseKey]
    const hasChanged =
      !previousSubmission ||
      previousSubmission.score !== selectedRating ||
      previousSubmission.reasoning !== reasoning

    if (!hasChanged) return

    await onRatingSubmit({
      question_id: currentResponse.question_id,
      model: currentResponse.model,
      score: selectedRating,
      reasoning,
    })
    submittedRatingsByResponse.current[responseKey] = { score: selectedRating, reasoning }
  }

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
          await submitIfChanged()
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
      if (localIndex === 0 && !hasAutoCollapsedGuidance) {
        setIsRatingGuidanceExpanded(false)
        setHasAutoCollapsedGuidance(true)
      }
      scheduleViewportScrollTowardTop(() => scrollRootRef.current, 320)
      return
    }
    if (selectedRating === null) return
    setIsSubmitting(true)
    setRatingError(null)
    try {
      await submitIfChanged()
      if (localIndex >= responses.length - 1) {
        if (isPrefetching) {
          return
        }
        if (hasNoMoreResponses) {
          if (document.activeElement instanceof HTMLElement) {
            document.activeElement.blur()
          }
          setFeedback("")
          return
        }
        const hasMoreResponses = await onGetMoreResponses()
        if (!hasMoreResponses) {
          setHasNoMoreResponses(true)
          if (document.activeElement instanceof HTMLElement) {
            document.activeElement.blur()
          }
          setFeedback("")
          return
        }
      }
      if (document.activeElement instanceof HTMLElement) {
        document.activeElement.blur()
      }
      setLocalIndex(prev => prev + 1)
      setFeedback("")
      if (localIndex === 0 && !hasAutoCollapsedGuidance) {
        setIsRatingGuidanceExpanded(false)
        setHasAutoCollapsedGuidance(true)
      }
      scheduleViewportScrollTowardTop(() => scrollRootRef.current, 320)
    } catch {
      setRatingError("Couldn't save your rating. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSeeResults = async () => {
    if (isSubmitting) return
    if (selectedRating === null || !currentResponse) {
      onViewResults()
      return
    }

    setIsSubmitting(true)
    setRatingError(null)
    try {
      await submitIfChanged()
      if (document.activeElement instanceof HTMLElement) {
        document.activeElement.blur()
      }
      setFeedback("")
      onViewResults()
    } catch {
      setRatingError("Couldn't save your rating. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null
      if (target && ["TEXTAREA", "INPUT", "SELECT"].includes(target.tagName)) return
      if (target?.isContentEditable) return
      if (isNextResponseDisabled || isSubmitting) return
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault()
        void handleNextResponse()
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [isNextResponseDisabled, isSubmitting, selectedRating, currentResponse, localIndex, responses.length, feedback])

  if (!currentResponse) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    )
  }

  return (
    <div ref={scrollRootRef} className="min-h-screen overflow-y-auto">
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
              {currentResponse.prompt_text}
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
            <div className="mb-4 flex items-center justify-center gap-2">
              <p className="text-muted-foreground text-sm">
                How reasonable is this response from your perspective?
              </p>
              <button
                type="button"
                onClick={() => setIsRatingGuidanceExpanded(prev => !prev)}
                className="inline-flex items-center gap-1 text-xs text-muted-foreground underline underline-offset-4 transition-colors hover:text-foreground/90"
                aria-expanded={isRatingGuidanceExpanded}
              >
                <span>Rating Guidance</span>
                {isRatingGuidanceExpanded ? (
                  <ChevronUp className="size-3.5 shrink-0 text-muted-foreground" aria-hidden />
                ) : (
                  <ChevronDown className="size-3.5 shrink-0 text-muted-foreground" aria-hidden />
                )}
              </button>
            </div>
            {isRatingGuidanceExpanded && (
              <div className="mb-6 rounded-lg border border-white/10 bg-white/[0.02] px-4 py-3 text-left">
                <ul className="list-disc space-y-1.5 pl-5 text-xs leading-relaxed text-muted-foreground sm:text-sm">
                  <li>These responses were pre-generated and selected using your value profile, none are created for you personally.</li>
                  <li>Please rate the content of the response on its merits, whether the reasoning and position seem reasonable to you. Not its academic rigour, factual correctness, or whether you think AI should answer this type of question.</li>
                  <li>Responses are limited to 80 words.</li>
                </ul>
              </div>
            )}
            
            {/* Circles on row 1; labels below, centered under 1 and 5; label margins add space between phrases only */}
            <div className="mx-auto grid w-max grid-cols-[repeat(5,2.75rem)] gap-x-3 gap-y-2 sm:grid-cols-[repeat(5,3rem)] sm:gap-x-4 sm:gap-y-2.5">
              {[1, 2, 3, 4, 5].map((rating) => (
                <button
                  key={rating}
                  type="button"
                  onClick={() => handleSelectRating(rating)}
                  className="row-start-1 size-11 justify-self-center rounded-full border-2 flex items-center justify-center text-base font-medium transition-all duration-200 sm:size-12 sm:text-lg"
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
              <span className="col-start-1 row-start-2 mr-2 justify-self-center whitespace-nowrap text-center text-xs text-muted-foreground sm:mr-3 sm:text-sm">
                Not at all reasonable
              </span>
              <span className="col-start-5 row-start-2 ml-2 justify-self-center whitespace-nowrap text-center text-xs text-muted-foreground sm:ml-3 sm:text-sm">
                Fully reasonable
              </span>
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
            <p className="mx-auto mb-5 max-w-lg text-xs leading-relaxed tracking-tight text-muted-foreground sm:text-sm">
            If you have a few extra minutes, rating up to 18 responses total strengthens the research significantly.
            </p>
            {canSeeResults ? (
              <div className="flex justify-center gap-4">
                <Button 
                  size="lg"
                  disabled={isNextResponseDisabled}
                  onClick={handleNextResponse}
                  className="px-8 py-6 text-base font-medium bg-accent text-accent-foreground hover:bg-accent/90 transition-all duration-200 shadow-lg shadow-accent/25 disabled:opacity-40 disabled:shadow-none disabled:cursor-not-allowed"
                >
                  Next Response
                  <CornerDownLeft
                    className="size-[1rem] shrink-0"
                    aria-hidden
                    strokeWidth={2.25}
                  />
                </Button>
                <Button 
                  size="lg"
                  variant="outline"
                  onClick={() => void handleSeeResults()}
                  disabled={isSubmitting}
                  className="px-8 py-6 text-base font-medium transition-all duration-200"
                  style={{
                    borderColor: "rgb(94, 170, 168)",
                    color: "rgb(94, 170, 168)",
                    backgroundColor: "transparent"
                  }}
                >
                  See My Results
                </Button>
              </div>
            ) : (
              <Button 
                size="lg"
                disabled={isNextResponseDisabled}
                onClick={handleNextResponse}
                className="px-10 py-6 text-base font-medium bg-accent text-accent-foreground hover:bg-accent/90 transition-all duration-200 shadow-lg shadow-accent/25 disabled:opacity-40 disabled:shadow-none disabled:cursor-not-allowed"
              >
                Next Response
                <CornerDownLeft
                  className="size-[1rem] shrink-0"
                  aria-hidden
                  strokeWidth={2.25}
                />
              </Button>
            )}
            {hasNoMoreResponses && (
              <p className="text-xs text-muted-foreground italic mt-4">
                You have rated all available responses for this session.
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
