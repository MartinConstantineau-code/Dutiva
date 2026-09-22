-- Let an annual subscription actually be stored.
--
-- STATUS: NOT APPLIED. Authoring a migration is not applying one; see
-- AGENTS.md § "Migrations ship in two halves".
--
-- WHY THIS EXISTS. Wiring annual billing end to end (EF4) is pointless if the
-- database refuses to record it. `0013_add_billing_profiles.sql` declares
--
--   billing_period text not null default 'monthly' check (billing_period in ('monthly'))
--
-- so on that declaration an annual checkout would fail the constraint, the
-- profile UPDATE would be rejected, and the customer would be charged with no
-- entitlement recorded. That is the exact failure this repo has already shipped
-- three times: a CHECK constraint that never learned the vocabulary the edge
-- functions write (see the header of scripts/check-migrations.mjs).
--
-- WHAT WE ACTUALLY KNOW, AND WHAT WE DO NOT. `0013` was never applied under its
-- own name — the live `public.profiles` came from the predecessor repo, and
-- `0024_reconcile_billing_schema.sql` says so explicitly. So the constraint
-- above is what the REPO declares, not necessarily what the PROJECT enforces:
-- the live definition could permit more values, fewer, or none at all. Nothing
-- in this session could read it, and `npm run check:migrations` cannot tell us
-- either, because the drift half is unchecked on this repository (TODO.md V1).
--
-- So this migration is written to be correct under every one of those cases,
-- following the pattern 0024 established for `profiles_plan_check`: drop the
-- constraint if it exists, then add the widened one. Idempotent, additive, and
-- non-destructive — no column is dropped, no value is removed, no row is
-- rewritten. Re-running it is a no-op.

-- Guard the whole thing on the column existing, so this is safe to replay
-- against a project whose profiles table differs from 0013's declaration.
do $$
begin
  if not exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'profiles'
      and column_name = 'billing_period'
  ) then
    alter table public.profiles
      add column billing_period text not null default 'monthly';
  end if;
end
$$;

alter table public.profiles drop constraint if exists profiles_billing_period_check;
alter table public.profiles add constraint profiles_billing_period_check
  check (billing_period in ('monthly', 'annual'));

-- Note for whoever applies this: if the live table carried a differently NAMED
-- check on this column (the predecessor's naming is not knowable from here),
-- the drop above will not find it and the add will simply layer a second,
-- compatible constraint alongside it — at which case an annual write would
-- still be rejected by the older one. After applying, confirm with:
--
--   select conname, pg_get_constraintdef(oid)
--   from pg_constraint
--   where conrelid = 'public.profiles'::regclass and contype = 'c';
--
-- and drop any surviving billing_period check that predates this file.
