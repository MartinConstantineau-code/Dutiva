import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { act, render, screen } from '@testing-library/react'
import { ToastsProvider } from './ToastsProvider'
import { useToasts } from './toastsContext'
import { pickL } from '@/i18n/core'

function Probe() {
  const { toasts, showToast } = useToasts()
  return (
    <div>
      <ul>
        {toasts.map((t) => (
          <li key={t.id}>{pickL(t.message, 'en')}</li>
        ))}
      </ul>
      <button onClick={() => showToast('Saved')}>show</button>
    </div>
  )
}

describe('ToastsProvider', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })
  afterEach(() => {
    vi.useRealTimers()
  })

  it('shows a toast and auto-dismisses after ~3.6s', () => {
    render(
      <ToastsProvider>
        <Probe />
      </ToastsProvider>,
    )
    act(() => {
      screen.getByRole('button', { name: 'show' }).click()
    })
    expect(screen.getByText('Saved')).toBeInTheDocument()

    act(() => {
      vi.advanceTimersByTime(3599)
    })
    expect(screen.getByText('Saved')).toBeInTheDocument()

    act(() => {
      vi.advanceTimersByTime(2)
    })
    expect(screen.queryByText('Saved')).not.toBeInTheDocument()
  })
})
