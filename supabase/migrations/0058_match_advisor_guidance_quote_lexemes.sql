-- Applied to the live project 2026-07-27 (version 20260727033442).
-- Recovered from supabase_migrations.schema_migrations on 2026-08-06.
--
-- ALREADY APPLIED — this file is the record, not a pending change. Applied
-- directly to the project with no file committed; surfaced by the reverse
-- drift check in scripts/check-migrations.mjs. See docs/TODO.md.
--
-- Worth reading rather than skimming: this is a real bug fix that lived only
-- in production. Unquoted lexemes carrying tsquery metacharacters (any URL or
-- host token) raised 42601, which silently disabled Advisor retrieval for any
-- message containing a link. Nobody reviewing the repo could have seen either
-- the bug or the fix.
--
-- `create or replace` throughout; safe to re-run.

-- Fix (review finding, 2026-07-26): quote each lexeme before re-parsing —
-- URL/host tokens carry tsquery metacharacters verbatim and unquoted they
-- raise 42601, silently disabling retrieval for any message with a link.
create or replace function public.match_advisor_guidance(q text, k int default 4)
returns table (
  title text,
  content text,
  source_url text,
  source_name text,
  jurisdiction text,
  effective_note text
)
language sql
stable
as $fn$
  with lex as (
    select to_tsquery(
      'english',
      string_agg(distinct '''' || replace(lexeme, '''', '''''') || '''', ' | ')
    ) as tq
    from unnest(tsvector_to_array(to_tsvector('english', q))) as lexeme
  )
  select c.title, c.content, c.source_url, c.source_name, c.jurisdiction, c.effective_note
  from public.advisor_guidance_chunks c, lex
  where c.status = 'active' and lex.tq is not null and c.fts @@ lex.tq
  order by ts_rank(c.fts, lex.tq) desc
  limit greatest(1, least(k, 8))
$fn$;

revoke execute on function public.match_advisor_guidance(text, int)
  from public, anon, authenticated;
