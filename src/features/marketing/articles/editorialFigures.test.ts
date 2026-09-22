import { describe, expect, it } from 'vitest'
import { editorialFigureIn, mentionsEditorialFigure } from './editorialFigures'

/**
 * Detector tests for the editorial no-figures rule.
 *
 * These exist because the first version of this guard reused the Advisor's
 * runtime detector, which requires a digit and only recognises weeks and
 * months — so "eight weeks' notice" and "file within 30 days" both passed a
 * check whose stated purpose was to reject exactly those. A detector is only
 * worth what its negative cases prove.
 */

describe('duration figures', () => {
  it.each([
    ['8 weeks of notice', 'digits'],
    ["eight weeks' notice", 'written cardinal'],
    ['file within 30 days', 'a deadline in days'],
    ['retain records for seven years', 'written cardinal + years'],
    ['a 2-week entitlement', 'hyphenated'],
    ['huit semaines de préavis', 'French written cardinal'],
    ['dans les 30 jours', 'French deadline in days'],
    ['trois mois de service continu', 'French months'],
    /* Regressions: every one of these passed the first version of this
       detector, whose cardinal list stopped at sixty, required the unit to
       be adjacent, and had no singular French `an`. */
    ['ninety days to respond', 'tens beyond sixty'],
    ['3 business days', 'qualifier between quantity and unit'],
    ['30 calendar days', 'qualifier between quantity and unit'],
    ['one hundred hours', 'chained cardinals'],
    ['two hundred and fifty hours', 'chained cardinals with "and"'],
    ['une absence de 1 an', 'French singular an'],
    ['a 30-minute meal break', 'ESA eating period, stated in minutes'],
    ['10 jours ouvrables', 'French qualifier follows the unit'],
  ])('flags %j (%s)', (text) => {
    expect(mentionsEditorialFigure(text)).toBe(true)
  })

  it.each([
    ['Notice scales with length of service — check the current schedule.'],
    ['Confirm the deadline against the statute before you rely on it.'],
    ["Le préavis varie selon l'ancienneté; vérifiez le barème applicable."],
    ['Document the decision the same day you make it.'],
    /* The qualifier gap is an allowlist, not "any word or two", so ordinary
       prose that puts a cardinal near a unit does not trip it. */
    ['one of the days that matters most'],
    ['Review it once a year, or whenever the law moves.'],
  ])('leaves figure-free guidance alone: %j', (text) => {
    expect(mentionsEditorialFigure(text)).toBe(false)
  })

  it('does not treat French "un/une" as a count', () => {
    /* Indefinite article before numeral: "des conditions un jour contestées"
       is "someday disputed", not a one-day deadline. This exact phrase is in
       the live corpus. */
    expect(mentionsEditorialFigure('des conditions un jour contestées')).toBe(false)
    expect(mentionsEditorialFigure('une semaine')).toBe(false)
  })
})

describe('monetary figures', () => {
  it.each([
    ['$10,000 per violation', 'symbol prefix'],
    ['jusqu’à 10 000 $ par infraction', 'French symbol suffix'],
    ['10,000 CAD in penalties', 'currency code'],
    ['ten thousand dollars', 'spelled out, no symbol'],
    ['une amende de mille dollars', 'French spelled out'],
  ])('flags %j (%s)', (text) => {
    expect(mentionsEditorialFigure(text)).toBe(true)
  })

  it('leaves unquantified cost language alone', () => {
    expect(mentionsEditorialFigure('Penalties can be significant — see the statute.')).toBe(false)
  })
})

describe('editorialFigureIn', () => {
  it('returns the matched text so a failure can quote it', () => {
    expect(editorialFigureIn('you must give 8 weeks of notice')).toBe('8 weeks')
    expect(editorialFigureIn('nothing quantified here')).toBeNull()
  })
})
