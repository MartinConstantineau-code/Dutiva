-- Let signed-in users execute the three helpers their own RLS policies call.
--
-- ── THE BUG ──────────────────────────────────────────────────────────────────
-- `is_admin`, `is_org_member` and `is_org_admin` appear in the USING clauses of
-- policies on 71, 46 and 13 tables respectively — support_tickets, employees,
-- hr_cases, hr_policies, organizations, notifications, comments, and most of
-- the workspace besides. None of them had EXECUTE granted to `authenticated`.
--
-- Postgres evaluates an RLS predicate as the *querying* role, not as the table
-- owner. So every browser read of those tables called a function the caller
-- could not execute, and Postgres raised
--
--   ERROR: 42501: permission denied for function is_org_member
--
-- rather than filtering rows. Not "no results" — a hard error. Confirmed
-- 2026-08-06 by probing ten representative tables as `authenticated`: all ten
-- failed, and /app/support/requests showed "We couldn't load your requests."
--
-- ── WHY IT WAS NEVER GRANTED ─────────────────────────────────────────────────
-- Not a regression from 0004 or 0020. Those hardened a different set of eight
-- functions and re-granted `authenticated` where it was needed (their
-- `keep_authenticated` list). These three were never in scope: they predate
-- this repository — like the `documents` / `signatures` / `conversations`
-- tables archived in supabase/legacy-migrations/ — so no migration here ever
-- granted them, and Postgres' default PUBLIC grant had been revoked.
--
-- ── WHY THIS IS SAFE ─────────────────────────────────────────────────────────
-- All three are STABLE, SECURITY DEFINER, `SET search_path`, and read-only:
-- they return a boolean from `user_roles` / `organization_members` and mutate
-- nothing. Granting EXECUTE lets a signed-in caller ask "is this uuid an admin,
-- or a member of this org" — which is exactly what the policies already compute
-- on that caller's behalf on every query.
--
-- `anon` is deliberately NOT granted. That is the boundary 0004 and 0020 set
-- out to protect, and nothing anonymous should be reading these tables.
--
-- ROLLBACK:
--   revoke execute on function public.is_admin(uuid) from authenticated;
--   revoke execute on function public.is_org_member(uuid, uuid) from authenticated;
--   revoke execute on function public.is_org_admin(uuid, uuid) from authenticated;
--   -- (restores the broken state; only useful to confirm causation)

grant execute on function public.is_admin(uuid)                  to authenticated;
grant execute on function public.is_org_member(uuid, uuid)       to authenticated;
grant execute on function public.is_org_admin(uuid, uuid)        to authenticated;

-- Belt and braces: anon must not pick these up by inheritance.
revoke execute on function public.is_admin(uuid)                 from anon;
revoke execute on function public.is_org_member(uuid, uuid)      from anon;
revoke execute on function public.is_org_admin(uuid, uuid)       from anon;
