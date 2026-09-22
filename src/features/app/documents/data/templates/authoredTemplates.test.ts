import { describe, expect, it } from 'vitest'
import { allTemplates } from '../../catalogue'
import { computedTokens, mergeSegments, resolveBlocks } from '../../engine'
import { common } from '@/i18n/messages/common'
import { DOC_DISCLAIMER_NOTE, templateCategories } from '../meta'
import type { DocTemplate, Jurisdiction } from '../types'

/**
 * Guards for every template authored in-repo — T21 up, the ones under
 * `data/templates/` that did not come from the handoff
 * (docs/FOUR_RING_FRAMEWORK.md).
 *
 * The handoff-derived templates were machine-generated from validated JSON,
 * so their bilingual completeness and token hygiene were guaranteed by the
 * generator. These were typed by hand, and the generator that would have
 * caught a missing `fr` or a merge field with no question behind it no longer
 * runs — so the checks it performed are asserted here instead.
 *
 * These are structural, not editorial: no test can tell you the French reads
 * well or the statute is named correctly. What they catch is a token that
 * renders as a literal `{{placeholder}}` in a customer's document, and copy
 * that silently ships English to a French workspace.
 */

/* Derived from the catalogue rather than listed, so a template authored
   without a matching test entry cannot slip through ungoverned. */
const AUTHORED_FROM = 21
const AUTHORED = allTemplates.filter((t) => Number(t.tid.slice(1)) >= AUTHORED_FROM)
const TIDS = AUTHORED.map((t) => t.tid)
const JURISDICTIONS: Jurisdiction[] = ['ON', 'QC', 'FED']

const template = (tid: string): DocTemplate => {
  const found = allTemplates.find((t) => t.tid === tid)
  if (!found) throw new Error(`missing template ${tid}`)
  return found
}

/** Every `Bi` reachable from a template, as [path, value] pairs. */
function biStrings(tpl: DocTemplate): [string, { en: string; fr: string }][] {
  const out: [string, { en: string; fr: string }][] = [
    ['name', tpl.name],
    ['desc', tpl.desc],
    ...tpl.statutory.map((s, i): [string, typeof s] => [`statutory[${i}]`, s]),
    ...Object.entries(tpl.jurisdictionNotes).map(([k, v]): [string, typeof v] => [
      `jurisdictionNotes.${k}`,
      v,
    ]),
    ...tpl.includes.map((s, i): [string, typeof s] => [`includes[${i}]`, s]),
  ]
  for (const [i, q] of tpl.questions.entries()) {
    out.push([`questions[${i}].section`, q.section], [`questions[${i}].label`, q.label])
    if (q.placeholder) out.push([`questions[${i}].placeholder`, q.placeholder])
    if (q.hint) out.push([`questions[${i}].hint`, q.hint])
    for (const [j, o] of (q.options ?? []).entries()) {
      out.push([`questions[${i}].options[${j}].label`, o.label])
    }
  }
  for (const [i, b] of tpl.preview.entries()) {
    if (b.text) out.push([`preview[${i}].text`, b.text])
    if (b.heading) out.push([`preview[${i}].heading`, b.heading])
    for (const [j, r] of (b.roles ?? []).entries()) {
      out.push([`preview[${i}].roles[${j}]`, r])
    }
  }
  return out
}

const TOKEN_RE = /\{\{([a-z0-9_]+)\}\}/g
const tokensIn = (text: string): string[] => [...text.matchAll(TOKEN_RE)].map((m) => m[1] ?? '')

