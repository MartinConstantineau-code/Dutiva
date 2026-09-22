import { describe, expect, it } from 'vitest'
import { decodeInvisibleTag } from './fingerprint'
import {
  applyTextWatermark,
  formatStampTime,
  watermarkFooterLines,
  watermarkNotice,
  type ExportStamp,
} from './watermark'

const stamp: ExportStamp = {
  exportId: 'de305d54-75b4-431b-adb2-eb6b9e546014',
  actorLabel: 'Amara Osei (amara@northgate.ca)',
  workspaceLabel: 'Northgate Logistics Inc.',
  exportedAt: new Date('2026-07-30T18:04:30Z'),
}

describe('export watermark', () => {
  it('formats the stamp time as locale-independent UTC', () => {
    expect(formatStampTime(stamp.exportedAt)).toBe('2026-07-30 18:04')
  })

  it('carries identity, workspace, time and export id in both languages', () => {
    const notice = watermarkNotice(stamp)
    for (const line of [notice.en, notice.fr]) {
      expect(line).toContain('Amara Osei (amara@northgate.ca)')
      expect(line).toContain('Northgate Logistics Inc.')
      expect(line).toContain('2026-07-30 18:04')
      expect(line).toContain(stamp.exportId)
    }
    expect(notice.en).toContain('Exported from Dutiva')
    expect(notice.fr).toContain('Exporté de Dutiva')
  })

  it('footer pairs the identity line with the confidentiality line', () => {
    const [identity, confidential] = watermarkFooterLines(stamp, 'en')
    expect(identity).toContain(stamp.exportId)
    expect(confidential).toContain('Confidential')
    const [, confidentialFr] = watermarkFooterLines(stamp, 'fr')
    expect(confidentialFr).toContain('Confidentiel')
  })

  it('watermarked text keeps the content, shows the notice, and hides a decodable tag', () => {
    const content = 'Dear Jordan,\n\nThis letter confirms…'
    const marked = applyTextWatermark(content, stamp, 'en')
    expect(marked.startsWith(content)).toBe(true)
    expect(marked).toContain('Exported from Dutiva')
    expect(decodeInvisibleTag(marked)).toBe(stamp.exportId)
    /* The tag sits with the content, ahead of the visible footer — cropping
       the footer must not crop the tag. */
    const footerStart = marked.indexOf('— — —')
    expect(decodeInvisibleTag(marked.slice(0, footerStart))).toBe(stamp.exportId)
  })
})
