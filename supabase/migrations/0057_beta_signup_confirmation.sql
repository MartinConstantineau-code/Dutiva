-- Applied to the live project 2026-07-20 (version 20260720234830).
-- Recovered from supabase_migrations.schema_migrations on 2026-08-06.
--
-- ALREADY APPLIED — this file is the record, not a pending change. Applied
-- directly to the project with no file committed; surfaced by the reverse
-- drift check in scripts/check-migrations.mjs. See docs/TODO.md.
--
-- Supersedes 0056 six seconds later, adding 'beta_confirmation'. THIS is the
-- constraint in force. Idempotent and safe to re-run on its own.

alter table public.support_notifications
  drop constraint if exists support_notifications_kind_check;

alter table public.support_notifications
  add constraint support_notifications_kind_check check (kind in (
    'ticket_received', 'agent_reply', 'info_requested', 'resolved', 'closed',
    'call_proposed', 'call_confirmed', 'privacy_ack', 'accessibility_ack',
    'security_ack', 'complaint_ack', 'operator_alert',
    'beta_signup', 'beta_confirmation'
  ));
