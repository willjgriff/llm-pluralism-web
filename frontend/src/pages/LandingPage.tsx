import Badge from '../components/Badge'
import NetworkBackground from '../components/NetworkBackground'

interface LandingPageProps {
  /** Called when the user clicks Start. */
  onStart: () => void
}

/**
 * Landing page — full-viewport hero with headline and start CTA.
 *
 * @param props - Navigation callback.
 * @returns Landing page content.
 */
export default function LandingPage({ onStart }: LandingPageProps) {
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
        <div
          style={{
            maxWidth: '640px',
            width: '100%',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '24px',
          }}
        >
          <Badge label="AI Safety Research" />

          <h1
            style={{
              fontSize: 'clamp(36px, 6vw, 56px)',
              fontWeight: 700,
              color: '#ffffff',
              letterSpacing: '-0.02em',
              lineHeight: 1.15,
              margin: 0,
            }}
          >
            Does AI understand
            <br />
            your worldview?
          </h1>

          <p
            style={{
              fontSize: '16px',
              color: '#94a3b8',
              lineHeight: 1.65,
              maxWidth: '520px',
              margin: 0,
            }}
          >
            AI models are trained to please the majority — but whose majority? Rate a few AI
            responses on contested topics and see how well AI performs for someone with your values.
          </p>

          <div
            style={{
              display: 'flex',
              gap: '28px',
              alignItems: 'center',
              justifyContent: 'center',
              flexWrap: 'wrap',
            }}
          >
            <FeaturePill icon={<ClockIcon />} label="2 minutes" />
            <FeaturePill icon={<ChatIcon />} label="7 questions" />
            <FeaturePill icon={<ChartIcon />} label="See your results" />
          </div>

          <button
            type="button"
            onClick={onStart}
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
            Start
          </button>

          <p style={{ fontSize: '13px', color: '#475569', margin: 0 }}>
            No account required. Your responses are anonymous.
          </p>
        </div>
      </div>
    </>
  )
}

function FeaturePill({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        color: '#94a3b8',
        fontSize: '14px',
      }}
    >
      <span style={{ color: '#2dd4bf', display: 'flex', alignItems: 'center' }}>{icon}</span>
      {label}
    </div>
  )
}

function ClockIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  )
}

function ChatIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  )
}

function ChartIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="18" y1="20" x2="18" y2="10" />
      <line x1="12" y1="20" x2="12" y2="4" />
      <line x1="6" y1="20" x2="6" y2="14" />
    </svg>
  )
}
