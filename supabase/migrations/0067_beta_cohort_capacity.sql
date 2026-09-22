-- Caps beta auto-admission at the first 15 signups.
--
-- Decision (founder, 2026-08-07): "For beta, we can only accept 15
-- individuals/organizations to begin." Until now the gate widened by 0026
-- treated ANY beta_signups row as an invite, so the landing form admitted
-- an unbounded cohort. This keeps the self-serve mechanism (no approval
-- step, signup stays open as a waiting list) but only the first 15
-- eligible signups are workspace members; everyone later is recorded and
-- waits.
--
-- The number 15 also appears in src/config/beta.ts (BETA_COHORT_LIMIT) and
-- supabase/functions/create-beta-signup/index.ts, because SQL can't import
-- TypeScript; src/canonicalFacts.test.ts reads this file and fails on any
-- drift between the three copies and docs/CANONICAL_FACTS.md.
--
-- Eligibility and ordering, and why each choice:
--   - status not in ('declined', 'bounced'): those rows are dead signups,
--     and holding a seat for one would strand it. This is also the seat
--     lever the schema already provides — the admin UPDATE policy on
--     beta_signups (0055) lets the operator mark a no-show 'declined',
--     which frees the seat for the next signup in line automatically.
--     Deleting the row would do that too, but would destroy its CASL
--     consent record (0037), which must outlive the signup.
--   - order by created_at asc nulls first, id asc: first come, first
--     served. NULLs first because created_at had no default before 0030,
--     so any NULL-dated row predates the fix and is among the oldest; id
--     breaks exact ties deterministically so the cohort can never differ
--     between two evaluations of the same data.
--
-- admin_beta_access is deliberately outside the cap: rows there are
-- explicit operator action (it's the hand-managed invite table, holding
-- the admin's own QA accounts), not self-serve signups, and it remains
-- the override path for inviting someone regardless of cohort state.
--
-- Everything else about the function — no parameters, SECURITY DEFINER,
-- evaluated only against the caller's own JWT email so it can't be used
-- as a list-membership oracle — is unchanged from 0026, and all four
-- enforcement points (RLS policies, AuthProvider, advisor-chat,
-- advisor-safety-event) pick this up with no change of their own.
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
      or lower(auth.jwt() ->> 'email') in (
        select lower(email)
        from public.beta_signups
        where status not in ('declined', 'bounced')
        order by created_at asc nulls first, id asc
        limit 15
      )
      or exists (
        select 1 from public.admin_beta_access
        where lower(user_email) = lower(auth.jwt() ->> 'email')
          and status in ('invited', 'active')
      )
    )
$$;

-- CREATE OR REPLACE preserves the existing ACL, so 0026's grants survive;
-- restated anyway so this file stands on its own about who may execute it.
revoke all on function public.current_user_is_workspace_member() from public, anon;
grant execute on function public.current_user_is_workspace_member() to authenticated;
