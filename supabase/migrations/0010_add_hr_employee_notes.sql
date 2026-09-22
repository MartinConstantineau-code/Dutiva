-- Employee notes — the employee profile's working record (workspace-mode
-- Phase 12), mirroring hr_case_notes (0009): one row per note, cascading
-- with the employee, organization_id denormalized so RLS stays a direct
-- is_org_member/is_org_admin check.
create table if not exists public.hr_employee_notes (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  employee_id uuid not null references public.employees(id) on delete cascade,
  body text not null,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now()
);

create index if not exists hr_employee_notes_employee_id_idx
  on public.hr_employee_notes (employee_id);

alter table public.hr_employee_notes enable row level security;

create policy "Org members can view employee notes"
  on public.hr_employee_notes for select
  using (public.is_org_member(organization_id, (select auth.uid())));

create policy "Org admins can insert employee notes"
  on public.hr_employee_notes for insert
  with check (public.is_org_admin(organization_id, (select auth.uid())));

create policy "Org admins can delete employee notes"
  on public.hr_employee_notes for delete
  using (public.is_org_admin(organization_id, (select auth.uid())));