describe.each(TIDS)('%s', (tid) => {
  it('covers all three jurisdictions, each with a note behind it', () => {
    const tpl = template(tid)
    expect([...tpl.jurisdictions].sort()).toEqual([...JURISDICTIONS].sort())
    /* A jurisdiction claimed in `jurisdictions` with no note behind it is the
       "implied coverage that doesn't exist" CANONICAL_FACTS §3 bars. */
    expect(Object.keys(tpl.jurisdictionNotes).sort()).toEqual([...JURISDICTIONS].sort())
  })

  it('sits in a category the catalogue actually defines', () => {
    expect(templateCategories.map((c) => c.id)).toContain(template(tid).category)
  })

  it('routes to lawyer review when it is marked high risk', () => {
    /* The three fields are read in different places — a card chip, the
       wizard's review gate, the repository filter — and a template that is
       high risk in one and routine in another sends mixed signals about the
       document a customer is about to send. */
    const tpl = template(tid)
    if (tpl.risk !== 'high') return
    expect(tpl.requiresLawyerReview, tid).toBe(true)
    expect(tpl.review, tid).toBe('lawyer_review_recommended')
  })

  it('ships every string in both languages, with no untranslated FR', () => {
    for (const [path, bi] of biStrings(template(tid))) {
      expect(bi.en.trim(), `${tid} ${path}.en`).not.toBe('')
      expect(bi.fr.trim(), `${tid} ${path}.fr`).not.toBe('')
      /* Prose copied verbatim into `fr` means it was never translated. Merge
         fields and short shared tokens legitimately match, so only sentences
         are compared. */
      if (bi.en.split(/\s+/).length > 3 && !bi.en.startsWith('{{')) {
        expect(bi.fr, `${tid} ${path} is untranslated`).not.toBe(bi.en)
      }
      /* Template copy renders as text, not markdown, so `**emphasis**` reaches
         the reader as asterisks — in a document they keep. The same guard the
         guides and flows carry. */
      expect(bi.en, `${tid} ${path}.en carries markdown`).not.toMatch(/\*\*/)
      expect(bi.fr, `${tid} ${path}.fr carries markdown`).not.toMatch(/\*\*/)
    }
  })

  it('resolves every merge field from a question or a computed token', () => {
    const tpl = template(tid)
    const answerable = new Set(tpl.questions.map((q) => q.id))
    const computed = new Set(Object.keys(computedTokens('ON', 'en', '2026-08-01')))

    for (const block of tpl.preview) {
      for (const lang of ['en', 'fr'] as const) {
        for (const token of tokensIn(block.text?.[lang] ?? '')) {
          expect(
            answerable.has(token) || computed.has(token),
            `${tid} renders {{${token}}} (${lang}) with nothing to fill it`,
          ).toBe(true)
        }
      }
    }
  })

  it('leaves no unfilled merge field once every question is answered', () => {
    const tpl = template(tid)
    const answers = Object.fromEntries(tpl.questions.map((q) => [q.id, 'x']))

    for (const jurisdiction of JURISDICTIONS) {
      const blocks = resolveBlocks(tpl, { jurisdiction, headcount: 38, unionized: true })
      for (const block of blocks) {
        const text = block.text?.en
        if (text === undefined) continue
        const filled = { ...answers, ...computedTokens(jurisdiction, 'en', '2026-08-01') }
        const unfilled = mergeSegments(text, filled).filter((s) => s.kind === 'unfilled')
        expect(unfilled, `${tid} ${jurisdiction}`).toEqual([])
      }
    }
  })
})

/* These run over the whole catalogue, not just the authored half. A guard that
   covered T21 up would have left 16 shipped documents free to drift — which is
   exactly how three different disclaimer wordings got in unnoticed. */
describe.each(allTemplates.map((t) => t.tid))('%s (whole catalogue)', (tid) => {
  it('numbers its clauses once each, in every jurisdiction', () => {
    /* Gated alternatives share a number by design — one of them renders. Two
       clauses that render *together* and share one do not: the document shows
       two clause 11s, and `blockKey` derives a React key from the number, so
       they also collide. Found in review after jurisdiction-gated clauses were
       added either side of an existing one. */
    const tpl = template(tid)
    for (const jurisdiction of JURISDICTIONS) {
      const ns = resolveBlocks(tpl, { jurisdiction, headcount: 38, unionized: false })
        .filter((b) => b.n !== undefined)
        .map((b) => b.n)
      expect(new Set(ns).size, `${tid} ${jurisdiction} repeats a clause number`).toBe(ns.length)
    }
  })

  it('carries the standing disclaimer verbatim, in a note of its own', () => {
    /* CONVENTIONS.md says never retype it. A template carries it as a `note`
       block rather than through the shared `Disclaimer` component, so "never
       retyped" has to mean referencing `DOC_DISCLAIMER_NOTE` — and a note that
       is the disclaimer *plus* the template's own guidance is how the wording
       drifted apart in the first place. Say your own thing in your own note. */
    const notes = template(tid).preview.filter((b) => b.type === 'note')
    const disclaimers = notes.filter(
      (b) => b.text?.en.includes('legal advice') || b.text?.fr.includes('conseils juridiques'),
    )
    expect(disclaimers, `${tid} has no disclaimer note`).toHaveLength(1)
    expect(disclaimers[0]?.text, `${tid} disclaimer is not DOC_DISCLAIMER_NOTE`).toEqual(
      DOC_DISCLAIMER_NOTE,
    )
  })

  it('uses the repository’s disclaimer sentence, not one of its own', () => {
    /* The sentence itself is `common.disclaimer` — the string CONVENTIONS.md
       names. Centralizing on a fourth wording would have replaced three
       variants with one wrong one. */
    expect(DOC_DISCLAIMER_NOTE.en).toContain(common.disclaimer.en)
    expect(DOC_DISCLAIMER_NOTE.fr).toContain(common.disclaimer.fr)
  })
})

