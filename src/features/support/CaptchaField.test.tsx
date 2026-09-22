import { useState } from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderApp } from '@/test/renderApp'
import { CaptchaField } from './CaptchaField'

/**
 * The provider script never loads in jsdom, so we pre-seed the global the
 * loader looks for — that is the same branch a second widget on the page takes
 * once the script is already present.
 */
interface RenderOptions {
  sitekey: string
  callback: (token: string) => void
  'expired-callback': () => void
  'error-callback': () => void
  theme: string
  language: string
}

const api = {
  render: vi.fn((_container: HTMLElement, _options: RenderOptions): string => 'widget-1'),
  reset: vi.fn(),
  remove: vi.fn(),
}

beforeEach(() => {
  api.render.mockClear()
  api.reset.mockClear()
  api.remove.mockClear()
  ;(window as unknown as Record<string, unknown>).turnstile = api
})

describe('CaptchaField', () => {
  it('renders nothing and loads no script when no site key is configured', () => {
    const { container } = renderApp(<CaptchaField onToken={vi.fn()} siteKey={undefined} />)
    expect(container).toBeEmptyDOMElement()
    expect(api.render).not.toHaveBeenCalled()
  })

  it('renders the widget and passes the token up when solved', async () => {
    const onToken = vi.fn()
    renderApp(<CaptchaField onToken={onToken} siteKey="0x4AAA" />)

    expect(screen.getByTestId('captcha-widget')).toBeInTheDocument()
    await waitFor(() => expect(api.render).toHaveBeenCalledOnce())

    const options = api.render.mock.calls[0]![1]
    expect(options.sitekey).toBe('0x4AAA')

    options.callback('solved-token')
    expect(onToken).toHaveBeenCalledWith('solved-token')

    // An expired challenge must clear the token, not leave a stale one that
    // the form would happily submit.
    options['expired-callback']()
    expect(onToken).toHaveBeenLastCalledWith(null)
  })

  it('clears the token and resets the widget when the reset signal changes', async () => {
    // The parent bumps the signal after a rejected submit; drive it the same
    // way rather than re-rendering the field outside its providers.
    function Harness({ onToken }: { readonly onToken: (token: string | null) => void }) {
      const [signal, setSignal] = useState(0)
      return (
        <>
          <button type="button" onClick={() => setSignal((n) => n + 1)}>
            retry
          </button>
          <CaptchaField onToken={onToken} siteKey="0x4AAA" resetSignal={signal} />
        </>
      )
    }

    const user = userEvent.setup()
    const onToken = vi.fn()
    renderApp(<Harness onToken={onToken} />)
    await waitFor(() => expect(api.render).toHaveBeenCalledOnce())
    onToken.mockClear()

    await user.click(screen.getByRole('button', { name: 'retry' }))

    await waitFor(() => expect(api.reset).toHaveBeenCalledWith('widget-1'))
    expect(onToken).toHaveBeenCalledWith(null)
    // Resetting must reuse the existing widget, not stack a second one.
    expect(api.render).toHaveBeenCalledOnce()
  })

  it('tells the customer when the check cannot load instead of failing silently', async () => {
    const onToken = vi.fn()
    renderApp(<CaptchaField onToken={onToken} siteKey="0x4AAA" />)
    await waitFor(() => expect(api.render).toHaveBeenCalledOnce())

    api.render.mock.calls[0]![1]['error-callback']()

    expect(await screen.findByRole('alert')).toHaveTextContent(
      /human-verification check could not load/i,
    )
    expect(onToken).toHaveBeenLastCalledWith(null)
  })
})
