/**
 * Minimal text-document PDF writer — dependency-free on purpose.
 *
 * "Export PDF" used to be a demo toast; making it real with a PDF library
 * would add ~300KB to the app chunk for what is, for these documents, plain
 * paginated prose. A letter-format text PDF is small enough to emit by hand:
 * Helvetica + WinAnsi (covers Québec French), word-wrapped paragraphs, and —
 * the reason this module exists — the export watermark on every page plus
 * the export id in the document Info dictionary. Cropping the last page or
 * re-saving the file does not shed the id (see fingerprint.ts for the
 * channel model; zero-width tags don't survive PDF text encoding, so here
 * the metadata channel does that job).
 *
 * Deliberately not a general PDF library: one font family, no images, no
 * links. If exports outgrow prose, revisit with a real dependency.
 */

export interface TextPdfInput {
  title: string
  /** Body paragraphs, already localized; blank-line separated in the output. */
  paragraphs: string[]
  /** Watermark identity + confidentiality lines — stamped on every page. */
  footerLines: [string, string]
  exportId: string
  /** Info-dict attribution: who exported, from which workspace. */
  author: string
  workspaceLabel: string
  createdAt: Date
}

/* Letter, 1in-ish margins tuned for a 10.5pt body. */
const PAGE_W = 612
const PAGE_H = 792
const MARGIN_X = 56
const BODY_TOP = 716
const BODY_BOTTOM = 84
const TITLE_SIZE = 13
const BODY_SIZE = 10.5
const BODY_LEADING = 15.5
const FOOTER_SIZE = 6.5

/** ~chars per body line at Helvetica's ≈0.5em average advance. */
const BODY_WRAP = Math.floor((PAGE_W - MARGIN_X * 2) / (BODY_SIZE * 0.5))

/** Typographic characters the app's copy actually uses, mapped to their
 * WinAnsi (cp1252) bytes; Latin-1 (é, à, ç…) passes through untouched. */
const CP1252: Record<string, number> = {
  '€': 0x80,
  '‚': 0x82,
  '„': 0x84,
  '…': 0x85,
  '†': 0x86,
  '‡': 0x87,
  '‰': 0x89,
  '‹': 0x8b,
  Œ: 0x8c,
  '‘': 0x91,
  '’': 0x92,
  '“': 0x93,
  '”': 0x94,
  '•': 0x95,
  '–': 0x96,
  '—': 0x97,
  '˜': 0x98,
  '™': 0x99,
  '›': 0x9b,
  œ: 0x9c,
  Ÿ: 0x9f,
}

/** JS string → WinAnsi byte string. Zero-width characters are dropped (they
 * have no WinAnsi form and would render as junk); anything else unmappable
 * becomes '?'. */
function toWinAnsi(text: string): string {
  let out = ''
  for (const char of text) {
    const code = char.codePointAt(0) ?? 0
    if (code === 0x200b || code === 0x200c || code === 0x200d || code === 0x2060) continue
    if (code === 0x09) {
      out += '  '
    } else if (code >= 0x20 && code <= 0x7e) {
      out += char
    } else if (code >= 0xa0 && code <= 0xff) {
      out += String.fromCharCode(code)
    } else if (CP1252[char] !== undefined) {
      out += String.fromCharCode(CP1252[char])
    } else {
      out += '?'
    }
  }
  return out
}

/** WinAnsi bytes → PDF literal string body (escape \ ( ) and newlines). */
function pdfEscape(winAnsi: string): string {
  return winAnsi
    .replaceAll('\\', '\\\\')
    .replaceAll('(', '\\(')
    .replaceAll(')', '\\)')
    .replaceAll('\r', '\\r')
    .replaceAll('\n', '\\n')
}

const str = (text: string) => `(${pdfEscape(toWinAnsi(text))})`

/** Greedy word wrap at `width` chars; hard-splits words longer than a line. */
export function wrapLine(line: string, width: number): string[] {
  const words = line.split(' ')
  const out: string[] = []
  let current = ''
  for (let word of words) {
    while (word.length > width) {
      if (current) {
        out.push(current)
        current = ''
      }
      out.push(word.slice(0, width))
      word = word.slice(width)
    }
    if (!current) current = word
    else if (current.length + 1 + word.length <= width) current += ` ${word}`
    else {
      out.push(current)
      current = word
    }
  }
  if (current) out.push(current)
  return out.length > 0 ? out : ['']
}

interface Line {
  text: string
  bold: boolean
  /** Extra leading before this line (paragraph gap). */
  gap: number
}

function layoutLines(input: TextPdfInput): Line[] {
  const lines: Line[] = []
  for (const wrapped of wrapLine(
    input.title,
    Math.floor((PAGE_W - MARGIN_X * 2) / (TITLE_SIZE * 0.55)),
  )) {
    lines.push({ text: wrapped, bold: true, gap: 0 })
  }
  for (const paragraph of input.paragraphs) {
    let first = true
    for (const raw of paragraph.split('\n')) {
      for (const wrapped of wrapLine(raw, BODY_WRAP)) {
        lines.push({ text: wrapped, bold: false, gap: first ? BODY_LEADING * 0.75 : 0 })
        first = false
      }
    }
  }
  return lines
}

