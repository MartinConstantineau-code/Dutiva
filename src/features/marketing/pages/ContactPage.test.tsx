import { describe, expect, it } from 'vitest'
import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderApp } from '@/test/renderApp'
import { ContactPage } from './ContactPage'

describe('ContactPage', () => {
  it('renders the hero and the public support form', () => {
    renderApp(<ContactPage />, { route: '/contact', path: '/contact' })
    expect(
      screen.getByRole('heading', { level: 1, name: 'Contact Dutiva support' }),
    ).toBeInTheDocument()
    const main = within(screen.getByRole('main'))
    expect(main.getByLabelText('What is this about?')).toBeInTheDocument()
    expect(main.getByLabelText('Your email')).toBeInTheDocument()
    expect(main.getByRole('button', { name: 'Send request' })).toBeInTheDocument()
  })

  it('preselects the category from the ?topic= deep link', () => {
    renderApp(<ContactPage />, { route: '/contact?topic=security', path: '/contact' })
    // The security topic surfaces the security-reporting note.
    expect(screen.getByText(/Reporting a security concern\?/)).toBeInTheDocument()
  })

  it('re-localizes to French via the header language toggle', async () => {
    const user = userEvent.setup()
    renderApp(<ContactPage />, { route: '/contact', path: '/contact' })
    const [langToggle] = screen.getAllByRole('button', { name: /Toggle language/ })
    await user.click(langToggle as HTMLElement)
    expect(
      screen.getByRole('heading', { level: 1, name: 'Contacter le soutien Dutiva' }),
    ).toBeInTheDocument()
  })
})
