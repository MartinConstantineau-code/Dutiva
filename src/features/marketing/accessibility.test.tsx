import { describe, expect, it } from 'vitest'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderApp } from '@/test/renderApp'
import { ContactPage } from './pages/ContactPage'
import { BetaSignup } from './sections/BetaSignup'

/**
 * Regression coverage for the AudioEye accessibility-audit remediations on the
 * public marketing surface: the skip link (WCAG 2.4.1) and the beta-signup
 * autocomplete tokens (WCAG 1.3.5). Both were previously missing.
 */
describe('marketing accessibility remediations', () => {
  it('exposes a keyboard skip link that targets the page <main> (WCAG 2.4.1)', () => {
    renderApp(<ContactPage />, { route: '/contact', path: '/contact' })

    const skip = screen.getByRole('link', { name: 'Skip to main content' })
    expect(skip).toHaveAttribute('href', '#main-content')

    const main = screen.getByRole('main')
    expect(main).toHaveAttribute('id', 'main-content')
    // Programmatically focusable so activating the skip link moves focus there.
    expect(main).toHaveAttribute('tabindex', '-1')
  })

  it('localizes the skip link in French', async () => {
    const user = userEvent.setup()
    renderApp(<ContactPage />, { route: '/contact', path: '/contact' })
    const [langToggle] = screen.getAllByRole('button', { name: /Toggle language/ })
    await user.click(langToggle as HTMLElement)
    expect(screen.getByRole('link', { name: 'Passer au contenu principal' })).toHaveAttribute(
      'href',
      '#main-content',
    )
  })

  it('gives the beta-signup fields autocomplete tokens (WCAG 1.3.5)', () => {
    renderApp(<BetaSignup />, { route: '/', path: '/' })

    expect(screen.getByLabelText('Work email')).toHaveAttribute('autocomplete', 'email')
    expect(screen.getByLabelText('Company (optional)')).toHaveAttribute(
      'autocomplete',
      'organization',
    )
    expect(screen.getByLabelText('Province / jurisdiction (optional)')).toHaveAttribute(
      'autocomplete',
      'address-level1',
    )
  })
})
