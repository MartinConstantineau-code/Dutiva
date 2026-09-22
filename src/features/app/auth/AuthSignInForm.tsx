import { useState } from 'react'
import type { SubmitEvent } from 'react'
import { useI18n } from '@/i18n/context'
import { authMessages as M } from '@/i18n/messages/auth'
import { useAuth } from './authContext'

/**
 * Shared magic-link sign-in form (email + submit + sent/error feedback).
 * No "why sign in" copy — embedders own that context (see
 * GuidanceSourcesPanel, AuthMenuButton). No prototype counterpart.
 *
 * Two steps, because a link alone is not reliable: once the email is sent this
 * swaps to the 6-digit code from that email, which signs in directly. A mailbox
 * security scanner can spend a link (Google Workspace's runs JavaScript and
 * does — see AuthConfirm), but it cannot type a code.
 */
export function AuthSignInForm({ idPrefix = 'auth' }: Readonly<{ idPrefix?: string }>) {
  const { x } = useI18n()
  const { signInWithEmail, verifyEmailCode } = useAuth()
  const [email, setEmail] = useState('')
  const [sending, setSending] = useState(false)
  const [error, setError] = useState<string | undefined>()
  /** The address a link/code went to — drives the code step. */
  const [sentTo, setSentTo] = useState<string | undefined>()
  const [code, setCode] = useState('')

  const handleSubmit = (e: SubmitEvent) => {
    e.preventDefault()
    setSending(true)
    setError(undefined)
    const target = email.trim()
    void signInWithEmail(target).then((nextError) => {
      setSending(false)
      if (nextError) setError(nextError)
      else setSentTo(target)
    })
  }

  const handleVerify = (e: SubmitEvent) => {
    e.preventDefault()
    if (!sentTo) return
    setSending(true)
    setError(undefined)
    void verifyEmailCode(sentTo, code).then((nextError) => {
      setSending(false)
      if (nextError) setError(nextError)
    })
  }

  const emailId = `${idPrefix}-signin-email`
  const codeId = `${idPrefix}-signin-code`
  const inputClass =
    'min-w-0 flex-1 rounded-[10px] border border-border bg-bg px-[14px] py-[9px] font-sans text-[13.5px] text-text'
  const buttonClass =
    'shrink-0 cursor-pointer rounded-[10px] bg-navy px-[16px] py-[9px] text-[13.5px] font-semibold text-white disabled:opacity-60'

  if (sentTo) {
    return (
      <form onSubmit={handleVerify} className="flex flex-col gap-[10px]">
        <p className="m-0 text-[12.5px] leading-[1.5] text-text-2" role="status">
          {x(M.auth_link_sent)}
        </p>
        <div className="flex flex-wrap gap-[8px]">
          <label className="sr-only" htmlFor={codeId}>
            {x(M.auth_code_label)}
          </label>
          <input
            id={codeId}
            type="text"
            required
            inputMode="numeric"
            autoComplete="one-time-code"
            pattern="[0-9 ]*"
            maxLength={7}
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder={x(M.auth_code_placeholder)}
            className={`${inputClass} tracking-[0.3em]`}
          />
          <button
            type="submit"
            disabled={sending || code.trim().length === 0}
            className={buttonClass}
          >
            {sending ? x(M.auth_code_verifying) : x(M.auth_code_submit)}
          </button>
        </div>
        <p className="m-0 text-[12px] leading-[1.5] text-text-muted">{x(M.auth_code_hint)}</p>
        {error && <p className="m-0 text-[12.5px] text-risk-fg">{error}</p>}
      </form>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-[10px]">
      <div className="flex flex-wrap gap-[8px]">
        <label className="sr-only" htmlFor={emailId}>
          {x(M.auth_email_label)}
        </label>
        <input
          id={emailId}
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder={x(M.auth_email_placeholder)}
          className={inputClass}
        />
        <button type="submit" disabled={sending} className={buttonClass}>
          {sending ? x(M.auth_sending) : x(M.auth_submit_signin)}
        </button>
      </div>
      {error && <p className="text-[12.5px] text-risk-fg">{error}</p>}
    </form>
  )
}
