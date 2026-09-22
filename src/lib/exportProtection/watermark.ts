import type { Bi, Lang } from '@/i18n/core'
import { bi, pick } from '@/i18n/core'
import { exportProtectionMessages as M } from '@/i18n/messages/exportProtection'
import { encodeInvisibleTag } from './fingerprint'

/**
 * Visible watermark for exported artifacts — the human-readable channel of
 * the export fingerprint (see fingerprint.ts for the full three-channel
 * rationale). One identity line + one confidentiality line, stamped at the
 * end of text/Word exports and on every PDF page footer.
 */

/** Everything a watermark says about one export. */
export interface ExportStamp {
  exportId: string
  /** "Name (email)" — or a workspace label when no real account is signed in. */
  actorLabel: string
  workspaceLabel: string
  exportedAt: Date
}

/** `2026-07-30 18:04` — UTC, built from parts so the output never depends on
 * host locale. Minutes are enough: the second lives in the audit row. */
export function formatStampTime(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0')
  return (
    `${date.getUTCFullYear()}-${pad(date.getUTCMonth() + 1)}-${pad(date.getUTCDate())}` +
    ` ${pad(date.getUTCHours())}:${pad(date.getUTCMinutes())}`
  )
}

function fillNotice(template: string, stamp: ExportStamp): string {
  return template
    .replace('{workspace}', stamp.workspaceLabel)
    .replace('{actor}', stamp.actorLabel)
    .replace('{ts}', formatStampTime(stamp.exportedAt))
    .replace('{id}', stamp.exportId)
}

/** The identity line, both languages (state that outlives a render stays Bi). */
export function watermarkNotice(stamp: ExportStamp): Bi {
  return bi(
    fillNotice(M.exportprot_notice_line.en, stamp),
    fillNotice(M.exportprot_notice_line.fr, stamp),
  )
}

/** Identity line + confidentiality line in one language, for artifact footers. */
export function watermarkFooterLines(stamp: ExportStamp, lang: Lang): [string, string] {
  return [pick(watermarkNotice(stamp), lang), pick(M.exportprot_notice_confidential, lang)]
}

/**
 * Watermarks plain text: content, then the visible two-line notice, with the
 * invisible tag appended directly after the content's last character — ahead
 * of the visible lines, so trimming the footer off the end does not also trim
 * the tag.
 */
export function applyTextWatermark(content: string, stamp: ExportStamp, lang: Lang): string {
  const [identity, confidential] = watermarkFooterLines(stamp, lang)
  return `${content}${encodeInvisibleTag(stamp.exportId)}\n\n— — —\n${identity}\n${confidential}\n`
}
