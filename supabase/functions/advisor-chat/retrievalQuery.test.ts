import { describe, expect, it } from 'vitest'
import { buildRetrievalQuery } from './retrievalQuery'

describe('buildRetrievalQuery', () => {
  it('returns the message alone on a first turn', () => {
    expect(buildRetrievalQuery([], 'How much notice do I owe in Ontario?')).toBe(
      'How much notice do I owe in Ontario?',
    )
  })

  it('prepends the previous user turn so follow-ups keep their lexemes', () => {
    const history = [
      { role: 'user', content: 'How much termination notice in Ontario?' },
      { role: 'assistant', content: 'Under the ESA the ladder is…' },
    ]
    expect(buildRetrievalQuery(history, 'And after 5 years?')).toBe(
      'How much termination notice in Ontario?\nAnd after 5 years?',
    )
  })

  it('uses the LAST user turn, never the assistant reply', () => {
    const history = [
      { role: 'user', content: 'vacation pay in Quebec' },
      { role: 'assistant', content: 'CNESST says…' },
      { role: 'user', content: 'overtime threshold federally' },
      { role: 'assistant', content: 'The Canada Labour Code…' },
    ]
    expect(buildRetrievalQuery(history, 'and the rate?')).toBe(
      'overtime threshold federally\nand the rate?',
    )
  })

  it('caps a pasted-document previous turn so it cannot drown the question', () => {
    const history = [{ role: 'user', content: 'x'.repeat(2000) }]
    const query = buildRetrievalQuery(history, 'what applies here?')
    expect(query.length).toBe(400 + 1 + 'what applies here?'.length)
    expect(query.endsWith('what applies here?')).toBe(true)
  })

  it('ignores an empty previous turn', () => {
    expect(buildRetrievalQuery([{ role: 'user', content: '   ' }], 'severance in Ontario')).toBe(
      'severance in Ontario',
    )
  })
})
