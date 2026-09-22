import { useI18n } from '@/i18n/context'
import { pick, pickL } from '@/i18n/core'
import type { MemoryFact } from '@/data'
import { CONFIDENCE_META, SOURCE_META } from './memoryModel'

/**
 * Compact sourced fact in the "What I know" rails (Advisor Memory prototype
 * `knowFact`): confidence dot + statement + source line.
 */
export function KnowFact({ fact }: { readonly fact: MemoryFact }) {
  const { lang } = useI18n()
  const conf = CONFIDENCE_META[fact.confidence]
  const source = SOURCE_META[fact.source.type]
  return (
    <div className="mb-[10px] flex items-start gap-[8px]">
      <span className={`mt-[5px] h-[8px] w-[8px] shrink-0 rounded-full ${conf.dot}`} />
      <div>
        <div className="text-[12.5px] leading-snug text-text">{pickL(fact.statement, lang)}</div>
        <div className="mt-px text-[10.5px] text-text-faint">
          {pick(source.kind, lang)} · {pick(fact.source.detail, lang)}
        </div>
      </div>
    </div>
  )
}
