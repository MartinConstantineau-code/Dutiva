-- Retention policy for ai_telemetry_events.
--
-- Unlike client_error_reports (90-day window, carries PII-bearing
-- message/stack), telemetry rows hold only token counts, latency,
-- and operation names — no message bodies or user content. A longer
-- 180-day window therefore balances cost/trend analysis against
-- unbounded growth. The brief (DEVIN_HANDOFF.md §2.6) flagged this
-- table as "grows forever" with no retention decision made yet.
--
-- Pattern mirrors 0019_client_error_reports.sql:
--   1. A SECURITY DEFINER purge function, callable only by service_role.
--   2. A pg_cron job that runs it daily (telemetry is lower-volume than
--      crash reports, so hourly is overkill).
--
-- No opportunistic purge inside claim_ai_usage because that function
-- already holds an advisory lock and purging under it would widen the
-- critical section under load.

create or replace function public.purge_ai_telemetry_data() returns void
language sql
security definer
set search_path = public
as $$
  delete from public.ai_telemetry_events
    where created_at < now() - interval '180 days';
$$;

revoke all on function public.purge_ai_telemetry_data() from public, anon, authenticated;
grant execute on function public.purge_ai_telemetry_data() to service_role;

-- Schedule: once daily at 04:17 UTC (off-peak, staggered from the
-- hourly :23 client-error purge to avoid overlapping I/O).
select cron.schedule(
  'purge-ai-telemetry-data',
  '17 4 * * *',
  'select public.purge_ai_telemetry_data()'
);
