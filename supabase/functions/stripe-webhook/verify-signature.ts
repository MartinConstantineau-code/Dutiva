/**
 * verifyStripeSignature
 *
 * Verifies a Stripe webhook signature header against a payload using HMAC-SHA-256.
 * The implementation uses only WebCrypto, so the same module is callable from
 * Deno (Supabase Edge Functions) and from Node 22+ (Vitest tests, future
 * functions, etc.). No third-party crypto dependency.
 *
 * Ported verbatim from the production dutiva-website repo
 * (supabase/functions/stripe-webhook/verify-signature.ts).
 *
 * Spec: https://docs.stripe.com/webhooks#verify-manually
 *
 *   Stripe-Signature: t=<timestamp>,v1=<signature>[,v0=<deprecated>]
 *
 *   signed_payload = `${timestamp}.${raw_body}`
 *   expected = hex(HMAC_SHA256(secret, signed_payload))
 *   verified iff expected === v1 (constant-time compare)
 *           AND |now - timestamp| <= toleranceSeconds   (replay protection)
 *
 * @param payload           Raw request body string (must be unparsed).
 * @param sigHeader         Full `Stripe-Signature` header value.
 * @param secret            Webhook signing secret (`whsec_...`).
 * @param toleranceSeconds  Max accepted clock drift between Stripe and us;
 *                          Stripe recommends 300s. Older payloads are rejected
 *                          to defeat capture-and-replay attacks.
 * @returns Promise<boolean> — true iff the signature matches AND the
 *                              timestamp is inside the tolerance window.
 */

// Stripe's recommended replay-protection tolerance window.
// https://docs.stripe.com/webhooks#replay-attacks
const DEFAULT_TOLERANCE_SECONDS = 300

export async function verifyStripeSignature(
  payload: string,
  sigHeader: string,
  secret: string,
  toleranceSeconds: number = DEFAULT_TOLERANCE_SECONDS,
): Promise<boolean> {
  if (typeof payload !== 'string' || typeof sigHeader !== 'string' || typeof secret !== 'string') {
    return false
  }
  if (!sigHeader || !secret) return false

  const parts = sigHeader.split(',')
  const ts = parts.find((p) => p.startsWith('t='))?.slice(2)
  const v1 = parts.find((p) => p.startsWith('v1='))?.slice(3)
  if (!ts || !v1) return false

  // Replay protection: reject payloads whose timestamp is outside the
  // accepted window. Stripe issues `t=` as a Unix epoch in seconds.
  const tsNum = Number.parseInt(ts, 10)
  if (!Number.isFinite(tsNum)) return false
  const nowSec = Math.floor(Date.now() / 1000)
  if (Math.abs(nowSec - tsNum) > toleranceSeconds) return false

  const signedPayload = `${ts}.${payload}`
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  )
  const sigBytes = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(signedPayload))
  const computed = Array.from(new Uint8Array(sigBytes))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')

  return constantTimeEqual(computed, v1)
}

/**
 * Length-aware constant-time string compare. Returns false on length mismatch,
 * otherwise XORs each char code so total runtime depends only on length.
 * Defends against timing-based discovery of partial-prefix matches.
 */
function constantTimeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false
  let diff = 0
  for (let i = 0; i < a.length; i++) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i)
  }
  return diff === 0
}
