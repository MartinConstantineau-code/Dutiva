import { useI18n } from '@/i18n/context'
import { shellMessages as M } from '@/i18n/messages/shell'
import type { NavBadgeTone } from './navConfig'

const BADGE_CLASSES: Record<NavBadgeTone, string> = {
  gold: 'rounded-[9px] border border-gold-border bg-gold-bg px-[6px] py-[1px] text-[10px] font-bold text-gold-fg',
  neutral: 'rounded-[9px] bg-inset px-[6px] py-[1px] text-[10.5px] font-bold text-text-3',
  risk: 'rounded-[9px] bg-risk-dot px-[6px] py-[1px] text-[10.5px] font-bold text-white',
  warn: 'rounded-[9px] bg-warn-bg border border-warn-border px-[6px] py-[1px] text-[10.5px] font-bold text-warn-fg',
}

function ariaTemplateForKey(key: string) {
  switch (key) {
    case 'workflows':
      return M.shell_badge_workflows_aria
    case 'cases':
      return M.shell_badge_cases_aria
    case 'compliance':
      return M.shell_badge_compliance_aria
    case 'wellbeing':
      return M.shell_badge_wellbeing_aria
    default:
      return null
  }
}

interface SidebarBadgeProps {
  readonly itemKey: string
  readonly value: string
  readonly tone: NavBadgeTone
}

export function SidebarBadge({ itemKey, value, tone }: SidebarBadgeProps) {
  const { lang } = useI18n()
  const template = ariaTemplateForKey(itemKey)
  const rawTemplate = template ? template[lang] : null
  const ariaLabel = rawTemplate ? rawTemplate.replace('{count}', value) : undefined

  return (
    <span aria-label={ariaLabel} className={BADGE_CLASSES[tone]}>
      {value}
    </span>
  )
}
