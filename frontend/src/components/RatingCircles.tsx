interface RatingCirclesProps {
  /** Currently selected score from 1 to 5, or null if none selected. */
  selected: number | null
  /** Callback fired with the selected score value. */
  onChange: (value: number) => void
}

/**
 * Five large circular rating buttons numbered 1–5.
 * Selected button fills with teal, unselected show a subtle border.
 *
 * @param props - Selected value and change handler.
 * @returns Row of five circular rating buttons.
 */
export default function RatingCircles({ selected, onChange }: RatingCirclesProps) {
  return (
    <div
      style={{
        display: 'flex',
        gap: '12px',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      {[1, 2, 3, 4, 5].map((value) => {
        const isSelected = selected === value
        return (
          <button
            key={value}
            type="button"
            onClick={() => onChange(value)}
            style={{
              width: '52px',
              height: '52px',
              borderRadius: '50%',
              border: isSelected ? '2px solid #2dd4bf' : '2px solid rgba(255,255,255,0.2)',
              backgroundColor: isSelected ? '#2dd4bf' : 'transparent',
              color: isSelected ? '#080810' : '#94a3b8',
              fontSize: '16px',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.15s ease',
            }}
            aria-label={`Rate ${value}`}
            aria-pressed={isSelected}
          >
            {value}
          </button>
        )
      })}
    </div>
  )
}
