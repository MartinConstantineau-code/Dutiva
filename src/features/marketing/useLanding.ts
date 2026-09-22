import { useCallback } from 'react'
import { useI18n } from '@/i18n/context'
import { pick } from '@/i18n/core'
import { landing } from '@/i18n/messages/landing'

export type LandingMessageKey = keyof typeof landing

/**
 * `lt()` resolves `landing_*` keys straight from the landing message module,
 * narrowed to `LandingMessageKey` so a typo is a type error rather than a
 * blank string; the rest of the i18n context (`t`, `L`, `lang`, `setLang`) is
 * passed through.
 *
 * It is a convenience, **not an isolation boundary**. `landing` is spread into
 * the global catalogue like every other module, and it has to be: plan copy in
 * `src/config/plans.ts` points at `landing_*` keys (`landing_free_desc`,
 * `landing_starter_desc`, …), which the app-side `PlanGate` resolves through
 * `t()`. Dropping it from the catalogue would break a workspace component, not
 * just this page.
 *
 * That is now recorded in the type system rather than only in this comment:
 * `landing` sits in the **shared** group in `src/i18n/messages/index.ts`, and
 * `plans.ts` is typed `SharedMessageKey` — so moving `landing` to the marketing
 * group is a compile error at `PlanGate`, not a blank page in production.
 * `src/i18n/messages/scopes.test.ts` guards the three scopes staying disjoint.
 */
export function useLanding() {
  const i18n = useI18n()
  const { lang } = i18n
  const lt = useCallback((key: LandingMessageKey) => pick(landing[key], lang), [lang])
  return { ...i18n, lt }
}
