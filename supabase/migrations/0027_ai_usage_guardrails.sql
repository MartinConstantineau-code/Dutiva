-- Beta usage guardrails for the generative AI surface.
--
-- During the beta every product feature is open to everyone on the beta list
-- (0026_open_workspace_to_beta_list.sql) and paid plans are not sold
-- (PAID_PLANS_DISABLED_DURING_BETA, src/config/plans.ts). Nothing therefore
-- stands between an invited account and an unmetered upstream model bill —
-- the AI API is the one surface that costs real money per request, so it is
-- the one surface that has to be metered. This migration supplies the
-- mechanism; the numbers live in supabase/functions/_shared/aiUsage.ts and are
-- passed in as parameters (same split as ingest_client_error_report in 0019).
--
-- It also repairs three defects that made the *existing* guardrails inert. The
-- CHECK constraints on ai_telemetry_events predate the functions that write to
-- it and never learned their vocabulary, so every one of these inserts has been
-- failing against the live project:
--
--   * operation 'support_firstline' (support-firstline) — rejected. That
--     function's per-user hourly rate limit counts rows with exactly that
--     operation, so it counted rows that could never exist: the limit has
--     never fired, and that endpoint has been effectively unlimited.
--   * operation 'safety_backstop' (advisor-safety-event) — rejected. That
--     function returns 500 when the insert fails, so every safety-gate report
--     has 500'd and the crisis/figure-gate hit rate is unobservable.
--   * status 'error' (advisor-chat, support-firstline upstream failures) —
--     rejected; the allowed set is completed/failed/cancelled. Upstream
--     failures have gone unrecorded.
--
-- Confirmed on the live project before writing this: ai_telemetry_events held
-- rows for ('chat','completed') and nothing else. The status vocabulary stays
-- canonical here — the functions are changed to write 'failed' rather than
-- 'error' — and 'started' is added for the in-flight claim below.
--
-- ROLLBACK:
--   drop function if exists public.claim_ai_usage(
--     uuid, text, uuid, text, text, integer, integer, integer, bigint, integer, text[]);
--   drop index if exists public.ai_telemetry_user_op_created_idx;
--   drop index if exists public.ai_telemetry_created_idx;
--   -- and restore the narrower CHECK constraints if the writers are reverted too.

-- ── 1. Teach the constraints the vocabulary the writers actually use ───────
alter table public.ai_telemetry_events
  drop constraint if exists ai_telemetry_events_operation_check;
alter table public.ai_telemetry_events
  add constraint ai_telemetry_events_operation_check
  check (operation in (
    -- pre-existing set, unchanged
    'chat', 'draft', 'embed', 'classify', 'summarize', 'recommend', 'score', 'tool_call',
    -- written by supabase/functions/support-firstline
    'support_firstline',
    -- written by supabase/functions/advisor-safety-event (not a model call —
    -- deliberately excluded from the guardrail counts below)
    'safety_backstop'
  ));

alter table public.ai_telemetry_events
  drop constraint if exists ai_telemetry_events_status_check;
alter table public.ai_telemetry_events
  add constraint ai_telemetry_events_status_check
  check (status in (
    -- 'started' is a claimed-but-not-yet-finished call (see claim_ai_usage).
    -- A row that never leaves 'started' — function timeout, cold-start kill —
    -- keeps counting against the caller, which is the fail-safe direction.
    'started', 'completed', 'failed', 'cancelled'
  ));

-- ── 2. Indexes the guardrail counts need ──────────────────────────────────
-- Neither existing index (provider/model/operation, organization_id) supports
-- "this user's calls in the last N seconds", which is every query below.
create index if not exists ai_telemetry_user_op_created_idx
  on public.ai_telemetry_events (user_id, operation, created_at desc);
-- Platform-wide ceiling: all model calls in the window, regardless of user.
create index if not exists ai_telemetry_created_idx
  on public.ai_telemetry_events (created_at desc);

-- ── 3. Atomic claim: check every ceiling and reserve the slot together ─────
-- The failure mode this exists to prevent is the one support-firstline's
-- SELECT-then-call already has: N concurrent requests all read a count below
-- the limit and all proceed. A transaction-scoped advisory lock serializes
-- claims so check-and-reserve cannot be raced.
--
-- The lock key is a single constant rather than per-user: the platform-wide
-- ceiling is a global count, so a per-user lock would leave exactly that
-- ceiling raceable. Claims are therefore serialized across the whole project.
-- That is a deliberate beta-scale trade — the lock is held only for this
-- counting transaction (single-digit ms, index-backed), never across the
-- upstream model call, which is where the seconds actually go. Revisit if
-- concurrent AI traffic ever makes the claim itself a queue.
--
-- Denials are NOT recorded here. A denial row would either count against the
-- caller (compounding a limit they have already hit) or need excluding from
-- every count, and under a hammering client it is unbounded write
-- amplification. The edge function logs denials to the function log instead.
--
-- Returns jsonb: { allowed, scope, limit, used, retry_after_seconds, claim_id }.
-- `scope` names which ceiling refused ('burst' | 'daily' | 'daily_tokens' |
-- 'platform_daily') so the caller can say something specific.
create or replace function public.claim_ai_usage(
  p_user_id uuid,
  p_operation text,
  p_organization_id uuid,
  p_provider text,
  p_model text,
  p_burst_window_seconds integer,
  p_burst_limit integer,
  p_daily_request_limit integer,
  p_daily_token_limit bigint,
  p_platform_daily_limit integer,
  p_metered_operations text[]
) returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_now timestamptz := now();
  v_burst_since timestamptz := v_now - make_interval(secs => greatest(p_burst_window_seconds, 1));
  v_day_since timestamptz := v_now - interval '24 hours';
  v_count integer;
  v_tokens bigint;
  v_oldest timestamptz;
  v_org uuid;
  v_claim uuid;
