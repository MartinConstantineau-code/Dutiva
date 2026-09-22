import { describe, expect, it } from 'vitest'
import { messages } from './index'
import type {
  MarketingMessageKey,
  MessageKey,
  SharedMessageKey,
  WorkspaceMessageKey,
} from './index'

/**
 * Guards the surface-scoped key types (TODO.md EF6a).
 *
 * **This is deliberately NOT the "every `MessageKey` resolves" test.** That test
 * cannot be written for a split catalogue — the reachable set is the whole union
 * by construction, so it would pass while proving nothing. What matters instead
 * is that the three scopes stay *disjoint where they claim to be*: if a module
 * is moved into the wrong group, or listed in two groups at once, the unions
 * quietly collapse into `MessageKey` and every call site silently loses its
 * constraint. Nothing else would notice.
 *
 * The `@ts-expect-error` assertions below are the real test, and they run at
 * compile time: each one FAILS THE BUILD if the error it expects stops
 * happening — i.e. if a key that must not cross a surface boundary becomes
 * assignable. The runtime assertions only pin the sample keys to real entries,
 * so this file cannot rot into testing typos.
 */
describe('surface-scoped message keys', () => {
  /* Sample keys, one per scope. Runtime-checked below so a rename cannot leave
     the type assertions silently testing nothing. */
  const workspaceOnlySample = 'shell_nav_platform'
  const marketingOnlySample = 'about_h1'
  const sharedSample = 'landing_free_desc'

  it('samples are real catalogue entries', () => {
    expect(messages).toHaveProperty(workspaceOnlySample)
    expect(messages).toHaveProperty(marketingOnlySample)
    expect(messages).toHaveProperty(sharedSample)
  })

  it('the scopes are disjoint where they claim to be (compile-time)', () => {
    /* A workspace-only key is a workspace key and a MessageKey… */
    const w: WorkspaceMessageKey = workspaceOnlySample
    const wAsAny: MessageKey = workspaceOnlySample
    /* …but must NOT be reachable from marketing. */
    // @ts-expect-error workspace-only key must not be assignable to MarketingMessageKey
    const wAsMarketing: MarketingMessageKey = workspaceOnlySample
    /* …and must not be in the shared set. */
    // @ts-expect-error workspace-only key must not be assignable to SharedMessageKey
    const wAsShared: SharedMessageKey = workspaceOnlySample

    /* Mirror image for a marketing-only key. */
    const m: MarketingMessageKey = marketingOnlySample
    // @ts-expect-error marketing-only key must not be assignable to WorkspaceMessageKey
    const mAsWorkspace: WorkspaceMessageKey = marketingOnlySample
    // @ts-expect-error marketing-only key must not be assignable to SharedMessageKey
    const mAsShared: SharedMessageKey = marketingOnlySample

    /* A shared key is assignable to every scope — that is what "shared" means,
       and it is why `landing` cannot be moved out of the shared group while
       PlanGate resolves plan copy through t(). */
    const s: SharedMessageKey = sharedSample
    const sAsWorkspace: WorkspaceMessageKey = sharedSample
    const sAsMarketing: MarketingMessageKey = sharedSample

    expect([
      w,
      wAsAny,
      wAsMarketing,
      wAsShared,
      m,
      mAsWorkspace,
      mAsShared,
      s,
      sAsWorkspace,
      sAsMarketing,
    ]).toHaveLength(10)
  })
})
