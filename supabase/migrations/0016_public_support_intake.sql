-- Rate-limit log for the public (unauthenticated) support intake. The
-- create-public-support-ticket edge function inserts one row per accepted
-- submission and counts recent rows to throttle abuse (per source IP and per
-- destination email). It stores ONLY salted hashes — never the raw IP or email
-- — so this is not a store of personal data and rows are safe to purge on a
-- short retention. The public intake itself writes tickets with the service
-- role (there is still no authenticated/anon INSERT policy on support_tickets).
--
-- RLS: admin read only; writes are service-role (the edge function).
--
-- ROLLBACK: drop table if exists public.support_public_intake cascade;

create table if not exists public.support_public_intake (
  id uuid primary key default gen_random_uuid(),
  ip_hash text,
  email_hash text,
  created_at timestamptz not null default timezone('utc', now())
);

create index if not exists support_public_intake_ip_idx
  on public.support_public_intake (ip_hash, created_at);
create index if not exists support_public_intake_email_idx
  on public.support_public_intake (email_hash, created_at);
create index if not exists support_public_intake_created_idx
  on public.support_public_intake (created_at);

alter table public.support_public_intake enable row level security;

create policy "Admins read public intake log"
  on public.support_public_intake for select
  using (is_admin((select auth.uid())));
