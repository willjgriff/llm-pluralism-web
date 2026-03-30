import { BarChart, Bar, XAxis, YAxis, Cell, ResponsiveContainer, Tooltip } from 'recharts'
import Badge from '../components/Badge'
import AxisSlider from '../components/AxisSlider'
import NetworkBackground from '../components/NetworkBackground'
import type { PersonaAssignment, Positions, Rating, Response, Results } from '../types'

interface ResultsPageProps {
  results: Results
  responses: Response[]
  ratings: Rating[]
  personas: PersonaAssignment
  positions: Positions
  onReset: () => void
}

/**
 * Derive a human-readable verdict from a mean score.
 *
 * @param meanScore - Mean rating from 1 to 5.
 * @returns Short verdict phrase.
 */
function getVerdict(meanScore: number): string {
  if (meanScore < 2.5) return 'often unreasonable'
  if (meanScore <= 3.5) return 'moderately reasonable'
  return 'broadly reasonable'
}

/**
 * Find the rating with the highest or lowest score and return a truncated prompt.
 *
 * @param ratings - All submitted ratings.
 * @param responses - Responses pool to look up prompts.
 * @param mode - Whether to find highest or lowest rating.
 * @returns Truncated prompt string or em dash fallback.
 */
function findRatedPrompt(
  ratings: Rating[],
  responses: Response[],
  mode: 'highest' | 'lowest',
): string {
  if (ratings.length === 0) return '—'
  const sorted = [...ratings].sort((a, b) =>
    mode === 'highest' ? b.score - a.score : a.score - b.score,
  )
  const match = responses.find((response) => response.question_id === sorted[0].question_id)
  if (!match) return '—'
  return match.prompt.length > 60 ? `${match.prompt.slice(0, 57)}...` : match.prompt
}

/**
 * Results page showing persona profile, AI performance scores, cluster comparison, and share card.
 *
 * @param props - Results data and navigation callbacks.
 * @returns Results page content.
 */
