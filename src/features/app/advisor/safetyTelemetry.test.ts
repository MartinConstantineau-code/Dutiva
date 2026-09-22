import { afterEach, describe, expect, it, vi } from 'vitest'

async function loadWithFakeInvoke(
  invoke: (name: string, opts: { body: unknown }) => Promise<{ data: unknown; error: unknown }>,
) {
  vi.doMock('@/lib/supabaseClient', () => ({ supabase: { functions: { invoke } } }))
  vi.resetModules()
  return import('./safetyTelemetry')
}

async function loadWithNoClient() {
  vi.doMock('@/lib/supabaseClient', () => ({ supabase: null }))
  vi.resetModules()
  return import('./safetyTelemetry')
}

describe('reportSafetyEvent', () => {
  afterEach(() => {
    vi.doUnmock('@/lib/supabaseClient')
    vi.resetModules()
  })

  it('invokes advisor-safety-event with the actions and conversation id', async () => {
    const invoke = vi.fn().mockResolvedValue({ data: { data: { recorded: 1 } }, error: null })
    const { reportSafetyEvent } = await loadWithFakeInvoke(invoke)

    await reportSafetyEvent({ conversationId: 'conv-9', actions: ['crisis-intercept'] })

    expect(invoke).toHaveBeenCalledWith('advisor-safety-event', {
      body: { conversation_id: 'conv-9', actions: ['crisis-intercept'] },
    })
  })

  it('does nothing when there are no actions', async () => {
    const invoke = vi.fn().mockResolvedValue({ data: null, error: null })
    const { reportSafetyEvent } = await loadWithFakeInvoke(invoke)

    await reportSafetyEvent({ conversationId: 'conv-9', actions: [] })

    expect(invoke).not.toHaveBeenCalled()
  })

  it('does nothing (no throw) when Supabase is not configured', async () => {
    const { reportSafetyEvent } = await loadWithNoClient()
    await expect(
      reportSafetyEvent({ conversationId: null, actions: ['legal-basis-withheld'] }),
    ).resolves.toBeUndefined()
  })

  it('swallows an invoke failure — telemetry is best-effort', async () => {
    const invoke = vi.fn().mockRejectedValue(new Error('network down'))
    const { reportSafetyEvent } = await loadWithFakeInvoke(invoke)

    await expect(
      reportSafetyEvent({ conversationId: 'conv-9', actions: ['crisis-intercept'] }),
    ).resolves.toBeUndefined()
  })
})
