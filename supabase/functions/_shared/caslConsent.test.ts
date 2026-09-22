import { describe, expect, it } from 'vitest'
import { landing } from '@/i18n/messages/landing'
import { buildConsentRecord, CASL_CONSENT_TEXT } from './caslConsent'

describe('CASL_CONSENT_TEXT', () => {
  /**
   * The whole point of storing the wording is that it proves what the person
   * saw. A copy that has drifted from the live form proves the opposite — it
   * would put a sentence in someone's mouth they were never shown. This test is
   * what keeps the server copy honest when the marketing copy is edited.
   */
  it('matches the checkbox wording the visitor actually ticks', () => {
    expect(CASL_CONSENT_TEXT.en).toBe(landing.landing_cta_consent_label.en)
    expect(CASL_CONSENT_TEXT.fr).toBe(landing.landing_cta_consent_label.fr)
  })

  it('records the consent itself, not the privacy notice beside it', () => {
    /* landing_cta_consent is the "we will handle your information according to
       our Privacy Policy" line — context, not the thing consented to. */
    expect(CASL_CONSENT_TEXT.en).not.toBe(landing.landing_cta_consent.en)
    expect(CASL_CONSENT_TEXT.fr).not.toBe(landing.landing_cta_consent.fr)
  })

  it('carries both languages, distinctly', () => {
    expect(CASL_CONSENT_TEXT.en.length).toBeGreaterThan(0)
    expect(CASL_CONSENT_TEXT.fr.length).toBeGreaterThan(0)
    expect(CASL_CONSENT_TEXT.en).not.toBe(CASL_CONSENT_TEXT.fr)
  })
})

describe('buildConsentRecord', () => {
  it('stores what they agreed to, in the language they read it in', () => {
    const record = buildConsentRecord('fr', '2026-07-30T12:00:00.000Z')
    expect(record).toEqual({
      consent_granted: true,
      consent_text: landing.landing_cta_consent_label.fr,
      consent_at: '2026-07-30T12:00:00.000Z',
    })
  })

  it('records the English wording for an English signup', () => {
    const record = buildConsentRecord('en', '2026-07-30T12:00:00.000Z')
    expect(record.consent_text).toBe(landing.landing_cta_consent_label.en)
  })

  it('takes the timestamp from the caller rather than the clock', () => {
    /* Injected so the stored time is the one the row is written with, and so
       this test does not depend on when it runs. */
    expect(buildConsentRecord('en', '2020-01-01T00:00:00.000Z').consent_at).toBe(
      '2020-01-01T00:00:00.000Z',
    )
  })
})
