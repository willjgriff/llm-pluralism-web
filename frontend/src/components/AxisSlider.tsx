interface AxisSliderProps {
  /** Short axis name displayed as uppercase label above the track. */
  axisLabel: string
  /** Label for the left pole. */
  leftLabel: string
  /** Label for the right pole. */
  rightLabel: string
  /** Normalised position along the track from 0 (left) to 1 (right). */
  position: number
  /** The currently assigned persona; its matching pole label is highlighted teal. */
  activePersona: string
}

/**
 * Horizontal axis slider showing a teal dot positioned along a track.
 * The active pole label is highlighted in teal.
 *
 * @param props - Axis display configuration.
 * @returns Axis slider element.
 */
export default function AxisSlider({
  axisLabel,
  leftLabel,
  rightLabel,
  position,
  activePersona,
}: AxisSliderProps) {
  const leftActive = activePersona === leftLabel
  const rightActive = activePersona === rightLabel

  return (
    <div style={{ marginBottom: '28px' }}>
      <p
        style={{
          fontSize: '11px',
          fontWeight: 600,
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
          color: '#475569',
          marginBottom: '12px',
        }}
      >
        {axisLabel}
      </p>
      <div style={{ position: 'relative', height: '16px', display: 'flex', alignItems: 'center' }}>
        <div
          style={{
            width: '100%',
            height: '1px',
            backgroundColor: 'rgba(255,255,255,0.15)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            left: `${position * 100}%`,
            transform: 'translateX(-50%)',
            width: '14px',
            height: '14px',
            borderRadius: '50%',
            backgroundColor: '#2dd4bf',
            boxShadow: '0 0 8px rgba(45, 212, 191, 0.5)',
          }}
        />
      </div>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          marginTop: '8px',
        }}
      >
        <span
          style={{
            fontSize: '12px',
            color: leftActive ? '#2dd4bf' : '#475569',
            fontWeight: leftActive ? 600 : 400,
          }}
        >
          {leftLabel}
        </span>
        <span
          style={{
            fontSize: '12px',
            color: rightActive ? '#2dd4bf' : '#475569',
            fontWeight: rightActive ? 600 : 400,
          }}
        >
          {rightLabel}
        </span>
      </div>
    </div>
  )
}
