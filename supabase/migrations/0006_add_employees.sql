-- Real employee records — the first per-tenant module wired to production
-- mode (workspace-mode Phase 3).
--
-- CONTEXT: the app's Employees view has only ever rendered the Northgate
-- demo fixtures. Production mode needs a real, organization-scoped table
-- behind it. Organizations already exist in this schema
-- (organizations/organization_members + the create_organization() RPC that
-- inserts the caller as an active owner), so this table hangs off
-- organization_id like the other per-tenant tables (compliance_tasks,
-- notifications, advisor_memories).
create table if not exists public.employees (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  name text not null,
  title text,
  email text,
  province text not null default 'Ontario',
  start_date date,
  status text not null default 'active' check (status in ('active', 'on_leave', 'terminated')),
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists employees_organization_id_idx
  on public.employees (organization_id);

alter table public.employees enable row level security;

-- Reads for any active member of the organization; writes only for its
-- owners/admins — same is_org_member/is_org_admin helpers the rest of the
-- per-tenant tables gate with. (Both are SECURITY DEFINER and also grant
-- site admins via is_admin.)
create policy "Org members can view employees"
  on public.employees for select
  using (public.is_org_member(organization_id, (select auth.uid())));

create policy "Org admins can insert employees"
  on public.employees for insert
  with check (public.is_org_admin(organization_id, (select auth.uid())));

create policy "Org admins can update employees"
  on public.employees for update
  using (public.is_org_admin(organization_id, (select auth.uid())))
  with check (public.is_org_admin(organization_id, (select auth.uid())));

create policy "Org admins can delete employees"
  on public.employees for delete
  using (public.is_org_admin(organization_id, (select auth.uid())));
