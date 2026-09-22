import { describe, expect, it } from 'vitest'
import { assessQuebecPackage, quebecFingerprint } from './quebecCkan'

/**
 * A trimmed but real-shaped response, matching a live fetch of
 * https://www.donneesquebec.ca/recherche/api/3/action/package_show
 *   ?id=c8433300-f752-4815-8ea2-69cad416dd80
 * on 2026-08-05 ("Lois et règlements codifiés du Québec"), fetched twice
 * independently and byte-stable both times.
 */
const PACKAGE_RESPONSE = JSON.stringify({
  success: true,
  result: {
    id: 'c8433300-f752-4815-8ea2-69cad416dd80',
    title: 'Lois et règlements codifiés du Québec',
    resources: [
      {
        id: '8d24d604-97f5-441b-93ba-f58743726514',
        name: 'Lois',
        format: 'XML',
        last_modified: '2026-07-20T13:29:10.040764',
        url: 'https://www.donneesquebec.ca/recherche/dataset/c8433300-f752-4815-8ea2-69cad416dd80/resource/8d24d604-97f5-441b-93ba-f58743726514/download/20260720_lois.zip',
      },
      {
        id: 'afb1cbe8-0e82-4262-aff6-f4186cf83686',
        name: 'Reglements',
        format: 'XML',
        last_modified: '2026-07-20T13:29:13.130723',
        url: 'https://www.donneesquebec.ca/recherche/dataset/c8433300-f752-4815-8ea2-69cad416dd80/resource/afb1cbe8-0e82-4262-aff6-f4186cf83686/download/20260720_reglements.zip',
      },
    ],
  },
})

describe('assessQuebecPackage', () => {
  it('finds the named resource and reads its last_modified', () => {
    const verdict = assessQuebecPackage(PACKAGE_RESPONSE, 'Lois')
    expect(verdict.ok).toBe(true)
    if (!verdict.ok) throw new Error('expected acceptance')
    expect(verdict.facts.lastModified).toBe('2026-07-20T13:29:10.040764')
    expect(verdict.facts.url).toContain('20260720_lois.zip')
  })

  it('refuses invalid JSON', () => {
    const verdict = assessQuebecPackage('Just a moment...', 'Lois')
    expect(verdict.ok).toBe(false)
    if (verdict.ok) throw new Error('expected refusal')
    expect(verdict.reason).toBe('invalid-json')
  })

  it('refuses a response that does not report success', () => {
    const verdict = assessQuebecPackage(JSON.stringify({ success: false }), 'Lois')
    expect(verdict.ok).toBe(false)
    if (verdict.ok) throw new Error('expected refusal')
    expect(verdict.reason).toBe('api-error')
  })

  it('treats a zero-resource result as an outage, not "no change"', () => {
    const empty = JSON.stringify({ success: true, result: { resources: [] } })
    const verdict = assessQuebecPackage(empty, 'Lois')
    expect(verdict.ok).toBe(false)
    if (verdict.ok) throw new Error('expected refusal')
    expect(verdict.reason).toBe('no-resources')
  })

  it('reports a renamed/missing resource rather than silently tracking a different one', () => {
    const verdict = assessQuebecPackage(PACKAGE_RESPONSE, 'Statutes')
    expect(verdict.ok).toBe(false)
    if (verdict.ok) throw new Error('expected refusal')
    expect(verdict.reason).toBe('resource-missing')
    expect(verdict.detail).toContain('Statutes')
  })
})

describe('quebecFingerprint', () => {
  it('is prefixed so the column is self-describing', () => {
    const verdict = assessQuebecPackage(PACKAGE_RESPONSE, 'Lois')
    if (!verdict.ok) throw new Error('expected acceptance')
    expect(quebecFingerprint(verdict.facts)).toMatch(/^quebec-ckan:/)
  })

  it('changes when last_modified changes', () => {
    const before = assessQuebecPackage(PACKAGE_RESPONSE, 'Lois')
    if (!before.ok) throw new Error('expected acceptance')

    const bumped = JSON.parse(PACKAGE_RESPONSE)
    bumped.result.resources[0].last_modified = '2026-08-04T00:00:00.000000'
    bumped.result.resources[0].url = bumped.result.resources[0].url.replace('20260720', '20260804')
    const after = assessQuebecPackage(JSON.stringify(bumped), 'Lois')
    if (!after.ok) throw new Error('expected acceptance')

    expect(quebecFingerprint(before.facts)).not.toBe(quebecFingerprint(after.facts))
  })
})
