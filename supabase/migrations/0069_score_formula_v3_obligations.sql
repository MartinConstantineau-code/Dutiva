-- Score formula v3 — the obligation register in production, task
-- provenance scoping, and two fixes the v2 adversarial review confirmed
-- (docs/SCORING_LOGIC.md §8; TODO.md D8, decided 2026-08-08).
--
-- 1) hr_obligations. The demo's obligation register gets its production
--    counterpart: recurring statutory duties with an owner, a due date and
--    an evidence note. Status is evidence-centric (ok / in_progress /
--    needs_evidence); "overdue" is deliberately NOT a status — it is
--    derived from due_on against today at read time, so it can never go
--    stale by someone forgetting to flip a flag. Scoring counts
--    status = 'ok' (evidence on file) over all obligations, as the
--    fourth score component.
--
-- 2) Formula v3 (comment update below): obligations component added, and
--    the tasks component now counts only provenanced rows — category
--    other than 'general' or an app-written metadata.kind — so a
--    hand-added to-do no longer moves the compliance score.
--
-- 3) Month-close snapshot run. The v2 review confirmed the 05:30 UTC
--    daily cadence freezes each month at its last 05:30, losing changes
--    made later on the final UTC day. A second schedule at 00:05 UTC on
--    the 1st has the job also upsert the *previous* month — the state
--    five minutes after the UTC month boundary, which is the same
--    boundary every monthISO in this system is defined by. The function
--    only touches the previous month during that first UTC hour of the
--    1st, so a manual fire at any other time still cannot rewrite a
--    frozen month.
--
-- Snapshot rows already written under v2 keep formula_version = 2; the
-- daily job re-stamps the current month with the running formula on its
-- next pass (which is also how any version mislabel from a stale app
-- bundle self-heals within a day).
--
-- ROLLBACK:
--   select cron.unschedule('record-score-snapshots-month-close');
--   drop table if exists public.hr_obligations cascade;
--   comment on column public.compliance_score_snapshots.formula_version is
--     '(restore 0068 text)';

create table if not exists public.hr_obligations (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  title text not null,
  -- Free text, same reasoning as hr_leaves.leave_type: obligation areas and
  -- statutes are jurisdiction-specific; a wrong enum is worse than none.
  area text,
  jurisdiction text,
  due_on date,
  recurrence text,
  owner_name text,
  status text not null default 'needs_evidence'
    constraint hr_obligations_status_check
    check (status in ('ok', 'in_progress', 'needs_evidence')),
  evidence text,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists hr_obligations_organization_id_idx
  on public.hr_obligations (organization_id);

alter table public.hr_obligations enable row level security;

-- Same posture as hr_leaves / hr_expiry_records: org members read, org
-- owners/admins write.
create policy "Org members can view obligations"
  on public.hr_obligations for select
  using (public.is_org_member(organization_id, (select auth.uid())));

create policy "Org admins can insert obligations"
  on public.hr_obligations for insert
  with check (public.is_org_admin(organization_id, (select auth.uid())));

create policy "Org admins can update obligations"
  on public.hr_obligations for update
  using (public.is_org_admin(organization_id, (select auth.uid())))
  with check (public.is_org_admin(organization_id, (select auth.uid())));

create policy "Org admins can delete obligations"
  on public.hr_obligations for delete
  using (public.is_org_admin(organization_id, (select auth.uid())));

comment on column public.compliance_score_snapshots.formula_version is
  'Score formula that produced this row. 1: unweighted done/total blend. '
  '2: severity-weighted findings, cancelled tasks excluded, open-critical '
  'ceiling of 69. 3: obligations component (status ok over all), tasks '
  'scoped to provenanced rows (category <> general or metadata.kind set). '
  'Source of truth: SCORE_FORMULA_VERSION in '
  'src/features/app/views/analytics/aggregation.ts and its mirror in '
  'supabase/functions/record-score-snapshots/scoring.ts.';

-- Month-close run: 00:05 UTC on the 1st. Same trigger function as the
-- daily run — the edge function decides from the clock that it should
-- also write the month that just ended. cron.job_run_details reporting
-- success only proves the HTTP request was queued (net.http_post is
-- fire-and-forget); whether snapshots are actually landing is what
-- public.score_snapshot_status() (0068) is for.
do $$
begin
  perform cron.unschedule('record-score-snapshots-month-close');
exception
  when others then null;  -- not scheduled yet; nothing to remove
end;
$$;

select cron.schedule(
  'record-score-snapshots-month-close',
  '5 0 1 * *',
  'select public.trigger_score_snapshots()'
);
