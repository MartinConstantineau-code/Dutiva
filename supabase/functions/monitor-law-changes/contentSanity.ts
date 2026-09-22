/**
 * Does this response actually look like legislation?
 *
 * The monitor used to treat any HTTP 200 as a successful check and hash
 * whatever came back. Three real cases break that assumption, and all three
 * fail *silently* — the page is recorded as healthy and reports "no change"
 * forever, which is worse than a visible outage because the dashboard says
 * everything is fine:
 *
 *  1. **WAF rejection served as 200.** nslegislature.ca answers a blocked
 *     request with `HTTP 200` and a 244-byte "Request Rejected" body.
 *  2. **JavaScript app shells.** ontario.ca/laws/statute/* now returns a
 *     client-rendered shell. After tag-stripping, all three monitored Ontario
 *     statutes reduce to the *same* 422 characters of boilerplate containing
 *     no statute text — so an ESA amendment could never change the hash, and a
 *     routine redeploy of Ontario's website would fire a false "change".
 *  3. **Bot interstitials.** Cloudflare's "Just a moment..." challenge and
 *     CloudFront's "request could not be satisfied" page, which some sites
 *     return with a 2xx once cached.
 *
 * So a fetch is only a real check if the extracted text is long enough to be a
 * statute and doesn't carry a block-page signature. Anything else is reported
 * as a failure with a reason, which routes it into the existing broken-page
 * handling and makes it visible.
 *
 * Deliberately not exhaustive: this catches "we clearly did not receive
 * legislation", not "this is the wrong statute". Ambiguity resolves toward
 * accepting the content — a false "broken" is noise, but it is loud noise, and
 * the cost of being wrong here is only a spurious alert.
 */

/**
 * Minimum extracted-text length for a plausible statute page.
 *
 * Calibrated against observed reality rather than guessed: the Ontario app
 * shell yields 422 characters and the Nova Scotia WAF page well under 200,
 * while the shortest genuine statute in the monitored set runs to tens of
 * thousands. 2000 sits in the wide empty gap between those, far enough above
 * the block pages to be decisive and far enough below real content that no
 * legitimate page is at risk.
 */
export const MIN_STATUTE_TEXT_LENGTH = 2000

/**
 * Phrases that only ever appear on block/challenge pages, never in employment
 * legislation. Matched case-insensitively against the extracted text.
 *
 * Each is a distinctive multi-word phrase rather than a single word like
 * "forbidden" or "denied", which do appear in statutes (e.g. prohibitions on
 * reprisal) and would produce false positives.
 */
export const BLOCK_PAGE_SIGNATURES: readonly string[] = [
  /* F5/BIG-IP ASM — what nslegislature.ca returns, with HTTP 200. The full
     sentence, not the bare "request rejected" heading: statutes do write
     "the request is rejected" in administrative-procedure clauses. */
  'the requested url was rejected',
  'your support id is',
  /* CloudFront — legisquebec.gouv.qc.ca. */
  'the request could not be satisfied',
  /* Cloudflare challenge — legislation.yukon.ca, nunavutlegislation.ca. */
  'just a moment',
  'checking your browser before accessing',
  'enable javascript and cookies to continue',
  'verify you are human',
  /* Generic interstitials. */
  'access to this page has been denied',
  'please complete the security check',
]

export type ContentVerdict =
  | { readonly ok: true }
  | { readonly ok: false; readonly reason: 'block-page'; readonly detail: string }
  | { readonly ok: false; readonly reason: 'too-short'; readonly detail: string }

/**
 * Judge already-extracted page text (the same string the monitor hashes).
 *
 * Signature matching runs first so a block page is reported as what it is
 * rather than merely "short" — the two call for different remedies. A block
 * means the host is refusing this client; short usually means the URL now
 * serves an app shell and needs a different source format.
 */
export function assessLegislationText(text: string): ContentVerdict {
  const normalized = text.toLowerCase()

  for (const signature of BLOCK_PAGE_SIGNATURES) {
    if (normalized.includes(signature)) {
      return {
        ok: false,
        reason: 'block-page',
        detail: `Response carried a block-page signature ("${signature}") instead of legislation text.`,
      }
    }
  }

  if (text.trim().length < MIN_STATUTE_TEXT_LENGTH) {
    return {
      ok: false,
      reason: 'too-short',
      detail:
        `Extracted only ${text.trim().length} characters of text (minimum ${MIN_STATUTE_TEXT_LENGTH}). ` +
        'The URL most likely now serves a JavaScript-rendered page whose statute text never reaches a server-side fetch.',
    }
  }

  return { ok: true }
}
