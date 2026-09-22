/**
 * Minimal Resend send, shared by support-notify and send-law-updates so the
 * request shape lives in one place. Mirrors
 * src/features/support/email/resendProvider.ts (the client-side copy used by
 * the (future) browser-triggered paths); returns the provider's message id
 * so a caller can correlate later delivery/bounce webhooks — acceptance here
 * is NOT delivery.
 */
export async function resendSend(
  apiKey: string,
  from: string,
  message: { to: string; subject: string; text: string },
): Promise<string | null> {
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ from, to: message.to, subject: message.subject, text: message.text }),
  })
  if (!res.ok) {
    const detail = await res.text().catch(() => '')
    throw new Error(`Resend send failed (${res.status}): ${detail.slice(0, 300)}`)
  }
  const body = (await res.json().catch(() => null)) as { id?: string } | null
  return body?.id ?? null
}
