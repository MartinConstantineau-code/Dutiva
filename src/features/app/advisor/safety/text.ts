/**
 * Locale-tolerant text normalization for the Advisor safety backstop.
 *
 * Kept local to this module on purpose: the safety layer is deliberately
 * self-contained and auditable, so it does not depend on the Help Centre
 * search util (`support/help/helpSearch.ts#normalizeText`) even though the
 * two are intentionally parallel. In addition to lowercasing and stripping
 * diacritics, apostrophes are dropped so "can't" matches "cant" and the
 * French elision "n'est" matches "nest".
 */
export function normalizeText(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '') // strip combining diacritics
    .replace(/[‘’'`]/g, '') // drop apostrophes/backticks
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim()
}
