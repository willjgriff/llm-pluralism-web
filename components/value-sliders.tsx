"use client"

import { PersonaProfile } from "@/lib/types"

interface ValueSlidersProps {
  personaProfile: PersonaProfile
}

const AXES = [
  {
    key: "economic" as const,
    name: "Economic",
    leftPole: "Libertarian",
    rightPole: "Collectivist",
  },
  {
    key: "identity" as const,
    name: "Identity",
    leftPole: "Nationalist",
    rightPole: "Globalist",
  },
  {
    key: "technology" as const,
    name: "Technology",
    leftPole: "Tech Optimist",
    rightPole: "Tech Sceptic",
  },
  {
    key: "society" as const,
    name: "Society",
    leftPole: "Religious",
    rightPole: "Secularist",
  },
]

export function ValueSliders({ personaProfile }: ValueSlidersProps) {
  return (
    <div className="space-y-8">
      {AXES.map((axis) => {
        const position = (1 - personaProfile.positions[axis.key]) * 100
        const assignedPersona = personaProfile[axis.key]
        const leftActive = assignedPersona === axis.leftPole
        const rightActive = assignedPersona === axis.rightPole

        return (
          <div key={axis.name} className="space-y-3">
            <p
              className="text-xs font-medium tracking-wide uppercase"
              style={{ color: "rgba(255, 255, 255, 0.45)" }}
            >
              {axis.name}
            </p>

            <div className="relative">
              <div
                className="h-[2px] w-full rounded-full"
                style={{ backgroundColor: "rgba(255, 255, 255, 0.15)" }}
              />
              <div
                className="absolute w-4 h-4 rounded-full border-2"
                style={{
                  left: `${position}%`,
                  top: "50%",
                  transform: "translate(-50%, -50%)",
                  backgroundColor: "rgb(94, 170, 168)",
                  borderColor: "rgb(94, 170, 168)",
                  boxShadow: "0 0 12px rgba(94, 170, 168, 0.5)",
                }}
              />
            </div>

            <div className="flex justify-between">
              <span
                className="text-sm"
                style={{
                  color: leftActive
                    ? "rgb(94, 170, 168)"
                    : "rgba(255, 255, 255, 0.4)",
                }}
              >
                {axis.leftPole}
              </span>
              <span
                className="text-sm"
                style={{
                  color: rightActive
                    ? "rgb(94, 170, 168)"
                    : "rgba(255, 255, 255, 0.4)",
                }}
              >
                {axis.rightPole}
              </span>
            </div>
          </div>
        )
      })}
    </div>
  )
}
