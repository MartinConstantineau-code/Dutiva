-- Month-close hardening for the score-snapshot job — two fixes the v3
-- adversarial review confirmed (docs/SCORING_LOGIC.md §2.3/§8).
--
-- 1) The close was one unretried shot. 0069 scheduled a single 00:05 UTC
--    invocation on the 1st; pg_cron does not backfill missed runs and
--    net.http_post is fire-and-forget, so one transient failure (edge
--    function cold-start error, DB maintenance at 00:05) silently lost the
--    month's close — the month stayed frozen at its last 05:30 daily state
--    and nothing surfaced it. The close becomes three idempotent attempts
--    inside the first UTC hour of the 1st (00:05 / 00:25 / 00:45); the
--    edge function writes the previous month during that whole hour, and
--    the last successful attempt wins with at most ~1 h of skew past the
--    boundary.
--
-- 2) A missed close was undetectable. score_snapshot_status() only looked
--    at the daily job and current-month rows; the previous month's row
--    always exists from daily runs, so a lost close looked healthy. The
--    status function now also reports whether the month-close job is
--    scheduled and how many orgs' previous-month rows were actually
--    stamped at-or-after the month boundary (i.e. by a close run, not
--    only by the last daily run).
--
-- ROLLBACK:
--   select cron.unschedule('record-score-snapshots-month-close');
--   select cron.schedule('record-score-snapshots-month-close', '5 0 1 * *',
--     'select public.trigger_score_snapshots()');
--   -- and restore the 0068 body of public.score_snapshot_status()

do $$
begin
  perform cron.unschedule('record-score-snapshots-month-close');
exception
  when others then null;  -- not scheduled yet; nothing to remove
end;
$$;

select cron.schedule(
  'record-score-snapshots-month-close',
  '5,25,45 0 1 * *',
  'select public.trigger_score_snapshots()'
);

-- Replace (not alter) — the return shape gains two columns.
drop function if exists public.score_snapshot_status();

create function public.score_snapshot_status()
returns table (
  secret_configured        boolean,
  daily_job_scheduled      boolean,
  close_job_scheduled      boolean,
  organizations_total      bigint,
  orgs_with_current_month  bigint,
  -- Previous-month rows whose last write landed at or after the month
  -- boundary — i.e. the close actually ran for them. After the 1st this
  -- should equal the orgs that have any previous-month row; lower means
  -- closes were missed and those months froze at their last daily state.
  orgs_with_closed_prev_month bigint,
  last_write_at            timestamptz
)
language sql
security definer
set search_path = pg_catalog, public
as $$
  select
    exists (select 1 from vault.decrypted_secrets where name = 'score_snapshot_service_key'),
    exists (select 1 from cron.job where jobname = 'record-score-snapshots-daily' and active),
    exists (select 1 from cron.job where jobname = 'record-score-snapshots-month-close' and active),
    (select count(*) from public.organizations),
    (select count(*) from public.compliance_score_snapshots
      where month = date_trunc('month', timezone('utc', now()))::date),
    (select count(*) from public.compliance_score_snapshots
      where month = (date_trunc('month', timezone('utc', now())) - interval '1 month')::date
        and updated_at >= date_trunc('month', now() at time zone 'utc') at time zone 'utc'),
    (select max(updated_at) from public.compliance_score_snapshots);
$$;

revoke execute on function public.score_snapshot_status() from public, anon, authenticated;
grant  execute on function public.score_snapshot_status() to service_role;
