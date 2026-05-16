import type { TrafficAttribution } from './types'

const TRAFFIC_STORAGE_KEY = 'llm_pluralism_traffic_attribution'

const PROLIFIC_PARAM_KEYS = ['PROLIFIC_PID', 'STUDY_ID', 'SESSION_ID'] as const

/** Clears persisted traffic params (e.g. after "start over" so a new link can set attribution). */
export function clearStoredTrafficAttribution(): void {
  sessionStorage.removeItem(TRAFFIC_STORAGE_KEY)
}

/**
 * When true, `src` is removed from the URL after it is captured.
 */
export const STRIP_SRC_PARAM_FROM_URL = false

/**
 * When true, `t` is removed from the URL after it is captured.
 */
export const STRIP_T_PARAM_FROM_URL = true

/**
 * When true, Prolific query params are removed from the URL after they are captured.
 */
export const STRIP_PROLIFIC_PARAMS_FROM_URL = false

/**
 * Reads traffic attribution for session creation.
 *
 * If the URL contains a non-empty `src` and/or `t`, those values win (replacing anything in
 * sessionStorage) so opening a new tracking link in the same tab updates attribution.
 * Prolific params (`PROLIFIC_PID`, `STUDY_ID`, `SESSION_ID`) are captured when present in the URL.
 * If neither param is present, returns the last saved value from sessionStorage so in-app
 * navigation without query params still sends attribution after optional URL stripping.
 *
 * Persists to sessionStorage so React Strict Mode (double mount) does not lose data after strip.
 *
 * Returns:
 *   An object with optional `src`, `trustedToken`, and Prolific identifiers.
 */
export function captureTrafficAttribution(): TrafficAttribution {
  const params = new URLSearchParams(window.location.search)
  const srcRaw = params.get('src')
  const tokenRaw = params.get('t')
  const hasSrcInUrl = srcRaw !== null && srcRaw.length > 0
  const hasTInUrl = tokenRaw !== null && tokenRaw.length > 0

  const prolificPidRaw = params.get('PROLIFIC_PID')
  const prolificStudyIdRaw = params.get('STUDY_ID')
  const prolificSessionIdRaw = params.get('SESSION_ID')
  const hasProlificPidInUrl = prolificPidRaw !== null && prolificPidRaw.length > 0
  const hasProlificStudyIdInUrl = prolificStudyIdRaw !== null && prolificStudyIdRaw.length > 0
  const hasProlificSessionIdInUrl = prolificSessionIdRaw !== null && prolificSessionIdRaw.length > 0
  const hasProlificInUrl =
    hasProlificPidInUrl || hasProlificStudyIdInUrl || hasProlificSessionIdInUrl

  const readStored = (): TrafficAttribution => {
    const stored = sessionStorage.getItem(TRAFFIC_STORAGE_KEY)
    if (!stored) return {}
    try {
      return JSON.parse(stored) as TrafficAttribution
    } catch {
      sessionStorage.removeItem(TRAFFIC_STORAGE_KEY)
      return {}
    }
  }

  let result: TrafficAttribution

  if (hasSrcInUrl || hasTInUrl || hasProlificInUrl) {
    const stored = readStored()
    result = { ...stored }
    if (hasSrcInUrl && srcRaw !== null) {
      result.src = srcRaw
    }
    if (hasTInUrl && tokenRaw !== null) {
      result.trustedToken = tokenRaw
    }
    if (hasProlificPidInUrl && prolificPidRaw !== null) {
      result.prolificPid = prolificPidRaw
    }
    if (hasProlificStudyIdInUrl && prolificStudyIdRaw !== null) {
      result.prolificStudyId = prolificStudyIdRaw
    }
    if (hasProlificSessionIdInUrl && prolificSessionIdRaw !== null) {
      result.prolificSessionId = prolificSessionIdRaw
    }
    sessionStorage.setItem(TRAFFIC_STORAGE_KEY, JSON.stringify(result))
  } else {
    result = readStored()
  }

  const shouldStripSrc = STRIP_SRC_PARAM_FROM_URL && hasSrcInUrl
  const shouldStripTrustedToken = STRIP_T_PARAM_FROM_URL && hasTInUrl
  const shouldStripProlific = STRIP_PROLIFIC_PARAMS_FROM_URL && hasProlificInUrl

  if (shouldStripSrc || shouldStripTrustedToken || shouldStripProlific) {
    if (shouldStripSrc) {
      params.delete('src')
    }
    if (shouldStripTrustedToken) {
      params.delete('t')
    }
    if (shouldStripProlific) {
      for (const key of PROLIFIC_PARAM_KEYS) {
        params.delete(key)
      }
    }
    const query = params.toString()
    const path = window.location.pathname
    const hash = window.location.hash
    window.history.replaceState({}, '', `${path}${query ? `?${query}` : ''}${hash}`)
  }

  return result
}
