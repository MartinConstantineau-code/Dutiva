import { bi } from '@/i18n/core'
import type { Bi } from '@/i18n/core'
import { documentTemplatesByKey } from '@/data'
import { templateByTid } from '@/features/app/documents/data'
import { customTemplateByTid } from '@/features/app/documents/customTemplates'

/**
 * Friendly display title for a docstudio template key — tries the doclib
 * template set first (by tid), then the legacy flat fixture (by
 * title-string key), falling back to the raw key. Mirrors the resolution
 * order in DocStudioProvider's `resolveTemplate`; kept separate because
 * call sites that only render a label (case/employee document lists,
 * chat doc chips) don't need the full overlay-shape adapter.
 */
export function resolveDocTitle(key: string): Bi {
  const doclibTemplate = templateByTid.get(key) ?? customTemplateByTid.get(key)
  if (doclibTemplate) return doclibTemplate.name
  return documentTemplatesByKey[key]?.title ?? bi(key, key)
}
