import { describe, expect, it } from 'vitest'
import {
  crossCheckNoticeFigure,
  extractNoticeWeeksClaims,
  extractTenureMonths,
} from './statutoryCrossCheck'

describe('extractTenureMonths', () => {
  it('reads years, months, and combined phrasings with tenure context', () => {
    expect(extractTenureMonths('an employee with 4 years of service')).toBe(48)
    expect(extractTenureMonths('employed for 18 months')).toBe(18)
    expect(extractTenureMonths('after 2 years and 6 months with us')).toBe(30)
    expect(extractTenureMonths('elle travaille ici depuis 5 ans')).toBe(60)
    expect(extractTenureMonths('en poste depuis 7 mois')).toBe(7)
  })

  it('reads the hyphenated employee form the review found inert', () => {
    expect(extractTenureMonths('how much notice do I owe a 4-year employee?')).toBe(48)
  })

  it('handles decimal years', () => {
    expect(extractTenureMonths('about 2.5 years of employment')).toBe(30)
  })

  it('requires tenure context — a notice period is not tenure', () => {
    /* The review's executed counterexample: the contractual notice period
       was read as tenure and produced a fabricated mismatch. */
    expect(extractTenureMonths('her contract promises 2 months of notice')).toBeNull()
    expect(extractTenureMonths('she is 3 months pregnant')).toBeNull()
    expect(extractTenureMonths('6 weeks of vacation over 12 months')).toBeNull()
  })

  it('pools all texts and returns null on any ambiguity', () => {
    expect(extractTenureMonths('we want to terminate an employee')).toBeNull()
    /* Same-unit ambiguity. */
    expect(
      extractTenureMonths('one has 3 years of service, the other 7 years of service'),
    ).toBeNull()
    /* Mixed-unit ambiguity — the first version silently dropped the months
       tenure and checked against the wrong employee. */
    expect(
      extractTenureMonths(
        'One employee has 5 years of service, the other has 6 months of service.',
      ),
    ).toBeNull()
    /* Cross-text conflict: a user duration must not override the reply's
       explicit tenure — conflicting values mean no check at all. */
    expect(
      extractTenureMonths(
        'He has been employed for 12 months.',
        'With 8 years of service, the ESA minimum is 8 weeks of notice.',
      ),
    ).toBeNull()
    /* Cross-text agreement is not ambiguity. */
    expect(
      extractTenureMonths(
        'An employee with 4 years of service.',
        'For 4 years of service the ESA minimum is 4 weeks of notice.',
      ),
    ).toBe(48)
  })
})

describe('extractNoticeWeeksClaims', () => {
  it('reads single figures and ranges with the notice noun adjacent', () => {
    expect(extractNoticeWeeksClaims('the ESA minimum is 4 weeks of notice')).toEqual([
      { min: 4, max: 4 },
    ])
    expect(extractNoticeWeeksClaims('expect 8 to 12 weeks of notice at common law')).toEqual([
      { min: 8, max: 12 },
    ])
    /* "between X and Y" — the connector the first version could not parse
       (it read only the Y and reported a false range collapse). */
    expect(extractNoticeWeeksClaims('expect between 4 and 8 weeks of notice')).toEqual([
      { min: 4, max: 8 },
    ])
    /* Noun-first order, both languages. */
    expect(extractNoticeWeeksClaims('a notice period of 8 weeks applies')).toEqual([
      { min: 8, max: 8 },
    ])
    expect(extractNoticeWeeksClaims('un préavis de 8 semaines est requis')).toEqual([
      { min: 8, max: 8 },
    ])
  })

  it('ignores week figures that are not notice claims', () => {
    expect(extractNoticeWeeksClaims('the project will take 6 weeks')).toEqual([])
    /* The review's executed counterexample: a correct pregnancy-leave
       duration was flagged as a wrong notice figure because "notice"
       appeared elsewhere in the reply. Adjacency is required now. */
    expect(
      extractNoticeWeeksClaims(
        'You cannot terminate her for taking pregnancy leave, which runs up to 17 weeks. Give proper notice.',
      ),
    ).toEqual([])
    expect(
      extractNoticeWeeksClaims('She accrues 3 weeks of vacation; give notice as required.'),
    ).toEqual([])
  })
})

describe('crossCheckNoticeFigure', () => {
  it('confirms a correct Ontario figure', () => {
    expect(
      crossCheckNoticeFigure({
        jurisdiction: 'ON',
        userMessage: 'Terminating an employee with 4 years of service in Ontario.',
        reply: 'Under the ESA the statutory minimum is 4 weeks of notice.',
      }),
    ).toEqual({ verdict: 'consistent', expectedWeeks: 4 })
  })

  it('flags a wrong Ontario figure with both numbers', () => {
    expect(
      crossCheckNoticeFigure({
        jurisdiction: 'ON',
        userMessage: 'Terminating an employee with 4 years of service.',
        reply: 'The ESA requires 6 weeks of notice.',
      }),
    ).toEqual({ verdict: 'mismatch', expectedWeeks: 4, statedWeeks: 6 })
  })

  it('accepts a range that covers the statutory floor', () => {
    expect(
      crossCheckNoticeFigure({
        jurisdiction: 'ON',
        userMessage: 'An employee with 4 years of service.',
        reply: 'Statutory notice is 4 weeks; common-law notice could be 4 to 16 weeks.',
      }).verdict,
    ).toBe('consistent')
  })

  it('is unverifiable without tenure, without a claim, or on an unencoded schedule', () => {
    expect(
      crossCheckNoticeFigure({
        jurisdiction: 'ON',
        userMessage: 'How much notice do I owe?',
        reply: 'Roughly 8 weeks of notice.',
      }).verdict,
    ).toBe('unverifiable')
    expect(
      crossCheckNoticeFigure({
        jurisdiction: 'ON',
        userMessage: 'An employee with 4 years of service.',
        reply: 'Follow a fair, documented process.',
      }).verdict,
    ).toBe('unverifiable')
    /* QC bands are null pending legal review — never a guessed check. */
    expect(
      crossCheckNoticeFigure({
        jurisdiction: 'QC',
        userMessage: 'An employee with 4 years of service in Quebec.',
        reply: 'The LNT requires 2 weeks of notice.',
      }).verdict,
    ).toBe('unverifiable')
  })

  it('reads tenure from the reply when the message lacks it', () => {
    expect(
      crossCheckNoticeFigure({
        jurisdiction: 'ON',
        userMessage: 'What notice does she get?',
        reply: 'With 6 years of service, the ESA minimum is 6 weeks of notice.',
      }).verdict,
    ).toBe('consistent')
  })

  it('does not false-alarm on a correct reply mentioning leave durations', () => {
    /* The review's executed counterexample, end to end. */
    expect(
      crossCheckNoticeFigure({
        jurisdiction: 'ON',
        userMessage: 'My employee has 4 years of service and is pregnant — can I terminate her?',
        reply:
          'You cannot terminate her for taking pregnancy leave, which runs up to 17 weeks. Give proper notice.',
      }).verdict,
    ).toBe('unverifiable')
  })

  it('reports the claim nearest the expected value on mismatch', () => {
    expect(
      crossCheckNoticeFigure({
        jurisdiction: 'ON',
        userMessage: 'An employee with 4 years of service.',
        reply: 'Common law suggests 10 to 12 weeks of notice; the statutory notice is 6 weeks.',
      }),
    ).toEqual({ verdict: 'mismatch', expectedWeeks: 4, statedWeeks: 6 })
  })
})
