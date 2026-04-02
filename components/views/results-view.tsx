"use client"

import { useState } from "react"
import { ValueSliders } from "@/components/value-sliders"
import { BarChart, Bar, XAxis, YAxis, Cell, ResponsiveContainer, LabelList } from "recharts"
import { PersonaProfile, Results } from "@/lib/types"

interface ResultsViewProps {
  results: Results
  personaProfile: PersonaProfile
  onReset: () => void
}

const MODEL_LABS: Record<string, string> = {
  "openrouter:anthropic/claude-3.5-haiku": "by Anthropic",
  "openai:gpt-4.1-mini": "by OpenAI",
  "openrouter:x-ai/grok-4-fast": "by xAI",
}

const getBarColor = (type: string) => {
  switch (type) {
    case "user": return "rgb(94, 170, 168)" // teal
    case "userPersona": 
    case "personaAvg": return "rgb(55, 100, 98)" // dark teal
    case "overall":
    case "other": return "rgba(255, 255, 255, 0.2)" // dark grey
    default: return "rgba(255, 255, 255, 0.2)"
  }
}

export function ResultsView({ results, personaProfile, onReset }: ResultsViewProps) {
  const [copied, setCopied] = useState(false)
  const [chartExpanded, setChartExpanded] = useState(false)

  const userMeanScore = results.model_scores.length > 0
    ? Math.round((results.model_scores.reduce((sum, m) => sum + m.mean_score, 0) / results.model_scores.length) * 10) / 10
    : 0

  const personaAvgScore = results.aggregate_by_persona.find(
    p => p.persona === personaProfile.primaryPersona
  )?.mean_score ?? 0

  const overallAvgScore = results.aggregate_by_persona.length > 0
    ? Math.round((results.aggregate_by_persona.reduce((sum, p) => sum + p.mean_score, 0) / results.aggregate_by_persona.length) * 10) / 10
    : 0

  const collapsedChartData = [
    { persona: "You", score: userMeanScore, type: "user" },
    { persona: `${personaProfile.primaryPersona} avg`, score: personaAvgScore, type: "personaAvg" },
    { persona: "Overall avg", score: overallAvgScore, type: "overall" },
  ]

  const expandedChartData = [
    { persona: "You", score: userMeanScore, type: "user" },
    ...results.aggregate_by_persona.map(p => ({
      persona: p.persona,
      score: p.mean_score,
      type: p.persona === personaProfile.primaryPersona ? "userPersona" : "other",
    })),
  ]
  
  const chartData = chartExpanded ? expandedChartData : collapsedChartData
  const chartHeight = chartExpanded ? 360 : 140

  const handleCopyToClipboard = () => {
    const shareText = `LLM PLURALISM EVALUATION
Libertarian · Globalist · Tech Sceptic · Secularist
My AI match: Claude 3.5 Haiku
Rated AI responses 3.4/5 for reasonableness
Find out which AI model actually understands your worldview:
llm-pluralism.vercel.app`
    
    navigator.clipboard.writeText(shareText)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleStartOver = () => {
    onReset()
  }

  return (
    <div className="min-h-screen overflow-y-auto">
      <div className="relative z-10 w-full max-w-[640px] mx-auto px-4 sm:px-6 py-16">
        
        {/* Section 1 — Your AI Match */}
        <section className="mb-16">
          {/* Badge */}
          <div className="flex justify-center mb-6">
            <span 
              className="px-3 py-1 text-xs font-medium tracking-wider rounded-full"
              style={{ 
                backgroundColor: "rgba(94, 170, 168, 0.15)",
                color: "rgb(94, 170, 168)"
              }}
            >
              YOUR RESULTS
            </span>
          </div>

          <h2 
            className="text-3xl font-bold text-center mb-8"
            style={{ color: "rgba(255, 255, 255, 0.95)" }}
          >
            Your AI model match
          </h2>

          {/* Featured best match card */}
          <div 
            className="rounded-xl p-6 mb-4"
            style={{ 
              backgroundColor: "rgba(255, 255, 255, 0.03)",
              border: "1px solid rgba(45, 212, 191, 0.3)"
            }}
          >
            <p 
              className="text-xs uppercase tracking-wider mb-2"
              style={{ color: "rgba(255, 255, 255, 0.4)" }}
            >
              BEST MATCH
            </p>
            <p 
              className="text-3xl font-bold"
              style={{ color: "rgba(255, 255, 255, 0.95)" }}
            >
              {results.best_match.model_display_name}
            </p>
            <p 
              className="text-sm mt-1"
              style={{ color: "rgba(255, 255, 255, 0.5)" }}
            >
              {MODEL_LABS[results.best_match.model] ?? ""}
            </p>
            <p 
              className="text-sm mt-3"
              style={{ color: "rgba(255, 255, 255, 0.6)" }}
            >
              {results.best_match.model_display_name} produced the responses you rated most reasonable across your session.
            </p>
          </div>

          {/* Label above model cards */}
          <p 
            className="text-xs uppercase tracking-wider text-center mb-4"
            style={{ color: "rgba(255, 255, 255, 0.4)" }}
          >
            Models you rated
          </p>

          {/* Three model score cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
            {results.model_scores.map((model) => (
              <div 
                key={model.model}
                className="rounded-xl p-4"
                style={{ 
                  backgroundColor: "rgba(255, 255, 255, 0.03)",
                  border: model.model === results.best_match.model
                    ? "1px solid rgba(45, 212, 191, 0.3)" 
                    : "1px solid rgba(255, 255, 255, 0.1)"
                }}
              >
                <p 
                  className="text-sm font-medium mb-2"
                  style={{ color: "rgba(255, 255, 255, 0.9)" }}
                >
                  {model.model_display_name}
                </p>
                <div className="flex items-baseline gap-1 mb-2">
                  <span 
                    className="text-2xl font-bold"
                    style={{ color: "rgb(94, 170, 168)" }}
                  >
                    {model.mean_score}
                  </span>
                  <span 
                    className="text-xs"
                    style={{ color: "rgba(255, 255, 255, 0.4)" }}
                  >
                    / 5 avg
                  </span>
                </div>
                {/* Score bar */}
                <div 
                  className="h-1 w-full rounded-full"
                  style={{ backgroundColor: "rgba(255, 255, 255, 0.1)" }}
                >
                  <div 
                    className="h-full rounded-full"
                    style={{ 
                      width: `${(model.mean_score / 5) * 100}%`,
                      backgroundColor: "rgb(94, 170, 168)"
                    }}
                  />
                </div>
              </div>
            ))}
          </div>

          <p 
            className="text-center text-sm mx-auto"
            style={{ color: "rgba(255, 255, 255, 0.4)", maxWidth: "560px" }}
          >
            These are not the latest versions from each organisation, but research suggests value alignment patterns are consistent across model generations — your match is likely to reflect your experience with newer versions too.
          </p>
        </section>

        {/* Section 2 — Value Profile */}
        <section className="mb-16">
          <h2 
            className="text-2xl font-bold text-center mb-3"
            style={{ color: "rgba(255, 255, 255, 0.95)" }}
          >
            Your primary value dimension is <span style={{ color: "rgb(94, 170, 168)" }}>{personaProfile.primaryPersona}</span>
          </h2>

          <p 
            className="text-center mb-10"
            style={{ color: "rgba(255, 255, 255, 0.55)" }}
          >
            Here&apos;s how your values map across all four dimensions
          </p>

          <ValueSliders personaProfile={personaProfile} />
        </section>

        {/* Section 3 — How Your Worldview Compares */}
        <section className="mb-16">
          <h3 
            className="text-2xl font-semibold text-center mb-8"
            style={{ color: "rgba(255, 255, 255, 0.95)" }}
          >
            How your score compares
          </h3>

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
                  tick={{ 
                    fill: "rgba(255, 255, 255, 0.6)", 
                    fontSize: 12 
                  }}
                  width={110}
                />
                <Bar 
                  dataKey="score" 
                  radius={[0, 4, 4, 0]}
                  barSize={20}
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
                    style={{ 
                      fill: "rgba(255, 255, 255, 0.6)", 
                      fontSize: 11 
                    }}
                  />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Legend - only in expanded state */}
          {chartExpanded && (
            <div className="flex justify-center gap-6 mb-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: "rgb(94, 170, 168)" }} />
                <span className="text-xs" style={{ color: "rgba(255, 255, 255, 0.5)" }}>You</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: "rgb(55, 100, 98)" }} />
                <span className="text-xs" style={{ color: "rgba(255, 255, 255, 0.5)" }}>Your persona</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: "rgba(255, 255, 255, 0.2)" }} />
                <span className="text-xs" style={{ color: "rgba(255, 255, 255, 0.5)" }}>Other groups</span>
              </div>
            </div>
          )}

          {/* Expand/collapse button */}
          <div className="flex justify-center mb-6">
            <button
              onClick={() => setChartExpanded(!chartExpanded)}
              className="px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200"
              style={{ 
                backgroundColor: "transparent",
                color: "rgb(94, 170, 168)",
                border: "1px solid rgb(94, 170, 168)"
              }}
            >
              {chartExpanded ? "Show less ▲" : "See how all groups compare ▼"}
            </button>
          </div>

          {/* Dynamic callout text */}
          <p 
            className="text-sm mb-2"
            style={{ color: "rgba(255, 255, 255, 0.6)" }}
          >
            {chartExpanded 
              ? "Globalists rate AI highest, Religious personas lowest. People with different values rate AI responses very differently — a pattern consistent across our full evaluation dataset."
              : `You rated AI ${userMeanScore}/5 on average. The average ${personaProfile.primaryPersona} rates AI ${personaAvgScore}/5 — you are ${userMeanScore > personaAvgScore ? 'more' : 'less'} positive about AI than most people with your values.`
            }
          </p>
          <p 
            className="text-sm"
            style={{ color: "rgba(255, 255, 255, 0.4)" }}
          >
            {results.use_live_data
              ? "Chart shows live data from real participants."
              : "Chart shows illustrative data based on our evaluation dataset. Live participant data will appear as more people complete the survey."
            }
          </p>
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
              style={{ color: "rgba(255, 255, 255, 0.4)" }}
            >
              LLM PLURALISM EVALUATION
            </p>
            <p 
              className="text-sm font-medium mt-1"
              style={{ color: "rgba(255, 255, 255, 0.9)" }}
            >
              {[personaProfile.economic, personaProfile.identity, personaProfile.technology, personaProfile.society]
                .filter(p => p !== 'Neutral')
                .join(' · ')}
            </p>
            <p 
              className="text-base font-semibold mt-2"
              style={{ color: "rgba(255, 255, 255, 0.95)" }}
            >
              My AI match: {results.best_match.model_display_name}
            </p>
            <p 
              className="text-sm"
              style={{ color: "rgba(255, 255, 255, 0.6)" }}
            >
              Rated AI responses {userMeanScore}/5 for reasonableness
            </p>
            <p 
              className="text-sm mt-2"
              style={{ color: "rgba(255, 255, 255, 0.9)" }}
            >
              Find out which AI model actually understands your worldview:
            </p>
            <p 
              className="text-xs mt-1"
              style={{ color: "rgba(255, 255, 255, 0.4)" }}
            >
              llm-pluralism.vercel.app
            </p>
          </div>

          {/* Copy button */}
          <div className="flex justify-center mb-8">
            <button
              onClick={handleCopyToClipboard}
              className="px-6 py-2.5 rounded-lg font-medium text-sm transition-all duration-200"
              style={{ 
                backgroundColor: "transparent",
                color: "rgb(94, 170, 168)",
                border: "1px solid rgb(94, 170, 168)"
              }}
            >
              {copied ? "Copied ✓" : "Copy to clipboard"}
            </button>
          </div>

          {/* Divider */}
          <div 
            className="w-full h-px mb-8"
            style={{ backgroundColor: "rgba(255, 255, 255, 0.1)" }}
          />

          {/* Research credit */}
          <p 
            className="text-sm text-center mb-3"
            style={{ color: "rgba(255, 255, 255, 0.6)" }}
          >
            Curious about the methodology? This is part of an ongoing AI safety research project exploring pluralistic alignment in frontier LLMs.
          </p>
          
          <div className="flex justify-center mb-6">
            <a 
              href="https://github.com/willjgriff/llm-pluralism" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-sm font-medium transition-opacity hover:opacity-80"
              style={{ color: "rgb(94, 170, 168)" }}
            >
              View Research on GitHub →
            </a>
          </div>

          <div className="flex justify-center">
            <button
              onClick={handleStartOver}
              className="text-sm transition-opacity hover:opacity-80"
              style={{ color: "rgba(255, 255, 255, 0.4)" }}
            >
              Take the survey again
            </button>
          </div>
        </section>
      </div>
    </div>
  )
}
