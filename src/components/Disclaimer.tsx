import { Info } from 'lucide-react'
import { useI18n } from '@/i18n/context'
import { common } from '@/i18n/messages/common'

/**
 * The always-on "not legal advice" note (design-system `Disclaimer` — the
 * component CONVENTIONS.md mandates near CTAs, generated documents and
 * Advisor output). Two variants, matching the prototype's two treatments:
 *
 * - `inline` — the 11px faint footnote under composers and registers
 *   (prototype `disclaimer_short`);
 * - `block` — the Info-icon callout beside generated documents and legal
 *   records (prototype `disclaimer_full`).
 *
 * Margins/centering are the call site's business — pass them via className.
 */
export function Disclaimer({
  variant = 'inline',
  className,
}: {
  readonly variant?: 'inline' | 'block'
  readonly className?: string
}) {
  const { x } = useI18n()
  const extra = className ? ` ${className}` : ''

  if (variant === 'block') {
    return (
      <div
        className={`flex items-start gap-[8px] text-[11.5px] leading-normal text-text-muted${extra}`}
      >
        <Info size={14} strokeWidth={1.7} className="mt-px shrink-0" aria-hidden="true" />
        <span>{x(common.disclaimer_full)}</span>
      </div>
    )
  }

  return <div className={`text-[11px] text-text-faint${extra}`}>{x(common.disclaimer_short)}</div>
}
