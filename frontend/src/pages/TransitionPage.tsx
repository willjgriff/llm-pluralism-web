import Badge from '../components/Badge'
import AxisSlider from '../components/AxisSlider'
import NetworkBackground from '../components/NetworkBackground'
import type { PersonaAssignment, Positions } from '../types'

interface TransitionPageProps {
  personas: PersonaAssignment
  positions: Positions
  /** Called when the user clicks Start Rating (triggers POST /session). */
  onStartRating: () => void
}

/**
 * Transition page showing persona assignment with visual axis sliders.
 *
 * @param props - Computed personas, positions, and navigation callback.
 * @returns Transition page content.
 */
export default function TransitionPage({ personas, positions, onStartRating }: TransitionPageProps) {
  return (
    <>
      <NetworkBackground />
      <div
        style={{
          position: 'relative',
          zIndex: 1,
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px',
        }}
      >
        <div style={{ maxWidth: '580px', width: '100%' }}>
          <div style={{ textAlign: 'center', marginBottom: '36px' }}>
            <Badge label="Your Profile" />
            <h2
              style={{
                fontSize: 'clamp(28px, 5vw, 40px)',
                fontWeight: 700,
                color: '#ffffff',
                letterSpacing: '-0.02em',
                margin: '16px 0 0',
                lineHeight: 1.2,
              }}
            >
              Here's how we've
              <br />
              mapped your values
            </h2>
          </div>

          <div
            style={{
              backgroundColor: '#0d0d1a',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '16px',
              padding: '28px 32px',
              marginBottom: '24px',
            }}
          >
            <AxisSlider
              axisLabel="Economic"
              leftLabel="Libertarian"
              rightLabel="Collectivist"
              position={positions.economic}
              activePersona={personas.economic}
            />
            <AxisSlider
              axisLabel="Identity"
              leftLabel="Nationalist"
              rightLabel="Globalist"
              position={positions.identity}
              activePersona={personas.identity}
            />
            <AxisSlider
              axisLabel="Technology"
              leftLabel="Tech Optimist"
              rightLabel="Tech Sceptic"
              position={positions.technology}
              activePersona={personas.technology}
            />
          </div>

          <p
            style={{
              fontSize: '15px',
              color: '#94a3b8',
              lineHeight: 1.65,
              textAlign: 'center',
              marginBottom: '28px',
            }}
          >
            Based on your responses you lean{' '}
            <span style={{ color: '#2dd4bf', fontWeight: 600 }}>{personas.economic}</span> on
            economics,{' '}
            <span style={{ color: '#2dd4bf', fontWeight: 600 }}>{personas.identity}</span> on
            identity, and{' '}
            <span style={{ color: '#2dd4bf', fontWeight: 600 }}>{personas.technology}</span> on
            technology. You'll now rate 7 AI responses on topics relevant to your worldview.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
            <button
              type="button"
              onClick={onStartRating}
              style={{
                backgroundColor: '#2dd4bf',
                color: '#080810',
                fontWeight: 600,
                fontSize: '16px',
                padding: '14px 48px',
                borderRadius: '10px',
                border: 'none',
                cursor: 'pointer',
                letterSpacing: '0.01em',
              }}
            >
              Start Rating
            </button>
            <p style={{ fontSize: '13px', color: '#475569', margin: 0 }}>
              Responses are shown without model names to avoid bias
            </p>
          </div>
        </div>
      </div>
    </>
  )
}
