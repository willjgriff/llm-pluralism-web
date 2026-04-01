"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"

interface RateViewProps {
  onNavigate: (view: string) => void
}

const allResponses = [
  {
    id: 1,
    question: "Should wealthy individuals be taxed significantly more to fund public services?",
    aiResponse: "Yes, taxing wealthy individuals significantly more to fund public services can be justified because they have a greater capacity to contribute without compromising their basic needs. Higher taxes on the wealthy can help reduce income inequality and provide essential resources for education, healthcare, and infrastructure that benefit society as a whole. However, the tax system should be designed carefully to avoid discouraging investment and economic growth while ensuring fairness and efficiency in revenue collection."
  },
  {
    id: 2,
    question: "Is immigration generally good or bad for a country's economy?",
    aiResponse: "Immigration is generally beneficial for a country's economy when managed effectively. Immigrants contribute to economic growth by filling labour shortages, starting businesses, and paying taxes. They often take on roles that native workers are unwilling to fill and bring diverse skills and perspectives that drive innovation. However, the economic impact depends on factors like the skill level of immigrants, integration policies, and the capacity of public services to accommodate population growth."
  },
  {
    id: 3,
    question: "Should governments prioritise economic growth over environmental protection?",
    aiResponse: "Governments should not prioritise economic growth over environmental protection, as the two are increasingly interdependent. Short-term economic gains that come at the expense of environmental degradation often lead to long-term economic costs through climate damage, resource depletion, and health impacts. A sustainable approach integrates environmental considerations into economic planning, recognising that a healthy environment underpins long-term prosperity."
  },
  {
    id: 4,
    question: "Is it acceptable to restrict free speech to prevent hate speech?",
    aiResponse: "Restricting hate speech can be acceptable when it directly incites violence or discrimination against protected groups. Free speech is a fundamental right, but it is not absolute—most democracies recognise limits when speech causes clear harm to others. The challenge lies in defining hate speech precisely and ensuring restrictions are not misused to silence legitimate dissent. A balanced approach protects vulnerable groups while preserving open democratic debate."
  },
  {
    id: 5,
    question: "Should there be limits on the development of artificial intelligence?",
    aiResponse: "There should be thoughtful limits on AI development to ensure safety and alignment with human values. Unrestricted AI advancement poses risks including job displacement, privacy violations, autonomous weapons, and potentially existential threats from superintelligent systems. However, overly restrictive regulations could stifle beneficial innovation in healthcare, science, and productivity. The goal should be adaptive governance that manages risks while enabling AI's positive potential."
  },
  {
    id: 6,
    question: "Is universal basic income a good policy idea?",
    aiResponse: "Universal basic income has both merits and challenges as a policy idea. It could provide economic security, reduce poverty, and give people freedom to pursue education or entrepreneurship without fear of destitution. However, concerns include the high fiscal cost, potential inflation, and whether it might reduce work incentives. Pilot programmes have shown mixed results, suggesting UBI may work well in some contexts but require careful design and funding mechanisms."
  },
  {
    id: 7,
    question: "Should genetic engineering of human embryos be permitted?",
    aiResponse: "Genetic engineering of human embryos raises profound ethical questions that warrant cautious regulation. Therapeutic applications to prevent serious genetic diseases could reduce suffering and should be considered. However, enhancement applications to select for traits like intelligence or appearance risk creating new forms of inequality and discrimination. Most ethicists support a distinction between therapeutic and enhancement uses, with strict oversight and international coordination."
  },
  {
    id: 8,
    question: "Should voting be mandatory for all eligible citizens?",
    aiResponse: "Mandatory voting has both advantages and drawbacks worth considering. It can increase civic participation, ensure more representative outcomes, and reduce the influence of money in mobilising voters. However, it may also lead to uninformed voting, raises questions about personal freedom, and could be seen as coercive. Countries like Australia have implemented it successfully, but the approach may not suit all democratic traditions."
  },
  {
    id: 9,
    question: "Is capitalism the best economic system?",
    aiResponse: "Capitalism has proven effective at generating wealth and innovation, but whether it is the 'best' system depends on how we define success. It excels at allocating resources efficiently through market mechanisms and incentivising entrepreneurship. However, it can also produce significant inequality, environmental degradation, and prioritise short-term profits over long-term wellbeing. Most successful modern economies blend capitalist markets with social safety nets and regulation."
  },
  {
    id: 10,
    question: "Should countries accept more refugees?",
    aiResponse: "Countries have both humanitarian obligations and practical considerations regarding refugee acceptance. International law establishes a duty to protect those fleeing persecution, and refugees often contribute positively to host economies over time. However, rapid large-scale arrivals can strain public services and social cohesion if not managed well. A balanced approach involves fair burden-sharing between nations, adequate integration support, and addressing root causes of displacement."
  },
  {
    id: 11,
    question: "Should social media companies be held responsible for content posted by users?",
    aiResponse: "Social media companies should bear some responsibility for content on their platforms, though the extent is debatable. They profit from user engagement and have the technical capability to moderate harmful content. However, making them fully liable could lead to over-censorship and stifle free expression. A reasonable middle ground involves requiring good-faith efforts to remove clearly illegal content while providing transparency about moderation decisions and appeals processes."
  },
  {
    id: 12,
    question: "Is it ethical to eat meat?",
    aiResponse: "The ethics of meat consumption involves complex considerations about animal welfare, environmental impact, and cultural traditions. Factory farming raises serious concerns about animal suffering that many find morally problematic. However, sustainable animal husbandry has existed for millennia and can be part of healthy ecosystems. Personal choice, reducing consumption, and supporting humane practices offer a pragmatic path forward while respecting diverse ethical frameworks."
  },
  {
    id: 13,
    question: "Should wealthy nations pay reparations for historical colonialism?",
    aiResponse: "The question of colonial reparations involves acknowledging historical injustices while navigating practical complexities. Colonialism caused immense suffering and extracted wealth that continues to shape global inequality. However, determining appropriate forms of redress across generations raises difficult questions about responsibility and implementation. Development aid, debt forgiveness, and returning cultural artifacts represent some ways nations have begun addressing this legacy."
  },
  {
    id: 14,
    question: "Is privacy more important than security?",
    aiResponse: "Privacy and security are both fundamental values that exist in tension rather than opposition. Strong privacy protections safeguard individual autonomy and prevent government overreach, while security measures protect citizens from genuine threats. The appropriate balance depends on context—mass surveillance is rarely justified, but targeted monitoring with judicial oversight may be necessary. Democratic societies must continually negotiate this balance through transparent debate."
  },
  {
    id: 15,
    question: "Should performance-enhancing drugs be allowed in professional sports?",
    aiResponse: "Allowing performance-enhancing drugs in sports would fundamentally change the nature of athletic competition. Current prohibitions aim to preserve fair competition and protect athlete health. However, the line between legal supplements and banned substances is somewhat arbitrary, and enforcement creates an uneven playing field. Some argue for regulated use to level competition, while others believe sports should celebrate natural human achievement."
  },
  {
    id: 16,
    question: "Is nationalism a positive or negative force in the world?",
    aiResponse: "Nationalism has both constructive and destructive potential depending on how it manifests. Civic nationalism can foster social cohesion, democratic participation, and collective action for common goods. However, ethnic nationalism and extreme forms have fueled conflicts, xenophobia, and human rights abuses. The challenge is cultivating healthy national identity that provides belonging without demonising outsiders or undermining international cooperation."
  },
  {
    id: 17,
    question: "Should parents be allowed to choose their children's genetic traits?",
    aiResponse: "Genetic selection of children's traits raises profound ethical questions about human enhancement and equality. Preventing serious genetic diseases seems clearly beneficial, but selecting for intelligence, appearance, or other traits risks commodifying children and deepening social inequalities. Most bioethicists support limiting genetic selection to medical applications while prohibiting enhancement, though the boundary between treatment and enhancement is not always clear."
  },
  {
    id: 18,
    question: "Is democracy the best form of government?",
    aiResponse: "Democracy has proven remarkably successful at protecting individual rights, enabling peaceful transitions of power, and fostering human flourishing. However, it faces challenges including short-term thinking, vulnerability to populism, and difficulty addressing complex technical issues. While no system is perfect, democracy's self-correcting mechanisms and respect for human dignity make it preferable to alternatives, though democratic institutions require constant renewal and adaptation."
  },
  {
    id: 19,
    question: "Should we colonise other planets?",
    aiResponse: "Space colonisation presents both exciting possibilities and serious ethical considerations. Becoming a multi-planetary species could ensure humanity's long-term survival and drive technological innovation. However, the enormous resources required might be better spent addressing Earth's problems, and we risk repeating historical patterns of exploitation. A thoughtful approach would pursue space exploration while ensuring benefits are shared broadly and planetary protection protocols are followed."
  },
  {
    id: 20,
    question: "Is economic inequality inherently bad?",
    aiResponse: "Some degree of economic inequality may be an inevitable or even useful feature of market economies, providing incentives for innovation and effort. However, extreme inequality undermines social mobility, democratic participation, and even economic growth itself. The key questions are whether inequality results from fair processes, whether everyone has genuine opportunities, and whether basic needs are met. Most evidence suggests current levels of inequality in many countries exceed what is socially optimal."
  }
]

