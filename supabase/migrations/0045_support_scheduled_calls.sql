-- Scheduled-call booking (TODO.md D3, decided 2026-08-06): Google Calendar,
-- full loop (propose -> confirm -> calendar event with Meet link -> reminder
-- -> post-call follow-up prompt).
--
-- The intake forms and support-agent-action already offered `scheduled_call`
-- as a status/response method; the appointment itself was arranged entirely
-- by hand. This closes that gap using the flow the dormant `call_proposed` /
-- `call_confirmed` email templates already assumed (src/features/support/
-- email/templates.ts, supabase/functions/support-notify/index.ts): times are
-- proposed and confirmed *inside the ticket*, not on an external booking
-- page — an admin proposes up to three candidate slots, the customer picks
-- one from their own ticket view, and a calendar event is created only then.
--
-- ROLLBACK:
--   select cron.unschedule('support-call-scheduler-sweep');
--   drop function if exists public.support_call_scheduler_status();
--   drop function if exists public.trigger_support_call_scheduler();
--   drop table if exists public.support_scheduled_calls cascade;
--   alter table public.support_notifications drop constraint if exists support_notifications_kind_check;
--   alter table public.support_notifications add constraint support_notifications_kind_check
--     check (kind in (
--       'ticket_received', 'agent_reply', 'info_requested', 'resolved', 'closed',
--       'call_proposed', 'call_confirmed', 'privacy_ack', 'accessibility_ack',
--       'security_ack', 'complaint_ack', 'operator_alert'
--     ));

