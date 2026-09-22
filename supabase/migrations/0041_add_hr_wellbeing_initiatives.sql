-- Wellbeing module on real persistence, following the
-- employees/hr_cases/hr_policies shape (0006/0007/0008).
--
-- READ THIS BEFORE ADDING A COLUMN. The demo fixture for this module is a
-- list of "support signals" about named employees, each carrying a source, a
-- confidence level and a sensitivity rating — a product that watches people
-- and infers who is struggling. There is deliberately no employee_id on this
-- table, and there must not be one.
--
-- Three reasons, in descending order of how much they matter:
--
--   1. It would be inferred health information about an identifiable person,
--      recorded by their employer, on a confidence score. Ring 2 is built on
--      the opposite commitment: the psychological safety self-check asks the
--      employer what THEY have put in place rather than how staff feel, and
--      T44 requests no diagnosis. A signals table contradicts both.
--   2. Nothing in the product produces such a signal. Persisting one means
--      inventing the detection or having a human type a suspicion into a
--      field labelled "confidence", and the second is worse.
--   3. CANONICAL_FACTS.md §4 already says Pillar A is not clinical and must
--      not be described as though it were. A per-employee wellbeing signal
--      is that description in schema form.
--
-- So this is a register of what the employer OFFERS: the supports in place,
-- who owns each, and when it is next reviewed. That is the half of the demo
-- that is real, useful, and the employer's own knowledge — and it is what an
-- employer actually has to be able to evidence.
--
-- If per-person wellbeing support ever needs recording, it belongs on the
-- accommodation path (hr_cases + the duty-to-accommodate flow), where there
-- is a request, a documented need and the employee's own participation —
-- not here, and not inferred.
create table if not exists public.hr_wellbeing_initiatives (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  name text not null,
  kind text not null default 'other'
    check (kind in ('eap', 'training', 'policy', 'check_in', 'accommodation_support', 'other')),
  status text not null default 'planned'
    check (status in ('planned', 'active', 'paused', 'retired')),
  -- Role or person accountable for the initiative, free text. This names an
  -- owner, never a participant.
  owner text,
  review_date date,
  note text,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists hr_wellbeing_initiatives_organization_id_idx
  on public.hr_wellbeing_initiatives (organization_id);

alter table public.hr_wellbeing_initiatives enable row level security;

-- Members read, admins write — the same posture as the policy register, and
-- appropriate for the same reason: knowing what support exists is not
-- sensitive, and staff benefiting from it is the point.
create policy "Org members can view wellbeing initiatives"
  on public.hr_wellbeing_initiatives for select
  using (public.is_org_member(organization_id, (select auth.uid())));

create policy "Org admins can insert wellbeing initiatives"
  on public.hr_wellbeing_initiatives for insert
  with check (public.is_org_admin(organization_id, (select auth.uid())));

create policy "Org admins can update wellbeing initiatives"
  on public.hr_wellbeing_initiatives for update
  using (public.is_org_admin(organization_id, (select auth.uid())))
  with check (public.is_org_admin(organization_id, (select auth.uid())));

create policy "Org admins can delete wellbeing initiatives"
  on public.hr_wellbeing_initiatives for delete
  using (public.is_org_admin(organization_id, (select auth.uid())));
