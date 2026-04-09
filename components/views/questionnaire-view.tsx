"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"


const questions = [
  "The state should redistribute wealth through taxation, even if this reduces incentives for individual effort.",
  "People who succeed should keep those rewards, equalising outcomes is not the government's role.",
  "A government's first obligation is to its own citizens, even when this means limiting help to people elsewhere.",
  "National boundaries should not be barriers to human flourishing. People, goods and ideas benefit from moving freely.",
  "AI is moving too fast and poses risks society isn't ready to manage, caution should come before capability.",
  "AI's potential to solve humanity's problems is enormous, the risks of moving too slowly outweigh moving too fast.",
  "Religious values and faith communities should help shape laws and public policy. Society loses something essential without them.",
  "Laws and policy should be based on evidence and reasoning any citizen can evaluate, faith should remain private.",
]

interface QuestionnaireViewProps {
  onComplete: (answers: number[]) => void
  error?: string | null
  onClearError?: () => void
}

export function QuestionnaireView({ onComplete, error, onClearError }: QuestionnaireViewProps) {
  const [answers, setAnswers] = useState<Record<number, number>>({})
  
  const answeredCount = Object.keys(answers).length
  const progress = (answeredCount / questions.length) * 100
  const allAnswered = answeredCount === questions.length

  const handleSelect = (questionIndex: number, value: number) => {
    setAnswers(prev => ({ ...prev, [questionIndex]: value }))
  }

  const handleContinue = () => {
    if (!allAnswered) return
    const orderedAnswers = questions.map((_, index) => answers[index])
    onComplete(orderedAnswers)
  }

  return (
    <div className="min-h-screen overflow-y-auto">
      {/* Progress bar */}
      <div className="fixed top-0 left-0 right-0 z-50 h-1 bg-[#1a1a24]">
        <div 
          className="h-full bg-accent transition-all duration-300 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>
      
      {/* Soft radial gradient glow */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "radial-gradient(ellipse 60% 40% at 50% 35%, rgba(94, 170, 168, 0.08) 0%, transparent 70%)"
        }}
      />
      
      {/* Content */}
      <div className="relative z-10 w-full max-w-[580px] mx-auto px-6 py-20">
        {/* Badge */}
        <div className="text-center mb-8">
          <span className="inline-flex px-3 py-1 text-xs font-medium tracking-wide uppercase text-accent bg-accent/10 border border-accent/20 rounded-full">
            Your Values
          </span>
        </div>

        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-white mb-4">
            Tell us about your perspective
          </h1>
          <p className="text-base text-[#a0a0a8] font-normal leading-relaxed">
            There are no right or wrong answers. We use your responses to personalise your experience.
          </p>
        </div>

        {/* Questions */}
        <div className="space-y-4">
          {questions.map((question, index) => (
            <QuestionCard
              key={index}
              question={question}
              questionIndex={index}
              selectedValue={answers[index]}
              onSelect={handleSelect}
            />
          ))}
        </div>

        {/* Continue button */}
        <div className="mt-10 text-center">
          <Button 
            size="lg"
            disabled={!allAnswered}
            onClick={handleContinue}
            className="px-10 py-6 text-base font-medium bg-accent text-accent-foreground hover:bg-accent/90 transition-all duration-200 shadow-lg shadow-accent/25 disabled:opacity-40 disabled:shadow-none disabled:cursor-not-allowed"
          >
            Continue
          </Button>
          {error && (
            <div className="mt-4 flex items-center justify-center gap-3">
              <p className="text-sm" style={{ color: "rgba(255, 100, 100, 0.9)" }}>
                {error}
              </p>
              {onClearError && (
                <button
                  onClick={onClearError}
                  className="text-sm underline"
                  style={{ color: "rgba(255, 100, 100, 0.7)" }}
                >
                  Dismiss
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

interface QuestionCardProps {
  question: string
  questionIndex: number
  selectedValue: number | undefined
  onSelect: (questionIndex: number, value: number) => void
}

function QuestionCard({ question, questionIndex, selectedValue, onSelect }: QuestionCardProps) {
  return (
    <div className="p-5 bg-[#0f0f18] border border-[#1a1a24] rounded-xl">
      <p className="text-[15px] text-white mb-5 leading-relaxed">
        {question}
      </p>
      
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-center gap-3 sm:gap-4">
          {[1, 2, 3, 4, 5].map((value) => (
            <button
              key={value}
              onClick={() => onSelect(questionIndex, value)}
              className={`
                w-6 h-6 rounded-full border-2 transition-all duration-200
                ${selectedValue === value 
                  ? "bg-accent border-accent shadow-[0_0_12px_rgba(94,170,168,0.5)]" 
                  : "border-[#3a3a48] hover:border-accent/50 hover:shadow-[0_0_8px_rgba(94,170,168,0.25)]"
                }
              `}
              aria-label={`Rate ${value} out of 5`}
            />
          ))}
        </div>
        
        <div className="flex justify-between">
          <span className="text-sm text-[#707078]">Strongly Disagree</span>
          <span className="text-sm text-[#707078]">Strongly Agree</span>
        </div>
      </div>
    </div>
  )
}