-- ── support_scheduled_calls ──────────────────────────────────────────────
-- One row per ticket's scheduling state. `ticket_id` is unique rather than a
-- history table: rescheduling overwrites proposed_slots rather than creating
-- a new row, which is simpler and matches the "exceptional cases only" volume
-- this channel actually has (docs/SUPPORT_ARCHITECTURE.md's digital-first
-- framing) — a real audit trail of who proposed/confirmed what still exists
-- in support_ticket_events, inserted alongside every state change below.
create table if not exists public.support_scheduled_calls (
  id uuid primary key default gen_random_uuid(),
  ticket_id uuid not null unique references public.support_tickets (id) on delete cascade,
  proposed_by uuid references auth.users (id) on delete set null,
  -- Array of 1-3 {start, end} ISO-8601 objects, validated by the edge
  -- function (support-agent-action's propose_call action) before insert;
  -- not re-validated here because check constraints can't easily express
  -- "each array element has exactly these two ISO-timestamp keys".
  proposed_slots jsonb not null,
  duration_minutes smallint not null default 30 check (duration_minutes between 10 and 120),
  status text not null default 'proposed' check (status in (
    'proposed', 'confirmed', 'completed', 'cancelled'
  )),
  confirmed_start timestamptz,
  confirmed_end timestamptz,
  confirmed_by uuid references auth.users (id) on delete set null,
  confirmed_at timestamptz,
  -- Google Calendar identifiers. Both null if the event couldn't be created
  -- (Calendar not configured yet, or the API call failed) — confirmation
  -- still succeeds without them; see support-confirm-call's "honest by
  -- construction" comment, matching support-notify's no-provider handling.
  calendar_event_id text,
  meet_link text,
  reminder_sent_at timestamptz,
  followup_flagged_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists support_scheduled_calls_reminder_idx
  on public.support_scheduled_calls (confirmed_start)
  where status = 'confirmed' and reminder_sent_at is null;
create index if not exists support_scheduled_calls_followup_idx
  on public.support_scheduled_calls (confirmed_end)
  where status = 'confirmed' and followup_flagged_at is null;

drop trigger if exists support_scheduled_calls_touch_updated_at on public.support_scheduled_calls;
create trigger support_scheduled_calls_touch_updated_at
  before update on public.support_scheduled_calls
  for each row execute function public.touch_support_updated_at();

alter table public.support_scheduled_calls enable row level security;

-- Same visibility rule as support_tickets itself (0014): requester, non-
-- restricted workspace member, or admin. All writes go through
-- support-agent-action / support-confirm-call (service role) — no
-- authenticated insert/update policy, so the browser cannot forge a
-- confirmation or invent a calendar event id.
create policy "Requester or workspace member can read own scheduled call"
  on public.support_scheduled_calls for select
  using (
    exists (
      select 1 from public.support_tickets t
      where t.id = ticket_id
        and (
          t.requester_user_id = (select auth.uid())
          or (t.workspace_id is not null and not t.restricted and is_org_member(t.workspace_id, (select auth.uid())))
          or is_admin((select auth.uid()))
        )
    )
  );

-- ── Two new notification kinds ───────────────────────────────────────────
-- call_reminder: customer, ~24h before a confirmed call.
-- call_followup_needed: operator, after a confirmed call's end time has
-- passed with no resolution — prompts the written summary the customer
-- journey promises (docs/SUPPORT_ARCHITECTURE.md's "scheduled call only when
-- required -> written ticket summary" step).
alter table public.support_notifications drop constraint if exists support_notifications_kind_check;
alter table public.support_notifications add constraint support_notifications_kind_check
  check (kind in (
    'ticket_received', 'agent_reply', 'info_requested', 'resolved', 'closed',
    'call_proposed', 'call_confirmed', 'call_reminder', 'call_followup_needed',
    'privacy_ack', 'accessibility_ack', 'security_ack', 'complaint_ack', 'operator_alert'
  ));

-- ── Scheduling, same shape as trigger_law_monitor (0035) and
--    trigger_attachment_scan (0038) ──────────────────────────────────────
--
-- ONE MANUAL STEP: this job needs a service-role key to invoke the edge
-- function, and a key must never be committed. Add it once in the Supabase
-- SQL editor:
--
--   select vault.create_secret(
--     '<service-role or secret key>',
--     'support_scheduler_service_key',
--     'Service key used by the support-call-scheduler cron job'
--   );
--
-- Until that secret exists the job runs, finds no key, logs a warning and
-- returns — a no-op rather than a recurring error. The function itself is
-- separately inert until the Google Calendar secrets are set (see
-- docs/SUPPORT_CALL_SCHEDULING.md); confirmations still work without them,
-- just without a calendar event (AGENTS.md's two-halves rule applies to both
-- halves of this feature independently).

create extension if not exists pg_cron;
create extension if not exists pg_net;

create or replace function public.trigger_support_call_scheduler() returns void
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  v_key text;
begin
  select decrypted_secret into v_key
    from vault.decrypted_secrets
   where name = 'support_scheduler_service_key';

  if v_key is null or length(btrim(v_key)) = 0 then
    raise warning '[support-call-scheduler] vault secret "support_scheduler_service_key" is not set; skipping run';
    return;
  end if;

  perform net.http_post(
    url     := 'https://khtwpxnvziiyplaflwru.supabase.co/functions/v1/support-call-scheduler',
    headers := jsonb_build_object(
      'Content-Type',  'application/json',
      'Authorization', 'Bearer ' || v_key
    ),
    body                 := '{}'::jsonb,
    timeout_milliseconds := 60000
  );
end;
$$;

revoke execute on function public.trigger_support_call_scheduler() from public, anon, authenticated;
grant  execute on function public.trigger_support_call_scheduler() to service_role;

-- Operational visibility, same shape as law_monitor_status / attachment_scan_status.
create or replace function public.support_call_scheduler_status()
returns table (
  secret_configured    boolean,
  job_scheduled        boolean,
  proposed_count       bigint,
  confirmed_count       bigint,
  awaiting_reminder    bigint,
  awaiting_followup    bigint,
  last_reminder_sent   timestamptz,
  last_followup_flagged timestamptz
)
language sql
security definer
set search_path = pg_catalog, public
as $$
  select
    exists (select 1 from vault.decrypted_secrets where name = 'support_scheduler_service_key'),
    exists (select 1 from cron.job where jobname = 'support-call-scheduler-sweep' and active),
    (select count(*) from public.support_scheduled_calls where status = 'proposed'),
    (select count(*) from public.support_scheduled_calls where status = 'confirmed'),
    (select count(*) from public.support_scheduled_calls
       where status = 'confirmed' and reminder_sent_at is null
         and confirmed_start < now() + interval '24 hours'),
    (select count(*) from public.support_scheduled_calls
       where status = 'confirmed' and followup_flagged_at is null
         and confirmed_end < now() - interval '2 hours'),
    (select max(reminder_sent_at) from public.support_scheduled_calls),
    (select max(followup_flagged_at) from public.support_scheduled_calls);
$$;

revoke execute on function public.support_call_scheduler_status() from public, anon, authenticated;
grant  execute on function public.support_call_scheduler_status() to service_role;

-- Every 15 minutes: frequent enough that the 24h-ahead reminder and the
-- 2h-after-end follow-up prompt both fire within one cycle of crossing their
-- threshold, without paging a scheduler for a channel this low-volume.
do $$
begin
  perform cron.unschedule('support-call-scheduler-sweep');
exception
  when others then null;  -- not scheduled yet; nothing to remove
end;
$$;

select cron.schedule(
  'support-call-scheduler-sweep',
  '*/15 * * * *',
  'select public.trigger_support_call_scheduler()'
);
