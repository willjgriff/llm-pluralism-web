"use client"

import { ValueSliders } from "@/components/value-sliders"
import { PersonaProfile } from "@/lib/types"

interface ProfileViewProps {
  personaProfile: PersonaProfile
  onStartRating: () => void
}

export function ProfileView({ personaProfile, onStartRating }: ProfileViewProps) {
  return (
    <div className="min-h-screen flex items-center justify-center">
      {/* Content */}
      <div className="relative z-10 w-full max-w-[580px] mx-auto px-6 py-16">
        {/* Badge */}
        <div className="flex justify-center mb-6">
          <span 
            className="px-3 py-1 text-xs font-medium tracking-wider rounded-full"
            style={{ 
              backgroundColor: "rgba(94, 170, 168, 0.15)",
              color: "rgb(94, 170, 168)"
            }}
          >
            YOUR PROFILE
          </span>
        </div>

        {/* Heading */}
        <h1 
          className="text-3xl sm:text-4xl font-bold text-center mb-3 text-balance"
          style={{ color: "rgba(255, 255, 255, 0.95)" }}
        >
          Your primary value dimension is <span style={{ color: "rgb(94, 170, 168)" }}>{personaProfile.primaryPersona}</span>
        </h1>

        {/* Subheading */}
        <p 
          className="text-center text-secondary-foreground mb-12"
          style={{ color: "rgba(255, 255, 255, 0.55)" }}
        >
          Here&apos;s how your values map across all four dimensions
        </p>

        {/* Value sliders component */}
        <div className="mb-12">
          <ValueSliders personaProfile={personaProfile} />
        </div>

        {/* CTA Button */}
        <div className="flex justify-center">
          <button
            onClick={onStartRating}
            className="px-8 py-3 rounded-lg font-medium text-base transition-all duration-200 hover:opacity-90"
            style={{ 
              backgroundColor: "rgb(94, 170, 168)",
              color: "#080810",
              boxShadow: "0 0 20px rgba(94, 170, 168, 0.3)"
            }}
          >
            Start Rating
          </button>
        </div>
      </div>
    </div>
  )
}
