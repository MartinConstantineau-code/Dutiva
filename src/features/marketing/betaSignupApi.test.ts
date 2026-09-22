import { describe, expect, it, vi, beforeEach } from 'vitest'

const invoke = vi.hoisted(() => vi.fn())
vi.mock('@/lib/supabaseClient', () => ({ supabase: { functions: { invoke } } }))

import { createBetaSignup, BetaSignupError } from './betaSignupApi'

/** Shape of a supabase-js FunctionsHttpError as the client surfaces it. */
const httpError = (status: number) => ({ error: { context: { status } } })

/**
 * What invoke() really resolves for this function: supabase-js hands back the
 * response body as `data`, and the function's body is itself `{ data: {...} }`
 * — hence the double envelope.
 */
const success = (cohortFull: boolean) => ({
  data: { data: { ok: true, cohort_full: cohortFull } },
  error: null,
})

describe('createBetaSignup', () => {
  beforeEach(() => invoke.mockReset())

  it('sends the fields the edge function expects', async () => {
    invoke.mockResolvedValue(success(false))
    await createBetaSignup({
      email: 'owner@example.ca',
      company: '  Example Inc. ',
      province: 'on',
      language: 'fr',
      consent: true,
    })

    expect(invoke).toHaveBeenCalledWith('create-beta-signup', {
      body: {
        email: 'owner@example.ca',
        company: 'Example Inc.',
        province: 'on',
        language: 'fr',
        source: 'landing',
        consent: true,
        contact_fax: '',
        captcha_token: '',
      },
    })
  })

  it('forwards the CAPTCHA token when one is provided', async () => {
    invoke.mockResolvedValue(success(false))
    await createBetaSignup({
      email: 'owner@example.ca',
      language: 'en',
      consent: true,
      captchaToken: 'turnstile-token-abc',
    })
    expect(invoke.mock.calls[0]![1].body.captcha_token).toBe('turnstile-token-abc')
  })

  it('maps 403 to captcha (human-verification rejection)', async () => {
    invoke.mockResolvedValue(httpError(403))
    await expect(
      createBetaSignup({ email: 'owner@example.ca', language: 'en', consent: true }),
    ).rejects.toMatchObject({ code: 'captcha' })
  })

  it('omits the optional fields rather than sending empty strings', async () => {
    invoke.mockResolvedValue(success(false))
    await createBetaSignup({
      email: 'owner@example.ca',
      company: '   ',
      province: '',
      language: 'en',
      consent: true,
    })

    const body = invoke.mock.calls[0]![1].body
    expect(body.company).toBeUndefined()
    expect(body.province).toBeUndefined()
  })

  it('forwards the honeypot to the server trap', async () => {
    invoke.mockResolvedValue(success(false))
    await createBetaSignup({
      email: 'bot@example.ca',
      language: 'en',
      consent: true,
      honeypot: 'filled-by-a-bot',
    })

    expect(invoke.mock.calls[0]![1].body.contact_fax).toBe('filled-by-a-bot')
  })

  it('reports whether the signup was waitlisted from the cohort bit', async () => {
    invoke.mockResolvedValue(success(false))
    await expect(
      createBetaSignup({ email: 'owner@example.ca', language: 'en', consent: true }),
    ).resolves.toEqual({ waitlisted: false })

    invoke.mockResolvedValue(success(true))
    await expect(
      createBetaSignup({ email: 'owner@example.ca', language: 'en', consent: true }),
    ).resolves.toEqual({ waitlisted: true })
  })

  it('treats a response without the cohort bit as not waitlisted (older function)', async () => {
    invoke.mockResolvedValue({ data: { data: { ok: true } }, error: null })
    await expect(
      createBetaSignup({ email: 'owner@example.ca', language: 'en', consent: true }),
    ).resolves.toEqual({ waitlisted: false })
  })

  it('maps 429 to rate_limited', async () => {
    invoke.mockResolvedValue(httpError(429))
    await expect(
      createBetaSignup({ email: 'owner@example.ca', language: 'en', consent: true }),
    ).rejects.toMatchObject({ code: 'rate_limited' })
  })

  it('maps 422 to validation', async () => {
    invoke.mockResolvedValue(httpError(422))
    await expect(
      createBetaSignup({ email: 'owner@example.ca', language: 'en', consent: false }),
    ).rejects.toMatchObject({ code: 'validation' })
  })

  it('maps anything else to a generic error', async () => {
    invoke.mockResolvedValue(httpError(500))
    await expect(
      createBetaSignup({ email: 'owner@example.ca', language: 'en', consent: true }),
    ).rejects.toBeInstanceOf(BetaSignupError)
  })
})
