import { createContext, useContext } from 'react'
import type { LText } from '@/i18n/core'
import type { AdvisorTurnSpec, ChatMessage } from '@/features/app/advisor/types'

/**
 * The Advisor rail — a contextual right-side panel opened from any entity
 * ("Ask Advisor"). Mirrors `openRail(title, spec)` in the App v2 prototype.
 */
export interface RailContextMeta {
  /** e.g. entity type + jurisdiction chips shown under the subject. */
  chips?: LText[]
  /** Avatar initials for the subject, when it is a person. */
  initials?: string
}

export interface RailState {
  open: boolean
  title: LText
  meta: RailContextMeta
  messages: ChatMessage[]
}

export interface RailContextValue {
  rail: RailState
  /** Open the rail on a subject with an initial advisor summary (text + tone cards). */
  openRail: (title: LText, spec: AdvisorTurnSpec, meta?: RailContextMeta) => void
  closeRail: () => void
  /** Append a user message and stream the canned advisor acknowledgement. */
  sendRailMessage: (text: string) => void
}

export const RailContext = createContext<RailContextValue | null>(null)

export function useRail(): RailContextValue {
  const ctx = useContext(RailContext)
  if (!ctx) throw new Error('useRail must be used within a RailProvider')
  return ctx
}
