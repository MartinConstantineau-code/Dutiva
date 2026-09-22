import { defineMessages } from '../core'

/**
 * Templates / Document Studio gallery view (`buildTemplatesView()` in
 * App v2.dc.html). The prototype's gallery markup carries no chrome strings —
 * every tile renders fixture data (template title + category) — so this
 * module only holds the accessibility label for the gallery region.
 *
 * NOTE: registered in src/i18n/messages/index.ts by the integration owner.
 * The view resolves these via `useI18n().x(templatesMessages.key)`.
 */
export const templatesMessages = defineMessages({
  /* Self-authored (no prototype string): aria-label for the tile gallery. */
  templates_gallery_aria: { en: 'Document templates', fr: 'Modèles de documents' },
})
