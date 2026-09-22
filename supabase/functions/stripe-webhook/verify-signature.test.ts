import { describe, it, expect } from 'vitest'
import { verifyStripeSignature } from './verify-signature'

// ── Helper: produce a real Stripe-style signature header for a payload ────────
// Default timestamp is "now" so the 5-minute replay-tolerance window passes;
// individual tests pass an explicit value when they need to assert the
// tolerance-window behaviour itself.
async function signPayload(
  payload: string,
  secret: string,
  timestamp: string = String(Math.floor(Date.now() / 1000)),
): Promise<string> {
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  )
  const sigBytes = await crypto.subtle.sign(
    'HMAC',
    key,
    new TextEncoder().encode(`${timestamp}.${payload}`),
  )
  const hex = Array.from(new Uint8Array(sigBytes))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
  return `t=${timestamp},v1=${hex}`
}

// Security: This is a test fixture, not a real secret.
const SECRET = 'whsec_test_abc123'
const PAYLOAD = '{"id":"evt_123","type":"checkout.session.completed"}'

describe('verifyStripeSignature — happy path', () => {
  it('accepts a header produced from the same secret + payload', async () => {
    const header = await signPayload(PAYLOAD, SECRET)
    expect(await verifyStripeSignature(PAYLOAD, header, SECRET)).toBe(true)
  })

  it('accepts a header that has additional v0 / v1 entries', async () => {
    const header = await signPayload(PAYLOAD, SECRET)
    const augmented = `${header},v0=deadbeef,extra=ignored`
    expect(await verifyStripeSignature(PAYLOAD, augmented, SECRET)).toBe(true)
  })
})

describe('verifyStripeSignature — rejection paths', () => {
  it('rejects when the secret differs', async () => {
    const header = await signPayload(PAYLOAD, SECRET)
    expect(await verifyStripeSignature(PAYLOAD, header, 'whsec_different')).toBe(false)
  })

  it('rejects when the payload is mutated (single character)', async () => {
    const header = await signPayload(PAYLOAD, SECRET)
    const tampered = PAYLOAD.replace('evt_123', 'evt_124')
    expect(await verifyStripeSignature(tampered, header, SECRET)).toBe(false)
  })

  it('rejects when the timestamp is tampered with (signed payload changes)', async () => {
    // Use a fresh timestamp so the tolerance window passes; the assertion
    // is about signature mismatch after the t= value is bumped.
    const now = String(Math.floor(Date.now() / 1000))
    const next = String(Math.floor(Date.now() / 1000) + 1)
    const header = await signPayload(PAYLOAD, SECRET, now)
    const tamperedHeader = header.replace(`t=${now}`, `t=${next}`)
    expect(await verifyStripeSignature(PAYLOAD, tamperedHeader, SECRET)).toBe(false)
  })

  it('rejects when the v1 signature is truncated', async () => {
    const header = await signPayload(PAYLOAD, SECRET)
    const truncated = header.slice(0, -2) // drop last hex char
    expect(await verifyStripeSignature(PAYLOAD, truncated, SECRET)).toBe(false)
  })

  it('rejects when the v1 signature has any single-byte mutation', async () => {
    const header = await signPayload(PAYLOAD, SECRET)
    // Flip a hex char in the v1 portion
    const idx = header.indexOf('v1=') + 3
    const flipped = header.slice(0, idx) + (header[idx] === 'a' ? 'b' : 'a') + header.slice(idx + 1)
    expect(await verifyStripeSignature(PAYLOAD, flipped, SECRET)).toBe(false)
  })
})

describe('verifyStripeSignature — malformed headers', () => {
  it('rejects an empty signature header', async () => {
    expect(await verifyStripeSignature(PAYLOAD, '', SECRET)).toBe(false)
  })

  it('rejects a header missing the t= timestamp', async () => {
    expect(await verifyStripeSignature(PAYLOAD, 'v1=deadbeef', SECRET)).toBe(false)
  })

  it('rejects a header missing the v1= signature', async () => {
    const now = String(Math.floor(Date.now() / 1000))
    expect(await verifyStripeSignature(PAYLOAD, `t=${now}`, SECRET)).toBe(false)
  })

  it('rejects a header with only v0 (deprecated scheme)', async () => {
    const now = String(Math.floor(Date.now() / 1000))
    expect(await verifyStripeSignature(PAYLOAD, `t=${now},v0=deadbeef`, SECRET)).toBe(false)
  })

  it('rejects a header whose t= is not a finite integer', async () => {
    expect(await verifyStripeSignature(PAYLOAD, 't=notanumber,v1=deadbeef', SECRET)).toBe(false)
  })
})

describe('verifyStripeSignature — replay protection (timestamp tolerance)', () => {
  it('rejects payloads older than the default tolerance (5 minutes)', async () => {
    const stale = String(Math.floor(Date.now() / 1000) - 301)
    const header = await signPayload(PAYLOAD, SECRET, stale)
    expect(await verifyStripeSignature(PAYLOAD, header, SECRET)).toBe(false)
  })

  it('rejects payloads dated too far in the future', async () => {
    const future = String(Math.floor(Date.now() / 1000) + 301)
    const header = await signPayload(PAYLOAD, SECRET, future)
    expect(await verifyStripeSignature(PAYLOAD, header, SECRET)).toBe(false)
  })

  it('accepts payloads at the edge of the default tolerance window', async () => {
    const edge = String(Math.floor(Date.now() / 1000) - 290)
    const header = await signPayload(PAYLOAD, SECRET, edge)
    expect(await verifyStripeSignature(PAYLOAD, header, SECRET)).toBe(true)
  })

  it('respects a caller-supplied tolerance argument', async () => {
    // 1-hour-old payload + 2-hour tolerance → accepted.
    const old = String(Math.floor(Date.now() / 1000) - 3600)
    const header = await signPayload(PAYLOAD, SECRET, old)
    expect(await verifyStripeSignature(PAYLOAD, header, SECRET, 7200)).toBe(true)
    // Same payload with the default 300s tolerance → rejected.
    expect(await verifyStripeSignature(PAYLOAD, header, SECRET)).toBe(false)
  })
})

describe('verifyStripeSignature — input validation', () => {
  it('rejects when secret is empty', async () => {
    const header = await signPayload(PAYLOAD, SECRET)
    expect(await verifyStripeSignature(PAYLOAD, header, '')).toBe(false)
  })

  it('rejects when any argument is not a string', async () => {
    const header = await signPayload(PAYLOAD, SECRET)
    // @ts-expect-error — exercising the runtime guard
    expect(await verifyStripeSignature(null, header, SECRET)).toBe(false)
    // @ts-expect-error — exercising the runtime guard
    expect(await verifyStripeSignature(PAYLOAD, undefined, SECRET)).toBe(false)
    // @ts-expect-error — exercising the runtime guard
    expect(await verifyStripeSignature(PAYLOAD, header, 42)).toBe(false)
  })

  it('handles empty payload (Stripe occasionally sends bodyless events)', async () => {
    const emptyHeader = await signPayload('', SECRET)
    expect(await verifyStripeSignature('', emptyHeader, SECRET)).toBe(true)
    // …but the same header doesn't validate against a non-empty payload
    expect(await verifyStripeSignature('not empty', emptyHeader, SECRET)).toBe(false)
  })
})
