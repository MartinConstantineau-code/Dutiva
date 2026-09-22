-- Support analytics (TODO.md D2, decided 2026-08-06): full support funnel,
-- workspace-scoped (not user-scoped), 90-day raw retention with forever
-- aggregates, first-party Supabase sink pinned to ca-central-1. See
-- docs/SUPPORT_ANALYTICS.md.
--
-- The privacy model in one paragraph: anonymous Help Centre events (search,
-- article view, helpfulness vote) carry only a daily-rotated opaque visitor
-- id — no user id, no workspace id, no email. Authenticated ticket events
-- carry workspace_id (the organization), never user_id. No document contents,
-- chat transcripts, employee records, or ticket body text are ever stored
-- here — only the category, source, and status of the ticket. Raw rows are
-- deleted after 90 days; daily aggregates are kept indefinitely. This is
-- first-party (no third-party cookies), covered by the existing Privacy
-- Policy and Terms, and does not require a consent banner — unlike GA4,
-- which is a separate sink gated on a consent banner that does not exist yet.
--
-- ROLLBACK:
--   select cron.unschedule('support-analytics-rollup');
--   drop function if exists public.support_analytics_status();
--   drop function if exists public.support_analytics_rollup();
--   drop table if exists public.support_analytics_daily cascade;
--   drop table if exists public.support_analytics_events cascade;

-- ── support_analytics_events (raw, 90-day retention) ──────────────────────
-- One row per analytics event. All writes are service-role (the
-- support-analytics-event edge function); no client RLS policy exists, so
-- the browser can neither read nor write this table.
create table if not exists public.support_analytics_events (
  id uuid primary key default gen_random_uuid(),
  -- What happened. The edge function validates against a fixed set.
  event_type text not null check (event_type in (
    'helpfulness_vote',     -- Help Centre article "was this helpful?" vote
    'help_search',          -- Help Centre search query executed
    'help_article_view',    -- Help Centre article page viewed
    'ticket_submitted',     -- Support ticket created (public or authenticated)
    'ticket_status_changed' -- Ticket status transitioned (admin action)
  )),
  -- Null for anonymous Help Centre events; the organization uuid for
  -- authenticated ticket events. Never a user id.
  workspace_id uuid,
  -- Daily-rotated opaque visitor id (client-generated, stored in localStorage).
  -- Lets us deduplicate votes and stitch a single visit without identifying
  -- a person. Null is allowed for events that don't carry one.
  anonymous_visitor_id text,
  -- Article slug for helpfulness_vote and help_article_view.
  article_slug text,
  -- The search query string for help_search. Capped at 200 chars by the edge
  -- function; we don't enforce it here because the function already did.
  search_query text,
  -- Number of results returned for help_search. Null for other events.
  search_result_count integer check (search_result_count is null or search_result_count >= 0),
  -- The vote value for helpfulness_vote ('yes' or 'no'). Null for other events.
  vote_value text check (vote_value is null or vote_value in ('yes', 'no')),
  -- Ticket reference for ticket events. We store the public_reference (not
  -- the uuid) so analytics can't be joined back to the ticket body without
  -- already having admin DB access — a minor but real layer of separation.
  ticket_reference text,
  -- Ticket category for ticket_submitted and ticket_status_changed.
  ticket_category text,
  -- 'public_form' or 'app_form' for ticket_submitted; the new status for
  -- ticket_status_changed.
  ticket_source text,
  -- The locale of the user when the event fired ('en' or 'fr').
  locale text check (locale is null or locale in ('en', 'fr')),
  occurred_at timestamptz not null default timezone('utc', now()),
  created_at timestamptz not null default timezone('utc', now())
);

create index if not exists support_analytics_events_occurred_idx
  on public.support_analytics_events (occurred_at desc);
create index if not exists support_analytics_events_type_idx
  on public.support_analytics_events (event_type, occurred_at desc);
create index if not exists support_analytics_events_workspace_idx
  on public.support_analytics_events (workspace_id, occurred_at desc)
  where workspace_id is not null;
create index if not exists support_analytics_events_article_idx
  on public.support_analytics_events (article_slug, occurred_at desc)
  where article_slug is not null;

alter table public.support_analytics_events enable row level security;

