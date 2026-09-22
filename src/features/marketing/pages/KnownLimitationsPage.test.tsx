import { describe, expect, it } from 'vitest'
import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderApp } from '@/test/renderApp'
import { KnownLimitationsPage } from './KnownLimitationsPage'

describe('KnownLimitationsPage', () => {
  it('renders hero, sections, items, and CTA in English', () => {
    renderApp(<KnownLimitationsPage />, { route: '/known-limitations', path: '/known-limitations' })
    expect(
      screen.getByRole('heading', { level: 1, name: 'Known limitations.' }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('heading', { level: 2, name: 'What Dutiva is not' }),
    ).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 2, name: 'AI limitations' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 2, name: 'Coverage limits' })).toBeInTheDocument()
    const main = screen.getByRole('main')
    // The "Bold lead — rest" split renders the lead inside a <strong>.
    const lead = within(main).getByText('Not legal advice')
    expect(lead.tagName).toBe('STRONG')
    // Header carries its own CTA links — scope the CTA check to <main>.
    expect(within(main).getByRole('link', { name: /Contact support/ })).toHaveAttribute(
      'href',
      'mailto:support@dutiva.ca',
    )
  })

  it('re-localizes to French via the header language toggle', async () => {
    const user = userEvent.setup()
    renderApp(<KnownLimitationsPage />, { route: '/known-limitations', path: '/known-limitations' })
    const [langToggle] = screen.getAllByRole('button', { name: /Toggle language/ })
    expect(langToggle).toBeDefined()
    await user.click(langToggle as HTMLElement)
    expect(screen.getByRole('heading', { level: 1, name: 'Limites connues.' })).toBeInTheDocument()
    expect(
      screen.getByRole('heading', { level: 2, name: 'Ce que Dutiva n’est pas' }),
    ).toBeInTheDocument()
  })
})
