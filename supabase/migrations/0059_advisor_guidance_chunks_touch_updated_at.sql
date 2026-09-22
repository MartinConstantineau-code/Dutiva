-- Applied to the live project 2026-07-27 (version 20260727033444).
-- Recovered from supabase_migrations.schema_migrations on 2026-08-06.
--
-- ALREADY APPLIED — this file is the record, not a pending change. Applied
-- directly to the project with no file committed; surfaced by the reverse
-- drift check in scripts/check-migrations.mjs. See docs/TODO.md.
--
-- NOT IDEMPOTENT. `create trigger` has no `if not exists` here, so replaying
-- this against the live project raises 42710 (trigger already exists). The
-- function half is `create or replace` and would be fine; the trigger half
-- would not. Recorded verbatim as applied rather than "improved" into
-- something that never ran — a history that has been edited to look tidier
-- than reality is worse than no history.

-- Keep updated_at honest on manual review/retire updates (repo convention:
-- 0013 profiles, 0014 support tables).
create or replace function public.touch_advisor_guidance_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := timezone('utc', now());
  return new;
end
$$;

create trigger advisor_guidance_chunks_touch_updated_at
  before update on public.advisor_guidance_chunks
  for each row execute function public.touch_advisor_guidance_updated_at();
