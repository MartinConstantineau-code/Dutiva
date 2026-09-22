import { TriangleAlert } from 'lucide-react'

/**
 * Small stat tile (label under value, house style). `alert` renders the
 * risk treatment — always paired with the warning icon, never colour alone.
 */
export function StatTile({
  value,
  label,
  alert = false,
}: {
  readonly value: string
  readonly label: string
  readonly alert?: boolean
}) {
  return (
    <div
      className={`min-w-0 flex-1 rounded-[10px] border px-[12px] py-[10px] ${
        alert ? 'border-risk-border bg-risk-bg' : 'border-border-soft bg-surface-2'
      }`}
    >
      <div
        className={`flex items-center gap-[6px] font-display text-[22px] font-bold ${
          alert ? 'text-risk-fg' : 'text-text'
        }`}
      >
        {alert && <TriangleAlert size={15} strokeWidth={1.9} aria-hidden="true" />}
        <span className="truncate">{value}</span>
      </div>
      <div className={`mt-[2px] text-[11.5px] ${alert ? 'text-risk-fg' : 'text-text-muted'}`}>
        {label}
      </div>
    </div>
  )
}
