-- Retire the two federal HTML sources superseded by Justice Canada's XML.
--
-- Federal monitoring now reads github.com/justicecanada/laws-lois-xml instead
-- of scraping laws-lois.justice.gc.ca. `law_page_hashes` is keyed by URL, so
-- the switch creates two new rows and strands the two old ones: never checked
-- again, never updated, but still counted.
--
-- That matters because `law_monitor_status()` reports `monitored_pages` and
-- `broken_pages` off this table. Leaving the strays behind would report 21
-- monitored pages when 19 are monitored — and this whole workstream exists
-- because monitoring health data was quietly overstating reality. Removing
-- them keeps the number a fact.
--
-- Deleting hash rows loses no history: `law_updates` is the event log and is
-- untouched, so every change ever detected on these URLs is preserved.
--
-- Guarded with to_regclass because law_page_hashes is live-project-only schema
-- that no migration in this repo creates, same as 0003 / 0011 / 0026.

do $$
begin
  if to_regclass('public.law_page_hashes') is null then
    raise notice 'public.law_page_hashes not present (live-project-only schema) - skipping';
    return;
  end if;

  delete from public.law_page_hashes
  where url in (
    'https://laws-lois.justice.gc.ca/eng/acts/L-2/',
    'https://laws-lois.justice.gc.ca/eng/acts/H-6/'
  );
end;
$$;
