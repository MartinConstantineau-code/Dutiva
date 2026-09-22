import { describe, expect, it } from 'vitest'
import { coarseUserAgent } from './coarseUserAgent'

describe('coarseUserAgent', () => {
  it('reduces Chrome on macOS to family + major + OS', () => {
    const ua =
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    expect(coarseUserAgent(ua)).toBe('Chrome/120 macOS')
  })

  it('detects Firefox on Windows', () => {
    const ua = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:121.0) Gecko/20100101 Firefox/121.0'
    expect(coarseUserAgent(ua)).toBe('Firefox/121 Windows')
  })

  it('detects Safari on iOS', () => {
    const ua =
      'Mozilla/5.0 (iPhone; CPU iPhone OS 17_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Mobile/15E148 Safari/604.1'
    expect(coarseUserAgent(ua)).toBe('Safari/17 iOS')
  })

  it('detects iOS Chrome (CriOS) and iOS Firefox (FxiOS) by family, not "Other"', () => {
    const criOS =
      'Mozilla/5.0 (iPhone; CPU iPhone OS 17_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/120.0.6099.119 Mobile/15E148 Safari/604.1'
    expect(coarseUserAgent(criOS)).toBe('Chrome/120 iOS')
    const fxiOS =
      'Mozilla/5.0 (iPhone; CPU iPhone OS 17_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) FxiOS/121.0 Mobile/15E148 Safari/605.1.15'
    expect(coarseUserAgent(fxiOS)).toBe('Firefox/121 iOS')
  })

  it('classifies iPadOS desktop-mode (Macintosh + Mobile token) as iOS, not macOS', () => {
    const ua =
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Safari/605.1.15 Mobile/15E148'
    expect(coarseUserAgent(ua)).toBe('Safari/17 iOS')
  })

  it('detects Edge ahead of Chrome', () => {
    const ua =
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 Edg/120.0.0.0'
    expect(coarseUserAgent(ua)).toBe('Edge/120 Windows')
  })

  it('does not echo the raw high-entropy UA string', () => {
    const ua =
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    const result = coarseUserAgent(ua)
    expect(result).not.toContain('AppleWebKit')
    expect(result.length).toBeLessThanOrEqual(100)
  })

  it('falls back to unknown on an empty UA', () => {
    expect(coarseUserAgent('')).toBe('unknown')
  })
})
