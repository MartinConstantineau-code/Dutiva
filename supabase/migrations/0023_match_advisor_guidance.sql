-- Ranked retrieval over the advisor grounding corpus (0022). Strict
-- websearch_to_tsquery ANDs every term, which returns zero rows for real
-- conversational questions (verified against the seed corpus) — so this
-- matches on OR-ed lexemes and orders by ts_rank, which put the correct
-- chunk first on all four evaluation questions. All-stopword or empty
-- input yields a null tsquery and therefore no rows.
--
-- Each lexeme is single-quoted (with '' escaping) before re-parsing:
-- URL/host tokens from the english parser carry tsquery metacharacters
-- verbatim (a.com:8080, /wiki/foo_(bar), it's) and unquoted they raise
-- 42601 "syntax error in tsquery", silently disabling retrieval for any
-- message that pastes a link.

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

-- Service-role only, same posture as the table (and the 0004/0020 rule:
-- nothing anon-executable without an explicit decision).
revoke execute on function public.match_advisor_guidance(text, int)
  from public, anon, authenticated;
