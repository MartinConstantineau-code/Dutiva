import { describe, expect, it } from 'vitest'
import { cleanSecret, describeSecret } from './secrets.mjs'

/**
 * These three paste errors are not hypothetical: one of them has reddened
 * `live-checks` on every PR since the migration-drift check was wired up
 * (docs/TODO.md OA19), as an opaque `401 {"message":"Format is Authorization:
 * ***"}` — opaque because GitHub masks the secret inside the provider's reply.
 */
describe('cleanSecret', () => {
  it('returns a well-formed value unchanged', () => {
    expect(cleanSecret('sbp_abc123')).toBe('sbp_abc123')
  })

  it.each([
    ['sbp_abc123\n', 'a trailing newline'],
    ['  sbp_abc123  ', 'surrounding whitespace'],
    ['"sbp_abc123"', 'double quotes from a shell snippet'],
    ["'sbp_abc123'", 'single quotes'],
    ['Bearer sbp_abc123', 'a Bearer prefix copied from an API example'],
    ['bearer  sbp_abc123', 'a lowercase Bearer prefix'],
    ['"Bearer sbp_abc123"\n', 'all three at once'],
  ])('recovers a token pasted with %s', (raw) => {
    expect(cleanSecret(raw)).toBe('sbp_abc123')
  })

  it.each([
    ['', 'empty'],
    ['   ', 'whitespace only'],
    ['""', 'empty quotes'],
    [undefined, 'unset'],
    [null, 'null'],
  ])('treats %s as absent, so callers skip rather than send a bad header', (raw) => {
    expect(cleanSecret(raw)).toBeUndefined()
  })

  it('leaves the inside of a value alone — only the wrapper is noise', () => {
    /* Quotes/whitespace are stripped from the edges, never the middle: a key
       with internal punctuation must survive intact. */
    expect(cleanSecret('  eyJhbGci.eyJpc3Mi-abc_123/x+y=  ')).toBe('eyJhbGci.eyJpc3Mi-abc_123/x+y=')
  })
})

describe('describeSecret', () => {
  it('never returns the secret itself — CI logs are public', () => {
    const described = describeSecret('"Bearer sbp_supersecretvalue"')
    expect(described).not.toContain('supersecret')
    expect(described).not.toContain('sbp_')
  })

  it('names each recoverable defect so the fix is obvious from the log', () => {
    expect(describeSecret('sbp_abc\n')).toContain('whitespace')
    expect(describeSecret('"sbp_abc"')).toContain('quotes')
    expect(describeSecret('Bearer sbp_abc')).toContain('Bearer')
  })

  it('reports the cleaned length, which is what distinguishes wrong from malformed', () => {
    /* Same token, three wrappers, one length — so a log that still shows a
       plausible length points at an invalid token rather than a bad paste. */
    for (const raw of ['sbp_abc123', '"sbp_abc123"', 'Bearer sbp_abc123\n']) {
      expect(describeSecret(raw)).toContain('10 chars')
    }
  })

  it('flags a value carrying characters no token uses', () => {
    expect(describeSecret('sbp_abc 123 oops')).toContain('characters no token uses')
  })

  it('says "unset" for a missing value', () => {
    expect(describeSecret(undefined)).toBe('unset')
    expect(describeSecret('')).toBe('unset')
  })
})
