/**
 * Blob download + export filenames. Same anchor mechanism the Memory
 * manager's JSON export established, factored out and guarded: jsdom and SSR
 * have no `URL.createObjectURL`, so `triggerDownload` reports capability
 * instead of throwing — callers treat a false as "artifact built and audited,
 * delivery unavailable here".
 */

/** `dutiva-termination-letter-20260730.pdf` — diacritics folded, lowercase,
 * capped; the date keeps repeated exports of one doc distinguishable. */
export function exportFilename(title: string, ext: string, at: Date): string {
  const slug =
    title
      .normalize('NFD')
      .replace(/\p{M}+/gu, '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 60)
      .replace(/-+$/, '') || 'document'
  const pad = (n: number) => String(n).padStart(2, '0')
  const date = `${at.getUTCFullYear()}${pad(at.getUTCMonth() + 1)}${pad(at.getUTCDate())}`
  return `dutiva-${slug}-${date}.${ext}`
}

export function triggerDownload(filename: string, blob: Blob): boolean {
  if (typeof URL === 'undefined' || typeof URL.createObjectURL !== 'function') return false
  const url = URL.createObjectURL(blob)
  try {
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = filename
    anchor.click()
    return true
  } finally {
    URL.revokeObjectURL(url)
  }
}
