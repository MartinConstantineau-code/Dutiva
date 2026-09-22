import { afterEach, describe, expect, it, vi } from 'vitest'
import type { Session } from '@supabase/supabase-js'
import { authorizeExport, exportDenialMessage, type ExportRequest } from './authorize'
import { appendExportAudit, clearExportAudit, readExportAudit } from './localAudit'

/* The module-level supabase client is swapped for a controllable stub; each
   test sets `invokeImpl` to shape the edge function's answer. */
const invokeImpl = vi.hoisted(() => ({
  current: null as
    ((name: string, options: unknown) => Promise<{ data: unknown; error: unknown }>) | null,
}))
vi.mock('@/lib/supabaseClient', () => ({
  supabase: {
    functions: {
      invoke: (name: string, options: unknown) =>
        invokeImpl.current
          ? invokeImpl.current(name, options)
          : Promise.reject(new Error('no invoke stub')),
    },
  },
}))

const session = { access_token: 'jwt' } as Session

function request(overrides: Partial<ExportRequest> = {}): ExportRequest {
  return {
    surface: 'docstudio',
    kind: 'pdf',
    title: 'Termination Letter',
    content: 'Dear Jordan, …',
    lang: 'en',
    actorLabel: 'Amara Osei (amara@northgate.ca)',
    workspaceLabel: 'Northgate Logistics Inc.',
    session: null,
    ...overrides,
  }
}

afterEach(() => {
  clearExportAudit()
  invokeImpl.current = null
})

describe('authorizeExport', () => {
  it('signed-out (demo): allows locally, mints an id, records the device audit row', async () => {
    const decision = await authorizeExport(request())
    expect(decision.allowed).toBe(true)
    if (decision.allowed) {
      expect(decision.recordedRemotely).toBe(false)
      expect(decision.stamp.exportId).toMatch(/^[0-9a-f-]{36}$/)
    }
    const trail = readExportAudit()
    expect(trail).toHaveLength(1)
    expect(trail[0]?.contentSha256).toMatch(/^[0-9a-f]{64}$/)
    expect(trail[0]?.recordedRemotely).toBe(false)
  })

  it('refuses locally once the burst window is full — before any network call', async () => {
    const invoke = vi.fn()
    invokeImpl.current = invoke
    for (let i = 0; i < 12; i += 1) {
      appendExportAudit({
        exportId: `seed-${i}`,
        surface: 'docstudio',
        kind: 'pdf',
        title: 'Seed',
        contentSha256: 'a'.repeat(64),
        contentChars: 10,
        lang: 'en',
        actorLabel: 'seed',
        at: new Date().toISOString(),
        recordedRemotely: false,
      })
    }
    const decision = await authorizeExport(request({ session }))
    expect(decision.allowed).toBe(false)
    if (!decision.allowed) expect(decision.scope).toBe('burst')
    expect(invoke).not.toHaveBeenCalled()
    expect(readExportAudit()).toHaveLength(12)
  })

  it('signed-in: uses the server-minted export id and marks the row remote', async () => {
    invokeImpl.current = (name) => {
      expect(name).toBe('record-export')
      return Promise.resolve({ data: { export_id: 'server-issued-id' }, error: null })
    }
    const decision = await authorizeExport(request({ session }))
    expect(decision.allowed).toBe(true)
    if (decision.allowed) {
      expect(decision.stamp.exportId).toBe('server-issued-id')
      expect(decision.recordedRemotely).toBe(true)
    }
    expect(readExportAudit()[0]?.recordedRemotely).toBe(true)
  })

  it("signed-in: the server guard's 429 is final", async () => {
    invokeImpl.current = () =>
      Promise.resolve({
        data: null,
        error: {
          context: new Response(
            JSON.stringify({ code: 'export_limit', scope: 'burst', retry_after_seconds: 120 }),
            { status: 429 },
          ),
        },
      })
    const decision = await authorizeExport(request({ session }))
    expect(decision.allowed).toBe(false)
    if (!decision.allowed) {
      expect(decision.scope).toBe('burst')
      expect(decision.retryAfterSeconds).toBe(120)
    }
    /* A refused export must not land in the trail. */
    expect(readExportAudit()).toHaveLength(0)
  })

  it('signed-in but unreachable: falls back to a local id (offline PWA posture)', async () => {
    invokeImpl.current = () => Promise.reject(new Error('network down'))
    const decision = await authorizeExport(request({ session }))
    expect(decision.allowed).toBe(true)
    if (decision.allowed) expect(decision.recordedRemotely).toBe(false)
  })

  it('phrases refusals in both languages with a rounded-up wait', () => {
    const msg = exportDenialMessage({ allowed: false, scope: 'burst', retryAfterSeconds: 240 })
    expect(msg.en).toContain('4 minutes')
    expect(msg.fr).toContain('4 minutes')
    const daily = exportDenialMessage({ allowed: false, scope: 'daily', retryAfterSeconds: 7200 })
    expect(daily.en).toContain('2 hours')
    expect(daily.fr).toContain('2 heures')
  })
})
