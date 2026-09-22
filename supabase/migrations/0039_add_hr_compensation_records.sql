-- Compensation module on real persistence, following the
-- employees/hr_cases/hr_policies shape (0006/0007/0008).
--
-- WHAT THIS DELIBERATELY DOES NOT STORE: a market rate. The demo fixture
-- carries a `market` figure per person and renders a "vs market" percentage
-- from it, but Dutiva has no salary-survey source and buying one is not in
-- scope. A benchmark the product invents is worse than no benchmark: it is a
-- number an employer will quote in a pay conversation.
--
-- So the comparison column is `band_midpoint` — the midpoint of the
-- employer's OWN band, which they enter. When they supply one the view shows
-- the delta against it; when they do not, it shows nothing rather than zero.
-- That keeps the useful half of the demo (are people sitting below their own
-- band?) and drops the half the product cannot substantiate.
--
-- One row per employee: the current compensation record, not a history.
-- `effective_date` says when it took effect; superseding it is an update.
create table if not exists public.hr_compensation_records (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  employee_id uuid not null references public.employees(id) on delete cascade,
  base_salary numeric(12, 2) not null check (base_salary >= 0),
  band text,
  band_midpoint numeric(12, 2) check (band_midpoint > 0),
  effective_date date,
  note text,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint hr_compensation_records_employee_unique unique (employee_id)
);

create index if not exists hr_compensation_records_organization_id_idx
  on public.hr_compensation_records (organization_id);

alter table public.hr_compensation_records enable row level security;

-- Tighter than the other HR tables on read, and that is the point: pay is the
-- one module the demo's own banner calls restricted. Members do NOT get
-- select here — admins only, on every verb.
create policy "Org admins can view compensation records"
  on public.hr_compensation_records for select
  using (public.is_org_admin(organization_id, (select auth.uid())));

create policy "Org admins can insert compensation records"
  on public.hr_compensation_records for insert
  with check (public.is_org_admin(organization_id, (select auth.uid())));

create policy "Org admins can update compensation records"
  on public.hr_compensation_records for update
  using (public.is_org_admin(organization_id, (select auth.uid())))
  with check (public.is_org_admin(organization_id, (select auth.uid())));

create policy "Org admins can delete compensation records"
  on public.hr_compensation_records for delete
  using (public.is_org_admin(organization_id, (select auth.uid())));
