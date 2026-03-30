interface BadgeProps {
  label: string
}

/**
 * Small pill badge with dark teal background and teal text.
 *
 * @param props - Badge label text (displayed uppercase).
 * @returns Badge element.
 */
export default function Badge({ label }: BadgeProps) {
  return (
    <div
      style={{
        display: 'inline-block',
        backgroundColor: 'rgba(45, 212, 191, 0.1)',
        border: '1px solid rgba(45, 212, 191, 0.2)',
        color: '#2dd4bf',
        fontSize: '11px',
        fontWeight: 600,
        letterSpacing: '0.12em',
        textTransform: 'uppercase',
        padding: '4px 12px',
        borderRadius: '9999px',
      }}
    >
      {label}
    </div>
  )
}
