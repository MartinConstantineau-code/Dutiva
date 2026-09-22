import { afterEach, describe, expect, it } from 'vitest'
import {
  appendExportAudit,
  clearExportAudit,
  localExportDecision,
  readExportAudit,
  type ExportAuditEntry,
} from './localAudit'

function entry(at: string, overrides: Partial<ExportAuditEntry> = {}): ExportAuditEntry {
  return {
    exportId: `id-${at}-${Math.random().toString(36).slice(2, 8)}`,
    surface: 'docstudio',
    kind: 'pdf',
    title: 'Termination Letter',
    contentSha256: 'a'.repeat(64),
    contentChars: 1200,
    lang: 'en',
    actorLabel: 'Amara Osei (amara@northgate.ca)',
    at,
    recordedRemotely: false,
    ...overrides,
  }
}

const NOW = new Date('2026-07-30T12:00:00Z')
const secondsAgo = (s: number) => new Date(NOW.getTime() - s * 1000).toISOString()

afterEach(() => {
  clearExportAudit()
})

describe('local export audit', () => {
  it('appends newest-first and survives a read round-trip', () => {
    appendExportAudit(entry(secondsAgo(120)))
    appendExportAudit(entry(secondsAgo(60), { kind: 'word' }))
    const trail = readExportAudit()
    expect(trail).toHaveLength(2)
    expect(trail[0]?.kind).toBe('word')
  })

  it('counts advisor and doclib exports too, not just docstudio (2026-08-08 fix)', () => {
    /* Regression: isEntry used to reject these surfaces/kinds, so an advisor
       "Copy" or a doclib export was written and then silently filtered out
       of the guard's own history. */
    appendExportAudit(entry(secondsAgo(120), { surface: 'advisor', kind: 'text' }))
    appendExportAudit(entry(secondsAgo(60), { surface: 'doclib', kind: 'pdf' }))
    const trail = readExportAudit()
    expect(trail).toHaveLength(2)
    expect(trail.map((e) => e.surface).sort()).toEqual(['advisor', 'doclib'])
  })

  it('a burst of advisor copies now trips the velocity guard', () => {
    for (let i = 0; i < 12; i += 1)
      appendExportAudit(entry(secondsAgo(10 + i * 20), { surface: 'advisor', kind: 'text' }))
    expect(localExportDecision(NOW).allowed).toBe(false)
  })

  it('reads corrupt storage as empty instead of throwing', () => {
    localStorage.setItem('dutiva-export-audit', '{not json')
    expect(readExportAudit()).toEqual([])
    localStorage.setItem('dutiva-export-audit', JSON.stringify([{ junk: true }, null, 4]))
    expect(readExportAudit()).toEqual([])
  })

  it('allows a normal day of exports', () => {
    for (let i = 0; i < 8; i += 1) appendExportAudit(entry(secondsAgo(3600 * i + 600)))
    expect(localExportDecision(NOW)).toEqual({ allowed: true })
  })

  it('refuses a burst and says when the window frees', () => {
    /* 12 exports in the last 5 minutes — the scripted-hammering shape. */
    for (let i = 0; i < 12; i += 1) appendExportAudit(entry(secondsAgo(10 + i * 20)))
    const decision = localExportDecision(NOW)
    expect(decision.allowed).toBe(false)
    if (!decision.allowed) {
      expect(decision.scope).toBe('burst')
      /* Oldest is 230s old in a 300s window → free in ~70s. */
      expect(decision.retryAfterSeconds).toBeGreaterThan(0)
      expect(decision.retryAfterSeconds).toBeLessThanOrEqual(300)
    }
  })

  it('refuses past the rolling daily ceiling', () => {
    /* 100 exports spread over the day, none bursty. */
    for (let i = 0; i < 100; i += 1) appendExportAudit(entry(secondsAgo(400 + i * 800)))
    const decision = localExportDecision(NOW)
    expect(decision.allowed).toBe(false)
    if (!decision.allowed) expect(decision.scope).toBe('daily')
  })
})
