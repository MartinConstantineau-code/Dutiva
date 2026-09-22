-- Cron lease/lock table and helper functions.
--
-- `monitor-law-changes` calls acquire_cron_lock / release_cron_lock on every
-- invocation, but the functions were never created on this project: the
-- migration that defined them lived only in the retired Dutiva-Website repo
-- and did not travel with the edge function. The RPC call therefore failed
-- every run and the function fell through to its "continue without lock"
-- warning path — working, but unprotected against overlapping runs.
--
-- Ported here so the repo that owns the function also owns its schema.
--
-- Postgres advisory locks are session-scoped and don't survive pgbouncer's
-- transaction pooling, so this is a lease table instead: insert-or-steal-if-
-- expired, atomic in a single UPSERT.

create table if not exists public.cron_locks (
  job_name    text        primary key,
  instance_id text        not null,
  acquired_at timestamptz not null default timezone('utc'::text, now()),
  expires_at  timestamptz not null
);

comment on table public.cron_locks is
  'Lease-style locks for edge-function cron jobs. Service-role only.';

alter table public.cron_locks enable row level security;
revoke all on table public.cron_locks from anon, authenticated, public;
grant insert, select, update, delete on table public.cron_locks to service_role;

-- Acquire a lease: insert, or steal one whose expires_at has already passed
-- (crash recovery). Returns true only if the caller now holds it.
create or replace function public.acquire_cron_lock(
  p_job_name    text,
  p_instance_id text,
  p_ttl_seconds integer default 1800
)
returns boolean
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  v_now        timestamptz := timezone('utc'::text, now());
  v_expires_at timestamptz := v_now + make_interval(secs => p_ttl_seconds);
  v_owner      text;
begin
  insert into public.cron_locks (job_name, instance_id, acquired_at, expires_at)
  values (p_job_name, p_instance_id, v_now, v_expires_at)
  on conflict (job_name) do update
    set instance_id = excluded.instance_id,
        acquired_at = excluded.acquired_at,
        expires_at  = excluded.expires_at
    where public.cron_locks.expires_at < v_now
  returning instance_id into v_owner;

  return v_owner is not null and v_owner = p_instance_id;
end;
$$;

-- Release a lease, but only if the caller still owns it. False means someone
-- else took it (our run exceeded the TTL).
create or replace function public.release_cron_lock(
  p_job_name    text,
  p_instance_id text
)
returns boolean
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  v_count integer;
begin
  delete from public.cron_locks
  where job_name = p_job_name and instance_id = p_instance_id;
  get diagnostics v_count = row_count;
  return v_count > 0;
end;
$$;

revoke execute on function public.acquire_cron_lock(text, text, integer) from public, anon, authenticated;
revoke execute on function public.release_cron_lock(text, text)          from public, anon, authenticated;
grant  execute on function public.acquire_cron_lock(text, text, integer) to service_role;
grant  execute on function public.release_cron_lock(text, text)          to service_role;
