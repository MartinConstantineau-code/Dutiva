-- Internal communications module on real persistence, following the
-- employees/hr_cases/hr_policies shape (0006/0007/0008). This is the module
-- that pairs with Ring 3: `template_tid` points a logged message at the
-- template it was drafted from (T35–T43), so the record and the document
-- stay connected.
--
-- WHAT THIS DELIBERATELY DOES NOT STORE: the demo's Advisor "review
-- dimensions" — four chips scoring a message on tone, legal, clarity and
-- policy. Nothing in the product performs that analysis. Persisting the
-- chips would turn a fixture's decoration into a stored assertion that a
-- message passed a legal review it never had, which is the specific claim
-- CANONICAL_FACTS.md §4 forbids. When an Advisor pass over a draft actually
-- exists, it gets its own columns and its own timestamps.
--
-- What is stored is what an employer knows without the product inferring
-- anything: what was sent, to whom, through what channel, and when.
create table if not exists public.hr_communications (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  title text not null,
  audience text,
  channel text not null default 'email'
    check (channel in ('email', 'meeting', 'intranet', 'letter', 'other')),
  status text not null default 'draft'
    check (status in ('draft', 'scheduled', 'sent')),
  scheduled_for date,
  sent_on date,
  -- Document Studio tid this was drafted from, e.g. 'T36'. Free text rather
  -- than a foreign key: the catalogue lives in the repo, not the database.
  template_tid text,
  note text,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists hr_communications_organization_id_idx
  on public.hr_communications (organization_id);

alter table public.hr_communications enable row level security;

-- Same posture as employees/hr_cases/hr_policies: org members read, org
-- owners/admins write. An announcement log is something the team can see.
create policy "Org members can view communications"
  on public.hr_communications for select
  using (public.is_org_member(organization_id, (select auth.uid())));

create policy "Org admins can insert communications"
  on public.hr_communications for insert
  with check (public.is_org_admin(organization_id, (select auth.uid())));

create policy "Org admins can update communications"
  on public.hr_communications for update
  using (public.is_org_admin(organization_id, (select auth.uid())))
  with check (public.is_org_admin(organization_id, (select auth.uid())));

create policy "Org admins can delete communications"
  on public.hr_communications for delete
  using (public.is_org_admin(organization_id, (select auth.uid())));
