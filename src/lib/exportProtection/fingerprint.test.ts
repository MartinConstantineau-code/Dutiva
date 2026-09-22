import { describe, expect, it } from 'vitest'
import {
  contentFingerprint,
  decodeInvisibleTag,
  encodeInvisibleTag,
  isExportId,
  newExportId,
} from './fingerprint'

describe('export fingerprint', () => {
  it('mints valid, unique export ids', () => {
    const a = newExportId()
    const b = newExportId()
    expect(isExportId(a)).toBe(true)
    expect(isExportId(b)).toBe(true)
    expect(a).not.toBe(b)
  })

  it('round-trips an id through the invisible tag', () => {
    const id = 'de305d54-75b4-431b-adb2-eb6b9e546014'
    const tag = encodeInvisibleTag(id)
    /* 2 sentinel chars each side + 128 bit chars, all zero-width. */
    expect(tag).toHaveLength(132)
    expect(decodeInvisibleTag(tag)).toBe(id)
  })

  it('recovers the id from a tag embedded mid-document (the leak scenario)', () => {
    const id = newExportId()
    const leaked = `Pasted excerpt: Dear Jordan,${encodeInvisibleTag(id)} your employment…\nmore prose`
    expect(decodeInvisibleTag(leaked)).toBe(id)
  })

  it('rejects damaged tags instead of mis-attributing', () => {
    const id = newExportId()
    const tag = encodeInvisibleTag(id)
    /* Truncating bits inside the sentinels must fail closed. */
    const damaged = tag.slice(0, 2) + tag.slice(6)
    expect(decodeInvisibleTag(damaged)).toBeNull()
    expect(decodeInvisibleTag('plain text, no tag')).toBeNull()
    expect(decodeInvisibleTag('')).toBeNull()
  })

  it('returns an empty tag for a malformed id rather than throwing', () => {
    expect(encodeInvisibleTag('not-a-uuid')).toBe('')
    expect(encodeInvisibleTag('DE305D54-75B4-431B-ADB2-EB6B9E546014')).toBe('')
  })

  it('fingerprints content deterministically as sha-256 hex', async () => {
    const a = await contentFingerprint('Termination letter — Jordan Mensah')
    const b = await contentFingerprint('Termination letter — Jordan Mensah')
    const c = await contentFingerprint('Termination letter — Jordan Mensah.')
    expect(a).toBe(b)
    expect(a).not.toBe(c)
    expect(a).toMatch(/^[0-9a-f]{64}$/)
  })
})
