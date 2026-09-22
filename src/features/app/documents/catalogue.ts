import { docTemplates } from './data'
import type { DocTemplate } from './data'
import { customTemplates } from './customTemplates'

/**
 * The template catalogue Dutiva actually ships, from both sources: the
 * handoff-derived and in-repo-authored templates under `data/templates/`,
 * plus the ported legacy ones in `customTemplates.ts`.
 *
 * It exists because the split between those two files is provenance, not
 * product — and consumers that reached for `docTemplates` alone were
 * silently under-reporting. `/templates` claimed a smaller catalogue than
 * Document Studio rendered, and `docs/CANONICAL_FACTS.md` derived its
 * "templates shipped" figure from the same partial list. Count and list
 * templates from here; import `docTemplates` only when you specifically mean
 * that one file's contents.
 *
 * Sorted by tid so the catalogue reads in one sequence rather than
 * source-file order — which would otherwise interleave as T01…T16, T21…T24,
 * T17…T20 and make "T01…T20" the apparent range of a 24-template list.
 */
export const allTemplates: DocTemplate[] = [...docTemplates, ...customTemplates].sort((a, b) =>
  a.tid.localeCompare(b.tid),
)
