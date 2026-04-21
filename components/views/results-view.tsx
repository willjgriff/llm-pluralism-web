"use client"

import { useState } from "react"
import { ValueSliders } from "@/components/value-sliders"
import { BarChart, Bar, XAxis, YAxis, Cell, ResponsiveContainer, LabelList } from "recharts"
import { PersonaProfile, Results } from "@/lib/types"

const TEAL = "rgb(94, 170, 168)"
const TEAL_DARK = "rgb(55, 100, 98)"
const WHITE_90 = "rgba(255, 255, 255, 0.90)"
const WHITE_60 = "rgba(255, 255, 255, 0.6)"
const WHITE_55 = "rgba(255, 255, 255, 0.55)"
const WHITE_50 = "rgba(255, 255, 255, 0.5)"
const WHITE_45 = "rgba(255, 255, 255, 0.45)"
const WHITE_40 = "rgba(255, 255, 255, 0.4)"
const WHITE_20 = "rgba(255, 255, 255, 0.2)"
const WHITE_10 = "rgba(255, 255, 255, 0.1)"
const WHITE_05 = "rgba(255, 255, 255, 0.05)"
const WHITE_03 = "rgba(255, 255, 255, 0.03)"

interface ResultsViewProps {
  results: Results
  personaProfile: PersonaProfile
}

/** Prefix for bar row `id` so `LabelList` content still sees it after Recharts `filterProps` strips `payload` / `type`. */
const AGGREGATE_UNAVAILABLE_ID_PREFIX = "llm-pluralism-aggregate-unavailable"

/** Separator gap rows: `id` is allowlisted so bar-end labels can hide them (value is often string `"0"`). */
const CHART_GAP_ID_PREFIX = "llm-pluralism-chart-gap"

function resultsChartLabelContent(props: any) {
  const { x = 0, y = 0, width = 0, height = 0, value, id = "" } = props
  if (String(id).startsWith(CHART_GAP_ID_PREFIX)) return null
  const persona = props.payload?.persona ?? ""
  if (String(persona).startsWith("__sep_")) return null
  const label = String(id).startsWith(AGGREGATE_UNAVAILABLE_ID_PREFIX)
    ? "Not yet evaluated"
    : value
  if (label === undefined || label === null) return null
  return (
    <text
      x={Number(x) + Number(width) + 5}
      y={Number(y) + Number(height) / 2}
      fill={WHITE_60}
      fontSize={11}
      dominantBaseline="middle"
      textAnchor="start"
    >
      {label}
    </text>
  )
}

const getBarColor = (type: string) => ({
  user: TEAL,
  userPersona: TEAL_DARK,
  personaAvg: TEAL_DARK,
  unavailable: WHITE_05,
  separator: "transparent",
  overall: WHITE_20,
  other: WHITE_20,
}[type] ?? WHITE_20)

/**
 * Formats a mean score for share-card copy (up to two decimal places, no trailing zeros).
 *
 * Parameters:
 *   value: Raw mean score from aggregates or user averages.
 *
 * Returns:
 *   A compact string such as "3.2" or "2.24".
 */
function formatShareScore(value: number): string {
  return parseFloat(value.toFixed(2)).toString()
}

