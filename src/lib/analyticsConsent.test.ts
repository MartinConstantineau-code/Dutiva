import { describe, it, expect } from 'vitest'
import { hasAnalyticsConsent, setAnalyticsConsent, hasConsentResponse } from './analyticsConsent'

function mockStorage(): Storage {
  const store = new Map<string, string>()
  return {
    getItem: (key: string) => store.get(key) ?? null,
    setItem: (key: string, value: string) => store.set(key, value),
    removeItem: (key: string) => store.delete(key),
    clear: () => store.clear(),
    key: (index: number) => Array.from(store.keys())[index] ?? null,
    get length() {
      return store.size
    },
  } as unknown as Storage
}

describe('consent', () => {
  it('returns false when storage is unavailable', () => {
    expect(hasAnalyticsConsent(null)).toBe(false)
    expect(hasConsentResponse(null)).toBe(false)
  })

  it('returns false when no consent has been recorded', () => {
    const storage = mockStorage()
    expect(hasAnalyticsConsent(storage)).toBe(false)
    expect(hasConsentResponse(storage)).toBe(false)
  })

  it('records and reads consent', () => {
    const storage = mockStorage()
    setAnalyticsConsent(true, storage)
    expect(hasAnalyticsConsent(storage)).toBe(true)
    expect(hasConsentResponse(storage)).toBe(true)
  })

  it('records and reads declined consent', () => {
    const storage = mockStorage()
    setAnalyticsConsent(false, storage)
    expect(hasAnalyticsConsent(storage)).toBe(false)
    expect(hasConsentResponse(storage)).toBe(true)
  })
})
