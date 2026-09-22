import { describe, expect, it } from 'vitest'
import { normalizeText, searchHelpArticles } from './helpSearch'

describe('normalizeText', () => {
  it('lowercases and strips diacritics', () => {
    expect(normalizeText('Confidentialité')).toBe('confidentialite')
    expect(normalizeText('  RÉSILIÉ ')).toBe('resilie')
    expect(normalizeText('Magic Link')).toBe('magic link')
  })
})

describe('searchHelpArticles', () => {
  it('returns nothing for an empty or whitespace query', () => {
    expect(searchHelpArticles('', 'en')).toEqual([])
    expect(searchHelpArticles('   ', 'en')).toEqual([])
  })

  it('matches on the article title', () => {
    const results = searchHelpArticles('magic link', 'en')
    expect(results.map((r) => r.article.slug)).toContain('signing-in')
  })

  it('matches on hidden keywords, not just visible copy', () => {
    // "login" appears only in the keywords of the sign-in article.
    const results = searchHelpArticles('login', 'en')
    expect(results.map((r) => r.article.slug)).toContain('signing-in')
  })

  it('requires every term to match (AND semantics)', () => {
    expect(searchHelpArticles('magic password', 'en').map((r) => r.article.slug)).toContain(
      'signing-in',
    )
    expect(searchHelpArticles('magic zzzzz', 'en')).toEqual([])
  })

  it('is accent-insensitive in French', () => {
    const results = searchHelpArticles('confidentialite', 'fr')
    expect(results.map((r) => r.article.slug)).toContain('making-a-privacy-request')
  })

  it('ranks a title match above a body-only match', () => {
    // "account" is in the recovery article's title but only in other articles' bodies.
    const results = searchHelpArticles('account', 'en')
    expect(results.length).toBeGreaterThan(1)
    expect(results[0]?.article.slug).toBe('recover-account-access')
  })

  it('any mode matches a whole-sentence question that strict mode misses', () => {
    // "how", "do", "i" don't appear in the article, so strict AND returns nothing.
    expect(searchHelpArticles('how do I generate a template', 'en')).toEqual([])
    const lenient = searchHelpArticles('how do I generate a template', 'en', { mode: 'any' })
    expect(lenient.map((r) => r.article.slug)).toContain('generate-a-document')
  })
})
