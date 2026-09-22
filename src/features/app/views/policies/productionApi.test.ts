import { afterEach, describe, expect, it, vi } from 'vitest'
import { listChain } from '@/test/productionWorkspace'

/** Same per-test client mock + fresh import pattern as the other productionApi tests. */
describe('policies productionApi', () => {
  afterEach(() => {
    vi.doUnmock('@/lib/supabaseClient')
    vi.resetModules()
  })

  const ROW = {
    id: 'policy-1',
    name: 'Remote Work Policy',
    status: 'needs_review',
    last_reviewed: '2025-05-01',
  }

  it('listPolicies returns parsed rows scoped to the org', async () => {
    const order = vi.fn().mockReturnValue(listChain([ROW]))
    const eq = vi.fn().mockReturnValue({ order })
    const select = vi.fn().mockReturnValue({ eq })
    vi.doMock('@/lib/supabaseClient', () => ({
      supabase: { from: vi.fn().mockReturnValue({ select }) },
    }))
    vi.resetModules()
    const api = await import('./productionApi')

    const rows = await api.listPolicies('org-1')
    expect(eq).toHaveBeenCalledWith('organization_id', 'org-1')
    expect(rows).toEqual([
      {
        id: 'policy-1',
        name: 'Remote Work Policy',
        status: 'needs_review',
        lastReviewed: '2025-05-01',
      },
    ])
  })

  it('addPolicy inserts with the org id and nulls an empty review date', async () => {
    const single = vi.fn().mockResolvedValue({ data: { ...ROW, last_reviewed: null }, error: null })
    const select = vi.fn().mockReturnValue({ single })
    const insert = vi.fn().mockReturnValue({ select })
    vi.doMock('@/lib/supabaseClient', () => ({
      supabase: { from: vi.fn().mockReturnValue({ insert }) },
    }))
    vi.resetModules()
    const api = await import('./productionApi')

    await api.addPolicy('org-1', {
      name: 'Remote Work Policy',
      status: 'missing',
      lastReviewed: '',
    })
    expect(insert).toHaveBeenCalledWith({
      organization_id: 'org-1',
      name: 'Remote Work Policy',
      status: 'missing',
      last_reviewed: null,
    })
  })

  it('setPolicyStatus stamps last_reviewed only on the up_to_date transition', async () => {
    const eq = vi.fn().mockResolvedValue({ error: null })
    const update = vi.fn().mockReturnValue({ eq })
    vi.doMock('@/lib/supabaseClient', () => ({
      supabase: { from: vi.fn().mockReturnValue({ update }) },
    }))
    vi.resetModules()
    const api = await import('./productionApi')

    await api.setPolicyStatus('policy-1', 'up_to_date', '2026-07-12')
    expect(update).toHaveBeenCalledWith(
      expect.objectContaining({ status: 'up_to_date', last_reviewed: '2026-07-12' }),
    )

    await api.setPolicyStatus('policy-1', 'needs_review')
    expect(update).toHaveBeenLastCalledWith(
      expect.not.objectContaining({ last_reviewed: expect.anything() }),
    )
  })

  it('listPolicies throws when the read fails', async () => {
    const order = vi.fn().mockReturnValue(listChain([], new Error('rls')))
    const eq = vi.fn().mockReturnValue({ order })
    const select = vi.fn().mockReturnValue({ eq })
    vi.doMock('@/lib/supabaseClient', () => ({
      supabase: { from: vi.fn().mockReturnValue({ select }) },
    }))
    vi.resetModules()
    const api = await import('./productionApi')

    await expect(api.listPolicies('org-1')).rejects.toThrow()
  })
})
