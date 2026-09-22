-- Applied to the live project 2026-07-20 (version 20260720234824).
-- Recovered from supabase_migrations.schema_migrations on 2026-08-06.
--
-- ALREADY APPLIED — this file is the record, not a pending change. Applied
-- directly to the project with no file committed; surfaced by the reverse
-- drift check in scripts/check-migrations.mjs. See docs/TODO.md.
--
-- Adds 'beta_signup' to the notification kind constraint. Superseded minutes
-- later by 0057, which re-states the same constraint with 'beta_confirmation'
-- added — so 0057 is the shape actually in force. Kept because the database
-- records both, and a history that skips a step is a history that misleads.
--
-- Idempotent (drop constraint if exists, then re-add), but re-running this one
-- would REVERT the constraint to its pre-0057 form. Do not replay in isolation.

alter table public.support_notifications
  drop constraint if exists support_notifications_kind_check;

alter table public.support_notifications
  add constraint support_notifications_kind_check check (kind in (
    'ticket_received', 'agent_reply', 'info_requested', 'resolved', 'closed',
    'call_proposed', 'call_confirmed', 'privacy_ack', 'accessibility_ack',
    'security_ack', 'complaint_ack', 'operator_alert', 'beta_signup'
  ));
