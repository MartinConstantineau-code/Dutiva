-- Analytics Phase 2: the monthly snapshot row also carries the headcount.
--
-- The "Headcount & turnover" card needs a headcount *history*, and — like
-- the score (0062) — last month's headcount can't be reconstructed from
-- current rows (terminations carry no date). The row Analytics already
-- upserts every month is the natural home: one org/month analytics
-- snapshot, score and headcount together. Nullable, so rows written before
-- this migration stay valid and simply don't contribute a headcount point.
alter table public.compliance_score_snapshots
  add column if not exists headcount integer
    constraint compliance_score_snapshots_headcount_nonnegative
    check (headcount is null or headcount >= 0);

comment on column public.compliance_score_snapshots.headcount is
  'Active (non-terminated) employees at snapshot time; null for rows written before 0063.';
