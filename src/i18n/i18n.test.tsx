import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { LangProvider } from './LangProvider'
import { useI18n } from './context'
import { bi, pickL } from './core'
import { messages } from './messages'

function Probe() {
  const { lang, setLang, t, L, x } = useI18n()
  return (
    <div>
      <span data-testid="lang">{lang}</span>
      <span data-testid="t">{t('disclaimer')}</span>
      <span data-testid="L">{L('Hello', 'Bonjour')}</span>
      <span data-testid="x">{x(bi('Case', 'Dossier'))}</span>
      <button onClick={() => setLang('fr')}>fr</button>
    </div>
  )
}

describe('LangProvider', () => {
  it('defaults to English and resolves t/L/x', () => {
    render(
      <LangProvider>
        <Probe />
      </LangProvider>,
    )
    expect(screen.getByTestId('lang')).toHaveTextContent('en')
    expect(screen.getByTestId('t')).toHaveTextContent('does not provide legal advice')
    expect(screen.getByTestId('L')).toHaveTextContent('Hello')
    expect(screen.getByTestId('x')).toHaveTextContent('Case')
  })

  it('switches to French live, persists, and updates <html lang>', async () => {
    const user = userEvent.setup()
    render(
      <LangProvider>
        <Probe />
      </LangProvider>,
    )
    await user.click(screen.getByRole('button', { name: 'fr' }))
    expect(screen.getByTestId('lang')).toHaveTextContent('fr')
    expect(screen.getByTestId('t')).toHaveTextContent('ne fournit pas de conseils juridiques')
    expect(screen.getByTestId('L')).toHaveTextContent('Bonjour')
    expect(screen.getByTestId('x')).toHaveTextContent('Dossier')
    expect(localStorage.getItem('dutiva-lang')).toBe('fr')
    expect(document.documentElement.getAttribute('lang')).toBe('fr-CA')
  })

  it('reads the persisted language on mount', () => {
    localStorage.setItem('dutiva-lang', 'fr')
    render(
      <LangProvider>
        <Probe />
      </LangProvider>,
    )
    expect(screen.getByTestId('lang')).toHaveTextContent('fr')
  })
})

describe('message catalogue', () => {
  it('every key has non-empty EN and FR', () => {
    for (const [key, value] of Object.entries(messages)) {
      expect(value.en, `${key}.en`).toBeTruthy()
      expect(value.fr, `${key}.fr`).toBeTruthy()
    }
  })
})

describe('pickL', () => {
  it('resolves plain strings and Bi pairs', () => {
    expect(pickL('plain', 'fr')).toBe('plain')
    expect(pickL(bi('en', 'fr'), 'fr')).toBe('fr')
    expect(pickL(bi('en', 'fr'), 'en')).toBe('en')
  })
})
