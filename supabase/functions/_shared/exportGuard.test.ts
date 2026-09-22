import { describe, expect, it } from 'vitest'
import {
  EXPORT_LIMIT_CODE,
  claimExportSlot,
  exportDecisionFromRpc,
  exportLimitBody,
  exportPolicy,
} from './exportGuard'
import type { ExportDbClient } from './exportGuard'

/**
 * The export guardrail's TS half. Ceilings are enforced in SQL
 * (0033_export_audit.sql); these tests pin what could fail *open*: verdict
 * parsing, the parameters handed to the RPC, and fail-closed behaviour when
 * the guardrail cannot be evaluated (same contract as aiUsage.test.ts).
 */

function rpcClient(result: { data: unknown; error: { message: string } | null }) {
  const calls: { fn: string; params: Record<string, unknown> }[] = []
  const client: ExportDbClient = {
    rpc(fn, params) {
      calls.push({ fn, params })
      return Promise.resolve(result)
    },
  }
  return { client, calls }
}

describe('exportDecisionFromRpc', () => {
  it('allows a verdict carrying the minted export id', () => {
    expect(exportDecisionFromRpc({ allowed: true, export_id: 'row-1' })).toEqual({
      kind: 'allowed',
      exportId: 'row-1',
    })
  })

  it('treats an allow without an id as unavailable, not permission', () => {
    expect(exportDecisionFromRpc({ allowed: true })).toMatchObject({ kind: 'unavailable' })
  })

  it('maps a denial to its scope, counts and retry delay', () => {
    expect(
      exportDecisionFromRpc({
        allowed: false,
        scope: 'burst',
        limit: 10,
        used: 10,
        retry_after_seconds: 42,
      }),
    ).toEqual({ kind: 'denied', scope: 'burst', limit: 10, used: 10, retryAfterSeconds: 42 })
  })

  it('never returns a zero retry delay and defaults unknown scopes to daily', () => {
    expect(
      exportDecisionFromRpc({ allowed: false, scope: 'weird', retry_after_seconds: 0 }),
    ).toMatchObject({ kind: 'denied', scope: 'daily', retryAfterSeconds: 1 })
  })

  it.each([
    ['null', null],
    ['a string', 'nope'],
    ['a verdict with no allowed field', { export_id: 'x' }],
  ])('fails closed on %s', (_label, payload) => {
    expect(exportDecisionFromRpc(payload)).toMatchObject({ kind: 'unavailable' })
  })
})

describe('claimExportSlot', () => {
  const input = {
    userId: 'user-1',
    surface: 'docstudio',
    kind: 'pdf',
    title: 'Termination Letter',
    sha256: 'a'.repeat(64),
    contentChars: 1200,
    lang: 'en',
  }

  it('hands the policy ceilings and the export facts to the RPC', async () => {
    const { client, calls } = rpcClient({
      data: { allowed: true, export_id: 'row-9' },
      error: null,
    })
    const decision = await claimExportSlot(client, exportPolicy(), input)
    expect(decision).toEqual({ kind: 'allowed', exportId: 'row-9' })
    expect(calls).toHaveLength(1)
    expect(calls[0]?.fn).toBe('claim_export_slot')
    expect(calls[0]?.params).toMatchObject({
      p_user_id: 'user-1',
      p_surface: 'docstudio',
      p_kind: 'pdf',
      p_sha256: 'a'.repeat(64),
      p_burst_limit: 10,
      p_daily_limit: 80,
    })
  })

  it('fails closed when the RPC errors or throws', async () => {
    const { client } = rpcClient({ data: null, error: { message: 'boom' } })
    expect(await claimExportSlot(client, exportPolicy(), input)).toEqual({
      kind: 'unavailable',
      reason: 'boom',
    })
    const throwing: ExportDbClient = {
      rpc() {
        throw new Error('connection reset')
      },
    }
    expect(await claimExportSlot(throwing, exportPolicy(), input)).toEqual({
      kind: 'unavailable',
      reason: 'connection reset',
    })
  })
})

describe('exportLimitBody', () => {
  it('carries the machine-readable code, scope and retry delay', () => {
    const body = exportLimitBody({
      kind: 'denied',
      scope: 'burst',
      limit: 10,
      used: 10,
      retryAfterSeconds: 90,
    })
    expect(body.code).toBe(EXPORT_LIMIT_CODE)
    expect(body.scope).toBe('burst')
    expect(body.retry_after_seconds).toBe(90)
  })
})
