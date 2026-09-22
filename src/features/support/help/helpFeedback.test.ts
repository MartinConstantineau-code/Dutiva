import { describe, expect, it } from 'vitest'
import { feedbackStorageKey, readHelpfulness, recordHelpfulness } from './helpFeedback'

/** Minimal in-memory Storage for deterministic tests. */
function fakeStorage(seed: Record<string, string> = {}): Storage {
  const map = new Map(Object.entries(seed))
  return {
    get length() {
      return map.size
    },
    clear: () => map.clear(),
    getItem: (k: string) => (map.has(k) ? (map.get(k) as string) : null),
    key: (i: number) => [...map.keys()][i] ?? null,
    removeItem: (k: string) => map.delete(k),
    setItem: (k: string, v: string) => void map.set(k, v),
  }
}

describe('helpFeedback', () => {
  it('namespaces storage keys by slug', () => {
    expect(feedbackStorageKey('signing-in')).toBe('dutiva.help.feedback.signing-in')
  })

  it('returns null when there is no prior vote', () => {
    expect(readHelpfulness('a', fakeStorage())).toBeNull()
  })

  it('round-trips a recorded vote', () => {
    const storage = fakeStorage()
    expect(recordHelpfulness('a', 'yes', storage)).toBe('yes')
    expect(readHelpfulness('a', storage)).toBe('yes')
    recordHelpfulness('a', 'no', storage)
    expect(readHelpfulness('a', storage)).toBe('no')
  })

  it('ignores an unrecognized stored value', () => {
    const storage = fakeStorage({ [feedbackStorageKey('a')]: 'maybe' })
    expect(readHelpfulness('a', storage)).toBeNull()
  })

  it('does not throw when storage is unavailable', () => {
    expect(readHelpfulness('a', null)).toBeNull()
    expect(recordHelpfulness('a', 'yes', null)).toBe('yes')
  })

  it('swallows storage write failures but still returns the value', () => {
    const throwing = {
      ...fakeStorage(),
      setItem: () => {
        throw new Error('quota exceeded')
      },
    } as Storage
    expect(recordHelpfulness('a', 'yes', throwing)).toBe('yes')
  })
})
