-- Compliance score history for the Analytics view (the rebuilt Reports).
--
-- Analytics deliberately owns no data — it aggregates live from the other
-- modules' tables (workspace-mode Phase 8). History is the one thing that
-- cannot be recomputed later: the score is a function of *current* rows, so
-- last quarter's score is gone unless it was written down at the time. One
-- row per organization per month holds the blended score and its
-- per-component breakdown; the app upserts the current month whenever
-- Analytics computes a live score (write-on-read), and past months freeze.
create table if not exists public.compliance_score_snapshots (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  -- First day of the snapshot month; the check keeps arbitrary dates out so
  -- (organization_id, month) stays one-row-per-month by construction.
  month date not null
    constraint compliance_score_snapshots_month_is_month_start
    check (month = date_trunc('month', month)::date),
  score integer not null
    constraint compliance_score_snapshots_score_range check (score between 0 and 100),
  -- Per-component breakdown ({"policies": {"done": 3, "total": 4}, …}) for
  -- future drill-down; the blended score stays the queryable column.
  components jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint compliance_score_snapshots_org_month_key unique (organization_id, month)
);

create index if not exists compliance_score_snapshots_organization_id_idx
  on public.compliance_score_snapshots (organization_id);

alter table public.compliance_score_snapshots enable row level security;

-- Same posture as employees/hr_cases/hr_policies: org members read, org
-- owners/admins write.
create policy "Org members can view score snapshots"
  on public.compliance_score_snapshots for select
  using (public.is_org_member(organization_id, (select auth.uid())));

create policy "Org admins can insert score snapshots"
  on public.compliance_score_snapshots for insert
  with check (public.is_org_admin(organization_id, (select auth.uid())));

create policy "Org admins can update score snapshots"
  on public.compliance_score_snapshots for update
  using (public.is_org_admin(organization_id, (select auth.uid())))
  with check (public.is_org_admin(organization_id, (select auth.uid())));

create policy "Org admins can delete score snapshots"
  on public.compliance_score_snapshots for delete
  using (public.is_org_admin(organization_id, (select auth.uid())));
