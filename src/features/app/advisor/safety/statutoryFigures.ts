import { normalizeText } from './text'

/**
 * §5.2 (detection half) — a best-effort, recall-oriented check for whether a
 * reply appears to state a *statutory figure*: a notice/severance duration, a
 * day-count entitlement, a dollar rate or threshold, or a percentage. The
 * jurisdiction/figure gate in `safetyBackstop.ts` uses it to decide whether to
 * harden the legal-basis gate and warn the operator when a figure surfaces
 * before jurisdiction is confirmed.
 *
 * Honest limitation: this inspects the model's *prose*, and a client cannot
 * un-say prose. The definitive control is server-side — the engine withholds
 * figures until jurisdiction is confirmed (AGENT.md §3). This function powers a
 * defense-in-depth layer: gate the structured legal-basis surface off and raise
 * a visible warning, not rewrite the sentence.
 *
 * Precision guard: a number alone ("started 3 months ago", "$40 for parking")
 * is not a statutory figure, so every pattern must co-occur with a
 * statutory-context term. Deliberately excluded: bare year counts — "5 years
 * of service" is tenure context, not an entitlement figure, and flagging it
 * would fire on nearly every termination question.
 */

/** A number (or numeric range) immediately qualifying a duration unit. */
const DURATION = /\b\d{1,2}(?:\s*(?:-|–|to)\s*\d{1,2})?\s*(?:weeks?|months?|semaines?|mois)\b/

/** A day-count entitlement ("10 days", "3 jours"). */
const DAY_COUNT = /\b\d{1,3}(?:\s*(?:-|–|to)\s*\d{1,3})?\s*(?:days?|jours?)\b/

/** A dollar amount ("$17.60", "17,60 $", "2.5 million"). */
const DOLLAR = /(?:\$\s*\d[\d,.]*|\b\d[\d,.]*\s*\$|\b\d[\d,.]*\s*(?:million|millions)\b)/

/** A percentage ("4%", "6 per cent", "4 pour cent", "4 p. 100"). */
const PERCENT = /\b\d{1,3}(?:[.,]\d+)?\s*(?:%|per\s*cent|percent|pour\s*cent|p\.\s*100)/

const FIGURE_PATTERNS: readonly RegExp[] = [DURATION, DAY_COUNT, DOLLAR, PERCENT]

/** Normalized statutory-context terms (accents/apostrophes already stripped). */
const STATUTORY_CONTEXT: readonly string[] = [
  'notice',
  'severance',
  'pay in lieu',
  'termination',
  'statutory',
  'entitlement',
  'minimum',
  'reasonable notice',
  'wage',
  'overtime',
  'vacation',
  'holiday',
  'leave',
  // French
  'preavis',
  'indemnite',
  'cessation',
  'licenciement',
  'delai de conge',
  'norme',
  'salaire',
  'heures supplementaires',
  'vacances',
  'ferie',
  'conge',
]

/** True when `text` appears to state a statutory figure. */
export function mentionsStatutoryFigure(text: string): boolean {
  const normalized = normalizeText(text)
  if (!FIGURE_PATTERNS.some((pattern) => pattern.test(normalized))) return false
  return STATUTORY_CONTEXT.some((term) => normalized.includes(term))
}
