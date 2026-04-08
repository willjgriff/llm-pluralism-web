import type { TrafficAttribution } from './types'

const TRAFFIC_STORAGE_KEY = 'llm_pluralism_traffic_attribution'

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
 * Reads traffic attribution for session creation.
 *
 * If the URL contains a non-empty `src` and/or `t`, those values win (replacing anything in
 * sessionStorage) so opening a new tracking link in the same tab updates attribution.
 * If neither param is present, returns the last saved value from sessionStorage so in-app
 * navigation without query params still sends attribution after optional URL stripping.
 *
 * Persists to sessionStorage so React Strict Mode (double mount) does not lose data after strip.
 *
 * Returns:
 *   An object with optional `src` and `trustedToken` (for JSON `trusted_token`).
 */
export function captureTrafficAttribution(): TrafficAttribution {
  const params = new URLSearchParams(window.location.search)
  const srcRaw = params.get('src')
  const tokenRaw = params.get('t')
  const hasSrcInUrl = srcRaw !== null && srcRaw.length > 0
  const hasTInUrl = tokenRaw !== null && tokenRaw.length > 0

  let result: TrafficAttribution

  if (hasSrcInUrl || hasTInUrl) {
    const src = hasSrcInUrl && srcRaw !== null ? srcRaw : undefined
    const trustedToken = hasTInUrl && tokenRaw !== null ? tokenRaw : undefined
    result = { src, trustedToken }
    sessionStorage.setItem(TRAFFIC_STORAGE_KEY, JSON.stringify(result))
  } else {
    const stored = sessionStorage.getItem(TRAFFIC_STORAGE_KEY)
    if (stored) {
      try {
        result = JSON.parse(stored) as TrafficAttribution
      } catch {
        sessionStorage.removeItem(TRAFFIC_STORAGE_KEY)
        result = {}
      }
    } else {
      result = {}
    }
  }

  const shouldStripSrc = STRIP_SRC_PARAM_FROM_URL && hasSrcInUrl
  const shouldStripTrustedToken = STRIP_T_PARAM_FROM_URL && hasTInUrl

  if (shouldStripSrc || shouldStripTrustedToken) {
    if (shouldStripSrc) {
      params.delete('src')
    }
    if (shouldStripTrustedToken) {
      params.delete('t')
    }
    const query = params.toString()
    const path = window.location.pathname
    const hash = window.location.hash
    window.history.replaceState({}, '', `${path}${query ? `?${query}` : ''}${hash}`)
  }

  return result
}
