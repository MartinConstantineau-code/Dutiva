import { defineMessages } from '../core'

/** Strings shared across surfaces: brand, disclaimer, generic actions. */
export const common = defineMessages({
  brand_name: { en: 'Dutiva', fr: 'Dutiva' },
  disclaimer: {
    en: 'Dutiva provides practical HR workflow support and compliance-oriented guidance. It does not provide legal advice.',
    fr: 'Dutiva offre un soutien pratique aux flux de travail RH et des conseils axés sur la conformité. Il ne fournit pas de conseils juridiques.',
  },
  /* Prototype `disclaimer_short` — the composer/footer footnote. */
  disclaimer_short: {
    en: 'Advisor provides compliance-oriented HR guidance — not legal advice. Verify important decisions.',
    fr: 'Conseiller fournit des conseils RH axés sur la conformité — pas des avis juridiques. Vérifiez les décisions importantes.',
  },
  /* Prototype `disclaimer_full` — near generated documents and legal records. */
  disclaimer_full: {
    en: 'Dutiva provides compliance-oriented HR workflow support and does not provide legal advice. For high-risk employment decisions, consult qualified legal counsel.',
    fr: "Dutiva fournit un soutien opérationnel en matière de conformité RH et ne fournit pas de conseils juridiques. Pour les décisions d'emploi à risque élevé, consultez un conseiller juridique qualifié.",
  },
  theme_toggle_aria: { en: 'Toggle dark mode', fr: 'Basculer le mode sombre' },
  lang_en_aria: { en: 'English', fr: 'English' },
  lang_fr_aria: { en: 'Français', fr: 'Français' },
})