export function RateView({ onNavigate }: RateViewProps) {
  const [seenResponseIds, setSeenResponseIds] = useState<number[]>([])
  const [responseHistory, setResponseHistory] = useState<number[]>([])
  const [historyIndex, setHistoryIndex] = useState(-1)
  const [ratings, setRatings] = useState<Record<number, number>>({})
  const [feedback, setFeedback] = useState("")
  const [isInitialized, setIsInitialized] = useState(false)
  
  // Initialize first response on client only to avoid hydration mismatch
  useEffect(() => {
    if (!isInitialized) {
      const randomIndex = Math.floor(Math.random() * allResponses.length)
      const firstResponse = allResponses[randomIndex]
      setSeenResponseIds([firstResponse.id])
      setResponseHistory([firstResponse.id])
      setHistoryIndex(0)
      setIsInitialized(true)
    }
  }, [isInitialized])
  
  // Get current response from history
  const currentResponse = historyIndex >= 0 && historyIndex < responseHistory.length
    ? allResponses.find(r => r.id === responseHistory[historyIndex]) ?? null
    : null
  
  const totalRated = Object.keys(ratings).length
  const selectedRating = currentResponse ? ratings[currentResponse.id] ?? null : null
  const canSeeResults = totalRated >= 6
  const hasMoreResponses = allResponses.filter(r => !seenResponseIds.includes(r.id)).length > 0 || historyIndex < responseHistory.length - 1
  
  // Show "x responses rated" only when viewing the 7th response or later (historyIndex >= 6)
  const showExtraResponsesUI = historyIndex >= 6
  
  // Progress bar is based on first 6 responses only
  const progressPercent = Math.min((totalRated / 6) * 100, 100)
  const currentDisplayNumber = Math.min(historyIndex + 1, 6)

  const handleSelectRating = (rating: number) => {
    if (!currentResponse) return
    setRatings(prev => ({ ...prev, [currentResponse.id]: rating }))
  }

  const handlePreviousResponse = () => {
    if (historyIndex > 0) {
      setHistoryIndex(prev => prev - 1)
      setFeedback("")
    }
  }

  const handleNextResponse = () => {
    if (!currentResponse) return
    
    // If we're not at the end of history, just move forward in history
    if (historyIndex < responseHistory.length - 1) {
      setHistoryIndex(prev => prev + 1)
      setFeedback("")
      return
    }
    
    // Otherwise, pick a new random unseen response
    const unseenResponses = allResponses.filter(r => !seenResponseIds.includes(r.id))
    if (unseenResponses.length === 0) {
      // No more responses available
      onNavigate("results")
      return
    }
    
    const randomIndex = Math.floor(Math.random() * unseenResponses.length)
    const nextResponse = unseenResponses[randomIndex]
    
    setSeenResponseIds(prev => [...prev, nextResponse.id])
    setResponseHistory(prev => [...prev, nextResponse.id])
    setHistoryIndex(prev => prev + 1)
    setFeedback("")
  }

  const handleSeeResults = () => {
    onNavigate("results")
  }

  // Show loading state until initialized
  if (!isInitialized || !currentResponse) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">{!isInitialized ? "Loading..." : "No more responses available."}</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen overflow-y-auto">
      {/* Progress indicator at top */}
      <div className="fixed top-0 left-0 right-0 z-20" style={{ backgroundColor: "#080810" }}>
        <div className="flex items-center justify-center h-10">
          <span className="text-xs text-muted-foreground tracking-wide">
            {showExtraResponsesUI 
              ? `${totalRated} response${totalRated !== 1 ? 's' : ''} rated`
              : `Response ${currentDisplayNumber} of 6`
            }
          </span>
        </div>
        <div className="w-full h-0.5 bg-secondary">
          <div 
            className="h-full transition-all duration-300"
            style={{ 
              width: `${progressPercent}%`,
              backgroundColor: "rgb(94, 170, 168)"
            }}
          />
        </div>
      </div>
      
      {/* Content */}
      <div className="relative z-10 min-h-screen flex items-center justify-center px-6 py-24">
        <div className="w-full max-w-[640px]">
          
          {/* Back button */}
          {historyIndex > 0 && (
            <div className="mb-4">
              <button
                onClick={handlePreviousResponse}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center"
              >
                ← Previous response
              </button>
            </div>
          )}
          
          {/* Badge */}
          <div className="flex justify-center mb-8">
            <span 
              className="px-3 py-1 text-xs font-medium tracking-wider rounded-full"
              style={{ 
                backgroundColor: "rgba(94, 170, 168, 0.15)",
                color: "rgb(94, 170, 168)"
              }}
            >
              RATE THIS RESPONSE
            </span>
          </div>
          
          {/* Question card */}
          <div 
            className="rounded-lg p-5 mb-4"
            style={{ backgroundColor: "rgba(255, 255, 255, 0.06)" }}
          >
            <span className="text-xs text-muted-foreground tracking-wide uppercase mb-2 block">
              The question:
            </span>
            <p className="text-foreground text-lg font-medium leading-relaxed">
              {currentResponse.question}
            </p>
          </div>
          
          {/* AI Response card */}
          <div 
            className="rounded-lg p-5 mb-8 relative"
            style={{ 
              backgroundColor: "rgba(255, 255, 255, 0.03)",
              borderLeft: "2px solid rgba(94, 170, 168, 0.4)"
            }}
          >
            <span 
              className="text-xs tracking-wide uppercase mb-3 block"
              style={{ color: "rgba(94, 170, 168, 0.7)" }}
            >
              AI Response
            </span>
            <p className="text-foreground/90 leading-relaxed">
              {currentResponse.aiResponse}
            </p>
          </div>
          
          {/* Rating section */}
          <div className="text-center mb-6">
            <p className="text-muted-foreground text-sm mb-6">
              How reasonable is this response from your perspective?
            </p>
            
            {/* 1-5 rating circles */}
            <div className="flex justify-center gap-4 mb-3">
              {[1, 2, 3, 4, 5].map((rating) => (
                <button
                  key={rating}
                  onClick={() => handleSelectRating(rating)}
                  className="w-12 h-12 rounded-full border-2 flex items-center justify-center text-lg font-medium transition-all duration-200"
                  style={{
                    borderColor: selectedRating === rating 
                      ? "rgb(94, 170, 168)" 
                      : "rgba(255, 255, 255, 0.2)",
                    backgroundColor: selectedRating === rating 
                      ? "rgb(94, 170, 168)" 
                      : "transparent",
                    color: selectedRating === rating 
                      ? "#080810" 
                      : "rgba(255, 255, 255, 0.7)",
                    boxShadow: selectedRating === rating 
                      ? "0 0 16px rgba(94, 170, 168, 0.4)" 
                      : "none"
                  }}
                >
                  {rating}
                </button>
              ))}
            </div>
            
            {/* Rating labels */}
            <div className="flex justify-between max-w-[280px] mx-auto">
              <span className="text-sm text-muted-foreground">Not at all reasonable</span>
              <span className="text-sm text-muted-foreground">Fully reasonable</span>
            </div>
          </div>
          
          {/* Optional feedback */}
          <div className="mb-8">
            <label className="text-sm text-muted-foreground mb-2 block">
              Why did you give this score? (optional)
            </label>
            <textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="Share your reasoning..."
              rows={3}
              className="w-full rounded-lg p-4 text-sm text-foreground placeholder:text-muted-foreground/50 resize-none focus:outline-none focus:ring-1 transition-all"
              style={{ 
                backgroundColor: "rgba(255, 255, 255, 0.03)",
                border: "1px solid rgba(255, 255, 255, 0.1)",
              }}
            />
          </div>
          
          {/* Buttons */}
          <div className="text-center">
            {canSeeResults ? (
              <div className="flex justify-center gap-4">
                <Button 
                  size="lg"
                  disabled={selectedRating === null || !hasMoreResponses}
                  onClick={handleNextResponse}
                  className="px-8 py-6 text-base font-medium bg-accent text-accent-foreground hover:bg-accent/90 transition-all duration-200 shadow-lg shadow-accent/25 disabled:opacity-40 disabled:shadow-none disabled:cursor-not-allowed"
                >
                  Next Response
                </Button>
                <Button 
                  size="lg"
                  variant="outline"
                  onClick={handleSeeResults}
                  className="px-8 py-6 text-base font-medium transition-all duration-200"
                  style={{
                    borderColor: "rgb(94, 170, 168)",
                    color: "rgb(94, 170, 168)",
                    backgroundColor: "transparent"
                  }}
                >
                  See My Results
                </Button>
              </div>
            ) : (
              <Button 
                size="lg"
                disabled={selectedRating === null}
                onClick={handleNextResponse}
                className="px-10 py-6 text-base font-medium bg-accent text-accent-foreground hover:bg-accent/90 transition-all duration-200 shadow-lg shadow-accent/25 disabled:opacity-40 disabled:shadow-none disabled:cursor-not-allowed"
              >
                Next Response
              </Button>
            )}
            
            {/* Encouragement text - only show after initial 6 responses */}
            {showExtraResponsesUI && (
              <p className="text-xs text-muted-foreground italic mt-4">
                More responses = a more accurate AI match
              </p>
            )}
          </div>
          
        </div>
      </div>
    </div>
  )
}
