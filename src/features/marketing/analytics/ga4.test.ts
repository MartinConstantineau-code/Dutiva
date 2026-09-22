import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest'
import { isGa4Configured, loadGa4 } from './ga4'
import { setAnalyticsConsent } from '@/lib/analyticsConsent'

describe('ga4', () => {
  beforeEach(() => {
    vi.stubEnv('VITE_GA_MEASUREMENT_ID', '')
  })

  afterEach(() => {
    vi.unstubAllEnvs()
    document.head.innerHTML = ''
  })

  it('isGa4Configured returns false without a measurement ID', () => {
    expect(isGa4Configured()).toBe(false)
  })

  it('isGa4Configured returns true with a measurement ID', () => {
    vi.stubEnv('VITE_GA_MEASUREMENT_ID', 'G-TESTID')
    expect(isGa4Configured()).toBe(true)
  })

  it('loadGa4 does nothing without a measurement ID', () => {
    const storage = new Map<string, string>()
    const mockStorage = {
      getItem: (k: string) => storage.get(k) ?? null,
      setItem: (k: string, v: string) => storage.set(k, v),
      removeItem: (k: string) => storage.delete(k),
      clear: () => storage.clear(),
      key: () => null,
      get length() {
        return storage.size
      },
    } as unknown as Storage
    setAnalyticsConsent(true, mockStorage)
    // Can't easily mock hasAnalyticsConsent's internal storage, but without
    // a measurement ID, loadGa4 returns false before checking consent.
    expect(loadGa4()).toBe(false)
    expect(document.head.innerHTML).toBe('')
  })

  it('loadGa4 does nothing without consent even with a measurement ID', () => {
    vi.stubEnv('VITE_GA_MEASUREMENT_ID', 'G-TESTID')
    // No consent set — hasAnalyticsConsent returns false (no localStorage in test env)
    expect(loadGa4()).toBe(false)
    expect(document.head.innerHTML).toBe('')
  })
})