export default function ResultsPage({
  results,
  responses,
  ratings,
  personas,
  positions,
  onReset,
}: ResultsPageProps) {
  const ownClusterKey = `${personas.economic} | ${personas.identity} | ${personas.technology}`
  const verdict = getVerdict(results.mean_score)
  const highestPrompt = findRatedPrompt(ratings, responses, 'highest')
  const lowestPrompt = findRatedPrompt(ratings, responses, 'lowest')

  const chartData = Object.entries(results.aggregate_by_persona).map(([name, score]) => ({
    name: name.replace(/ \| /g, ' · '),
    rawKey: name,
    score,
  }))

  const shareText = [
    'LLM Pluralism Evaluation',
    `${personas.economic} · ${personas.identity} · ${personas.technology}`,
    `Rated AI ${results.mean_score.toFixed(1)}/5 for reasonableness`,
    "People with my values rate AI lower than average. Does AI understand your worldview?",
    'llm-pluralism.vercel.app',
  ].join('\n')

  const handleCopy = () => {
    navigator.clipboard.writeText(shareText)
  }

  return (
    <>
      <NetworkBackground />
      <div
        style={{
          position: 'relative',
          zIndex: 1,
          minHeight: '100vh',
          padding: '48px 24px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <div
          style={{
            maxWidth: '640px',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            gap: '20px',
          }}
        >
          {/* Section 1 — Value Profile */}
          <section style={cardStyle}>
            <Badge label="Your Results" />
            <h2
              style={{
                fontSize: '26px',
                fontWeight: 700,
                color: '#ffffff',
                letterSpacing: '-0.02em',
                margin: '16px 0 24px',
              }}
            >
              Your value profile
            </h2>
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
          </section>

          {/* Section 2 — AI Performance */}
          <section style={cardStyle}>
            <h3 style={sectionHeadingStyle}>How AI performed for your worldview</h3>
            <div style={{ textAlign: 'center', margin: '20px 0' }}>
              <span
                style={{
                  fontSize: '52px',
                  fontWeight: 700,
                  color: '#2dd4bf',
                  letterSpacing: '-0.03em',
                }}
              >
                {results.mean_score.toFixed(1)}
              </span>
              <span style={{ fontSize: '24px', color: '#475569' }}> / 5</span>
              <p style={{ fontSize: '15px', color: '#94a3b8', marginTop: '8px' }}>
                You found AI responses <strong style={{ color: '#e2e8f0' }}>{verdict}</strong> from
                your perspective
              </p>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
              <StatCard label="Highest rated" value={highestPrompt} />
              <StatCard label="Lowest rated" value={lowestPrompt} />
              <StatCard label="Completed" value={`${ratings.length} of ${responses.length}`} />
            </div>
          </section>

          {/* Section 3 — Cluster Comparison */}
          <section style={cardStyle}>
            <h3 style={sectionHeadingStyle}>How your worldview compares to others</h3>
            {chartData.length > 0 ? (
              <>
                <div style={{ marginTop: '20px', width: '100%' }}>
                  <ResponsiveContainer width="100%" height={Math.max(180, chartData.length * 52)}>
                    <BarChart
                      data={chartData}
                      layout="vertical"
                      margin={{ top: 0, right: 40, bottom: 0, left: 8 }}
                    >
                      <XAxis
                        type="number"
                        domain={[0, 5]}
                        tick={{ fill: '#475569', fontSize: 11 }}
                        axisLine={{ stroke: 'rgba(255,255,255,0.08)' }}
                        tickLine={false}
                      />
                      <YAxis
                        type="category"
                        dataKey="name"
                        width={170}
                        tick={{ fill: '#94a3b8', fontSize: 11 }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <Tooltip
                        cursor={{ fill: 'rgba(255,255,255,0.03)' }}
                        contentStyle={{
                          backgroundColor: '#0d0d1a',
                          border: '1px solid rgba(255,255,255,0.08)',
                          borderRadius: '8px',
                          color: '#ffffff',
                          fontSize: '13px',
                        }}
                        formatter={(value: number) => [value.toFixed(2), 'Mean score']}
                      />
                      <Bar dataKey="score" radius={[0, 4, 4, 0]}>
                        {chartData.map((entry) => (
                          <Cell
                            key={entry.rawKey}
                            fill={entry.rawKey === ownClusterKey ? '#2dd4bf' : '#334155'}
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <p style={{ fontSize: '13px', color: '#475569', marginTop: '16px', lineHeight: 1.6 }}>
                  People with different values rate AI responses very differently. Conservative-leaning
                  personas consistently find AI less reasonable than progressive-leaning ones.
                </p>
              </>
            ) : (
              <p style={{ fontSize: '14px', color: '#475569', marginTop: '16px' }}>
                No comparison data yet — be one of the first to complete the evaluation.
              </p>
            )}
          </section>

          {/* Section 4 — Share */}
          <section style={cardStyle}>
            <h3 style={sectionHeadingStyle}>Share your results</h3>
            <div
              style={{
                backgroundColor: '#080810',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '10px',
                padding: '20px',
                margin: '16px 0',
              }}
            >
              <p style={{ fontSize: '12px', color: '#475569', margin: '0 0 8px' }}>
                LLM Pluralism Evaluation
              </p>
              <p
                style={{ fontSize: '15px', color: '#ffffff', fontWeight: 600, margin: '0 0 6px' }}
              >
                {personas.economic} · {personas.identity} · {personas.technology}
              </p>
              <p style={{ fontSize: '14px', color: '#94a3b8', margin: '0 0 8px' }}>
                Rated AI {results.mean_score.toFixed(1)}/5 for reasonableness
              </p>
              <p style={{ fontSize: '13px', color: '#475569', margin: '0 0 10px', lineHeight: 1.5 }}>
                People with my values rate AI lower than average. Does AI understand your worldview?
              </p>
              <p style={{ fontSize: '12px', color: '#2dd4bf', margin: 0 }}>
                llm-pluralism.vercel.app
              </p>
            </div>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={handleCopy}
                style={{
                  backgroundColor: 'transparent',
                  color: '#2dd4bf',
                  border: '1px solid #2dd4bf',
                  fontWeight: 600,
                  fontSize: '14px',
                  padding: '10px 24px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  letterSpacing: '0.01em',
                }}
              >
                Copy to clipboard
              </button>
              <button
                type="button"
                onClick={onReset}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#475569',
                  fontSize: '14px',
                  cursor: 'pointer',
                  textDecoration: 'underline',
                  padding: '10px 0',
                }}
              >
                Take the survey again
              </button>
            </div>
          </section>
        </div>
      </div>
    </>
  )
}

const cardStyle: React.CSSProperties = {
  backgroundColor: '#0d0d1a',
  border: '1px solid rgba(255,255,255,0.08)',
  borderRadius: '16px',
  padding: '28px',
}

const sectionHeadingStyle: React.CSSProperties = {
  fontSize: '20px',
  fontWeight: 600,
  color: '#ffffff',
  letterSpacing: '-0.01em',
  margin: 0,
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div
      style={{
        backgroundColor: 'rgba(255,255,255,0.04)',
        borderRadius: '8px',
        padding: '12px 14px',
      }}
    >
      <p style={{ fontSize: '11px', color: '#475569', margin: '0 0 6px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
        {label}
      </p>
      <p style={{ fontSize: '13px', color: '#e2e8f0', margin: 0, lineHeight: 1.4 }}>{value}</p>
    </div>
  )
}
