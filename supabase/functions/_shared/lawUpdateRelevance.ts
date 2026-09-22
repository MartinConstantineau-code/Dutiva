/**
 * Which `law_updates` rows are a *law change a customer should hear about*,
 * as opposed to an entry in an operational log.
 *
 * The monitor writes four event types and watches 14 jurisdictions, but only a
 * narrow slice of that is meaningful to a customer. Getting the filter wrong is
 * not a cosmetic problem: `broken` events describe **our** infrastructure
 * failing, and a compliance product that emails customers about its own broken
 * scrapers has told them something alarming and useless. Equally, telling an
 * Ontario employer about a Yukon amendment is noise that trains them to ignore
 * the channel — which is worse than silence, because the one message that
 * matters arrives in a stream they have stopped reading.
 *
 * So this module answers one question — "is this row a real, supported,
 * customer-relevant law change?" — and answers it the same way for every
 * consumer, whether that is an email digest, an in-app badge, or a filter on
 * the Knowledge panel.
 *
 * It is deliberately free of any opinion about *who* gets told or *how*. Those
 * are open decisions (docs/LAW_CHANGE_NOTIFICATIONS.md); this is the part that
 * is true regardless of how they are settled.
 */

/**
 * Mirrors the `Jurisdiction` union in
 * `src/features/app/documents/data/types.ts`. Duplicated rather than imported
 * because edge functions cannot reach into `src/`; the test below pins the two
 * lists together so a divergence fails rather than drifts.
 */
export type SupportedJurisdiction = 'ON' | 'QC' | 'FED'

/**
 * `law_updates.jurisdiction` holds the monitor's own display names
 * ("Ontario", "Federal"), not the product's codes. Nothing mapped between the
 * two before this, which is why no consumer could ask "does this concern a
 * jurisdiction we actually support?".
 *
 * Only the three supported jurisdictions appear here. The other eleven the
 * monitor watches are intentionally absent: monitoring is wider than coverage
 * (docs/CANONICAL_FACTS.md), and an unmapped jurisdiction is precisely one we
 * must not surface as though we support it.
 */
const MONITOR_NAME_TO_CODE: Readonly<Record<string, SupportedJurisdiction>> = {
  ontario: 'ON',
  quebec: 'QC',
  québec: 'QC',
  federal: 'FED',
}

/**
 * The product's jurisdiction code for a monitor jurisdiction name, or `null`
 * when Dutiva does not support it.
 *
 * `null` means "not ours to talk about" — never "unknown, pass it through".
 * Failing open here would leak eleven unsupported jurisdictions into a
 * customer-facing channel.
 */
export function toSupportedJurisdiction(
  monitorJurisdiction: string | null | undefined,
): SupportedJurisdiction | null {
  if (typeof monitorJurisdiction !== 'string') return null
  return MONITOR_NAME_TO_CODE[monitorJurisdiction.trim().toLowerCase()] ?? null
}

/**
 * Event types the monitor writes. Only one of them is a law changing.
 *
 * - `change`     — the legislation moved. The only customer-facing event.
 * - `first_seen` — we started watching a page. Says nothing about the law.
 * - `redirect`   — the government moved a URL. Our plumbing, not their duty.
 * - `broken`     — our source failed. Operationally urgent, but it is a report
 *                  about Dutiva, and it must never reach a customer as though
 *                  it were legal news.
 */
export const CUSTOMER_FACING_EVENT_TYPES: readonly string[] = ['change']

export function isLawChangeEvent(eventType: string | null | undefined): boolean {
  return typeof eventType === 'string' && CUSTOMER_FACING_EVENT_TYPES.includes(eventType)
}

/** The subset of a `law_updates` row this module needs. */
export interface LawUpdateLike {
  jurisdiction: string | null
  eventType: string | null
}

export interface RelevanceVerdict {
  /** True only for a real law change in a supported jurisdiction. */
  relevant: boolean
  /** Resolved code when supported, else `null`. */
  jurisdiction: SupportedJurisdiction | null
  /** Why it was rejected — for logging and for tests that assert intent. */
  reason: 'relevant' | 'unsupported-jurisdiction' | 'not-a-law-change'
}

/**
 * Is this row something a customer should be told about at all?
 *
 * Note the ordering: jurisdiction is checked first, so an operational event in
 * an unsupported jurisdiction reports `unsupported-jurisdiction`. Either
 * rejection is correct; the first is the more fundamental fact about the row.
 */
export function assessLawUpdate(update: LawUpdateLike): RelevanceVerdict {
  const jurisdiction = toSupportedJurisdiction(update.jurisdiction)
  if (jurisdiction === null) {
    return { relevant: false, jurisdiction: null, reason: 'unsupported-jurisdiction' }
  }
  if (!isLawChangeEvent(update.eventType)) {
    return { relevant: false, jurisdiction, reason: 'not-a-law-change' }
  }
  return { relevant: true, jurisdiction, reason: 'relevant' }
}

/**
 * Narrow a batch to what a recipient covering `jurisdictions` should hear
 * about. An empty `jurisdictions` set yields nothing — a recipient with no
 * jurisdiction on file is not a recipient for everything, they are a recipient
 * for nothing until someone establishes which jurisdiction they are in.
 */
export function selectRelevantUpdates<T extends LawUpdateLike>(
  updates: readonly T[],
  jurisdictions: readonly SupportedJurisdiction[],
): T[] {
  const wanted = new Set(jurisdictions)
  if (wanted.size === 0) return []
  return updates.filter((update) => {
    const verdict = assessLawUpdate(update)
    return verdict.relevant && verdict.jurisdiction !== null && wanted.has(verdict.jurisdiction)
  })
}
