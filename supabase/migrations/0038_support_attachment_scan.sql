-- Malware scanning for support ticket attachments.
--
-- `support_attachments.scan_status` has existed since 0014 and has said
-- 'pending' on every row ever inserted, because nothing ever flipped it. The
-- column documented an intention, not a control: a customer could upload a file
-- to a ticket and the founder's only protection when opening it was the MIME
-- allowlist — which an attacker picks from freely, since it is the *declared*
-- content type, not the file's actual contents.
--
-- This migration adds the bookkeeping the `support-attachment-scan` worker
-- needs to be honest about what it did, and schedules it.
--
-- WHY THE EXTRA COLUMNS. A bare status cannot answer the two questions that
-- matter during an incident: when was this file cleared, and by what verdict.
-- `scan_attempts` additionally bounds the retry loop — without it an endpoint
-- that returns nonsense would be re-asked about the same file forever, on every
-- run, until someone noticed the bill.
--
-- NOTE ON 'skipped'. The 0014 CHECK already allows exactly the four values this
-- worker writes (pending / clean / flagged / skipped), so no constraint change
-- is needed. 'skipped' means "never established as safe" — a file the scanner
-- could not handle, or gave up on. It is deliberately NOT a synonym for clean,
-- and `support-attachment-action` refuses to sign a download for it while
-- scanning is enabled.
--
-- EXISTING ROWS stay 'pending' and are picked up by the first run once a
-- scanner is configured; until then nothing changes for them, and downloads
-- keep working exactly as they do today.
--
-- ROLLBACK:
--   select cron.unschedule('support-attachment-scan');
--   drop function if exists public.trigger_attachment_scan();
--   drop index if exists public.support_attachments_pending_scan_idx;
--   alter table public.support_attachments
--     drop column if exists scanned_at,
--     drop column if exists scan_detail,
--     drop column if exists scan_attempts;

alter table public.support_attachments
  add column if not exists scanned_at    timestamptz,
  add column if not exists scan_detail   text,
  add column if not exists scan_attempts smallint not null default 0;

comment on column public.support_attachments.scanned_at is
  'When a scan verdict was last recorded. Null while never scanned.';
comment on column public.support_attachments.scan_detail is
  'Short non-sensitive scanner note (signature name, skip reason). Never file contents.';
comment on column public.support_attachments.scan_attempts is
  'Scan attempts made; bounds retries so a broken scanner cannot loop forever.';

-- The worker only ever asks for pending rows, so index exactly that. Partial,
-- because the healthy steady state is a table where almost nothing is pending.
create index if not exists support_attachments_pending_scan_idx
  on public.support_attachments (created_at)
  where scan_status = 'pending';

-- ─────────────────────────────────────────────────────────────────────────────
-- Scheduling. Same shape as `trigger_law_monitor` (0035) and the
-- `support-notify-drain` job: the schedule lives beside the data it writes, so
-- it survives a hosting or repository move.
--
-- ONE MANUAL STEP: the job needs a service-role key to invoke the function, and
-- a key must never be committed. Add it once in the Supabase SQL editor:
--
--   select vault.create_secret(
--     '<service-role or secret key>',
--     'attachment_scan_service_key',
--     'Service key used by the support-attachment-scan cron job'
--   );
--
-- Until that secret exists the job runs, finds no key, logs a warning and
-- returns — a no-op rather than a recurring error. The worker is separately
-- inert until SUPPORT_ATTACHMENT_SCAN_URL is set, so BOTH halves must be
-- configured before anything is actually scanned (AGENTS.md's two-halves rule).
-- ─────────────────────────────────────────────────────────────────────────────

create extension if not exists pg_cron;
create extension if not exists pg_net;

create or replace function public.trigger_attachment_scan() returns void
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  v_key text;
begin
  select decrypted_secret into v_key
    from vault.decrypted_secrets
   where name = 'attachment_scan_service_key';

  if v_key is null or length(btrim(v_key)) = 0 then
    raise warning '[attachment-scan] vault secret "attachment_scan_service_key" is not set; skipping run';
    return;
  end if;

  perform net.http_post(
    url     := 'https://khtwpxnvziiyplaflwru.supabase.co/functions/v1/support-attachment-scan',
    headers := jsonb_build_object(
      'Content-Type',  'application/json',
      'Authorization', 'Bearer ' || v_key
    ),
    body                 := '{}'::jsonb,
    timeout_milliseconds := 120000
  );
end;
$$;

revoke execute on function public.trigger_attachment_scan() from public, anon, authenticated;
grant  execute on function public.trigger_attachment_scan() to service_role;

-- Operational visibility: "is anything sitting unscanned?" as one query — the
-- absence that would otherwise go unnoticed, exactly as with law_monitor_status.
create or replace function public.attachment_scan_status()
returns table (
  secret_configured boolean,
  job_scheduled     boolean,
  pending_count     bigint,
  flagged_count     bigint,
  skipped_count     bigint,
  oldest_pending_at timestamptz,
  last_scanned_at   timestamptz
)
language sql
security definer
set search_path = pg_catalog, public
as $$
  select
    exists (select 1 from vault.decrypted_secrets where name = 'attachment_scan_service_key'),
    exists (select 1 from cron.job where jobname = 'support-attachment-scan' and active),
    (select count(*) from public.support_attachments where scan_status = 'pending'),
    (select count(*) from public.support_attachments where scan_status = 'flagged'),
    (select count(*) from public.support_attachments where scan_status = 'skipped'),
    (select min(created_at) from public.support_attachments where scan_status = 'pending'),
    (select max(scanned_at) from public.support_attachments);
$$;

revoke execute on function public.attachment_scan_status() from public, anon, authenticated;
grant  execute on function public.attachment_scan_status() to service_role;

-- Every 10 minutes. Attachments arrive in ones and twos on a support ticket, so
-- this is about bounding how long a file sits unusable, not throughput.
do $$
begin
  perform cron.unschedule('support-attachment-scan');
exception
  when others then null;  -- not scheduled yet; nothing to remove
end;
$$;

select cron.schedule(
  'support-attachment-scan',
  '*/10 * * * *',
  'select public.trigger_attachment_scan()'
);
