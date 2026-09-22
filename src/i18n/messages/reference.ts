import { defineMessages } from '../core'

/**
 * In-product reference guides — the chrome around guide content
 * (docs/FOUR_RING_FRAMEWORK.md). No prototype counterpart: the Knowledge view
 * in the App v2 handoff listed titles with no bodies, so every string here is
 * authored and all FR is [FR self-authored] Québec French.
 *
 * Guide *content* lives with the guide in `src/features/app/reference/data/`.
 */
export const referenceMessages = defineMessages({
  reference_section_label: { en: 'Reference guides', fr: 'Guides de référence' },
  reference_section_intro: {
    en: 'Written for the person doing the work, with the jurisdiction notes attached.',
    fr: 'Rédigés pour la personne qui fait le travail, avec les notes par juridiction.',
  },
  reference_minutes: { en: 'min read', fr: 'min de lecture' },
  reference_by_jurisdiction: { en: 'By jurisdiction', fr: 'Par juridiction' },
  reference_instead: { en: 'Say this', fr: 'À dire' },
  reference_not_this: { en: 'Not this', fr: 'À éviter' },
  reference_related_templates: { en: 'Documents this supports', fr: 'Documents visés' },
  reference_related_flows: { en: 'Process this supports', fr: 'Processus visé' },
  reference_back: { en: 'Back to knowledge', fr: 'Retour aux connaissances' },
  reference_not_found: { en: 'That guide does not exist.', fr: 'Ce guide n’existe pas.' },
  reference_open: { en: 'Open', fr: 'Ouvrir' },
})
