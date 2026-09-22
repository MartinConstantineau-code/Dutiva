import type { ReactNode } from 'react'
import { useLocation } from 'react-router-dom'
import { useI18n } from '@/i18n/context'
/* navLabels, not navConfig: navConfig value-imports the demo fixtures for its
   sidebar badge counts, and ModeGate sits in the eager entry graph (routes →
   appViews → ModeGate), so importing it from there ships 113kB of fixtures to
   every marketing visitor. */
import { moduleLabelFor } from '@/features/app/shell/navLabels'
import { useWorkspaceMode } from './workspaceModeContext'
import { ProductionEmptyState } from './ProductionEmptyState'

/**
 * Route-level gate for fixture-driven views: in demo mode it renders the
 * view unchanged; in production mode it renders the shared empty state,
 * titled with the module's own label (derived from the route, same source
 * as the topbar heading). Wrap a route's element in appViews.tsx — do NOT
 * thread mode conditionals through the view itself. When a module gains
 * real persistence, its gate comes off and the view handles both modes.
 */
export function ModeGate({ children }: { readonly children: ReactNode }) {
  const { mode } = useWorkspaceMode()
  const { pathname } = useLocation()
  const { x } = useI18n()

  if (mode === 'production') {
    return <ProductionEmptyState title={x(moduleLabelFor(pathname))} />
  }
  return children
}
