import { normalizeText } from './text'

/**
 * §5.1 Crisis pre-classifier — a maintained, deterministic, bilingual signal
 * for personal crisis / self-harm, run BEFORE the model and OR'd with the
 * engine's `isCrisis` in `safetyBackstop.ts`. It can only ever *raise* the
 * crisis flag, never clear it (fail-safe-on): a model that fails to flag a
 * crisis cannot suppress the intercept.
 *
 * Design choices (see docs/AI_USAGE_STRATEGY.md §5.1):
 * - **Recall over precision.** A false positive shows a support resource that
 *   was not strictly needed — safe. A false negative is not, so the phrase set
 *   errs toward catching distress.
 * - **First-person / self-directed.** Phrases target the user signalling their
 *   own distress (AGENT.md §8), not third-party workplace-violence reports —
 *   those are an escalation matter, routed separately, and must not be pulled
 *   into supportive/crisis mode.
 * - **Maintained, not generated.** This list is version-controlled and
 *   reviewed, exactly like the crisis *resources* it guards (the 9-8-8
 *   helpline), which are never model-generated.
 *
 * Phrases are stored already-normalized (lowercase, no accents, no
 * apostrophes) to match `normalizeText` output.
 */
/**
 * Exported (only) so the drift test in crisisSignals.test.ts can compare this
 * set against the server's mirror (supabase/functions/advisor-chat/
 * responsePayload.ts) — nothing else should import the raw list; use
 * `detectCrisisSignal`.
 */
export const CRISIS_PHRASES: readonly string[] = [
  // English
  'kill myself',
  'killing myself',
  'end my life',
  'ending my life',
  'take my own life',
  'want to die',
  'wish i was dead',
  'wish i were dead',
  'better off dead',
  'suicidal',
  'thinking about suicide',
  'thoughts of suicide',
  'commit suicide',
  'harm myself',
  'hurt myself',
  'self harm',
  'cant go on',
  'cant do this anymore',
  'dont want to live',
  'dont want to be here anymore',
  'no reason to live',
  'no point in living',
  'want to end it all',
  // French (normalized: accents and apostrophes removed)
  'me suicider',
  'me tuer',
  'suicidaire',
  'envie de mourir',
  'je veux mourir',
  'veux mourir',
  'mettre fin a mes jours',
  'mettre fin a ma vie',
  'en finir avec la vie',
  'plus envie de vivre',
  'plus de raison de vivre',
  'me faire du mal',
  'mieux mort',
  'mieux morte',
]

/** True when `text` carries a maintained personal-crisis signal. */
export function detectCrisisSignal(text: string): boolean {
  const normalized = normalizeText(text)
  if (!normalized) return false
  return CRISIS_PHRASES.some((phrase) => normalized.includes(phrase))
}
