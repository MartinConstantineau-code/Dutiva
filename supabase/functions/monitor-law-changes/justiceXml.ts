/**
 * Reading amendment dates out of Justice Canada's consolidated-statute XML.
 *
 * Federal law is published as bilingual XML at
 * github.com/justicecanada/laws-lois-xml under the Open Government Licence –
 * Canada. That is a strictly better source than the HTML we were hashing:
 *
 *  - `raw.githubusercontent.com` serves plain files, so there is no WAF, no
 *    bot challenge and no JavaScript shell to defeat.
 *  - **The amendment date is in the document.** We read when the Act last
 *    changed instead of inferring it from a content hash, which removes false
 *    positives (a publisher reformats, the hash moves, we cry wolf) and false
 *    negatives (the page is a shell, the hash never moves, we stay silent)
 *    in one go.
 *  - Range requests work, so a check costs ~2 KB rather than the whole
 *    multi-megabyte Act.
 *
 * The root element carries what we need:
 *
 *   <Statute lims:lastAmendedDate="2025-12-12" lims:current-date="2025-12-29" …>
 *     <Identification>
 *       <ShortTitle …>Canada Labour Code</ShortTitle>
 *       <Chapter><ConsolidatedNumber official="yes">L-2</ConsolidatedNumber></Chapter>
 *
 * Deliberately regex over a real XML parser: we only ever read a handful of
 * attributes from the first couple of KB, the document is far too large to
 * parse in full for this, and a parser would pull a dependency into an edge
 * function for no gain.
 */

export interface JusticeStatuteFacts {
  /** `lims:lastAmendedDate` from the root element, `YYYY-MM-DD`. */
  lastAmendedDate: string
  /** `lims:current-date` — when the consolidation itself was last refreshed. */
  currentDate: string | null
  /** e.g. `L-2`. Used to prove we are looking at the Act we think we are. */
  consolidatedNumber: string | null
  shortTitle: string | null
}

/**
 * `lims:lastAmendedDate` also appears on individual `<Section>` elements, so
 * the root attribute must be read from the root's own opening tag — matching
 * the first occurrence anywhere in the document would silently pick up a
 * section's date instead of the Act's.
 */
const ROOT_STATUTE_TAG = /<Statute\b[^>]*>/
const LAST_AMENDED = /\blims:lastAmendedDate\s*=\s*"(\d{4}-\d{2}-\d{2})"/
const CURRENT_DATE = /\blims:current-date\s*=\s*"(\d{4}-\d{2}-\d{2})"/
const CONSOLIDATED_NUMBER = /<ConsolidatedNumber\b[^>]*>([\s\S]*?)<\/ConsolidatedNumber>/
const SHORT_TITLE = /<ShortTitle\b[^>]*>([\s\S]*?)<\/ShortTitle>/

/** Inner text of a captured element, with any nested markup removed. */
function textOf(raw: string | undefined): string | null {
  if (raw === undefined) return null
  const text = raw.replace(/<[^>]+>/g, '').trim()
  return text.length > 0 ? text : null
}

/**
 * Parse the head of a Justice Canada statute document. `xml` may be a partial
 * response (a Range request over the first few KB) — everything read here
 * lives in the `<Identification>` block at the very top.
 *
 * Returns `null` when this is not a statute document or carries no root
 * amendment date, so a caller can never mistake an error page for an Act.
 */
export function parseJusticeStatuteHead(xml: string): JusticeStatuteFacts | null {
  const rootTag = ROOT_STATUTE_TAG.exec(xml)?.[0]
  if (rootTag === undefined) return null

  const lastAmendedDate = LAST_AMENDED.exec(rootTag)?.[1]
  if (lastAmendedDate === undefined) return null

  return {
    lastAmendedDate,
    currentDate: CURRENT_DATE.exec(rootTag)?.[1] ?? null,
    consolidatedNumber: textOf(CONSOLIDATED_NUMBER.exec(xml)?.[1]),
    shortTitle: textOf(SHORT_TITLE.exec(xml)?.[1]),
  }
}

export type JusticeStatuteVerdict =
  | { readonly ok: true; readonly facts: JusticeStatuteFacts }
  | { readonly ok: false; readonly reason: 'unparsable'; readonly detail: string }
  | { readonly ok: false; readonly reason: 'wrong-act'; readonly detail: string }

/**
 * Parse *and* confirm the document is the Act we meant to fetch.
 *
 * The identity check is not paranoia. The Saskatchewan fallback in this very
 * monitor pointed at "Gazette Part II, June 5, 2015" rather than the Employment
 * Act — a wrong-document bug that sat unnoticed because nothing ever checked
 * that the thing fetched was the thing wanted. `ConsolidatedNumber` makes that
 * check free here, so we do it.
 *
 * A document that omits `ConsolidatedNumber` entirely is accepted: the root
 * amendment date is the load-bearing value, and refusing on a missing optional
 * field would fail closed on a correct document.
 */
export function assessJusticeStatute(
  xml: string,
  expectedConsolidatedNumber: string,
): JusticeStatuteVerdict {
  const facts = parseJusticeStatuteHead(xml)
  if (facts === null) {
    return {
      ok: false,
      reason: 'unparsable',
      detail:
        'Response was not a Justice Canada statute document with a root lims:lastAmendedDate attribute.',
    }
  }

  if (
    facts.consolidatedNumber !== null &&
    facts.consolidatedNumber.toUpperCase() !== expectedConsolidatedNumber.toUpperCase()
  ) {
    return {
      ok: false,
      reason: 'wrong-act',
      detail:
        `Expected consolidated number ${expectedConsolidatedNumber} but the document is ` +
        `${facts.consolidatedNumber}${facts.shortTitle ? ` ("${facts.shortTitle}")` : ''}.`,
    }
  }

  return { ok: true, facts }
}

/**
 * Fingerprint stored in `law_page_hashes.content_hash` for XML-sourced laws.
 * Prefixed so it is obvious in the database that this column holds an
 * amendment date for these rows and a SHA-256 for the HTML-scraped ones.
 */
export function amendmentFingerprint(lastAmendedDate: string): string {
  return `amended:${lastAmendedDate}`
}
