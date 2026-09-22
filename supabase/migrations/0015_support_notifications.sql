-- Notification outbox for the support system. The ticket edge functions enqueue
-- a row per event (ticket received, agent reply, …); a future email worker (once
-- a transactional provider is configured — see docs/SUPPORT_ARCHITECTURE.md)
-- drains `pending` rows, renders the bilingual template, sends, and marks them
-- `sent`. Decoupling the send this way means a missing provider never blocks
-- ticket creation, and nothing sensitive is stored: `payload` holds only the
-- public reference and category — never the description, PII, or attachments.
--
-- RLS: admin read only; writes are service-role (the edge functions / worker).
-- There is no client policy, so the browser can neither read nor write it.
--
-- ROLLBACK: drop table if exists public.support_notifications cascade;

create table if not exists public.support_notifications (
  id uuid primary key default gen_random_uuid(),
  ticket_id uuid references public.support_tickets (id) on delete cascade,
  kind text not null check (kind in (
    'ticket_received', 'agent_reply', 'info_requested', 'resolved', 'closed',
    'call_proposed', 'call_confirmed', 'privacy_ack', 'accessibility_ack',
    'security_ack', 'complaint_ack', 'operator_alert'
  )),
  audience text not null check (audience in ('customer', 'operator')),
  recipient text not null,
  language text not null default 'en' check (language in ('en', 'fr')),
  status text not null default 'pending' check (status in ('pending', 'sent', 'failed', 'skipped')),
  -- Non-sensitive only: { reference, category, priority? }. Never the body/PII.
  payload jsonb not null default '{}'::jsonb,
  attempts integer not null default 0,
  last_error text,
  created_at timestamptz not null default timezone('utc', now()),
  sent_at timestamptz
);

create index if not exists support_notifications_pending_idx
  on public.support_notifications (created_at)
  where status = 'pending';
create index if not exists support_notifications_ticket_idx
  on public.support_notifications (ticket_id);

alter table public.support_notifications enable row level security;

create policy "Admins read support notifications"
  on public.support_notifications for select
  using (is_admin((select auth.uid())));