/** One page's content stream: body lines, then the gray watermark footer. */
function pageStream(lines: Line[], footer: [string, string], firstPage: boolean): string {
  let y = BODY_TOP
  const ops: string[] = []
  for (const line of lines) {
    y -= line.gap
    const size = line.bold ? TITLE_SIZE : BODY_SIZE
    ops.push(
      `BT /${line.bold ? 'F2' : 'F1'} ${size} Tf ${MARGIN_X} ${y.toFixed(1)} Td ${str(line.text)} Tj ET`,
    )
    y -= line.bold ? TITLE_SIZE + 6 : BODY_LEADING
  }
  if (firstPage) {
    /* Rule under the title block. */
    ops.push(
      `0.82 0.84 0.87 RG 0.75 w ${MARGIN_X} ${(BODY_TOP - TITLE_SIZE - 2).toFixed(1)} m ${PAGE_W - MARGIN_X} ${(BODY_TOP - TITLE_SIZE - 2).toFixed(1)} l S`,
    )
  }
  ops.push('0.45 0.47 0.51 rg')
  ops.push(`BT /F1 ${FOOTER_SIZE} Tf ${MARGIN_X} 40 Td ${str(footer[0])} Tj ET`)
  ops.push(`BT /F1 ${FOOTER_SIZE} Tf ${MARGIN_X} 31 Td ${str(footer[1])} Tj ET`)
  return ops.join('\n')
}

/** Splits laid-out lines into pages by vertical budget. */
function paginate(lines: Line[]): Line[][] {
  const pages: Line[][] = []
  let page: Line[] = []
  let y = BODY_TOP
  for (const line of lines) {
    const advance = line.gap + (line.bold ? TITLE_SIZE + 6 : BODY_LEADING)
    if (y - advance < BODY_BOTTOM && page.length > 0) {
      pages.push(page)
      page = []
      y = BODY_TOP
    }
    page.push(y === BODY_TOP ? { ...line, gap: 0 } : line)
    y -= advance
  }
  if (page.length > 0) pages.push(page)
  return pages.length > 0 ? pages : [[]]
}

const pad10 = (n: number) => String(n).padStart(10, '0')

function infoDate(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0')
  return (
    `D:${date.getUTCFullYear()}${pad(date.getUTCMonth() + 1)}${pad(date.getUTCDate())}` +
    `${pad(date.getUTCHours())}${pad(date.getUTCMinutes())}${pad(date.getUTCSeconds())}Z`
  )
}

/**
 * Assembles the file. Every object's byte offset is tracked as it is
 * appended so the xref table is exact — textPdf.test.ts re-parses the xref
 * and checks each offset lands on its object header.
 */
export function buildTextPdf(input: TextPdfInput): Uint8Array {
  const pages = paginate(layoutLines(input))
  const footer: [string, string] = input.footerLines

  /* Object numbering: 1 catalog, 2 pages, 3/4 fonts, 5 info, then per page
     i: 6+2i page, 7+2i stream. */
  const pageObj = (i: number) => 6 + i * 2
  const streamObj = (i: number) => 7 + i * 2
  const kids = pages.map((_, i) => `${pageObj(i)} 0 R`).join(' ')

  const objects: string[] = [
    `<< /Type /Catalog /Pages 2 0 R >>`,
    `<< /Type /Pages /Kids [${kids}] /Count ${pages.length} >>`,
    `<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>`,
    `<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>`,
    `<< /Producer (Dutiva export protection) /Title ${str(input.title)} /Author ${str(input.author)} ` +
      `/Subject ${str(input.workspaceLabel)} /Keywords (dutiva-export-id:${input.exportId}) ` +
      `/CreationDate (${infoDate(input.createdAt)}) >>`,
  ]
  pages.forEach((lines, i) => {
    objects.push(
      `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${PAGE_W} ${PAGE_H}] ` +
        `/Resources << /Font << /F1 3 0 R /F2 4 0 R >> >> /Contents ${streamObj(i)} 0 R >>`,
    )
    const stream = pageStream(lines, footer, i === 0)
    objects.push(`<< /Length ${stream.length} >>\nstream\n${stream}\nendstream`)
  })

  let file = '%PDF-1.4\n%âãÏÓ\n'
  const offsets: number[] = []
  objects.forEach((body, index) => {
    offsets.push(file.length)
    file += `${index + 1} 0 obj\n${body}\nendobj\n`
  })
  const xrefAt = file.length
  file += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`
  for (const offset of offsets) file += `${pad10(offset)} 00000 n \n`
  file +=
    `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R /Info 5 0 R >>\n` +
    `startxref\n${xrefAt}\n%%EOF\n`

  return Uint8Array.from(file, (c) => c.charCodeAt(0) & 0xff)
}
