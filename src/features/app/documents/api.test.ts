import { beforeEach, describe, expect, it } from 'vitest'
import { loadDoclibData, resetDoclibCache } from './api'

/**
 * The Documents Library is served from the bundled fixtures (the demo no
 * longer reads the anon-exposed `public.doclib_*` views — see api.ts). These
 * assert the fixtures load and are cached; the fixtures' content is exercised
 * by the higher-level docstudio/documents tests.
 */
describe('loadDoclibData', () => {
  beforeEach(() => {
    resetDoclibCache()
  })

  it('serves the bundled fixtures', async () => {
    const data = await loadDoclibData()
    expect(data.source).toBe('fixtures')
    expect(data.templates.length).toBeGreaterThan(0)
    expect(data.categories.length).toBeGreaterThan(0)
    expect(Array.isArray(data.documents)).toBe(true)
  })

  it('reuses one cached promise across calls, and a fresh one after reset', () => {
    const first = loadDoclibData()
    expect(loadDoclibData()).toBe(first) // same cached promise, no re-work
    resetDoclibCache()
    expect(loadDoclibData()).not.toBe(first) // fresh promise after the reset hook
  })
})
