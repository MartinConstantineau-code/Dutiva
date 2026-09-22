-- Fix the credential `trigger_attachment_scan()` presents to
-- `support-attachment-scan`. The job has been firing every 10 minutes since
-- 0038 and getting 403 back on every run.
--
-- WHY IT FAILED. 0038 copied the bearer shape used by `trigger_law_monitor`
-- (0035) and `trigger_support_call_scheduler` (0045): read a service-role key
-- from Vault, send it as `Authorization: Bearer …`. Those two work — but only
-- because `monitor-law-changes` and `support-call-scheduler` never compare the
-- bearer to anything. `support-attachment-scan` does:
--
--   const byServiceRole =
--     (req.headers.get('Authorization') ?? '') === `Bearer ${serviceRoleKey}`
--
-- an exact string match against the function's own `SUPABASE_SERVICE_ROLE_KEY`.
-- The Vault copy is the project's *legacy* service_role JWT — still a valid
-- credential (PostgREST accepts it) but not the same string the edge runtime
-- injects, now that this project has the newer `sb_*` API keys enabled. Two
-- valid keys that are not equal, so an equality check fails. Verified
-- 2026-08-06: bearer -> 403, and the same request with the shared secret -> 200
-- `{"processed":0,"pending":0,"note":"no_scanner"}`.
--
-- WHY THE SHARED SECRET INSTEAD. The function already accepts `x-scan-secret`
-- as a first-class credential (it is the runbook's manual-flush path), and
-- `support-notify-drain` — the one cron job in this project that has always
-- authenticated cleanly — uses exactly that shape against the same
-- `SUPPORT_NOTIFY_SECRET`. It reuses a secret already proven to match, adds no
-- new one to rotate, and does not silently break the next time the
-- service-role key format changes underneath us. No edge function is
-- redeployed here; only the credential the job presents changes.
--
-- NOTE. `attachment_scan_service_key` is now unused by this function. It is
-- deliberately left in Vault rather than dropped: removing a key is not
-- reversible from a migration, and it costs nothing to leave.
--
-- ROLLBACK: re-apply the `trigger_attachment_scan()` body from
-- 0038_support_attachment_scan.sql.

create or replace function public.trigger_attachment_scan() returns void
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  v_secret text;
begin
  select decrypted_secret into v_secret
    from vault.decrypted_secrets
   where name = 'support_notify_secret';

  if v_secret is null or length(btrim(v_secret)) = 0 then
    raise warning '[attachment-scan] vault secret "support_notify_secret" is not set; skipping run';
    return;
  end if;

  perform net.http_post(
    url     := 'https://khtwpxnvziiyplaflwru.supabase.co/functions/v1/support-attachment-scan',
    headers := jsonb_build_object(
      'Content-Type',  'application/json',
      'x-scan-secret', v_secret
    ),
    body                 := '{}'::jsonb,
    timeout_milliseconds := 120000
  );
end;
$$;

revoke execute on function public.trigger_attachment_scan() from public, anon, authenticated;
grant  execute on function public.trigger_attachment_scan() to service_role;

-- `attachment_scan_status().secret_configured` answered "is
-- attachment_scan_service_key present" — which after the change above is a
-- question about a key nothing reads. It would have reported true while every
-- run 403'd, which is precisely the blind spot this function exists to close.
-- Point it at the credential the job actually presents.
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
    exists (select 1 from vault.decrypted_secrets where name = 'support_notify_secret'),
    exists (select 1 from cron.job where jobname = 'support-attachment-scan' and active),
    (select count(*) from public.support_attachments where scan_status = 'pending'),
    (select count(*) from public.support_attachments where scan_status = 'flagged'),
    (select count(*) from public.support_attachments where scan_status = 'skipped'),
    (select min(created_at) from public.support_attachments where scan_status = 'pending'),
    (select max(scanned_at) from public.support_attachments);
$$;

revoke execute on function public.attachment_scan_status() from public, anon, authenticated;
grant  execute on function public.attachment_scan_status() to service_role;
