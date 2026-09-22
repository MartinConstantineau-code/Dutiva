/**
 * Advisor deterministic safety backstop (docs/AI_USAGE_STRATEGY.md §5).
 * A pure, auditable rule layer that hardens the engine's structured response
 * on the client — crisis intercept (fail-safe-on) and a jurisdiction/statutory
 * -figure gate (fail-safe-closed) — plus the grounded statutory-notice table.
 */
export { detectCrisisSignal } from './crisisSignals'
export { mentionsStatutoryFigure } from './statutoryFigures'
export {
  lookupStatutoryNoticeWeeks,
  NOTICE_SCHEDULES,
  type NoticeBand,
  type StatutoryNoticeSchedule,
} from './statutoryNotice'
export {
  applySafetyBackstop,
  type SafetyAction,
  type SafetyBackstopInput,
  type SafetyBackstopResult,
} from './safetyBackstop'
