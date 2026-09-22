/**
 * Export velocity guardrails — the policy half of `claim_export_slot`
 * (supabase/migrations/0033_export_audit.sql), same split as aiUsage.ts /
 * claim_ai_usage: numbers live here, enforcement lives in SQL, and the SQL
 * takes the numbers as parameters so tuning is an env change, not a deploy.
 *
 * What is being defended is different from the AI guardrails, so the shape
 * of the ceilings is too. Exports cost nothing upstream; the risk is bulk
 * exfiltration of company-generated documents. A real HR workday exports a
 * handful; the whole template library leaves in an afternoon only through a
 * loop. Burst catches the loop, the daily ceiling catches the patient
 * version of it, and every allowed export writes the audit row that makes
 * the artifact traceable regardless.
 *
 * No supabase-js import on purpose — unit-tested under Vitest, which cannot
 * resolve `npm:`/`jsr:` specifiers; the client arrives as a structural type.
 */

export type ExportScope = 'burst' | 'daily' | 'unauthenticated'

export interface ExportPolicy {
  burstWindowSeconds: number
  burstLimit: number
  dailyLimit: number
}

/** Reads a positive integer override from the function env; ignores junk. */
function envInt(name: string, fallback: number): number {
  const raw =
    typeof Deno !== 'undefined' && typeof Deno.env?.get === 'function'
      ? Deno.env.get(name)
      : undefined
  const parsed = Number(raw)
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback
}

/**
 * Slightly tighter than the client-side guard (src/lib/exportProtection/
 * localAudit.ts: 12 / 5min, 100 / day) — the server is the ceiling a cleared
 * localStorage cannot reset, so it must bind first for a signed-in client
 * that plays fair and still bind at all for one that does not.
 */
export function exportPolicy(): ExportPolicy {
  return {
    burstWindowSeconds: envInt('EXPORT_BURST_WINDOW_SECONDS', 300),
    burstLimit: envInt('EXPORT_BURST_LIMIT', 10),
    dailyLimit: envInt('EXPORT_DAILY_LIMIT', 80),
  }
}

export type ExportClaimDecision =
  | { kind: 'allowed'; exportId: string }
  | { kind: 'denied'; scope: ExportScope; limit: number; used: number; retryAfterSeconds: number }
  /** The guardrail itself could not be evaluated — callers must fail closed. */
  | { kind: 'unavailable'; reason: string }

/** Minimal surface of the service-role client this module needs. */
export interface ExportDbClient {
  rpc(
    fn: string,
    params: Record<string, unknown>,
  ): PromiseLike<{ data: unknown; error: { message: string } | null }>
}

export interface ExportClaimInput {
  userId: string
  surface: string
  kind: string
  title: string
  sha256: string
  contentChars: number
  lang: string
}

function toInt(value: unknown, fallback: number): number {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? Math.trunc(parsed) : fallback
}

/**
 * Parses the RPC's jsonb verdict; anything unrecognised is `unavailable`
 * rather than permission (fail closed — same posture as decisionFromRpc in
 * aiUsage.ts, and for the same reason).
 */
export function exportDecisionFromRpc(payload: unknown): ExportClaimDecision {
  if (payload === null || typeof payload !== 'object') {
    return { kind: 'unavailable', reason: 'malformed guardrail verdict' }
  }
  const verdict = payload as Record<string, unknown>
  if (verdict.allowed === true) {
    return typeof verdict.export_id === 'string' && verdict.export_id.length > 0
      ? { kind: 'allowed', exportId: verdict.export_id }
      : { kind: 'unavailable', reason: 'guardrail allowed the export without an id' }
  }
  if (verdict.allowed !== false) {
    return { kind: 'unavailable', reason: 'malformed guardrail verdict' }
  }
  const scope = verdict.scope
  return {
    kind: 'denied',
    scope: scope === 'burst' || scope === 'unauthenticated' ? scope : 'daily',
    limit: toInt(verdict.limit, 0),
    used: toInt(verdict.used, 0),
    /* Never 0 — a Retry-After of 0 invites the immediate retry the burst
       ceiling exists to stop. */
    retryAfterSeconds: Math.max(1, toInt(verdict.retry_after_seconds, 60)),
  }
}

/** Checks the ceilings and, on allow, writes the audit row in the same
 * atomic claim; the returned id is what the client embeds in the artifact. */
export async function claimExportSlot(
  admin: ExportDbClient,
  policy: ExportPolicy,
  input: ExportClaimInput,
): Promise<ExportClaimDecision> {
  try {
    const { data, error } = await admin.rpc('claim_export_slot', {
      p_user_id: input.userId,
      p_surface: input.surface,
      p_kind: input.kind,
      p_title: input.title,
      p_sha256: input.sha256,
      p_content_chars: input.contentChars,
      p_lang: input.lang,
      p_burst_window_seconds: policy.burstWindowSeconds,
      p_burst_limit: policy.burstLimit,
      p_daily_limit: policy.dailyLimit,
    })
    if (error) return { kind: 'unavailable', reason: error.message }
    return exportDecisionFromRpc(data)
  } catch (error) {
    return {
      kind: 'unavailable',
      reason: error instanceof Error ? error.message : String(error),
    }
  }
}

/** Machine-readable discriminator the client matches on (authorize.ts). */
export const EXPORT_LIMIT_CODE = 'export_limit'

/** The 429 body. English on purpose — the client maps code/scope to its own
 * {en, fr} copy; this prose is for a developer reading a log. */
export function exportLimitBody(decision: Extract<ExportClaimDecision, { kind: 'denied' }>) {
  return {
    error: 'Export limit reached for this account. Please try again later.',
    code: EXPORT_LIMIT_CODE,
    scope: decision.scope,
    retry_after_seconds: decision.retryAfterSeconds,
  }
}
