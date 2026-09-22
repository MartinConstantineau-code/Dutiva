-- Leave records — the data behind the Analytics "Leave overview" card and
-- the employee profile's leave section. Status-only by design: a leave has
-- a free-text type, a protected flag, and dates — never balances and never
-- medical detail (that boundary is the product's, not just the card's).
--
-- leave_type is deliberately unconstrained text: leave taxonomies are
-- jurisdiction-specific in Canada (the product's whole subject), and a
-- wrong enum would be worse than none. The UI offers suggestions.
create table if not exists public.hr_leaves (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  employee_id uuid not null references public.employees(id) on delete cascade,
  leave_type text not null,
  -- Statutorily protected (reinstatement-sensitive) leave.
  is_protected boolean not null default false,
  start_date date,
  expected_return_date date,
  -- Null while the leave is current; set when the person is back.
  ended_on date,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists hr_leaves_organization_id_idx
  on public.hr_leaves (organization_id);
create index if not exists hr_leaves_employee_id_idx
  on public.hr_leaves (employee_id);

alter table public.hr_leaves enable row level security;

create policy "Org members can view leaves"
  on public.hr_leaves for select
  using (public.is_org_member(organization_id, (select auth.uid())));

create policy "Org admins can insert leaves"
  on public.hr_leaves for insert
  with check (public.is_org_admin(organization_id, (select auth.uid())));

create policy "Org admins can update leaves"
  on public.hr_leaves for update
  using (public.is_org_admin(organization_id, (select auth.uid())))
  with check (public.is_org_admin(organization_id, (select auth.uid())));

create policy "Org admins can delete leaves"
  on public.hr_leaves for delete
  using (public.is_org_admin(organization_id, (select auth.uid())));
