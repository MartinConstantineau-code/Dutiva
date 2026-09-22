-- Applied to the live project 2026-07-28 (version 20260728125325).
-- Recovered from supabase_migrations.schema_migrations on 2026-08-06.
--
-- ALREADY APPLIED — this file is the record, not a pending change.
--
-- The most consequential of the eight recovered on 2026-08-06, because of what
-- it is: a security grant change, applied straight to production with no file
-- committed. It belongs to the same lineage as 0004 and 0020 (revoking anon
-- EXECUTE on SECURITY DEFINER helpers) and continues their argument — yet a
-- reviewer reading those two in the repo would have had no way to know a third
-- revoke had happened, or to which function. Surfaced only by the reverse
-- drift check in scripts/check-migrations.mjs.
--
-- Idempotent; safe to re-run.

revoke execute on function public.current_user_is_workspace_member() from anon;
