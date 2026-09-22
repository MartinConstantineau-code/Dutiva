-- Widens the invite-only workspace gate from "one hardcoded admin email"
-- (0011_restrict_guidance_law_updates_to_single_admin.sql) to "the admin
-- account, or any email already invited" — the beta-signup form
-- (BetaSignup.tsx / create-beta-signup) becomes the actual invite
-- mechanism instead of a form that records interest and does nothing, per
-- the B2 decision recorded in docs/BILLING_BETA_AUDIT.md.
--
-- "Already invited" is two sources, both additive to the admin account:
--   - public.beta_signups — the self-serve landing-page form. Any row is
--     an invite; there's no separate approval step (matches the decision).
--   - public.admin_beta_access — a pre-existing admin-managed invite table
--     from the predecessor repo (status: invited/active/paused/removed,
--     4 rows already present, including the admin's own QA test accounts).
--     Excluded from this widening: 'paused'/'removed' rows stay excluded,
--     respecting that table's own revoke lifecycle.
--
-- All four independent enforcement points call this one function now,
-- rather than each hand-copying the same email/list check:
--   - This migration's RLS policies (guidance_sources/guidance_chunks/law_updates)
--   - src/features/app/auth/AuthProvider.tsx (client-side, via supabase.rpc)
--   - supabase/functions/advisor-chat/index.ts (via the caller's own JWT client)
--   - supabase/functions/advisor-safety-event/index.ts (same)
--
-- No parameters: always evaluates against the CALLING session's own
-- auth.jwt() ->> 'email'. This is deliberate — a parameterized version
-- would let any authenticated (but not-yet-approved) caller probe whether
-- an arbitrary address is on the beta list, the exact oracle
-- create-beta-signup's own duplicate-signup handling was designed to avoid.
create or replace function public.current_user_is_workspace_member()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select
    coalesce(auth.jwt() ->> 'email', '') <> ''
    and (
      lower(auth.jwt() ->> 'email') = 'martin.constantineau@dutiva.ca'
      or exists (
        select 1 from public.beta_signups
        where lower(email) = lower(auth.jwt() ->> 'email')
      )
      or exists (
        select 1 from public.admin_beta_access
        where lower(user_email) = lower(auth.jwt() ->> 'email')
          and status in ('invited', 'active')
      )
    )
$$;

-- This project grants EXECUTE on new public-schema functions to anon and
-- authenticated by default, so both revokes are needed explicitly — REVOKE
-- ... FROM PUBLIC alone doesn't touch anon's separate default-privilege
-- grant. Not exploitable either way (anon has no auth.jwt() email to check,
-- so the function always answers false for it), but the intent is
-- authenticated-only and the grants should say so.
revoke all on function public.current_user_is_workspace_member() from public, anon;
grant execute on function public.current_user_is_workspace_member() to authenticated;

-- Same defensive to_regclass guards as 0011: these tables were created
-- directly on the live project and have no CREATE migration in this repo.
do $$
begin
  if to_regclass('public.guidance_sources') is not null then
    alter policy "Authenticated can read active public guidance sources" on public.guidance_sources
      using (
        public.current_user_is_workspace_member()
        and (status = 'active' or is_admin((select auth.uid())))
      );
  else
    raise notice 'public.guidance_sources not present (live-project-only schema) - skipping';
  end if;

  if to_regclass('public.guidance_chunks') is not null then
    alter policy "Members can read guidance chunks" on public.guidance_chunks
      using (
        public.current_user_is_workspace_member()
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
      using (public.current_user_is_workspace_member());
  else
    raise notice 'public.law_updates not present (live-project-only schema) - skipping';
  end if;
end $$;
