-- Real policy register — the fifth per-tenant module wired to production
-- mode (workspace-mode Phase 7), following the employees/hr_cases shape.
--
-- The demo vocabulary maps directly: a register row can be up to date,
-- need review, or be a known gap ('missing' — the policy should exist but
-- hasn't been written yet), so identified gaps live in the same register
-- as the policies themselves. No policy-shaped table exists in the live
-- schema (policy_gap_analyses is an analysis artifact, not a register).
create table if not exists public.hr_policies (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  name text not null,
  status text not null default 'up_to_date'
    check (status in ('up_to_date', 'needs_review', 'missing')),
  last_reviewed date,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists hr_policies_organization_id_idx
  on public.hr_policies (organization_id);

alter table public.hr_policies enable row level security;

-- Same posture as employees/hr_cases: org members read, org owners/admins write.
create policy "Org members can view policies"
  on public.hr_policies for select
  using (public.is_org_member(organization_id, (select auth.uid())));

create policy "Org admins can insert policies"
  on public.hr_policies for insert
  with check (public.is_org_admin(organization_id, (select auth.uid())));

create policy "Org admins can update policies"
  on public.hr_policies for update
  using (public.is_org_admin(organization_id, (select auth.uid())))
  with check (public.is_org_admin(organization_id, (select auth.uid())));

create policy "Org admins can delete policies"
  on public.hr_policies for delete
  using (public.is_org_admin(organization_id, (select auth.uid())));
