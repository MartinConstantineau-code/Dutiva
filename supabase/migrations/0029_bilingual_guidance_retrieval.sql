-- Phase 2 bilingual retrieval for the Advisor grounding corpus (see the
-- design writeup in the PR that introduced this migration).
--
-- Today, advisor_guidance_chunks is English prose with inline French terms
-- in parentheses, indexed with the 'english' FTS config (`fts`, generated
-- from title || ' ' || content). A French query only matches by lexical
-- luck: the "salaire minimum" parenthetical happens to contain the same
-- lexemes a French speaker would type, but there is no guarantee for chunks
-- that don't carry an inline French term for the exact thing being asked.
--
-- This migration adds an OPTIONAL, per-row French body (`title_fr` /
-- `content_fr`, both nullable) and a French-config generated tsvector
-- (`fts_fr`) mirroring `fts`. `match_advisor_guidance(q, k)` keeps its exact
-- signature and return shape (advisor-chat/index.ts is untouched), but now
-- builds both an 'english' and a 'french' tsquery from the caller's raw
-- question, matches against EITHER `fts` OR `fts_fr`, and ranks each row by
-- the greater of its English or French score. A row with no French content
-- yet (`content_fr is null`, true today for all existing rows) only ever
-- scores on the English side, so this is a strict backward-compatible
-- superset: ranking for the pre-existing 42 rows cannot change until a
-- French body is added to any of them.
--
-- Authoring `content_fr`: same standard as the English pipeline — authored
-- from a LIVE FRENCH official source (ontario.ca /fr/, cnesst.gouv.qc.ca
-- /fr/, canada.ca /fr/), not machine-translated from the English row. Two
-- rows are backfilled here as a working proof of the mechanism (Ontario and
-- Quebec general minimum wage); the remaining ~40 rows are follow-up work,
-- deliberately not done in this migration (see the PR description).
--
-- ROLLBACK:
--   create or replace function public.match_advisor_guidance(q text, k integer default 4)
--     returns table (title text, content text, source_url text, source_name text,
--       jurisdiction text, effective_note text, topic text, review_status text)
--     language sql stable as $$
--       with lex as (
--         select to_tsquery('english',
--           string_agg(distinct '''' || replace(lexeme, '''', '''''') || '''', ' | ')
--         ) as tq
--         from unnest(tsvector_to_array(to_tsvector('english', q))) as lexeme
--       )
--       select c.title, c.content, c.source_url, c.source_name, c.jurisdiction,
--              c.effective_note, c.topic, c.review_status
--       from public.advisor_guidance_chunks c, lex
--       where c.status = 'active' and lex.tq is not null and c.fts @@ lex.tq
--       order by ts_rank(c.fts, lex.tq) desc
--       limit greatest(1, least(k, 8))
--     $$;
--   drop index if exists advisor_guidance_chunks_fts_fr_idx;
--   alter table public.advisor_guidance_chunks drop column if exists fts_fr;
--   alter table public.advisor_guidance_chunks drop column if exists content_fr;
--   alter table public.advisor_guidance_chunks drop column if exists title_fr;

alter table public.advisor_guidance_chunks
  add column if not exists title_fr text,
  add column if not exists content_fr text;

comment on column public.advisor_guidance_chunks.title_fr is
  'Optional French title, authored from a live French official source — never machine-translated from title. Null until backfilled.';
comment on column public.advisor_guidance_chunks.content_fr is
  'Optional French body, authored from a live French official source — never machine-translated from content. Null until backfilled.';

alter table public.advisor_guidance_chunks
  add column if not exists fts_fr tsvector
  generated always as (
    to_tsvector('french', coalesce(title_fr, '') || ' ' || coalesce(content_fr, ''))
  ) stored;

create index if not exists advisor_guidance_chunks_fts_fr_idx
  on public.advisor_guidance_chunks using gin (fts_fr);

-- Merged-rank retrieval: OR the English and French lexeme matches, order by
-- whichever side scores higher. A row with content_fr is null never
-- contributes a French score (ts_rank/tsvector on an all-null-input
-- generated column is the zero vector, so `fts_fr @@ tq_fr` never matches it
-- — the `c.fts_fr is not null` guard below is belt-and-suspenders clarity,
-- not load-bearing).
create or replace function public.match_advisor_guidance(q text, k integer default 4)
returns table (
  title text,
  content text,
  source_url text,
  source_name text,
  jurisdiction text,
  effective_note text,
  topic text,
  review_status text
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
         c.effective_note, c.topic, c.review_status
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

-- Proof-of-concept backfill (2 of 42 rows). Authored from the live French
-- pages, not translated: ontario.ca/fr salaire-minimum guide page and the
-- CNESST's French-native "Salaire minimum au Québec" page (CNESST's site is
-- French-first; the English row was itself derived from its English mirror).
update public.advisor_guidance_chunks
set
  title_fr = 'Ontario — Taux et dates d''entrée en vigueur du salaire minimum général',
  content_fr = 'En vertu de la Loi de 2000 sur les normes d''emploi (Employment Standards Act, 2000), le salaire minimum général actuel de l''Ontario est de 17,60 $ l''heure, du 1er octobre 2025 au 30 septembre 2026. Le taux passera à 17,95 $ l''heure à compter du 1er octobre 2026 (jusqu''au 30 septembre 2027), une hausse liée à l''indice des prix à la consommation de l''Ontario. Taux spéciaux pour la période du 1er octobre 2025 au 30 septembre 2026 : salaire minimum des étudiants 16,60 $ l''heure, pour les étudiants de moins de 18 ans qui travaillent 28 heures par semaine ou moins pendant l''année scolaire, ou pendant les congés scolaires; salaire minimum des travailleurs à domicile 19,35 $ l''heure; guides de chasse, de pêche et guides d''aventure 88,05 $ par jour pour moins de cinq heures consécutives, et 176,15 $ par jour pour cinq heures ou plus.'
where jurisdiction = 'ON' and topic = 'minimum_wage';

update public.advisor_guidance_chunks
set
  title_fr = 'Québec — Salaire minimum général (salaire minimum) : 16,60 $ l''heure',
  content_fr = 'Le taux général du salaire minimum au Québec est de 16,60 $ l''heure, en vigueur depuis le 1er mai 2026, en vertu de la Loi sur les normes du travail et de son règlement, administrée par la CNESST. Les travailleuses et les travailleurs y ont droit, qu''ils travaillent à temps plein ou à temps partiel. Le travailleur ne peut pas recevoir un salaire plus bas que le taux en vigueur : l''employeur doit lui verser un salaire égal ou supérieur au salaire minimum, même s''il offre des avantages comme une voiture ou un logement. Les personnes payées à la pièce ou à la commission doivent recevoir au moins l''équivalent du taux horaire du salaire minimum pour le temps travaillé. Le taux distinct du salaire minimum au pourboire est de 13,30 $ l''heure, également en vigueur depuis le 1er mai 2026. Lorsque le taux du salaire minimum augmente, l''employeur n''est pas obligé d''ajuster le salaire d''un travailleur déjà supérieur au nouveau taux minimum.'
where jurisdiction = 'QC' and topic = 'minimum_wage';
