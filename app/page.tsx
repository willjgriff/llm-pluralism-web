"use client"

import { useState, useEffect } from "react"
import { NetworkCanvas } from "@/components/network-canvas"
import { LandingView } from "@/components/views/landing-view"
import { QuestionnaireView } from "@/components/views/questionnaire-view"
import { ProfileView } from "@/components/views/profile-view"
import { RateView } from "@/components/views/rate-view"
import { ResultsView } from "@/components/views/results-view"

type View = "landing" | "questionnaire" | "profile" | "rate" | "results"

export default function Home() {
  const [currentView, setCurrentView] = useState<View>("landing")
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [displayedView, setDisplayedView] = useState<View>("landing")

  const handleNavigate = (view: string) => {
    if (view === currentView) return
    
    // Start fade out
    setIsTransitioning(true)
    
    // After fade out, switch view and fade in
    setTimeout(() => {
      setCurrentView(view as View)
      setDisplayedView(view as View)
      // Scroll to top when changing views
      window.scrollTo(0, 0)
      
      // Start fade in
      setTimeout(() => {
        setIsTransitioning(false)
      }, 50)
    }, 200)
  }

  return (
    <main className="relative min-h-screen bg-[#080810]">
      {/* Persistent animated network canvas */}
      <NetworkCanvas />
      
      {/* View content with fade transition */}
      <div 
        style={{ 
          opacity: isTransitioning ? 0 : 1, 
          transition: "opacity 200ms ease-in-out" 
        }}
      >
        {displayedView === "landing" && <LandingView onNavigate={handleNavigate} />}
        {displayedView === "questionnaire" && <QuestionnaireView onNavigate={handleNavigate} />}
        {displayedView === "profile" && <ProfileView onNavigate={handleNavigate} />}
        {displayedView === "rate" && <RateView onNavigate={handleNavigate} />}
        {displayedView === "results" && <ResultsView onNavigate={handleNavigate} />}
      </div>
    </main>
  )
}
