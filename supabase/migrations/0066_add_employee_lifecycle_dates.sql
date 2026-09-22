-- Two lifecycle dates on the employee row itself:
--
-- probation_end_date backs the Analytics "Probation periods ending" card —
-- entered per employee, never derived (probation length varies by province
-- and contract, so a computed date would be a guessed legal fact).
--
-- termination_date is the missing prerequisite the "Headcount & turnover"
-- card has been naming: a status flip to 'terminated' records no *when*,
-- and rolling 12-month turnover is a function of when. Nullable — rows
-- terminated before this migration simply don't contribute to the rate.
alter table public.employees
  add column if not exists probation_end_date date,
  add column if not exists termination_date date;

comment on column public.employees.probation_end_date is
  'End of the probationary period, entered per employee (never derived from start_date).';
comment on column public.employees.termination_date is
  'Date employment ended; null for pre-0066 terminations, which are excluded from turnover.';
