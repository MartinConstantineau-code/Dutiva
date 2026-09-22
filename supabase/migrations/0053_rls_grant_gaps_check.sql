-- Make the failure mode that broke the workspace on 2026-08-06 detectable.
--
-- ── WHAT HAPPENED ────────────────────────────────────────────────────────────
-- `is_admin`, `is_org_member` and `is_org_admin` appear in the USING clauses of
-- policies on 71, 46 and 13 tables. None had EXECUTE granted to `authenticated`
-- (fixed in 0050). Postgres evaluates an RLS predicate as the *querying* role,
-- so every browser read of those tables raised
--
--   ERROR: 42501: permission denied for function is_org_member
--
-- rather than filtering rows. Not "no results" — a hard error, on most of the
-- product, for an unknown length of time.
--
-- ── WHY NOTHING CAUGHT IT ────────────────────────────────────────────────────
-- The test suite is offline by design: 1,600 tests, no database. Nothing in it
-- can perform a signed-in read of a policy-protected table, so a total
-- workspace outage was invisible to a fully green `npm run check`. Adding a
-- networked integration test would trade that determinism away for one case.
--
-- This is the cheaper trade: a static check, in the database, that answers the
-- question directly — "does any RLS policy call a function the caller cannot
-- execute?" It needs no fixtures, no network, and no signed-in session, because
-- the mismatch is visible in the catalog. Same idea as `law_monitor_status()`
-- and `attachment_scan_status()`: one query, no interpretation required.
--
--   select * from public.rls_grant_gaps();
--
-- **Zero rows is healthy.** Any row is a table whose policy will raise 42501
-- instead of filtering. Run it after adding a policy or a helper function; see
-- docs/SUPPORT_RUNBOOK.md.
--
-- ── SCOPE ────────────────────────────────────────────────────────────────────
-- `authenticated` only, deliberately. `anon` legitimately lacks EXECUTE on the
-- privilege helpers (0004/0020 revoked it on purpose), and anonymous callers
-- have no business reading those tables — for them a hard error and a denial
-- are the same outcome. Including `anon` would report dozens of rows that are
-- all intended, and a check that cries wolf is a check nobody runs.
--
-- Name matching is textual (`proname` followed by an open paren against the
-- policy expression), which can over-report if a function shares a name with
-- something else in the expression. Over-reporting is the right failure
-- direction here: a false positive costs one look, a false negative costs
-- another silent outage.
--
-- ROLLBACK: drop function if exists public.rls_grant_gaps();

create or replace function public.rls_grant_gaps()
returns table (
  missing_function text,
  on_table         text,
  policy_name      text
)
language sql
security definer
set search_path = pg_catalog, public
as $$
  select distinct
    p.proname::text  as missing_function,
    c.relname::text  as on_table,
    pol.polname::text as policy_name
  from pg_policy pol
  join pg_class c on c.oid = pol.polrelid
  cross join lateral (
    select coalesce(pg_get_expr(pol.polqual, pol.polrelid), '') || ' ' ||
           coalesce(pg_get_expr(pol.polwithcheck, pol.polrelid), '') as expr
  ) e
  join pg_proc p
    on p.pronamespace = 'public'::regnamespace
   and e.expr like '%' || p.proname || '(%'
  where not has_function_privilege('authenticated', p.oid, 'EXECUTE')
  order by 1, 2, 3;
$$;

revoke execute on function public.rls_grant_gaps() from public, anon, authenticated;
grant  execute on function public.rls_grant_gaps() to service_role;
