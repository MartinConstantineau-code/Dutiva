-- Score formula v2 + scheduled snapshots (docs/SCORING_LOGIC.md §8).
--
-- Two changes, one purpose: make the compliance score mean more and its
-- history depend less on who happens to open Analytics.
--
-- 1) formula_version. The blend that produces a snapshot's score changed
--    (v2: findings weighted by severity, cancelled tasks excluded, open
--    critical findings cap the blend at 69). Rows must say which formula
--    produced them so a trend crossing the change is labeled rather than
--    silently mixed. Existing rows default to 1 — all of them were written
--    by the v1 blend.
--
-- 2) A daily snapshot job. Until now history was write-on-read from the
--    Analytics view, and RLS only lets org owners/admins write — a month
--    where no admin opened Analytics left a gap. The job upserts every
--    org's *current* month daily with the service role, so each month's row
--    always exists and its last write is the month-close state. Daily
--    current-month upserts, not monthly-on-the-1st previous-month writes,
--    deliberately: the write is idempotent, a manual or late fire can never
--    rewrite a frozen month, and the freeze-at-month-end invariant of 0062
--    is preserved by construction. Same in-database scheduling pattern (and
--    rationale) as 0035_schedule_law_monitor.sql: the schedule lives beside
--    the data it writes, where a hosting or repo move can't take it away.
--
-- ─────────────────────────────────────────────────────────────────────────────
-- ONE MANUAL STEP: the job needs a service-role key to invoke the edge
-- function, and a key must never be committed. Add it once, in the Supabase
-- dashboard (SQL editor), and the next run picks it up automatically:
--
--   select vault.create_secret(
--     '<service-role or secret key>',
--     'score_snapshot_service_key',
--     'Service key used by the record-score-snapshots cron job'
--   );
--
-- Until that secret exists the job runs, finds no key, logs a warning and
-- returns — deliberately, so a missing secret is a no-op rather than a daily
-- error. Verify with: select * from public.score_snapshot_status();
-- ─────────────────────────────────────────────────────────────────────────────
--
-- ROLLBACK:
--   select cron.unschedule('record-score-snapshots-daily');
--   drop function if exists public.score_snapshot_status();
--   drop function if exists public.trigger_score_snapshots();
--   alter table public.compliance_score_snapshots drop column if exists formula_version;

alter table public.compliance_score_snapshots
  add column if not exists formula_version integer not null default 1;

comment on column public.compliance_score_snapshots.formula_version is
  'Score formula that produced this row. 1: unweighted done/total blend. '
  '2: severity-weighted findings, cancelled tasks excluded, open-critical '
  'ceiling of 69. Source of truth: SCORE_FORMULA_VERSION in '
  'src/features/app/views/analytics/aggregation.ts and its mirror in '
  'supabase/functions/record-score-snapshots/scoring.ts.';

create extension if not exists pg_cron;
create extension if not exists pg_net;

-- Invoke the edge function with the key from Vault. SECURITY DEFINER so the
-- job can read vault.decrypted_secrets; execute is service-role only, so a
-- signed-in user cannot trigger cross-org writes on demand.
create or replace function public.trigger_score_snapshots() returns void
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  v_key text;
begin
  select decrypted_secret into v_key
    from vault.decrypted_secrets
   where name = 'score_snapshot_service_key';

  if v_key is null or length(btrim(v_key)) = 0 then
    raise warning '[score-snapshots] vault secret "score_snapshot_service_key" is not set; skipping run';
    return;
  end if;

  -- Fire-and-forget: pg_net queues the request and the edge function does
  -- the work (a handful of small per-org queries; the timeout is ample).
  perform net.http_post(
    url     := 'https://khtwpxnvziiyplaflwru.supabase.co/functions/v1/record-score-snapshots',
    headers := jsonb_build_object(
      'Content-Type',  'application/json',
      'Authorization', 'Bearer ' || v_key
    ),
    body                 := '{}'::jsonb,
    timeout_milliseconds := 120000
  );
end;
$$;

revoke execute on function public.trigger_score_snapshots() from public, anon, authenticated;
grant  execute on function public.trigger_score_snapshots() to service_role;

-- Operational visibility: "is snapshot history actually accumulating?" as
-- one query — the silent-gap failure mode is exactly what this surfaces.
create or replace function public.score_snapshot_status()
returns table (
  secret_configured       boolean,
  job_scheduled           boolean,
  organizations_total     bigint,
  orgs_with_current_month bigint,
  last_write_at           timestamptz
)
language sql
security definer
set search_path = pg_catalog, public
as $$
  select
    exists (select 1 from vault.decrypted_secrets where name = 'score_snapshot_service_key'),
    exists (select 1 from cron.job where jobname = 'record-score-snapshots-daily' and active),
    (select count(*) from public.organizations),
    (select count(*) from public.compliance_score_snapshots
      where month = date_trunc('month', timezone('utc', now()))::date),
    (select max(updated_at) from public.compliance_score_snapshots);
$$;

revoke execute on function public.score_snapshot_status() from public, anon, authenticated;
grant  execute on function public.score_snapshot_status() to service_role;

-- 05:30 UTC daily — clear of the law monitor (07:00) and the digest, and
-- early enough that the "month-close" write for the last day of a month
-- lands before anyone in a Canadian timezone starts their day.
do $$
begin
  perform cron.unschedule('record-score-snapshots-daily');
exception
  when others then null;  -- not scheduled yet; nothing to remove
end;
$$;

select cron.schedule(
  'record-score-snapshots-daily',
  '30 5 * * *',
  'select public.trigger_score_snapshots()'
);
