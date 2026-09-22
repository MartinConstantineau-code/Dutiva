alter table public.profiles
  add column if not exists stripe_customer_id text,
  add column if not exists plan text not null default 'free',
  add column if not exists subscription_status text not null default 'inactive',
  add constraint profiles_plan_check
    check (plan in ('free', 'growth', 'advanced')),
  add constraint profiles_subscription_status_check
    check (subscription_status in ('active', 'inactive', 'past_due', 'canceled', 'trialing'));
