import { describe, expect, it } from 'vitest'
import { mentionsStatutoryFigure } from './statutoryFigures'

describe('mentionsStatutoryFigure', () => {
  it('detects a notice/severance figure in weeks or months', () => {
    expect(mentionsStatutoryFigure("that's about 8 weeks' notice")).toBe(true)
    expect(mentionsStatutoryFigure('roughly 9–12 months of pay in lieu of notice')).toBe(true)
    expect(mentionsStatutoryFigure('the statutory minimum is 2 weeks')).toBe(true)
  })

  it('detects French figures with accents', () => {
    expect(mentionsStatutoryFigure('environ 8 semaines de préavis')).toBe(true)
    expect(mentionsStatutoryFigure('une indemnité de 4 semaines')).toBe(true)
  })

  it('does not fire on a duration without statutory context', () => {
    expect(mentionsStatutoryFigure('she started 3 months ago')).toBe(false)
    expect(mentionsStatutoryFigure('the project ran for 6 weeks')).toBe(false)
  })

  it('does not fire on statutory context without a figure', () => {
    expect(mentionsStatutoryFigure('here is some general guidance on notice')).toBe(false)
    expect(mentionsStatutoryFigure('termination must follow a fair process')).toBe(false)
  })

  /* Widened 2026-08-08 (RAG review): the old detector caught only week/month
     durations — dollar rates, percentages and day counts sailed past it. */
  it('detects dollar figures in statutory context', () => {
    expect(mentionsStatutoryFigure('the minimum wage is $17.60 per hour')).toBe(true)
    expect(mentionsStatutoryFigure('le salaire minimum est de 16,60 $')).toBe(true)
    expect(mentionsStatutoryFigure('a payroll of 2.5 million triggers severance')).toBe(true)
  })

  it('detects percentages in statutory context', () => {
    expect(mentionsStatutoryFigure('vacation pay is 4% of gross wages')).toBe(true)
    expect(mentionsStatutoryFigure('vacation pay of 6 per cent applies')).toBe(true)
    expect(mentionsStatutoryFigure("l'indemnité de vacances est de 4 pour cent")).toBe(true)
  })

  it('detects day-count entitlements in statutory context', () => {
    expect(mentionsStatutoryFigure('entitled to 10 days of leave')).toBe(true)
    expect(mentionsStatutoryFigure('un congé de 3 jours est la norme')).toBe(true)
  })

  it('still requires statutory context for the new patterns', () => {
    expect(mentionsStatutoryFigure('the venue costs $500')).toBe(false)
    expect(mentionsStatutoryFigure('about 20% of the team attended')).toBe(false)
    expect(mentionsStatutoryFigure('the offsite lasted 3 days')).toBe(false)
  })
})
