import { describe, expect, it } from 'vitest'
import { lookupStatutoryNoticeWeeks } from './statutoryNotice'

describe('lookupStatutoryNoticeWeeks (Ontario ESA s.57)', () => {
  it('returns 0 weeks below the 3-month threshold', () => {
    expect(lookupStatutoryNoticeWeeks('ON', 0)).toBe(0)
    expect(lookupStatutoryNoticeWeeks('ON', 2)).toBe(0)
  })

  it('steps up one week per statutory band', () => {
    expect(lookupStatutoryNoticeWeeks('ON', 3)).toBe(1) // 3 months
    expect(lookupStatutoryNoticeWeeks('ON', 12)).toBe(2) // 1 year
    expect(lookupStatutoryNoticeWeeks('ON', 40)).toBe(3) // 3+ years
    expect(lookupStatutoryNoticeWeeks('ON', 84)).toBe(7) // 7 years
  })

  it('caps at the 8-week statutory maximum', () => {
    expect(lookupStatutoryNoticeWeeks('ON', 96)).toBe(8)
    expect(lookupStatutoryNoticeWeeks('ON', 400)).toBe(8)
  })

  it('fails safe to null for invalid tenure', () => {
    expect(lookupStatutoryNoticeWeeks('ON', -1)).toBeNull()
    expect(lookupStatutoryNoticeWeeks('ON', Number.NaN)).toBeNull()
  })

  it('returns null for schedules not yet encoded (QC, FED)', () => {
    expect(lookupStatutoryNoticeWeeks('QC', 60)).toBeNull()
    expect(lookupStatutoryNoticeWeeks('FED', 60)).toBeNull()
  })
})
