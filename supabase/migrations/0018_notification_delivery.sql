-- Provider delivery tracking for the notification outbox.
--
-- WHY: `status` records what WE did — 'sent' means the provider accepted the
-- message, not that it arrived. A bounce comes back asynchronously minutes
-- later. Proven in production on 2026-07-16: an operator alert to a
-- non-existent mailbox was marked `sent` and then bounced, and nothing in the
-- database ever knew. These columns close that gap: the resend-webhook function
-- records the provider's verdict against the row.
--
-- `status` (outbox state: did we hand it off?) stays separate from
-- `delivery_status` (provider verdict: did it arrive?). Don't collapse them —
-- "we sent it" and "it was delivered" are genuinely different facts.
--
-- ROLLBACK:
--   alter table public.support_notifications
--     drop column if exists provider_message_id,
--     drop column if exists delivery_status,
--     drop column if exists delivery_detail,
--     drop column if exists delivery_updated_at;

alter table public.support_notifications
  add column if not exists provider_message_id text,
  add column if not exists delivery_status text
    check (delivery_status is null or delivery_status in (
      'delivered', 'bounced', 'complained', 'delayed'
    )),
  add column if not exists delivery_detail text,
  add column if not exists delivery_updated_at timestamptz;

-- The webhook looks rows up by the provider's message id.
create index if not exists support_notifications_provider_msg_idx
  on public.support_notifications (provider_message_id)
  where provider_message_id is not null;

-- Surfacing problems: anything that didn't arrive.
create index if not exists support_notifications_undelivered_idx
  on public.support_notifications (delivery_status)
  where delivery_status in ('bounced', 'complained');
