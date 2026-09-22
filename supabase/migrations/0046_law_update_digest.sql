-- Law-change notifications (TODO.md D1, decided 2026-08-06): internal-only
-- pilot, weekly digest, org default jurisdiction wins over profile province
-- when both are set, and model-written summaries require human review before
-- they can be sent. See docs/LAW_CHANGE_NOTIFICATIONS.md.
--
-- Recipients are internal (SUPPORT_OPERATOR_EMAIL, an operational alias) for
-- this phase, so the CASL commercial-electronic-message question
-- docs/LAW_CHANGE_NOTIFICATIONS.md §2 raises does not arise yet — it applies
-- once the recipient model expands to actual customers, not before.
--
-- ROLLBACK:
--   select cron.unschedule('law-update-digest-weekly');
--   drop function if exists public.law_update_digest_status();
--   drop function if exists public.trigger_law_update_digest();
--   drop table if exists public.law_update_notifications cascade;
--   alter table public.law_updates drop column if exists review_status;

-- ── review_status ─────────────────────────────────────────────────────────
-- Same shape as advisor_guidance_chunks.review_status (0032/L5): every row is
-- machine_curated by construction (the monitor's own model writes
-- change_summary at detection time — see monitor-law-changes/index.ts); only
-- a human flips a row to reviewed, and send-law-updates only ever digests
-- reviewed rows. There is no admin UI for this yet — deliberately, for an
-- internal-only, low-volume pilot — so review is direct SQL for now:
--
--   update public.law_updates set review_status = 'reviewed' where id = '<uuid>';
--
-- To find what is waiting:
--
--   select id, jurisdiction, law_name, detected_at, change_summary
--   from public.law_updates
--   where event_type = 'change' and review_status = 'machine_curated'
--   order by detected_at desc;
alter table public.law_updates
  add column if not exists review_status text not null default 'machine_curated'
  check (review_status in ('machine_curated', 'reviewed'));

comment on column public.law_updates.review_status is
  'machine_curated (default) or reviewed. Only a human flips a row to reviewed; send-law-updates only digests reviewed rows.';

-- ── law_update_notifications (outbox, per docs/LAW_CHANGE_NOTIFICATIONS.md §5) ─
-- One row per (law_update, recipient) that has been included in a digest —
-- not one row per digest email. The unique constraint is what makes a retry
-- or an overlapping cron run structurally unable to double-send the same
-- amendment to the same recipient, the same discipline
-- support_ticket_feedback and support_notifications already apply elsewhere.
create table if not exists public.law_update_notifications (
  id uuid primary key default gen_random_uuid(),
  law_update_id uuid not null references public.law_updates (id) on delete cascade,
  recipient text not null,
  status text not null default 'pending' check (status in ('pending', 'sent', 'failed')),
  attempts integer not null default 0,
  last_error text,
  created_at timestamptz not null default timezone('utc', now()),
  sent_at timestamptz,
  unique (law_update_id, recipient)
);

create index if not exists law_update_notifications_law_update_idx
  on public.law_update_notifications (law_update_id);

alter table public.law_update_notifications enable row level security;

-- Admin read only, same rule as support_notifications (0015) — no client
-- policy, so the browser can neither read nor write it. All writes are
-- service-role (send-law-updates).
create policy "Admins read law update notifications"
  on public.law_update_notifications for select
  using (is_admin((select auth.uid())));

-- ── Scheduling, same shape as trigger_law_monitor (0035),
--    trigger_attachment_scan (0038), trigger_support_call_scheduler (0045) ──
--
-- ONE MANUAL STEP: this job needs a service-role key to invoke the edge
-- function, and a key must never be committed. Add it once in the Supabase
-- SQL editor:
--
--   select vault.create_secret(
--     '<service-role or secret key>',
--     'law_update_digest_service_key',
--     'Service key used by the send-law-updates cron job'
--   );
--
-- Until that secret exists the job runs, finds no key, logs a warning and
-- returns — a no-op, not a recurring error. send-law-updates is separately
-- inert until RESEND_API_KEY (or SUPPORT_EMAIL_PROVIDER_API_KEY) is set —
-- both halves of AGENTS.md's two-halves rule apply here independently, same
-- as support-notify.

create extension if not exists pg_cron;
create extension if not exists pg_net;

create or replace function public.trigger_law_update_digest() returns void
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  v_key text;
begin
  select decrypted_secret into v_key
    from vault.decrypted_secrets
   where name = 'law_update_digest_service_key';

  if v_key is null or length(btrim(v_key)) = 0 then
    raise warning '[law-update-digest] vault secret "law_update_digest_service_key" is not set; skipping run';
    return;
  end if;

  perform net.http_post(
    url     := 'https://khtwpxnvziiyplaflwru.supabase.co/functions/v1/send-law-updates',
    headers := jsonb_build_object(
      'Content-Type',  'application/json',
      'Authorization', 'Bearer ' || v_key
    ),
    body                 := '{}'::jsonb,
    timeout_milliseconds := 60000
  );
end;
$$;

revoke execute on function public.trigger_law_update_digest() from public, anon, authenticated;
grant  execute on function public.trigger_law_update_digest() to service_role;

-- Operational visibility, same shape as law_monitor_status / attachment_scan_status.
create or replace function public.law_update_digest_status()
returns table (
  secret_configured   boolean,
  job_scheduled       boolean,
  unreviewed_count    bigint,
  reviewed_unsent_count bigint,
  last_sent_at        timestamptz
)
language sql
security definer
set search_path = pg_catalog, public
as $$
  select
    exists (select 1 from vault.decrypted_secrets where name = 'law_update_digest_service_key'),
    exists (select 1 from cron.job where jobname = 'law-update-digest-weekly' and active),
    (select count(*) from public.law_updates where event_type = 'change' and review_status = 'machine_curated'),
    (select count(*) from public.law_updates lu
       where lu.event_type = 'change' and lu.review_status = 'reviewed'
         and not exists (
           select 1 from public.law_update_notifications n
           where n.law_update_id = lu.id and n.status = 'sent'
         )),
    (select max(sent_at) from public.law_update_notifications where status = 'sent');
$$;

revoke execute on function public.law_update_digest_status() from public, anon, authenticated;
grant  execute on function public.law_update_digest_status() to service_role;

-- Mondays 08:00 UTC (early enough in the ET business day per
-- docs/SUPPORT_ARCHITECTURE.md's business hours) — weekly per the decided
-- cadence (docs/LAW_CHANGE_NOTIFICATIONS.md §4b).
do $$
begin
  perform cron.unschedule('law-update-digest-weekly');
exception
  when others then null;  -- not scheduled yet; nothing to remove
end;
$$;

select cron.schedule(
  'law-update-digest-weekly',
  '0 8 * * 1',
  'select public.trigger_law_update_digest()'
);
