-- Guard the 0071 corpus-flag trigger against no-op rewrites (2026-08-08
-- follow-up review): the UPDATE ran against every active chunk in the
-- jurisdiction on EVERY 'change' event, and although coalesce() kept the
-- flag values stable, it still rewrote updated_at on already-flagged rows —
-- corrupting the freshness audit the 0059 touch trigger exists to provide.
-- Only rows not yet flagged are touched now; an already-flagged chunk keeps
-- both its original flag date and its true updated_at.
--
-- `create or replace`; safe to run whether or not 0071 was applied first
-- (it recreates the same function name — apply 0071 before this one).
--
-- ROLLBACK: re-run the function body from 0071.

create or replace function public.flag_guidance_chunks_on_law_change()
returns trigger
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  v_jurisdiction text;
begin
  if new.event_type <> 'change' then
    return new;
  end if;

  v_jurisdiction := case new.jurisdiction
    when 'Ontario' then 'ON'
    when 'Quebec' then 'QC'
    when 'Québec' then 'QC'
    when 'Federal' then 'FED'
    else null
  end;
  if v_jurisdiction is null then
    return new;
  end if;

  update public.advisor_guidance_chunks
     set source_changed_at = timezone('utc', now()),
         source_change_note = new.law_name,
         updated_at = timezone('utc', now())
   where jurisdiction = v_jurisdiction
     and status = 'active'
     and source_changed_at is null;

  return new;
end;
$$;
