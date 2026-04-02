import { PersonaProfile } from './types'

export function assignPersonas(answers: number[]): PersonaProfile {
  const economicScore = answers[1] - answers[0]
  const identityScore = answers[2] - answers[3]
  const technologyScore = answers[5] - answers[4]
  const societyScore = answers[6] - answers[7]

  const positions = {
    economic: (economicScore + 4) / 8,
    identity: (identityScore + 4) / 8,
    technology: (technologyScore + 4) / 8,
    society: (societyScore + 4) / 8,
  }

  const THRESHOLD = 2

  const axisScores = [
    { axis: 'economic' as const, score: Math.abs(economicScore) },
    { axis: 'identity' as const, score: Math.abs(identityScore) },
    { axis: 'technology' as const, score: Math.abs(technologyScore) },
    { axis: 'society' as const, score: Math.abs(societyScore) },
  ]

  const dominant = axisScores.reduce((a, b) => a.score >= b.score ? a : b)
  const isCentrist = dominant.score < THRESHOLD

  let primaryPersona: PersonaProfile['primaryPersona'] = 'Centrist'
  let primaryAxis: PersonaProfile['primaryAxis'] = 'centrist'

  if (!isCentrist) {
    primaryAxis = dominant.axis
    if (dominant.axis === 'economic') primaryPersona = economicScore > 0 ? 'Libertarian' : 'Collectivist'
    if (dominant.axis === 'identity') primaryPersona = identityScore > 0 ? 'Nationalist' : 'Globalist'
    if (dominant.axis === 'technology') primaryPersona = technologyScore > 0 ? 'Tech Optimist' : 'Tech Sceptic'
    if (dominant.axis === 'society') primaryPersona = societyScore > 0 ? 'Religious' : 'Secularist'
  }

  return {
    economic: economicScore > 0 ? 'Libertarian' : economicScore < 0 ? 'Collectivist' : 'Neutral',
    identity: identityScore > 0 ? 'Nationalist' : identityScore < 0 ? 'Globalist' : 'Neutral',
    technology: technologyScore > 0 ? 'Tech Optimist' : technologyScore < 0 ? 'Tech Sceptic' : 'Neutral',
    society: societyScore > 0 ? 'Religious' : societyScore < 0 ? 'Secularist' : 'Neutral',
    primaryPersona,
    primaryAxis,
    positions,
  }
}
