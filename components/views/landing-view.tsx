"use client"

import { Clock, ListChecks, BarChart3 } from "lucide-react"
import { Button } from "@/components/ui/button"

interface LandingViewProps {
  onStart: () => void
}

export function LandingView({ onStart }: LandingViewProps) {
  return (
    <div className="min-h-screen flex items-center justify-center">
      {/* Soft radial gradient glow behind headline */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "radial-gradient(ellipse 60% 40% at 50% 45%, rgba(94, 170, 168, 0.1) 0%, transparent 70%)"
        }}
      />
      
      {/* Content */}
      <div className="relative z-10 w-full max-w-[640px] mx-auto px-6 py-16 text-center">
        {/* Badge */}
        <div className="inline-flex items-center mb-8">
          <span className="px-3 py-1 text-xs font-medium tracking-wide uppercase text-accent bg-accent/10 border border-accent/20 rounded-full">
            AI Safety Research
          </span>
        </div>

        {/* Headline */}
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-white mb-6 text-balance">
          Does AI understand your worldview?
        </h1>

        {/* Subheadline */}
        <p className="text-lg sm:text-xl text-[#a0a0a8] font-normal leading-relaxed mb-12 text-pretty">
          Answer a few questions about your values, rate a few AI responses, and discover how aligned you are with AI. Your ratings help us understand whether AI truly works for everyone.
        </p>

        {/* Feature bullets */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-6 sm:gap-10 mb-12">
          <FeatureBullet icon={<Clock className="w-5 h-5" />} text="~5 minutes" />
          <FeatureBullet icon={<ListChecks className="w-5 h-5" />} text="8 values questions + 6 AI responses" />
          <FeatureBullet icon={<BarChart3 className="w-5 h-5" />} text="See your results" />
        </div>

        {/* CTA Button */}
        <Button 
          size="lg" 
          onClick={onStart}
          className="px-10 py-6 text-base font-medium bg-accent text-accent-foreground hover:bg-accent/90 transition-all duration-200 shadow-lg shadow-accent/25"
        >
          Start
        </Button>

        {/* Privacy note */}
        <p className="mt-6 text-sm text-[#707078]">
          No account required. Your responses are anonymous.
        </p>
      </div>
    </div>
  )
}

function FeatureBullet({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <div className="flex items-center gap-2 text-[#a0a0a8]">
      <span className="text-accent">{icon}</span>
      <span className="text-sm font-medium">{text}</span>
    </div>
  )
}
