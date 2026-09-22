-- Remove the anon-readable doclib demo from the shared production project.
--
-- The demo Documents Library used to be exposed as anon-readable
-- `public.doclib_*` views over the `doclib.*` fixture tables (0001/0002), so
-- an unauthenticated visitor could read every demo row and — more to the
-- point — the fictional demo shared one Supabase project (and one anon key)
-- with the real `public.*` product tables, meaning a misconfiguration on one
-- side could bridge into the other.
--
-- The client no longer reads these views: src/features/app/documents/api.ts
-- now serves the library from bundled fixtures (identical content). This
-- migration drops the read surface and the demo schema so the demo↔real
-- trust boundary is removed entirely rather than merely narrowed.
--
-- ⚠ APPLY ORDER: apply this only AFTER the fixtures-only read layer is
-- deployed to production, so nothing is still querying public.doclib_*.
-- (The read layer already fell back to fixtures on error, so this is
-- non-breaking either way, but deploy-then-drop is the safe sequence.)
--
-- STATUS (established 2026-08-04, superseding a stale "not yet applied"
-- banner that had outlived both of its conditions):
--
--   1. The apply-order precondition is MET. The fixtures-only read layer
--      landed in f12a2d0 ("Serve the demo Documents Library from fixtures,
--      drop the doclib DB read", #73) and is live: src/features/app/
--      documents/api.ts serves `source: 'fixtures'` unconditionally, and no
--      runtime code path reads `public.doclib_*` anywhere in src/ (the
--      remaining `doclib_` matches are i18n message keys, not table names).
--   2. This migration is nonetheless expected to stay UNAPPLIED under its own
--      name, and that is deliberate rather than pending. scripts/
--      check-migrations.mjs lists `drop_doclib_demo_schema` in
--      ACCEPTED_UNAPPLIED with the reason "the demo objects are already
--      absent from the project (verified via to_regclass)" — i.e. the end
--      state this migration exists to produce is already true on the live
--      project, reached outside this file's history.
--
-- So there is nothing for an owner to do here, and the drift check will not
-- flag it. The file is retained (not deleted) because it is idempotent by
-- construction — see the defensive pattern-drop below — so a fresh replay of
-- the migration history onto an empty project still reproduces the same end
-- state. If that ACCEPTED_UNAPPLIED entry is ever removed, this file becomes
-- a genuine owner action again and this banner must be rewritten with it.
--
-- Idempotent + defensive: drops by pattern with IF EXISTS, so a re-run or a
-- fresh replay (where these objects may already be absent) is a no-op.

do $$
declare
  v record;
begin
  for v in
    select c.relname
    from pg_class c
    join pg_namespace n on n.oid = c.relnamespace
    where n.nspname = 'public'
      and c.relkind = 'v'
      and c.relname like 'doclib\_%'
  loop
    execute format('drop view if exists public.%I cascade', v.relname);
    raise notice 'dropped view public.%', v.relname;
  end loop;
end
$$;

drop schema if exists doclib cascade;
