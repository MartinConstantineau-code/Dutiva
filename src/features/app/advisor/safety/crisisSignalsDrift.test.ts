import { describe, expect, it } from 'vitest'
import { CRISIS_PHRASES as CLIENT_CRISIS_PHRASES } from './crisisSignals'
import { normalizeText } from './text'
// Edge functions can't import from src/ at runtime, but their `.test.ts`
// files do run under Vitest (see AGENTS.md), so this is the drift guard for
// the intentionally-duplicated crisis lists (docs/AI_USAGE_STRATEGY.md
// §5.1): both `src/features/app/advisor/safety/crisisSignals.ts` and
// `supabase/functions/advisor-chat/responsePayload.ts` must stay identical.
import {
  CRISIS_PHRASES as SERVER_CRISIS_PHRASES,
  normalize as serverNormalize,
} from '../../../../../supabase/functions/advisor-chat/responsePayload'

/**
 * Turns the "keep the two lists in sync" comments in both files into an
 * enforced invariant instead of a hope: if either the phrase set or the
 * normalize() implementation drifts between the client and server crisis
 * detectors, this test fails instead of silently letting one side of the
 * fail-safe-on union (§5.1) go stale.
 */
describe('crisis phrase list and normalize() stay in sync (client vs. server)', () => {
  it('has byte-identical phrase sets', () => {
    expect(SERVER_CRISIS_PHRASES).toEqual(CLIENT_CRISIS_PHRASES)
  })

  it('has no duplicate phrases on either side', () => {
    expect(new Set(CLIENT_CRISIS_PHRASES).size).toBe(CLIENT_CRISIS_PHRASES.length)
    expect(new Set(SERVER_CRISIS_PHRASES).size).toBe(SERVER_CRISIS_PHRASES.length)
  })

  it('every phrase is already normalized (stable under its own normalizer)', () => {
    for (const phrase of CLIENT_CRISIS_PHRASES) {
      expect(normalizeText(phrase)).toBe(phrase)
      expect(serverNormalize(phrase)).toBe(phrase)
    }
  })

  it('normalizeText() and normalize() produce identical output on representative input', () => {
    const samples = [
      "I Can't Go On",
      'JE SUIS SUICIDAIRE',
      'Envie de mourir…',
      "n'est-ce pas",
      '  extra   whitespace  here  ',
      'Café, naïve, déjà vu',
      'wish I was dead — better off dead',
      'Plus de raison de vivre?!',
      '',
      '   ',
    ]
    for (const sample of samples) {
      expect(serverNormalize(sample)).toBe(normalizeText(sample))
    }
  })
})
