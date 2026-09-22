/**
 * Reading credentials out of the environment, forgivingly.
 *
 * Every CI credential this repo uses arrives by being pasted into a GitHub
 * secret or variable, and the three ways a paste goes wrong are always the
 * same: a trailing newline, the surrounding quotes from a shell snippet, or the
 * `Bearer ` prefix copied along with the token from an API example. All three
 * produce a malformed Authorization header rather than an obviously wrong one,
 * and the failure is opaque by construction — GitHub masks the secret in the
 * log, so Supabase's reply comes back as
 *
 *     401 {"message":"Format is Authorization: ***"}
 *
 * which names neither the problem nor the fix. That exact line has reddened
 * `live-checks` on every PR since the migration-drift check was wired up
 * (docs/TODO.md OA19).
 *
 * So: strip what is unambiguously not part of a credential, and give callers a
 * way to say something useful when the server still refuses it. Stripping is
 * safe — no Supabase token or key legitimately contains whitespace, wrapping
 * quotes, or a `Bearer ` prefix — and it is the difference between a check that
 * fails for a reason nobody can see and one that either works or explains
 * itself.
 */

/**
 * A pasted secret, cleaned: outer whitespace, one layer of wrapping quotes, and
 * a redundant `Bearer ` prefix removed. Returns undefined for a missing or
 * empty value so callers can treat "unset" and "set to nothing" alike.
 */
export function cleanSecret(raw) {
  if (typeof raw !== 'string') return undefined
  let value = raw.trim()
  /* A shell snippet pasted whole: "sbp_…" or 'sbp_…'. */
  if (value.length >= 2 && /^(".*"|'.*')$/s.test(value)) value = value.slice(1, -1).trim()
  /* Copied from an API example that included the header, not just the token. */
  value = value.replace(/^Bearer\s+/i, '').trim()
  return value.length > 0 ? value : undefined
}

/**
 * What to print when a credential is rejected. Deliberately describes the shape
 * of the value rather than the value itself — length and character classes are
 * enough to spot every paste error above, and none of it is the secret. Safe in
 * a public CI log.
 */
export function describeSecret(raw) {
  if (typeof raw !== 'string' || raw.length === 0) return 'unset'
  const notes = []
  if (raw !== raw.trim()) notes.push('has surrounding whitespace (a trailing newline?)')
  if (/^(".*"|'.*')$/s.test(raw.trim())) notes.push('is wrapped in quotes')
  if (/^Bearer\s+/i.test(raw.trim())) notes.push('starts with "Bearer "')
  const cleaned = cleanSecret(raw) ?? ''
  if (cleaned.length > 0 && !/^[\w.\-~+/=]+$/.test(cleaned)) {
    notes.push('contains characters no token uses')
  }
  return `${cleaned.length} chars after cleaning${notes.length ? ` — ${notes.join('; ')}` : ''}`
}

/**
 * The remediation text for a rejected Supabase personal access token. One
 * place, so the drift check and the email-template script say the same thing.
 */
export const ACCESS_TOKEN_HELP =
  'A 401 here means the Authorization header was malformed or the token is no ' +
  'longer valid. Re-issue one at https://supabase.com/dashboard/account/tokens ' +
  'and paste ONLY the sbp_… value into the SUPABASE_ACCESS_TOKEN secret — no ' +
  'quotes, no "Bearer " prefix, no trailing newline.'
