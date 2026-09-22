import { afterEach, describe, expect, it, vi } from 'vitest'
import { deltaFromMidpoint } from './productionApi'
import type { ProductionCompensationRecord } from './productionApi'

/** Same per-test client mock + fresh import pattern as the other productionApi tests. */
describe('compensation productionApi', () => {
  afterEach(() => {
    vi.doUnmock('@/lib/supabaseClient')
    vi.resetModules()
  })

  const ROW = {
    id: 'rec-1',
    employee_id: 'emp-1',
    /* numeric(12,2) arrives from PostgREST as a string, not a number. */
    base_salary: '82000.00',
    band: 'B3',
    band_midpoint: '90000.00',
    effective_date: '2026-01-01',
    note: null,
    employees: { name: 'Dana Okonjo' },
  }

  it('listCompensationRecords parses numerics and flattens the employee name', async () => {
    const order = vi.fn().mockResolvedValue({ data: [ROW], error: null })
    const eq = vi.fn().mockReturnValue({ order })
    const select = vi.fn().mockReturnValue({ eq })
    vi.doMock('@/lib/supabaseClient', () => ({
      supabase: { from: vi.fn().mockReturnValue({ select }) },
    }))
    vi.resetModules()
    const api = await import('./productionApi')

    const rows = await api.listCompensationRecords('org-1')
    expect(eq).toHaveBeenCalledWith('organization_id', 'org-1')
    expect(rows).toEqual([
      {
        id: 'rec-1',
        employeeId: 'emp-1',
        employeeName: 'Dana Okonjo',
        baseSalary: 82000,
        band: 'B3',
        bandMidpoint: 90000,
        effectiveDate: '2026-01-01',
        note: null,
      },
    ])
  })

  it('accepts the array shape PostgREST can return for the embedded employee', async () => {
    const order = vi
      .fn()
      .mockResolvedValue({ data: [{ ...ROW, employees: [{ name: 'Dana Okonjo' }] }], error: null })
    const select = vi.fn().mockReturnValue({ eq: vi.fn().mockReturnValue({ order }) })
    vi.doMock('@/lib/supabaseClient', () => ({
      supabase: { from: vi.fn().mockReturnValue({ select }) },
    }))
    vi.resetModules()
    const api = await import('./productionApi')

    const rows = await api.listCompensationRecords('org-1')
    expect(rows[0]?.employeeName).toBe('Dana Okonjo')
  })

  it('addCompensationRecord nulls an empty midpoint rather than sending 0', async () => {
    const single = vi.fn().mockResolvedValue({ data: { ...ROW, band_midpoint: null }, error: null })
    const select = vi.fn().mockReturnValue({ single })
    const insert = vi.fn().mockReturnValue({ select })
    vi.doMock('@/lib/supabaseClient', () => ({
      supabase: { from: vi.fn().mockReturnValue({ insert }) },
    }))
    vi.resetModules()
    const api = await import('./productionApi')

    const created = await api.addCompensationRecord('org-1', {
      employeeId: 'emp-1',
      baseSalary: 82000,
      band: '  ',
      bandMidpoint: '',
      effectiveDate: '',
      note: '',
    })
    /* A 0 midpoint would divide into a nonsense delta; empty means "no
       comparison", which is a different thing from "midpoint is zero". */
    expect(insert).toHaveBeenCalledWith(
      expect.objectContaining({
        organization_id: 'org-1',
        employee_id: 'emp-1',
        base_salary: 82000,
        band: null,
        band_midpoint: null,
        effective_date: null,
        note: null,
      }),
    )
    expect(created.bandMidpoint).toBeNull()
  })

  it('throws when the client is not configured', async () => {
    vi.doMock('@/lib/supabaseClient', () => ({ supabase: null }))
    vi.resetModules()
    const api = await import('./productionApi')
    await expect(api.listCompensationRecords('org-1')).rejects.toThrow('Supabase is not configured')
  })
})

describe('deltaFromMidpoint', () => {
  const base: ProductionCompensationRecord = {
    id: 'rec-1',
    employeeId: 'emp-1',
    employeeName: 'Dana Okonjo',
    baseSalary: 90000,
    band: 'B3',
    bandMidpoint: 100000,
    effectiveDate: null,
    note: null,
  }

  it('is a percentage against the employer’s own midpoint', () => {
    expect(deltaFromMidpoint(base)).toBe(-10)
    expect(deltaFromMidpoint({ ...base, baseSalary: 110000 })).toBe(10)
    expect(deltaFromMidpoint({ ...base, baseSalary: 100000 })).toBe(0)
  })

  /* The whole point of the production rewrite: there is no market figure, so
     a record without a midpoint has NO comparison. Returning 0 here would
     render as "exactly at midpoint" — a claim the employer never made. */
  it('returns null when no midpoint was supplied — not zero', () => {
    expect(deltaFromMidpoint({ ...base, bandMidpoint: null })).toBeNull()
    expect(deltaFromMidpoint({ ...base, bandMidpoint: 0 })).toBeNull()
  })
})
