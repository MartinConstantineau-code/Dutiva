import { lookupStatutoryNoticeWeeks } from '@/features/app/advisor/safety/statutoryNotice'
import type { Jurisdiction } from './data/types'

/**
 * Checking a hand-entered notice figure against the statutory floor, in the
 * Document Studio generate wizard.
 *
 * `t03-termination-letter` asks the user to type `notice_weeks` with the hint
 * "Must meet or exceed the statutory minimum for the jurisdiction" — and then
 * nothing checked whether it did. The number goes straight into a termination
 * letter that tells the employee it "meets or exceeds the minimum notice
 * required by ESA ss. 54–57". A typo there is a letter asserting compliance
 * while under-providing, which is the most consequential thing this product
 * can get wrong.
 *
 * The table this reads (`advisor/safety/statutoryNotice.ts`) was written as the
 * grounding half of AI_USAGE_STRATEGY.md §5.2 and had no callers at all. This
 * is its first real one.
 *
 * ## It advises, it does not autofill
 *
 * Deliberately. The statutory minimum is a **floor**, not the right answer:
 * common-law reasonable notice is frequently several times higher, and it is
 * fact-dependent in ways no table can capture. Pre-filling the floor would
 * quietly nudge every employer toward the legal minimum and dress that up as a
 * recommendation. So the user's number stays the user's number, and this only
 * tells them when it is below the floor.
 *
 * ## Where it does not apply
 *
 * - **Québec and Federal.** Their schedules are `null` pending qualified legal
 *   review, so the lookup returns nothing and the UI hedges rather than
 *   inventing a figure.
 * - **`t15-group-termination-notice`.** It also has a `notice_weeks` field, but
 *   group-termination notice is driven by headcount (ESA s. 58), not tenure.
 *   Applying the individual s. 57 schedule there would produce a confidently
 *   wrong number, so applicability keys off the template collecting
 *   `tenure_years` — which only the individual letter does.
 */

/** Field the user types the notice figure into. */
const NOTICE_FIELD_ID = 'notice_weeks'
/** Presence of this field is what marks a template as individual-termination. */
const TENURE_FIELD_ID = 'tenure_years'

export type NoticeFloorVerdict =
  /** No grounded schedule for this jurisdiction — hedge, never guess. */
  | { kind: 'unavailable' }
  /** Tenure not yet usable, so no floor can be computed. */
  | { kind: 'unknown-tenure' }
  /** Floor known, nothing entered yet — show it as guidance. */
  | { kind: 'informational'; floorWeeks: number }
  | { kind: 'meets'; floorWeeks: number; enteredWeeks: number }
  /** The entered figure is below the statutory minimum. */
  | { kind: 'below'; floorWeeks: number; enteredWeeks: number }

/**
 * Whether the floor check belongs on this field of this template. See the
 * `t15` note above — this is the guard that keeps individual-termination
 * figures out of a group-termination letter.
 */
export function appliesToNoticeField(
  questionId: string,
  templateFieldIds: readonly string[],
): boolean {
  return questionId === NOTICE_FIELD_ID && templateFieldIds.includes(TENURE_FIELD_ID)
}

/** Finite, non-negative numbers only; anything else is "not usable". */
function parseNonNegative(raw: string | undefined): number | null {
  if (raw === undefined) return null
  const trimmed = raw.trim()
  if (trimmed === '') return null
  const value = Number(trimmed)
  if (!Number.isFinite(value) || value < 0) return null
  return value
}

/**
 * Compare an entered notice figure against the statutory floor.
 *
 * Tenure is converted to *completed* months and floored, because the ESA bands
 * step on completed service — 6.9 years is still six completed years, and
 * rounding up would overstate the floor.
 */
export function assessNoticeFloor(
  jurisdiction: Jurisdiction,
  tenureYearsRaw: string | undefined,
  noticeWeeksRaw: string | undefined,
): NoticeFloorVerdict {
  const tenureYears = parseNonNegative(tenureYearsRaw)
  if (tenureYears === null) return { kind: 'unknown-tenure' }

  const floorWeeks = lookupStatutoryNoticeWeeks(jurisdiction, Math.floor(tenureYears * 12))
  /* null means the schedule is unpopulated for this jurisdiction — never zero.
     Treating it as zero would turn "we don't know" into "nothing is owed". */
  if (floorWeeks === null) return { kind: 'unavailable' }

  const enteredWeeks = parseNonNegative(noticeWeeksRaw)
  if (enteredWeeks === null) return { kind: 'informational', floorWeeks }

  return enteredWeeks < floorWeeks
    ? { kind: 'below', floorWeeks, enteredWeeks }
    : { kind: 'meets', floorWeeks, enteredWeeks }
}
