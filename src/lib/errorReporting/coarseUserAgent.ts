/**
 * Reduce the full `navigator.userAgent` string to a coarse label —
 * browser family + major version + OS family, e.g. `Chrome/120 macOS`.
 *
 * Why coarsen: the raw UA is a long, high-entropy string (exact build numbers,
 * device model, locale hints) and a well-known browser-fingerprinting vector.
 * Browser-specific crashes only need the family and major version to
 * reproduce, so we deliberately drop the rest before anything is sent.
 */

const BROWSERS: ReadonlyArray<readonly [string, RegExp]> = [
  ['Edge', /Edg(?:e|A|iOS)?\/(\d+)/],
  ['Opera', /OPR\/(\d+)/],
  ['Samsung', /SamsungBrowser\/(\d+)/],
  // iOS Firefox/Chrome brand as FxiOS/CriOS (still WebKit); match before Safari.
  ['Firefox', /(?:Firefox|FxiOS)\/(\d+)/],
  ['Chrome', /(?:Chrome|CriOS)\/(\d+)/],
  ['Safari', /Version\/(\d+)[.\d]*\s+.*Safari/],
]

function detectBrowser(ua: string): string {
  for (const [name, re] of BROWSERS) {
    const match = re.exec(ua)
    if (match) return `${name}/${match[1]}`
  }
  return 'Other'
}

function detectOs(ua: string): string {
  if (/Windows NT/.test(ua)) return 'Windows'
  if (/iPhone|iPad|iPod/.test(ua)) return 'iOS'
  // iPadOS in desktop mode reports as "Macintosh" but keeps a "Mobile/" token.
  if (/Mac OS X/.test(ua) && /Mobile\//.test(ua)) return 'iOS'
  if (/Mac OS X/.test(ua)) return 'macOS'
  if (/Android/.test(ua)) return 'Android'
  if (/CrOS/.test(ua)) return 'ChromeOS'
  if (/Linux/.test(ua)) return 'Linux'
  return ''
}

export function coarseUserAgent(rawUa?: string): string {
  const ua = rawUa ?? (typeof navigator !== 'undefined' ? navigator.userAgent : '')
  if (!ua) return 'unknown'
  const label = [detectBrowser(ua), detectOs(ua)].filter(Boolean).join(' ')
  return (label || 'unknown').slice(0, 100)
}
