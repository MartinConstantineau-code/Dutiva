import { supabase } from '@/lib/supabaseClient'
import type { SafetyAction } from './safety'

/**
 * Best-effort telemetry for the deterministic safety backstop
 * (docs/AI_USAGE_STRATEGY.md §5): when a gate fires on the client, record it so
 * the gates are observable in production. Fire-and-forget — a telemetry failure
 * must never surface to the user or block a reply, so every error is swallowed.
 * The server side is the `advisor-safety-event` edge function.
 */
export async function reportSafetyEvent(input: {
  conversationId: string | null
  actions: SafetyAction[]
}): Promise<void> {
  if (!supabase || input.actions.length === 0) return
  try {
    await supabase.functions.invoke('advisor-safety-event', {
      body: { conversation_id: input.conversationId, actions: input.actions },
    })
  } catch {
    // Intentionally ignored — safety logging is best-effort.
  }
}
