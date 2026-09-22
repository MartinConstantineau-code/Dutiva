import { describe, expect, it } from 'vitest'
import { LEGAL_HUB_GROUPS } from './legalHubData'
import { groupPolicyBlocks, loadPolicyEdition, policyDoc } from './policyContent'
import type { PolicyDoc, PolicyEdition } from './policyContent'

describe('policy content collection', () => {
  const hubSlugs = LEGAL_HUB_GROUPS.flatMap((group) => group.rows.map((row) => row.slug))

  it('lists 26 unique documents on the hub', () => {
    expect(hubSlugs).toHaveLength(26)
    expect(new Set(hubSlugs).size).toBe(26)
  })

  it('ships BOTH language editions for every hub document', () => {
    for (const slug of hubSlugs) {
      const doc = policyDoc(slug)
      expect(doc, slug).toBeDefined()
      expect(doc?.en, `${slug} is missing its EN edition`).toBeDefined()
      expect(doc?.fr, `${slug} is missing its FR edition`).toBeDefined()
    }
  })

  it('every edition has a title and at least one section', async () => {
    for (const slug of hubSlugs) {
      const doc = policyDoc(slug)
      for (const load of [doc?.en, doc?.fr]) {
        const edition = await load?.()
        expect(edition?.title, slug).toBeTruthy()
        expect(edition?.sections.length, slug).toBeGreaterThan(0)
      }
    }
  })
})

describe('loadPolicyEdition', () => {
  const editionLoader =
    (title: string): (() => Promise<PolicyEdition>) =>
    () =>
      Promise.resolve({ title, sections: [] })

  it('prefers the requested language', async () => {
    const doc: PolicyDoc = { slug: 'x', en: editionLoader('EN'), fr: editionLoader('FR') }
    await expect(loadPolicyEdition(doc, 'en')).resolves.toEqual({
      edition: { title: 'EN', sections: [] },
      lang: 'en',
    })
    await expect(loadPolicyEdition(doc, 'fr')).resolves.toEqual({
      edition: { title: 'FR', sections: [] },
      lang: 'fr',
    })
  })

  it('falls back to the other language when the requested edition is missing', async () => {
    const frOnly: PolicyDoc = { slug: 'x', fr: editionLoader('FR') }
    await expect(loadPolicyEdition(frOnly, 'en')).resolves.toEqual({
      edition: { title: 'FR', sections: [] },
      lang: 'fr',
    })
    const enOnly: PolicyDoc = { slug: 'x', en: editionLoader('EN') }
    await expect(loadPolicyEdition(enOnly, 'fr')).resolves.toEqual({
      edition: { title: 'EN', sections: [] },
      lang: 'en',
    })
  })

  it('returns undefined when no edition exists', async () => {
    await expect(loadPolicyEdition({ slug: 'x' }, 'en')).resolves.toBeUndefined()
  })
})

describe('groupPolicyBlocks', () => {
  it('groups consecutive li runs into lists and keeps paragraphs standalone', () => {
    expect(
      groupPolicyBlocks([
        { type: 'p', text: 'a' },
        { type: 'li', text: 'b' },
        { type: 'li', text: 'c' },
        { type: 'p', text: 'd' },
        { type: 'li', text: 'e' },
      ]),
    ).toEqual([
      { kind: 'p', text: 'a' },
      { kind: 'list', items: ['b', 'c'] },
      { kind: 'p', text: 'd' },
      { kind: 'list', items: ['e'] },
    ])
  })
})
