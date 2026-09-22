-- Applied to the live project 2026-07-16 (version 20260716165424).
-- Recovered from supabase_migrations.schema_migrations on 2026-08-06.
--
-- ALREADY APPLIED — this file is the record, not a pending change. It was
-- applied directly to the project with no file committed, so it existed only
-- in production until the reverse drift check in scripts/check-migrations.mjs
-- surfaced it. See docs/TODO.md.
--
-- Both statements are `if not exists`, so re-running is a no-op.

create extension if not exists pg_cron;
create extension if not exists pg_net;
