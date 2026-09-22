-- Schedule the law-change monitor from inside the database.
--
-- Why here and not in the host: the monitor previously ran from a Vercel cron
-- defined in the retired Dutiva-Website repo (`api/trigger-law-monitor.js` +
-- a `crons` block in its vercel.json). When the Vercel project was re-pointed
-- at this repo — which has no `api/` directory and no crons — the schedule
-- silently ceased to exist. Nothing failed and nothing alerted; the monitor
-- just stopped, and `law_updates` went stale after 2026-06-08 while the
-- Knowledge view kept presenting those rows as current.
--
-- Scheduling in Postgres removes that whole class of failure: the schedule now
-- lives beside the data it writes, and survives any future hosting or
-- repository move. Same pattern as the existing `support-notify-drain` job.
--
-- ─────────────────────────────────────────────────────────────────────────────
-- ONE MANUAL STEP: this job needs a service-role key to invoke the edge
-- function, and a key must never be committed. Add it once, in the Supabase
-- dashboard (SQL editor), and the next run picks it up automatically:
--
--   select vault.create_secret(
--     '<service-role or secret key>',
--     'law_monitor_service_key',
--     'Service key used by the monitor-law-changes cron job'
--   );
--
-- Until that secret exists the job runs, finds no key, logs a warning and
-- returns — deliberately, so a missing secret is a no-op rather than a nightly
-- error. Verify with: select * from public.law_monitor_status();
-- ─────────────────────────────────────────────────────────────────────────────

create extension if not exists pg_cron;
create extension if not exists pg_net;

-- Invoke the edge function with the key from Vault. SECURITY DEFINER so the
-- job can read vault.decrypted_secrets; execute is service-role only, so a
-- signed-in user cannot kick off a 19-page sweep.
create or replace function public.trigger_law_monitor() returns void
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  v_key text;
begin
  select decrypted_secret into v_key
    from vault.decrypted_secrets
   where name = 'law_monitor_service_key';

  if v_key is null or length(btrim(v_key)) = 0 then
    raise warning '[law-monitor] vault secret "law_monitor_service_key" is not set; skipping run';
    return;
  end if;

  -- Fire-and-forget: pg_net queues the request and the edge function does the
  -- work. The timeout is generous because a full sweep walks 19 pages of
  -- government sites, several of which are slow PDFs.
  perform net.http_post(
    url     := 'https://khtwpxnvziiyplaflwru.supabase.co/functions/v1/monitor-law-changes',
    headers := jsonb_build_object(
      'Content-Type',  'application/json',
      'Authorization', 'Bearer ' || v_key
    ),
    body                 := '{}'::jsonb,
    timeout_milliseconds := 300000
  );
end;
$$;

revoke execute on function public.trigger_law_monitor() from public, anon, authenticated;
grant  execute on function public.trigger_law_monitor() to service_role;

-- Operational visibility: "is the monitor actually running?" as one query.
-- The absence that went unnoticed for 52 days is exactly what this surfaces.
create or replace function public.law_monitor_status()
returns table (
  secret_configured  boolean,
  job_scheduled      boolean,
  last_checked_at    timestamptz,
  hours_since_check  numeric,
  monitored_pages    bigint,
  broken_pages       bigint,
  last_update_at     timestamptz
)
language sql
security definer
set search_path = pg_catalog, public
as $$
  select
    exists (select 1 from vault.decrypted_secrets where name = 'law_monitor_service_key'),
    exists (select 1 from cron.job where jobname = 'monitor-law-changes-daily' and active),
    (select max(last_checked) from public.law_page_hashes),
    round(extract(epoch from (now() - (select max(last_checked) from public.law_page_hashes))) / 3600, 1),
    (select count(*) from public.law_page_hashes),
    (select count(*) from public.law_page_hashes where is_broken),
    (select max(detected_at) from public.law_updates);
$$;

revoke execute on function public.law_monitor_status() from public, anon, authenticated;
grant  execute on function public.law_monitor_status() to service_role;

-- 07:00 UTC daily — the schedule the Vercel cron used, kept so the detection
-- cadence and the existing `law_updates` history stay continuous.
do $$
begin
  perform cron.unschedule('monitor-law-changes-daily');
exception
  when others then null;  -- not scheduled yet; nothing to remove
end;
$$;

select cron.schedule(
  'monitor-law-changes-daily',
  '0 7 * * *',
  'select public.trigger_law_monitor()'
);
