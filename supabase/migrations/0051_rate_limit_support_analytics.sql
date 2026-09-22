-- Rate-limit the support analytics sink.
--
-- ── WHY ──────────────────────────────────────────────────────────────────────
-- `support-analytics-event` runs with `verify_jwt = false`, and it has to: its
-- client posts a bare body with no apikey and no Authorization so the flush can
-- survive page unload (src/features/support/analytics/supportAnalytics.ts).
-- That makes it an unauthenticated write path accepting up to 50 events per
-- request.
--
-- Its docblock says it follows "the same inert-unless-configured discipline as
-- report-error". It didn't. `report-error` is public too, but defends itself
-- with a peppered IP hash and the `client_error_rate_limit` window from 0019.
-- This function had neither, so anyone could POST arbitrary rows into
-- `support_analytics_events` indefinitely. The 90-day retention bounds the
-- storage; it does nothing for the accuracy of every funnel metric built on
-- those rows — and a metric you cannot trust is worse than one you don't have.
--
-- ── SHAPE ────────────────────────────────────────────────────────────────────
-- Deliberately the same as 0019, because a second pattern for the same problem
-- is a second thing to get wrong: keyed IP hash from the edge function (never a
-- raw IP), a transaction-scoped advisory lock so the check cannot be raced, an
-- all-sources sweep on every call so a one-shot sender's hash does not linger,
-- and SECURITY DEFINER with execute granted to service_role only.
--
-- One difference, and it is the point: this limiter counts EVENTS, not
-- requests. A request may carry 50, so a request-counted limit of 60/minute
-- would permit 3,000 events a minute. `event_count` on each limiter row and a
-- sum over the window is what actually bounds the write volume.
--
-- ROLLBACK:
--   drop function if exists public.ingest_support_analytics_events(text, jsonb, integer, integer);
--   drop table if exists public.support_analytics_rate_limit;

create table if not exists public.support_analytics_rate_limit (
  id uuid primary key default gen_random_uuid(),
  ip_hash text not null,
  event_count smallint not null,
  created_at timestamptz not null default timezone('utc', now())
);

create index if not exists support_analytics_rate_limit_ip_idx
  on public.support_analytics_rate_limit (ip_hash, created_at);
-- Supports the all-sources sweep by age in the ingest RPC.
create index if not exists support_analytics_rate_limit_created_idx
  on public.support_analytics_rate_limit (created_at);

alter table public.support_analytics_rate_limit enable row level security;

-- Admin read only. No anon/authenticated INSERT policy: every write goes
-- through the RPC below under the service role.
create policy "Admins read support analytics rate limit"
  on public.support_analytics_rate_limit for select
  using (is_admin((select auth.uid())));

-- ── Atomic ingest: limit check + insert in one transaction ───────────────────
-- Returns 'ok' when the batch was stored, 'rate_limited' when the window is
-- full. The caller treats both as success — analytics is best-effort and must
-- never surface an error to a page.
create or replace function public.ingest_support_analytics_events(
  p_ip_hash        text,
  p_events         jsonb,
  p_window_seconds integer,
  p_limit          integer
) returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  v_since timestamptz := now() - make_interval(secs => greatest(p_window_seconds, 1));
  v_incoming integer := coalesce(jsonb_array_length(p_events), 0);
  v_used integer;
begin
  if v_incoming = 0 then
    return 'ok';
  end if;

  -- Serialize per source hash for the life of this transaction, so a burst of
  -- concurrent requests from one source cannot race past the limit.
  perform pg_advisory_xact_lock(hashtext(coalesce(p_ip_hash, '')));

  -- Sweep expired limiter rows for ALL sources, so a one-shot sender's hash is
  -- removed by the next call from anyone rather than lingering until that same
  -- source returns. Index-backed on created_at.
  delete from public.support_analytics_rate_limit where created_at < v_since;

  select coalesce(sum(event_count), 0) into v_used
    from public.support_analytics_rate_limit
    where ip_hash = p_ip_hash and created_at >= v_since;

  if v_used + v_incoming > greatest(p_limit, 1) then
    return 'rate_limited';
  end if;

  insert into public.support_analytics_rate_limit (ip_hash, event_count)
  values (p_ip_hash, v_incoming);

  insert into public.support_analytics_events (
    event_type, workspace_id, anonymous_visitor_id, article_slug, search_query,
    search_result_count, vote_value, ticket_reference, ticket_category,
    ticket_source, locale, occurred_at
  )
  select
    e->>'event_type',
    nullif(e->>'workspace_id', '')::uuid,
    e->>'anonymous_visitor_id',
    e->>'article_slug',
    e->>'search_query',
    nullif(e->>'search_result_count', '')::integer,
    e->>'vote_value',
    e->>'ticket_reference',
    e->>'ticket_category',
    e->>'ticket_source',
    e->>'locale',
    (e->>'occurred_at')::timestamptz
  from jsonb_array_elements(p_events) as e;

  return 'ok';
end;
$$;

-- The endpoint is public (verify_jwt off); only the service role may ingest.
revoke all on function public.ingest_support_analytics_events(text, jsonb, integer, integer) from public;
revoke all on function public.ingest_support_analytics_events(text, jsonb, integer, integer) from anon, authenticated;
grant execute on function public.ingest_support_analytics_events(text, jsonb, integer, integer) to service_role;
