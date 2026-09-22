-- Real HR case files — the second per-tenant module wired to production
-- mode (workspace-mode Phase 4), following the employees shape (0006).
--
-- Named hr_cases (not cases) to match the schema's hr_documents convention
-- and stay unambiguous in a crowded public schema. case_type mirrors the
-- app's CaseType union; employee_id links to the real roster and survives
-- an employee's deletion as an unlinked case (set null), since a case file
-- may need to outlive the employment record itself.
create table if not exists public.hr_cases (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  title text not null,
  case_type text not null default 'Performance'
    check (case_type in ('Termination', 'Performance', 'Accommodation', 'Onboarding')),
  employee_id uuid references public.employees(id) on delete set null,
  province text not null default 'Ontario',
  status text not null default 'open' check (status in ('open', 'in_review', 'resolved')),
  due_date date,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists hr_cases_organization_id_idx
  on public.hr_cases (organization_id);

alter table public.hr_cases enable row level security;

-- Same posture as employees: org members read, org owners/admins write.
create policy "Org members can view cases"
  on public.hr_cases for select
  using (public.is_org_member(organization_id, (select auth.uid())));

create policy "Org admins can insert cases"
  on public.hr_cases for insert
  with check (public.is_org_admin(organization_id, (select auth.uid())));

create policy "Org admins can update cases"
  on public.hr_cases for update
  using (public.is_org_admin(organization_id, (select auth.uid())))
  with check (public.is_org_admin(organization_id, (select auth.uid())));

create policy "Org admins can delete cases"
  on public.hr_cases for delete
  using (public.is_org_admin(organization_id, (select auth.uid())));