describe('the accommodation category', () => {
  it('holds the whole workflow, including the two recategorized legacy documents', () => {
    const tids = allTemplates.filter((t) => t.category === 'accommodation').map((t) => t.tid)
    /* T19/T20 moved here from `discipline` — filing an accommodation record
       under discipline misstates what the document is. */
    expect(tids).toEqual(['T19', 'T20', 'T21', 'T22', 'T23', 'T24'])
  })

  it('marks the two refusal-bearing documents high risk', () => {
    /* T22 (the answer the employee receives) and T24 (the record behind it)
       are the two an employer is asked to produce when a refusal is
       challenged. The lawyer-review routing that follows from `high` is
       asserted for every authored template above. */
    for (const tid of ['T22', 'T24']) {
      expect(template(tid).risk, tid).toBe('high')
    }
  })
})

describe('jurisdiction-specific rules stay in jurisdiction notes', () => {
  /* The failure this guards is the one the review on #122 found twice and a
     later audit found again: a rule that holds in one jurisdiction, written
     into copy that renders for all three.
     `jurisdictionNotes` are the only place the reader sees a rule attributed
     to a jurisdiction, so anything jurisdictional has to live there. */
  /**
   * Every `Bi` on the template that is NOT scoped to a jurisdiction — both
   * languages, and every field, via the same walker the bilingual test uses.
   * Anything reachable from here reaches a reader who may be in any of the
   * three jurisdictions.
   *
   * Jurisdiction-gated preview blocks are excluded too: a block carrying
   * `when.juris` resolves only for that jurisdiction, so it is as scoped as a
   * note is.
   */
  const universalStrings = (tid: string): string => {
    const tpl = template(tid)
    const gatedBlockIndexes = new Set(
      tpl.preview.flatMap((b, i) => (b.when?.juris !== undefined ? [i] : [])),
    )
    return biStrings(tpl)
      .filter(([path]) => !path.startsWith('jurisdictionNotes.'))
      .filter(([path]) => {
        const match = /^preview\[(\d+)\]/.exec(path)
        return match === null || !gatedBlockIndexes.has(Number(match[1]))
      })
      .flatMap(([, bi]) => [bi.en, bi.fr])
      .join('\n')
  }

  it('does not state Ontario’s closed list of hardship factors as universal', () => {
    /* Ontario's Code confines undue hardship to cost, outside funding, and
       health and safety, so employee morale is out. Québec names no list and
       weighs the whole of the circumstances, where disruption to the operation
       or the team can count. Saying "morale is not undue hardship" to every
       reader is therefore wrong for a Québec one.
       Checked in both languages: the French original said `moral du personnel`
       and could come back on its own. */
    const universal = universalStrings('T24')
    expect(universal).not.toMatch(/morale/i)
    expect(universal).not.toMatch(/moral du personnel/i)

    /* And it must still be said where it is true. */
    expect(template('T24').jurisdictionNotes.ON?.en).toMatch(/morale/i)
    expect(template('T24').jurisdictionNotes.ON?.fr).toMatch(/moral du personnel/i)
  })

  it('keeps the rules that do hold everywhere', () => {
    /* The opposite failure — hedging a claim that is actually universal until
       it says nothing. Business inconvenience and customer preference carry a
       refusal nowhere, and the document should still say so plainly. */
    const universal = universalStrings('T24')
    expect(universal).toMatch(/inconvenience/i)
    expect(universal).toMatch(/preference/i)
  })

  it('renders the applicable test in the document, not only in a note', () => {
    /* `jurisdictionNotes` show on the template detail screen; a generated or
       exported document renders `preview` through `resolveBlocks` and nothing
       else. A worksheet that told its reader to consult a note the artifact
       does not carry would be pointing at nothing. */
    const tpl = template('T24')
    for (const jurisdiction of JURISDICTIONS) {
      const blocks = resolveBlocks(tpl, { jurisdiction, headcount: 38, unionized: false })
      const testClauses = blocks.filter((b) => b.heading?.en === 'The test that applies here')
      expect(testClauses, jurisdiction).toHaveLength(1)
    }
  })

  it('gives every jurisdiction somewhere to record what it may rely on', () => {
    /* Québec's wider set is only real if the worksheet collects it. Without a
       field for it, the note would describe factors the document has no room
       for and the conclusion would rest on the narrower list regardless. */
    expect(template('T24').questions.map((q) => q.id)).toContain('other_factors')
  })
})

