import { Minus, TrendingDown, TrendingUp } from 'lucide-react'
import { statusChipClass } from '@/components/chips'

/**
 * Signed-delta status chip: direction carried by icon + signed text
 * together, tone by direction × whether up is good (a rising score is
 * good; rising turnover is not).
 */
export function DeltaChip({
  delta,
  label,
  goodWhenUp = true,
}: {
  readonly delta: number
  /** Complete chip text, sign included ('+8 vs February', '−1.4 pts vs June'). */
  readonly label: string
  readonly goodWhenUp?: boolean
}) {
  if (delta === 0) {
    return (
      <span className={`${statusChipClass('neutral')} items-center`}>
        <Minus size={12} strokeWidth={1.9} className="mr-[5px]" aria-hidden="true" />
        {label}
      </span>
    )
  }
  const up = delta > 0
  const good = up === goodWhenUp
  const Icon = up ? TrendingUp : TrendingDown
  return (
    <span className={`${statusChipClass(good ? 'success' : 'risk')} items-center`}>
      <Icon size={12} strokeWidth={1.9} className="mr-[5px]" aria-hidden="true" />
      {label}
    </span>
  )
}
