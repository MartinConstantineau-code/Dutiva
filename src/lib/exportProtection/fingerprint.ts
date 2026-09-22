/**
 * Export fingerprinting — the traceability half of export protection
 * (docs/EXPORT_PROTECTION.md).
 *
 * Every export gets a unique id. That id travels with the artifact through
 * three redundant channels, because any single channel can be stripped:
 *
 *   1. the visible watermark line (watermark.ts) — human-readable, survives
 *      print/screenshot/PDF re-save;
 *   2. an invisible zero-width tag woven into the text (this module) —
 *      survives copy-paste of the *content itself* into email/chat/another
 *      document, which is exactly the path a visible footer gets cropped from;
 *   3. artifact metadata (PDF Info dict, Word meta tags — artifacts/).
 *
 * The invisible tag encodes the export id as a run of zero-width characters
 * (ZWNJ = 0, ZWSP = 1) between WORD JOINER sentinels. Recovering it from a
 * leaked snippet (`decodeInvisibleTag`) links the copy back to one
 * `export_events` row: who exported it, when, and the content hash.
 *
 * This is deterrence + attribution, not DRM: a determined party can retype
 * the text. What it removes is *plausible deniability* — no leaked copy is
 * anonymous by accident.
 */

/** Sentinel bracketing the payload. U+2060 WORD JOINER is invisible, legal in
 * text, and never produced by the app's own copy, so two in a row is an
 * unambiguous marker. Escape sequences throughout — literal zero-width
 * characters in source would be invisible to review. */
const SENTINEL = '\u2060\u2060'
/** Bit characters: ZWNJ (U+200C) = 0, ZWSP (U+200B) = 1. ZWJ is deliberately
 * avoided — it is meaningful inside emoji sequences and some scripts, where
 * an inserted ZWJ could change what renders. ZWNJ/ZWSP between Latin letters
 * render as nothing. */
const BIT_ZERO = '\u200c'
const BIT_ONE = '\u200b'

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/

/** New export id (UUID v4). `crypto.randomUUID` needs a secure context;
 * the `getRandomValues` fallback covers plain-HTTP LAN previews. */
export function newExportId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }
  const bytes = new Uint8Array(16)
  if (typeof crypto !== 'undefined' && typeof crypto.getRandomValues === 'function') {
    crypto.getRandomValues(bytes)
  } else {
    for (let i = 0; i < 16; i += 1) bytes[i] = Math.floor(Math.random() * 256)
  }
  bytes[6] = (bytes[6]! & 0x0f) | 0x40
  bytes[8] = (bytes[8]! & 0x3f) | 0x80
  const hex = Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('')
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`
}

/** Whether `id` is a lowercase UUID — the only shape the tag codec carries. */
export function isExportId(id: string): boolean {
  return UUID_RE.test(id)
}

/**
 * The export id as an invisible character run: SENTINEL + 128 bits + SENTINEL
 * (130 zero-width code points). Returns '' for a malformed id rather than
 * throwing — a watermark must never be the reason an export fails.
 */
export function encodeInvisibleTag(exportId: string): string {
  if (!isExportId(exportId)) return ''
  const hex = exportId.replaceAll('-', '')
  let bits = ''
  for (const char of hex) {
    const nibble = parseInt(char, 16)
    for (let bit = 3; bit >= 0; bit -= 1) {
      bits += (nibble >> bit) & 1 ? BIT_ONE : BIT_ZERO
    }
  }
  return SENTINEL + bits + SENTINEL
}

/**
 * Recovers the first embedded export id from text, or null. Tolerant of the
 * tag being mid-string (pasted into a larger document) but strict about the
 * payload: anything other than exactly 128 bit-characters between sentinels
 * is treated as damage and rejected — a wrong attribution is worse than none.
 */
export function decodeInvisibleTag(text: string): string | null {
  const start = text.indexOf(SENTINEL)
  if (start === -1) return null
  const payloadStart = start + SENTINEL.length
  const end = text.indexOf(SENTINEL, payloadStart)
  if (end === -1) return null
  const payload = text.slice(payloadStart, end)
  if (payload.length !== 128) return null
  let hex = ''
  for (let i = 0; i < 128; i += 4) {
    let nibble = 0
    for (let bit = 0; bit < 4; bit += 1) {
      const char = payload[i + bit]
      if (char === BIT_ONE) nibble = (nibble << 1) | 1
      else if (char === BIT_ZERO) nibble <<= 1
      else return null
    }
    hex += nibble.toString(16)
  }
  const id = `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`
  return isExportId(id) ? id : null
}

/**
 * Content fingerprint for the audit row — lets a recovered artifact be
 * matched to (or shown to differ from) what was actually exported.
 * SHA-256 hex via WebCrypto; older/insecure contexts fall back to FNV-1a
 * 64-bit, prefixed so the audit row says which function produced it.
 */
export async function contentFingerprint(text: string): Promise<string> {
  if (typeof crypto !== 'undefined' && crypto.subtle?.digest) {
    try {
      const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text))
      return Array.from(new Uint8Array(digest), (b) => b.toString(16).padStart(2, '0')).join('')
    } catch {
      /* fall through to FNV-1a */
    }
  }
  let hash = 0xcbf29ce484222325n
  for (let i = 0; i < text.length; i += 1) {
    hash ^= BigInt(text.charCodeAt(i))
    hash = (hash * 0x100000001b3n) & 0xffffffffffffffffn
  }
  return `fnv1a:${hash.toString(16).padStart(16, '0')}`
}