describe('medical privacy across every authored template', () => {
  it('never asks for a diagnosis', () => {
    /* The constraint the framework puts on Pillar B, and it does not stop
       there — the attendance policy and the return-from-leave letter reach
       for the same information. Asking for a diagnosis is a privacy failure
       rather than a wording preference, so every mention anywhere in the
       authored set must be a prohibition. */
    for (const tid of TIDS) {
      const tpl = template(tid)
      const prose = [
        ...tpl.questions.flatMap((q) => [q.label.en, q.placeholder?.en ?? '', q.hint?.en ?? '']),
        ...tpl.preview.map((b) => b.text?.en ?? ''),
      ]
      for (const line of prose) {
        if (!/diagnosis/i.test(line)) continue
        expect(line, `${tid}: "${line}"`).toMatch(/\b(not|never|no|without)\b/i)
      }
    }
  })
})

describe('T31 investigation report — the federal de-identification rule', () => {
  /* The Work Place Harassment and Violence Prevention Regulations require an
     investigator's report not to reveal, directly or indirectly, anyone
     involved. ON and QC have no such rule and naming the parties there is
     normal, so the report is jurisdiction-split rather than de-identified
     everywhere — which is exactly the kind of split that decays silently. */
  const blocksFor = (jurisdiction: Jurisdiction) =>
    resolveBlocks(template('T31'), { jurisdiction, headcount: 38, unionized: false })
      .map((b) => b.text?.en ?? '')
      .join('\n')

  it('states the requirement on the face of the federal report', () => {
    expect(blocksFor('FED')).toMatch(/de-identified/i)
  })

  it('does not impose it on ON or QC, where no such rule applies', () => {
    expect(blocksFor('ON')).not.toMatch(/de-identified/i)
    expect(blocksFor('QC')).not.toMatch(/de-identified/i)
  })

  it('renders exactly one parties clause per jurisdiction', () => {
    /* Two gated ON/QC variants plus a FED one — a copy-paste slip that leaves
       two matching the same jurisdiction shows up as a duplicated clause in a
       customer's document, not as a type error. */
    for (const jurisdiction of JURISDICTIONS) {
      const parties = resolveBlocks(template('T31'), {
        jurisdiction,
        headcount: 38,
        unionized: false,
      }).filter((b) => b.heading?.en === 'Parties')
      expect(parties, jurisdiction).toHaveLength(1)
    }
  })
})

describe('the Ring 1 gaps the framework listed', () => {
  it('are all closed', () => {
    /* docs/FOUR_RING_FRAMEWORK.md recorded eight Ring 1 tools from the April
       framework with no template, plus the accommodation response. If one of
       these keys disappears, the framework doc's Ring 1 section is wrong and
       needs updating with it. */
    const keys = new Set(allTemplates.map((t) => t.key))
    for (const key of [
      'accommodation_response',
      'probationary_period_review',
      'promotion_salary_adjustment',
      'return_from_leave_confirmation',
      'attendance_policy',
      'roe_preparation_guide',
      'reference_letter',
      'investigation_report',
      'layoff_notice',
    ]) {
      expect(keys, key).toContain(key)
    }
  })
})