export function ResultsView({ results, personaProfile }: ResultsViewProps) {
  const [copied, setCopied] = useState(false)

  const userMeanScore = results.model_scores.length > 0
    ? Math.round((results.model_scores.reduce((sum, m) => sum + m.mean_score, 0) / results.model_scores.length) * 10) / 10
    : 0

  const personaAvgScore = results.aggregate_by_persona.find(
    p => p.persona === personaProfile.primaryPersona
  )?.mean_score ?? 0

  const overallAvgScore = results.aggregate_by_persona.length > 0
    ? Math.round((results.aggregate_by_persona.reduce((sum, p) => sum + p.mean_score, 0) / results.aggregate_by_persona.length) * 10) / 10
    : 0

  const isCentrist = personaProfile.primaryPersona === "Centrist"

  const sharePersonaLabel = [
    personaProfile.economic,
    personaProfile.identity,
    personaProfile.technology,
    personaProfile.society,
  ]
    .filter((p) => p !== "Neutral")
    .join(" · ")

  const shareAsLine = isCentrist
    ? "As a Centrist"
    : sharePersonaLabel.length > 0
      ? `As a ${sharePersonaLabel}`
      : `As a ${personaProfile.primaryPersona}`

  const shareHeadlineLine = isCentrist
    ? `${shareAsLine}, I rated AI responses ${userMeanScore}/5 for reasonableness`
    : `${shareAsLine}, I rated AI ${userMeanScore}/5 for reasonableness`

  const sharePersonaAvgDisplay = formatShareScore(personaAvgScore)
  const shareOverallAvgDisplay = formatShareScore(overallAvgScore)

  const shareComparisonLine = isCentrist
    ? `The average across all groups is ${shareOverallAvgDisplay}/5. Does AI understand your worldview?`
    : `The average ${personaProfile.primaryPersona} rates it ${sharePersonaAvgDisplay}/5. Does AI understand your worldview?`

  const shareClipboardText = `LLM PLURALISM EVALUATION
${shareHeadlineLine}
${shareComparisonLine}
https://makesafeai.org/`

  const PERSONA_ORDER: Record<string, number> = {
    "You": 0,
    "Libertarian": 1,
    "Collectivist": 2,
    "Nationalist": 3,
    "Globalist": 4,
    "Tech Optimist": 5,
    "Tech Sceptic": 6,
    "Religious": 7,
    "Secularist": 8,
    "Centrist": 9,
  }

  const PAIR_END_PERSONAS = new Set(["You", "Collectivist", "Globalist", "Tech Sceptic", "Secularist"])

  const centristInAggregate = results.aggregate_by_persona.some(p => p.persona === "Centrist")

  const unsortedRows = [
    { persona: "You", score: userMeanScore, type: "user" as const },
    ...results.aggregate_by_persona.map((p, i) => {
      const isUnavailable = p.mean_score === 0
      return {
        ...(isUnavailable ? { id: `${AGGREGATE_UNAVAILABLE_ID_PREFIX}-expanded-${i}` } : {}),
        persona: p.persona,
        score: p.mean_score,
        type: isUnavailable ? "unavailable" : p.persona === personaProfile.primaryPersona ? "userPersona" : "other",
      }
    }),
    ...(!centristInAggregate
      ? [{ id: `${AGGREGATE_UNAVAILABLE_ID_PREFIX}-centrist`, persona: "Centrist", score: 0, type: "unavailable" as const }]
      : []),
  ]

  const sortedRows = [...unsortedRows].sort(
    (a, b) => (PERSONA_ORDER[a.persona] ?? 10) - (PERSONA_ORDER[b.persona] ?? 10)
  )

  const chartData = sortedRows.reduce((acc: any[], entry, index) => {
    acc.push(entry)
    if (PAIR_END_PERSONAS.has(entry.persona) && index < sortedRows.length - 1) {
      acc.push({
        id: `${CHART_GAP_ID_PREFIX}-${acc.length}`,
        persona: `__sep_${index}`,
        score: 0,
        type: "separator",
      })
    }
    return acc
  }, [])

  const chartHeight = 440

  const handleCopyToClipboard = () => {
    navigator.clipboard.writeText(shareClipboardText)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="min-h-screen overflow-y-auto">
      <div className="relative z-10 w-full max-w-[640px] mx-auto px-4 sm:px-6 py-16">
        
        {/* Section 1 — Badge + intro */}
        <section className="mb-16">
          <div className="flex justify-center mb-8">
            <span 
              className="px-3 py-1 text-xs font-medium tracking-wider rounded-full"
              style={{ 
                backgroundColor: "rgba(94, 170, 168, 0.15)",
                color: TEAL
              }}
            >
              YOUR RESULTS
            </span>
          </div>

          <div className="text-center">
            <h2
              className="text-balance text-2xl font-bold tracking-tight sm:text-3xl mb-3 sm:mb-4"
              style={{ color: "rgba(255, 255, 255, 0.95)" }}
            >
              Thank you for contributing
            </h2>
            <p
              className="mx-auto max-w-lg text-base font-normal leading-relaxed"
              style={{ color: WHITE_55 }}
            >
              Frontier AI models are trained on human feedback, but not all perspectives are equally represented.
              Your ratings help us build a clearer picture of who AI is actually working for.
            </p>
          </div>
        </section>

        {/* Section 2 — Value profile */}
        <section className="mb-16">
          <h2 
            className="text-2xl font-bold text-center mb-3"
            style={{ color: "rgba(255, 255, 255, 0.95)" }}
          >
            Your primary value dimension is <span style={{ color: TEAL }}>{personaProfile.primaryPersona}</span>
          </h2>

          <p 
            className="text-center mb-10"
            style={{ color: WHITE_55 }}
          >
            Here&apos;s how your values map across all four dimensions
          </p>

          <ValueSliders personaProfile={personaProfile} />
        </section>

        {/* Section 3 — Ratings chart */}
        <section className="mb-16">
          <h2 
            className="text-2xl font-bold text-center mb-3"
            style={{ color: "rgba(255, 255, 255, 0.95)" }}
          >
            How your rating compares
          </h2>

          <p
            id="results-chart-subtitle"
            className="mx-auto mb-6 max-w-lg text-center text-base font-normal leading-relaxed sm:mb-8"
            style={{ color: WHITE_55 }}
            aria-describedby={
              !results.use_live_data ? "results-evaluator-data-footnote" : undefined
            }
          >
            {isCentrist
              ? `You rated AI ${userMeanScore}/5 on average. Your values are broadly centrist, we don't yet have enough participant data to compare you to a specific group${!results.use_live_data ? "*" : "."}`
              : `You rated AI ${userMeanScore}/5 on average. The average ${personaProfile.primaryPersona} rates AI ${personaAvgScore}/5, you are ${userMeanScore > personaAvgScore ? 'more' : 'less'} positive about AI than most people with your values${!results.use_live_data ? "*" : "."}`}
          </p>

          {/* Horizontal bar chart with animated height */}
          <div 
            className="w-full mb-4 overflow-hidden transition-all duration-500 ease-in-out"
            style={{ height: chartHeight }}
          >
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                layout="vertical"
                data={chartData}
                margin={{ top: 0, right: 40, left: 0, bottom: 0 }}
                barCategoryGap={8}
              >
                <XAxis 
                  type="number" 
                  domain={[0, 5]} 
                  hide 
                />
                <YAxis
                  type="category"
                  dataKey="persona"
                  axisLine={false}
                  tickLine={false}
                  width={110}
                  tick={(props: any) => {
                    const value = props.payload?.value ?? ""
                    if (String(value).startsWith("__sep_")) return <g />
                    return (
                      <text
                        x={props.x}
                        y={props.y}
                        textAnchor="end"
                        dominantBaseline="middle"
                        fill={WHITE_60}
                        fontSize={12}
                      >
                        {value}
                      </text>
                    )
                  }}
                />
                <Bar
                  dataKey="score"
                  radius={[0, 4, 4, 0]}
                  barSize={20}
                  minPointSize={0}
                  shape={(props: any) => {
                    if (String((props as any).persona ?? "").startsWith("__sep_")) return <g />
                    const { x, y, width, height, fill } = props as any
                    return <rect x={x} y={y} width={Math.max(0, width)} height={height} fill={fill} rx={4} ry={4} />
                  }}
                >
                  {chartData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={getBarColor(entry.type)} 
                    />
                  ))}
                  <LabelList 
                    dataKey="score" 
                    position="right" 
                    content={resultsChartLabelContent}
                  />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Legend */}
          <div className="mb-4 flex justify-center gap-6">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: TEAL }} />
              <span className="text-xs" style={{ color: WHITE_50 }}>You</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: TEAL_DARK }} />
              <span className="text-xs" style={{ color: WHITE_50 }}>Your value profile</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: WHITE_20 }} />
              <span className="text-xs" style={{ color: WHITE_50 }}>Other groups</span>
            </div>
          </div>

          {!results.use_live_data && (
            <p
              id="results-evaluator-data-footnote"
              className="mx-auto mb-4 max-w-lg text-center text-sm leading-snug"
              style={{ color: WHITE_40 }}
            >
              *Currently based on AI evaluator data, updates with real participant data once enough people complete the survey
            </p>
          )}
        </section>

        {/* About the research — before share */}
        <section className="mb-16">
          <h2
            className="text-2xl font-bold text-center mb-4"
            style={{ color: "rgba(255, 255, 255, 0.95)" }}
          >
            About the research
          </h2>
          <div
            className="mx-auto mb-8 max-w-lg space-y-4 text-center text-base font-normal leading-relaxed"
            style={{ color: WHITE_55 }}
          >
            <p>
              This survey is part of a project exploring pluralistic alignment in frontier AI models. Using a bridging score methodology inspired by Community Notes, we measure whether AI responses are acceptable across ideologically diverse groups, not just on average.
            </p>
            <p>
            So far, no model consistently produces responses that are rated reasonable across opposing value perspectives. All frontier models tested lean progressive, scoring lower from conservative and libertarian perspectives. We're collecting human ratings to test whether both patterns hold with real people.
            </p>
          </div>
          <div className="flex flex-col items-center gap-6">
            <a
              href="https://github.com/willjgriff/llm-pluralism"
              target="_blank"
              rel="noopener noreferrer"
              className="text-center text-base font-medium transition-opacity hover:opacity-80"
              style={{ color: TEAL }}
            >
              View Research →
            </a>
          </div>
        </section>

        {/* Section 4 — Share & Learn More */}
        <section>
          <h3 
            className="text-2xl font-semibold text-center mb-8"
            style={{ color: "rgba(255, 255, 255, 0.95)" }}
          >
            Share your results
          </h3>

          {/* Share card */}
          <div 
            className="rounded-xl p-5 mb-4"
            style={{ 
              backgroundColor: "rgba(45, 212, 191, 0.03)",
              border: "1px solid rgba(45, 212, 191, 0.2)"
            }}
          >
            <p 
              className="text-xs uppercase tracking-wider"
              style={{ color: WHITE_40 }}
            >
              LLM PLURALISM EVALUATION
            </p>
            <p 
              className="mt-3 text-sm font-medium leading-relaxed"
              style={{ color: WHITE_90 }}
            >
              {shareHeadlineLine}
            </p>
            <p 
              className="mt-2 text-sm leading-relaxed"
              style={{ color: WHITE_60 }}
            >
              {shareComparisonLine}
            </p>
            <p 
              className="mt-3 text-xs"
              style={{ color: WHITE_40 }}
            >
              https://makesafeai.org/
            </p>
          </div>

          {/* Copy button */}
          <div className="flex justify-center mb-8">
            <button
              onClick={handleCopyToClipboard}
              className="px-6 py-2.5 rounded-lg font-medium text-sm transition-all duration-200"
              style={{ 
                backgroundColor: "transparent",
                color: TEAL,
                border: `1px solid ${TEAL}`
              }}
            >
              {copied ? "Copied ✓" : "Copy to clipboard"}
            </button>
          </div>
        </section>
      </div>
    </div>
  )
}
