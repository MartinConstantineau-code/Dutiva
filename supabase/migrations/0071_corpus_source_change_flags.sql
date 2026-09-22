-- Couple law-change detection to the Advisor corpus (RAG review 2026-08-08,
-- closing the gap LAW_MONITORING.md §"Advisor does not consume this"
-- documents): a detected amendment now flags the affected corpus chunks
-- instead of stopping at the Knowledge panel.
--
-- Mechanism, deliberately in the database (same reasoning as scheduling in
-- 0035: the coupling lives beside the data, where a function redeploy can't
-- lose it): an AFTER INSERT trigger on law_updates stamps
-- advisor_guidance_chunks.source_changed_at for every chunk in the changed
-- law's jurisdiction. Granularity is honest about what the monitor knows —
-- it detects that a JURISDICTION's law changed, not which corpus topic the
-- amendment touches, so it flags the whole jurisdiction. Over-flagging errs
-- safe: a flagged chunk keeps retrieving (content is unchanged and still
-- the best grounding available), but its citation drops from "valid" to
-- needs-review until a human re-verifies (responsePayload.ts:
-- valid = reviewed AND source_changed_at is null), and the payload warns
-- that a law behind a cited source changed.
--
-- Clearing the flag is a human act, together with review_status:
--
--   update public.advisor_guidance_chunks
--     set review_status = 'reviewed', source_changed_at = null,
--         source_change_note = null
--   where jurisdiction = '<J>' and topic = '<topic>';
--
-- ROLLBACK:
--   drop trigger if exists law_updates_flag_guidance on public.law_updates;
--   drop function if exists public.flag_guidance_chunks_on_law_change();
--   -- recreate match_advisor_guidance from 0029 (8-column shape)
--   alter table public.advisor_guidance_chunks
--     drop column if exists source_changed_at,
--     drop column if exists source_change_note;

alter table public.advisor_guidance_chunks
  add column if not exists source_changed_at timestamptz,
  add column if not exists source_change_note text;

comment on column public.advisor_guidance_chunks.source_changed_at is
  'Stamped by the law_updates trigger when the monitor detects a change in '
  'this chunk''s jurisdiction. While set, the chunk''s citation renders as '
  'needs-review even if review_status = reviewed. Cleared by a human on '
  're-verification.';

create or replace function public.flag_guidance_chunks_on_law_change()
returns trigger
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  v_jurisdiction text;
begin
  -- Only confirmed content changes; first_seen/redirect/broken are page
  -- lifecycle, not amendments.
  if new.event_type <> 'change' then
    return new;
  end if;

  -- Monitor jurisdictions → corpus codes. The monitor watches all 14
  -- Canadian jurisdictions; the corpus covers three. Anything else is a
  -- no-op by design.
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

  -- coalesce keeps the EARLIEST unresolved change date — a second amendment
  -- before re-review must not make the flag look fresher than the backlog.
  update public.advisor_guidance_chunks
     set source_changed_at = coalesce(source_changed_at, timezone('utc', now())),
         source_change_note = coalesce(source_change_note, new.law_name),
         updated_at = timezone('utc', now())
   where jurisdiction = v_jurisdiction
     and status = 'active';

  return new;
end;
$$;

drop trigger if exists law_updates_flag_guidance on public.law_updates;
create trigger law_updates_flag_guidance
  after insert on public.law_updates
  for each row execute function public.flag_guidance_chunks_on_law_change();

-- Recreate retrieval with the flag in its return set (Postgres cannot add
-- OUT columns in place — same drop/recreate as 0024). Body is 0029's
-- bilingual merged-rank version, unchanged except the added column.
drop function if exists public.match_advisor_guidance(text, integer);

create function public.match_advisor_guidance(q text, k integer default 4)
returns table (
  title text,
  content text,
  source_url text,
  source_name text,
  jurisdiction text,
  effective_note text,
  topic text,
  review_status text,
  source_changed_at timestamptz
)
language sql
stable
set search_path = public
as $$
  with lex_en as (
    select to_tsquery(
      'english',
      string_agg(distinct '''' || replace(lexeme, '''', '''''') || '''', ' | ')
    ) as tq
    from unnest(tsvector_to_array(to_tsvector('english', q))) as lexeme
  ),
  lex_fr as (
    select to_tsquery(
      'french',
      string_agg(distinct '''' || replace(lexeme, '''', '''''') || '''', ' | ')
    ) as tq
    from unnest(tsvector_to_array(to_tsvector('french', q))) as lexeme
  )
  select c.title, c.content, c.source_url, c.source_name, c.jurisdiction,
         c.effective_note, c.topic, c.review_status, c.source_changed_at
  from public.advisor_guidance_chunks c, lex_en, lex_fr
  where c.status = 'active'
    and (
      (lex_en.tq is not null and c.fts @@ lex_en.tq)
      or (lex_fr.tq is not null and c.fts_fr is not null and c.fts_fr @@ lex_fr.tq)
    )
  order by greatest(
    coalesce(
      case when lex_en.tq is not null then ts_rank(c.fts, lex_en.tq) end,
      0
    ),
    coalesce(
      case
        when lex_fr.tq is not null and c.fts_fr is not null then ts_rank(c.fts_fr, lex_fr.tq)
      end,
      0
    )
  ) desc
  limit greatest(1, least(k, 8))
$$;

revoke execute on function public.match_advisor_guidance(text, integer)
  from public, anon, authenticated;
