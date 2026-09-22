-- Add 'recoverable-error' to the client_error_reports.kind allow-list.
--
-- New source (src/main.tsx's onRecoverableError, wired to
-- reportRecoverableError() in src/lib/errorReporting/index.ts): React calls
-- this whenever it recovers from an error on its own — the case that matters
-- here is a hydration mismatch on the prerendered public pages, where React
-- silently discards the mismatched subtree and re-renders client-side, so the
-- visitor never sees a broken page but production has zero visibility into
-- *where* the mismatch happened. This is exactly the failure mode section 0 of
-- the engineering handoff warns about: report-error already re-validates
-- `kind` against a server-side allow-list (supabase/functions/report-error),
-- and that allow-list is itself constrained by this table's CHECK — so both
-- sides must be updated together, or the new kind is accepted by the function
-- and then silently rejected by the insert.
--
-- ROLLBACK:
--   alter table public.client_error_reports drop constraint client_error_reports_kind_check;
--   alter table public.client_error_reports add constraint client_error_reports_kind_check
--     check (kind is null or kind in ('route-boundary', 'window-error', 'unhandled-rejection'));

alter table public.client_error_reports drop constraint client_error_reports_kind_check;

alter table public.client_error_reports add constraint client_error_reports_kind_check
  check (kind is null or kind in (
    'route-boundary', 'window-error', 'unhandled-rejection', 'recoverable-error'
  ));
