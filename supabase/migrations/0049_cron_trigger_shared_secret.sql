-- Move the cron triggers onto a credential their targets can actually verify,
-- and fix one that never authenticated at all.
--
-- ── WHY ──────────────────────────────────────────────────────────────────────
-- `monitor-law-changes` (0035) and `support-call-scheduler` (0045) shared an
-- `isAuthorizedTrigger()` whose last branch was:
--
--     const claims = JSON.parse(atob(padded))   // token.split('.')[1]
--     if (claims?.role === 'service_role') return true
--
-- The JWT payload was base64-decoded and trusted. The signature was never
-- verified, and `verify_jwt` is false on both, so nothing upstream checked
-- either. `Bearer x.eyJyb2xlIjoic2VydmljZV9yb2xlIn0.x` — a literal
-- `{"role":"service_role"}` in base64, no key involved — authenticated any
-- caller on the internet to a 19-page government-site sweep, and to a job that
-- emails customers. Found 2026-08-06 while auditing why 0038's job 403'd.
--
-- That branch is also the only reason those two jobs ever worked: their Vault
-- keys were stored with the placeholder's angle brackets still attached
-- (`<eyJ…>`), and splitting that on '.' leaves the payload segment intact, so
-- the claims still read service_role. Nothing was validating the key.
--
-- ── THE CREDENTIAL ───────────────────────────────────────────────────────────
-- Same one 0048 settled on, and the same `support-notify-drain` has always
-- used: the shared secret, sent as a header. It is the only machine credential
-- in this project with an unbroken record of authenticating, it needs no
-- signature verification for a machine-to-machine call that was never really
-- about JWTs, and it does not silently break when a key format changes
-- underneath us — which is exactly what bit 0038.
--
-- ── ORDERING ─────────────────────────────────────────────────────────────────
-- The two law/scheduler jobs send BOTH headers here on purpose. This migration
-- lands before the functions are redeployed, and the currently-deployed code
-- still authenticates via the (bad) bearer branch. Sending both means neither
-- side has a window where it rejects the other. Once both functions are
-- redeployed, the Authorization header is inert and `law_monitor_service_key`
-- and `support_scheduler_service_key` are unused; 0050 removes it.
--
-- ROLLBACK: re-apply the function bodies from 0035, 0045 and 0046.

-- ── 1. law monitor ───────────────────────────────────────────────────────────
create or replace function public.trigger_law_monitor() returns void
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  v_key    text;
  v_secret text;
begin
  select decrypted_secret into v_key
    from vault.decrypted_secrets where name = 'law_monitor_service_key';
  select decrypted_secret into v_secret
    from vault.decrypted_secrets where name = 'support_notify_secret';

  if v_secret is null or length(btrim(v_secret)) = 0 then
    raise warning '[law-monitor] vault secret "support_notify_secret" is not set; skipping run';
    return;
  end if;

  perform net.http_post(
    url     := 'https://khtwpxnvziiyplaflwru.supabase.co/functions/v1/monitor-law-changes',
    headers := jsonb_build_object(
      'Content-Type',      'application/json',
      'Authorization',     'Bearer ' || coalesce(v_key, ''),
      'x-trigger-secret',  v_secret
    ),
    body                 := '{}'::jsonb,
    timeout_milliseconds := 300000
  );
end;
$$;

revoke execute on function public.trigger_law_monitor() from public, anon, authenticated;
grant  execute on function public.trigger_law_monitor() to service_role;

-- ── 2. scheduled-call sweep ──────────────────────────────────────────────────
create or replace function public.trigger_support_call_scheduler() returns void
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  v_key    text;
  v_secret text;
begin
  select decrypted_secret into v_key
    from vault.decrypted_secrets where name = 'support_scheduler_service_key';
  select decrypted_secret into v_secret
    from vault.decrypted_secrets where name = 'support_notify_secret';

  if v_secret is null or length(btrim(v_secret)) = 0 then
    raise warning '[support-call-scheduler] vault secret "support_notify_secret" is not set; skipping run';
    return;
  end if;

  perform net.http_post(
    url     := 'https://khtwpxnvziiyplaflwru.supabase.co/functions/v1/support-call-scheduler',
    headers := jsonb_build_object(
      'Content-Type',      'application/json',
      'Authorization',     'Bearer ' || coalesce(v_key, ''),
      'x-trigger-secret',  v_secret
    ),
    body                 := '{}'::jsonb,
    timeout_milliseconds := 60000
  );
end;
$$;

revoke execute on function public.trigger_support_call_scheduler() from public, anon, authenticated;
grant  execute on function public.trigger_support_call_scheduler() to service_role;

-- ── 3. weekly law digest — this one has never run ────────────────────────────
-- 0046 had it present `Authorization: Bearer <law_update_digest_service_key>`,
-- but `send-law-updates` gates on `x-notify-secret` and 401s on anything else.
-- Scheduled Mondays 08:00, so it has been failing quietly once a week since it
-- shipped, with nothing surfacing the 401. Same defect family as 0038: a job
-- that "succeeds" in cron.job_run_details because pg_net is asynchronous, while
-- every HTTP call it makes is rejected.
create or replace function public.trigger_law_update_digest() returns void
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  v_secret text;
begin
  select decrypted_secret into v_secret
    from vault.decrypted_secrets where name = 'support_notify_secret';

  if v_secret is null or length(btrim(v_secret)) = 0 then
    raise warning '[law-update-digest] vault secret "support_notify_secret" is not set; skipping run';
    return;
  end if;

  perform net.http_post(
    url     := 'https://khtwpxnvziiyplaflwru.supabase.co/functions/v1/send-law-updates',
    headers := jsonb_build_object(
      'Content-Type',    'application/json',
      'x-notify-secret', v_secret
    ),
    body                 := '{}'::jsonb,
    timeout_milliseconds := 60000
  );
end;
$$;

revoke execute on function public.trigger_law_update_digest() from public, anon, authenticated;
grant  execute on function public.trigger_law_update_digest() to service_role;
