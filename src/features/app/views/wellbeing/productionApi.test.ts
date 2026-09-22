import { afterEach, describe, expect, it, vi } from 'vitest'
import { overdueReviews } from './productionApi'
import type { ProductionInitiative } from './productionApi'

/** Same per-test client mock + fresh import pattern as the other productionApi tests. */
describe('wellbeing productionApi', () => {
  afterEach(() => {
    vi.doUnmock('@/lib/supabaseClient')
    vi.resetModules()
  })

  const ROW = {
    id: 'init-1',
    name: 'Employee assistance programme',
    kind: 'eap',
    status: 'active',
    owner: 'HR lead',
    review_date: '2026-12-01',
    note: null,
  }

  it('listInitiatives returns parsed rows scoped to the org', async () => {
    const order = vi.fn().mockResolvedValue({ data: [ROW], error: null })
    const eq = vi.fn().mockReturnValue({ order })
    const select = vi.fn().mockReturnValue({ eq })
    vi.doMock('@/lib/supabaseClient', () => ({
      supabase: { from: vi.fn().mockReturnValue({ select }) },
    }))
    vi.resetModules()
    const api = await import('./productionApi')

    const rows = await api.listInitiatives('org-1')
    expect(eq).toHaveBeenCalledWith('organization_id', 'org-1')
    expect(rows).toEqual([
      {
        id: 'init-1',
        name: 'Employee assistance programme',
        kind: 'eap',
        status: 'active',
        owner: 'HR lead',
        reviewDate: '2026-12-01',
        note: null,
      },
    ])
  })

  /**
   * The load-bearing test for this module. The register records what the
   * employer offers; it must not grow a person reference. If someone adds an
   * `employee_id` column and threads it through here, this fails — which is
   * the point. See migration 0041's header for why.
   */
  it('carries no employee reference, by design', async () => {
    const order = vi.fn().mockResolvedValue({ data: [ROW], error: null })
    const select = vi.fn().mockReturnValue({ eq: vi.fn().mockReturnValue({ order }) })
    vi.doMock('@/lib/supabaseClient', () => ({
      supabase: { from: vi.fn().mockReturnValue({ select }) },
    }))
    vi.resetModules()
    const api = await import('./productionApi')

    const rows = await api.listInitiatives('org-1')
    const keys = Object.keys(rows[0] ?? {})
    expect(keys).not.toContain('employeeId')
    expect(keys.some((k) => /employee|person|subject/i.test(k))).toBe(false)
    /* And the columns requested from the database say the same thing. */
    expect(select).toHaveBeenCalledWith(expect.not.stringContaining('employee'))
  })

  it('addInitiative inserts with the org id and nulls blank optionals', async () => {
    const single = vi
      .fn()
      .mockResolvedValue({ data: { ...ROW, owner: null, review_date: null }, error: null })
    const select = vi.fn().mockReturnValue({ single })
    const insert = vi.fn().mockReturnValue({ select })
    vi.doMock('@/lib/supabaseClient', () => ({
      supabase: { from: vi.fn().mockReturnValue({ insert }) },
    }))
    vi.resetModules()
    const api = await import('./productionApi')

    await api.addInitiative('org-1', {
      name: 'Manager mental-health training',
      kind: 'training',
      status: 'planned',
      owner: '  ',
      reviewDate: '',
      note: '',
    })
    expect(insert).toHaveBeenCalledWith(
      expect.objectContaining({
        organization_id: 'org-1',
        name: 'Manager mental-health training',
        kind: 'training',
        status: 'planned',
        owner: null,
        review_date: null,
        note: null,
      }),
    )
  })

  it('throws when the client is not configured', async () => {
    vi.doMock('@/lib/supabaseClient', () => ({ supabase: null }))
    vi.resetModules()
    const api = await import('./productionApi')
    await expect(api.listInitiatives('org-1')).rejects.toThrow('Supabase is not configured')
  })
})

describe('overdueReviews', () => {
  const make = (over: Partial<ProductionInitiative>): ProductionInitiative => ({
    id: 'x',
    name: 'n',
    kind: 'other',
    status: 'active',
    owner: null,
    reviewDate: null,
    note: null,
    ...over,
  })

  it('counts a review date in the past', () => {
    const rows = [
      make({ id: 'a', reviewDate: '2026-01-01' }),
      make({ id: 'b', reviewDate: '2027-01-01' }),
    ]
    expect(overdueReviews(rows, '2026-08-02').map((r) => r.id)).toEqual(['a'])
  })

  it('ignores rows with no review date and rows already retired', () => {
    const rows = [
      make({ id: 'a', reviewDate: null }),
      make({ id: 'b', reviewDate: '2026-01-01', status: 'retired' }),
    ]
    expect(overdueReviews(rows, '2026-08-02')).toEqual([])
  })

  it('does not count a review due today', () => {
    expect(overdueReviews([make({ reviewDate: '2026-08-02' })], '2026-08-02')).toEqual([])
  })
})
