import { ArrowRight, ChevronRight, Clock, Sparkle, UserRound } from 'lucide-react'
import { useI18n } from '@/i18n/context'
import { homeMessages as M } from '@/i18n/messages/home'
import { askBriefPrompt, homeMetricChips } from './homeData'
import type { HomeAction } from './homeData'

/**
 * AdvisorBrief hero — the gold "Advisor's daily brief" card with the
 * what-matters/why/do-first paragraphs, the owner/deadline/next meta row and
 * the MetricChips strip (prototype Home markup lines 345–370).
 */
export function HomeBriefHero({ onAction }: { readonly onAction: (action: HomeAction) => void }) {
  const { x } = useI18n()

  /* Below md the icon rail folds into the eyebrow row rather than standing as a
     left column: on a 390px phone that column plus its gap cost ~43px of width
     on every line of a long brief. Desktop keeps the rail unchanged. */
  return (
    <div className="mb-[18px] flex items-start gap-0 rounded-[14px] border border-gold-border bg-gold-bg px-[18px] py-[16px] md:gap-[13px]">
      <div className="hidden h-[30px] w-[30px] shrink-0 items-center justify-center rounded-[8px] bg-navy md:flex">
        <Sparkle size={16} className="fill-gold-on-navy" strokeWidth={0} aria-hidden="true" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="mb-[6px] flex items-center gap-[7px] text-[11px] font-bold tracking-wider text-gold-dot uppercase">
          <span className="flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded-[6px] bg-navy md:hidden">
            <Sparkle size={13} className="fill-gold-on-navy" strokeWidth={0} aria-hidden="true" />
          </span>
          {x(M.home_brief_title)}
        </div>
        <div className="text-[14px] leading-[1.6] text-text-2">{x(M.home_brief_lead)}</div>
        <div className="mt-[7px] text-[13px] leading-[1.6] text-text-3">{x(M.home_brief_rest)}</div>

        {/* Owner · deadline · next action */}
        <div className="mt-[10px] flex flex-wrap gap-x-[16px] gap-y-[6px] text-[12px] font-semibold text-text-3">
          <span className="inline-flex items-center gap-[5px]">
            <UserRound size={12} strokeWidth={1.8} aria-hidden="true" />
            {x(M.home_brief_owner)}
          </span>
          <span className="inline-flex items-center gap-[5px]">
            <Clock size={12} strokeWidth={1.8} aria-hidden="true" />
            {x(M.home_brief_due)}
          </span>
          <span className="inline-flex items-center gap-[5px]">
            <ArrowRight size={12} strokeWidth={1.8} aria-hidden="true" />
            {x(M.home_brief_next)}
          </span>
        </div>

        {/* MetricChips + "Ask about this brief".
            Chips are taller on touch to reach ~44pt and carry an active: state
            alongside hover: — they route into Compliance/Cases/Tasks, and hover
            alone gives a phone no signal that they are pressable. */}
        <div className="mt-[12px] flex flex-wrap items-center gap-[8px] border-t border-gold-border pt-[12px]">
          {homeMetricChips.map((chip) => (
            <button
              key={chip.label.en}
              type="button"
              onClick={() => onAction(chip.action)}
              className="flex cursor-pointer items-baseline gap-[6px] rounded-[8px] border border-border bg-surface px-[11px] py-[14px] font-sans hover:border-(--accent-soft-border) active:border-(--accent-soft-border) md:py-[6px]"
            >
              <span
                className={`font-display text-[15px] leading-none font-semibold ${chip.valueClass}`}
              >
                {chip.value}
                {chip.suffix && (
                  <span className="font-sans text-[10.5px] text-text-faint">{chip.suffix}</span>
                )}
              </span>
              <span className="text-[11.5px] text-text-muted">{x(chip.label)}</span>
              <span className={`text-[10.5px] font-semibold ${chip.deltaClass}`}>
                {x(chip.delta)}
              </span>
            </button>
          ))}
          <button
            type="button"
            onClick={() => onAction({ kind: 'flow', prompt: askBriefPrompt, flowKey: 'fallback' })}
            /* Full-width on its own row below md: once the chips wrap on a
               narrow screen, ml-auto stranded this link alone and right-aligned
               against the last chip. */
            className="flex w-full cursor-pointer items-center gap-[6px] border-none bg-transparent px-[2px] py-[12px] font-sans text-[12.5px] font-semibold text-gold-fg md:ml-auto md:w-auto md:py-[6px]"
          >
            {x(M.home_brief_ask)}
            <ChevronRight size={13} strokeWidth={2} aria-hidden="true" />
          </button>
        </div>
      </div>
    </div>
  )
}
