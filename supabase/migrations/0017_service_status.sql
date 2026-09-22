-- Public service-status board behind the branded /status page. One row per
-- component; the founder updates it through the admin-gated set-service-status
-- edge function (service role). Reads are PUBLIC by design — the whole point of
-- a status page is that anyone, signed in or not, can check it.
--
-- Truthful by construction: the page reflects whatever is in this table. It
-- seeds to `operational`; a real incident is posted by the operator. There is
-- no external status provider wired — this is the self-reported source.
--
-- ROLLBACK: drop table if exists public.service_status cascade;

create table if not exists public.service_status (
  component text primary key check (component in ('platform', 'advisor', 'documents', 'support')),
  status text not null default 'operational'
    check (status in ('operational', 'degraded', 'maintenance', 'outage')),
  message text check (message is null or char_length(message) <= 500),
  updated_at timestamptz not null default timezone('utc', now())
);

insert into public.service_status (component) values
  ('platform'), ('advisor'), ('documents'), ('support')
on conflict (component) do nothing;

alter table public.service_status enable row level security;

-- Public read; writes are service-role only (the admin edge function).
create policy "Anyone can read service status"
  on public.service_status for select
  using (true);