-- No client policies: service-role only. Same discipline as
-- support_notifications (0015) and law_update_notifications (0046).

-- ── support_analytics_daily (aggregate, forever retention) ────────────────
-- One row per (date, event_type, workspace_id, article_slug, ticket_category)
-- combination. Updated by the daily rollup job from the raw events table.
-- Kept indefinitely — the privacy commitment is that aggregates survive raw
-- deletion because they no longer identify an individual in a reasonably
-- foreseeable way (per the Data Retention Policy § Anonymization).
create table if not exists public.support_analytics_daily (
  id uuid primary key default gen_random_uuid(),
  day date not null,
  event_type text not null,
  workspace_id uuid,
  article_slug text,
  ticket_category text,
  event_count integer not null default 0,
  -- Helpful/unhelpful split for helpfulness_vote rows.
  helpfulness_yes integer not null default 0,
  helpfulness_no integer not null default 0,
  -- Search-specific aggregates.
  search_zero_results integer not null default 0,
  created_at timestamptz not null default timezone('utc', now()),
  unique (day, event_type, workspace_id, article_slug, ticket_category)
);

create index if not exists support_analytics_daily_day_idx
  on public.support_analytics_daily (day desc);
create index if not exists support_analytics_daily_type_idx
  on public.support_analytics_daily (event_type, day desc);

alter table public.support_analytics_daily enable row level security;

-- Admin read only — same rule as the raw table's non-existent client policy:
-- no client can read analytics. Admins can, via the is_admin() RPC.
create policy "Admins read support analytics daily"
  on public.support_analytics_daily for select
  using (is_admin((select auth.uid())));

-- ── Daily rollup: raw → aggregate ──────────────────────────────────────────
-- Runs at 01:00 UTC daily. Aggregates the previous day's raw events into
-- support_analytics_daily, then deletes raw rows older than 90 days.
-- Combining rollup and retention in one job is deliberate: the rollup must
-- succeed before retention deletes anything, so a rollup failure doesn't
-- lose data — it just retries the next day.

create or replace function public.support_analytics_rollup() returns void
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
begin
  -- Aggregate yesterday's events (UTC) into the daily table.
  -- upsert so a re-run for the same day corrects rather than duplicates.
  insert into public.support_analytics_daily (
    day, event_type, workspace_id, article_slug, ticket_category,
    event_count, helpfulness_yes, helpfulness_no, search_zero_results
  )
  select
    date_trunc('day', occurred_at, 'UTC')::date as day,
    event_type,
    workspace_id,
    article_slug,
    ticket_category,
    count(*) as event_count,
    count(*) filter (where event_type = 'helpfulness_vote' and vote_value = 'yes') as helpfulness_yes,
    count(*) filter (where event_type = 'helpfulness_vote' and vote_value = 'no') as helpfulness_no,
    count(*) filter (where event_type = 'help_search' and search_result_count = 0) as search_zero_results
  from public.support_analytics_events
  where occurred_at >= date_trunc('day', now() - interval '1 day', 'UTC')
    and occurred_at <  date_trunc('day', now(), 'UTC')
  group by 1, 2, 3, 4, 5
  on conflict (day, event_type, workspace_id, article_slug, ticket_category)
  do update set
    event_count        = excluded.event_count,
    helpfulness_yes    = excluded.helpfulness_yes,
    helpfulness_no     = excluded.helpfulness_no,
    search_zero_results = excluded.search_zero_results;

  -- Delete raw rows older than 90 days. Aggregates are already preserved.
  delete from public.support_analytics_events
   where occurred_at < timezone('utc', now()) - interval '90 days';
end;
$$;

revoke execute on function public.support_analytics_rollup() from public, anon, authenticated;
grant  execute on function public.support_analytics_rollup() to service_role;

-- ── Operational visibility, same shape as every other status function ──────
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

-- ── Scheduling ─────────────────────────────────────────────────────────────
-- 01:00 UTC daily: rollup yesterday's events, then delete raw rows >90 days.
-- Single job (support_analytics_rollup does both in one transaction).
do $$
begin
  perform cron.unschedule('support-analytics-rollup');
exception
  when others then null;
end;
$$;

select cron.schedule(
  'support-analytics-rollup',
  '0 1 * * *',
  'select public.support_analytics_rollup()'
);
