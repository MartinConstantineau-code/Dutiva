export type Lang = 'en' | 'fr'

/** A bilingual string. Every user-facing string ships EN + FR (handoff rule). */
export interface Bi {
  en: string
  fr: string
}

export const bi = (en: string, fr: string): Bi => ({ en, fr })

/**
 * Identity helper that pins a message module to `Record<key, Bi>` while
 * preserving literal keys, so `t()` stays fully typed and EN/FR parity is
 * structural (a key cannot exist in one language only).
 */
export function defineMessages<T extends Record<string, Bi>>(messages: T): T {
  return messages
}

export function pick(value: Bi, lang: Lang): string {
  return lang === 'fr' ? value.fr : value.en
}

/**
 * Localizable text: either a plain (already-localized or language-neutral)
 * string, or a bilingual pair. State that outlives a render (rail content,
 * toasts, chat transcripts) should store `Bi` so a live language toggle
 * re-localizes it; `pickL` resolves either form.
 */
export type LText = string | Bi

export function pickL(value: LText, lang: Lang): string {
  return typeof value === 'string' ? value : pick(value, lang)
}

/** Stable React key for an `LText` value. */
export function keyOfL(value: LText): string {
  return typeof value === 'string' ? value : value.en
}
