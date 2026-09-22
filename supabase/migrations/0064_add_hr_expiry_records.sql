-- Dated per-employee credentials and documents — the records behind the
-- Analytics "Certifications & training" and "Document expiries" cards
-- (which have rendered honest empty states since Phase 2 shipped).
--
-- One table for both kinds on purpose: a certification and a dated
-- document are structurally identical today (a named thing on a person
-- that expires), and the cards' whole job is the shared expiry-bucket
-- treatment. Split into per-domain tables later if the domains grow
-- different fields (issuing bodies, renewal training, document classes).
create table if not exists public.hr_expiry_records (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  -- Denormalized org id keeps RLS a direct is_org_member/is_org_admin
  -- check instead of a join (house pattern since hr_case_notes, 0009).
  employee_id uuid not null references public.employees(id) on delete cascade,
  kind text not null
    constraint hr_expiry_records_kind_check check (kind in ('certification', 'document')),
  name text not null,
  expiry_date date not null,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists hr_expiry_records_organization_id_idx
  on public.hr_expiry_records (organization_id);
create index if not exists hr_expiry_records_employee_id_idx
  on public.hr_expiry_records (employee_id);

alter table public.hr_expiry_records enable row level security;

-- Same posture as employees/hr_cases/hr_policies: org members read, org
-- owners/admins write.
create policy "Org members can view expiry records"
  on public.hr_expiry_records for select
  using (public.is_org_member(organization_id, (select auth.uid())));

create policy "Org admins can insert expiry records"
  on public.hr_expiry_records for insert
  with check (public.is_org_admin(organization_id, (select auth.uid())));

create policy "Org admins can update expiry records"
  on public.hr_expiry_records for update
  using (public.is_org_admin(organization_id, (select auth.uid())))
  with check (public.is_org_admin(organization_id, (select auth.uid())));

create policy "Org admins can delete expiry records"
  on public.hr_expiry_records for delete
  using (public.is_org_admin(organization_id, (select auth.uid())));
