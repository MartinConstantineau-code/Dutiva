import { describe, expect, it } from 'vitest'
import { ALL_ARTICLES } from './index'
import type { Article } from './articleModel'
import { articleSections, BLOG_SECTIONS, GUIDE_SECTIONS } from './content'
import { editorialFigureIn } from './editorialFigures'

/**
 * Enforcement for the editorial rule stated at the top of `articleModel.ts`:
 * articles explain concepts, decision points and what to document, and
 * deliberately **do not publish statutory figures** — notice-week tables,
 * dollar thresholds, deadline counts — because those go stale, vary by
 * jurisdiction and fact pattern, and become compliance representations the
 * moment they are wrong.
 *
 * The rule held by hand, but it lived only in a doc comment, so an article
 * containing "eight weeks' notice" would have shipped green. These pages are
 * prerendered, indexed and GEO-targeted at answer engines (docs/
 * SEO_GEO_IMPLEMENTATION.md), which means a wrong figure here does not stay
 * here — it gets quoted onward, by machines, without the disclaimer that sits
 * next to it on the page.
 *
 * The detector lives in `./editorialFigures.ts`, which documents why it is
 * deliberately stricter than the Advisor's runtime `statutoryFigures.ts`:
 * authored prose is checked before it ships, so a false positive costs one
 * rephrase, while a false negative reaches an indexed page.
 *
 * If a future article genuinely needs a figure, that is a decision to make
 * deliberately — change the rule in `articleModel.ts` and this test together,
 * rather than letting one article quietly become the exception.
 */

/** Every authored string in an article, labelled for a readable failure. */
function strings(article: Article): { where: string; text: string }[] {
  const out = [
    { where: 'title', text: article.title },
    { where: 'summary', text: article.summary },
    { where: 'topic', text: article.topic },
  ].flatMap(({ where, text }) => [
    { where: `${where} (en)`, text: text.en },
    { where: `${where} (fr)`, text: text.fr },
  ])

  articleSections(article.collection, article.slug).forEach((section, s) => {
    if (section.heading) {
      out.push({ where: `section ${s} heading (en)`, text: section.heading.en })
      out.push({ where: `section ${s} heading (fr)`, text: section.heading.fr })
    }
    section.blocks.forEach((block, b) => {
      out.push({ where: `section ${s} block ${b} (en)`, text: block.text.en })
      out.push({ where: `section ${s} block ${b} (fr)`, text: block.text.fr })
    })
  })

  return out
}

describe('editorial rule: articles publish no statutory figures', () => {
  it('has articles to check', () => {
    /* Guards the suite itself: an empty corpus would pass every assertion
       below while checking nothing. */
    expect(ALL_ARTICLES.length).toBeGreaterThan(0)
  })

  it.each(ALL_ARTICLES.map((article) => [article.slug, article] as const))(
    '%s quotes no duration or monetary figure',
    (_slug, article) => {
      const offenders = strings(article).flatMap(({ where, text }) => {
        const figure = editorialFigureIn(text)
        return figure ? [`${where} — "${figure}" in: ${text}`] : []
      })

      expect(offenders).toEqual([])
    },
  )
})

describe('metadata and content stay in step', () => {
  /* An article is authored in two files — metadata in blogArticles.ts /
     guideArticles.ts, prose in blogContent.ts / guideContent.ts — because the
     prose must not reach the router's import graph (articleModel.ts explains
     why). That split is the one thing here a reviewer cannot see: metadata
     with no sections renders a title over an empty page, and sections with no
     metadata is prose with no URL and no way to reach it. Both directions are
     asserted, per collection, so a half-finished article fails rather than
     ships. */
  const collections = [
    { name: 'guide', sections: GUIDE_SECTIONS },
    { name: 'blog', sections: BLOG_SECTIONS },
  ] as const

  it.each(collections)('$name metadata and sections cover the same slugs', ({ name, sections }) => {
    const metaSlugs = ALL_ARTICLES.filter((a) => a.collection === name)
      .map((a) => a.slug)
      .sort()
    expect(Object.keys(sections).sort()).toEqual(metaSlugs)
  })

  it.each(ALL_ARTICLES.map((article) => [article.slug, article] as const))(
    '%s has a non-empty body',
    (_slug, article) => {
      const sections = articleSections(article.collection, article.slug)
      expect(sections.length).toBeGreaterThan(0)
      /* `articleSections` returns [] for an unknown slug rather than throwing,
         so the page degrades instead of crashing — which also means a missing
         body would otherwise pass silently. */
      expect(sections.every((section) => section.blocks.length > 0)).toBe(true)
    },
  )
})
