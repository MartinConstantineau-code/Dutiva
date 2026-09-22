import { describe, expect, it, vi } from 'vitest'

/**
 * The obligations boundary's deploy-gap behavior: the app ships from main
 * immediately while migration 0069 is a manual owner step, so for a while
 * hr_obligations may not exist. That must read as an empty register (score
 * component null, three-component blend) — not as an error that takes down
 * the production score card. Any other failure still throws.
 */

function mockClient(error: { code?: string; message?: string }) {
  const range = vi.fn().mockResolvedValue({ data: null, error })
  const order2 = vi.fn().mockReturnValue({ range })
  const order1 = vi.fn().mockReturnValue({ order: order2 })
  const eq = vi.fn().mockReturnValue({ order: order1 })
  const select = vi.fn().mockReturnValue({ eq })
  vi.doMock('@/lib/supabaseClient', () => ({
    supabase: { from: vi.fn().mockReturnValue({ select }) },
  }))
  vi.resetModules()
}

describe('listObligations — pre-0069 deploy gap', () => {
  it('treats a missing hr_obligations table as an empty register', async () => {
    mockClient({ code: 'PGRST205', message: 'Could not find the table' })
    const api = await import('./productionApi')
    expect(await api.listObligations('org-1')).toEqual([])
  })

  it('still throws every other error', async () => {
    const boom = { code: '42501', message: 'permission denied' }
    mockClient(boom)
    const api = await import('./productionApi')
    await expect(api.listObligations('org-1')).rejects.toBe(boom)
  })
})
