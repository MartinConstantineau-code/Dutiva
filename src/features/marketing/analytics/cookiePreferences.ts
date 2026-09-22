/**
 * The reopen channel for the consent banner, split out from ConsentBanner.tsx
 * on purpose: the footer's "Cookie preferences" control needs a way to reopen
 * the banner, but importing the banner itself would drag the whole banner
 * (and, through it, the GA4 loader) into the eager marketing chunk. This module
 * is a bare window event — a few lines, no React, no analytics — so the footer
 * can trigger the banner while the banner stays lazily loaded.
 */

/** Window event that tells a mounted ConsentBanner to show itself again. */
export const COOKIE_PREFERENCES_EVENT = 'dutiva:cookie-preferences'

/** Reopen the consent banner so a prior choice can be reviewed or changed. */
export function openCookiePreferences(): void {
  if (typeof window === 'undefined') return
  window.dispatchEvent(new Event(COOKIE_PREFERENCES_EVENT))
}
