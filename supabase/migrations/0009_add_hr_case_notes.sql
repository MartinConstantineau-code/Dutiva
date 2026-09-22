-- Case notes — gives production case files a real working record
-- (workspace-mode Phase 11). One row per note, threaded under a case;
-- notes die with their case (cascade), unlike the case's employee link
-- which survives employee deletion (0007).
--
-- organization_id is denormalized from the case so RLS stays a direct
-- is_org_member/is_org_admin check, consistent with every other
-- per-tenant table, instead of a join through hr_cases.
create table if not exists public.hr_case_notes (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  case_id uuid not null references public.hr_cases(id) on delete cascade,
  body text not null,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now()
);

create index if not exists hr_case_notes_case_id_idx
  on public.hr_case_notes (case_id);

alter table public.hr_case_notes enable row level security;

create policy "Org members can view case notes"
  on public.hr_case_notes for select
  using (public.is_org_member(organization_id, (select auth.uid())));

create policy "Org admins can insert case notes"
  on public.hr_case_notes for insert
  with check (public.is_org_admin(organization_id, (select auth.uid())));

create policy "Org admins can delete case notes"
  on public.hr_case_notes for delete
  using (public.is_org_admin(organization_id, (select auth.uid())));
