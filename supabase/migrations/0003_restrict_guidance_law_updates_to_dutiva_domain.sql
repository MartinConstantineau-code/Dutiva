-- Restrict read access to the real legal-sources feature (guidance_sources,
-- guidance_chunks, law_updates) to @dutiva.ca accounts. This is an internal
-- team feature (real AI Advisor backend), not meant for arbitrary
-- authenticated users who might sign up via the app's magic-link flow.
--
-- law_updates had two exact-duplicate "allow all authenticated" SELECT
-- policies (RLS policies for the same role/command are OR'd together, so
-- leaving one unrestricted would have defeated the other) -- the redundant
-- one is dropped and the remaining one is tightened.
--
-- Applied directly to the live project (khtwpxnvziiyplaflwru) via the
-- Supabase MCP with Martin's authorization; committed here to keep the
-- schema history reproducible, matching 0001-0002.
--
-- Written defensively: the guidance/law-update tables were created directly
-- on the live project and have no CREATE migration in this repo, so a fresh
-- replay (Supabase preview branches, local `supabase db reset`) skips the
-- tables that don't exist instead of failing the whole migration run.

do $$
begin
  if to_regclass('public.guidance_sources') is not null then
    alter policy "Authenticated can read active public guidance sources" on public.guidance_sources
      using (
        (auth.jwt() ->> 'email') like '%@dutiva.ca'
        and (status = 'active' or is_admin((select auth.uid())))
      );
  else
    raise notice 'public.guidance_sources not present (live-project-only schema) - skipping';
  end if;

  if to_regclass('public.guidance_chunks') is not null then
    alter policy "Members can read guidance chunks" on public.guidance_chunks
      using (
        (auth.jwt() ->> 'email') like '%@dutiva.ca'
        and (
          is_admin((select auth.uid()))
          or organization_id is null
          or is_org_member(organization_id, (select auth.uid()))
        )
      );
  else
    raise notice 'public.guidance_chunks not present (live-project-only schema) - skipping';
  end if;

  if to_regclass('public.law_updates') is not null then
    drop policy if exists "Anyone authenticated can read law updates" on public.law_updates;

    alter policy "Authenticated users can read law updates" on public.law_updates
      using ((auth.jwt() ->> 'email') like '%@dutiva.ca');
  else
    raise notice 'public.law_updates not present (live-project-only schema) - skipping';
  end if;
end $$;
