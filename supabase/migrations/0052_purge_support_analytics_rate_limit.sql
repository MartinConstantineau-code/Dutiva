-- Schedule the purge 0051 forgot, and make its absence visible.
--
-- ── THE GAP ──────────────────────────────────────────────────────────────────
-- 0051 says it is "deliberately the same as 0019, because a second pattern for
-- the same problem is a second thing to get wrong". It copied the ingest half
-- faithfully — keyed IP hash, advisory lock, all-sources sweep, SECURITY
-- DEFINER to service_role — and left out the half 0019 marks REQUIRED.
--
-- 0019's own words, above `client_error_rate_limit`: the in-RPC sweep means "a
-- hash lives at most ~one window under any traffic; the scheduled
-- purge_client_error_data() job below covers the zero-traffic tail." The sweep
-- in `ingest_support_analytics_events` only runs when a request arrives, so on
-- a quiet endpoint the last caller's rows are the ones that stay: nothing
-- deletes them until somebody posts another event. `support_analytics_events`
-- has a scheduled cleanup (support_analytics_rollup, 01:00 UTC, 0047);
-- `support_analytics_rate_limit` had none at all.
--
-- What lingers is a peppered HMAC of an IP, holding no event content — the same
-- minimized pseudonymous value 0019 describes, and explicitly "not claimed to
-- be fully anonymous". It is swept aggressively or it is not minimized, and
-- traffic-driven-only is not a schedule. This adds the schedule.
--
-- ── SHAPE ────────────────────────────────────────────────────────────────────
-- One hour, matching purge_client_error_data() exactly rather than inventing a
-- second number. The limiter window is 60 seconds, so an hourly floor is ~60x
-- the retention the limiter actually needs and cannot affect its accuracy.
--
-- Scheduled here, in the migration, unlike 0019 — which deliberately left
-- scheduling to a DEPLOY note so a replay could not hard-fail on a project
-- without pg_cron. 0047 already schedules support-analytics-rollup inline on
-- this same project, and the DEPLOY-note path is exactly how this repo keeps
-- arriving at "merged, applied, and never actually running" (OA17, TODO.md).
-- Following the closer precedent: schedule it, then expose whether it is
-- scheduled so the claim is checkable instead of assumed.
--
-- ROLLBACK:
--   select cron.unschedule('purge-support-analytics-rate-limit');
--   drop function if exists public.purge_support_analytics_rate_limit();
--   -- support_analytics_status() reverts to its 0047 five-column shape.

-- ── Purge ────────────────────────────────────────────────────────────────────
create or replace function public.purge_support_analytics_rate_limit() returns void
language sql
security definer
set search_path = pg_catalog, public
as $$
  delete from public.support_analytics_rate_limit
   where created_at < now() - interval '1 hour';
$$;

revoke all on function public.purge_support_analytics_rate_limit() from public, anon, authenticated;
-- pg_cron runs as the function owner and needs no grant; the external-scheduler
-- path (Vercel Cron / GitHub Action) calls it as service_role, as 0019 does.
grant execute on function public.purge_support_analytics_rate_limit() to service_role;

-- ── Operational visibility ───────────────────────────────────────────────────
-- Extends 0047's status function rather than adding a second one. The return
-- type changes, so it must be dropped first — `create or replace` cannot widen
-- a returns-table signature. No application code calls it (docs only), so this
-- is safe; see docs/SUPPORT_ANALYTICS.md § Verifying.
drop function if exists public.support_analytics_status();

create or replace function public.support_analytics_status()
returns table (
  rollup_scheduled           boolean,
  raw_event_count            bigint,
  oldest_raw_event           timestamptz,
  daily_aggregate_rows       bigint,
  latest_aggregate_day       date,
  -- The two below exist so "the limiter is bounded" is a query, not a belief.
  -- rate_limit_purge_scheduled false with a non-zero, ageing oldest_rate_limit_row
  -- is the failure this migration exists to prevent.
  rate_limit_purge_scheduled boolean,
  rate_limit_rows            bigint,
  oldest_rate_limit_row      timestamptz
)
language sql
security definer
set search_path = pg_catalog, public
as $$
  select
    exists (select 1 from cron.job where jobname = 'support-analytics-rollup' and active),
    (select count(*) from public.support_analytics_events),
    (select min(occurred_at) from public.support_analytics_events),
    (select count(*) from public.support_analytics_daily),
    (select max(day) from public.support_analytics_daily),
    exists (select 1 from cron.job where jobname = 'purge-support-analytics-rate-limit' and active),
    (select count(*) from public.support_analytics_rate_limit),
    (select min(created_at) from public.support_analytics_rate_limit);
$$;

revoke execute on function public.support_analytics_status() from public, anon, authenticated;
grant  execute on function public.support_analytics_status() to service_role;

-- ── Scheduling ───────────────────────────────────────────────────────────────
-- :17 past the hour, off the top-of-hour crowd and away from 0047's 01:00
-- rollup. Same unschedule-guard shape as 0047 so a re-run replaces rather than
-- duplicates.
do $$
begin
  perform cron.unschedule('purge-support-analytics-rate-limit');
exception
  when others then null;
end;
$$;

select cron.schedule(
  'purge-support-analytics-rate-limit',
  '17 * * * *',
  'select public.purge_support_analytics_rate_limit()'
);
