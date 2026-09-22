import { describe, expect, it } from 'vitest'
import { buildTextPdf, wrapLine, type TextPdfInput } from './textPdf'

const latin1 = (bytes: Uint8Array) => Array.from(bytes, (b) => String.fromCharCode(b)).join('')

function input(overrides: Partial<TextPdfInput> = {}): TextPdfInput {
  return {
    title: 'Termination Letter — Jordan Mensah',
    paragraphs: ['Dear Jordan,', 'This letter confirms the decision (effective July 19, 2026).'],
    footerLines: [
      'Exported from Dutiva — Northgate Logistics Inc. · Amara Osei (amara@northgate.ca) · 2026-07-30 18:04 UTC · Export ID de305d54-75b4-431b-adb2-eb6b9e546014.',
      'Confidential: for internal HR use only. This copy is traceable to the exporting account.',
    ],
    exportId: 'de305d54-75b4-431b-adb2-eb6b9e546014',
    author: 'Amara Osei (amara@northgate.ca)',
    workspaceLabel: 'Northgate Logistics Inc.',
    createdAt: new Date('2026-07-30T18:04:30Z'),
    ...overrides,
  }
}

describe('wrapLine', () => {
  it('wraps on words, hard-splits oversized words, never returns empty', () => {
    expect(wrapLine('a bb ccc', 6)).toEqual(['a bb', 'ccc'])
    expect(wrapLine('abcdefghij', 4)).toEqual(['abcd', 'efgh', 'ij'])
    expect(wrapLine('', 10)).toEqual([''])
  })
})

describe('buildTextPdf', () => {
  it('emits a structurally valid PDF whose xref offsets land on their objects', () => {
    const bytes = buildTextPdf(input())
    const file = latin1(bytes)
    expect(file.startsWith('%PDF-1.4\n')).toBe(true)
    expect(file.endsWith('%%EOF\n')).toBe(true)

    const startxref = /startxref\n(\d+)\n%%EOF\n$/.exec(file)
    expect(startxref).not.toBeNull()
    const xrefAt = Number(startxref![1])
    expect(file.slice(xrefAt, xrefAt + 4)).toBe('xref')

    /* Every xref entry must point at exactly its "N 0 obj" header. */
    const entries = [...file.slice(xrefAt).matchAll(/^(\d{10}) 00000 n $/gm)].map((m) =>
      Number(m[1]),
    )
    expect(entries.length).toBeGreaterThanOrEqual(7)
    entries.forEach((offset, i) => {
      expect(file.slice(offset, offset + `${i + 1} 0 obj`.length)).toBe(`${i + 1} 0 obj`)
    })
  })

  it('carries the export id in the Info dict and in every page footer', () => {
    const long = Array.from(
      { length: 120 },
      (_, i) =>
        `Paragraph ${i} — enough prose to take real vertical space on the page, wrapped over multiple lines to force pagination.`,
    )
    const bytes = buildTextPdf(input({ paragraphs: long }))
    const file = latin1(bytes)

    const pageCount = Number(/\/Count (\d+)/.exec(file)?.[1])
    expect(pageCount).toBeGreaterThan(1)
    expect(file).toContain('/Keywords (dutiva-export-id:de305d54-75b4-431b-adb2-eb6b9e546014)')
    /* Footer identity line on every page + the Keywords entry. */
    const idHits = file.split('de305d54-75b4-431b-adb2-eb6b9e546014').length - 1
    expect(idHits).toBe(pageCount + 1)
  })

  it('maps Québec French to WinAnsi and escapes PDF string delimiters', () => {
    const bytes = buildTextPdf(
      input({
        paragraphs: ["Congé payé — l'employée (Éloïse) reçoit un préavis.", 'Backslash \\ here.'],
      }),
    )
    const file = latin1(bytes)
    /* é U+00E9 passes through as its Latin-1 byte; — maps to cp1252 0x97. */
    const e = String.fromCharCode(0xe9)
    expect(file).toContain(`Cong${e} pay${e}`)
    expect(file).toContain(String.fromCharCode(0x97))
    /* Parens around Éloïse are escaped as PDF string delimiters. */
    expect(file).toContain(`\\(${String.fromCharCode(0xc9)}lo${String.fromCharCode(0xef)}se\\)`)
    expect(file).toContain('Backslash \\\\ here.')
  })

  it('drops zero-width fingerprint characters rather than rendering junk', () => {
    const bytes = buildTextPdf(input({ paragraphs: ['before\u2060\u200b\u200cafter'] }))
    expect(latin1(bytes)).toContain('beforeafter')
  })
})
