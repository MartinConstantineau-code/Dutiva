import { describe, expect, it } from 'vitest'
import { scrubRoutePattern } from './scrubRoute'

describe('scrubRoutePattern', () => {
  it('leaves known static public and app routes untouched', () => {
    expect(scrubRoutePattern('/')).toBe('/')
    expect(scrubRoutePattern('/pricing')).toBe('/pricing')
    expect(scrubRoutePattern('/fr/tarifs')).toBe('/fr/tarifs')
    expect(scrubRoutePattern('/app/home')).toBe('/app/home')
    expect(scrubRoutePattern('/app/planning/tasks')).toBe('/app/planning/tasks')
  })

  it('collapses public policy/help slugs to their named pattern', () => {
    expect(scrubRoutePattern('/legal/quebec-law-25')).toBe('/legal/:slug')
    expect(scrubRoutePattern('/help/signing-in')).toBe('/help/:slug')
    expect(scrubRoutePattern('/fr/juridique/loi-25')).toBe('/fr/juridique/:slug')
    expect(scrubRoutePattern('/fr/aide/connexion')).toBe('/fr/aide/:slug')
  })

  it('scrubs opaque entity identifiers on the app surface', () => {
    expect(scrubRoutePattern('/app/cases/8f3b9c1e-0a2d-4b6f-9c1e-0a2d4b6f9c1e')).toBe(
      '/app/cases/:id',
    )
    expect(scrubRoutePattern('/app/employees/emp_00931')).toBe('/app/employees/:id')
    expect(scrubRoutePattern('/app/support/requests/DUT-2025-000123')).toBe(
      '/app/support/requests/:id',
    )
    expect(scrubRoutePattern('/app/support/admin/DUT-2025-000123')).toBe('/app/support/admin/:id')
  })

  it('scrubs human-readable fixture ids (name slugs), not just opaque ones', () => {
    expect(scrubRoutePattern('/app/employees/jordan-mensah')).toBe('/app/employees/:id')
    expect(scrubRoutePattern('/app/settings/memory/people/riley-summers')).toBe(
      '/app/settings/memory/people/:id',
    )
    expect(scrubRoutePattern('/app/settings/memory/conversations/kickoff')).toBe(
      '/app/settings/memory/conversations/:id',
    )
  })

  it('matches position-aware: a static-looking id under a dynamic route is still scrubbed', () => {
    // `employees/:employeeId` has no static `studio` child, so `studio` here is
    // an employee id — must not leak via the documents-only `studio` route.
    expect(scrubRoutePattern('/app/employees/studio')).toBe('/app/employees/:id')
    expect(scrubRoutePattern('/app/cases/templates')).toBe('/app/cases/:id')
  })

  it('keeps real document sub-routes but scrubs the document id', () => {
    expect(scrubRoutePattern('/app/documents/studio')).toBe('/app/documents/studio')
    expect(scrubRoutePattern('/app/documents/hr-library')).toBe('/app/documents/hr-library')
    expect(scrubRoutePattern('/app/documents/templates/termination-letter')).toBe(
      '/app/documents/templates/:id',
    )
    expect(scrubRoutePattern('/app/documents/generate/warning-letter')).toBe(
      '/app/documents/generate/:id',
    )
    expect(scrubRoutePattern('/app/documents/8f3b9c1e0a2d4b6f')).toBe('/app/documents/:id')
  })

  it('degrades an unknown route to a safe label rather than echoing the path', () => {
    // A 404 or a not-yet-registered dynamic route must never transmit a segment.
    expect(scrubRoutePattern('/app/missing/jane-doe')).toBe('/app/:unknown')
    expect(scrubRoutePattern('/app/some-new-feature/42')).toBe('/app/:unknown')
    expect(scrubRoutePattern('/totally/made/up')).toBe('/unknown')
    expect(scrubRoutePattern('/not-a-path')).toBe('/unknown')
  })

  it('drops query strings and fragments entirely', () => {
    expect(scrubRoutePattern('/app/cases/abc-123?tab=notes#section')).toBe('/app/cases/:id')
    expect(scrubRoutePattern('/pricing?ref=email&utm=x')).toBe('/pricing')
  })

  it('strips a trailing slash but preserves root', () => {
    expect(scrubRoutePattern('/pricing/')).toBe('/pricing')
    expect(scrubRoutePattern('/app/')).toBe('/app')
    expect(scrubRoutePattern('/')).toBe('/')
  })

  it('is total: never throws on odd input', () => {
    expect(scrubRoutePattern('')).toBe('/')
    expect(scrubRoutePattern('///')).toBe('/')
  })
})
