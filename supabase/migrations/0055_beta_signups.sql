-- Applied to the live project 2026-07-20 (version 20260720234815).
-- Recovered from supabase_migrations.schema_migrations on 2026-08-06.
--
-- ALREADY APPLIED — this file is the record, not a pending change. It was
-- applied directly to the project with no file committed, so the schema behind
-- the beta signup flow existed only in production until the reverse drift
-- check in scripts/check-migrations.mjs surfaced it. See docs/TODO.md.
--
-- Idempotent throughout (`if not exists` / `drop policy if exists`), so
-- re-running is a no-op.

create table if not exists public.beta_signups (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  company text,
  province text,
  language text not null default 'en',
  source text not null default 'landing',
  consent_at timestamptz not null default timezone('utc', now()),
  status text not null default 'pending',
  notes text,
  created_at timestamptz not null default timezone('utc', now()),
  constraint beta_signups_province_check
    check (province is null or province in ('on', 'qc', 'fed', 'other')),
  constraint beta_signups_language_check
    check (language in ('en', 'fr')),
  constraint beta_signups_status_check
    check (status in ('pending', 'invited', 'active', 'declined', 'bounced'))
);

create unique index if not exists beta_signups_email_key
  on public.beta_signups (lower(email));

create index if not exists beta_signups_created_idx
  on public.beta_signups (created_at desc);
create index if not exists beta_signups_status_idx
  on public.beta_signups (status, created_at desc);

alter table public.beta_signups enable row level security;

drop policy if exists "Admins read beta signups" on public.beta_signups;
create policy "Admins read beta signups"
  on public.beta_signups for select
  using (is_admin((select auth.uid())));

drop policy if exists "Admins update beta signups" on public.beta_signups;
create policy "Admins update beta signups"
  on public.beta_signups for update
  using (is_admin((select auth.uid())))
  with check (is_admin((select auth.uid())));

create table if not exists public.beta_signup_intake (
  id uuid primary key default gen_random_uuid(),
  ip_hash text,
  email_hash text,
  created_at timestamptz not null default timezone('utc', now())
);

create index if not exists beta_signup_intake_ip_idx
  on public.beta_signup_intake (ip_hash, created_at);
create index if not exists beta_signup_intake_email_idx
  on public.beta_signup_intake (email_hash, created_at);
create index if not exists beta_signup_intake_created_idx
  on public.beta_signup_intake (created_at);

alter table public.beta_signup_intake enable row level security;

drop policy if exists "Admins read beta intake log" on public.beta_signup_intake;
create policy "Admins read beta intake log"
  on public.beta_signup_intake for select
  using (is_admin((select auth.uid())));
