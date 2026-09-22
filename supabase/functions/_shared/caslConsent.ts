/**
 * The CASL consent record for the beta waiting list.
 *
 * The signup already *asks* correctly: the checkbox is express rather than
 * implied, the client refuses to submit without it, and `create-beta-signup`
 * rejects a submission whose `consent` is not `true`. What was missing is the
 * record — `beta_signups` had nowhere to store the answer, so consent was
 * validated and then dropped.
 *
 * That gap matters because **CASL places the burden of proving consent on the
 * sender.** Consent nobody wrote down is not consent that can be produced when
 * asked. Proving it means showing three things together:
 *
 *   1. that the person agreed (`consent_granted`),
 *   2. **what wording they agreed to** (`consent_text`),
 *   3. when (`consent_at`).
 *
 * (2) is the one that is easy to lose. The sentence on the form will be edited
 * eventually, and a record that says only "consented" cannot then establish
 * what was actually on screen at the time. So the exact string is stored with
 * the row, not a reference to a string that will change underneath it.
 *
 * **The wording lives here, on the server, not in the request.** A client
 * could otherwise submit whatever text it liked and the "evidence" would be
 * whatever the sender was handed — which is not evidence. The copy below is
 * pinned to the i18n source by `caslConsent.test.ts`, so the two cannot drift
 * apart silently.
 */

export type ConsentLocale = 'en' | 'fr'

/**
 * Verbatim `landing_cta_consent_label` (`src/i18n/messages/landing.ts`) — the
 * checkbox the visitor actually ticks. The accompanying privacy line is not
 * the consent and is deliberately not recorded as though it were.
 *
 * Do not edit these strings alone. They are a copy of user-facing copy, and
 * the test that pins them to i18n is what makes that copy trustworthy as a
 * record.
 */
export const CASL_CONSENT_TEXT: Readonly<Record<ConsentLocale, string>> = {
  en: 'Yes, email me product updates about Dutiva. I can unsubscribe at any time.',
  fr: 'Oui, envoyez-moi des mises à jour sur Dutiva. Je peux me désabonner en tout temps.',
}

export interface ConsentRecord {
  consent_granted: boolean
  consent_text: string
  consent_at: string
}

/**
 * Build the record to store alongside a signup.
 *
 * `nowIso` is injected rather than read from the clock so the caller controls
 * the timestamp and tests are deterministic.
 */
export function buildConsentRecord(locale: ConsentLocale, nowIso: string): ConsentRecord {
  return {
    consent_granted: true,
    consent_text: CASL_CONSENT_TEXT[locale],
    consent_at: nowIso,
  }
}
