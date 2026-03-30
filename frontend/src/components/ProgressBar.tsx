interface ProgressBarProps {
  /** Number of steps completed (1-indexed). */
  current: number
  /** Total number of steps. */
  total: number
}

/**
 * Thin fixed progress bar at the very top of the viewport.
 *
 * @param props - Current step and total step count.
 * @returns Fixed-position progress bar element.
 */
export default function ProgressBar({ current, total }: ProgressBarProps) {
  const percentage = total > 0 ? (current / total) * 100 : 0

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '3px',
        backgroundColor: 'rgba(255,255,255,0.08)',
        zIndex: 50,
      }}
    >
      <div
        style={{
          height: '100%',
          width: `${percentage}%`,
          backgroundColor: '#2dd4bf',
          transition: 'width 0.3s ease',
        }}
      />
    </div>
  )
}
