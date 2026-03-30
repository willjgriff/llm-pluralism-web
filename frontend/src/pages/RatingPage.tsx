import { useState } from 'react'
import Badge from '../components/Badge'
import NetworkBackground from '../components/NetworkBackground'
import ProgressBar from '../components/ProgressBar'
import RatingCircles from '../components/RatingCircles'
import type { Rating, Response } from '../types'

interface RatingPageProps {
  sessionId: string
  response: Response
  currentIndex: number
  totalCount: number
  /** Called with the completed rating; navigation is handled by caller. */
  onSubmit: (rating: Rating) => void
}

/**
 * Rating page for a single response — shows prompt, response text, and score input.
 *
 * @param props - Session context, current response, and submit callback.
 * @returns Rating page content.
 */
export default function RatingPage({
  sessionId,
  response,
  currentIndex,
  totalCount,
  onSubmit,
}: RatingPageProps) {
  const [score, setScore] = useState<number | null>(null)
  const [reasoning, setReasoning] = useState('')

  const isLastResponse = currentIndex === totalCount - 1

  const handleNext = () => {
    if (score === null) return
    onSubmit({
      session_id: sessionId,
      question_id: response.question_id,
      response_model: response.response_model,
      score,
      reasoning: reasoning.trim() || null,
    })
    setScore(null)
    setReasoning('')
  }

  return (
    <>
      <NetworkBackground />
      <ProgressBar current={currentIndex + 1} total={totalCount} />
      <div
        style={{
          position: 'relative',
          zIndex: 1,
          minHeight: '100vh',
          padding: '60px 24px 48px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <div style={{ maxWidth: '680px', width: '100%' }}>
          <div style={{ textAlign: 'center', marginBottom: '28px' }}>
            <p style={{ fontSize: '13px', color: '#475569', marginBottom: '8px' }}>
              Response {currentIndex + 1} of {totalCount}
            </p>
            <Badge label="Rate This Response" />
          </div>

          <div
            style={{
              backgroundColor: '#0d0d1a',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '12px',
              padding: '20px 24px',
              marginBottom: '12px',
            }}
          >
            <p
              style={{
                fontSize: '11px',
                fontWeight: 600,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                color: '#2dd4bf',
                marginBottom: '8px',
              }}
            >
              The Question:
            </p>
            <p style={{ fontSize: '16px', color: '#ffffff', lineHeight: 1.55, margin: 0 }}>
              {response.prompt}
            </p>
          </div>

          <div
            style={{
              backgroundColor: '#0d0d1a',
              border: '1px solid rgba(255,255,255,0.08)',
              borderLeft: '3px solid rgba(45, 212, 191, 0.4)',
              borderRadius: '12px',
              padding: '20px 24px',
              marginBottom: '28px',
            }}
          >
            <p
              style={{
                fontSize: '11px',
                fontWeight: 600,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                color: '#2dd4bf',
                marginBottom: '10px',
              }}
            >
              AI Response
            </p>
            <p
              style={{
                fontSize: '15px',
                color: '#e2e8f0',
                lineHeight: 1.7,
                margin: 0,
                whiteSpace: 'pre-wrap',
              }}
            >
              {response.response_text}
            </p>
          </div>

          <div style={{ textAlign: 'center', marginBottom: '20px' }}>
            <p style={{ fontSize: '15px', color: '#94a3b8', marginBottom: '16px' }}>
              How reasonable is this response from your perspective?
            </p>
            <RatingCircles selected={score} onChange={setScore} />
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                marginTop: '10px',
                maxWidth: '300px',
                marginLeft: 'auto',
                marginRight: 'auto',
              }}
            >
              <span style={{ fontSize: '12px', color: '#475569' }}>Not at all reasonable</span>
              <span style={{ fontSize: '12px', color: '#475569' }}>Fully reasonable</span>
            </div>
          </div>

          <div style={{ marginBottom: '28px' }}>
            <label
              htmlFor="reasoning"
              style={{ display: 'block', fontSize: '14px', color: '#94a3b8', marginBottom: '8px' }}
            >
              Why did you give this score? (optional)
            </label>
            <textarea
              id="reasoning"
              value={reasoning}
              onChange={(event) => setReasoning(event.target.value)}
              placeholder="Share your reasoning..."
              rows={4}
              style={{
                width: '100%',
                backgroundColor: '#0d0d1a',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '8px',
                padding: '12px 14px',
                color: '#ffffff',
                fontSize: '14px',
                lineHeight: 1.6,
                resize: 'vertical',
                outline: 'none',
                fontFamily: 'inherit',
                boxSizing: 'border-box',
              }}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <button
              type="button"
              onClick={handleNext}
              disabled={score === null}
              style={{
                backgroundColor: score !== null ? '#2dd4bf' : 'rgba(45, 212, 191, 0.3)',
                color: score !== null ? '#080810' : 'rgba(8, 8, 16, 0.5)',
                fontWeight: 600,
                fontSize: '16px',
                padding: '14px 48px',
                borderRadius: '10px',
                border: 'none',
                cursor: score !== null ? 'pointer' : 'not-allowed',
                letterSpacing: '0.01em',
              }}
            >
              {isLastResponse ? 'See My Results' : 'Next Response'}
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
