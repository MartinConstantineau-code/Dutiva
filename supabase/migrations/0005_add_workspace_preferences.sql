-- Per-admin workspace mode preference (demo ⇄ production), scoped to the
-- signed-in user's own row.
--
-- CONTEXT: the product ships with realistic Northgate Logistics Inc. sample
-- data baked into the frontend's fixtures so it works as a sales/training
-- demo out of the box. Site admins (today: just Martin, the sole row in
-- `admin_users`) need a personal toggle to see the real, empty "production"
-- workspace instead — without affecting any other visitor, who always sees
-- the default experience.
--
-- Absence of a row means "demo" (today's default behaviour, unchanged) —
-- a row is only ever created when an admin explicitly switches to
-- production, so this migration seeds nothing.
create table if not exists public.workspace_preferences (
  user_id uuid primary key references auth.users(id) on delete cascade,
  mode text not null default 'demo' check (mode in ('demo', 'production')),
  updated_at timestamptz not null default now()
);

alter table public.workspace_preferences enable row level security;

-- Only confirmed admins may read or write their own preference row. This
-- reuses the same is_admin_user() SECURITY DEFINER check the rest of the
-- schema gates admin-only access with (see 0004) rather than hardcoding an
-- email — so the set of people who can ever hold a "production" preference
-- is exactly the set of granted admins.
create policy "Admins manage their own workspace preference"
  on public.workspace_preferences
  for all
  using (user_id = auth.uid() and public.is_admin_user())
  with check (user_id = auth.uid() and public.is_admin_user());
