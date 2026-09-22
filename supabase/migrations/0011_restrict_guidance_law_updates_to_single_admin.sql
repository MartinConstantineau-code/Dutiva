-- Narrow read access to the real legal-sources feature (guidance_sources,
-- guidance_chunks, law_updates) from any @dutiva.ca account down to the
-- single allowed admin account. The workspace itself moved from "public
-- demo, @dutiva.ca-gated real features" to fully invite-only for one
-- person (see src/features/app/auth/allowedEmail.ts, the single source of
-- truth mirrored here) — this migration keeps the DB-level policy in sync
-- with that, rather than leaving a wider domain-based gate that a second
-- @dutiva.ca account could still pass.
--
-- Supersedes 0003_restrict_guidance_law_updates_to_dutiva_domain.sql's
-- `(auth.jwt() ->> 'email') like '%@dutiva.ca'` clauses with an exact,
-- case-insensitive match. STATUS: applied to the live project — the
-- guidance_sources / guidance_chunks / law_updates read policies are
-- confirmed to match exactly `martin.constantineau@dutiva.ca`.
--
-- Written defensively, matching 0003: the guidance/law-update tables were
-- created directly on the live project and have no CREATE migration in
-- this repo, so a fresh replay skips tables that don't exist instead of
-- failing the whole migration run.

do $$
begin
  if to_regclass('public.guidance_sources') is not null then
    alter policy "Authenticated can read active public guidance sources" on public.guidance_sources
      using (
        lower((auth.jwt() ->> 'email')) = 'martin.constantineau@dutiva.ca'
        and (status = 'active' or is_admin((select auth.uid())))
      );
  else
    raise notice 'public.guidance_sources not present (live-project-only schema) - skipping';
  end if;

  if to_regclass('public.guidance_chunks') is not null then
    alter policy "Members can read guidance chunks" on public.guidance_chunks
      using (
        lower((auth.jwt() ->> 'email')) = 'martin.constantineau@dutiva.ca'
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
    alter policy "Authenticated users can read law updates" on public.law_updates
      using (lower((auth.jwt() ->> 'email')) = 'martin.constantineau@dutiva.ca');
  else
    raise notice 'public.law_updates not present (live-project-only schema) - skipping';
  end if;
end $$;
