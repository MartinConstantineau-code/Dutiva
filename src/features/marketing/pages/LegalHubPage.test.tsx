import { describe, expect, it } from 'vitest'
import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderApp } from '@/test/renderApp'
import { LegalHubPage } from './LegalHubPage'

describe('LegalHubPage', () => {
  it('renders hero, group headings, and all 26 policy links in English', () => {
    renderApp(<LegalHubPage />, { route: '/legal', path: '/legal' })
    expect(
      screen.getByRole('heading', { level: 1, name: 'Policies and compliance documentation.' }),
    ).toBeInTheDocument()
    for (const heading of [
      'Core legal',
      'Canadian compliance',
      'AI governance',
      'Data & security',
      'Billing & support',
      'Intellectual property',
    ]) {
      expect(screen.getByRole('heading', { level: 2, name: heading })).toBeInTheDocument()
    }
    // The footer links to policies too — scope the card count to <main>.
    const main = screen.getByRole('main')
    const policyLinks = within(main)
      .getAllByRole('link')
      .filter((link) => link.getAttribute('href')?.startsWith('/legal/'))
    expect(policyLinks).toHaveLength(26)
    expect(within(main).getByRole('link', { name: /Terms of Service/ })).toHaveAttribute(
      'href',
      '/legal/terms',
    )
    expect(within(main).getByRole('link', { name: /Security Overview/ })).toHaveAttribute(
      'href',
      '/legal/security',
    )
    expect(within(main).getByText('Terms of Service')).toBeInTheDocument()
  })

  it('re-localizes to French via the header language toggle', async () => {
    const user = userEvent.setup()
    renderApp(<LegalHubPage />, { route: '/legal', path: '/legal' })
    const [langToggle] = screen.getAllByRole('button', { name: /Toggle language/ })
    expect(langToggle).toBeDefined()
    await user.click(langToggle as HTMLElement)
    expect(
      screen.getByRole('heading', {
        level: 1,
        name: 'Politiques et documentation de conformité.',
      }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('heading', { level: 2, name: 'Documents juridiques essentiels' }),
    ).toBeInTheDocument()
  })
})
