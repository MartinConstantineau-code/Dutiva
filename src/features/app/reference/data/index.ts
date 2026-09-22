import type { ReferenceGuide } from '../guideModel'
import { bystanderInterventionGuide } from './bystanderIntervention'
import { eapReferralGuide } from './eapReferral'
import { functionalLimitationsGuide } from './functionalLimitations'
import { managerConversationsGuide } from './managerConversations'
import { parentalLeaveGuide } from './parentalLeave'
import { payStatementGuide } from './payStatement'
import { retirementSavingsGuide } from './retirementSavings'
import { returnAfterMentalHealthLeaveGuide } from './returnAfterMentalHealthLeave'

/**
 * Every in-product reference guide. Adding one here gives it a route at
 * `/app/knowledge/<slug>` and a card at the top of the Knowledge view — see
 * docs/FOUR_RING_FRAMEWORK.md before authoring.
 */
export const referenceGuides: ReferenceGuide[] = [
  functionalLimitationsGuide,
  parentalLeaveGuide,
  managerConversationsGuide,
  eapReferralGuide,
  returnAfterMentalHealthLeaveGuide,
  bystanderInterventionGuide,
  payStatementGuide,
  retirementSavingsGuide,
]

export const guideBySlug = new Map(referenceGuides.map((g) => [g.slug, g]))
