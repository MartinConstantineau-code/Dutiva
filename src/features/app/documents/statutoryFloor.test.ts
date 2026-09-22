import { describe, expect, it } from 'vitest'
import { appliesToNoticeField, assessNoticeFloor } from './statutoryFloor'

/** Field ids as they appear on the individual termination letter (t03). */
const T03_FIELDS = ['employee_name', 'tenure_years', 'notice_weeks', 'severance_weeks']
/** Group termination (t15) has notice_weeks but no tenure — headcount-driven. */
const T15_FIELDS = ['affected_headcount', 'notice_weeks']

describe('appliesToNoticeField', () => {
  it('applies to the notice field on the individual termination letter', () => {
    expect(appliesToNoticeField('notice_weeks', T03_FIELDS)).toBe(true)
  })

  it('does NOT apply to group termination, which is headcount-driven', () => {
    /* t15 notice comes from ESA s.58 (how many people), not s.57 (how long
       this person served). Applying the individual schedule there would
       produce a confidently wrong figure in a mass-layoff notice. */
    expect(appliesToNoticeField('notice_weeks', T15_FIELDS)).toBe(false)
  })

  it('does not apply to other fields', () => {
    expect(appliesToNoticeField('severance_weeks', T03_FIELDS)).toBe(false)
    expect(appliesToNoticeField('tenure_years', T03_FIELDS)).toBe(false)
  })
})

describe('assessNoticeFloor — Ontario', () => {
  it('flags a figure below the statutory minimum', () => {
    /* 6 years of service is a 6-week floor under ESA s.57; 2 weeks is short. */
    expect(assessNoticeFloor('ON', '6', '2')).toEqual({
      kind: 'below',
      floorWeeks: 6,
      enteredWeeks: 2,
    })
  })

  it('accepts a figure that meets the minimum exactly', () => {
    expect(assessNoticeFloor('ON', '6', '6')).toEqual({
      kind: 'meets',
      floorWeeks: 6,
      enteredWeeks: 6,
    })
  })

  it('accepts a figure well above the minimum without complaint', () => {
    /* Common-law reasonable notice routinely exceeds the floor by a lot. A
       generous employer must never be nagged for it. */
    expect(assessNoticeFloor('ON', '6', '52').kind).toBe('meets')
  })

  it('shows the floor as guidance before anything is entered', () => {
    expect(assessNoticeFloor('ON', '3', '')).toEqual({ kind: 'informational', floorWeeks: 3 })
    expect(assessNoticeFloor('ON', '3', undefined)).toEqual({
      kind: 'informational',
      floorWeeks: 3,
    })
  })

  it('counts completed years, not rounded ones', () => {
    /* 6.9 years is six completed years — a 6-week floor. Rounding up would
       overstate what the statute requires and put words in the ESA's mouth. */
    expect(assessNoticeFloor('ON', '6.9', '6').kind).toBe('meets')
    expect(assessNoticeFloor('ON', '6.9', '6')).toMatchObject({ floorWeeks: 6 })
  })

  it('handles the bottom of the schedule', () => {
    /* Under 3 months completed: no statutory notice. Zero entered is fine. */
    expect(assessNoticeFloor('ON', '0.1', '0')).toEqual({
      kind: 'meets',
      floorWeeks: 0,
      enteredWeeks: 0,
    })
  })

  it('caps at the statutory maximum of eight weeks', () => {
    expect(assessNoticeFloor('ON', '30', '8').kind).toBe('meets')
    expect(assessNoticeFloor('ON', '30', '7')).toMatchObject({ kind: 'below', floorWeeks: 8 })
  })
})

describe('assessNoticeFloor — jurisdictions without a reviewed schedule', () => {
  it('hedges for Quebec rather than inventing a figure', () => {
    /* QC/FED bands are deliberately null pending qualified legal review. */
    expect(assessNoticeFloor('QC', '6', '2')).toEqual({ kind: 'unavailable' })
  })

  it('hedges for Federal', () => {
    expect(assessNoticeFloor('FED', '6', '2')).toEqual({ kind: 'unavailable' })
  })

  it('never reports "below" where there is no grounded floor', () => {
    /* The dangerous failure would be treating an absent schedule as a zero
       floor, which silently converts "we don't know" into "nothing is owed". */
    for (const jurisdiction of ['QC', 'FED'] as const) {
      expect(assessNoticeFloor(jurisdiction, '10', '0').kind).toBe('unavailable')
    }
  })
})

describe('assessNoticeFloor — unusable input', () => {
  it('reports unknown tenure rather than guessing', () => {
    expect(assessNoticeFloor('ON', '', '4')).toEqual({ kind: 'unknown-tenure' })
    expect(assessNoticeFloor('ON', undefined, '4')).toEqual({ kind: 'unknown-tenure' })
    expect(assessNoticeFloor('ON', 'six', '4')).toEqual({ kind: 'unknown-tenure' })
    expect(assessNoticeFloor('ON', '-2', '4')).toEqual({ kind: 'unknown-tenure' })
  })

  it('treats an unparseable notice figure as nothing entered yet', () => {
    expect(assessNoticeFloor('ON', '6', 'two')).toEqual({ kind: 'informational', floorWeeks: 6 })
  })

  it('tolerates surrounding whitespace', () => {
    expect(assessNoticeFloor('ON', ' 6 ', ' 6 ').kind).toBe('meets')
  })
})
