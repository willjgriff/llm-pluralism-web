import { useState } from 'react'
import Badge from '../components/Badge'
import NetworkBackground from '../components/NetworkBackground'
import ProgressBar from '../components/ProgressBar'
import type { PersonaAssignment, Positions } from '../types'

const QUESTIONS = [
  'The government should play a major role in reducing inequality through taxation and public services.',
  'Individuals should be free to keep the wealth they earn with minimal state redistribution.',
  'Nations have a primary duty to protect their own citizens before helping people in other countries.',
  'Open borders and freedom of movement are broadly good for humanity.',
  'AI development should be slowed until we better understand the risks.',
  'The benefits of technological progress strongly outweigh the risks.',
]

interface QuestionnairePageProps {
  /** Called with computed answers, personas, and positions on submit. */
  onSubmit: (
    answers: number[],
    personas: PersonaAssignment,
    positions: Positions,
  ) => void
}

/**
 * Compute persona assignments and normalised axis positions from six answers.
 *
 * @param answers - Six Likert-scale answers from 1 to 5.
 * @returns Computed personas and 0-1 positions.
 */
function computePersonas(answers: number[]): { personas: PersonaAssignment; positions: Positions } {
  const economicScore = answers[1] - answers[0]
  const identityScore = answers[2] - answers[3]
  const technologyScore = answers[5] - answers[4]

  const personas: PersonaAssignment = {
    economic: economicScore >= 0 ? 'Libertarian' : 'Collectivist',
    identity: identityScore >= 0 ? 'Nationalist' : 'Globalist',
    technology: technologyScore >= 0 ? 'Tech Optimist' : 'Tech Sceptic',
  }

  const positions: Positions = {
    economic: (answers[1] - answers[0] + 4) / 8,
    identity: (answers[2] - answers[3] + 4) / 8,
    technology: (answers[5] - answers[4] + 4) / 8,
  }

  return { personas, positions }
}

/**
 * Six-question Likert questionnaire page with progress tracking.
 *
 * @param props - Submit callback.
 * @returns Questionnaire page content.
 */
export default function QuestionnairePage({ onSubmit }: QuestionnairePageProps) {
  const [answers, setAnswers] = useState<number[]>([0, 0, 0, 0, 0, 0])

  const answeredCount = answers.filter((answer) => answer > 0).length
  const allAnswered = answeredCount === QUESTIONS.length

  const handleAnswer = (questionIndex: number, value: number) => {
    setAnswers((prev) => prev.map((existing, index) => (index === questionIndex ? value : existing)))
  }

  const handleContinue = () => {
    const { personas, positions } = computePersonas(answers)
    onSubmit(answers, personas, positions)
  }

  return (
    <>
      <NetworkBackground />
      <ProgressBar current={answeredCount} total={QUESTIONS.length} />
      <div
        style={{
          position: 'relative',
          zIndex: 1,
          minHeight: '100vh',
          padding: '72px 24px 48px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <div style={{ maxWidth: '680px', width: '100%' }}>
          <div style={{ textAlign: 'center', marginBottom: '40px' }}>
            <Badge label="Your Values" />
            <h2
              style={{
                fontSize: 'clamp(28px, 5vw, 40px)',
                fontWeight: 700,
                color: '#ffffff',
                letterSpacing: '-0.02em',
                margin: '16px 0 12px',
              }}
            >
              Tell us about your perspective
            </h2>
            <p style={{ fontSize: '15px', color: '#94a3b8', margin: 0, lineHeight: 1.6 }}>
              There are no right or wrong answers. We use your responses to personalise your
              experience.
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {QUESTIONS.map((questionText, questionIndex) => (
              <QuestionCard
                key={questionText}
                text={questionText}
                selected={answers[questionIndex]}
                onChange={(value) => handleAnswer(questionIndex, value)}
              />
            ))}
          </div>

          <div
            style={{
              marginTop: '32px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '12px',
            }}
          >
            <button
              type="button"
              onClick={handleContinue}
              disabled={!allAnswered}
              style={{
                backgroundColor: allAnswered ? '#2dd4bf' : 'rgba(45, 212, 191, 0.3)',
                color: allAnswered ? '#080810' : 'rgba(8, 8, 16, 0.5)',
                fontWeight: 600,
                fontSize: '16px',
                padding: '14px 48px',
                borderRadius: '10px',
                border: 'none',
                cursor: allAnswered ? 'pointer' : 'not-allowed',
                letterSpacing: '0.01em',
              }}
            >
              Continue
            </button>
            <p style={{ fontSize: '13px', color: '#475569', margin: 0 }}>
              6 questions · takes about 30 seconds
            </p>
          </div>
        </div>
      </div>
    </>
  )
}

interface QuestionCardProps {
  text: string
  selected: number
  onChange: (value: number) => void
}

/**
 * Single question card with five radio options on a Likert scale.
 *
 * @param props - Question text, selected value, and change handler.
 * @returns Question card element.
 */
function QuestionCard({ text, selected, onChange }: QuestionCardProps) {
  return (
    <div
      style={{
        backgroundColor: '#0d0d1a',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: '12px',
        padding: '20px 24px',
      }}
    >
      <p
        style={{
          fontSize: '15px',
          color: '#ffffff',
          marginBottom: '16px',
          lineHeight: 1.55,
          margin: '0 0 16px',
        }}
      >
        {text}
      </p>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '8px',
        }}
      >
        <span style={{ fontSize: '12px', color: '#475569', flexShrink: 0 }}>Strongly Disagree</span>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          {[1, 2, 3, 4, 5].map((value) => {
            const isSelected = selected === value
            return (
              <button
                key={value}
                type="button"
                onClick={() => onChange(value)}
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  border: isSelected ? '2px solid #2dd4bf' : '2px solid rgba(255,255,255,0.25)',
                  backgroundColor: isSelected ? '#2dd4bf' : 'transparent',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  padding: 0,
                }}
                aria-label={`Option ${value}`}
                aria-pressed={isSelected}
              />
            )
          })}
        </div>
        <span style={{ fontSize: '12px', color: '#475569', flexShrink: 0 }}>Strongly Agree</span>
      </div>
    </div>
  )
}
