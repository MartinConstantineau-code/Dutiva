-- Applied to the live project 2026-08-06 (version 20260806035341).
-- Recovered from supabase_migrations.schema_migrations on 2026-08-06.
--
-- ALREADY APPLIED — this file is the record, not a pending change. Applied
-- directly to the project with no file committed; surfaced by the reverse
-- drift check in scripts/check-migrations.mjs. See docs/TODO.md.
--
-- A same-day correction to 0047's `support_analytics_status()`: the drop is
-- there because changing a function's OUT columns cannot be done with
-- `create or replace` alone (42P13).
--
-- NOTE ON ORDER: 0052 later widened this same function to six columns, adding
-- `rate_limit_purge_scheduled`. So 0052 — not this file — is the shape in
-- force, even though it carries the lower repo number here. Repo numbering
-- reflects when a file was added, and these eight were added months after they
-- ran; the applied version above is the real chronology.
--
-- Replaying this in isolation would REVERT the function to five columns and
-- break 0052's status check. Do not.

drop function if exists public.support_analytics_status();

create or replace function public.support_analytics_status()
returns table (
  rollup_scheduled     boolean,
  raw_event_count      bigint,
  oldest_raw_event     timestamptz,
  daily_aggregate_rows bigint,
  latest_aggregate_day date
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
    (select max(day) from public.support_analytics_daily);
$$;

revoke execute on function public.support_analytics_status() from public, anon, authenticated;
grant  execute on function public.support_analytics_status() to service_role;