begin
  if p_user_id is null then
    return jsonb_build_object('allowed', false, 'scope', 'unauthenticated');
  end if;

  perform pg_advisory_xact_lock(hashtext('ai_usage_claim'));

  -- Burst: this user, this operation, short window. Catches runaway retry
  -- loops and scripted hammering before either becomes a bill.
  select count(*), min(created_at) into v_count, v_oldest
    from public.ai_telemetry_events
    where user_id = p_user_id
      and operation = p_operation
      and created_at >= v_burst_since;
  if v_count >= greatest(p_burst_limit, 1) then
    return jsonb_build_object(
      'allowed', false,
      'scope', 'burst',
      'limit', p_burst_limit,
      'used', v_count,
      -- Free again when the oldest call in the window ages out of it.
      'retry_after_seconds',
        greatest(1, ceil(extract(epoch from
          (v_oldest + make_interval(secs => greatest(p_burst_window_seconds, 1)) - v_now)))::integer)
    );
  end if;

  -- Daily requests: this user, rolling 24h, across every metered operation —
  -- the Advisor and the support helper draw on one budget, so moving between
  -- them cannot double it.
  select count(*), min(created_at) into v_count, v_oldest
    from public.ai_telemetry_events
    where user_id = p_user_id
      and operation = any(p_metered_operations)
      and created_at >= v_day_since;
  if v_count >= greatest(p_daily_request_limit, 1) then
    return jsonb_build_object(
      'allowed', false,
      'scope', 'daily',
      'limit', p_daily_request_limit,
      'used', v_count,
      'retry_after_seconds',
        greatest(1, ceil(extract(epoch from (v_oldest + interval '24 hours' - v_now)))::integer)
    );
  end if;

  -- Daily tokens: request count alone does not bound cost, because one long
  -- thread can cost what fifty short ones do. In-flight claims carry null
  -- tokens and simply do not contribute yet.
  select coalesce(sum(total_tokens), 0), min(created_at) into v_tokens, v_oldest
    from public.ai_telemetry_events
    where user_id = p_user_id
      and operation = any(p_metered_operations)
      and created_at >= v_day_since
      and total_tokens is not null;
  if v_tokens >= greatest(p_daily_token_limit, 1) then
    return jsonb_build_object(
      'allowed', false,
      'scope', 'daily_tokens',
      'limit', p_daily_token_limit,
      'used', v_tokens,
      'retry_after_seconds',
        greatest(1, ceil(extract(epoch from
          (coalesce(v_oldest, v_now) + interval '24 hours' - v_now)))::integer)
    );
  end if;

  -- Platform ceiling: the actual stop on a beta-wide cost surprise, whether
  -- that is one enthusiastic account or fifty ordinary ones. Deliberately last
  -- — a caller should learn they personally are fine before being told the
  -- project is saturated.
  select count(*), min(created_at) into v_count, v_oldest
    from public.ai_telemetry_events
    where operation = any(p_metered_operations)
      and created_at >= v_day_since;
  if v_count >= greatest(p_platform_daily_limit, 1) then
    return jsonb_build_object(
      'allowed', false,
      'scope', 'platform_daily',
      'limit', p_platform_daily_limit,
      'used', v_count,
      'retry_after_seconds',
        greatest(1, ceil(extract(epoch from (v_oldest + interval '24 hours' - v_now)))::integer)
    );
  end if;

  -- organization_id arrives from the client and is FK-constrained. An id that
  -- does not resolve must not fail the claim (that would turn a cosmetic
  -- attribution error into an outage) — drop the attribution, keep the call.
  select id into v_org from public.organizations where id = p_organization_id;

  insert into public.ai_telemetry_events
    (organization_id, user_id, provider, model, operation, status)
  values
    (v_org, p_user_id, p_provider, p_model, p_operation, 'started')
  returning id into v_claim;

  return jsonb_build_object('allowed', true, 'claim_id', v_claim);
end;
$$;

-- Callers are edge functions holding the service role. No PostgREST role may
-- reach this directly: the parameters ARE the limits, so an authenticated
-- caller able to invoke it could hand itself any ceiling it liked.
revoke all on function public.claim_ai_usage(
  uuid, text, uuid, text, text, integer, integer, integer, bigint, integer, text[]) from public;
revoke all on function public.claim_ai_usage(
  uuid, text, uuid, text, text, integer, integer, integer, bigint, integer, text[]) from anon, authenticated;
grant execute on function public.claim_ai_usage(
  uuid, text, uuid, text, text, integer, integer, integer, bigint, integer, text[]) to service_role;
