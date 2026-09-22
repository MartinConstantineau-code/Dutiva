/**
 * Minimal Google Calendar API v3 client for the support call-scheduling flow
 * (TODO.md D3). Service-account JWT-bearer flow (RFC 7523) via Web Crypto —
 * deliberately no `google-auth-library` dependency: Deno edge functions have
 * a limited npm surface, and this needs exactly one thing, an access token to
 * call `events.insert`.
 *
 * Owner setup: create a service account in a Google Cloud project, enable
 * the Calendar API, and share the calendar events should land on with the
 * service account's email address ("Make changes to events" permission) —
 * domain-wide delegation is not needed for a single shared calendar. Set
 * GOOGLE_CALENDAR_CLIENT_EMAIL / GOOGLE_CALENDAR_PRIVATE_KEY /
 * GOOGLE_CALENDAR_ID as edge-function secrets. See
 * docs/SUPPORT_CALL_SCHEDULING.md.
 */

export interface ServiceAccountKey {
  clientEmail: string
  privateKey: string
}

/** `GOOGLE_CALENDAR_PRIVATE_KEY` typically arrives with literal `\n` (env vars can't hold real newlines); unescape before use. */
export function parseServiceAccountKey(
  clientEmail: string | undefined,
  privateKey: string | undefined,
): ServiceAccountKey | null {
  if (!clientEmail || !privateKey) return null
  const trimmedEmail = clientEmail.trim()
  const normalizedKey = privateKey.replace(/\\n/g, '\n').trim()
  if (!trimmedEmail || !normalizedKey) return null
  return { clientEmail: trimmedEmail, privateKey: normalizedKey }
}

function base64url(input: ArrayBuffer | string): string {
  const bytes = typeof input === 'string' ? new TextEncoder().encode(input) : new Uint8Array(input)
  let binary = ''
  for (const b of bytes) binary += String.fromCharCode(b)
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

/**
 * The unsigned JWT-bearer assertion Google's token endpoint expects — pulled
 * out as a pure function so the claim shape is unit-testable without Web
 * Crypto or a network call.
 */
export function buildJwtClaims(
  clientEmail: string,
  scope: string,
  issuedAtSeconds: number,
): { header: Record<string, unknown>; claims: Record<string, unknown> } {
  return {
    header: { alg: 'RS256', typ: 'JWT' },
    claims: {
      iss: clientEmail,
      scope,
      aud: 'https://oauth2.googleapis.com/token',
      iat: issuedAtSeconds,
      // Google caps this at 1 hour; the token is used once, immediately, per call.
      exp: issuedAtSeconds + 3600,
    },
  }
}

async function importPrivateKey(pem: string): Promise<CryptoKey> {
  const der = Uint8Array.from(
    atob(
      pem
        .replace(/-----BEGIN PRIVATE KEY-----/, '')
        .replace(/-----END PRIVATE KEY-----/, '')
        .replace(/\s+/g, ''),
    ),
    (c) => c.charCodeAt(0),
  )
  return crypto.subtle.importKey(
    'pkcs8',
    der,
    { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
    false,
    ['sign'],
  )
}

const CALENDAR_EVENTS_SCOPE = 'https://www.googleapis.com/auth/calendar.events'

async function getAccessToken(key: ServiceAccountKey, scope: string): Promise<string> {
  const issuedAtSeconds = Math.floor(Date.now() / 1000)
  const { header, claims } = buildJwtClaims(key.clientEmail, scope, issuedAtSeconds)
  const unsigned = `${base64url(JSON.stringify(header))}.${base64url(JSON.stringify(claims))}`
  const privateKey = await importPrivateKey(key.privateKey)
  const signature = await crypto.subtle.sign(
    'RSASSA-PKCS1-v1_5',
    privateKey,
    new TextEncoder().encode(unsigned),
  )
  const jwt = `${unsigned}.${base64url(signature)}`

  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: jwt,
    }),
  })
  if (!res.ok) {
    throw new Error(`Google token exchange failed: HTTP ${res.status} ${await res.text()}`)
  }
  const data = (await res.json()) as { access_token?: string }
  if (!data.access_token) throw new Error('Google token exchange returned no access_token')
  return data.access_token
}

export interface CreateEventInput {
  calendarId: string
  summary: string
  description: string
  /** ISO 8601, e.g. from `Date#toISOString()`. */
  startIso: string
  endIso: string
  attendeeEmail: string | null
  /** Idempotency key for the auto-generated Meet link; the confirmed call's row id is a good choice. */
  requestId: string
}

export interface CreatedEvent {
  eventId: string
  meetLink: string | null
  htmlLink: string | null
}

/**
 * Creates a calendar event with an auto-generated Google Meet link
 * (`conferenceDataVersion=1`) and, if given, invites the customer as an
 * attendee (`sendUpdates=all` — Google emails them the invite).
 */
export async function createCalendarEvent(
  key: ServiceAccountKey,
  input: CreateEventInput,
): Promise<CreatedEvent> {
  const accessToken = await getAccessToken(key, CALENDAR_EVENTS_SCOPE)
  const body = {
    summary: input.summary,
    description: input.description,
    start: { dateTime: input.startIso },
    end: { dateTime: input.endIso },
    attendees: input.attendeeEmail ? [{ email: input.attendeeEmail }] : [],
    conferenceData: {
      createRequest: {
        requestId: input.requestId,
        conferenceSolutionKey: { type: 'hangoutsMeet' },
      },
    },
  }
  const url =
    `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(input.calendarId)}/events` +
    '?conferenceDataVersion=1&sendUpdates=all'
  const res = await fetch(url, {
    method: 'POST',
    headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  if (!res.ok) {
    throw new Error(`Google Calendar event creation failed: HTTP ${res.status} ${await res.text()}`)
  }
  const data = (await res.json()) as { id: string; hangoutLink?: string; htmlLink?: string }
  return { eventId: data.id, meetLink: data.hangoutLink ?? null, htmlLink: data.htmlLink ?? null }
}
