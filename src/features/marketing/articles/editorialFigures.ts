/**
 * Editorial figure detector — the enforcement half of the rule stated in
 * `articleModel.ts`: public articles explain concepts and decision points, and
 * deliberately publish **no statutory figures** (notice-week tables, dollar
 * thresholds, deadline counts).
 *
 * ## Why this is not `advisor/safety/statutoryFigures.ts`
 *
 * That module inspects *model prose at runtime* and feeds a safety gate, so it
 * is tuned for precision: it requires a digit, only recognises weeks/months,
 * and demands a co-occurring statutory term, because a false positive there
 * hardens a legal-basis gate against a customer mid-conversation.
 *
 * This module inspects *authored prose at build time*, where the trade-off
 * inverts. A false positive costs an author one rephrase, caught in CI before
 * anything ships; a false negative puts a wrong statutory figure on a
 * prerendered, answer-engine-indexed page where it gets quoted onward without
 * the disclaimer sitting next to it. So this detector is deliberately stricter
 * on all three axes the runtime one is lenient about:
 *
 *   - **written cardinals**, not just digits — "eight weeks' notice" is the
 *     same claim as "8 weeks' notice";
 *   - **days, years and hours**, not just weeks and months — the rule names
 *     deadline counts, and "file within 30 days" is exactly that;
 *   - **no statutory-context requirement** — in HR editorial prose a
 *     quantified duration is nearly always a statutory reference, and the
 *     articles are written to avoid them entirely, so the bare pattern is the
 *     rule rather than an approximation of it.
 *
 * If an article genuinely needs a figure, that is a decision to make out loud:
 * change the rule in `articleModel.ts` and these tests together, rather than
 * letting one article quietly become the exception.
 */

/**
 * Written cardinals that can quantify a duration.
 *
 * French `un`/`une` are deliberately absent: they are indefinite articles
 * before they are numerals, so including them flags ordinary prose — the
 * corpus phrase "des conditions un jour contestées" ("someday disputed") is
 * not a deadline count. `deux` onward carry no such ambiguity.
 */
const CARDINALS = [
  // English
  'one',
  'two',
  'three',
  'four',
  'five',
  'six',
  'seven',
  'eight',
  'nine',
  'ten',
  'eleven',
  'twelve',
  'thirteen',
  'fourteen',
  'fifteen',
  'sixteen',
  'seventeen',
  'eighteen',
  'nineteen',
  'twenty',
  'thirty',
  'forty',
  'fifty',
  'seventy',
  'eighty',
  'ninety',
  'hundred',
  'thousand',
  'sixty',
  // French
  'deux',
  'trois',
  'quatre',
  'cinq',
  'sept',
  'huit',
  'neuf',
  'dix',
  'onze',
  'douze',
  'treize',
  'quatorze',
  'quinze',
  'seize',
  'vingt',
  'trente',
  'quarante',
  'cinquante',
  'soixante',
  'cent',
  'cents',
  'mille',
]

/**
 * Words allowed between the quantity and the unit.
 *
 * English puts the qualifier in front of the noun ("3 business days"), which
 * would otherwise break adjacency and let a deadline count through. French
 * puts it after ("10 jours ouvrables"), so the quantity and unit are already
 * adjacent there and no French entries are needed.
 *
 * An allowlist rather than "any word or two": a general gap would match "one
 * of the days" and similar ordinary prose.
 */
const QUALIFIERS = [
  'business',
  'working',
  'work',
  'calendar',
  'consecutive',
  'clear',
  'full',
  'additional',
  'further',
  'regular',
  'complete',
  'paid',
  'unpaid',
]

/** Duration units a statutory entitlement or deadline is measured in. */
const UNITS = [
  'weeks?',
  'months?',
  'days?',
  'years?',
  'hours?',
  /* Minutes matter: the ESA's eating-period entitlement is stated in them,
     so "a 30-minute break" is a statutory figure like any other. */
  'minutes?',
  /* French. Singular `an` is included so "1 an" is caught; a unit is only
     ever reached directly after a quantity, so the English article "an"
     cannot match on its own. */
  'semaines?',
  'mois',
  'jours?',
  'ans?',
  'ann[ée]es?',
  'heures?',
]

/**
 * A quantity: digits, or a chain of cardinals ("one hundred", "seventy-five",
 * "deux cents").
 *
 * Chained rather than enumerated because a flat list is always one compound
 * away from a hole — the first version of this file stopped at sixty and let
 * "ninety days" and "one hundred hours" straight through.
 */
const CARDINAL = `(?:${CARDINALS.join('|')})`
const QUANTITY = `(?:\\d{1,4}|${CARDINAL}(?:[\\s-]+(?:(?:and|et)[\\s-]+)?${CARDINAL})*)`

/** Allowlisted qualifiers sitting between the quantity and the unit. */
const GAP = `(?:[\\s-]+(?:${QUALIFIERS.join('|')}))*[\\s-]*`

const DURATION = new RegExp(`\\b${QUANTITY}${GAP}(?:${UNITS.join('|')})\\b`, 'i')

/**
 * Money in any form the corpus could plausibly use.
 *
 * Both symbol positions matter: Canadian French writes the amount first
 * (`10 000 $`, often with a non-breaking space), English writes `$10,000`.
 * `CAD` and the spelled-out word cover "10,000 CAD" and "ten thousand
 * dollars", neither of which carries a symbol at all.
 */
const MONETARY = /\$|\bCAD\b|\bdollars?\b/i

/** The matched figure, or `null` — returned so failures can quote the text. */
export function editorialFigureIn(text: string): string | null {
  return text.match(DURATION)?.[0] ?? text.match(MONETARY)?.[0] ?? null
}

/** True when `text` publishes a duration or monetary figure. */
export function mentionsEditorialFigure(text: string): boolean {
  return editorialFigureIn(text) !== null
}
