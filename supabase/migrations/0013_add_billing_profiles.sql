-- Billing profile per signed-in account, written by the Stripe checkout and
-- webhook functions (supabase/functions/create-checkout-session,
-- stripe-webhook). Ported from the production dutiva-website repo's
-- `public.profiles` table, scoped down to billing-only columns — this repo
-- has no other use for a profiles table yet.
--
-- An internal Dutiva account never gets a row written for it: the paywall
-- bypass (src/lib/billing/adminAccess.ts) is checked before any Stripe call
-- is made, so admin/staff plan resolution never touches this table (see
-- PlanProvider). Absence of a row means "free plan, no subscription" —
-- the default this table ships with row-by-row, not a batch backfill.
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  account_email text,
  plan text not null default 'free'
    check (plan in ('free', 'starter', 'growth', 'pro')),
  subscription_status text not null default 'inactive'
    check (subscription_status in ('active', 'trialing', 'past_due', 'canceled', 'inactive')),
  billing_period text not null default 'monthly'
    check (billing_period in ('monthly')),
  stripe_customer_id text,
  stripe_subscription_id text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists profiles_stripe_customer_id_idx
  on public.profiles (stripe_customer_id)
  where stripe_customer_id is not null;

create or replace function public.set_profiles_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
  before update on public.profiles
  for each row
  execute function public.set_profiles_updated_at();

alter table public.profiles enable row level security;

-- Client reads are limited to the signed-in account's own row. All writes
-- (checkout, webhook, portal) go through the service-role key inside the
-- Supabase functions, which bypasses RLS — there is deliberately no
-- authenticated insert/update policy here.
create policy "Users can view their own billing profile"
  on public.profiles
  for select
  using (id = auth.uid());

-- Stripe webhook event ids, for idempotent delivery (Stripe retries on any
-- non-2xx response, and can send the same event more than once even on
-- success). No RLS policies are defined — enabling RLS with no policy denies
-- every role except the service-role key the webhook function uses, which
-- bypasses RLS entirely.
create table if not exists public.stripe_webhook_events (
  event_id text primary key,
  event_type text not null,
  received_at timestamptz not null default timezone('utc', now())
);

alter table public.stripe_webhook_events enable row level security;
